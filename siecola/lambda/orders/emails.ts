import { Context, SQSEvent } from 'aws-lambda';
import { captureAWS } from 'aws-xray-sdk';


captureAWS(require('aws-sdk'));

export async function eventsEmailHandler(event: SQSEvent, ctx: Context): Promise<void> {
  console.log('FROM SNS -> SQS (batch) -> LAMBDA ');
  event.Records.forEach( record => console.log( JSON.parse(record.body) ) )
}
