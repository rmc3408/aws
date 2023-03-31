import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { OrderEventDatabase } from '/opt/node/orderEventLayer';

export default class OrderEventRepository {
  private client: DocumentClient;
  private eventTableName: string;

  constructor(ddbClient: DocumentClient, tablename: string) {
    this.client = ddbClient;
    this.eventTableName = tablename;
  }

  async createEvent(orderEvent: OrderEventDatabase): Promise<DocumentClient.PutItemOutput> {
    const params: DocumentClient.PutItemInput = {
      TableName: this.eventTableName,
      Item: orderEvent
    }
    return await this.client.put(params).promise()
  }
}
