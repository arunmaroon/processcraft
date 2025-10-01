import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Upload, 
  Settings, 
  BarChart3, 
  MessageCircle, 
  Brain, 
  Target,
  LogOut,
  Shield,
  Database,
  Zap
} from 'lucide-react';

import AdminAuth from './AdminAuth';
import DataIngestionAndAgentBuilder from './DataIngestionAndAgentBuilder';
import AgentLibrary from './AgentLibrary';
import AgentTestLab from './AgentTestLab';

interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
}

interface Agent {
  id: string;
  name: string;
  demographics: any;
  personality?: any;
  communication_style?: any;
  psychological_profile?: any;
  financial_profile?: any;
  consistency_score?: number;
  realism_score?: number;
  engagement_score?: number;
  usage_count?: number;
  tags?: string[];
  created_at?: string;
}

const AgentSystemDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [processingInsights, setProcessingInsights] = useState<any>(null);

  useEffect(() => {
    // Check for existing authentication
    const token = localStorage.getItem('admin_token');
    const userData = localStorage.getItem('admin_user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }

    // Load agents and files from localStorage
    const savedAgents = localStorage.getItem('ai_agents');
    if (savedAgents) {
      setAgents(JSON.parse(savedAgents));
    }

    const savedFiles = localStorage.getItem('uploaded_files');
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles));
    }
  }, []);

  // Save agents to localStorage whenever agents change
  useEffect(() => {
    if (agents.length > 0) {
      localStorage.setItem('ai_agents', JSON.stringify(agents));
    }
  }, [agents]);

  // Save uploaded files to localStorage whenever files change
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      localStorage.setItem('uploaded_files', JSON.stringify(uploadedFiles));
    }
  }, [uploadedFiles]);

  const handleLogin = (token: string, userData: User) => {
    setUser(userData);
    setIsAuthenticated(true);
    fetchAgents();
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
    setIsAuthenticated(false);
    setSelectedAgent(null);
    setAgents([]);
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleGenerateAgents = async (criteria: any) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/agents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({ criteria })
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(prev => [...prev, ...data.agents]);
        alert(`Successfully generated ${data.count} agents!`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error generating agents:', error);
      alert('Failed to generate agents');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFilesUploaded = (files: any[]) => {
    setUploadedFiles(files);
  };

  const handleProcessingComplete = (insights: any) => {
    setProcessingInsights(insights);
  };

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setActiveTab('testing');
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setActiveTab('testing');
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        const response = await fetch(`/api/agents/${agentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });

        if (response.ok) {
          setAgents(prev => prev.filter(agent => agent.id !== agentId));
          if (selectedAgent?.id === agentId) {
            setSelectedAgent(null);
          }
        } else {
          alert('Failed to delete agent');
        }
      } catch (error) {
        console.error('Error deleting agent:', error);
        alert('Failed to delete agent');
      }
    }
  };

  const handleTestComplete = (results: any) => {
    console.log('Test completed:', results);
    // In a real implementation, save test results to database
  };

  if (!isAuthenticated) {
    return <AdminAuth onLogin={handleLogin} />;
  }

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'System overview and analytics'
    },
    {
      id: 'upload-build',
      label: 'Upload & Build',
      icon: Upload,
      description: 'Upload documents and build agents'
    },
    {
      id: 'library',
      label: 'Agent Library',
      icon: Users,
      description: 'Manage and explore agents'
    },
    {
      id: 'testing',
      label: 'Test Lab',
      icon: Target,
      description: 'Test agent performance'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uploaded Files</p>
              <p className="text-2xl font-bold text-gray-900">{uploadedFiles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-900">
                {agents.reduce((sum, agent) => sum + (agent.usage_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {agents.length > 0 
                  ? Math.round(agents.reduce((sum, agent) => sum + (agent.consistency_score || 0), 0) / agents.length * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Agents</h3>
          <div className="space-y-3">
            {agents.slice(0, 5).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {agent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{agent.name}</p>
                    <p className="text-sm text-gray-500">
                      {agent.demographics?.age} years • {agent.demographics?.occupation}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {agent.consistency_score ? Math.round(agent.consistency_score * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">Quality</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Grok API</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Redis Cache</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">File Storage</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">ProcessCraft Agent System</h1>
                  <p className="text-sm text-gray-500">Advanced AI Agent Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span>{user?.role.replace('_', ' ').toUpperCase()}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'upload-build' && (
            <DataIngestionAndAgentBuilder
              onFilesUploaded={handleFilesUploaded}
              onProcessingComplete={handleProcessingComplete}
              onGenerateAgents={handleGenerateAgents}
              isGenerating={isGenerating}
            />
          )}
          {activeTab === 'library' && (
            <AgentLibrary
              onSelectAgent={handleSelectAgent}
              onEditAgent={handleEditAgent}
              onDeleteAgent={handleDeleteAgent}
            />
          )}
          {activeTab === 'testing' && (
            <AgentTestLab
              selectedAgent={selectedAgent}
              onTestComplete={handleTestComplete}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default AgentSystemDashboard;
