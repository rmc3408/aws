import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { v4 as uuid } from 'uuid';

export interface Product {
  id: string
  productName: string
  productUrl: string
  model: string
  price: number
  code: string
}

class ProductsRepository {
  private client: DocumentClient
  private tableName: string

  constructor(client: DocumentClient, tableName: string) {
    this.client = client
    this.tableName = tableName
  }

  async getAllProducts(): Promise<Product[] | string> {
    const params: DocumentClient.ScanInput = {
      TableName: this.tableName
    }
    const result = await this.client.scan(params).promise()
    return result.Items as Product[] || 'Empty list'
  }

  async getOneProduct(productId: string): Promise<Product | string> {
    const params: DocumentClient.GetItemInput = {
      TableName: this.tableName,
      Key: { id: productId }
    }
    const result = await this.client.get(params).promise()
    
    if (result.Item === undefined) return 'Item not found' 
    return result.Item as Product
  }

  async createProduct(product: Product): Promise<Product> {
    product.id = uuid()
    const params: DocumentClient.PutItemInput = {
      TableName: this.tableName,
      Item: product
    }

    await this.client.put(params).promise()
    return product
  } 

  async deleteProduct(productId: string): Promise<Product | string> {
    const params: DocumentClient.DeleteItemInput = {
      TableName: this.tableName,
      ReturnValues: "ALL_OLD",
      Key: {
        id: productId
      } 
    }

    const result = await this.client.delete(params).promise()
    if (result.Attributes == undefined) return 'Product not Found'
    return result.Attributes as Product
  } 
  
  async updateProduct(productId: string, product: Product): Promise<Product | string> {
    const params: DocumentClient.UpdateItemInput = {
      TableName: this.tableName,
      ReturnValues: "UPDATED_NEW",
      Key: {
        id: productId
      },
      ConditionExpression: 'attribute_exists(id)',
      UpdateExpression: "SET productName = :n, productUrl = :u, code = :c, price = :p, model = :m",
      ExpressionAttributeValues: {
        ":n": product.productName,
        ":u": product.productUrl,
        ":p": product.price,
        ":c": product.code,
        ":m": product.model,
      }
    }

    const result = await this.client.update(params).promise()
    if (!result.Attributes) return "Cannot update product"
    return result.Attributes as Product
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {

    type ArrayKeysID = Array<{ "id": { S: string }}>
    const keysArr: ArrayKeysID = []

    ids.forEach((id: string) => {
      keysArr.push({ "id": { S: id }})
    })

    const params: DocumentClient.BatchGetItemInput = {
      RequestItems: {
        [this.tableName]: {
          Keys: keysArr,
        }
      }
    }

    const result = await this.client.batchGet(params).promise()
    if (result.Responses === undefined) return []
    return result.Responses[this.tableName] as Product[]
  }
}

export default ProductsRepository
