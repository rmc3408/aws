import { LambdaIntegration, LogGroupLogDestination, MethodLoggingLevel, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodeJS';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

interface ApiGatewayIntegrationProps extends StackProps {
  productsFetch: NodejsFunction;
}

class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiGatewayIntegrationProps) {
    super(scope, id, props);
    console.log('API gateway stack class created');

    const logGroup = new LogGroup(this, 'ApiGatewayLogs');
    const logApiDestiny = new LogGroupLogDestination(logGroup);

    const api = new RestApi(this, 'ApiGatewayRestStack', {
      restApiName: 'EcommerceApi',
      cloudWatchRole: true,
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        accessLogDestination: logApiDestiny,
      },
    });

    const productsFetchIntegrated = new LambdaIntegration(props.productsFetch);
    const productsFetchWithApi = api.root.addResource('products').addMethod('GET', productsFetchIntegrated);
  }
}

export default ApiGatewayStack;
