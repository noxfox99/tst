'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '@/lib/ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi I'm the Micro SaaS AI Chatbot, how can I help you?",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get chatbot response
      const response = await getChatbotResponse(input);
      
      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card flex flex-col h-64">
      <h2 className="text-2xl font-semibold mb-4 text-light-slate">AI Assistant</h2>
      
      <div className="flex-1 overflow-auto mb-4 space-y-4 bg-deep-blue rounded-md p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`${
              message.sender === 'user' ? 'ml-auto bg-light-blue' : 'mr-auto bg-slate-blue/30'
            } rounded-lg p-3 max-w-xs md:max-w-md`}
          >
            <p className="text-sm text-light-slate">{message.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto bg-slate-blue/30 rounded-lg p-3">
            <p className="text-sm text-light-slate">Thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          className="input-field flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}