import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import crypto from "node:crypto"

const MESSAGES_TABLE = process.env.MESSAGES_TABLE;

const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

export const saveNewMessage = async (message, srcPlayerId, destinationPlayerId) => {    
    try {
        let messageId = crypto.randomUUID()
        let Item = {
            messageId,
            message,
            srcPlayerId,
            destinationPlayerId
        }
        const params = {
            TableName: MESSAGES_TABLE,
            Item
        };

        await dynamoDbClient.send(new PutCommand(params));
        return Item;
    } catch (error) {
        console.log(error);
        return false;
    }
}