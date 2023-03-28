#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import ApiGatewayStack from '../lib/api-stack';
import ProductsStack from '../lib/products-stack';
import ProductsLayersStack from '../lib/products-layer';
import EventProductsStack from '../lib/event-product-stack';


const app = new cdk.App();

  /* What Account and Region you want to deploy each stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
const myAwsEnv: cdk.Environment = {
  region: 'us-east-1',
  account: '631766433992',
};

const productsLayerStackCreated = new ProductsLayersStack(app, 'ProductsLayer-App', { env: myAwsEnv }) //Layer with share code between lambdas
const productEventStack = new EventProductsStack(app, 'EventsProduct-App');
const productsStackCreated = new ProductsStack(app, 'ProductsLambda-App', { eventDatabase: productEventStack.productsEventDatabase, env: myAwsEnv })
productsStackCreated.addDependency(productsLayerStackCreated);
productsStackCreated.addDependency(productEventStack);

const ApiGatewayStackCreated = new ApiGatewayStack(app, 'ApiGateway-App', { 
  productsFetch: productsStackCreated.productsfetchHandler,
  productsAdmin: productsStackCreated.productsAdminHandler,
  env: myAwsEnv
});
ApiGatewayStackCreated.addDependency(productsStackCreated) // certify products will be used as Dependency.

cdk.Tags.of(productsStackCreated).add('Team', 'Ecommerce-Products')
cdk.Tags.of(ApiGatewayStackCreated).add('Team', 'Ecommerce-API')


