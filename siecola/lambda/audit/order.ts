import { captureAWS } from 'aws-xray-sdk';
import { Context, EventBridgeEvent } from 'aws-lambda';

captureAWS(require('aws-sdk'))

export async function missingProductIdHandler(event: EventBridgeEvent<string, string>, _ctx: Context): Promise<void> {

  console.log('-----------------> Order missing Product Id <-----------------------------')
  console.log(event)
}