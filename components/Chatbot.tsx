// components/Chatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import type { VerifiedSystemProfile } from '../types';
import { getChatbotResponse } from '../services/geminiService';
import { SendIcon } from './Icons';
import ReactMarkdown from 'react-markdown';

type Message = {
    role: 'user' | 'model';
    parts: { text: string }[];
};

interface ChatbotProps {
    profile: VerifiedSystemProfile;
}

const Chatbot: React.FC<ChatbotProps> = ({ profile }) => {
    const [history, setHistory] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the bottom of the chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);

    const handleSendMessage = async () => {
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: Message = { role: 'user', parts: [{ text: userInput }] };
        const newHistory = [...history, newUserMessage];
        setHistory(newHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            const botResponseText = await getChatbotResponse(profile, newHistory, userInput);
            const newBotMessage: Message = { role: 'model', parts: [{ text: botResponseText }] };
            setHistory([...newHistory, newBotMessage]);
        } catch (error) {
            const errorMessage: Message = {
                role: 'model',
                parts: [{ text: "Sorry, I encountered an error. Please try again." }],
            };
            setHistory([...newHistory, errorMessage]);
            console.error("Chatbot error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-[500px] bg-space-dark/30 rounded-lg border border-space-light/50 p-4">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-2 space-y-4">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                            msg.role === 'user' 
                                ? 'bg-accent-magenta/80 text-white' 
                                : 'bg-space-blue text-gray-200'
                        }`}>
                            <div className="prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-2 rounded-lg bg-space-blue">
                             <div className="typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4 flex">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask a question about this system..."
                    className="flex-1 bg-space-blue p-2 rounded-l-md border-0 focus:ring-2 focus:ring-accent-cyan outline-none"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !userInput.trim()}
                    className="bg-accent-cyan text-space-dark font-bold p-2 rounded-r-md hover:bg-accent-cyan/80 transition-colors disabled:opacity-50"
                >
                    <SendIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
