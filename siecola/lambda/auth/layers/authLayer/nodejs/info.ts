import { APIGatewayEventDefaultAuthorizerContext } from "aws-lambda";
import { CognitoIdentityServiceProvider } from "aws-sdk";

class AuthInfoService {
  private cognito: CognitoIdentityServiceProvider
  constructor(cognito: CognitoIdentityServiceProvider) {
    this.cognito = cognito
  }
  
  async getUserInfo(authorizer: APIGatewayEventDefaultAuthorizerContext): Promise<string> {
    const userPoolId = authorizer?.claims.iss.split("amazonaws.com/")[1]
    const username = authorizer?.claims.username

    const user = await this.cognito.adminGetUser({
       UserPoolId: userPoolId,
       Username: username
    }).promise()

    const email = user.UserAttributes?.find(attribute => attribute.Name === 'email')
    if (email?.Value) {
       return email.Value
    } else {
       throw new Error("Email not found")
    }
  }
  
  isAdminUser(authorizer: APIGatewayEventDefaultAuthorizerContext): boolean {
    return authorizer?.claims.scope.startsWith("admin")
  }
}

export default AuthInfoService;
