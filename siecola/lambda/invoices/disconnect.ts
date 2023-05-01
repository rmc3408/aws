import { captureAWS } from 'aws-xray-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

captureAWS(require('aws-sdk'))

export async function disconnectionHandler(_event: APIGatewayProxyEvent, _ctx: Context): Promise<APIGatewayProxyResult> {

  console.log('-----------------> DISCONNECTED <-----------------------------')

  return {
    statusCode: 200,
    body: 'disconnected'
  }
}

