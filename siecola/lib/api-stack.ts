import { LambdaIntegration, LogGroupLogDestination, MethodLoggingLevel, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodeJS';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

interface ApiGatewayIntegrationProps extends StackProps {
  productsFetch: NodejsFunction;
  productsAdmin: NodejsFunction;
}

class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiGatewayIntegrationProps) {
    super(scope, id, props);

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
    const productsAdminIntegrated = new LambdaIntegration(props.productsAdmin);
    const productsResource = api.root.addResource('products');

    // GET - '/products'
    productsResource.addMethod('GET', productsFetchIntegrated);
    // POST - '/products/'
    productsResource.addMethod('POST', productsAdminIntegrated);

    const productIdResource = productsResource.addResource('{id}');
    // // GET - '/products/{id}'
    productIdResource.addMethod('GET', productsFetchIntegrated);
    // PUT - '/products/{id}'
    productIdResource.addMethod('PUT', productsAdminIntegrated);
    // DELETE - '/products/{id}'
    productIdResource.addMethod('DELETE', productsAdminIntegrated);
  }
}

export default ApiGatewayStack;
