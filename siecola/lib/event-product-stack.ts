import { Stack, RemovalPolicy } from 'aws-cdk-lib';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';


class EventProductsStack extends Stack {
  public readonly productsEventDatabase: Table

  constructor(scope: Construct, id: string, props?: NodejsFunctionProps) {
    super(scope, id, props)

    // Create of Dynamo DB Table
    this.productsEventDatabase = new Table(this, 'ProductsEventsDB', {
      tableName: "event-products",
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      timeToLiveAttribute: "ttl",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode:  BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    })
  }
}

export default EventProductsStack;
