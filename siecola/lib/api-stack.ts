import { JsonSchemaType, LambdaIntegration, LogGroupLogDestination, MethodLoggingLevel, Model, RequestValidator, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodeJS';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';


interface ApiGatewayIntegrationProps extends StackProps {
  productsFetch: NodejsFunction;
  productsAdmin: NodejsFunction;
  ordersFetch: NodejsFunction;
}

class ApiGatewayStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiGatewayIntegrationProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, 'ApiGatewayLogs');
    const logApiDestiny = new LogGroupLogDestination(logGroup);

    const api = new RestApi(this, 'ApiGatewayRest-Stack', {
      restApiName: 'EcommerceApi',
      cloudWatchRole: true,
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        accessLogDestination: logApiDestiny,
      },
    });

    // Create Resources and Methods for lambda function
    this.createProductService(props, api);
    this.createOrderServices(props, api);
  }


  private createOrderServices(props: Pick<ApiGatewayIntegrationProps, 'ordersFetch'>, api: RestApi) {
    // Importing Lambda Functions to APIGateway
    const orderFecthIntegrated = new LambdaIntegration(props.ordersFetch);

    const ordersResource = api.root.addResource('orders');
    // GET - '/orders'
    // GET - '/orders?email=alex@gmail.com'
    // GET - '/orders?email=alex@gmail.com&orderId=123'
    ordersResource.addMethod('GET', orderFecthIntegrated);
    
    // DELETE - '/orders?email=alex@gmail.com&orderId=123'
    ordersResource.addMethod('DELETE', orderFecthIntegrated, {
      requestValidator: new RequestValidator(this, "body-validator-delete-stack", {
        restApi: api,
        requestValidatorName: "body-validator-delete",
        validateRequestParameters: true,
      }),
      requestParameters: { 
        "method.request.querystring.email": true, 
        "method.request.querystring.orderId": true
      },
    });
    // POST - '/orders'
    const postValidator = new RequestValidator(this, "order-body-validator-post-stack", {
      restApi: api,
      requestValidatorName: "order-body-validator-post",
      validateRequestBody: true,
    })
    const postModel = new Model(this, 'orderModelPost-stack', {
      modelName: 'ordermodelpost',
      restApi: api,
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          email: { type: JsonSchemaType.STRING },
          productIds: { type: JsonSchemaType.ARRAY, minItems: 1 },
          payment: { type: JsonSchemaType.STRING, enum: ["CASH", "DEBIT", "CREDIT" ]},
        },
        required: ["email", "productIds", "payment"]
      },
      
    })
    ordersResource.addMethod('POST', orderFecthIntegrated, {
      requestValidator: postValidator,
      requestModels: { "application/json": postModel },
    });
  }


  private createProductService(props: Pick<ApiGatewayIntegrationProps, 'productsAdmin' | 'productsFetch'>, api: RestApi) {
    // Importing Lambda Functions to APIGateway
    const productsFetchIntegrated = new LambdaIntegration(props.productsFetch);
    const productsAdminIntegrated = new LambdaIntegration(props.productsAdmin);
    
    const productsResource = api.root.addResource('products');

    // GET - '/products'
    productsResource.addMethod('GET', productsFetchIntegrated);
    
    // POST - '/products/'
    const postValidator = new RequestValidator(this, "product-body-validator-post-stack", {
      restApi: api,
      requestValidatorName: "product-body-validator-post",
      validateRequestBody: true,
    })
    const postProductModel = new Model(this, "productModelPost-stack", {
      restApi: api,
      contentType: "application/json",
      modelName: "productmodelpost",
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          productName: { type: JsonSchemaType.STRING },
          productUrl: { type: JsonSchemaType.STRING },
          model: { type: JsonSchemaType.STRING },
          code: { type: JsonSchemaType.STRING, minLength: 3 },
          price: { type: JsonSchemaType.NUMBER },
        },
        required: ["code", "productName"]
      }
    })
    productsResource.addMethod('POST', productsAdminIntegrated, {
      requestValidator: postValidator,
      requestModels: { "application/json": postProductModel },
    });

    const productIdResource = productsResource.addResource('{id}');
    // GET - '/products/{id}'
    productIdResource.addMethod('GET', productsFetchIntegrated);
    // PUT - '/products/{id}'
    productIdResource.addMethod('PUT', productsAdminIntegrated);
    // DELETE - '/products/{id}'
    productIdResource.addMethod('DELETE', productsAdminIntegrated);
  }
}

export default ApiGatewayStack;
