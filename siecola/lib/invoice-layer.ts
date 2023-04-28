import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime, Code, LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

class InvoiceLayersStack extends Stack {
  readonly transactionRepo: LayerVersion;
  readonly crudTransaction: LayerVersion;
  readonly webSocket: LayerVersion;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Transaction Repository
    this.transactionRepo = new LayerVersion(this, 'TransactionRepositoryLayer-Stack', {
      code: Code.fromAsset('lambda/invoices/layers/invoiceLayer'),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      layerVersionName: 'TransactionRepositoryLayer',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new StringParameter(this, 'TransactionRepoVersionArn-Stack', {
      parameterName: 'RepoParameterArn',
      stringValue: this.transactionRepo.layerVersionArn,
    });


    // Invoice Services - CREATE, UPDATE AND DELETE
    this.crudTransaction = new LayerVersion(this, 'CRUDTransactionsLayer-Stack', {
      code: Code.fromAsset('lambda/invoices/layers/invoiceLayer'),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      layerVersionName: 'CRUDTransactionLayer',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new StringParameter(this, 'CRUDTransactionVersionArn-Stack', {
      parameterName: 'CRUDParameterArn',
      stringValue: this.crudTransaction.layerVersionArn,
    });
    
    
    // Websocket Services Methods
    this.webSocket = new LayerVersion(this, 'WebSocketLayer-Stack', {
      code: Code.fromAsset('lambda/invoices/layers/invoiceLayer'),
      compatibleRuntimes: [Runtime.NODEJS_16_X],
      layerVersionName: 'WebSocketLayer',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new StringParameter(this, 'WebSocketVersionArn-Stack', {
      parameterName: 'WebSocketParameterArn',
      stringValue: this.webSocket.layerVersionArn,
    });
  }
}

export default InvoiceLayersStack;
