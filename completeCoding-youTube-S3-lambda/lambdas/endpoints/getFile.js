const Responses = require('../common/API_resp'); 
const S3 = require('../common/S3');

const bucketName = process.env.bucketName;

module.exports.user = async (event) => {
    console.log('event is ', event);

    if (!event.pathParameters || !event.pathParameters.fileName) {
        return Responses._400({ message: 'missing filename in URL path'})
    }

    let fileName = event.pathParameters.fileName;

    // for POST operation
    // const data = JSON.parse(event.body);

    const Files = await S3.get(fileName, bucketName).catch(() => {
        console.log('err in S3 get');
        return null;
    });

    if (!Files) {
        return Responses._400({ message: 'Failed to get data in the new fileName'})
    } else {
        return Responses._200({ Files });
    }
}

