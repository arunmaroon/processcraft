import React, { useState, useEffect } from 'react';
import { Bot, Users, MessageSquare, Clock, CheckCircle, Play, Pause, RotateCcw, Brain, Sparkles } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'idle' | 'researching' | 'completed' | 'error';
  progress: number;
  currentQuestion?: string;
  findings?: string[];
}

interface AgentResearchProps {
  discussionGuide: any;
  researchSetup: any;
  onResearchComplete: (findings: any) => void;
}

const AgentResearch: React.FC<AgentResearchProps> = ({
  discussionGuide,
  researchSetup,
  onResearchComplete
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [researchProgress, setResearchProgress] = useState(0);
  const [findings, setFindings] = useState<any[]>([]);
  const [currentPhase, setCurrentPhase] = useState('preparation');

  // Initialize agents based on research setup
  useEffect(() => {
    if (researchSetup?.agents) {
      const initialAgents: Agent[] = researchSetup.agents.map((agent: any, index: number) => ({
        id: `agent-${index + 1}`,
        name: agent.name || `Research Agent ${index + 1}`,
        role: agent.role || 'User Research Specialist',
        avatar: agent.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name || index}`,
        status: 'idle',
        progress: 0,
        findings: []
      }));
      setAgents(initialAgents);
    }
  }, [researchSetup]);

  const startResearch = async () => {
    setIsRunning(true);
    setCurrentPhase('execution');
    
    // Simulate research execution
    const questions = discussionGuide?.questions || [];
    const totalQuestions = questions.length;
    
    for (let i = 0; i < totalQuestions; i++) {
      const question = questions[i];
      
      // Update each agent's progress
      setAgents(prevAgents => 
        prevAgents.map(agent => ({
          ...agent,
          status: 'researching',
          currentQuestion: question.question,
          progress: ((i + 1) / totalQuestions) * 100
        }))
      );
      
      // Simulate research findings
      const newFindings = agents.map(agent => ({
        id: `finding-${Date.now()}-${agent.id}`,
        agentId: agent.id,
        agentName: agent.name,
        question: question.question,
        finding: `Agent ${agent.name} found: ${question.question} - This is a simulated finding based on user research data.`,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        timestamp: new Date().toISOString()
      }));
      
      setFindings(prev => [...prev, ...newFindings]);
      
      // Update research progress
      setResearchProgress(((i + 1) / totalQuestions) * 100);
      
      // Wait between questions
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Mark agents as completed
    setAgents(prevAgents => 
      prevAgents.map(agent => ({
        ...agent,
        status: 'completed',
        progress: 100
      }))
    );
    
    setCurrentPhase('synthesis');
    setIsRunning(false);
    
    // Trigger research completion
    onResearchComplete({
      findings,
      agents,
      completedAt: new Date().toISOString(),
      totalQuestions: discussionGuide?.questions?.length || 0
    });
  };

  const resetResearch = () => {
    setAgents(prevAgents => 
      prevAgents.map(agent => ({
        ...agent,
        status: 'idle',
        progress: 0,
        currentQuestion: undefined,
        findings: []
      }))
    );
    setFindings([]);
    setResearchProgress(0);
    setCurrentPhase('preparation');
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'researching':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Research Control Panel */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Research Execution</h3>
          <div className="flex space-x-2">
            {!isRunning ? (
              <button
                onClick={startResearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Research</span>
              </button>
            ) : (
              <button
                onClick={() => setIsRunning(false)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}
            <button
              onClick={resetResearch}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Research Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Research Progress</span>
            <span>{Math.round(researchProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${researchProgress}%` }}
            />
          </div>
        </div>

        {/* Current Phase */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">Current Phase:</span> {currentPhase}
        </div>
      </div>

      {/* AI Agents Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Research Agents</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h5 className="font-medium text-gray-900">{agent.name}</h5>
                  <p className="text-sm text-gray-500">{agent.role}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                  <span className="text-sm text-gray-600">{Math.round(agent.progress)}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
                
                {agent.currentQuestion && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Current Question:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{agent.currentQuestion}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research Findings */}
      {findings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Research Findings</h4>
          <div className="space-y-4">
            {findings.map((finding) => (
              <div key={finding.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <img
                      src={agents.find(a => a.id === finding.agentId)?.avatar}
                      alt={finding.agentName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="font-medium text-gray-900">{finding.agentName}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      {Math.round(finding.confidence * 100)}% confidence
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(finding.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Question:</p>
                  <p className="text-sm text-gray-600">{finding.question}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Finding:</p>
                  <p className="text-sm text-gray-900">{finding.finding}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Completion Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onResearchComplete({
                findings,
                agents,
                completedAt: new Date().toISOString(),
                totalQuestions: discussionGuide?.questions?.length || 0
              })}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Complete Research & Continue</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentResearch;
