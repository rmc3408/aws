import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime, Code, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export default class ProductsLayersStack extends Stack {
  readonly productsLayers: LayerVersion;
  readonly productEventsLayers: LayerVersion;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.productsLayers = new LayerVersion(this, 'ProductsLayer-Stack', {
      code: Code.fromAsset('lambda/products/layers/productsLayer'),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      layerVersionName: 'ProductsLayer',
      removalPolicy: RemovalPolicy.DESTROY
    });
    new StringParameter(this, 'ProductsLayerVersionArn-Stack', {
      parameterName: 'ProductsParameterArn',
      stringValue: this.productsLayers.layerVersionArn,
    });

    this.productEventsLayers = new LayerVersion(this, 'ProductEventLayer-Stack', {
      code: Code.fromAsset('lambda/products/layers/productEventLayer'),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      layerVersionName: 'ProductEventsLayer',
      removalPolicy: RemovalPolicy.DESTROY
    });
    new StringParameter(this, 'ProductEventsLayerVersionArn-Stack', {
      parameterName: 'ProductEventsParameterArn',
      stringValue: this.productEventsLayers.layerVersionArn,
    });
  }
}
