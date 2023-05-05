const Responses = require('../common/API_resp'); 
const AWS = require('aws-sdk');

const SES = new AWS.SES();

module.exports.handler = async (event) => {
    console.log('event is ', event);

    const { to, from, subject, text } = JSON.parse(event.body);

    if (!to || !from || !subject || !text) {
        return Responses._400({ message: 'Missing info in the email' });
    }

    const params = { 
        Source: from, 
        Destination: { 
          ToAddresses: [
            to 
          ],
        },
        Message: {
          Subject: {
            Data: subject
          },
          Body: {
            Text: {
              Data: text
            }
          }
        }
    };
    
    try {
        await SES.sendEmail(params).promise();
        return Responses._200({ message: "Sent" });
    } catch (error) {
        console.log('error sending email', error);
        return Responses._400({ message: "Email Failed Sent" });
    }
   
}