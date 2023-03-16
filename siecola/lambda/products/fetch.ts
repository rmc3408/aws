import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export async function productsFetchHandler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {

  const { awsRequestId: lambdaExecutionId } = ctx; // function ID of lambda execution
  const { requestId: apiRequestId } = event.requestContext // Request ID executed from APIgateway

  console.log('API request id', apiRequestId, ' and lambda request id', lambdaExecutionId);

  if (event.httpMethod == 'GET' && event.resource == '/products' && event.pathParameters == null) {
    console.log('GET All Products', JSON.stringify(event, null, 2))
    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ message: "hello products" }),
    }
  }
  if (event.httpMethod == 'GET' && event.resource == '/products/{id}' && event.pathParameters != null) {
    console.log(event.pathParameters, event.resource)
    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ message: `GET ${event.pathParameters.id} product`}),
    }
  }
  return {
    statusCode: 400,
    headers: {},
    body: JSON.stringify({ message: "no products found in this endpoint"}),
  }
}