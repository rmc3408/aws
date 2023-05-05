const Responses = require('../common/API_resp'); 
 
const data = {
    1: { name: 'Anna', age: 25, job: 'journalist' },
    2: { name: 'Chris', age: 52, job: 'teacher' },
    3: { name: 'Tom', age: 23, job: 'plastererd'},
}

module.exports.user = async (event) => {
    console.log('event is ', event);

    if (!event.pathParameters || !event.pathParameters.ID) {
        return Responses._400({ message: 'missing ID'})
    }

    let id = event.pathParameters.ID;

    if (data[id]) {
        return Responses._200(data[id]);
    }
    return Responses._400({ message: 'no ID in Data'})
}

