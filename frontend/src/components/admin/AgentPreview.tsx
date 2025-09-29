import React, { useState, useEffect } from 'react';
import { Bot, Send, RefreshCw, MessageSquare, User, Clock } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  agentName?: string;
}

interface Agent {
  id: string;
  name: string;
  persona: string;
  product: string;
  status: string;
  personality: {
    communicationStyle: string;
    responseLength: string;
    emotionalTone: string;
    technicalLevel: string;
  };
}

export default function AgentPreview() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/admin-research/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
        if (data.length > 0) {
          setSelectedAgent(data[0].id);
        }
      } else {
        // Fallback: Load sample agents
        const sampleAgents: Agent[] = [
          {
            id: '1',
            name: 'Tech-Savvy Investor Agent',
            persona: 'Tech-Savvy Investor',
            product: 'DigiGold',
            status: 'ACTIVE',
            personality: {
              communicationStyle: 'FRIENDLY',
              responseLength: 'MODERATE',
              emotionalTone: 'POSITIVE',
              technicalLevel: 'ADVANCED'
            }
          },
          {
            id: '2',
            name: 'Conservative Saver Agent',
            persona: 'Conservative Saver',
            product: 'DigiGold',
            status: 'ACTIVE',
            personality: {
              communicationStyle: 'PROFESSIONAL',
              responseLength: 'DETAILED',
              emotionalTone: 'CONCERNED',
              technicalLevel: 'INTERMEDIATE'
            }
          }
        ];
        setAgents(sampleAgents);
        setSelectedAgent(sampleAgents[0].id);
      }
    } catch (error) {
      console.log('API not available, using fallback data');
      // Use fallback data
      const sampleAgents: Agent[] = [
        {
          id: '1',
          name: 'Tech-Savvy Investor Agent',
          persona: 'Tech-Savvy Investor',
          product: 'DigiGold',
          status: 'ACTIVE',
          personality: {
            communicationStyle: 'FRIENDLY',
            responseLength: 'MODERATE',
            emotionalTone: 'POSITIVE',
            technicalLevel: 'ADVANCED'
          }
        }
      ];
      setAgents(sampleAgents);
      setSelectedAgent(sampleAgents[0].id);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin-research/preview-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          message: inputMessage
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const agentMessage: ChatMessage = {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content: data.response,
          timestamp: new Date().toISOString(),
          agentName: agents.find(a => a.id === selectedAgent)?.name
        };
        setMessages(prev => [...prev, agentMessage]);
      } else {
        // Fallback: Generate mock response
        const selectedAgentData = agents.find(a => a.id === selectedAgent);
        const mockResponse = generateMockResponse(inputMessage, selectedAgentData);
        const agentMessage: ChatMessage = {
          id: `agent-${Date.now()}`,
          role: 'agent',
          content: mockResponse,
          timestamp: new Date().toISOString(),
          agentName: selectedAgentData?.name
        };
        setMessages(prev => [...prev, agentMessage]);
      }
    } catch (error) {
      console.log('API not available, using fallback response');
      // Fallback response
      const selectedAgentData = agents.find(a => a.id === selectedAgent);
      const mockResponse = generateMockResponse(inputMessage, selectedAgentData);
      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: mockResponse,
        timestamp: new Date().toISOString(),
        agentName: selectedAgentData?.name
      };
      setMessages(prev => [...prev, agentMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (message: string, agent?: Agent): string => {
    if (!agent) return "I'm sorry, I couldn't process your request.";

    const responses = {
      'Tech-Savvy Investor': [
        "That's a great question! As someone who's been investing for a while, I'd say the key is to start small and diversify. What's your current investment experience?",
        "I love using mobile apps for investing - they're so convenient! Have you tried the real-time notifications? They're a game-changer.",
        "Security is definitely important, but I also value speed and ease of use. What features matter most to you?",
        "I'm always looking for the latest features and updates. The app's performance has been pretty solid for me."
      ],
      'Conservative Saver': [
        "I prefer to take things slowly and carefully consider all options. What are your main concerns about this investment?",
        "I'm quite cautious about new features - I like to understand everything before I use it. Can you explain more about the security measures?",
        "I've been using traditional banking for years, so this digital approach is quite new to me. What would you recommend for someone like me?",
        "I value detailed information and clear explanations. Could you provide more details about the risks involved?"
      ]
    };

    const agentResponses = responses[agent.persona as keyof typeof responses] || responses['Tech-Savvy Investor'];
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
  };

  const clearChat = () => {
    setMessages([]);
  };

  const selectedAgentData = agents.find(a => a.id === selectedAgent);

  if (isLoadingAgents) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Preview</h2>
        <p className="text-gray-600">Test AI agents by chatting with them to see how they mimic real user behavior</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Agent Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Agent</h3>
            <div className="space-y-3">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedAgent === agent.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Bot className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-gray-600">{agent.persona}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedAgentData && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Agent Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Persona:</span> {selectedAgentData.persona}
                  </div>
                  <div>
                    <span className="font-medium">Product:</span> {selectedAgentData.product}
                  </div>
                  <div>
                    <span className="font-medium">Style:</span> {selectedAgentData.personality.communicationStyle}
                  </div>
                  <div>
                    <span className="font-medium">Tone:</span> {selectedAgentData.personality.emotionalTone}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedAgentData?.name || 'Select an Agent'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedAgentData?.persona || 'Choose an agent to start chatting'}
                  </p>
                </div>
              </div>
              <button
                onClick={clearChat}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-600">
                    Ask the agent questions to see how they respond as a real user would
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!selectedAgent || isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!selectedAgent || !inputMessage.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Questions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Sample Questions to Try</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-blue-800 mb-2">For Tech-Savvy Investor:</h5>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• "What's your experience with mobile investing apps?"</li>
              <li>• "How important is real-time data to you?"</li>
              <li>• "What features do you use most often?"</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-2">For Conservative Saver:</h5>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>• "What are your main concerns about digital investing?"</li>
              <li>• "How do you prefer to learn about new features?"</li>
              <li>• "What information do you need before making decisions?"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
