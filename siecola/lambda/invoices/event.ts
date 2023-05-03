import { captureAWS } from 'aws-xray-sdk'
import { Context, DynamoDBRecord, DynamoDBStreamEvent } from 'aws-lambda'
import { ApiGatewayManagementApi, DynamoDB } from 'aws-sdk'
import InvoiceWebSocket from '/opt/node/transactionWebScoketLayer'
import { AttributeValue, PutItemOutput } from 'aws-sdk/clients/dynamodb'

captureAWS(require('aws-sdk'))


const EVENT_DB_NAME = process.env.EVENT_DB_NAME!
const databaseClient = new DynamoDB.DocumentClient()

const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT!.substring(6)
const webSocketClient = new ApiGatewayManagementApi({ endpoint: WEBSOCKET_ENDPOINT })
const webSocketServices = new InvoiceWebSocket(webSocketClient)


export async function eventHandler(event: DynamoDBStreamEvent, _ctx: Context): Promise<void> {
  
  // Events coming from SQS and dynamoStreamRecord
  let listRecord: Array<Promise<PutItemOutput>> = []
  event.Records.forEach((record: DynamoDBRecord ) => {
    if (record.eventName === 'INSERT' && record.dynamodb!.NewImage!.pk.S?.startsWith('#invoice')) {
      listRecord.push(createEvent(record, 'INVOICE_CREATED'))
    }
  })
  await Promise.all(listRecord)
  console.log(await Promise.all(listRecord))
}

async function createEvent(record: DynamoDBRecord, eventType: string): Promise<PutItemOutput> {
  const { pk, sk, transactionId, productId, quantity }: { [Key: string]: AttributeValue } = record.dynamodb!.NewImage!
  const timeStamp: number = Date.now()
  const ttl = ~~(timeStamp / 1000 + (5 * 60))

  //await webSocketServices.sendInvoiceStatus()
  return databaseClient.put({
    TableName: EVENT_DB_NAME,
    Item: {
      pk: `#invoice_${sk.S}`,
      sk: `${eventType}#${timeStamp}`,
      email: pk.S!.split('_')[1],
      createdAt: timeStamp,
      eventType: eventType,
      info: {
        transaction: transactionId.S,
        productId: productId.S,
        quantity: quantity.N
      },
      ttl: ttl
    }
  }).promise() as Promise<PutItemOutput>
}
