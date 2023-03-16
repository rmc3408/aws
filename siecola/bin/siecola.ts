#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import ApiGatewayStack from '../lib/api-stack';
import ProductsStack from '../lib/products-stack';
import ProductsLayersStack from '../lib/products-layer';


const app = new cdk.App();

  /* What Account and Region you want to deploy each stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
const myAwsEnv: cdk.Environment = {
  region: 'us-east-1',
  account: '631766433992',
};
 
const productsLayerStackCreated = new ProductsLayersStack(app, 'ProductsLayer-App', { env: myAwsEnv }) //Layer with share code between lambdas

const productsStackCreated = new ProductsStack(app, 'ProductsFetch-App', { })
cdk.Tags.of(productsStackCreated).add('Team', 'Ecommerce-Products')
productsStackCreated.addDependency(productsLayerStackCreated);

const ApiGatewayStackCreated = new ApiGatewayStack(app, 'ApiGateway-App', { 
  productsFetch: productsStackCreated.productsfetchHandler,
  productsAdmin: productsStackCreated.productsAdminHandler,
  env: myAwsEnv
});
cdk.Tags.of(ApiGatewayStackCreated).add('Team', 'Ecommerce-API')
ApiGatewayStackCreated.addDependency(productsStackCreated) // certify products will be used as Dependency.
