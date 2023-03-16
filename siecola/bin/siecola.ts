#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import ApiGatewayStack from '../lib/api-stack';
import ProductsStack from '../lib/products-stack';

const app = new cdk.App();

  /* What Account and Region you want to deploy each stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
const myAwsEnv: cdk.Environment = {
  region: 'us-east-1',
  account: '631766433992',
};

const productsFetchStackCreated = new ProductsStack(app, 'ProductsFetch-App', {})
cdk.Tags.of(productsFetchStackCreated).add('Team', 'Ecommerce-Products')

const ApiGatewayStackCreated = new ApiGatewayStack(app, 'ApiGateway-App', { productsFetch: productsFetchStackCreated.productsfetchHandler });
cdk.Tags.of(ApiGatewayStackCreated).add('Team', 'Ecommerce-API')
ApiGatewayStackCreated.addDependency(productsFetchStackCreated) // certify products will be used as Dependency.
