import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import ProductsRepository from '/opt/node/productsLayer';
import { DynamoDB } from 'aws-sdk';
import { captureAWS } from 'aws-xray-sdk';
import OrdersRepository, { Order } from '/opt/node/orderLayer';

// This process is executed only once during Initialization of Function in NODEJS.
captureAWS(require('aws-sdk'));

const ordersTableNameEnviroment = process.env.ORDERS_DB!;
const productsTableNameEnviroment = process.env.PRODUCTS_DB!;
const dynamoDBClient = new DynamoDB.DocumentClient();
const ordersRepositoryInstance = new OrdersRepository(dynamoDBClient, ordersTableNameEnviroment);
const productsRepositoryInstance = new ProductsRepository(dynamoDBClient, productsTableNameEnviroment);


export async function ordersFetchHandler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {
  
  if (event.httpMethod == 'GET' && event.resource == '/orders' && event.queryStringParameters == null) {
    console.log('Get All Orders');
    // GET - '/orders'
    const result = await ordersRepositoryInstance.getAllOrders();

    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ message: `Getting all orders`, data: result }),
    };
  } 
  else if (event.httpMethod == 'GET' && event.resource == '/orders' && event.queryStringParameters !== null) {
    const email = event.queryStringParameters.email;
    const orderId = event.queryStringParameters.orderId;

    if (email && orderId) {
      // GET - '/orders?email=alex@gmail.com&orderId=123'
      console.log('GET ONE ORDER BY ONE CLIENT');
      const result = await ordersRepositoryInstance.getOneOrder(email, orderId);

      return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ message: `Get order id = ${orderId} by ${email}`, data: result }),
      };
    }

    if (email && !orderId) {
      // GET - '/orders?email=alex@gmail.com'
      console.log('Get All Orders by Email');
      const result = await ordersRepositoryInstance.getOrderByEmail(email);

      return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ message: `Get all order by email`, data: result }),
      };
    }
  }

  if (event.httpMethod == 'POST') {
    console.log('Create Order');

    const newProduct: Order = {
      products: [{ code: '300', price: 12 }, { code: '400', price: 12 } ],
      billing: { payment: 'CASH', totalPrice: 20 },
      shipping: { type: 'URGENT', carrier: 'FEDEX' },
    };
    const result = await ordersRepositoryInstance.createOrder(newProduct);

    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({ message: `Creating product`, data: result }),
    };
  }

  if (event.httpMethod == 'DELETE') {
    console.log('Delete Product');
    const email = event.queryStringParameters!.email;
    const orderId = event.queryStringParameters!.orderId;

    if (email && orderId) {
      const result = await ordersRepositoryInstance.deleteOrder(email, orderId);
      return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ message: `Deleting order`, data: result }),
      };
    }
  }

  return {
    statusCode: 400,
    headers: {},
    body: JSON.stringify({ message: 'no products found in this endpoint' }),
  };
}
