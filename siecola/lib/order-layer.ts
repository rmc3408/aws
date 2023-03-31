import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime, Code, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

class OrderLayersStack extends Stack {
  readonly orderLayer: LayerVersion;
  readonly orderModelsLayer: LayerVersion;
  readonly orderEventLayer: LayerVersion;
  readonly orderEventRepositoryLayer: LayerVersion;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Order Repository
    this.orderLayer = new LayerVersion(this, 'OrderLayer-Stack', {
      code: Code.fromAsset('lambda/orders/layers/orderLayer'),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      layerVersionName: 'OrderLayer',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new StringParameter(this, 'OrderLayerVersionArn-Stack', {
      parameterName: 'OrderParameterArn',
      stringValue: this.orderLayer.layerVersionArn,
    });


    // Order Models
    this.orderModelsLayer = new LayerVersion(this, 'OrderModelsLayer-Stack', {
      code: Code.fromAsset('lambda/orders/layers/orderLayer'),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      layerVersionName: 'OrderModelsLayer',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new StringParameter(this, 'OrderModelsLambdaLayerArn-Stack', {
      parameterName: 'OrderModelsParameterArn',
      stringValue: this.orderModelsLayer.layerVersionArn,
    });

    
    // Order Event Models
    this.orderEventLayer = new LayerVersion(this, 'OrderEventLayer-Stack', {
      code: Code.fromAsset('lambda/orders/layers/orderLayer'),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      layerVersionName: 'OrderEventLayer',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new StringParameter(this, 'OrderEventLambdaLayerArn-Stack', {
      parameterName: 'OrderEventParameterArn',
      stringValue: this.orderEventLayer.layerVersionArn,
    });


    // Order Event Repository
    this.orderEventRepositoryLayer = new LayerVersion(this, 'OrderEventRepositoryLayer-Stack', {
      code: Code.fromAsset('lambda/orders/layers/orderLayer'),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      layerVersionName: 'OrderEventRepositoryLayer',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new StringParameter(this, 'OrderEventRepositoryLambdaLayerArn-Stack', {
      parameterName: 'OrderEventRepositoryParameterArn',
      stringValue: this.orderEventRepositoryLayer.layerVersionArn,
    });
  }
}

export default OrderLayersStack;
