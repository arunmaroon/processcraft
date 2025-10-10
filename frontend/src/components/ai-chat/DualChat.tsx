import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Upload, 
  Smile, 
  MoreHorizontal,
  Bot,
  User,
  Clock,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Users,
  MessageSquare
} from 'lucide-react';
import { HumanAgent } from './AIChatTab';

interface Message {
  id: string;
  type: 'user' | 'agent1' | 'agent2' | 'system';
  content: string;
  timestamp: Date;
  emotion?: string;
  confidence?: number;
  metadata?: {
    agentId?: string;
    agentName?: string;
    reasoning?: string;
  };
}

interface DualChatProps {
  agents: HumanAgent[];
}

const DualChat: React.FC<DualChatProps> = ({ agents }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'agent1' | 'agent2'>('agent1');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [agent1, agent2] = agents;

  useEffect(() => {
    // Initialize with agent greetings and conversation starter
    const greeting1 = agent1.speakingPatterns.greetings[
      Math.floor(Math.random() * agent1.speakingPatterns.greetings.length)
    ];
    
    const greeting2 = agent2.speakingPatterns.greetings[
      Math.floor(Math.random() * agent2.speakingPatterns.greetings.length)
    ];
    
    const initialMessages: Message[] = [
      {
        id: 'greeting1',
        type: 'agent1',
        content: greeting1,
        timestamp: new Date(),
        emotion: 'friendly',
        confidence: 0.9,
        metadata: {
          agentId: agent1.id,
          agentName: agent1.name,
          reasoning: 'Greeting based on personality'
        }
      },
      {
        id: 'greeting2',
        type: 'agent2',
        content: greeting2,
        timestamp: new Date(),
        emotion: 'friendly',
        confidence: 0.9,
        metadata: {
          agentId: agent2.id,
          agentName: agent2.name,
          reasoning: 'Greeting based on personality'
        }
      },
      {
        id: 'conversation_starter',
        type: 'system',
        content: `${agent1.name} and ${agent2.name} are ready to chat! What would you like to discuss?`,
        timestamp: new Date()
      }
    ];
    
    setMessages(initialMessages);
  }, [agent1, agent2]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateHumanResponse = async (userMessage: string, agent: HumanAgent, agentType: 'agent1' | 'agent2'): Promise<Message> => {
    // Simulate human-like response generation
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const { personality, speakingPatterns, background } = agent;
    let response = '';
    let emotion = 'neutral';
    let confidence = 0.7;
    
    // Analyze user message for context
    const lowerMessage = userMessage.toLowerCase();
    const isQuestion = lowerMessage.includes('?') || lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('why');
    const isConfused = lowerMessage.includes('confused') || lowerMessage.includes('help') || lowerMessage.includes('explain');
    const isExcited = lowerMessage.includes('great') || lowerMessage.includes('amazing') || lowerMessage.includes('love');
    const isConcerned = lowerMessage.includes('safe') || lowerMessage.includes('mistake') || lowerMessage.includes('worried');
    
    // Generate response based on personality and context
    if (personality.techSavviness === 'low' && personality.englishLevel === 'basic') {
      // Novice user with basic English - use Hinglish
      if (isConfused) {
        response = speakingPatterns.confusion[Math.floor(Math.random() * speakingPatterns.confusion.length)];
        emotion = 'confused';
        confidence = 0.6;
      } else if (isExcited) {
        response = speakingPatterns.excitement[Math.floor(Math.random() * speakingPatterns.excitement.length)];
        emotion = 'excited';
        confidence = 0.8;
      } else if (isConcerned) {
        response = speakingPatterns.concerns[Math.floor(Math.random() * speakingPatterns.concerns.length)];
        emotion = 'concerned';
        confidence = 0.7;
      } else if (isQuestion) {
        response = speakingPatterns.questions[Math.floor(Math.random() * speakingPatterns.questions.length)];
        emotion = 'curious';
        confidence = 0.7;
      } else {
        response = speakingPatterns.greetings[Math.floor(Math.random() * speakingPatterns.greetings.length)];
        emotion = 'friendly';
        confidence = 0.8;
      }
    } else if (personality.techSavviness === 'expert') {
      // Tech-savvy user - use technical language
      if (isQuestion) {
        response = 'That\'s a great question! From a technical perspective, I can see several interesting aspects here. What specific part are you most curious about?';
        emotion = 'excited';
        confidence = 0.8;
      } else if (isConfused) {
        response = 'I need more context to give you a proper technical analysis. Could you provide more details about the requirements?';
        emotion = 'confused';
        confidence = 0.6;
      } else {
        response = 'Looking at this from a technical standpoint, I can see some interesting patterns. What specific aspect would you like me to focus on?';
        emotion = 'analytical';
        confidence = 0.8;
      }
    } else {
      // Medium tech level - balanced approach
      if (isQuestion) {
        response = 'I can see what you\'re asking about. Could you explain a bit more about what you\'re looking for?';
        emotion = 'curious';
        confidence = 0.7;
      } else if (isConfused) {
        response = 'I\'m not entirely sure I understand. Could you help me with more context?';
        emotion = 'confused';
        confidence = 0.6;
      } else {
        response = 'This is interesting. I\'d like to understand more about your perspective on this.';
        emotion = 'curious';
        confidence = 0.7;
      }
    }
    
    // Add personality-specific elements
    if (personality.traits.includes('family-oriented') && Math.random() > 0.7) {
      response += ' I always think about how this affects my family.';
    }
    
    if (personality.traits.includes('cautious') && Math.random() > 0.7) {
      response += ' I want to make sure this is safe and reliable.';
    }
    
    if (personality.traits.includes('analytical') && Math.random() > 0.7) {
      response += ' Let me analyze this step by step.';
    }
    
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: agentType,
      content: response,
      timestamp: new Date(),
      emotion,
      confidence,
      metadata: {
        agentId: agent.id,
        agentName: agent.name,
        reasoning: `Based on ${personality.communicationStyle} communication style and ${background.experience}`
      }
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;
    
    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);
    setIsTyping(true);
    
    try {
      // Generate response from active agent
      const activeAgentData = activeAgent === 'agent1' ? agent1 : agent2;
      const agentResponse = await generateHumanResponse(inputValue, activeAgentData, activeAgent);
      setMessages(prev => [...prev, agentResponse]);
      
      // Switch to other agent for next response
      setActiveAgent(activeAgent === 'agent1' ? 'agent2' : 'agent1');
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: 'Sorry, I need a moment to think about this. Could you try again?',
        timestamp: new Date(),
        emotion: 'confused',
        confidence: 0.3
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
        return <MoreHorizontal className="w-4 h-4 text-yellow-500" />;
      case 'concerned':
        return <ThumbsDown className="w-4 h-4 text-orange-500" />;
      case 'curious':
        return <Smile className="w-4 h-4 text-blue-500" />;
      default:
        return <Smile className="w-4 h-4 text-gray-500" />;
    }
  };

  const getAgentInfo = (messageType: string) => {
    if (messageType === 'agent1') return { agent: agent1, color: 'bg-blue-100' };
    if (messageType === 'agent2') return { agent: agent2, color: 'bg-green-100' };
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Dual Chat</h3>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="text-lg">{agent1.avatar}</div>
                <span className="text-sm font-medium text-gray-700">{agent1.name}</span>
              </div>
              <div className="text-gray-400">+</div>
              <div className="flex items-center space-x-2">
                <div className="text-lg">{agent2.avatar}</div>
                <span className="text-sm font-medium text-gray-700">{agent2.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500">
              Next: {activeAgent === 'agent1' ? agent1.name : agent2.name}
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => {
          if (message.type === 'system') {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  {message.content}
                </div>
              </div>
            );
          }
          
          const agentInfo = getAgentInfo(message.type);
          const isUser = message.type === 'user';
          
          return (
            <div
              key={message.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : agentInfo?.color || 'bg-gray-100'
                } ${isUser ? 'text-white' : 'text-gray-900'}`}
              >
                <div className="flex items-start space-x-2">
                  {!isUser && agentInfo && (
                    <div className="text-lg">{agentInfo.agent.avatar}</div>
                  )}
                  <div className="flex-1">
                    {!isUser && agentInfo && (
                      <div className="text-xs font-medium text-gray-600 mb-1">
                        {agentInfo.agent.name}
                      </div>
                    )}
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center space-x-1">
                        {message.emotion && getEmotionIcon(message.emotion)}
                        {message.confidence && (
                          <span className="text-xs opacity-75">
                            {Math.round(message.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <span className="text-xs opacity-75">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  {isUser && (
                    <User className="w-4 h-4 text-blue-200" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="text-lg">{activeAgent === 'agent1' ? agent1.avatar : agent2.avatar}</div>
                <div className="text-xs font-medium text-gray-600 mb-1">
                  {activeAgent === 'agent1' ? agent1.name : agent2.name}
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
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
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${activeAgent === 'agent1' ? agent1.name : agent2.name}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isGenerating}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isGenerating}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DualChat;



