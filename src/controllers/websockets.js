import { saveConnectionId } from "../db/websockets.js";

export const handleConnect = async (event) => {
    try {
        const playerId = event.queryStringParameters.playerId;
        const connectionId = event.requestContext.connectionId;
        const socketUrl = event.headers.Host;
        const stage = event.requestContext.stage;
        
        if (!playerId) {
            return {
                statusCode: 400,
                body: 'Error: missing playerId'
            };
        }

        let createdConnection = await saveConnectionId(playerId, connectionId, socketUrl, stage);
        console.log({createdConnection});

        if(!createdConnection) {
            return false
        }

        return {
            message: "WebSocket connection established successfully.", 
            ...createdConnection
        };
    } catch (error) {
        return false
    }
}

// TODO: handle disconnect

