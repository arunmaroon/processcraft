import React, { useState } from 'react';
import { 
  Bot, 
  Users, 
  MessageSquare, 
  Settings, 
  Upload, 
  Download,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Mic,
  Search,
  Database,
  Zap,
  Brain,
  Sparkles,
  BarChart3,
  Plus
} from 'lucide-react';

type TabType = 'overview' | 'personas' | 'chat' | 'documents' | 'analytics' | 'settings';

export default function AISetup() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [agents, setAgents] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const tabs = [
    { id: 'overview' as TabType, name: 'Overview', icon: Brain, color: 'text-purple-600' },
    { id: 'personas' as TabType, name: 'AI Personas', icon: Users, color: 'text-blue-600' },
    { id: 'chat' as TabType, name: 'AI Chat', icon: MessageSquare, color: 'text-green-600' },
    { id: 'documents' as TabType, name: 'Documents', icon: FileText, color: 'text-orange-600' },
    { id: 'analytics' as TabType, name: 'Analytics', icon: BarChart3, color: 'text-indigo-600' },
    { id: 'settings' as TabType, name: 'AI Settings', icon: Settings, color: 'text-gray-600' },
  ];

  const stats = [
    { label: 'AI Personas', value: '12', icon: Users, color: 'bg-blue-500', change: '+3 this week' },
    { label: 'Active Chats', value: '48', icon: MessageSquare, color: 'bg-green-500', change: '+12 today' },
    { label: 'Documents', value: '156', icon: FileText, color: 'bg-orange-500', change: '+24 this month' },
    { label: 'Embeddings', value: '2.4K', icon: Database, color: 'bg-purple-500', change: 'Vector DB' },
  ];

  const features = [
    {
      title: 'AI-Powered Personas',
      description: 'Create intelligent AI agents with unique personalities, backgrounds, and expertise',
      icon: Bot,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      features: ['51+ persona attributes', 'Custom personality traits', 'Behavioral patterns', 'Context awareness']
    },
    {
      title: 'Multi-Agent Chat',
      description: 'Engage in conversations with multiple AI personas simultaneously',
      icon: MessageSquare,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      features: ['Single/Dual/Triple chat', 'Image analysis', 'Memory retention', 'Real-time responses']
    },
    {
      title: 'Document Intelligence',
      description: 'Process and analyze documents with advanced AI capabilities',
      icon: FileText,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      features: ['PDF/Excel upload', 'Vector embeddings', 'Semantic search', 'Smart extraction']
    },
    {
      title: 'UX Feedback Engine',
      description: 'Get pixel-perfect UI/UX feedback from persona-driven agents',
      icon: Sparkles,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      features: ['Design critique', 'Usability testing', 'Task analysis', 'Actionable insights']
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Setup & Management</h1>
                <p className="text-gray-600 text-sm">Configure and manage your AI-powered research platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Import Personas</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4" />
                <span>Sync Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : ''}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs text-gray-500">{stat.change}</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Features Grid */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">AI Platform Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                      <div className={`${feature.color} p-6 text-white`}>
                        <Icon className="w-10 h-10 mb-3" />
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-white/90 text-sm">{feature.description}</p>
                      </div>
                      <div className="p-6">
                        <ul className="space-y-2">
                          {feature.features.map((item, idx) => (
                            <li key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Start Guide</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Create AI Personas</h3>
                    <p className="text-sm text-gray-600">Upload Excel/PDF or create manually with 51+ attributes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Configure AI Chat</h3>
                    <p className="text-sm text-gray-600">Set up single, dual, or triple agent conversations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Start Testing</h3>
                    <p className="text-sm text-gray-600">Upload UI designs and get instant feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">AI Personas Management</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                <span>Create Persona</span>
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Personas Yet</h3>
              <p className="text-gray-600 mb-6">Create your first AI persona to get started with intelligent conversations</p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Import from Excel/PDF
              </button>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">AI Chat Interface</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <MessageSquare className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Single Agent Chat</h3>
                <p className="text-sm text-gray-600">One-on-one conversation with an AI persona</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <Users className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dual Agent Chat</h3>
                <p className="text-sm text-gray-600">Compare perspectives from two AI agents</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <Brain className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Triple Agent Chat</h3>
                <p className="text-sm text-gray-600">Multi-perspective analysis with three agents</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Document Management</h2>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Upload className="w-4 h-4" />
                <span>Upload Documents</span>
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center mb-6">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Processing</h3>
                <p className="text-gray-600">Upload and process documents with AI-powered analysis</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Supported Formats</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• PDF Documents</li>
                    <li>• Excel Spreadsheets</li>
                    <li>• Word Documents</li>
                    <li>• Text Files</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">AI Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Vector Embeddings</li>
                    <li>• Semantic Search</li>
                    <li>• Smart Extraction</li>
                    <li>• Context Analysis</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">AI Configuration</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Required for GPT-4o integration</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pinecone API Key
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Pinecone API key"
                  />
                  <p className="text-xs text-gray-500 mt-1">For vector database operations</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Model
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>GPT-4o (Recommended)</option>
                    <option>GPT-4</option>
                    <option>GPT-3.5 Turbo</option>
                  </select>
                </div>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

