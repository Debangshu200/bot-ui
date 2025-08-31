
import { BOTPRESS_BOT_ID, BOTPRESS_WEBHOOK_URL } from '../constants';
import { BotpressConverseResponse } from '../types';

const CONVERSE_API_URL = `${BOTPRESS_WEBHOOK_URL}/api/v1/bots/${BOTPRESS_BOT_ID}/converse`;

interface ConversePayload {
    type: 'text' | 'event';
    text?: string;
    payload?: Record<string, unknown>;
}

export const sendMessageToBot = async (userId: string, message: string): Promise<BotpressConverseResponse> => {
    const payload: ConversePayload = {
        type: 'text',
        text: message,
    };
    return await converse(userId, payload);
};

export const sendEventToBot = async (userId: string, eventName: string, eventPayload: Record<string, unknown> = {}): Promise<BotpressConverseResponse> => {
    const payload: ConversePayload = {
        type: 'event',
        payload: {
            type: eventName,
            ...eventPayload,
        },
    };
    return await converse(userId, payload);
};


const converse = async (userId: string, payload: ConversePayload): Promise<BotpressConverseResponse> => {
    try {
        const response = await fetch(`${CONVERSE_API_URL}/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Botpress API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        
        return await response.json() as BotpressConverseResponse;
    } catch (error) {
        console.error("Failed to communicate with Botpress:", error);
        // Return a custom error response that the UI can display
        return {
            actions: [{
                type: 'text',
                text: `Error connecting to the bot. Please check the console and ensure your bot is running at ${BOTPRESS_WEBHOOK_URL}.`
            }]
        };
    }
};
