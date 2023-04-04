import { Context, SNSMessage, SQSEvent } from 'aws-lambda';
import { SES } from 'aws-sdk';
import { captureAWS } from 'aws-xray-sdk';
import { Envelope } from '/opt/node/orderEventLayer';

captureAWS(require('aws-sdk'));

const sesClient = new SES();
const SES_EMAIL_TO = 'rmc3408@protonmail.com';
const SES_EMAIL_FROM = 'molinaro.raphael@gmail.com';

export async function eventsEmailHandler(event: SQSEvent, ctx: Context): Promise<void> {
  console.log('FROM SNS -> SQS (batch) -> LAMBDA ');

  let listPromises: any[] = []
  event.Records.forEach((record) => {
    const bodyMail: SNSMessage = JSON.parse(record.body)
    const event: Envelope = JSON.parse(bodyMail.Message)
    const sent = sendEmail(event)
    listPromises.push(sent)
  })
  await Promise.all(listPromises)
}

async function sendEmail(event: Envelope) {
  const emailParams = {
    Destination: {
      ToAddresses: [SES_EMAIL_TO],
    },
    Source: SES_EMAIL_FROM,
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: getHtmlContent(event),
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Order Processed`,
      },
    },
    
  };

  return await sesClient.sendEmail(emailParams).promise();
}

function getHtmlContent(event: Envelope) {
  return `
    <html>
      <body>
        <h1>📬 Received an Email 📬</h1>
        <h2>Sent From: <b>${SES_EMAIL_FROM}</b></h2>
        <h2>Sent to: <b>${SES_EMAIL_TO}</b></h2>
        <p style="font-size:16px">${event.eventType} to ${event.data.email}</p>
        <ul>
          <li style="font-size:18px">👤 <b>Order number ${event.data.orderId}</b></li>
          <li style="font-size:18px">✉️ <b>Total price ${event.data.billing.totalPrice}</b></li>
          <li style="font-size:18px">✉️ <b>Total Products ${event.data.productCode.length} products</b></li>
          <li style="font-size:18px">✉️ <b>Ship with ${event.data.shipping.carrier}</b></li>
        </ul>
      </body>
    </html> 
  `;
}



