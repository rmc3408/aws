const Responses = require('../common/API_resp');
const Dynamo = require('../common/dynamo');

const tableName = process.env.tableName;

exports.ws = async (event) => {
    console.log('event is ', event);

    const { connectionId, domainName, stage } = event.requestContext;

    const data = {
        connectionId,
        date: "222",
        messages: [],
        domainName,
        stage
    }

    try {
        await Dynamo.write(data, tableName)
        return Responses._200({ message: 'connected' });
    } catch (_error) {
        return Responses._400({ message: 'Failed to connect to the database'})
    }
}

