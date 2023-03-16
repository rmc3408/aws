import { Stack, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { NodejsFunctionProps, NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { LayerVersion } from 'aws-cdk-lib/aws-lambda';

class ProductsStack extends Stack {
  public readonly productsfetchHandler: NodejsFunction;
  public readonly productsAdminHandler: NodejsFunction;
  public readonly productsDatabase: Table


  constructor(scope: Construct, id: string, props?: NodejsFunctionProps) {
    super(scope, id, props)

    this.productsDatabase = new Table(this, 'ProductsDB', {
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode:  BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    })
    const productsArnValue = StringParameter.valueForStringParameter(this, 'ProductsParameterArn')
    const layerConnectedValueProducts = LayerVersion.fromLayerVersionArn(this, 'ProductsLayer', productsArnValue);

    this.productsfetchHandler = new NodejsFunction(this, "ProductsFetchFunctionStack", {
      functionName: 'productsFetchFunction',
      handler: "productsFetchHandler",
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
      layers: [layerConnectedValueProducts]
    })
    
    this.productsDatabase.grantReadData(this.productsfetchHandler)

    this.productsAdminHandler = new NodejsFunction(this, "ProductsAdminFunctionStack", {
      functionName: 'productsAdminFunction',
      handler: "productsAdminHandler",
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
      layers: [layerConnectedValueProducts]
    })
    
    this.productsDatabase.grantWriteData(this.productsAdminHandler)
  }
}

export default ProductsStack;
