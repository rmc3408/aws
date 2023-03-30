import { Stack, StackProps, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { LayerVersion, Tracing, LambdaInsightsVersion, Runtime } from 'aws-cdk-lib/aws-lambda';

interface OrderStackProps extends StackProps {
  productsDatabase: Table
}

class OrderStack extends Stack {
  public readonly ordersfetchHandler: NodejsFunction;
  public readonly ordersDatabase: Table

  constructor(scope: Construct, id: string, props: OrderStackProps) {
    super(scope, id, props)
    
    // Import Order Layer access from AWS SSM and connect to Layer to NodeJsFunction
    const orderLayerArnValue = StringParameter.valueForStringParameter(this, 'OrderParameterArn')
    const ordersARNlayer = LayerVersion.fromLayerVersionArn(this, 'OrderLayer-Stack', orderLayerArnValue)

    // Import Product Layer access from AWS SSM and connect to Layer to NodeJsFunction
    const productsArnValue = StringParameter.valueForStringParameter(this, 'ProductsParameterArn')
    const productsARNLayer = LayerVersion.fromLayerVersionArn(this, 'ProductsLayer-Stack', productsArnValue);

    // Import Orders Models Layer access from AWS SSM and connect to Layer to NodeJsFunction
    const orderModelsArnValue = StringParameter.valueForStringParameter(this, 'OrderModelsParameterArn')
    const orderModelsARNLayer = LayerVersion.fromLayerVersionArn(this, 'OrderModelsLambdaLayerArn-Stack', orderModelsArnValue);


    // Create DynamoDB Table
    this.ordersDatabase = new Table(this, 'OrdersDB-Stack', {
      tableName: "orders",
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      billingMode:  BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    })


    // Lambda Function for GET methods for Orders - All
    this.ordersfetchHandler = new NodejsFunction(this, "OrdersFetchFunction-Stack", {
      functionName: 'ordersFetchFunction',
      handler: "ordersFetchHandler",
      tracing: Tracing.ACTIVE,
      runtime: Runtime.NODEJS_16_X,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_135_0,
      memorySize: 128,
      timeout: Duration.seconds(2),
      entry: "lambda/orders/fetch.ts",
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        ORDERS_DB: this.ordersDatabase.tableName,
        PRODUCTS_DB: props.productsDatabase.tableName
      },
      layers: [ordersARNlayer, productsARNLayer, orderModelsARNLayer]
    })

    // Grant READ access from function return data to database
    this.ordersDatabase.grantReadWriteData(this.ordersfetchHandler)
    props.productsDatabase.grantReadData(this.ordersfetchHandler)
  }
}

export default OrderStack;
