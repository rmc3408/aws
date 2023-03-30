import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { OrderDatabase, OrderResponse } from '/opt/node/orderModelsLayer';


class OrdersRepository {
  private client: DocumentClient;
  private tableName: string;

  constructor(client: DocumentClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  async getAllOrders(): Promise<OrderResponse[]> {
    const params: DocumentClient.ScanInput = {
      TableName: this.tableName,
    };
    const result = await this.client.scan(params).promise();
    return result.Items as OrderResponse[];
  }

  async getOrderByEmail(email: string): Promise<OrderResponse[]> {
    const params: DocumentClient.QueryInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    };
    const result = await this.client.query(params).promise();

    if (result.Count === 0) return [];
    return result.Items as OrderResponse[];
  }

  async getOrderByEmailAndId(email: string, id: string): Promise<OrderResponse[]> {
    const params: DocumentClient.QueryInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :email and sk = :id',
      ExpressionAttributeValues: {
        ':email': email,
        ':id': id,
      },
    };
    const result = await this.client.query(params).promise();
    return result.Items as OrderResponse[];
  }

  async getOneOrder(email: string, id: string): Promise<OrderResponse> {
    const params: DocumentClient.GetItemInput = {
      TableName: this.tableName,
      Key: {
        pk: email,
        sk: id,
      },
    };
    const result = await this.client.get(params).promise();
    return result.Item as OrderResponse; 
  }

  async createOrder(order: OrderDatabase): Promise<OrderDatabase> {
    
    const params: DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: order,
    };

    await this.client.put(params).promise();
    return order as OrderDatabase
  }

  async deleteOrder(email: string, id: string): Promise<OrderDatabase | string> {
    const params: DocumentClient.DeleteItemInput = {
      TableName: this.tableName,
      ReturnValues: 'ALL_OLD',
      Key: {
        pk: email,
        sk: id,
      },
    };

    const result = await this.client.delete(params).promise()
    console.log(result.Attributes)
    if (result.Attributes === undefined) {
      return 'Order not found';
    }
    return result.Attributes as OrderDatabase
  }
}

export default OrdersRepository;
