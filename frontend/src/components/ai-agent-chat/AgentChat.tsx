import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Upload, 
  MoreHorizontal,
  Clock,
  Heart,
  Smile,
  Frown,
  Meh,
  Loader2
} from 'lucide-react';
import { Agent } from './AIAgentChatTab';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  delay?: number;
  confidence?: number;
}

interface AgentChatProps {
  agent: Agent;
  onBack: () => void;
}

const AgentChat: React.FC<AgentChatProps> = ({ agent, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize chat session
    initializeChat();
  }, [agent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    try {
      const response = await fetch('/api/agent-chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agent.id,
          userId: 'user_' + Date.now() // Simple user ID
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSessionId(data.sessionId);
        
        // Add initial greeting
        const greetingMessage: Message = {
          id: 'greeting',
          role: 'assistant',
          content: data.firstMessage,
          timestamp: new Date(),
          emotion: 'friendly',
          confidence: 0.9
        };
        
        setMessages([greetingMessage]);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !sessionId || isTyping) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/agent-chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: inputValue
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Wait for the calculated delay
        setTimeout(() => {
          const agentMessage: Message = {
            id: `agent_${Date.now()}`,
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
            emotion: data.emotion,
            delay: data.delay,
            confidence: data.confidence
          };
          
          setMessages(prev => [...prev, agentMessage]);
          setIsTyping(false);
        }, data.delay || 1000);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I had trouble understanding that. Could you try again?',
        timestamp: new Date(),
        emotion: 'confused',
        confidence: 0.3
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle file upload
      console.log('File uploaded:', file.name);
    }
  };

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion) {
      case 'excited':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'confused':
        return <Frown className="w-4 h-4 text-yellow-500" />;
      case 'frustrated':
        return <Frown className="w-4 h-4 text-orange-500" />;
      case 'friendly':
        return <Smile className="w-4 h-4 text-green-500" />;
      default:
        return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPersonalityTraits = () => {
    return agent.personality_traits.slice(0, 3).join(', ');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Back to agents"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <img
              src={agent.avatar_url}
              alt={agent.name}
              className="w-12 h-12 rounded-full border-2 border-gray-200"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
              <p className="text-sm text-gray-500">
                {agent.age} years old • {agent.occupation} • {agent.category}
              </p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center space-x-2">
            <div className="text-xs text-gray-500">
              {getPersonalityTraits()}
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.role === 'assistant' && (
                  <img
                    src={agent.avatar_url}
                    alt={agent.name}
                    className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-1">
                      {message.emotion && getEmotionIcon(message.emotion)}
                      {message.confidence && (
                        <span className="text-xs opacity-75">
                          {Math.round(message.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    <span className="text-xs opacity-75">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <img
                  src={agent.avatar_url}
                  alt={agent.name}
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">Agent is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Upload file"
          >
            <Upload className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept="*/*"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${agent.name}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isTyping}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;



