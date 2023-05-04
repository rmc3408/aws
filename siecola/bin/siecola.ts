#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import ProductsLayersStack from '@lib/products-layer';
import OrderLayersStack from '@lib/order-layer';
import EventProductsStack from '@lib/event-product-stack';
import ProductsStack from '@lib/products-stack';
import OrderStack from '@lib/orders-stack';
import ApiGatewayStack from '@lib/api-stack';
import InvoiceLayersStack from '@lib/invoice-layer';
import WebSocketApiStack from '@lib/web-socket-stack';
import AuditStack from '@lib/audit-stack'


const app = new cdk.App();

  /* What Account and Region you want to deploy each stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
const myAwsEnv: cdk.Environment = {
  region: 'us-east-1',
  account: '631766433992',
};

//Layers with share code between lambdas
const productsLayer = new ProductsLayersStack(app, 'ProductsLayer-App', { env: myAwsEnv }) 
const ordersLayer = new OrderLayersStack(app, 'OrderLayer-App', { env: myAwsEnv })

// Event Bus Stack
const auditEventBus = new AuditStack(app, 'EventBus-App', { env: myAwsEnv })


// Products Stacks
const productEvent = new EventProductsStack(app, 'EventsProduct-App');
const products = new ProductsStack(app, 'Products-App', { eventDatabase: productEvent.productsEventDatabase, env: myAwsEnv })
products.addDependency(productsLayer);
products.addDependency(productEvent);


// Orders Stacks
const orders = new OrderStack(app, 'Order-App', { 
  productsDatabase: products.productsDatabase,
  eventDatabase: productEvent.productsEventDatabase,
  env: myAwsEnv,
  auditBus: auditEventBus.bus
 })
orders.addDependency(ordersLayer)
orders.addDependency(productEvent)
orders.addDependency(products)
orders.addDependency(auditEventBus)



// REST API Gatewat Stacks
const apiGateway = new ApiGatewayStack(app, 'ApiGateway-App', { 
  productsFetch: products.productsfetchHandler,
  productsAdmin: products.productsAdminHandler,
  ordersFetch: orders.ordersfetchHandler,
  eventsFetch: orders.eventsFetchHandler,
  env: myAwsEnv
});
apiGateway.addDependency(products)
apiGateway.addDependency(orders) 


// Web Socket Stack
const invoiceLayers = new InvoiceLayersStack(app, 'InvoiceLayer-App')
const webSocket = new WebSocketApiStack(app, 'WebsocketApi-App', { 
  eventDb: productEvent.productsEventDatabase,
  auditBus: auditEventBus.bus
})
webSocket.addDependency(productEvent)
webSocket.addDependency(invoiceLayers)
webSocket.addDependency(auditEventBus)


// tags for billing purproses
cdk.Tags.of(products).add('Ecommerce-Products', 'UdemySiecola')
cdk.Tags.of(orders).add('Ecommerce-Orders', 'UdemySiecola')
cdk.Tags.of(apiGateway).add('Ecommerce-API', 'UdemySiecola')
cdk.Tags.of(productEvent).add('Ecommerce-Events', 'UdemySiecola')
cdk.Tags.of(webSocket).add('Ecommerce-WebSocket', 'UdemySiecola')
cdk.Tags.of(auditEventBus).add('Ecommerce-EventBridgeBus', 'UdemySiecola')
