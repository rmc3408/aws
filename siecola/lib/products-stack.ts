import { Stack, StackProps, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { LayerVersion, Tracing, LambdaInsightsVersion, Runtime } from 'aws-cdk-lib/aws-lambda';


interface ProductEventIntegrationProps extends StackProps {
  eventDatabase: Table;
}

class ProductsStack extends Stack {
  public readonly productsfetchHandler: NodejsFunction;
  public readonly productsAdminHandler: NodejsFunction;
  private readonly productsEventHandler: NodejsFunction;
  public readonly productsDatabase: Table

  constructor(scope: Construct, id: string, props: ProductEventIntegrationProps) {
    super(scope, id, props)

    // Create of Dynamo DB Table
    this.productsDatabase = new Table(this, 'ProductsDB-Stack', {
      tableName: "products",
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode:  BillingMode.PAY_PER_REQUEST,
    })


    // Get Layer Value from AWS SSM and connect to Product Layer Stack
    const productsArnValue = StringParameter.valueForStringParameter(this, 'ProductsParameterArn')
    const layerConnectedValueProducts = LayerVersion.fromLayerVersionArn(this, 'ProductsLayer-Stack', productsArnValue);

    // Get Layer Value from AWS SSM and connect to Product Layer Stack
    const productsEventArnValue = StringParameter.valueForStringParameter(this, 'ProductEventsParameterArn')
    const layerConnectedValueProductEvents = LayerVersion.fromLayerVersionArn(this, 'ProductEventsLayer-Stack', productsEventArnValue);


    // Lambda Function for Events Products
    this.productsEventHandler = new NodejsFunction(this, "ProductsEventFunction-Stack", {
      functionName: 'productsEventFunction',
      runtime: Runtime.NODEJS_16_X,
      entry: "lambda/products/event.ts",
      handler: "productsEventHandler",
      tracing: Tracing.ACTIVE,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_135_0,
      memorySize: 128,
      timeout: Duration.seconds(2),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        EVENT_DB: props.eventDatabase.tableName,
      },
      layers: [layerConnectedValueProductEvents]
    })

    // Lambda Function for GET products - All or One
    this.productsfetchHandler = new NodejsFunction(this, "ProductsFetchFunction-Stack", {
      functionName: 'productsFetchFunction',
      handler: "productsFetchHandler",
      tracing: Tracing.ACTIVE,
      runtime: Runtime.NODEJS_16_X,
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

    // Lambda Function for CREATE, UPDATE and DELETE products - All or One
    this.productsAdminHandler = new NodejsFunction(this, "ProductsAdminFunction-Stack", {
      functionName: 'productsAdminFunction',
      handler: "productsAdminHandler",
      runtime: Runtime.NODEJS_16_X,
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
        PRODUCTS_DB: this.productsDatabase.tableName,
        PRODUCT_EVENT_FUNCTION: this.productsEventHandler.functionName
      },
      layers: [layerConnectedValueProducts, layerConnectedValueProductEvents] //connect Lambda to Lambda
    })
    // Grant access for function return data to database
    this.productsDatabase.grantWriteData(this.productsAdminHandler)
    props.eventDatabase.grantWriteData(this.productsAdminHandler)
    this.productsEventHandler.grantInvoke(this.productsAdminHandler)
    
    this.productsDatabase.grantReadData(this.productsfetchHandler) 
    
    props.eventDatabase.grantWriteData(this.productsEventHandler)
    
  }
}

export default ProductsStack;
