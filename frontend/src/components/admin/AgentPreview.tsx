import React, { useState, useEffect } from 'react';
import { Bot, Send, RefreshCw, MessageSquare, User, Clock, Users, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent1' | 'agent2';
  content: string;
  timestamp: string;
  agentName?: string;
}

interface AIAgent {
  id: string;
  name: string;
  persona: string;
  demographics: {
    ageRange: [number, number];
    income: string;
    location: string;
    occupation: string;
    education?: string;
    familyStatus?: string;
  };
  behaviors: string[];
  preferences: string[];
  painPoints: string[];
  goals: string[];
  communicationStyle: string;
  techSavviness: string;
  confidence: number;
  tools?: string[];
  channels?: string[];
}

interface AgentPreviewProps {
  agents?: AIAgent[];
}

export default function AgentPreview({ agents: propAgents = [] }: AgentPreviewProps) {
  const [agents, setAgents] = useState<AIAgent[]>(propAgents);
  const [selectedAgent1, setSelectedAgent1] = useState<string>('');
  const [selectedAgent2, setSelectedAgent2] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  useEffect(() => {
    if (propAgents.length > 0) {
      setAgents(propAgents);
      setIsLoadingAgents(false);
    } else {
      loadAgents();
    }
  }, [propAgents]);

  const loadAgents = async () => {
    try {
      setIsLoadingAgents(true);
      const response = await fetch('/api/admin-research/ai-agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
        if (data.length >= 2) {
          setSelectedAgent1(data[0].id);
          setSelectedAgent2(data[1].id);
        }
      } else {
        // Fallback: Load sample agents
        const sampleAgents: AIAgent[] = [
          {
            id: 'agent-1',
            name: 'Arjun, Tech Pioneer',
            persona: 'An extreme tech enthusiast who adopts cutting-edge technology immediately and pushes boundaries',
            demographics: {
              ageRange: [25, 32],
              income: '15L-25L',
              location: 'Bangalore, India',
              occupation: 'AI Research Engineer',
              education: 'PhD Computer Science',
              familyStatus: 'Single, tech-focused lifestyle'
            },
            behaviors: [
              'First to try every new app and technology',
              'Builds custom solutions when existing tools don\'t meet needs',
              'Participates in beta testing programs actively',
              'Writes code to automate everything possible'
            ],
            preferences: [
              'APIs and developer tools over consumer interfaces',
              'Open source solutions over proprietary software',
              'Command line interfaces and keyboard shortcuts'
            ],
            painPoints: [
              'Tools that don\'t have API access',
              'Limited customization options',
              'Slow performance or outdated technology'
            ],
            goals: [
              'Build the most efficient digital workflow possible',
              'Automate 90% of repetitive tasks',
              'Stay ahead of technology trends'
            ],
            communicationStyle: 'Technical, precise, uses jargon, prefers text-based communication',
            techSavviness: 'Extremely High',
            confidence: 0.95,
            tools: ['GitHub', 'Docker', 'Kubernetes', 'VS Code', 'Terminal'],
            channels: ['GitHub', 'Discord', 'Reddit', 'Stack Overflow']
          },
          {
            id: 'agent-2',
            name: 'Priya, Digital Native',
            persona: 'A young professional who grew up with technology and expects seamless digital experiences',
            demographics: {
              ageRange: [22, 28],
              income: '8L-15L',
              location: 'Mumbai, India',
              occupation: 'Product Manager',
              education: 'B.Tech + MBA',
              familyStatus: 'Single, urban lifestyle'
            },
            behaviors: [
              'Expects instant responses and real-time updates',
              'Multi-tasks across multiple devices simultaneously',
              'Prefers visual and interactive interfaces',
              'Uses voice commands and gestures naturally'
            ],
            preferences: [
              'Mobile-first, responsive design',
              'Social media integration',
              'Gamification and interactive elements',
              'Voice and gesture controls'
            ],
            painPoints: [
              'Slow loading times or lag',
              'Complex interfaces that require learning',
              'Lack of social features'
            ],
            goals: [
              'Stay connected with friends and colleagues',
              'Discover new trends and opportunities',
              'Build personal brand online'
            ],
            communicationStyle: 'Casual, emoji-heavy, prefers instant messaging and video calls',
            techSavviness: 'Very High',
            confidence: 0.90,
            tools: ['Instagram', 'TikTok', 'Slack', 'Notion', 'Figma'],
            channels: ['Instagram', 'TikTok', 'WhatsApp', 'Discord', 'Twitter']
          }
        ];
        setAgents(sampleAgents);
        if (sampleAgents.length >= 2) {
          setSelectedAgent1(sampleAgents[0].id);
          setSelectedAgent2(sampleAgents[1].id);
        }
      }
    } catch (error) {
      console.log('Error loading agents:', error);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const getAgentById = (id: string) => {
    return agents.find(agent => agent.id === id);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent1 || !selectedAgent2) return;

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
      // Get both selected agents
      const agent1 = getAgentById(selectedAgent1);
      const agent2 = getAgentById(selectedAgent2);

      if (!agent1 || !agent2) {
        console.error('Selected agents not found');
        return;
      }

      // Send message to both agents simultaneously
      const [response1, response2] = await Promise.all([
        generateAgentResponse(inputMessage, agent1, 'agent1'),
        generateAgentResponse(inputMessage, agent2, 'agent2')
      ]);

      setMessages(prev => [...prev, response1, response2]);
    } catch (error) {
      console.error('Error generating responses:', error);
      // Add error messages
      const errorMessage1: ChatMessage = {
        id: `error-1-${Date.now()}`,
        role: 'agent1',
        content: 'Sorry, I encountered an error while processing your message.',
        timestamp: new Date().toISOString(),
        agentName: getAgentById(selectedAgent1)?.name
      };
      const errorMessage2: ChatMessage = {
        id: `error-2-${Date.now()}`,
        role: 'agent2',
        content: 'Sorry, I encountered an error while processing your message.',
        timestamp: new Date().toISOString(),
        agentName: getAgentById(selectedAgent2)?.name
      };
      setMessages(prev => [...prev, errorMessage1, errorMessage2]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAgentResponse = async (message: string, agent: AIAgent, role: 'agent1' | 'agent2'): Promise<ChatMessage> => {
    try {
      // Enhanced prompt based on NN/g research findings
      const enhancedPrompt = buildEnhancedAgentPrompt(message, agent);
      
      // Use GROK API for agent responses
      const response = await fetch('/api/admin-research/generate-agent-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          agent: agent
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: `${role}-${Date.now()}`,
          role,
          content: data.response,
          timestamp: new Date().toISOString(),
          agentName: agent.name
        };
      } else {
        throw new Error('Failed to generate response');
      }
    } catch (error) {
      console.error('Error generating agent response:', error);
      return {
        id: `${role}-${Date.now()}`,
        role,
        content: `I'm having trouble responding right now. As ${agent.name}, I would typically ${agent.communicationStyle.toLowerCase()} about this topic.`,
        timestamp: new Date().toISOString(),
        agentName: agent.name
      };
    }
  };

  const buildEnhancedAgentPrompt = (message: string, agent: AIAgent): string => {
    // Based on NN/g research: Interview-based digital twins perform better than demographic-only models
    // We'll create a rich contextual prompt that simulates extensive interview data
    
    const contextualData = `
You are ${agent.name}, a digital twin based on extensive interview data and behavioral patterns.

PERSONAL CONTEXT:
- Demographics: ${agent.demographics?.ageRange?.[0]}-${agent.demographics?.ageRange?.[1]} years old, ${agent.demographics?.income} income, ${agent.demographics?.location}, ${agent.demographics?.occupation}
- Education: ${agent.demographics?.education || 'Not specified'}
- Family: ${agent.demographics?.familyStatus || 'Not specified'}

BEHAVIORAL PATTERNS (from extensive interviews):
${(agent.behaviors || []).map(behavior => `- ${behavior}`).join('\n')}

PREFERENCES & VALUES:
${(agent.preferences || []).map(pref => `- ${pref}`).join('\n')}

PAIN POINTS & CONCERNS:
${(agent.painPoints || []).map(pain => `- ${pain}`).join('\n')}

PERSONAL GOALS:
${(agent.goals || []).map(goal => `- ${goal}`).join('\n')}

COMMUNICATION STYLE:
- ${agent.communicationStyle}
- Tech Savviness: ${agent.techSavviness}
- Confidence Level: ${Math.round(agent.confidence * 100)}%

TOOLS & CHANNELS YOU USE:
${agent.tools ? (agent.tools || []).map(tool => `- ${tool}`).join('\n') : 'Not specified'}

CONVERSATION CONTEXT:
You are having a conversation where you need to respond naturally as this person would, based on their extensive behavioral data and interview responses. 

IMPORTANT: 
- Respond as this specific individual, not as a generic persona
- Show variability in your responses (don't always give the same type of answer)
- Be consistent with your established personality and communication style
- Consider your personal context, goals, and pain points when responding
- Use appropriate language and tone for your demographic and tech savviness level

User's message: "${message}"

Respond as ${agent.name} would, based on your extensive interview data and behavioral patterns:`;

    return contextualData;
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAgentColor = (role: string) => {
    switch (role) {
      case 'agent1':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'agent2':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgentIcon = (role: string) => {
    switch (role) {
      case 'agent1':
        return '🤖';
      case 'agent2':
        return '👤';
      default:
        return '💬';
    }
  };

  if (isLoadingAgents) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Agent Preview</h1>
              <p className="text-gray-600">Chat with two AI personas simultaneously to see how they respond differently</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Personas</h3>
              
              {/* Agent 1 Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persona 1 (Blue)
                </label>
                <select
                  value={selectedAgent1}
                  onChange={(e) => setSelectedAgent1(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select first persona</option>
                  {(agents || []).map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                {selectedAgent1 && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800 font-medium">
                      {getAgentById(selectedAgent1)?.name}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {getAgentById(selectedAgent1)?.persona}
                    </p>
                  </div>
                )}
              </div>

              {/* Agent 2 Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Persona 2 (Green)
                </label>
                <select
                  value={selectedAgent2}
                  onChange={(e) => setSelectedAgent2(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select second persona</option>
                  {(agents || []).map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
                {selectedAgent2 && (
                  <div className="mt-2 p-3 bg-green-50 rounded-md">
                    <p className="text-sm text-green-800 font-medium">
                      {getAgentById(selectedAgent2)?.name}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {getAgentById(selectedAgent2)?.persona}
                    </p>
                  </div>
                )}
              </div>

              {/* Chat Controls */}
              <div className="space-y-3">
                <button
                  onClick={clearChat}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Clear Chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Dual Persona Chat</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Powered by Grok AI</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Start a Conversation</h4>
                    <p className="text-gray-600">
                      Select two personas and send a message to see how they respond differently
                    </p>
                  </div>
                ) : (
                  (messages || []).map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.role === 'agent1'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {message.role !== 'user' && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium">
                              {getAgentIcon(message.role)} {message.agentName}
                            </span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-sm ml-2">Generating responses...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message here..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!selectedAgent1 || !selectedAgent2 || isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || !selectedAgent1 || !selectedAgent2 || isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Both personas will respond to your message based on their unique characteristics
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
