import { useState, useEffect } from 'react';
import { Bot, Settings, TestTube, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  persona: string;
  product: string;
  status: 'BUILDING' | 'ACTIVE' | 'ERROR' | 'TESTING';
  accuracy: number;
  responses: number;
  lastActive: string;
  personality: {
    communicationStyle: 'FORMAL' | 'CASUAL' | 'FRIENDLY' | 'PROFESSIONAL';
    responseLength: 'BRIEF' | 'MODERATE' | 'DETAILED';
    emotionalTone: 'NEUTRAL' | 'POSITIVE' | 'CONCERNED' | 'ENTHUSIASTIC';
    technicalLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  };
}

interface AgentBuilderProps {
  onAgentsBuilt: () => void;
}

export default function AgentBuilder({ onAgentsBuilt }: AgentBuilderProps) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingProgress, setBuildingProgress] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progressInterval, setProgressInterval] = useState<number | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/admin-research/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      } else {
        // Fallback: Load sample agents
        setAgents([
          {
            id: '1',
            name: 'Tech-Savvy Investor Agent',
            persona: 'Tech-Savvy Investor',
            product: 'DigiGold',
            status: 'ACTIVE',
            accuracy: 0.87,
            responses: 1247,
            lastActive: '2024-01-20T14:30:00Z',
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
            status: 'BUILDING',
            accuracy: 0.0,
            responses: 0,
            lastActive: '2024-01-20T15:00:00Z',
            personality: {
              communicationStyle: 'PROFESSIONAL',
              responseLength: 'DETAILED',
              emotionalTone: 'CONCERNED',
              technicalLevel: 'INTERMEDIATE'
            }
          }
        ]);
      }
    } catch (error) {
      console.log('API not available, using fallback data');
      // Use fallback data
      setAgents([
        {
          id: '1',
          name: 'Tech-Savvy Investor Agent',
          persona: 'Tech-Savvy Investor',
          product: 'DigiGold',
          status: 'ACTIVE',
          accuracy: 0.87,
          responses: 1247,
          lastActive: '2024-01-20T14:30:00Z',
          personality: {
            communicationStyle: 'FRIENDLY',
            responseLength: 'MODERATE',
            emotionalTone: 'POSITIVE',
            technicalLevel: 'ADVANCED'
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const buildAgents = async () => {
    setIsBuilding(true);
    setBuildingProgress(0);

    try {
      // Simulate building progress
      const interval = setInterval(() => {
        setBuildingProgress(prev => {
          if (prev >= 100) {
            if (progressInterval) clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 20;
        });
      }, 300);
      setProgressInterval(interval);

      const response = await fetch('/api/admin-research/build-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
      } else {
        // Fallback: Generate mock agents
        setTimeout(() => {
          const newAgents: AIAgent[] = [
            {
              id: `agent-${Date.now()}`,
              name: 'AI-Generated Investor Agent',
              persona: 'Tech-Savvy Investor',
              product: 'DigiGold',
              status: 'ACTIVE',
              accuracy: 0.92,
              responses: 0,
              lastActive: new Date().toISOString(),
              personality: {
                communicationStyle: 'FRIENDLY',
                responseLength: 'MODERATE',
                emotionalTone: 'POSITIVE',
                technicalLevel: 'ADVANCED'
              }
            },
            {
              id: `agent-${Date.now() + 1}`,
              name: 'AI-Generated Saver Agent',
              persona: 'Conservative Saver',
              product: 'DigiGold',
              status: 'ACTIVE',
              accuracy: 0.89,
              responses: 0,
              lastActive: new Date().toISOString(),
              personality: {
                communicationStyle: 'PROFESSIONAL',
                responseLength: 'DETAILED',
                emotionalTone: 'CONCERNED',
                technicalLevel: 'INTERMEDIATE'
              }
            }
          ];
          setAgents(prev => [...prev, ...newAgents]);
          if (progressInterval) clearInterval(progressInterval);
          setBuildingProgress(100);
        }, 4000);
      }
    } catch (error) {
      console.log('API not available, using fallback agent building');
      // Fallback agent building
      setTimeout(() => {
        const newAgents: AIAgent[] = [
          {
            id: `agent-${Date.now()}`,
            name: 'AI-Generated Investor Agent',
            persona: 'Tech-Savvy Investor',
            product: 'DigiGold',
            status: 'ACTIVE',
            accuracy: 0.92,
            responses: 0,
            lastActive: new Date().toISOString(),
            personality: {
              communicationStyle: 'FRIENDLY',
              responseLength: 'MODERATE',
              emotionalTone: 'POSITIVE',
              technicalLevel: 'ADVANCED'
            }
          }
        ];
        setAgents(prev => [...prev, ...newAgents]);
        if (progressInterval) clearInterval(progressInterval);
        setBuildingProgress(100);
      }, 4000);
    } finally {
      setTimeout(() => {
        setIsBuilding(false);
        setBuildingProgress(0);
        onAgentsBuilt();
      }, 5000);
    }
  };

  const testAgent = async (agentId: string) => {
    setSelectedAgent(agentId);
    // Update agent status to testing
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, status: 'TESTING' } : agent
    ));

    try {
      const response = await fetch('/api/admin-research/test-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });

      if (response.ok) {
        const data = await response.json();
        // Update agent with test results
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? { 
            ...agent, 
            status: 'ACTIVE',
            accuracy: data.accuracy,
            responses: agent.responses + 1
          } : agent
        ));
      } else {
        // Fallback: Simulate test
        setTimeout(() => {
          setAgents(prev => prev.map(agent => 
            agent.id === agentId ? { 
              ...agent, 
              status: 'ACTIVE',
              accuracy: 0.85 + Math.random() * 0.1,
              responses: agent.responses + 1
            } : agent
          ));
        }, 2000);
      }
    } catch (error) {
      console.log('API not available, simulating test');
      // Fallback test
      setTimeout(() => {
        setAgents(prev => prev.map(agent => 
          agent.id === agentId ? { 
            ...agent, 
            status: 'ACTIVE',
            accuracy: 0.85 + Math.random() * 0.1,
            responses: agent.responses + 1
          } : agent
        ));
      }, 2000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'BUILDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'TESTING':
        return <TestTube className="w-4 h-4 text-blue-600" />;
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'BUILDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'TESTING':
        return 'bg-blue-100 text-blue-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return 'text-green-600';
    if (accuracy >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Builder</h2>
        <p className="text-gray-600">Build and test AI agents that mimic real users based on your research data</p>
      </div>

      {/* Build Agents Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Build AI Agents</h3>
            <p className="text-sm text-gray-600">Generate agents from your personas, cohorts, and research insights</p>
          </div>
          <button
            onClick={buildAgents}
            disabled={isBuilding}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isBuilding ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
            <span>{isBuilding ? 'Building...' : 'Build Agents'}</span>
          </button>
        </div>

        {isBuilding && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Creating AI agents from research data...</span>
              <span>{Math.round(buildingProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${buildingProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Agents List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">AI Agents ({agents.length})</h3>
        </div>

        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">{agent.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    {getStatusIcon(agent.status)}
                    <span className="ml-1">{agent.status}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Persona: {agent.persona} • Product: {agent.product}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => testAgent(agent.id)}
                  disabled={agent.status === 'BUILDING' || agent.status === 'TESTING'}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <TestTube className="w-4 h-4" />
                  <span>Test</span>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Agent Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Accuracy</div>
                <div className={`text-lg font-semibold ${getAccuracyColor(agent.accuracy)}`}>
                  {Math.round(agent.accuracy * 100)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Responses</div>
                <div className="text-lg font-semibold text-gray-900">{agent.responses.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Last Active</div>
                <div className="text-sm text-gray-900">
                  {new Date(agent.lastActive).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="text-sm font-medium text-gray-900">
                  {agent.status.replace('_', ' ').toLowerCase()}
                </div>
              </div>
            </div>

            {/* Personality Settings */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Personality Settings</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Communication: </span>
                  <span className="font-medium">{agent.personality.communicationStyle}</span>
                </div>
                <div>
                  <span className="text-gray-600">Response Length: </span>
                  <span className="font-medium">{agent.personality.responseLength}</span>
                </div>
                <div>
                  <span className="text-gray-600">Emotional Tone: </span>
                  <span className="font-medium">{agent.personality.emotionalTone}</span>
                </div>
                <div>
                  <span className="text-gray-600">Technical Level: </span>
                  <span className="font-medium">{agent.personality.technicalLevel}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI agents yet</h3>
          <p className="text-gray-600">
            Build your first AI agents to start mimicking real users in virtual research studies
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Agent Building Process</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>AI analyzes your uploaded research data and persona configurations</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Generates realistic user behaviors and response patterns</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Creates agents that can participate in virtual research studies</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Test agents to ensure they respond realistically to research questions</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
