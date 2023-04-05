const serverless = require('serverless-http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const db = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const data = {
  name: "raphael",
  age: 40
};

app.get('/cars', (req, res) => {
  const params = {
    TableName: "cars"
  }

  try {
    const result = await db.scan(params).promise();
    res.status(200).json({ car: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
  
});

app.post('/cars', async (req, res) => {
  const data = req.body;
  const params = {
    TableName: "cars",
    Item: {
      id: uuidv4(),
      make: data.make,
      model: data.model,
      year: data.year
    }
  };
  
  try {
    await db.put(params).promise();
    res.status(201).json({ car: params.Item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch('/cars/:id', async (req, res) => {
  const data = req.body;
  const params = {
    TableName: "cars",
    Item: {
      id: data.id,
      make: data.make,
      model: data.model,
      year: data.year
    }
  };
  
  try {
    await db.put(params).promise();
    res.status(200).json({ car: params.Item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/cars/:id', async (req, res) => {
  const id = req.params.id;
  const params = {
    TableName: "cars",
    Key: {
      id
    }
  };
  
  try {
    await db.delete(params).promise();
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


module.exports.app = serverless(app);
