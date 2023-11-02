import { handleConnect } from "../controllers/websockets.js";
import { handleNewMessage } from "../controllers/messages.js";

export const handler = async (event) => {
    try {
        console.log(event);
        const connectionId = event.requestContext.connectionId;
        const routeKey = event.requestContext.routeKey;

        // Perform authentication and/or validation here if needed
        
        let response = {
            statusCode: 200,
        };

        // Handle different event types using a switch/case statement
        switch (routeKey) {
            case '$connect':
                let createdConnection = await handleConnect(event)
                if (!createdConnection) {
                    response.statusCode = 500
                    response.message = "Something went wrong!"
                }
                else {
                    response.body = JSON.stringify(createdConnection);
                }
                console.log(response);
                break;
            case '$disconnect':
                // TODO: remove connectionID from DB
                console.log(`Connection disconnected: ${connectionId}`);
                response.body = 'Connection closed!';
                break;
            case 'sendmessage':
                const data = JSON.parse(event.body);
                console.log(`Received message: ${data.message}`);

                let newMessage = await handleNewMessage(data);

                if (!!newMessage.statusCode) {
                    // newMessage only has statusCode if something went wrong
                    response.statusCode = newMessage.statusCode
                }
                response.body = JSON.stringify({status: "Message sent!", ...newMessage});
                console.log(response);
                break;
            default:
                // Handle unknown event types
                response = {
                    statusCode: 400,
                    body: 'Invalid event type.'
                };
                break;
            }

        return response;
    } catch (error) {
        console.log(error);
    }
};