import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, PutCommand, GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const SOCKETS_TABLE = process.env.SOCKETS_TABLE;

const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

export const getConnectionData = async(playerId) => {
    try {
        const params = {
            TableName: SOCKETS_TABLE,
            Key: {
                playerId
            },
        };
        const { Item } = await dynamoDbClient.send(new GetCommand(params));
        if (Item) {
            const { playerId, socketUrl, connectionId, stage } = Item;
            return { playerId, socketUrl, connectionId, stage };
        } else {
            return false;
        }
    } catch (error) {
        
    }
}

export const saveConnectionId = async (playerId, connectionId, socketUrl, stage) => {
    try {
        const params = {
            TableName: SOCKETS_TABLE,
            Item: {
                playerId,
                connectionId,
                socketUrl,
                stage
            },
        };
    
        await dynamoDbClient.send(new PutCommand(params));
        return {playerId, connectionId, socketUrl, stage}
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const removeConnectionId = async (playerId) => {
    try {
        const params = {
            TableName: SOCKETS_TABLE,
            Key: {
                playerId: { S: playerId }
            },
        };

        await dynamoDbClient.send(new DeleteCommand(params));
        console.log(`Item with playerId ${playerId} removed successfully from the database.`);
        return true;
    } catch (error) {
        console.error(`Error removing item with playerId ${playerId} from the database: ${error.message}`);
        return false;
    }
};