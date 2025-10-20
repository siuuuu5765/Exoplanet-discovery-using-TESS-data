
// components/Chatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToChatbot } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { ChatIcon, CloseIcon, SendIcon } from './Icons';
import Markdown from 'react-markdown';

// FIX: Implement the Chatbot UI component for user interaction.
const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseContent = await sendMessageToChatbot(input, messages);
            const modelMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', content: responseContent };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { id: (Date.now() + 1).toString(), role: 'system', content: 'Sorry, I encountered an error.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-accent-magenta text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-110 transition-transform"
                aria-label="Toggle Chatbot"
            >
                {isOpen ? <CloseIcon className="w-8 h-8" /> : <ChatIcon className="w-8 h-8" />}
            </button>
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 h-[28rem] bg-space-blue/80 backdrop-blur-md rounded-lg shadow-2xl flex flex-col z-50 animate-fade-in-up">
                    <header className="bg-space-light/50 p-3 text-center font-bold text-lg text-accent-cyan">
                        TESS-a Assistant
                    </header>
                    <div className="flex-1 p-3 overflow-y-auto space-y-3">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                                    msg.role === 'user' ? 'bg-accent-cyan text-space-dark' : 'bg-space-light text-gray-200'
                                }`}>
                                   <Markdown>{msg.content}</Markdown>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex justify-start">
                                <div className="p-2 rounded-lg bg-space-light text-gray-200 text-sm">
                                    <div className="typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                         )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 border-t border-space-light flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                            placeholder="Ask about the results..."
                            className="flex-1 bg-space-dark p-2 rounded-l-md border-0 focus:ring-1 focus:ring-accent-magenta outline-none"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading} className="bg-accent-magenta p-2 rounded-r-md">
                            <SendIcon className="w-5 h-5 text-white"/>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
