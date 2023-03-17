import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib"
import { Construct } from "constructs"
import { Runtime, Code, LayerVersion } from "aws-cdk-lib/aws-lambda"
import { StringParameter } from "aws-cdk-lib/aws-ssm"

export default class ProductsLayersStack extends Stack {
   readonly productsLayers: LayerVersion

   constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props)

      this.productsLayers = new LayerVersion(this, "ProductsLayer", {
         code: Code.fromAsset('lambda/products/layers/productsLayer'),
         compatibleRuntimes: [Runtime.NODEJS_16_X],
         layerVersionName: "ProductsLayer",
         //removalPolicy: RemovalPolicy.RETAIN
      })
      new StringParameter(this, "ProductsLayerVersionArn", {
         parameterName: "ProductsParameterArn",
         stringValue: this.productsLayers.layerVersionArn
      })
   }
}