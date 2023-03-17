import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import ProductsRepository from "/opt/node/productsLayer";
import { DynamoDB } from 'aws-sdk';

const tableNameEnviroment = process.env.PRODUCTS_DB!;
const dynamoDBClient = new DynamoDB.DocumentClient();

const productsRepositoryInstance = new ProductsRepository(dynamoDBClient, tableNameEnviroment);


export async function productsAdminHandler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {

  const { awsRequestId: lambdaExecutionId } = ctx; // function ID of lambda execution
  const { requestId: apiRequestId } = event.requestContext // Request ID executed from APIgateway

  console.log('API request id', apiRequestId, ' and lambda request id', lambdaExecutionId);

  if (event.httpMethod == 'POST' && event.resource == '/products') {
    console.log('Create new Product', event.body)

    const newProduct = JSON.parse(event.body!);
    const result = await productsRepositoryInstance.createProduct(newProduct);

    return {
      statusCode: 201,
      headers: {},
      body: JSON.stringify({ message: "Created new product", data: result }, null, 2),
    }
  }
  if (event.httpMethod == 'PUT' && event.resource == '/products/{id}') {
    const id = event.pathParameters!.id as string
    const changeProduct = JSON.parse(event.body!);

    console.log('Edit a product with id', id, ' and body', event.body )

    const result = await productsRepositoryInstance.updateProduct(id, changeProduct)
    return {
      statusCode: 201,
      headers: {},
      body: JSON.stringify({ message: "Updated product information", data: result }),
    }
  }
  if (event.httpMethod == 'DELETE' && event.resource == '/products/{id}') {
    const id = event.pathParameters!.id as string
    console.log('Delete a product with id', id)

    const result = await productsRepositoryInstance.deleteProduct(id)
    return {
      statusCode: 201,
      headers: {},
      body: JSON.stringify({ message: "delete one product", data: result }),
    }
  }
  return {
    statusCode: 400,
    headers: {},
    body: JSON.stringify({ message: "no products found in this endpoint"}),
  }
}