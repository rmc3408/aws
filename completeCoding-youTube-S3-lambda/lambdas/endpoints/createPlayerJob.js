const Responses = require('../common/API_resp'); 
const Dynamo = require('../common/dynamo');

const tableName = process.env.tableName;

module.exports.user = async (event) => {
    console.log('event is ', event);

    if (!event.pathParameters || !event.pathParameters.ID) {
        return Responses._400({ message: 'missing ID in URL path'})
    }

    let ID = event.pathParameters.ID;

    const user = JSON.parse(event.body);
    user.ID = ID;

    const newUser = await Dynamo.write(user, tableName).catch(() => {
        console.log('err in dynamo write');
        return null;
    });

    if (!newUser) {
        return Responses._400({ message: 'Failed to write user'})
    } else {
        return Responses._200({ newUser });
    }
}

