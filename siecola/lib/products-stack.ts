import { Stack, Duration } from 'aws-cdk-lib';
import { NodejsFunctionProps, NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

class ProductsStack extends Stack {
  public readonly productsfetchHandler: NodejsFunction;

  constructor(scope: Construct, id: string, props?: NodejsFunctionProps) {
    super(scope, id, props)
    console.log('products stack class created');

    this.productsfetchHandler = new NodejsFunction(this, "ProductsFetchFunctionStack", {
      functionName: 'productsFetchFunction',
      handler: "productsFetchHandler",
      memorySize: 128,
      timeout: Duration.seconds(3),
      entry: "lambda/products/fetch.ts",
      bundling: {
        minify: true,
        sourceMap: false,
      }
    })   
  }
}

export default ProductsStack;
