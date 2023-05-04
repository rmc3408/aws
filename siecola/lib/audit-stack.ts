import { Construct } from 'constructs'
import { Stack, StackProps, Duration, RemovalPolicy } from 'aws-cdk-lib'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LayerVersion, Tracing, LambdaInsightsVersion, Runtime } from 'aws-cdk-lib/aws-lambda'

import { Queue } from 'aws-cdk-lib/aws-sqs'
import { EventBus, Rule } from 'aws-cdk-lib/aws-events'
import { LambdaFunction, SqsQueue } from 'aws-cdk-lib/aws-events-targets'

class AuditStack extends Stack {
  private readonly bus: EventBus
  private readonly invoiceHandler: NodejsFunction
  private readonly orderHandler: NodejsFunction
  private readonly errorsQueue: Queue

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    this.bus = new EventBus(this, 'Audit-Stack', {
      eventBusName: 'AuditEventBus',
    })

    this.bus.archive('BusArchive', {
      eventPattern: {
        source: ['app.order'],
      },
      archiveName: 'auditArchiving',
      retention: Duration.days(10),
    })

    
    // Create a rule for Order lambda
    const nonValidOrderRule = new Rule(this, 'NonValid-Order-Rule', {
      ruleName: 'NonValid-Order',
      eventBus: this.bus,
      eventPattern: {
        source: ['app.order'],
        detailType: ['order'],
        detail: {
          reason: ['PRODUCT_NOT_FOUND'],
        },
      },
    })
    // Lambda Function in case of Order with ProductId not found
    this.orderHandler = new NodejsFunction(this, 'ProductIdMissingFunction-Stack', {
      functionName: 'missingProductIdFunction',
      handler: 'missingProductIdHandler',
      runtime: Runtime.NODEJS_16_X,
      tracing: Tracing.ACTIVE,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_135_0,
      memorySize: 128,
      timeout: Duration.seconds(2),
      entry: 'lambda/audit/order.ts',
      bundling: {
        minify: true,
        sourceMap: false,
      },
    })
    nonValidOrderRule.addTarget(new LambdaFunction(this.orderHandler))


    // Create a rule for Invoice lambda
    const nonValidInvoiceRule = new Rule(this, 'NonValid-Invoice-Rule', {
      ruleName: 'NonValid-Invoice',
      eventBus: this.bus,
      eventPattern: {
        source: ['app.invoice'],
        detailType: ['invoice'],
        detail: {
          errorDetail: ['FAIL_NO_INVOICE_NUMBER'],
        },
      },
    })
    // Lambda Function for Invoices without InvoiceNumber
    this.invoiceHandler = new NodejsFunction(this, 'InvoiceNumberMissingFunction-Stack', {
      functionName: 'missingInvoiceNumFunction',
      handler: 'missingInvoiceNumHandler',
      runtime: Runtime.NODEJS_16_X,
      tracing: Tracing.ACTIVE,
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_135_0,
      memorySize: 128,
      timeout: Duration.seconds(2),
      entry: 'lambda/audit/invoice.ts',
      bundling: {
        minify: true,
        sourceMap: false,
      },
    })
    nonValidInvoiceRule.addTarget(new LambdaFunction(this.invoiceHandler))


    // Create a rule for InvoiceErrors lambda
    const errorsInvoiceRule = new Rule(this, 'errors-Invoice-Rule', {
      ruleName: 'errors-Invoice',
      eventBus: this.bus,
      eventPattern: {
        source: ['app.invoice'],
        detailType: ['invoice'],
        detail: {
          errorDetail: ['TIMEOUT'],
        },
      },
    })
    // Create Queue for Invoices with Errors
    this.errorsQueue = new Queue(this, 'auditSQS-Stack', {
      queueName: 'errorsQueue'
    })
    errorsInvoiceRule.addTarget(new SqsQueue(this.errorsQueue))
  }
}

export default AuditStack
