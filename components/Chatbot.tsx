
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createChat } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { ChatIcon, CloseIcon, SendIcon } from './Icons';
import type { Chat } from '@google/genai';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = createChat();
    
    const addInitialMessage = async () => {
        setIsLoading(true);
        try {
            const response = await chatSessionRef.current?.sendMessageStream({ message: "Hello!" });
            let text = '';
            if (response) {
                for await (const chunk of response) {
                    text += chunk.text;
                }
            }
            setMessages([{ id: Date.now(), sender: 'bot', text: text || 'Hello! How can I help you explore the cosmos today?' }]);
        } catch (error) {
            console.error("Failed to get initial greeting:", error);
            setMessages([{ id: Date.now(), sender: 'bot', text: 'Hello! I seem to be having trouble connecting. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    }
    
    addInitialMessage();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatSessionRef.current) return;

    const userMessage: ChatMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const botMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botMessageId, sender: 'bot', text: '' }]);
    
    try {
      const stream = await chatSessionRef.current.sendMessageStream({ message: input });
      for await (const chunk of stream) {
        setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: msg.text + chunk.text } : msg
        ));
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages(prev => prev.map(msg => 
          msg.id === botMessageId ? { ...msg, text: "I'm sorry, I encountered an error. Please try again." } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <>
      <div className={`fixed bottom-0 right-0 m-4 sm:m-8 z-50 transition-all duration-300 ${isOpen ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-accent-magenta text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform"
          aria-label="Open Chat"
        >
          <ChatIcon className="w-8 h-8" />
        </button>
      </div>

      <div
        className={`fixed bottom-0 right-0 mb-4 sm:mb-8 mr-4 sm:mr-8 z-50 w-[calc(100%-2rem)] sm:w-96 h-[70vh] max-h-[600px] bg-space-blue/80 backdrop-blur-lg border border-space-light rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <header className="flex items-center justify-between p-4 border-b border-space-light">
          <h3 className="font-bold text-lg text-accent-cyan font-display">AstroBot Assistant</h3>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close Chat">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-accent-magenta flex items-center justify-center font-bold text-sm flex-shrink-0">A</div>}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-accent-cyan text-space-dark rounded-br-none' : 'bg-space-light text-gray-200 rounded-bl-none'}`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}{isLoading && msg.id === messages[messages.length-1].id && <span className="inline-block w-1 h-4 bg-gray-400 ml-1 animate-pulse"></span>}</p>
                </div>
              </div>
            ))}
             <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-space-light flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about TESS..."
            className="flex-1 bg-space-dark border border-space-light rounded-full px-4 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent-magenta"
            disabled={isLoading}
          />
          <button type="submit" className="bg-accent-magenta text-white p-2 rounded-full disabled:opacity-50" disabled={isLoading}>
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
