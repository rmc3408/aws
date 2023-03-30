import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Runtime, Code, LayerVersion } from "aws-cdk-lib/aws-lambda"
import { StringParameter } from "aws-cdk-lib/aws-ssm"

class OrderLayersStack extends Stack {
   readonly orderLayer: LayerVersion

   constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props)

      this.orderLayer = new LayerVersion(this, "OrderLayer-Stack", {
         code: Code.fromAsset('lambda/orders/layers/orderLayer'),
         compatibleRuntimes: [Runtime.NODEJS_16_X],
         layerVersionName: "OrderLayer",
         removalPolicy: RemovalPolicy.DESTROY
      })
      new StringParameter(this, "OrderLayerVersionArn-Stack", {
         parameterName: "OrderParameterArn",
         stringValue: this.orderLayer.layerVersionArn
      })
   }
}

export default OrderLayersStack
