import { captureAWS } from 'aws-xray-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

captureAWS(require('aws-sdk'))

export async function connectionHandler(_event: APIGatewayProxyEvent, _ctx: Context): Promise<APIGatewayProxyResult> {

  console.log('-----------------> CONNECTED <-----------------------------')

  return {
    statusCode: 200,
    body: 'Connected'
  }
}