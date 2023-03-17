import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import ProductsRepository from "/opt/node/productsLayer";
import { DynamoDB } from 'aws-sdk';

const tableNameEnviroment = process.env.PRODUCTS_DB!;
const dynamoDBClient = new DynamoDB.DocumentClient();

const productsRepositoryInstance = new ProductsRepository(dynamoDBClient, tableNameEnviroment);


export async function productsFetchHandler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {

  const { awsRequestId: lambdaExecutionId } = ctx; // function ID of lambda execution
  const { requestId: apiRequestId } = event.requestContext // Request ID executed from APIgateway
  console.log('API request id', apiRequestId, ' and lambda request id', lambdaExecutionId);


  if (event.httpMethod == 'GET' && event.resource == '/products' && event.pathParameters == null) {
    console.log('GET All Products', JSON.stringify(event, null, 2))

    const result = await productsRepositoryInstance.getAllProducts()
    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ message: `GET all products`, data: result }),
    }
  }


  if (event.httpMethod == 'GET' && event.resource == '/products/{id}' && event.pathParameters!.id != undefined) {
    const id = event.pathParameters!.id
    const result = await productsRepositoryInstance.getOneProduct(id)
    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ message: `GET ${id} product`, data: result }),
    }
  }

  
  return {
    statusCode: 400,
    headers: {},
    body: JSON.stringify({ message: "no products found in this endpoint"}),
  }
}