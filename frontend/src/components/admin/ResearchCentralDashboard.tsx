import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Brain, 
  Users, 
  Target, 
  Settings as SettingsIcon, 
  Shield, 
  BarChart3,
  FileText,
  Database,
  Bot,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataUploader from './DataUploader';
import InsightSynthesizer from './InsightSynthesizer';
import ConfigOrganizer from './ConfigOrganizer';
import ProductMapper from './ProductMapper';
import AgentBuilder from './AgentBuilder';
import BiasChecker from './BiasChecker';
import AgentPreview from './AgentPreview';
import Settings from './Settings';

interface CentralData {
  insights: any[];
  personas: any[];
  demographics: any[];
  cohorts: any[];
  mappings: any[];
  agents: any[];
  uploads: any[];
}

interface ResearchCentralDashboardProps {
  onLogout?: () => void;
}

export default function ResearchCentralDashboard({ onLogout }: ResearchCentralDashboardProps) {
  const [currentView, setCurrentView] = useState<string>('overview');
  const [centralData, setCentralData] = useState<CentralData>({
    insights: [],
    personas: [],
    demographics: [],
    cohorts: [],
    mappings: [],
    agents: [],
    uploads: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCentralData();
  }, []);

  const loadCentralData = async () => {
    try {
      const response = await fetch('/api/research-central');
      if (response.ok) {
        const data = await response.json();
        setCentralData(data);
      } else {
        // Fallback: Load sample data
        setCentralData({
          insights: [
            { id: '1', title: 'Mobile-First Preference', category: 'USABILITY', confidence: 0.85 },
            { id: '2', title: 'Security Concerns', category: 'SECURITY', confidence: 0.92 }
          ],
          personas: [
            { id: '1', name: 'Tech-Savvy Investor', product: 'DigiGold' },
            { id: '2', name: 'Conservative Saver', product: 'DigiGold' }
          ],
          demographics: [
            { id: '1', ageRange: [25, 35], location: 'India', income: '₹5L-₹10L' }
          ],
          cohorts: [
            { id: '1', name: 'Primary Users', size: 1000, product: 'DigiGold' }
          ],
          mappings: [
            { product: 'DigiGold', personas: ['1', '2'], cohorts: ['1'], demographics: ['1'] }
          ],
          agents: [
            { id: '1', name: 'Investor Agent', persona: 'Tech-Savvy Investor', status: 'ACTIVE' }
          ],
          uploads: [
            { id: '1', name: 'User Research Q1 2024', type: 'CSV', size: '2.3 MB', uploadedAt: '2024-01-15' }
          ]
        });
      }
    } catch (error) {
      console.log('API not available, using fallback data');
      // Use fallback data
      setCentralData({
        insights: [
          { id: '1', title: 'Mobile-First Preference', category: 'USABILITY', confidence: 0.85 },
          { id: '2', title: 'Security Concerns', category: 'SECURITY', confidence: 0.92 }
        ],
        personas: [
          { id: '1', name: 'Tech-Savvy Investor', product: 'DigiGold' },
          { id: '2', name: 'Conservative Saver', product: 'DigiGold' }
        ],
        demographics: [
          { id: '1', ageRange: [25, 35], location: 'India', income: '₹5L-₹10L' }
        ],
        cohorts: [
          { id: '1', name: 'Primary Users', size: 1000, product: 'DigiGold' }
        ],
        mappings: [
          { product: 'DigiGold', personas: ['1', '2'], cohorts: ['1'], demographics: ['1'] }
        ],
        agents: [
          { id: '1', name: 'Investor Agent', persona: 'Tech-Savvy Investor', status: 'ACTIVE' }
        ],
        uploads: [
          { id: '1', name: 'User Research Q1 2024', type: 'CSV', size: '2.3 MB', uploadedAt: '2024-01-15' }
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

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'System status and metrics' },
    { id: 'upload', label: 'Data Upload', icon: Upload, description: 'Upload past research data' },
    { id: 'synthesize', label: 'Insight Synthesis', icon: Brain, description: 'AI-powered insight generation' },
    { id: 'organize', label: 'Config Organization', icon: Users, description: 'Manage personas & demographics' },
    { id: 'mapping', label: 'Product Mapping', icon: Target, description: 'Map products to configurations' },
    { id: 'agents', label: 'Agent Builder', icon: Bot, description: 'Build AI mimicking agents' },
    { id: 'bias', label: 'Bias Checker', icon: Shield, description: 'Ethical bias detection' },
    { id: 'preview', label: 'Agent Preview', icon: FileText, description: 'Test agent responses' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, description: 'System configuration and preferences' }
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
                    onClick={() => setCurrentView(item.id)}
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
                        <p className="text-2xl font-bold text-gray-900">{centralData.uploads.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">AI Insights</p>
                        <p className="text-2xl font-bold text-gray-900">{centralData.insights.length}</p>
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
                        <p className="text-2xl font-bold text-gray-900">{centralData.personas.length}</p>
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
                        <p className="text-2xl font-bold text-gray-900">{centralData.agents.length}</p>
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
                      {centralData.agents.map((agent) => (
                        <div key={agent.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(agent.status)}
                            <div>
                              <p className="font-medium text-gray-900">{agent.name}</p>
                              <p className="text-sm text-gray-600">Persona: {agent.persona}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                            {agent.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'upload' && <DataUploader onDataUploaded={loadCentralData} />}
            {currentView === 'synthesize' && <InsightSynthesizer onInsightsGenerated={loadCentralData} />}
            {currentView === 'organize' && <ConfigOrganizer onConfigsUpdated={loadCentralData} />}
            {currentView === 'mapping' && <ProductMapper onMappingsUpdated={loadCentralData} />}
            {currentView === 'agents' && <AgentBuilder onAgentsBuilt={loadCentralData} />}
            {currentView === 'bias' && <BiasChecker onBiasChecked={loadCentralData} />}
            {currentView === 'preview' && <AgentPreview />}
            {currentView === 'settings' && <Settings />}
          </div>
        </div>
      </div>
    </div>
  );
}
