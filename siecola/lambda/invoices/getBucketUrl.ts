import { captureAWS } from 'aws-xray-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ApiGatewayManagementApi, DynamoDB, S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid'
import { Duration } from 'aws-cdk-lib';
import InvoiceRepository, { InvoiceTransaction, InvoiceTransactionStatusEnum } from '/opt/node/transactionRepositoryLayer';
import InvoiceWebSocket from '/opt/node/transactionWebScoketLayer';

captureAWS(require('aws-sdk'))


const TRANSACTION_DB_NAME = process.env.TRANSACTION_DB_NAME!
const BUCKET_NAME = process.env.BUCKET_NAME!
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT!.substring(6)


const s3Client = new S3()

const databaseClient = new DynamoDB.DocumentClient()
const repo = new InvoiceRepository(databaseClient, TRANSACTION_DB_NAME)

const webSocketClient = new ApiGatewayManagementApi({ endpoint: WEBSOCKET_ENDPOINT })
const webSocketServices = new InvoiceWebSocket(webSocketClient)


export async function getHandler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {

  
  const lambdaReqId = ctx.awsRequestId!
  const connectionWebsocketId = event.requestContext.connectionId!
  const transactionSK = uuid()
  const timestamp = Date.now()
  const ttl = ~~(timestamp / 1000 + 120)
  console.log(WEBSOCKET_ENDPOINT, lambdaReqId, connectionWebsocketId)


  // Create invoice and save to database
  const newTransaction: InvoiceTransaction = {
    pk: '#transaction',
    sk: transactionSK,
    ttl: ttl,
    requestId: lambdaReqId,
    timestamp: timestamp,
    expiresIn: 300,
    connectionId: connectionWebsocketId,
    endpoint: WEBSOCKET_ENDPOINT,
    transactionStatus: InvoiceTransactionStatusEnum.GENERATED
  }  
  await repo.createInvoice(newTransaction)
  

  // Create a bucket and send bucket info
  const signedURL = await s3Client.getSignedUrlPromise('putObject', { 
    Bucket: BUCKET_NAME,
    Key: transactionSK,
    Expires: 300
  })
  
  const InvoiceURLdata = JSON.stringify({
    url: signedURL,
    expires: 300,
    transactionId: transactionSK
  })

  // send back URL to Websocket
  await webSocketServices.sendData(connectionWebsocketId, InvoiceURLdata)  

  return {
    statusCode: 200,
    body: 'GETTING URL FROM BUCKET'
  }
}