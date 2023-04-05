const Responses = require('../common/API_resp'); 
const S3 = require('../common/S3');

const bucketName = process.env.bucketName;

module.exports.user = async (event) => {
    console.log('event is ', event);

    if (!event.pathParameters || !event.pathParameters.fileName) {
        return Responses._400({ message: 'missing filename in URL path'})
    }

    let fileName = event.pathParameters.fileName;

    const data = JSON.parse(event.body);

    const newFile = await S3.write(data, fileName, bucketName).catch(() => {
        console.log('err in S3 write');
        return null;
    });

    if (!newFile) {
        return Responses._400({ message: 'Failed to write data in the new fileName'})
    } else {
        return Responses._200({ newFile });
    }
}

