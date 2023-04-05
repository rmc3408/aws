const Responses = require('../common/API_resp');
const Dynamo = require('../common/dynamo');

const tableName = process.env.tableName;

exports.ws = async (event) => {
    console.log('event is ', event);

    const ID = event.requestContext.connectionId;

    try {
        await Dynamo.delete(ID, tableName);
        return Responses._200({ message: 'disconnected' });
    } catch (_error) {
        return Responses._400({ message: 'Failed to disconnect'})
    }
}
