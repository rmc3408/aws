import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime, Code, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

class AuthLayersStack extends Stack {
  readonly userInfo: LayerVersion;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Authorization models
    this.userInfo = new LayerVersion(this, 'UserInfoLayer-Stack', {
      code: Code.fromAsset('lambda/auth/layers/authLayer'),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      layerVersionName: 'UserInfoLayer',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new StringParameter(this, 'UserInfoVersionArn-Stack', {
      parameterName: 'userParameterArn',
      stringValue: this.userInfo.layerVersionArn,
    })
  }
}

export default AuthLayersStack;
