import React, { useState, useEffect } from 'react';
import { 
  Bot, Users, Upload, Filter, Search, Settings, BarChart3, 
  Star, Shield, Zap, Target, AlertTriangle, CheckCircle, 
  Clock, Play, Pause, Trash2, Edit, Eye, Plus, 
  TrendingUp, Award, Activity, Archive, RefreshCw,
  ChevronDown, ChevronUp, Tag, UserCheck, Brain,
  FileText, Database, PieChart, Calendar, Globe
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  persona: string;
  demographics: {
    ageRange: [number, number];
    income: string;
    location: string;
    occupation: string;
    education: string;
    familyStatus: string;
    techSavviness: string;
  };
  behaviors: string[];
  preferences: string[];
  painPoints: string[];
  goals: string[];
  communicationStyle: string;
  confidence: number;
  status: 'ACTIVE' | 'INACTIVE' | 'TESTING' | 'ARCHIVED';
  qualityScore: number;
  certificationLevel: 'BRONZE' | 'SILVER' | 'GOLD';
  usageCount: number;
  lastUsed: string;
  createdAt: string;
  tags: string[];
  researchSuitability: string[];
  availability: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'completed' | 'current' | 'upcoming';
  count?: number;
}

export default function AgencyAgentManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCertification, setFilterCertification] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Workflow steps
  const workflowSteps: WorkflowStep[] = [
    {
      id: 'creation',
      title: 'Agent Creation',
      description: 'Upload data and generate agents',
      icon: Upload,
      status: 'completed',
      count: 12
    },
    {
      id: 'profiling',
      title: 'Profiling & Categorization',
      description: 'Tag demographics and behaviors',
      icon: Tag,
      status: 'current',
      count: 8
    },
    {
      id: 'quality',
      title: 'Quality Assessment',
      description: 'Validate and score agents',
      icon: Shield,
      status: 'upcoming',
      count: 5
    },
    {
      id: 'deployment',
      title: 'Deployment',
      description: 'Assign to research projects',
      icon: Target,
      status: 'upcoming',
      count: 3
    },
    {
      id: 'monitoring',
      title: 'Performance Monitoring',
      description: 'Track usage and quality',
      icon: BarChart3,
      status: 'upcoming',
      count: 0
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Update and improve agents',
      icon: RefreshCw,
      status: 'upcoming',
      count: 0
    },
    {
      id: 'archival',
      title: 'Archival & Retirement',
      description: 'Manage agent lifecycle',
      icon: Archive,
      status: 'upcoming',
      count: 0
    }
  ];

  // Mock data for demonstration
  useEffect(() => {
    setAgents([
      {
        id: '1',
        name: 'Sarah Chen',
        persona: 'Tech-savvy urban professional',
        demographics: {
          ageRange: [28, 35],
          income: '₹8L-₹15L',
          location: 'Bangalore',
          occupation: 'Product Manager',
          education: 'MBA',
          familyStatus: 'Single',
          techSavviness: 'High'
        },
        behaviors: ['Data-driven decisions', 'Prefers mobile apps', 'Values efficiency'],
        preferences: ['Clean UI', 'Fast loading', 'Intuitive navigation'],
        painPoints: ['Complex workflows', 'Slow responses', 'Poor mobile experience'],
        goals: ['Increase productivity', 'Save time', 'Better work-life balance'],
        communicationStyle: 'Direct and concise',
        confidence: 0.92,
        status: 'ACTIVE',
        qualityScore: 8.5,
        certificationLevel: 'GOLD',
        usageCount: 24,
        lastUsed: '2024-01-15',
        createdAt: '2024-01-01',
        tags: ['Urban', 'Tech-Savvy', 'Professional', 'Mobile-First'],
        researchSuitability: ['Interviews', 'Usability Testing', 'Surveys'],
        availability: 'AVAILABLE'
      },
      {
        id: '2',
        name: 'Rajesh Kumar',
        persona: 'Conservative traditional user',
        demographics: {
          ageRange: [45, 55],
          income: '₹4L-₹8L',
          location: 'Delhi',
          occupation: 'Government Employee',
          education: 'Graduate',
          familyStatus: 'Married with children',
          techSavviness: 'Medium'
        },
        behaviors: ['Cautious approach', 'Prefers guidance', 'Values security'],
        preferences: ['Clear instructions', 'Familiar patterns', 'Multiple confirmations'],
        painPoints: ['Unclear processes', 'Too many options', 'Lack of support'],
        goals: ['Complete tasks safely', 'Understand everything', 'Feel confident'],
        communicationStyle: 'Detailed and explanatory',
        confidence: 0.87,
        status: 'ACTIVE',
        qualityScore: 7.8,
        certificationLevel: 'SILVER',
        usageCount: 18,
        lastUsed: '2024-01-14',
        createdAt: '2024-01-02',
        tags: ['Traditional', 'Conservative', 'Security-Focused', 'Family-Oriented'],
        researchSuitability: ['Interviews', 'Focus Groups', 'Surveys'],
        availability: 'IN_USE'
      }
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'TESTING': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationColor = (level: string) => {
    switch (level) {
      case 'GOLD': return 'bg-yellow-100 text-yellow-800';
      case 'SILVER': return 'bg-gray-100 text-gray-800';
      case 'BRONZE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'IN_USE': return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.persona.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || agent.status === filterStatus;
    const matchesCertification = !filterCertification || agent.certificationLevel === filterCertification;
    const matchesTags = !filterTags || agent.tags.some(tag => tag.toLowerCase().includes(filterTags.toLowerCase()));
    const matchesArchived = showArchived || agent.status !== 'ARCHIVED';
    
    return matchesSearch && matchesStatus && matchesCertification && matchesTags && matchesArchived;
  });

  const activeAgents = agents.filter(a => a.status === 'ACTIVE').length;
  const totalUsage = agents.reduce((sum, a) => sum + a.usageCount, 0);
  const avgQualityScore = agents.length > 0 ? 
    (agents.reduce((sum, a) => sum + a.qualityScore, 0) / agents.length).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Agency Agent Manager</h1>
                <p className="text-sm text-gray-600">Professional AI participant management system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 inline mr-2" />
                Create Agents
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <Settings className="w-4 h-4 inline mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'agents', label: 'Agent Library', icon: Users },
              { id: 'creation', label: 'Agent Creation', icon: Upload },
              { id: 'profiling', label: 'Profiling', icon: Tag },
              { id: 'quality', label: 'Quality Assessment', icon: Shield },
              { id: 'deployment', label: 'Deployment', icon: Target },
              { id: 'monitoring', label: 'Monitoring', icon: Activity },
              { id: 'maintenance', label: 'Maintenance', icon: RefreshCw },
              { id: 'archival', label: 'Archival', icon: Archive }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Workflow Progress */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Management Workflow</h2>
                <div className="flex items-center space-x-4 overflow-x-auto pb-4">
                  {workflowSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="flex items-center space-x-2 min-w-0">
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                          step.status === 'completed' ? 'bg-green-100 text-green-800' :
                          step.status === 'current' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{step.title}</span>
                          {step.count !== undefined && (
                            <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-xs">
                              {step.count}
                            </span>
                          )}
                        </div>
                        {index < workflowSteps.length - 1 && (
                          <ChevronDown className="w-4 h-4 text-gray-400 rotate-90" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg">
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
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Agents</p>
                      <p className="text-2xl font-bold text-gray-900">{activeAgents}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Activity className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Usage</p>
                      <p className="text-2xl font-bold text-gray-900">{totalUsage}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Award className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
                      <p className="text-2xl font-bold text-gray-900">{avgQualityScore}/10</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {agents.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                          <p className="text-xs text-gray-500">Last used: {agent.lastUsed}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCertificationColor(agent.certificationLevel)}`}>
                          {agent.certificationLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search agents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="TESTING">Testing</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <select
                    value={filterCertification}
                    onChange={(e) => setFilterCertification(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Certifications</option>
                    <option value="GOLD">Gold</option>
                    <option value="SILVER">Silver</option>
                    <option value="BRONZE">Bronze</option>
                  </select>
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      showArchived 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {showArchived ? 'Hide Archived' : 'Show Archived'}
                  </button>
                </div>
              </div>

              {/* Agent Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => (
                  <div key={agent.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bot className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                          <p className="text-sm text-gray-600">{agent.persona}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Quality Score</span>
                        <span className="text-sm font-semibold text-gray-900">{agent.qualityScore}/10</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Usage Count</span>
                        <span className="text-sm font-semibold text-gray-900">{agent.usageCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Used</span>
                        <span className="text-sm font-semibold text-gray-900">{agent.lastUsed}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                        {agent.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCertificationColor(agent.certificationLevel)}`}>
                        {agent.certificationLevel}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(agent.availability)}`}>
                        {agent.availability?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {agent.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {agent.tags.length > 3 && (
                        <span className="text-gray-500 text-xs">+{agent.tags.length - 3} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab !== 'overview' && activeTab !== 'agents' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                {activeTab?.replace('_', ' ') || 'Unknown'} Management
              </h2>
              <p className="text-gray-600">This section will be implemented based on the specific workflow requirements.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
