const { DynamoDB } = require('aws-sdk');
const aws = require('aws-sdk');

const docClient = new DynamoDB.DocumentClient();

const Dynamo = {
    async get(id, table) {

        const params = {
            TableName: table,
            Key: {
                ID: id
            }
        }
        const dataRetrieved = await docClient.get(params).promise();
        
        if (!dataRetrieved || !dataRetrieved.Item) {
            throw Error(`There is an error in data ID = ${id} from ${table}`)
        } else {
            return dataRetrieved.Item;
        }
    },
    async write(data, table) {

        if (!data.ID) throw Error('no ID on the data')

        const params = {
            TableName: table,
            Item: data
        }
        const dataRetrieved = await docClient.put(params).promise();
        
        if (!dataRetrieved) {
            throw Error(`There is an error in data ID = ${data[ID]} from ${table}`)
        } else {
            return dataRetrieved;
        }
    }
}

module.exports = Dynamo;