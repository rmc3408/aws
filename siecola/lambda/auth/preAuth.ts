import { Callback, Context, PreAuthenticationTriggerEvent } from "aws-lambda";

export async function handler(event: PreAuthenticationTriggerEvent, context: Context, callback: Callback): Promise<void> {

  console.log('USER ATTRIBUTES', event.request.userAttributes);
  console.log('USERNAME', event.userName);
  console.log('CONTEXT', context);
  console.log('EVENT', event);
  
  callback(null, event)
}