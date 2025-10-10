import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Users, 
  MessageSquare, 
  Brain,
  FileSpreadsheet,
  Download,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import AgentUpload from './AgentUpload';
import AgentGrid from './AgentGrid';
import AgentChat from './AgentChat';

export interface Agent {
  id: string;
  name: string;
  age: number;
  occupation: string;
  category: string;
  avatar_url: string;
  created_at: string;
  real_quotes: string[];
  tech_comfort: number;
  personality_traits: string[];
}

export interface UploadStatus {
  uploadId: string;
  filename: string;
  participantCount: number;
  processedCount: number;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
}

const AIAgentChatTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'agents' | 'chat'>('upload');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load agents on component mount
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/agent-upload/agents');
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (status: UploadStatus) => {
    setUploadStatus(status);
    setActiveTab('agents');
    loadAgents(); // Refresh agents list
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setActiveTab('chat');
  };

  const handleBackToAgents = () => {
    setSelectedAgent(null);
    setActiveTab('agents');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Agent Chat</h2>
            </div>
            <div className="text-sm text-gray-500">
              Transform transcripts into realistic AI agents
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              {agents.length} agents available
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload Transcripts
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'agents'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            AI Agents ({agents.length})
          </button>
          {selectedAgent && (
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Chat with {selectedAgent.name}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'upload' && (
          <AgentUpload 
            onUploadComplete={handleUploadComplete}
            uploadStatus={uploadStatus}
          />
        )}
        
        {activeTab === 'agents' && (
          <AgentGrid 
            agents={agents}
            isLoading={isLoading}
            onAgentSelect={handleAgentSelect}
            onRefresh={loadAgents}
          />
        )}
        
        {activeTab === 'chat' && selectedAgent && (
          <AgentChat 
            agent={selectedAgent}
            onBack={handleBackToAgents}
          />
        )}
      </div>
    </div>
  );
};

export default AIAgentChatTab;



