import json
import boto3
import os


def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    order = json.loads(event['body'])
    table_name = os.environ.get('ORDERS_TABLE')

    new_table = dynamodb.Table(table_name)
    new_table.put_item(TableName=table_name, Item=order)

    return {
        "statusCode": 201,
        'headers': {},
        "body": json.dumps({
            "message": "Order Created",
            "data posted": order
        }),
    }
