import { Context, SNSEvent } from 'aws-lambda';
import { captureAWS } from 'aws-xray-sdk';


captureAWS(require('aws-sdk'));

export async function eventsBillHandler(event: SNSEvent, ctx: Context): Promise<void> {
  console.log('FROM SNS to LAMBDA Filtered Billing Event', event);
  event.Records.forEach( record => console.log(record.Sns) )
}
