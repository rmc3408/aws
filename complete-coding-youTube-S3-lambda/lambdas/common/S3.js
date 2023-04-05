const AWS = require('aws-sdk');

const s3Client = new AWS.S3();

const S3 = {
    async get(fileName, bucket) {
        const params = {
            Bucket: bucket,
            Key: fileName
        };
        let data = await s3Client.getObject(params).promise();

        if (!data) {
            throw Error(`There is an error in getting the new  File`)
        } else {
            if (fileName.slice(fileName.length - 4, fileName.length) === 'json') {
                data = data.Body.toString();
            }
            return data;
        }
    },
    async write(data, fileName, bucket) {
        const params = {
            Bucket: bucket,
            Body: JSON.stringify(data),
            Key: fileName
        };

        const newFile = await s3Client.putObject(params).promise();

        if (!newFile) {
            throw Error(`There is an error in writing the new  File`)
        } else {
            return newFile;
        }
    }
}
 
module.exports = S3;
