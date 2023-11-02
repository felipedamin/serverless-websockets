import { saveNewMessage } from "../db/messages.js";

export const handleNewMessage = async (data) => {
    try {
        const message = data.message;
        const srcPlayerId = data.playerId;
        const destinationPlayerId = data.destinationPlayerId;
        
        if (typeof message !== "string"
            || typeof srcPlayerId !== "string"
            || typeof destinationPlayerId !== "string"
        ) {
            return {
                statusCode: 400,
                body: 'Invalid fields'
            };
        }

        let savedMessage = await saveNewMessage(message, srcPlayerId, destinationPlayerId);

        if(!savedMessage) {
            return {
                statusCode: 500,
                body: 'Something went wrong'
            }
        }

        return savedMessage;

    } catch (error) {
        return {
            statusCode: 500,
            body: 'Something went wrong'
        }
    }
}