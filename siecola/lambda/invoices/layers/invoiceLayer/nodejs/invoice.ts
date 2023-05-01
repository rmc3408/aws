import { DocumentClient } from "aws-sdk/clients/dynamodb";

export interface Invoice {
  pk: string;
  sk: string;
  totalValue: number;
  productId: string;
  quantity: number;
  transactionId: string;
  ttl: number;
  createdAt: number;
}

export interface InvoiceFile extends Pick<Invoice, 'totalValue' | 'quantity' | 'productId'> {
  customerName: string;
  invoiceNumber: string;
}

class InvoiceRepository {
  private client: DocumentClient;
  private tableName: string;

  constructor(client: DocumentClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  async createInvoice(invoice: Invoice): Promise<Invoice> {
    
    const params: DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: invoice,
    };

    await this.client.put(params).promise();
    return invoice
  }
}


export default InvoiceRepository;
