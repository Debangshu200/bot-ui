
import React, { useState } from 'react';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isLoading: boolean;
}

const SendIcon: React.FC<{className: string}> = ({className}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);


const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isLoading) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                autoComplete="off"
            />
            <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-cyan-600 text-white p-3 rounded-full hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 transition-colors duration-200"
                aria-label="Send message"
            >
                <SendIcon className="w-5 h-5" />
            </button>
        </form>
    );
};

export default ChatInput;
