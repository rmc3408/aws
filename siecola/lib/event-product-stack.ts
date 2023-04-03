import { Stack, RemovalPolicy, StackProps, Duration } from 'aws-cdk-lib';
import { Table, AttributeType, BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';


class EventProductsStack extends Stack {
  public readonly productsEventDatabase: Table

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // Create of Dynamo DB Table
    this.productsEventDatabase = new Table(this, 'ProductsEventsDB', {
      tableName: "event-products",
      partitionKey: { name: 'pk', type: AttributeType.STRING },
      sortKey: { name: 'sk', type: AttributeType.STRING },
      timeToLiveAttribute: "ttl",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode:  BillingMode.PROVISIONED,
      writeCapacity: 1,
      readCapacity: 1
    })

    this.productsEventDatabase.autoScaleReadCapacity({
      maxCapacity: 2,
      minCapacity: 1
    }).scaleOnUtilization({
      targetUtilizationPercent: 50,
      scaleInCooldown: Duration.seconds(60),
      scaleOutCooldown: Duration.seconds(60)
    })
    this.productsEventDatabase.autoScaleWriteCapacity({
      maxCapacity: 4,
      minCapacity: 1
    }).scaleOnUtilization({
      targetUtilizationPercent: 30,
      scaleInCooldown: Duration.seconds(60),
      scaleOutCooldown: Duration.seconds(60)
    })
  }
}

export default EventProductsStack;
