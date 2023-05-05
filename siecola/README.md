# Welcome to your CDK TypeScript project


### AWS CDK Start Guide
https://docs.aws.amazon.com/cdk/api/v2/
https://github.com/aws-samples/aws-cdk-examples

### AWS CDK WorkShop Basics
https://cdkworkshop.com/

### Stack and Constructs
https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html
https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib-readme.html

### aws-cdk-lib » aws_lambda
https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda-readme.html

### aws-cdk-lib/aws-lambda-nodejs
https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html

### aws-cdk-lib » aws_apigatewayv2
https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_apigatewayv2-readme.html

### aws-cdk-lib » aws_s3
https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3-readme.html

### @aws-cdk/aws-apigatewayv2-alpha » @aws-cdk/aws-apigatewayv2-integrations-alpha
https://docs.aws.amazon.com/cdk/api/v2/docs/@aws-cdk_aws-apigatewayv2-alpha.WebSocketApi.html

### aws-cdk-lib/aws-events » aws-cdk-lib/aws-events-targets <- EventBus Queue - AWS EventBridge 
https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_events-readme.html

### aws-cdk-lib » aws-cognito
https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cognito-readme.html



#### AWS CDK Commands
* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk bootstrap`   Integrate your project with your AWS account, create bucket, role, policy and host a docker enviroment
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk list`        display all stack registered from App
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
* `cdk destroy`     remove all stacks from CloudFormation template


### In case of docker showing issue
```
rm  ~/.docker/config.json
``` 


### Authorization
```
email: rmc3408@protonmail.com
name: Raphael
password: secret123
password Admin: Secret123
```

**pre-made UI links** 

- ClientID for WEB = 3d9e0bvqp559iufraihj8c62h4
- ClientID for MOBILE = 1bj6ap4g5p82vsubv0foj32177
- ClientID for ADMIN = 23a1djbhk3plpnn47b9dm152ar
</br></br>OBS: token will receive in query parameters

</br>

[SIGN UP](https://rmc-customer.auth.us-east-1.amazoncognito.com/signup?client_id=3d9e0bvqp559iufraihj8c62h4&response_type=token&scope=customers%2Fweb&redirect_uri=https%3A%2F%2Fexample.com)

[LOGIN WEB](https://rmc-customer.auth.us-east-1.amazoncognito.com/login?client_id=3d9e0bvqp559iufraihj8c62h4&response_type=token&scope=customers%2Fweb&redirect_uri=https%3A%2F%2Fexample.com)




[LOGIN MOBILE](https://rmc-customer.auth.us-east-1.amazoncognito.com/login?client_id=1bj6ap4g5p82vsubv0foj32177&response_type=token&scope=customers%2Fweb&redirect_uri=https%3A%2F%2Fexample.com)

[LOGIN ADMIN](https://rmc-admin.auth.us-east-1.amazoncognito.com/login?client_id=23a1djbhk3plpnn47b9dm152ar&response_type=token&scope=customers%2Fadmin&redirect_uri=https%3A%2F%2Fexample.com)

