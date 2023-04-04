import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { OrderEventDatabase, OrderEventType } from '/opt/node/orderEventLayer';
import { OrderResponse } from './order-models';

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

  async getEventByEmail(email: string): Promise<OrderResponse[]> {
    const params: DocumentClient.QueryInput = {
      TableName: this.eventTableName,
      IndexName: 'emailIndex',
      KeyConditionExpression: 'email = :email AND begins_with(sk, :prefix)',
      ExpressionAttributeValues: {
        ':email': email,
        ':prefix': 'ORDER_'
      },
    };
    const result = await this.client.query(params).promise();

    if (result.Count === 0) return [];
    return result.Items as OrderResponse[];
  }

  async getEventByEmailAndEventType(email: string, eType: OrderEventType): Promise<OrderResponse[]> {
    const params: DocumentClient.QueryInput = {
      TableName: this.eventTableName,
      IndexName: 'emailIndex',
      KeyConditionExpression: 'email = :email AND begins_with(sk, :prefix)',
      ExpressionAttributeValues: {
        ':email': email,
        ':prefix': eType
      },
    };
    const result = await this.client.query(params).promise();

    if (result.Count === 0) return [];
    return result.Items as OrderResponse[];
  }
}
