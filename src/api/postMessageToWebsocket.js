import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { getConnectionData } from "../db/websockets.js";

export const handler = async (event, context, callback) => {
    console.log(event);
    const { Records } = event;

    if (Records && Records.length > 0) {
        Promise.all(Records.map(async (record) => {
            try {
                // Process each DynamoDB stream record (new item added to the table)
                const newItem = record.dynamodb.NewImage;
                console.log('New Item:', newItem);
    
                // get connection data for destinationPlayerId
                let connectionData = await getConnectionData(newItem.destinationPlayerId.S);
                console.log({connectionData});

                // send message to the right connection (create new lambda for it??)
                let destinationUrl = `https://${connectionData.socketUrl}/${connectionData.stage}`;
                await postMessageTo(destinationUrl, connectionData.connectionId, newItem.message.S);
                return true;
            } catch (error) {
                console.error('Error processing record:', error);
                return false;
            }
        }))

        callback(null, `Successfully processed ${event.Records.length} records.`);
    } else {
        res.status(400).send('Invalid DynamoDB Stream Event');
    }
}

export const postMessageTo = async (socketUrl, connectionId, message) => {
    try {
        console.log(`Posting message to: ${socketUrl}, connectionId: ${connectionId}`);
        const apiGatewayClient = new ApiGatewayManagementApiClient({
            endpoint: socketUrl
        });

        await apiGatewayClient.send(new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: JSON.stringify({ message })
        }));

        console.log(`Message sent to connection ID: ${connectionId}`);
        return true;
    } catch (error) {
        console.error(`Error sending message to connection ID ${connectionId}: ${error.message}`);
        return false;
    }
}