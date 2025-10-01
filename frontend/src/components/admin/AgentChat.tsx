import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, ArrowLeft, Phone, Video, 
  MoreVertical, Smile, Paperclip, Mic, 
  MessageCircle, Clock, CheckCircle, AlertCircle
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AgentPersona {
  id: string;
  name: string;
  age: number;
  gender: string;
  demographics: {
    occupation: string;
    income_range: string;
    location: string;
    education: string;
    family_status: string;
    tech_savviness: string;
    english_literacy: string;
  };
  communication_style: string;
  behaviors: string[];
  preferences: string[];
  pain_points: string[];
  quote: string;
  background: {
    education: string;
    work_experience: string;
    family: string;
    lifestyle: string;
  };
}

interface AgentChatProps {
  agent: AgentPersona;
  onClose: () => void;
}

export default function AgentChat({ agent, onClose }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Generate AI agent response based on the real user persona it's mimicking
  const generateAgentResponse = (userMessage: string): string => {
    const techLevel = agent.demographics.tech_savviness.toLowerCase();
    const communicationStyle = agent.communication_style.toLowerCase();
    const occupation = agent.demographics.occupation.toLowerCase();
    const age = agent.age;
    const location = agent.demographics.location;

    // AI Agent introduces itself first
    if (userMessage.toLowerCase().includes('who are you') || userMessage.toLowerCase().includes('whats your name')) {
      return `Hi! I'm an AI agent that mimics ${agent.name}, a ${agent.demographics.occupation} from ${agent.demographics.location}. I'm designed to respond like this real person would, based on research data about their behavior, preferences, and communication style. How can I help you understand what ${agent.name} would think or do?`;
    }

    // Base responses based on the real user's tech savviness
    let baseResponse = '';
    
    if (techLevel === 'very low' || techLevel === 'low') {
      baseResponse = generateNonTechResponse(userMessage, agent);
    } else if (techLevel === 'medium') {
      baseResponse = generateMediumTechResponse(userMessage, agent);
    } else {
      baseResponse = generateHighTechResponse(userMessage, agent);
    }

    // Add personality based on the real user's communication style
    if (communicationStyle.includes('direct')) {
      baseResponse = makeResponseDirect(baseResponse);
    } else if (communicationStyle.includes('detailed')) {
      baseResponse = makeResponseDetailed(baseResponse);
    } else if (communicationStyle.includes('friendly')) {
      baseResponse = makeResponseFriendly(baseResponse);
    } else if (communicationStyle.includes('professional')) {
      baseResponse = makeResponseProfessional(baseResponse);
    }

    // Add occupation-specific context from the real user
    if (occupation.includes('engineer') || occupation.includes('developer')) {
      baseResponse = addTechnicalContext(baseResponse);
    } else if (occupation.includes('manager')) {
      baseResponse = addManagementContext(baseResponse);
    } else if (occupation.includes('designer')) {
      baseResponse = addDesignContext(baseResponse);
    }

    // Add age-appropriate language from the real user
    if (age < 30) {
      baseResponse = addYoungPersonLanguage(baseResponse);
    } else if (age > 50) {
      baseResponse = addMaturePersonLanguage(baseResponse);
    }

    // Always clarify this is an AI agent response
    return `As an AI agent mimicking ${agent.name}, I would respond: "${baseResponse}"`;
  };

  const generateNonTechResponse = (userMessage: string, agent: AgentPersona): string => {
    // Check if user is asking about financial terms
    if (userMessage.toLowerCase().includes('emi') || userMessage.toLowerCase().includes('interest') || userMessage.toLowerCase().includes('loan')) {
      const financialResponses = [
        "EMI? मुझे समझ नहीं आता यह क्या है। मुझे बस पैसा चाहिए।",
        "Interest rate क्या होता है? मैं इतना पढ़ा-लिखा नहीं हूं।",
        "मुझे loan चाहिए लेकिन यह सब terms समझ नहीं आते।",
        "मैं cash में deal करना पसंद करता हूं। यह digital सब बहुत confusing है।",
        "मुझे कोई simple loan चाहिए। यह सब technical terms मुझे समझ नहीं आते।",
        "मैं traditional bank जाना चाहूंगा। यह online सब बहुत complicated है।",
        "मुझे कोई trustworthy person से बात करनी चाहिए। यह app से मुझे डर लगता है।"
      ];
      return financialResponses[Math.floor(Math.random() * financialResponses.length)];
    }
    
    const responses = [
      "मैं technology में ज्यादा अच्छा नहीं हूं। क्या आप simple terms में explain कर सकते हैं?",
      "यह सब मुझे confusing लगता है। क्या आप step by step guide कर सकते हैं?",
      "मुझे technical stuff समझ नहीं आता। क्या कोई आसान तरीका है?",
      "मुझे simple चीजें पसंद हैं। यह बहुत complicated लग रहा है।",
      "मुझे technology में guidance चाहिए। क्या आप help कर सकते हैं?",
      "मुझे new technology से डर लगता है। क्या कोई call कर सकता है?",
      "यह सब बहुत confusing है। काश कोई आसान तरीका होता।",
      "मुझे गलती करने का डर है। क्या आप carefully guide कर सकते हैं?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateMediumTechResponse = (userMessage: string, agent: AgentPersona): string => {
    // Check if user is asking about financial terms
    if (userMessage.toLowerCase().includes('emi') || userMessage.toLowerCase().includes('interest') || userMessage.toLowerCase().includes('loan')) {
      const financialResponses = [
        "I've heard about EMI but I'm not sure how it's calculated. Can you explain it simply?",
        "I know what interest rate means but EMI calculation seems complex. How does it work?",
        "I understand basic loan concepts but EMI is confusing. What exactly is it?",
        "I've taken loans before but never really understood EMI properly. Can you help?",
        "I know loans have interest but EMI calculation is new to me. How do I calculate it?",
        "I'm familiar with banking but EMI is still confusing. What should I know?",
        "I understand loan basics but EMI seems technical. Can you break it down?"
      ];
      return financialResponses[Math.floor(Math.random() * financialResponses.length)];
    }
    
    const responses = [
      "I'm somewhat familiar with this, but I'd like to understand it better. Can you explain more?",
      "I've used similar things before, but this is new to me. How does it work?",
      "I'm comfortable with basic technology, but this seems a bit advanced. Can you help?",
      "I usually figure things out on my own, but I'd appreciate some guidance here.",
      "I'm not an expert, but I can usually manage. What do you think I should do?",
      "I've seen this before, but I'm not sure about the best approach. Any suggestions?",
      "I'm reasonably tech-savvy, but this is new territory for me.",
      "I can usually handle most things, but I want to make sure I do this right."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateHighTechResponse = (userMessage: string, agent: AgentPersona): string => {
    // Check if user is asking about financial terms
    if (userMessage.toLowerCase().includes('emi') || userMessage.toLowerCase().includes('interest') || userMessage.toLowerCase().includes('loan')) {
      const financialResponses = [
        "I can calculate EMI in my head. It's P × R × (1+R)^N / ((1+R)^N - 1). What's the principal amount and interest rate?",
        "EMI calculation is straightforward. I usually compare effective interest rates across different loan products.",
        "I understand compound interest and EMI calculations well. I can help you calculate the best loan option.",
        "I'm familiar with financial mathematics. EMI is just the monthly payment including principal and interest.",
        "I can break down the EMI calculation for you. It's based on the principal, annual interest rate, and tenure.",
        "I work with financial calculations regularly. EMI is essentially the monthly installment you pay.",
        "I can calculate EMI using the standard formula. I also consider processing fees and other charges.",
        "I understand the time value of money concept. EMI calculation is just an application of that principle."
      ];
      return financialResponses[Math.floor(Math.random() * financialResponses.length)];
    }
    
    const responses = [
      "I'm quite comfortable with technology. Let me think about the best approach here.",
      "I've worked with similar systems before. I think I understand what you're asking.",
      "I'm very familiar with this type of technology. Here's what I think...",
      "I work with technology daily, so this is right up my alley.",
      "I'm quite tech-savvy, so I can probably help you with this.",
      "I love exploring new technology. This sounds interesting!",
      "I'm very comfortable with technical concepts. Let me break this down...",
      "I work in tech, so I'm quite familiar with these kinds of systems."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const makeResponseDirect = (response: string): string => {
    return response.replace(/I think/g, 'I believe').replace(/maybe/g, 'definitely');
  };

  const makeResponseDetailed = (response: string): string => {
    return response + " Let me explain this in more detail. I want to make sure you understand everything clearly.";
  };

  const makeResponseFriendly = (response: string): string => {
    return response.replace(/\./g, '! 😊').replace(/I'm/g, "I'm");
  };

  const makeResponseProfessional = (response: string): string => {
    return response.replace(/I'm/g, "I am").replace(/don't/g, "do not").replace(/can't/g, "cannot");
  };

  const addTechnicalContext = (response: string): string => {
    return response + " From a technical perspective, I think we should consider the implementation details.";
  };

  const addManagementContext = (response: string): string => {
    return response + " From a management standpoint, we need to consider the team impact and timeline.";
  };

  const addDesignContext = (response: string): string => {
    return response + " From a design perspective, we should focus on user experience and visual appeal.";
  };

  const addYoungPersonLanguage = (response: string): string => {
    return response.replace(/technology/g, 'tech').replace(/understand/g, 'get it');
  };

  const addMaturePersonLanguage = (response: string): string => {
    return response.replace(/tech/g, 'technology').replace(/get it/g, 'understand');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: generateAgentResponse(inputMessage),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3 second delay
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {agent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-semibold text-gray-900">AI Agent: {agent.name}</h2>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    AI Agent
                  </span>
                </div>
                <p className="text-sm text-gray-600">Mimicking {agent.demographics.occupation} • {agent.age} years old</p>
                <p className="text-xs text-blue-600">Based on real user research data</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation with {agent.name}</h3>
            <p className="text-gray-600 mb-4">{agent.quote}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-medium text-blue-900 mb-2">About {agent.name}</h4>
              <p className="text-sm text-blue-800">
                {agent.demographics.tech_savviness} tech level • {agent.communication_style} communication style
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-2 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {message.type === 'agent' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {agent.name[0]}
                </div>
              )}
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {agent.name[0]}
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
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

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${agent.name}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Mic className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
