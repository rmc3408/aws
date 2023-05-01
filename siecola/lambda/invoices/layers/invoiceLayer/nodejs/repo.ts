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

class InvoiceRepository {
  private client: DocumentClient;
  private tableName: string;

  constructor(client: DocumentClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  // async getAllOrders(): Promise<OrderResponse[]> {
  //   const params: DocumentClient.ScanInput = {
  //     TableName: this.tableName,
  //   };
  //   const result = await this.client.scan(params).promise();
  //   return result.Items as OrderResponse[];
  // }

  // async getOrderByEmail(email: string): Promise<OrderResponse[]> {
  //   const params: DocumentClient.QueryInput = {
  //     TableName: this.tableName,
  //     KeyConditionExpression: 'pk = :email',
  //     ExpressionAttributeValues: {
  //       ':email': email,
  //     },
  //     ProjectionExpression: "pk, sk, createdAt",
  //   };
  //   const result = await this.client.query(params).promise();

  //   if (result.Count === 0) return [];
  //   return result.Items as OrderResponse[];
  // }

  // async getOrderByEmailAndId(email: string, id: string): Promise<OrderResponse[]> {
  //   const params: DocumentClient.QueryInput = {
  //     TableName: this.tableName,
  //     KeyConditionExpression: 'pk = :email and sk = :id',
  //     ExpressionAttributeValues: {
  //       ':email': email,
  //       ':id': id,
  //     },
  //   };
  //   const result = await this.client.query(params).promise();
  //   return result.Items as Omit<OrderResponse, 'shipping' | 'products' | 'billing' >[];
  // }

  // async getOneOrder(email: string, id: string): Promise<OrderResponse> {
  //   const params: DocumentClient.GetItemInput = {
  //     TableName: this.tableName,
  //     Key: {
  //       pk: email,
  //       sk: id,
  //     },
  //   };
  //   const result = await this.client.get(params).promise();
  //   return result.Item as OrderResponse; 
  // }

  async createInvoice(invoice: InvoiceTransaction): Promise<InvoiceTransaction> {
    
    const params: DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: invoice,
    };

    await this.client.put(params).promise();
    return invoice
  }

  // async deleteOrder(email: string, id: string): Promise<OrderDatabase> {
  //   const params: DocumentClient.DeleteItemInput = {
  //     TableName: this.tableName,
  //     ReturnValues: 'ALL_OLD',
  //     Key: {
  //       pk: email,
  //       sk: id,
  //     },
  //   };

  //   const result = await this.client.delete(params).promise()
  //   return result.Attributes as OrderDatabase
  // }
}

export default InvoiceRepository;
