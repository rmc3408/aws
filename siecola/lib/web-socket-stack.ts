import { Stack, StackProps, RemovalPolicy, Duration } from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam'

import { Bucket, EventType } from 'aws-cdk-lib/aws-s3'
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications'

import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LayerVersion, Tracing, Runtime } from 'aws-cdk-lib/aws-lambda'

import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb'

import { WebSocketApi, WebSocketStage } from '@aws-cdk/aws-apigatewayv2-alpha'
import { WebSocketLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'


export default class WebSocketApiStack extends Stack {
  private readonly transationDatabase: Table
  private readonly bucket: Bucket
  private readonly webSocketApi: WebSocketApi
  public readonly connectHandler: NodejsFunction
  public readonly disconnectHandler: NodejsFunction
  private readonly getBucketURL: NodejsFunction
  private readonly putBucket: NodejsFunction
  private readonly cancelBucket: NodejsFunction

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // Create dynamo DB table for invoice transation
    this.transationDatabase = new Table(this, 'TransactionsInvoiceDB-Stack', {
      tableName: 'invoices',
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      timeToLiveAttribute: 'ttl',
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PROVISIONED,
      writeCapacity: 1,
      readCapacity: 1,
    })
    const transactionDBPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:PutItem'],
      resources: [this.transationDatabase.tableArn],
      conditions: {
        ['ForAllValues:StringLike']: { 'dynamodb:LeadingKeys': ['#transaction'] }
      }
    })


    // Create S3 bucket
    this.bucket = new Bucket(this, 'Bucket-Stack', {
      bucketName: 'Invoice-transaction-websocket-bucket',
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          enabled: true,
          expiration: Duration.days(2),
        },
      ],
    })
    const bucketPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['S3:PutObject'],
      resources: [ this.bucket.bucketArn + '/*'], // folder and subFolders
    })


    // Websocket Disconnect and Connect Websocket via Lamdba Function
    this.connectHandler = new NodejsFunction(this, 'Connection-Websocket-Stack', {
      functionName: 'connectionWBFunction',
      runtime: Runtime.NODEJS_16_X,
      entry: 'lambda/invoices/connect.ts',
      handler: 'connectionHandler',
      timeout: Duration.seconds(2),
      tracing: Tracing.ACTIVE,
      bundling: {
        minify: true,
        sourceMap: false,
      },
    })

    this.disconnectHandler = new NodejsFunction(this, 'Disconnection-Websocket-Stack', {
      functionName: 'disconnectionWBFunction',
      runtime: Runtime.NODEJS_16_X,
      entry: 'lambda/invoices/disconnect.ts',
      handler: 'disconnectionHandler',
      timeout: Duration.seconds(2),
      tracing: Tracing.ACTIVE,
      bundling: {
        minify: true,
        sourceMap: false,
      },
    })


    // Create Websocket Server 
    this.webSocketApi = new WebSocketApi(this, 'WebSocketApi-Stack', {
      apiName: 'Websocket',
      connectRouteOptions: { 
        integration: new WebSocketLambdaIntegration('ConnectIntegration', this.connectHandler) 
      },
      disconnectRouteOptions: { 
        integration: new WebSocketLambdaIntegration('DisconnectIntegration', this.disconnectHandler) 
      },
    })
    
    const stageWSCreated = new WebSocketStage(this, 'WebSocketStage', { webSocketApi: this.webSocketApi, stageName: 'dev', autoDeploy: true });
    
    const connectionsArns = this.formatArn({
      service: 'execute-api',
      resourceName: `${stageWSCreated.stageName}/POST/*`,
      resource: this.webSocketApi.apiId,
    })
    const webSocketPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['execute-api:ManageConnections'],
      resources: [ connectionsArns ]
    })


    // Lambda functions - GetURL from Bucket handler
    this.getBucketURL = new NodejsFunction(this, 'get-BucketURL-Websocket-Stack', {
      functionName: 'getBucketURLFunction',
      runtime: Runtime.NODEJS_16_X,
      entry: 'lambda/invoices/getBucketUrl.ts',
      handler: 'getHandler',
      timeout: Duration.seconds(2),
      tracing: Tracing.ACTIVE,
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        TRANSACTION_DB_NAME: this.transationDatabase.tableName,
        BUCKET_NAME: this.bucket.bucketName,
        WEBSOCKET_ENDPOINT: this.webSocketApi.apiEndpoint + '/dev'
      }
    })
    //give permission lambda policy to GetItem from DB
    this.getBucketURL.addToRolePolicy(transactionDBPolicy)
    //give permission lambda policy to PutObject inside S3
    this.getBucketURL.addToRolePolicy(bucketPolicy)
    // give permission to lambda acess Database
    this.getBucketURL.addToRolePolicy(webSocketPolicy) //FIXME


    // Lambda functions - PUT (create and update) handler
    this.putBucket = new NodejsFunction(this, 'put-Bucket-Websocket-Stack', {
      functionName: 'putBucketFunction',
      runtime: Runtime.NODEJS_16_X,
      entry: 'lambda/invoices/putBucket.ts',
      handler: 'putHandler',
      timeout: Duration.seconds(2),
      tracing: Tracing.ACTIVE,
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        TRANSACTION_DB_NAME: this.transationDatabase.tableName,
        WEBSOCKET_ENDPOINT: this.webSocketApi.apiEndpoint + '/dev'
      }
    })
    //give permission to lambda function write/read on database
    this.transationDatabase.grantReadWriteData(this.putBucket)

    //give permission to trigger lambda function from event happened in the bucket
    const lambdaDestiny = new LambdaDestination(this.putBucket)
    this.bucket.addEventNotification(EventType.OBJECT_CREATED_PUT, lambdaDestiny)
    
    //give permission to lambda function delete or get info from Bucket
    const getDeleteBucketPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:GetObject', 's3:DeleteObject'],
      resources: [ this.bucket.bucketArn + '/*' ], // folder and subFolders
    })
    this.putBucket.addToRolePolicy(getDeleteBucketPolicy)
    this.webSocketApi.grantManageConnections(this.putBucket)


    // Lambda functions - cancel import handler
    this.cancelBucket = new NodejsFunction(this, 'cancel-Bucket-Websocket-Stack', {
      functionName: 'cancelBucketFunction',
      runtime: Runtime.NODEJS_16_X,
      entry: 'lambda/invoices/cancelBucket.ts',
      handler: 'cancelHandler',
      timeout: Duration.seconds(2),
      tracing: Tracing.ACTIVE,
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        TRANSACTION_DB_NAME: this.transationDatabase.tableName,
        WEBSOCKET_ENDPOINT: this.webSocketApi.apiEndpoint + '/dev'
      }
    })
    const cancelDBPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
      resources: [this.transationDatabase.tableArn],
      conditions: {
        ['ForAllValues:StringLike']: { 'dynamodb:LeadingKeys': ['#transaction'] }
      }
    })
    //give permission to lambda function for database
    this.cancelBucket.addToRolePolicy(cancelDBPolicy)
    this.webSocketApi.grantManageConnections(this.cancelBucket)


    // Websocket API routers
    this.webSocketApi.addRoute('getURL', {
      integration: new WebSocketLambdaIntegration('GetURLHandler', this.getBucketURL),
    });

    this.webSocketApi.addRoute('cancelURL', {
      integration: new WebSocketLambdaIntegration('CancelHandler', this.cancelBucket),
    });
  }
}
