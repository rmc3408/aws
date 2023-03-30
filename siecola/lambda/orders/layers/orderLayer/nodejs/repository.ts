import { AWSError } from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuid } from 'uuid';

type OrderProduct = {
  price: number
  code: string
}

type Shipping = {
  type: "URGENT" | "ECONOMIC"
  carrier: "FEDEX" | "POST"
}

type Billing = {
  payment: 'CASH' | "DEBIT" | "CREDIT"
  totalPrice: number
}

export interface Order {
  pk?: string
  sk?: string
  createdAt?: number
  shipping: Shipping
  billing: Billing
  products: Array<OrderProduct>
}

class OrdersRepository {
  private client: DocumentClient
  private tableName: string

  constructor(client: DocumentClient, tableName: string) {
    this.client = client
    this.tableName = tableName
  }

  async getAllOrders(): Promise<Order[]> {
    const params: DocumentClient.ScanInput = {
      TableName: this.tableName
    }
    const result = await this.client.scan(params).promise()
    return result.Items as Order[]
  }

  async getOrderByEmail(email: string): Promise<Order[]> {
    const params: DocumentClient.QueryInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    }
    const result = await this.client.query(params).promise()
    
    if (result.Count === 0) return []
    return result.Items as Order[]
  }

  async getOrderByEmailAndId(email: string, id: string): Promise<Order[]> {
    const params: DocumentClient.QueryInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :email and sk = :id',
      ExpressionAttributeValues: {
        ':email': email,
        ':id': id,
      }
    }
    const result = await this.client.query(params).promise()
    return result.Items as Order[]
  }

  async getOneOrder(email: string, id: string): Promise<Order> {
    const params: DocumentClient.GetItemInput = {
      TableName: this.tableName,
      Key: {
        pk: email,
        sk: id,
      }
    }
    const result = await this.client.get(params).promise()
    return result.Item as Order
  }

  async createOrder(order: Order): Promise<Order> {
    order.sk = uuid()
    order.createdAt = Date.now()
    order.pk = 'HARD@code.com'

    const params: DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: order
    }

    await this.client.put(params).promise()
    return order
  } 

  async deleteOrder(email: string, id: string): Promise<Order | string> {
    const params: DocumentClient.DeleteItemInput = {
      TableName: this.tableName,
      ReturnValues: "ALL_OLD",
      Key: {
        pk: email,
        sk: id,
      } 
    }

    try {
      const result = await this.client.delete(params).promise()
      return result.Attributes as Order
    } catch (err: any ) {
      console.log("Could not complete operation, order not found");
      console.log("Error Message:  " + err.getMessage());
      console.log("HTTP Status:    " + err.getStatusCode());
      console.log("AWS error Code: " + err.getErrorCode());
      console.log("Error Type:     " + err.getErrorType());
      console.log("Request ID:     " + err.getRequestId());
      return 'Order not found'
    }
  } 
}

export default OrdersRepository
