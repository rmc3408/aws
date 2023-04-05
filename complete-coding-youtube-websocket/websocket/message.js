const Responses = require("../common/API_resp");
const Dynamo = require("../common/dynamo");
const AWS = require("aws-sdk");

const tableName = process.env.tableName;

exports.ws = async (event) => {
  console.log("event is ", event);

  const { connectionId, stage, domainName } = event.requestContext;
  const bodyMsg = JSON.parse(event.body);

  const record = await Dynamo.get(connectionId, tableName);
  const { messages: messagesArray } = record;
  messagesArray.push(bodyMsg.message);

  const newRecord = {
    ...record, //contains ID, date
    messages: messagesArray,
  };

  await Dynamo.write(newRecord, tableName);

  const apiEndSend = new AWS.ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`,
  });

  await apiEndSend
    .postToConnection({
      ConnectionId: connectionId,
      Data: "message received successfully",
    })
    .promise();

  return Responses._200({ message: "connected" });
};
