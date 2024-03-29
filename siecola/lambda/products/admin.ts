import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import ProductsRepository, { Product } from '/opt/node/productsLayer';
import { CognitoIdentityServiceProvider, DynamoDB, Lambda } from 'aws-sdk';
import { captureAWS } from 'aws-xray-sdk';
import { ProductEvent, ProductEventTypeEnum } from '/opt/node/productEventsLayer';
import AuthInfoService from '/opt/node/userInfoLayer';

captureAWS(require('aws-sdk'));

// Client for Dynamo
const tableNameEnviroment = process.env.PRODUCTS_DB!;
const dynamoDBClient = new DynamoDB.DocumentClient();
const productsRepositoryInstance = new ProductsRepository(dynamoDBClient, tableNameEnviroment);

// Client for Lambda
const lambdafunctionNameENV = process.env.PRODUCT_EVENT_FUNCTION!;
const lambdaClient = new Lambda({});

// Authorization service
const authServiceProvider = new CognitoIdentityServiceProvider()
const userInfo = new AuthInfoService(authServiceProvider)

export async function productsAdminHandler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {
  const { awsRequestId: lambdaExecutionId } = ctx; // function ID of lambda execution
  const { requestId: apiRequestId } = event.requestContext; // Request ID executed from APIgateway

  const userEmail = await userInfo.getUserInfo(event.requestContext.authorizer)

  
  // POST Method
  if (event.httpMethod == 'POST' && event.resource == '/products') {
    console.log('Event body for new Product', event.body);

    const newProduct = JSON.parse(event.body!);
    const result = await productsRepositoryInstance.createProduct(newProduct);
    console.log({ message: 'Created new product', data: result }, null, 2)
    
    const response = await sendProductEvent(result, ProductEventTypeEnum.CREATED, lambdaExecutionId, userEmail)
    console.log('RESPONSE', response)
    return {
      statusCode: 201,
      headers: {},
      body: JSON.stringify({ message: `Response from created new product for user ${userEmail}`, data: result }, null, 2),
    };
  }

  // PUT Method
  if (event.httpMethod == 'PUT' && event.resource == '/products/{id}') {
    const id = event.pathParameters!.id as string;
    const changeProduct = JSON.parse(event.body!)
    const result = await productsRepositoryInstance.updateProduct(id, changeProduct)
    console.log('Edit a product with id', id, ' and body', event.body);

    const response = await sendProductEvent(result as Product, ProductEventTypeEnum.UPDATED, lambdaExecutionId, userEmail)
    console.log('RESPONSE', response)
    return {
      statusCode: 201,
      headers: {},
      body: JSON.stringify({ message: 'Response from Updated product information', data: result }),
    };
  }

  // DELETE Method
  if (event.httpMethod == 'DELETE' && event.resource == '/products/{id}') {
    const id = event.pathParameters!.id as string;
    console.log('Delete a product with id', id);

    const result = await productsRepositoryInstance.deleteProduct(id)

    await sendProductEvent(result as Product, ProductEventTypeEnum.DELETED, lambdaExecutionId, userEmail)
    return {
      statusCode: 201,
      headers: {},
      body: JSON.stringify({ message: 'delete one product', data: result }),
    };
  }
  return {
    statusCode: 400,
    headers: {},
    body: JSON.stringify({ message: 'no products found in this endpoint' }),
  };
}

function sendProductEvent(product: Product, type: ProductEventTypeEnum, reqId: string, email: string = 'a@a.com') {
  const event: ProductEvent = {
    requestId: reqId,
    eventType: type,
    productId: product.id,
    productCode: product.code,
    productPrice: product.price,
    email: email,
  };

  return lambdaClient.invoke({
    FunctionName: lambdafunctionNameENV,
    Payload: JSON.stringify(event),
    InvocationType: "Event" // for Syncronous response  use "RequestResponse",
  }).promise()
}
