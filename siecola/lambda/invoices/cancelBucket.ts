import { captureAWS } from 'aws-xray-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ApiGatewayManagementApi, DynamoDB, S3 } from 'aws-sdk';
import InvoiceTransactionRepository, { InvoiceTransactionStatusEnum } from '/opt/node/transactionRepositoryLayer';
import InvoiceWebSocket from '/opt/node/transactionWebScoketLayer';

captureAWS(require('aws-sdk'))

const s3Client = new S3()

const TRANSACTION_DB_NAME = process.env.TRANSACTION_DB_NAME!
const databaseClient = new DynamoDB.DocumentClient()
const transactionRepo = new InvoiceTransactionRepository(databaseClient, TRANSACTION_DB_NAME)

const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT!.substring(6)
const webSocketClient = new ApiGatewayManagementApi({ endpoint: WEBSOCKET_ENDPOINT })
const webSocketServices = new InvoiceWebSocket(webSocketClient)


export async function cancelHandler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {

  console.log(event.body)
  const transactionId: string = JSON.parse(event.body!).transactionId
  const lambdaReqId = ctx.awsRequestId!
  const connectionId = event.requestContext.connectionId!

  // Get transaction and try catch if dont exist
  try {
    const transaction = await transactionRepo.getTransaction(transactionId)

    if (transaction.transactionStatus === InvoiceTransactionStatusEnum.GENERATED) {
      await webSocketServices.sendInvoiceStatus(connectionId, transactionId, InvoiceTransactionStatusEnum.CANCELLED)
      await transactionRepo.updateStatusTransaction(transactionId, InvoiceTransactionStatusEnum.CANCELLED )
    } else {
      await webSocketServices.sendInvoiceStatus(connectionId, transactionId, transaction.transactionStatus)
    }
    
  } catch (error) {
    console.error('Cannot cancel because not found')
    await webSocketServices.sendInvoiceStatus(connectionId, transactionId, InvoiceTransactionStatusEnum.NON_VALID_INVOICE_NUMBER)
  }

  // process

  return {
    statusCode: 200,
    body: 'CANCELLING FROM BUCKET'
  }
}