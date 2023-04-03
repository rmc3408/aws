import { Context, SQSEvent } from 'aws-lambda';
import { captureAWS } from 'aws-xray-sdk';


captureAWS(require('aws-sdk'));

export async function eventsEmailHandler(event: SQSEvent, ctx: Context): Promise<void> {
  console.log('FROM SQS to LAMBDA - to batch event in email');
  event.Records.forEach( record => console.log( JSON.parse(record.body) ) )
}
