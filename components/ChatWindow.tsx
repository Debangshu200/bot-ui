
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { sendMessageToBot, sendEventToBot } from '../services/botpressService';
import MessageBubble from './Message';
import ChatInput from './ChatInput';
import { BOTPRESS_BOT_ID } from '../constants';

const ChatWindow: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [userId, setUserId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Generate a unique user ID for the session
        const newUserId = `local-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        setUserId(newUserId);
        
        // Fetch welcome message from bot on initial load
        const fetchWelcomeMessage = async (uid: string) => {
            try {
                // Try sending a simple text message first instead of an event
                const response = await sendMessageToBot(uid, 'Hello');
                const botMessages = response.actions
                    .filter(action => action.type === 'text' && action.text)
                    .map(action => ({
                        id: `bot-${Date.now()}-${Math.random()}`,
                        text: action.text,
                        sender: 'bot' as const,
                    }));
                setMessages(botMessages);
            } catch (error) {
                console.error("Error fetching welcome message:", error);
                setMessages([{
                    id: 'error-welcome',
                    text: 'Could not connect to the bot. Is it running?',
                    sender: 'bot',
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchWelcomeMessage(newUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !userId) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            text,
            sender: 'user',
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await sendMessageToBot(userId, text);
            const botMessages = response.actions
                .filter(action => action.type === 'text' && action.text)
                .map(action => ({
                    id: `bot-${Date.now()}-${Math.random()}`,
                    text: action.text,
                    sender: 'bot' as const,
                }));

            if (botMessages.length > 0) {
                setMessages(prev => [...prev, ...botMessages]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                text: "Sorry, I couldn't get a response from the bot.",
                sender: 'bot',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            <header className="bg-gray-900 p-4 border-b border-gray-700 shadow-md">
                <h1 className="text-xl font-bold text-center text-cyan-400">Botpress Test Client</h1>
                <p className="text-xs text-center text-gray-400 truncate">Bot ID: {BOTPRESS_BOT_ID}</p>
            </header>
            <main className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-700 rounded-lg rounded-bl-none p-3 max-w-md">
                            <div className="flex items-center space-x-2">
                                <span className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 bg-cyan-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-4 border-t border-gray-700">
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </footer>
        </div>
    );
};

export default ChatWindow;
