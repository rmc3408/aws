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
  let listRecord: Array<Promise<PutItemOutput | void>> = []
  event.Records.forEach((record: DynamoDBRecord ) => {

    console.log(record.eventName, record.dynamodb!.NewImage, record.dynamodb!.OldImage)

    if (record.eventName === 'INSERT') {
      console.log('INSERT', record.dynamodb!.NewImage!.pk.S)
      if (record.dynamodb!.NewImage!.pk.S!.startsWith('#transaction')) {
        console.log('Invoice transaction event received')
     } else {
        console.log('Invoice event received')
        listRecord.push(createEvent(record, "INVOICE_CREATED"))
     }
    }
    if (record.eventName === 'REMOVE') {
      if (record.dynamodb!.OldImage!.pk.S === '#transaction') {
         console.log('Invoice transaction event received')
         listRecord.push(processExpiredTransaction(record))
      }
    }
  })
  await Promise.all(listRecord)
}

async function createEvent(record: DynamoDBRecord, eventType: string): Promise<PutItemOutput> {
  const { pk, sk, transactionId, productId, quantity, connectionId, transactionStatus }: { [Key: string]: AttributeValue } = record.dynamodb!.NewImage!
  const timeStamp: number = Date.now()
  const ttl = ~~(timeStamp / 1000 + (0.5 * 60))

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
      connectionId: connectionId,
      transactionStatus,
      ttl: ttl
    }
  }).promise() as Promise<PutItemOutput>
}

async function processExpiredTransaction(transaction: DynamoDBRecord): Promise<void> {
  const transactionId = transaction.dynamodb!.OldImage!.sk.S!
  const connectionId = transaction.dynamodb!.OldImage!.connectionId.S!
  const transactionStatus = transaction.dynamodb!.OldImage!.transactionStatus.S!
  console.log(transaction.dynamodb!)

  if (transactionStatus !== 'INVOICE_PROCESSED') {
    await webSocketServices.sendInvoiceStatus(connectionId, transactionId, 'TIMEOUT')
    await webSocketServices.disconnectClient(connectionId)
  } else {
    await webSocketServices.sendInvoiceStatus(connectionId, transactionId, transactionStatus)
  }
}
