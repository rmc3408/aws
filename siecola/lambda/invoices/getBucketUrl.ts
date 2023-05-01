import { captureAWS } from 'aws-xray-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ApiGatewayManagementApi, DynamoDB, S3 } from 'aws-sdk';
import { v4 as uuid } from 'uuid'
import InvoiceTransactionRepository, { InvoiceTransaction, InvoiceTransactionStatusEnum } from '/opt/node/transactionRepositoryLayer';
import InvoiceWebSocket from '/opt/node/transactionWebScoketLayer';

captureAWS(require('aws-sdk'))


const BUCKET_NAME = process.env.BUCKET_NAME!
const s3Client = new S3()

const TRANSACTION_DB_NAME = process.env.TRANSACTION_DB_NAME!
const databaseClient = new DynamoDB.DocumentClient()
const repo = new InvoiceTransactionRepository(databaseClient, TRANSACTION_DB_NAME)


const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT!.substring(6)
// Alternatives
// const WS_ENDPOINT = process.env.WEBSOCKET_URL!.substring(6)
// const WS_ENDPOINT = webSocketClient.config.endpoint
const webSocketClient = new ApiGatewayManagementApi({ endpoint: WEBSOCKET_ENDPOINT })
const webSocketServices = new InvoiceWebSocket(webSocketClient)


export async function getHandler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {
  
  const lambdaReqId = ctx.awsRequestId!
  const connectionWebsocketId = event.requestContext.connectionId!
  const transactionSK = uuid()
  const timestamp = Date.now()
  const ttl = ~~(timestamp / 1000 + 120)
  const expirationTime = 60 * 5
  console.log('Also Websocket endpoint from config from client' , webSocketClient.config.endpoint)

  // Create invoice
  const newTransaction: InvoiceTransaction = {
    pk: '#transaction',
    sk: transactionSK,
    ttl: ttl,
    requestId: lambdaReqId,
    timestamp: timestamp,
    expiresIn: expirationTime,
    connectionId: connectionWebsocketId,
    endpoint: WEBSOCKET_ENDPOINT,
    transactionStatus: InvoiceTransactionStatusEnum.GENERATED
  } 

  // save to database
  await repo.createTransaction(newTransaction)
  

  // Create a bucket and send bucket info
  const signedURL = await s3Client.getSignedUrlPromise('putObject', { 
    Bucket: BUCKET_NAME,
    Key: transactionSK,
    Expires: expirationTime
  })
  
  const InvoiceURLdata = JSON.stringify({
    url: signedURL,
    expires: expirationTime,
    transactionId: transactionSK
  })

  // send back URL to Websocket
  await webSocketServices.sendData(connectionWebsocketId, InvoiceURLdata)  

  return {
    statusCode: 200,
    body: 'GETTING URL FROM BUCKET'
  }
}