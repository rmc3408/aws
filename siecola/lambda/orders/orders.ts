import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB, SNS } from 'aws-sdk';
import { captureAWS } from 'aws-xray-sdk';
import { v4 as uuid } from 'uuid';
import OrdersRepository from '/opt/node/orderLayer';
import ProductsRepository, { Product } from '/opt/node/productsLayer';
import { OrderProduct, OrderDatabase, OrderRequest, OrderResponse } from '/opt/node/orderModelsLayer';
import { Envelope, OrderEventType } from '/opt/node/orderEventLayer';

// This process is executed only once during Initialization of Function in NODEJS.
captureAWS(require('aws-sdk'));

const ordersTableNameEnviroment = process.env.ORDERS_DB!;
const productsTableNameEnviroment = process.env.PRODUCTS_DB!;
const orderTopicARN = process.env.TOPIC_ORDER!;

const dynamoDBClient = new DynamoDB.DocumentClient();
const ordersRepositoryInstance = new OrdersRepository(dynamoDBClient, ordersTableNameEnviroment);
const productsRepositoryInstance = new ProductsRepository(dynamoDBClient, productsTableNameEnviroment);

const snsClient = new SNS();


export async function ordersFetchHandler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {
  const lambdaReqId = ctx.awsRequestId;

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

    const preOrder: OrderRequest = JSON.parse(event.body!)
    const products = await productsRepositoryInstance.getProductsByIds(preOrder.productIds)

    // Check if size is same, user not mistake product IDS.
    if (products.length !== preOrder.productIds.length) {
      return {
        statusCode: 404,
        headers: {},
        body: JSON.stringify({ message: `Some wrong productId listed`, data: products }),
      };
    }

    //Build Order Request to Save
    const order = buildOrder(preOrder, products)
    const orderCreated = await ordersRepositoryInstance.createOrder(order);
    const eventCreated = await sendOrderEvent(order, OrderEventType.CREATED, lambdaReqId)
    console.log('LAMBDA - FROM API GATEWAY TO PUBLISH IN SNS = MESSAGE ID', eventCreated.MessageId)
    const displayOrderResponse = sendOrderResponse(orderCreated)

    return {
      statusCode: 201,
      headers: {},
      body: JSON.stringify({ message: `Creating product in Database`, data: displayOrderResponse, msgId: eventCreated.MessageId }),
    }
  }

  if (event.httpMethod == 'DELETE') {
    console.log('Delete Product');
    const email = event.queryStringParameters!.email;
    const orderId = event.queryStringParameters!.orderId;

    if (email && orderId) {
      const orderDeleted = await ordersRepositoryInstance.deleteOrder(email, orderId);
      const eventCreated = await sendOrderEvent(orderDeleted, OrderEventType.DELETED, lambdaReqId)
      return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ message: `Deleting order`, data: orderDeleted, msgId: eventCreated.MessageId }),
      };
    }
  }

  return {
    statusCode: 400,
    headers: {},
    body: JSON.stringify({ message: 'no products found in this endpoint' }),
  };
}


function buildOrder(request: OrderRequest, products: Product[]): OrderDatabase {

  let newProductList: OrderProduct[] = []
  let total = 0
  products.forEach((prod) => {
    total += prod.price
    newProductList.push({
      code: prod.code,
      price: prod.price
    })
  })
  const orderToSave: OrderDatabase = {
    pk: request.email,
    sk: uuid(),
    createdAt: Date.now(),
    email: request.email,
    billing: {
      payment: request.payment,
      totalPrice: total
    },
    shipping: request.shipping,
    products: newProductList
  }
  return orderToSave
}

function sendOrderResponse(order: OrderDatabase): OrderResponse {
  const convertOrder: OrderResponse = {
    email: order.pk,
    id: order.sk,
    shipping: order.shipping,
    billing: order.billing,
    createdAt: order.createdAt,
    products: order.products
  }
  return convertOrder
}

async function sendOrderEvent(order: OrderDatabase, eventType: OrderEventType, awsReqId: string) {
  const listCode: string[] = []
  order.products.forEach(prod => listCode.push(prod.code))

  const messageEnvelope: Envelope = {
    eventType,
    data: {
      email: order.pk,
      orderId: order.sk,
      shipping: order.shipping,
      billing: order.billing,
      productCode: listCode,
      requestId: awsReqId,
    }
  }
  return await snsClient.publish({
    TopicArn: orderTopicARN,
    Message: JSON.stringify(messageEnvelope),
    MessageAttributes: { // adding custom new atributte.
      eventType: { DataType: "String", StringValue: eventType }
    }
  }).promise()
}