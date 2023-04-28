import { Stack, StackProps, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { SubscriptionFilter, Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription, LambdaSubscriptionProps, SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { LayerVersion, Tracing, LambdaInsightsVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource, SqsEventSourceProps } from 'aws-cdk-lib/aws-lambda-event-sources';



interface OrderStackProps extends StackProps {
  productsDatabase: Table;
  eventDatabase: Table;
}

class OrderStack extends Stack {
  public readonly ordersfetchHandler: NodejsFunction;
  public readonly eventsFetchHandler: NodejsFunction;
  public readonly eventsHandler: NodejsFunction;
  public readonly billingHandler: NodejsFunction;
  public readonly emailEventsHandler: NodejsFunction;
  public readonly ordersDatabase: Table;
  public readonly orderTopic: Topic;
  public readonly orderQueue: Queue;

  constructor(scope: Construct, id: string, props: OrderStackProps) {
    super(scope, id, props);

    // Import Order Layer access from AWS SSM and connect to Layer to NodeJsFunction
    const orderLayerArnValue = StringParameter.valueForStringParameter(this, 'OrderParameterArn');
    const ordersARNlayer = LayerVersion.fromLayerVersionArn(this, 'OrderLayer-Stack', orderLayerArnValue);

    // Import Product Layer access from AWS SSM and connect to Layer to NodeJsFunction
    const productsArnValue = StringParameter.valueForStringParameter(this, 'ProductsParameterArn');
    const productsARNLayer = LayerVersion.fromLayerVersionArn(this, 'ProductsLayer-Stack', productsArnValue);

    // Import Orders Models Layer access from AWS SSM and connect to Layer to NodeJsFunction
    const orderModelsArnValue = StringParameter.valueForStringParameter(this, 'OrderModelsParameterArn');
    const orderModelsARNLayer = LayerVersion.fromLayerVersionArn(this, 'OrderModelsLambdaLayerArn-Stack', orderModelsArnValue);

    // Import Orders Event Layer access from AWS SSM and connect to Layer to NodeJsFunction
    const orderEventArnValue = StringParameter.valueForStringParameter(this, 'OrderEventParameterArn');
    const orderEventARNLayer = LayerVersion.fromLayerVersionArn(this, 'OrderEventLambdaLayerArn-Stack', orderEventArnValue);

    // Import Orders Event Repository Layer access from AWS SSM and connect to Layer to NodeJsFunction
    const orderEventRepositoryArnValue = StringParameter.valueForStringParameter(this, 'OrderEventRepositoryParameterArn');
    const orderEventRepositoryARNLayer = LayerVersion.fromLayerVersionArn(this, 'OrderEventRepositoryLambdaLayerArn-Stack', orderEventRepositoryArnValue);


    // Create DynamoDB Table
    this.ordersDatabase = new Table(this, 'OrdersDB-Stack', {
      tableName: 'orders',
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });


    // Create Simple Notification Service - SNS
    this.orderTopic = new Topic(this, 'OrderSNS-Stack', {
      displayName: 'Order Topic',
      topicName: 'ordertopic',
    });
    
    // Create Simple Queue Service - SQS
    this.orderQueue = new Queue(this, 'OrderSQS-Stack', {
      queueName: 'orderQueue',
      deadLetterQueue: {
        maxReceiveCount: 2, 
        queue: new Queue(this, 'OrderDLQ-Stack', {
          queueName: 'orderQueueDLQ',
          retentionPeriod: Duration.days(10),
        })
      }
    });


    // Lambda Function for Create, Delete and Fetch data for Orders database
    this.ordersfetchHandler = new NodejsFunction(this, 'OrdersFetchFunction-Stack', {
      functionName: 'ordersFetchFunction',
      handler: 'ordersFetchHandler',
      tracing: Tracing.ACTIVE,
      runtime: Runtime.NODEJS_16_X,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_135_0,
      memorySize: 128,
      timeout: Duration.seconds(2),
      entry: 'lambda/orders/orders.ts',
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        ORDERS_DB: this.ordersDatabase.tableName,
        PRODUCTS_DB: props.productsDatabase.tableName,
        TOPIC_ORDER: this.orderTopic.topicArn,
      },
      layers: [ordersARNlayer, productsARNLayer, orderModelsARNLayer, orderEventARNLayer],
    });

    // Lambda Function for Fetch data for Events database
    this.eventsFetchHandler = new NodejsFunction(this, 'EventsFetchFunction-Stack', {
      functionName: 'eventsFetchFunction',
      handler: 'eventsFetchHandler',
      tracing: Tracing.ACTIVE,
      runtime: Runtime.NODEJS_16_X,
      memorySize: 128,
      timeout: Duration.seconds(2),
      entry: 'lambda/orders/fetch.ts',
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        ORDER_EVENTS_DATABASE: props.eventDatabase.tableName,
      },
      layers: [orderEventRepositoryARNLayer, orderEventARNLayer],
    });

    // Lambda Function to Create new events in Event Database
    this.eventsHandler = new NodejsFunction(this, 'OrdersEventFunction-Stack', {
      functionName: 'orderEventsFunction',
      handler: 'eventsOrderHandler',
      tracing: Tracing.ACTIVE,
      runtime: Runtime.NODEJS_16_X,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_135_0,
      memorySize: 128,
      timeout: Duration.seconds(2),
      entry: 'lambda/orders/events.ts',
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        ORDER_EVENTS_DATABASE: props.eventDatabase.tableName,
      },
      layers: [orderEventARNLayer, orderEventRepositoryARNLayer],
    });

    // Lambda Function to Billing from SNS filtered events in Order events
    this.billingHandler = new NodejsFunction(this, 'BillingFunction-Stack', {
      functionName: 'orderBillingFunction',
      handler: 'eventsBillHandler',
      tracing: Tracing.ACTIVE,
      runtime: Runtime.NODEJS_16_X,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_135_0,
      memorySize: 128,
      bundling: {
        minify: true,
        sourceMap: false,
      },
      timeout: Duration.seconds(2),
      entry: 'lambda/orders/bill.ts',
    });

    // Lambda Function to batch Email from Queue in Order events
    this.emailEventsHandler = new NodejsFunction(this, 'emailEventsFunction-Stack', {
      functionName: 'orderEmailsFunction',
      handler: 'eventsEmailHandler',
      tracing: Tracing.ACTIVE,
      runtime: Runtime.NODEJS_16_X,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_135_0,
      memorySize: 128,
      bundling: {
        minify: true,
        sourceMap: false,
      },
      timeout: Duration.seconds(2),
      entry: 'lambda/orders/emails.ts',
      layers: [orderEventARNLayer]
    });


    // Instead give more permission --> props.eventDatabase.grantWriteData(this.eventsHandler)
    //This method below is more restrict to give a specific operations in the database
    const eventPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['dynamodb:PutItem'],
      resources: [props.eventDatabase.tableArn],
    });
    this.eventsHandler.addToRolePolicy(eventPolicy);
    
    const filterSubscription: LambdaSubscriptionProps = {
      filterPolicy: {
        eventType: SubscriptionFilter.stringFilter({ allowlist: ["ORDER_CREATED"]})
      }
    }

    const mailPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ses:SendEmail',
        'ses:SendRawEmail',
        'ses:SendTemplatedEmail',
      ],
      resources: ["*"],
    });
    this.emailEventsHandler.addToRolePolicy(mailPolicy);

    const eventFetchPolicy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [ 'dynamodb:Query' ],
      resources: [`${props.eventDatabase.tableArn}/index/emailIndex`],
    });
    this.eventsFetchHandler.addToRolePolicy(eventFetchPolicy);

    // Publish (invoking) or Subscription (action) in SNS
    this.orderTopic.grantPublish(this.ordersfetchHandler);

    this.orderTopic.addSubscription(new LambdaSubscription(this.eventsHandler));

    // SNS topic can filter which ORDER will subscription
    this.orderTopic.addSubscription(new LambdaSubscription(this.billingHandler, filterSubscription));
    // From SNS topic subscribe new SQS
    this.orderTopic.addSubscription(new SqsSubscription(this.orderQueue, filterSubscription)); 

    //
    const conditionSQS: SqsEventSourceProps = {
      batchSize: 3,
      enabled: true,
      maxBatchingWindow: Duration.minutes(1),
      reportBatchItemFailures: true,
    }
    // SQS will have configurable events to send to emailHandler lambda function 
    this.emailEventsHandler.addEventSource(new SqsEventSource(this.orderQueue, conditionSQS))
    // Grant lambda function to consume Message from SQS Queue
    this.orderQueue.grantConsumeMessages(this.emailEventsHandler); 
    

    // Grant access from function return data to database
    this.ordersDatabase.grantReadWriteData(this.ordersfetchHandler);
    props.productsDatabase.grantReadData(this.ordersfetchHandler);
       
  }
}

export default OrderStack;
