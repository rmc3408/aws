import { Callback, Context, PostAuthenticationTriggerEvent } from "aws-lambda";

export async function handler(event: PostAuthenticationTriggerEvent, context: Context, callback: Callback): Promise<void> {

  console.log('USER ATTRIBUTES', event.request.userAttributes);
  console.log('USERNAME', event.userName);
  console.log('CONTEXT', context);
  console.log('EVENT', event);
  
  callback(null, event)
}