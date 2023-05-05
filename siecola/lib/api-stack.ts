import { AuthorizationType, CognitoUserPoolsAuthorizer, JsonSchemaType, LambdaIntegration, LogGroupLogDestination, MethodLoggingLevel, MethodOptions, Model, RequestValidator, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

import { AccountRecovery, BooleanAttribute, DateTimeAttribute, NumberAttribute, OAuthScope, ResourceServerScope, StringAttribute, UserPool, VerificationEmailStyle } from 'aws-cdk-lib/aws-cognito'
import { Runtime } from 'aws-cdk-lib/aws-lambda'

interface ApiGatewayIntegrationProps extends StackProps {
  productsFetch: NodejsFunction;
  productsAdmin: NodejsFunction;
  eventsFetch: NodejsFunction;
  ordersFetch: NodejsFunction;
}

class ApiGatewayStack extends Stack {
  private authorizer: CognitoUserPoolsAuthorizer
  private adminAuthorizer: CognitoUserPoolsAuthorizer
  private customerPool: UserPool
  private adminPool: UserPool

  constructor(scope: Construct, id: string, props: ApiGatewayIntegrationProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, 'ApiGatewayLogs');
    const logApiDestiny = new LogGroupLogDestination(logGroup);

    const api = new RestApi(this, 'ApiGatewayRest-Stack', {
      restApiName: 'EcommerceApi',
      cloudWatchRole: true,
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        accessLogDestination: logApiDestiny,
      },
    });

    // Create UserPools and Authorizer before API Gateway Service
    const lambdaFnAuth = this.getlambdaTriggerFunctions()
    this.createCustomerUserPools(lambdaFnAuth)
    this.createAdminUserPools(lambdaFnAuth)
    this.createAuthorizer()

    // Create Resources and Methods for lambda function
    this.createProductService(props, api);
    this.createOrderServices(props, api);
    this.createEventsServices(props, api);
  }

  private createEventsServices(props: Pick<ApiGatewayIntegrationProps, 'eventsFetch'>, api: RestApi) {
    const eventsFetchIntegrated = new LambdaIntegration(props.eventsFetch);

    // GET - '/events?email=alex@gmail.com'
    // GET - '/event?email=alex@gmail.com&eventType=CREATED'
    const ordersResource = api.root.addResource('events')
    ordersResource.addMethod('GET', eventsFetchIntegrated, {
      requestValidator: new RequestValidator(this, "body-validator-fetch-event-stack", {
        restApi: api,
        requestValidatorName: "body-validator-fetch",
        validateRequestParameters: true,
      }),
      requestParameters: { 
        "method.request.querystring.email": true, 
        "method.request.querystring.eventType": false,
      },
    })
  }

  private createOrderServices(props: Pick<ApiGatewayIntegrationProps, 'ordersFetch'>, api: RestApi) {
    // Importing Lambda Functions to APIGateway
    const orderFecthIntegrated = new LambdaIntegration(props.ordersFetch);

    const ordersResource = api.root.addResource('orders');
    // GET - '/orders'
    // GET - '/orders?email=alex@gmail.com'
    // GET - '/orders?email=alex@gmail.com&orderId=123'
    ordersResource.addMethod('GET', orderFecthIntegrated);
    
    // DELETE - '/orders?email=alex@gmail.com&orderId=123'
    ordersResource.addMethod('DELETE', orderFecthIntegrated, {
      requestValidator: new RequestValidator(this, "body-validator-delete-stack", {
        restApi: api,
        requestValidatorName: "body-validator-delete",
        validateRequestParameters: true,
      }),
      requestParameters: { 
        "method.request.querystring.email": true, 
        "method.request.querystring.orderId": true
      },
    });
    // POST - '/orders'
    const postValidator = new RequestValidator(this, "order-body-validator-post-stack", {
      restApi: api,
      requestValidatorName: "order-body-validator-post",
      validateRequestBody: true,
    })
    const postModel = new Model(this, 'orderModelPost-stack', {
      modelName: 'ordermodelpost',
      restApi: api,
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          email: { type: JsonSchemaType.STRING },
          productIds: { type: JsonSchemaType.ARRAY, minItems: 1 },
          payment: { type: JsonSchemaType.STRING, enum: ["CASH", "DEBIT", "CREDIT" ]},
        },
        required: ["email", "productIds", "payment"]
      },
      
    })
    ordersResource.addMethod('POST', orderFecthIntegrated, {
      requestValidator: postValidator,
      requestModels: { "application/json": postModel },
    });
  }

  private createProductService(props: Pick<ApiGatewayIntegrationProps, 'productsAdmin' | 'productsFetch'>, api: RestApi) {
    // Importing Lambda Functions to APIGateway
    const productsFetchIntegrated = new LambdaIntegration(props.productsFetch);
    const productsAdminIntegrated = new LambdaIntegration(props.productsAdmin);
    
    const productsResource = api.root.addResource('products');

    const authMethodOptions_FULL: MethodOptions = {
      authorizer: this.authorizer,
      authorizationType: AuthorizationType.COGNITO,
      // authorizationScopes is array of string = ScopeServer Identifier + '/' + scopeName
      authorizationScopes: ['customers/web', 'customers/mobile', 'customer/admin']
    }

    const authMethodOptions_WEB: MethodOptions = {
      authorizer: this.authorizer,
      authorizationType: AuthorizationType.COGNITO,
      // authorizationScopes is array of string = ScopeServer Identifier + '/' + scopeName
      authorizationScopes: ['customers/web', 'customer/admin']
    }

    const adminMethodOptions: MethodOptions = {
      authorizer: this.adminAuthorizer,
      authorizationType: AuthorizationType.COGNITO,
      // authorizationScopes is array of string = ScopeServer Identifier + '/' + scopeName
      authorizationScopes: ['customers/admin']
    }


    // GET - '/products'
    productsResource.addMethod('GET', productsFetchIntegrated, authMethodOptions_FULL);
    
    // POST - '/products/'
    const postValidator = new RequestValidator(this, "product-body-validator-post-stack", {
      restApi: api,
      requestValidatorName: "product-body-validator-post",
      validateRequestBody: true,
    })
    const postProductModel = new Model(this, "productModelPost-stack", {
      restApi: api,
      contentType: "application/json",
      modelName: "productmodelpost",
      schema: {
        type: JsonSchemaType.OBJECT,
        properties: {
          productName: { type: JsonSchemaType.STRING },
          productUrl: { type: JsonSchemaType.STRING },
          model: { type: JsonSchemaType.STRING },
          code: { type: JsonSchemaType.STRING, minLength: 3 },
          price: { type: JsonSchemaType.NUMBER },
        },
        required: ["code", "productName"]
      }
    })
    productsResource.addMethod('POST', productsAdminIntegrated, {
      requestValidator: postValidator,
      requestModels: { "application/json": postProductModel },
      ...adminMethodOptions
    });

    const productIdResource = productsResource.addResource('{id}');
    // GET - '/products/{id}'
    productIdResource.addMethod('GET', productsFetchIntegrated, authMethodOptions_WEB);
    // PUT - '/products/{id}'
    productIdResource.addMethod('PUT', productsAdminIntegrated, adminMethodOptions);
    // DELETE - '/products/{id}'
    productIdResource.addMethod('DELETE', productsAdminIntegrated, adminMethodOptions);
  }

  private createCustomerUserPools(lambdaFnAuth: Record<string, NodejsFunction>) {

    this.customerPool = new UserPool(this, 'CustomerPool', {
      userPoolName: 'Customer',
      removalPolicy: RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      autoVerify: { email: true, phone: false },
      userVerification: { 
        emailSubject: "Verify your email", 
        emailBody: 'Thansk for signUP, verification code is {####}',
        emailStyle: VerificationEmailStyle.CODE
      },
      signInAliases: { email: true, phone: false, username: false },
      standardAttributes: { fullname: { required: true, mutable: false }},
      passwordPolicy: { minLength: 6, requireDigits: true },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      customAttributes: {
        'jobPosition': new StringAttribute({ minLen: 6, maxLen: 15, mutable: false }),
        'age': new NumberAttribute({ min: 0, max: 120, mutable: true }),
        'isEmployee': new BooleanAttribute({ mutable: true }),
        'joinedOn': new DateTimeAttribute(),
      },
      lambdaTriggers: {
        preAuthentication: lambdaFnAuth.preAuth,
        postAuthentication: lambdaFnAuth.posAuth,
        postConfirmation: lambdaFnAuth.postConfirm
      }
    })

    this.customerPool.addDomain('CustomerDomain', {
      cognitoDomain: {
        domainPrefix: 'rmc-customer',
      }
    })

    const webScope = new ResourceServerScope({ scopeName: 'web', scopeDescription: 'WEB read-only' });
    const mobileScope = new ResourceServerScope({ scopeName: 'mobile', scopeDescription: 'Mobile read-only' });
    
    const serverWith_Scopes = this.customerPool.addResourceServer('ResourceServer', {
      identifier: 'customers',
      userPoolResourceServerName: 'CustomerServer',
      scopes: [ webScope, mobileScope ],
    })

    this.customerPool.addClient('web-client', {
      userPoolClientName: 'customerWEB',
      authFlows: { userPassword: true },
      accessTokenValidity: Duration.minutes(30),
      refreshTokenValidity: Duration.days(30),
      oAuth: { scopes: [ OAuthScope.resourceServer(serverWith_Scopes, webScope) ]}
    })

    this.customerPool.addClient('mobile-client', {
      userPoolClientName: 'customerMobile',
      authFlows: { userPassword: true },
      accessTokenValidity: Duration.minutes(30),
      refreshTokenValidity: Duration.days(30),
      oAuth: { scopes: [ OAuthScope.resourceServer(serverWith_Scopes, mobileScope) ]}
    })
  }

  private createAdminUserPools(lambdaFnAuth: Record<string, NodejsFunction>) {

    this.adminPool = new UserPool(this, 'AdminPool', {
      userPoolName: 'Admin',
      selfSignUpEnabled: false,
      removalPolicy: RemovalPolicy.DESTROY,
      userInvitation: {
        emailSubject: 'Welcome Admin',
        emailBody: 'Your userName is {username} and password is {####}'
      },
      signInAliases: { email: true },
      passwordPolicy: { minLength: 6, requireDigits: true },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      lambdaTriggers: {
        postConfirmation: lambdaFnAuth.postConfirm
      }
    })

    this.adminPool.addDomain('AdminDomain', {
      cognitoDomain: {
        domainPrefix: 'rmc-admin',
      }
    })

    const adminScope = new ResourceServerScope({ scopeName: 'admin', scopeDescription: 'Full Access' });
    
    const serverWith_Scopes = this.adminPool.addResourceServer('ResourceServer', {
      identifier: 'customers',
      userPoolResourceServerName: 'AdminServer',
      scopes: [ adminScope ],
    })

    this.adminPool.addClient('web-client', {
      userPoolClientName: 'adminWEB',
      authFlows: { userPassword: true },
      accessTokenValidity: Duration.minutes(45),
      refreshTokenValidity: Duration.days(30),
      oAuth: { scopes: [ OAuthScope.resourceServer(serverWith_Scopes, adminScope) ]}
    })
  }

  private createAuthorizer() {
    this.authorizer = new CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      authorizerName: 'Fetch Authorizer',
      cognitoUserPools: [this.customerPool, this.adminPool]
    })

    this.adminAuthorizer = new CognitoUserPoolsAuthorizer(this, 'AdminAuthorizer', {
      authorizerName: 'Create Authorizer',
      cognitoUserPools: [this.adminPool]
    })
  }

  private getlambdaTriggerFunctions(): Record<string, NodejsFunction> {

    const postConfirmFunction = new NodejsFunction(this, "PostConfirmFunction-Stack", {
      functionName: 'postConfirmFunction',
      runtime: Runtime.NODEJS_16_X,
      entry: "lambda/auth/postConfirm.ts",
      handler: "handler",
    })

    const preAuthFunction = new NodejsFunction(this, "PreAuthenticationFunction-Stack", {
      functionName: 'preAuthFunction',
      runtime: Runtime.NODEJS_16_X,
      entry: "lambda/auth/preAuth.ts",
      handler: "handler",
    })

    const posAuthFunction = new NodejsFunction(this, "PosAuthenticationFunction-Stack", {
      functionName: 'posAuthFunction',
      runtime: Runtime.NODEJS_16_X,
      entry: "lambda/auth/posAuth.ts",
      handler: "handler",
    })

    return { 
      postConfirm: postConfirmFunction,
      posAuth: posAuthFunction,
      preAuth: preAuthFunction,
    }
  }
}

export default ApiGatewayStack;
