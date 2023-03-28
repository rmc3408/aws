import { Callback, Context } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { EventProductTableType, ProductEvent } from "/opt/node/productEventsLayer";
import { captureAWS } from 'aws-xray-sdk'
captureAWS(require('aws-sdk'));

const eventDB_ENV = process.env.EVENT_DB!
const dynamoDBClient = new DynamoDB.DocumentClient();

export async function productsEventHandler(event: ProductEvent, context: Context, callback: Callback): Promise<void> {

  console.log(event, context.awsRequestId);
  const data = await createEvent(event)

  callback(null, JSON.stringify({ productCreated: true, data: data, message: 'OK' }))

}

async function createEvent(event: ProductEvent) {

  const timestamp = Date.now()
  const ttl = ~~(timestamp / 1000) + (5 * 60) // add 5 minutes in advanced

  const newItem: EventProductTableType = {
    pk: `#product_${event.productCode}`,
    sk: `${event.eventType}#${timestamp}`,
    email: event.email,
    requestId: event.requestId,
    eventType: event.eventType,
    info: { productId: event.productId, productPrice: event.productPrice },
    ttl: ttl,
    createdAt: timestamp
  }
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName: eventDB_ENV,
    Item: newItem
  }

  const result = await dynamoDBClient.put(params).promise()
  return result
}