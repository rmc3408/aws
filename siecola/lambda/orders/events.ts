import { Context, SNSEvent, SNSMessage } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { captureAWS } from 'aws-xray-sdk';
import { Envelope, OrderEventDatabase } from '/opt/node/orderEventLayer';
import OrderEventRepository from '/opt/node/orderEventRepositoryLayer';


captureAWS(require('aws-sdk'));

const eventsTableNameEnviroment = process.env.ORDER_EVENTS_DATABASE!;
const dynamoDBClient = new DynamoDB.DocumentClient();
const orderEventRepoInstance = new OrderEventRepository(dynamoDBClient, eventsTableNameEnviroment);

export async function eventsOrderHandler(event: SNSEvent, ctx: Context): Promise<void> {
  console.log('FROM SNS Event', event);

  const listPromises: Promise<OrderEventDatabase>[] = []
  event.Records.forEach( record => listPromises.push( buildEvent(record.Sns)) )
  const allEvent = await Promise.all(listPromises)
  console.log('Total of events', allEvent.length);
}

async function buildEvent(body: SNSMessage): Promise<OrderEventDatabase> {
  console.log('LAMBDA - FROM SNS TO LAMBDA -> MESSAGE ID', body.MessageId)
  const envelopeSNS: Envelope = JSON.parse(body.Message)
  const { data } = envelopeSNS

  const timestamp = Date.now()
  const ttl = ~~(timestamp/1000) + 5 * 60;

  const preEvent: OrderEventDatabase = {
    pk: `#order_${data.orderId}`,
    sk: `${envelopeSNS.eventType}#${timestamp}`,
    ttl,
    email: data.email,
    createdAt: timestamp,
    requestId: data.requestId,
    eventType: envelopeSNS.eventType,
    info: {
      orderId: data.orderId,
      productCodes: data.productCode,
      messageId: body.MessageId
    }
  }

  return await orderEventRepoInstance.createEvent(preEvent) as OrderEventDatabase
}