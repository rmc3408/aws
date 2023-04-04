import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import OrderEventRepository from '/opt/node/orderEventRepositoryLayer';
import { OrderEventType } from '/opt/node/orderEventLayer';

const eventsTableNameEnviroment = process.env.ORDER_EVENTS_DATABASE!;
const dynamoDBClient = new DynamoDB.DocumentClient();
const eventRepoInstance = new OrderEventRepository(dynamoDBClient, eventsTableNameEnviroment);

export async function eventsFetchHandler(event: APIGatewayProxyEvent, ctx: Context): Promise<APIGatewayProxyResult> {
  console.log('FROM SNS Event', event);

  if (event.httpMethod == 'GET' && event.resource == '/events' && event.queryStringParameters !== null) {
    const email = event.queryStringParameters.email!;
    const eventType = event.queryStringParameters.eventType as OrderEventType | undefined

    if (!eventType) {
      const result = await eventRepoInstance.getEventByEmail(email);
      return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ message: `Get EVENT by ${email}`, data: result }),
      };
    } 
    if (eventType) {
      const result = await eventRepoInstance.getEventByEmailAndEventType(email, eventType);
      return {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ message: `Get EVENT by ${email}`, data: result }),
      };
    }
  }

  return {
    statusCode: 400,
    headers: {},
    body: JSON.stringify({ message: 'no events found in this endpoint' }),
  };
}
