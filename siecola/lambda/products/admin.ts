import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export async function productsAdminHandler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {

  const { awsRequestId: lambdaExecutionId } = ctx; // function ID of lambda execution
  const { requestId: apiRequestId } = event.requestContext // Request ID executed from APIgateway

  console.log('API request id', apiRequestId, ' and lambda request id', lambdaExecutionId);

  if (event.httpMethod == 'POST' && event.resource == '/products') {
    console.log('Create new Product')
    return {
      statusCode: 201,
      headers: {},
      body: JSON.stringify({ message: "Create new product" }),
    }
  }
  if (event.httpMethod == 'PUT' && event.resource == '/products/{id}') {
    console.log('Edit a product with id', event.pathParameters!.id)
    return {
      statusCode: 201,
      headers: {},
      body: JSON.stringify({ message: "Edit a product"}),
    }
  }
  if (event.httpMethod == 'DELETE' && event.resource == '/products/{id}') {
    console.log('Delete a product with id', event.pathParameters!.id)
    return {
      statusCode: 201,
      headers: {},
      body: JSON.stringify({ message: "delete one product"}),
    }
  }
  return {
    statusCode: 400,
    headers: {},
    body: JSON.stringify({ message: "no products found in this endpoint"}),
  }
}