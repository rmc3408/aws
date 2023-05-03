import { captureAWS } from 'aws-xray-sdk'
import { Context, S3Event, S3EventRecord } from 'aws-lambda'
import { ApiGatewayManagementApi, DynamoDB, S3 } from 'aws-sdk'
import InvoiceRepository, { Invoice, InvoiceFile } from '/opt/node/invoiceRepositoryLayer'
import InvoiceWebSocket from '/opt/node/transactionWebScoketLayer'
import InvoiceTransactionRepository, { InvoiceTransactionStatusEnum } from '/opt/node/transactionRepositoryLayer'

captureAWS(require('aws-sdk'))

const s3Client = new S3()

const TRANSACTION_DB_NAME = process.env.TRANSACTION_DB_NAME!
const databaseClient = new DynamoDB.DocumentClient()
const invoiceRepo = new InvoiceRepository(databaseClient, TRANSACTION_DB_NAME)
const transactionRepo = new InvoiceTransactionRepository(databaseClient, TRANSACTION_DB_NAME)

const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT!.substring(6)
const webSocketClient = new ApiGatewayManagementApi({ endpoint: WEBSOCKET_ENDPOINT })
const webSocketServices = new InvoiceWebSocket(webSocketClient)

export async function putHandler(event: S3Event, _ctx: Context): Promise<void> {
  let listRecord: Array<Promise<void>> = []

  //list records from S3 notification
  event.Records.forEach((record: S3EventRecord) => {
    listRecord.push(processEachRecord(record))
  })

  await Promise.all(listRecord)
}

async function processEachRecord(record: S3EventRecord) {
  const transactionId = record.s3.object.key
  const transaction = await transactionRepo.getTransaction(transactionId)
  const { transactionStatus, connectionId } = transaction
  
  try {
    // Change status from Transaction GENERATED -> RECEIVED
    if (transactionStatus === InvoiceTransactionStatusEnum.GENERATED) {
      await webSocketServices.sendInvoiceStatus(connectionId, transactionId, InvoiceTransactionStatusEnum.RECEIVED)
      await transactionRepo.updateStatusTransaction(transactionId, InvoiceTransactionStatusEnum.RECEIVED)
    } else {
      await webSocketServices.sendInvoiceStatus(connectionId, transactionId, transactionStatus)
      console.error('Non Valid change in the transaction Status')
      return
    }
  } catch (error) {
    console.log((<Error>error).message)
  }

  // Once pass, get specif Object and after, delete from S3
  const obj = await s3Client
    .getObject({
      Key: transactionId,
      Bucket: record.s3.bucket.name,
    })
    .promise()
  await s3Client
    .deleteObject({
      Key: transactionId,
      Bucket: record.s3.bucket.name,
    })
    .promise()

  // pre treating data from S3
  const bodyObject = obj.Body!.toString('utf-8')
  const invoiceFile: InvoiceFile = JSON.parse(bodyObject)

  // Saving data in Database, update and send back to Websocket
  const newInvoice: Invoice = {
    pk: `#invoice_${invoiceFile.customerName}`,
    sk: invoiceFile.invoiceNumber,
    totalValue: invoiceFile.totalValue,
    productId: invoiceFile.productId,
    quantity: invoiceFile.quantity,
    transactionId: transactionId,
    ttl: 0,
    createdAt: Date.now(),
  }

  let listSavingInvoice: Array<Promise<unknown>> = []
  listSavingInvoice.push(invoiceRepo.createInvoice(newInvoice))
  listSavingInvoice.push(transactionRepo.updateStatusTransaction(transactionId, InvoiceTransactionStatusEnum.PROCESSED))
  listSavingInvoice.push(webSocketServices.sendInvoiceStatus(connectionId, transactionId, InvoiceTransactionStatusEnum.PROCESSED))
  await Promise.all(listSavingInvoice)
}
