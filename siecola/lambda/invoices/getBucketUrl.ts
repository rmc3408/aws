import { captureAWS } from 'aws-xray-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

captureAWS(require('aws-sdk'))

export async function getHandler(event: APIGatewayProxyEvent, _ctx: Context): Promise<APIGatewayProxyResult> {

  console.log(event)

  return {
    statusCode: 200,
    body: 'GETTING FROM BUCKET'
  }
}