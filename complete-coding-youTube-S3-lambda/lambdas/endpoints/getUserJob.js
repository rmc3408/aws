const Responses = require('../common/API_resp'); 
const Dynamo = require('../common/dynamo');

const tableName = process.env.tableName;

module.exports.user = async (event) => {
    console.log('event is ', event);

    if (!event.pathParameters || !event.pathParameters.ID) {
        return Responses._400({ message: 'missing ID in URL path'})
    }

    let id = event.pathParameters.ID;
    const user = await Dynamo.get(id, tableName).catch((err) => {
        console.log('error in DynamoGet', err)
        return null;
    })

    if (!user) {
        return Responses._400({ message: 'Failed to get user'})
    } else {
        return Responses._200({ user });
    }
}

