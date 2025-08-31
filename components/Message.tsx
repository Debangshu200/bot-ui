
import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
    message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.sender === 'user';
    
    const bubbleClasses = isUser
        ? 'bg-cyan-600 text-white rounded-br-none self-end'
        : 'bg-gray-700 text-gray-200 rounded-bl-none self-start';
        
    const containerClasses = isUser ? 'flex justify-end' : 'flex justify-start';

    return (
        <div className={containerClasses}>
            <div className={`p-3 rounded-lg max-w-lg shadow-md ${bubbleClasses}`}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
            </div>
        </div>
    );
};

export default MessageBubble;
