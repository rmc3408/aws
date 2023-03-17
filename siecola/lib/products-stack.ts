import { Stack, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { NodejsFunctionProps, NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { LayerVersion, Tracing, LambdaInsightsVersion } from 'aws-cdk-lib/aws-lambda';


class ProductsStack extends Stack {
  public readonly productsfetchHandler: NodejsFunction;
  public readonly productsAdminHandler: NodejsFunction;
  public readonly productsDatabase: Table


  constructor(scope: Construct, id: string, props?: NodejsFunctionProps) {
    super(scope, id, props)

    // Create of Dynamo DB Table
    this.productsDatabase = new Table(this, 'ProductsDB', {
      tableName: "products",
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode:  BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    })

    // Get Layer Value from AWS SSM and connect to Product Layer Stack
    const productsArnValue = StringParameter.valueForStringParameter(this, 'ProductsParameterArn')
    const layerConnectedValueProducts = LayerVersion.fromLayerVersionArn(this, 'ProductsLayer', productsArnValue);

    // Lambda Function for GET products - All or One
    this.productsfetchHandler = new NodejsFunction(this, "ProductsFetchFunctionStack", {
      functionName: 'productsFetchFunction',
      handler: "productsFetchHandler",
      tracing: Tracing.ACTIVE,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_135_0,
      memorySize: 128,
      timeout: Duration.seconds(3),
      entry: "lambda/products/fetch.ts",
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        PRODUCTS_DB: this.productsDatabase.tableName
      },
      layers: [layerConnectedValueProducts] //connect Lambda to Lambda
    })
    this.productsDatabase.grantReadData(this.productsfetchHandler) // Grant access for function return data to database

     // Lambda Function for GET products - All or One
    this.productsAdminHandler = new NodejsFunction(this, "ProductsAdminFunctionStack", {
      functionName: 'productsAdminFunction',
      handler: "productsAdminHandler",
      tracing: Tracing.ACTIVE,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_135_0,
      memorySize: 128,
      timeout: Duration.seconds(3),
      entry: "lambda/products/admin.ts",
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        PRODUCTS_DB: this.productsDatabase.tableName
      },
      layers: [layerConnectedValueProducts] //connect Lambda to Lambda
    })
    this.productsDatabase.grantWriteData(this.productsAdminHandler)
  }
}

export default ProductsStack;
