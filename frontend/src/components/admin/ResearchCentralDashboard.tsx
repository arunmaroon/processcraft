import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Brain, 
  Users, 
  Target, 
  Shield, 
  BarChart3,
  FileText,
  Database,
  Bot,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataUploader from './DataUploader';
import BeautifulAgentBuilder from './BeautifulAgentBuilder';
import BiasChecker from './BiasChecker';
import AgentPreview from './AgentPreview';
import AgentDisplay from './AgentDisplay';
import DataIngestionAndAgentBuilder from '../agents/DataIngestionAndAgentBuilder';

interface CentralData {
  agents: any[];
  uploads: any[];
  aiAgents: any[];
  personas: any[];
}

interface ResearchCentralDashboardProps {
  onLogout?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  description: string;
  action?: () => void;
}

export default function ResearchCentralDashboard({ onLogout }: ResearchCentralDashboardProps) {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [centralData, setCentralData] = useState<CentralData>({
    agents: [],
    uploads: [],
    aiAgents: [],
    personas: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCentralData();
  }, []);

  const loadCentralData = async () => {
    try {
      console.log('Loading central data...');
      
      // Load agents from localStorage first
      const savedAgents = JSON.parse(localStorage.getItem('aiAgents') || '[]');
      console.log('Loaded saved agents from localStorage:', savedAgents.length);
      console.log('Saved agents data:', savedAgents);
      
      const response = await fetch('/api/research-central');
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        const finalAgents = savedAgents.length > 0 ? savedAgents : (Array.isArray(data.agents) ? data.agents : []);
        console.log('Setting centralData.agents to:', finalAgents);
        setCentralData({
          agents: finalAgents,
          uploads: Array.isArray(data.uploads) ? data.uploads : [],
          aiAgents: savedAgents.length > 0 ? savedAgents : (Array.isArray(data.aiAgents) ? data.aiAgents : []),
          personas: savedAgents.length > 0 ? savedAgents : (Array.isArray(data.personas) ? data.personas : [])
        });
        console.log('Central data set successfully with', savedAgents.length, 'saved agents');
      } else {
        // Fallback: Load from localStorage or sample data
        setCentralData({
          agents: savedAgents.length > 0 ? savedAgents : [
            { id: '1', name: 'Investor Agent', persona: 'Tech-Savvy Investor', status: 'ACTIVE' }
          ],
          uploads: [
            { id: '1', name: 'User Research Q1 2024', type: 'CSV', size: '2.3 MB', uploadedAt: '2024-01-15' }
          ],
          aiAgents: savedAgents.length > 0 ? savedAgents : [
            {
              id: 'ai-agent-1',
              name: 'Tech-Savvy Professional',
              persona: 'A working professional who values efficiency and modern interfaces',
              demographics: {
                ageRange: [25, 35],
                income: '₹5L-₹10L',
                location: 'Urban India',
                occupation: 'Software Engineer'
              },
              behaviors: [
                'Prefers mobile-first interfaces',
                'Values security over convenience',
                'Quick decision maker'
              ],
              preferences: [
                'Clean, minimal design',
                'Fast loading times',
                'Intuitive navigation'
              ],
              painPoints: [
                'Complex registration processes',
                'Slow response times',
                'Unclear error messages'
              ],
              goals: [
                'Complete tasks quickly',
                'Feel secure using the platform',
                'Have a smooth user experience'
              ],
              communicationStyle: 'Direct and concise',
              techSavviness: 'High',
              confidence: 0.85
            },
            {
              id: 'ai-agent-2',
              name: 'Conservative User',
              persona: 'A cautious user who prioritizes security and familiar interfaces',
              demographics: {
                ageRange: [40, 55],
                income: '₹3L-₹7L',
                location: 'Semi-urban India',
                occupation: 'Government Employee'
              },
              behaviors: [
                'Reads all instructions carefully',
                'Prefers step-by-step guidance',
                'Values security features'
              ],
              preferences: [
                'Clear instructions',
                'Familiar interface patterns',
                'Multiple confirmation steps'
              ],
              painPoints: [
                'Unclear instructions',
                'Too many options',
                'Lack of guidance'
              ],
              goals: [
                'Complete tasks safely',
                'Understand every step',
                'Feel confident using the platform'
              ],
              communicationStyle: 'Detailed and explanatory',
              techSavviness: 'Medium',
              confidence: 0.80
            }
          ],
          personas: [
            { id: '1', name: 'Tech-Savvy Investor', product: 'DigiGold' },
            { id: '2', name: 'Conservative Saver', product: 'DigiGold' }
          ]
        });
      }
    } catch (error) {
      console.log('API not available, using fallback data');
      // Load from localStorage or use fallback data
      const savedAgents = JSON.parse(localStorage.getItem('aiAgents') || '[]');
      setCentralData({
        agents: savedAgents.length > 0 ? savedAgents : [
          { id: '1', name: 'Investor Agent', persona: 'Tech-Savvy Investor', status: 'ACTIVE' }
        ],
        uploads: [
          { id: '1', name: 'User Research Q1 2024', type: 'CSV', size: '2.3 MB', uploadedAt: '2024-01-15' }
        ],
        aiAgents: savedAgents,
        personas: savedAgents.length > 0 ? savedAgents : [
          { id: '1', name: 'Tech-Savvy Investor', product: 'DigiGold' },
          { id: '2', name: 'Conservative Saver', product: 'DigiGold' }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('Research Central: Logging out...');
    localStorage.removeItem('admin_token');
    // Also clear any user context that might be set to ADMIN
    localStorage.removeItem('processcraft_user');
    console.log('Research Central: Cleared localStorage tokens');
    if (onLogout) {
      console.log('Research Central: Calling onLogout callback');
      onLogout();
    } else {
      console.log('Research Central: No onLogout callback, using fallback');
      // Fallback: navigate to home and reload to clear admin state
      navigate('/');
      window.location.reload();
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleFilesUploaded = (files: any[]) => {
    console.log('Files uploaded:', files);
    // Update central data with uploaded files
    setCentralData(prev => ({
      ...prev,
      uploads: [...prev.uploads, ...files]
    }));
  };

  const handleProcessingComplete = (insights: any) => {
    console.log('Processing complete:', insights);
    // Update central data with processing insights and generated agents
    const agents = Array.isArray(insights?.agents) ? insights.agents : [];
    
    // Store agents in localStorage for persistence
    const existingAgents = JSON.parse(localStorage.getItem('aiAgents') || '[]');
    const updatedAgents = [...existingAgents, ...agents];
    localStorage.setItem('aiAgents', JSON.stringify(updatedAgents));
    
    setCentralData(prev => ({
      ...prev,
      insights: insights || {},
      agents: agents, // Store generated agents from document processing
      aiAgents: agents // Also store in aiAgents for display
    }));
  };

  const handleAgentSleep = async (agentId: string) => {
    console.log('Agent sleep requested for:', agentId);
    
    try {
      const currentAgent = centralData.agents?.find(agent => agent.id === agentId);
      if (!currentAgent) return;

      const newStatus = currentAgent.status === 'SLEEPING' ? 'ACTIVE' : 'SLEEPING';
      
      // Call backend API to update status
      const response = await fetch(`/api/admin-research/agents/${agentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedAgents = centralData.agents?.map(agent => 
          agent.id === agentId 
            ? { ...agent, status: newStatus }
            : agent
        ) || [];
        
        setCentralData(prev => ({
          ...prev,
          agents: updatedAgents,
          aiAgents: updatedAgents,
          personas: updatedAgents
        }));
        
        // Update localStorage
        localStorage.setItem('aiAgents', JSON.stringify(updatedAgents));
        console.log('Agent status updated successfully:', agentId, newStatus);
      } else {
        console.error('Failed to update agent status from backend');
        alert('Failed to update agent status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
      alert('Failed to update agent status. Please try again.');
    }
  };

  const handleAgentDelete = async (agentId: string) => {
    console.log('Agent delete requested for:', agentId);
    
    try {
      // Call backend API to delete agent
      const response = await fetch(`/api/admin-research/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Get the agent name before deletion for success message
        const agent = centralData.agents?.find(a => a.id === agentId);
        const agentName = agent?.name || 'Unknown Agent';
        
        // Filter out only the specific agent
        const updatedAgents = centralData.agents?.filter(agent => agent.id !== agentId) || [];
        
        setCentralData(prev => ({
          ...prev,
          agents: updatedAgents,
          aiAgents: updatedAgents,
          personas: updatedAgents
        }));
        
        // Update localStorage
        localStorage.setItem('aiAgents', JSON.stringify(updatedAgents));
        console.log('Agent deleted successfully:', agentId);
        alert(`✅ Agent "${agentName}" has been successfully deleted.`);
      } else {
        console.error('Failed to delete agent from backend');
        alert('❌ Failed to delete agent from backend. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('❌ An error occurred while deleting the agent. Please try again.');
    }
  };

  const handleGenerateAgents = async (criteria: any) => {
    setIsGenerating(true);
    try {
      console.log('Generating agents with criteria:', criteria);
      
      const response = await fetch('/api/agents/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ criteria }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Generated agents:', result.agents);
        
        // Store generated agents in central data
        setCentralData(prev => ({
          ...prev,
          agents: [...prev.agents, ...result.agents]
        }));
        
        // Show success message
        alert(`Successfully generated ${result.count} agents! They are now available in Agent Preview.`);
      } else {
        throw new Error('Failed to generate agents');
      }
    } catch (error) {
      console.error('Error generating agents:', error);
      alert('Failed to generate agents. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const menuItems: MenuItem[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'System status and metrics' },
    { id: 'upload-build', label: 'Upload & Build Agents', icon: Upload, description: 'Upload documents and build AI agents in one workflow' },
    { id: 'ai-agents', label: 'AI Agents', icon: Bot, description: 'Manage and control your AI agents generated from research data' },
    { id: 'bias', label: 'Bias Checker', icon: Shield, description: 'Ethical bias detection' },
    { id: 'preview', label: 'Agent Preview', icon: FileText, description: 'Test agent responses' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Research Central...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Research Central</h1>
                <p className="text-sm text-gray-600">AI User Research Setup System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/ai-agent-hub')}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
              >
                <Brain className="w-4 h-4" />
                <span>AI Agent Hub</span>
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => item.action ? item.action() : setCurrentView(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {currentView === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">System Overview</h2>
                  <p className="text-gray-600">Monitor your AI user research setup and system health</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Uploaded Files</p>
                        <p className="text-2xl font-bold text-gray-900">{centralData.uploads?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Personas</p>
                        <p className="text-2xl font-bold text-gray-900">{centralData.personas?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Bot className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">AI Agents</p>
                        <p className="text-2xl font-bold text-gray-900">{centralData.aiAgents?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {(centralData.aiAgents || []).map((agent) => (
                        <div key={agent.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Bot className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{agent.name}</p>
                              <p className="text-sm text-gray-600">{agent.demographics?.occupation} • {agent.techSavviness} Tech</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor('ACTIVE')}`}>
                            {Math.round(agent.confidence * 100)}% confidence
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'upload' && <DataUploader onDataUploaded={loadCentralData} />}
            {currentView === 'upload-build' && (
              <DataIngestionAndAgentBuilder
                onFilesUploaded={handleFilesUploaded}
                onProcessingComplete={handleProcessingComplete}
                onGenerateAgents={handleGenerateAgents}
                isGenerating={isGenerating}
              />
            )}
            {currentView === 'ai-agents' && (
              <BeautifulAgentBuilder
                onAgentsBuilt={loadCentralData} 
                generatedPersonas={centralData.agents || []}
                onAgentSleep={handleAgentSleep}
                onAgentDelete={handleAgentDelete}
              />
            )}
            {currentView === 'bias' && <BiasChecker onBiasChecked={loadCentralData} />}
            {currentView === 'preview' && <AgentPreview agents={centralData.agents || []} />}
          </div>
        </div>
      </div>
    </div>
  );
}