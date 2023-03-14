import { CognitoUserPool } from 'amazon-cognito-identity-js';
const POOL_DATA = {
  UserPoolId: 'us-east-1_QOvENGv8a',
  ClientId: '305glq7ohp4rnr92s5e81ejrsn'
}

export const userPool = new CognitoUserPool(POOL_DATA);
