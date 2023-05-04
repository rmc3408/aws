import { captureAWS } from 'aws-xray-sdk';
import { Context, EventBridgeEvent } from 'aws-lambda';

captureAWS(require('aws-sdk'))

export async function missingInvoiceNumHandler(event: EventBridgeEvent<string, string>, _ctx: Context): Promise<void> {

  console.log('-----------------> Invoice without Invoice Number <-----------------------------')
  console.log(event)
}