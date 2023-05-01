import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export enum InvoiceTransactionStatusEnum {
  GENERATED = "URL_CREATED",
  RECEIVED = 'INVOICE_RECEIVED',
  PROCESSED = "INVOICE_PROCESSED",
  TIMEOUT = "TIMEOUT",
  CANCELLED = "INVOICE_CANCELLED",
  NON_VALID_INVOICE_NUMBER = 'INVOICE_INVALID'
}

export interface InvoiceTransaction {
  pk: string;
  sk: string;
  ttl: number;
  requestId: string;
  timestamp: number;
  expiresIn: number;
  connectionId: string;
  endpoint: string;
  transactionStatus: InvoiceTransactionStatusEnum
}


class InvoiceTransactionRepository {
  private client: DocumentClient;
  private tableName: string;

  constructor(client: DocumentClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  async updateStatusTransaction(id: string, status: InvoiceTransactionStatusEnum): Promise<boolean> {
    const params: DocumentClient.UpdateItemInput = {
      TableName: this.tableName,
      Key: {
        pk: '#transaction',
        sk: id
      },
      ConditionExpression: 'attribute_exist(pk)',
      UpdateExpression: 'set transactionStatus = :s',
      ExpressionAttributeValues: {
        ':s': status
      }
    };
    
    try {
      const result = await this.client.update(params).promise();
      console.log(result)
      return true
    } catch (ConditionalCheckFailedExpection) {
      console.error('Invoice transaction not found')
      return false
    }
  }

  async getTransaction(id: string): Promise<InvoiceTransaction> {
    const params: DocumentClient.GetItemInput = {
      TableName: this.tableName,
      Key: {
        pk: '#transaction',
        sk: id,
      },
    };
    const result = await this.client.get(params).promise();
    return result.Item as InvoiceTransaction; 
  }

  async createTransaction(transaction: InvoiceTransaction): Promise<InvoiceTransaction> {
    
    const params: DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: transaction,
    };

    await this.client.put(params).promise();
    return transaction
  }
}

export default InvoiceTransactionRepository;
