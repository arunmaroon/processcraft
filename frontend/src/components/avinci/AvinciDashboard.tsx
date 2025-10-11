import React, { useState } from 'react';
import { 
  Home, 
  Bot, 
  Users, 
  MessageSquare, 
  Upload,
  Settings,
  Eye,
  FileText,
  BarChart3
} from 'lucide-react';
import DocumentUpload from './DocumentUpload';
import AgentGrid from './AgentGrid';

type TabType = 'dashboard' | 'generate' | 'agents' | 'chat' | 'group-chat' | 'design-feedback';

export default function AvinciDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [agents, setAgents] = useState([
    {
      id: '1',
      name: 'Priya Sharma',
      age: 28,
      occupation: 'Software Engineer',
      status: 'ACTIVE' as const,
      tech_savviness: 'High',
      english_literacy: 'Fluent',
      confidence: 0.85,
      bio: 'Tech-savvy engineer with 5+ years experience in fintech startups. Values clean interfaces and fast loading times.',
      goals: ['Build innovative products', 'Advance career', 'Learn new technologies'],
      painPoints: ['Work-life balance', 'Keeping up with tech trends'],
      behaviors: ['Researches before decisions', 'Values user reviews', 'Asks questions when uncertain']
    },
    {
      id: '2',
      name: 'Rajesh Kumar',
      age: 35,
      occupation: 'Marketing Manager',
      status: 'SLEEPING' as const,
      tech_savviness: 'Medium',
      english_literacy: 'Good',
      confidence: 0.72,
      bio: 'Marketing professional focused on digital campaigns and customer engagement strategies.',
      goals: ['Increase brand awareness', 'Improve customer retention', 'Lead digital transformation'],
      painPoints: ['Limited budget', 'Measuring ROI', 'Team coordination'],
      behaviors: ['Data-driven decisions', 'Collaborative approach', 'Customer-focused']
    },
    {
      id: '3',
      name: 'Anita Patel',
      age: 42,
      occupation: 'Product Manager',
      status: 'ACTIVE' as const,
      tech_savviness: 'High',
      english_literacy: 'Fluent',
      confidence: 0.91,
      bio: 'Experienced product manager with expertise in user research and agile development.',
      goals: ['Launch successful products', 'Improve user experience', 'Build strong teams'],
      painPoints: ['Stakeholder alignment', 'Resource constraints', 'Market competition'],
      behaviors: ['User-centric thinking', 'Strategic planning', 'Cross-functional collaboration']
    }
  ]);

  const tabs = [
    { id: 'dashboard' as TabType, name: 'Dashboard', icon: Home },
    { id: 'generate' as TabType, name: 'Generate Agents', icon: Upload },
    { id: 'agents' as TabType, name: 'Agent Library', icon: Users },
    { id: 'chat' as TabType, name: 'Single Chat', icon: MessageSquare },
    { id: 'group-chat' as TabType, name: 'Group Chat', icon: Users },
    { id: 'design-feedback' as TabType, name: 'Design Feedback', icon: FileText },
  ];

  const handleSelectAgent = (agent: any) => {
    console.log('Selected agent:', agent);
  };

  const handleDeleteAgent = (agentId: string) => {
    console.log('Delete agent:', agentId);
    // Implement delete logic
  };

  const handleAgentStatusChange = (agentId: string, status: string) => {
    console.log('Change agent status:', agentId, status);
    // Implement status change logic
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AvinciDashboardContent agents={agents} />;
      case 'generate':
        return <AvinciGenerateAgents />;
      case 'agents':
        return <AvinciAgentLibrary agents={agents} onSelectAgent={handleSelectAgent} onDeleteAgent={handleDeleteAgent} onAgentStatusChange={handleAgentStatusChange} />;
      case 'chat':
        return <AvinciSingleChat />;
      case 'group-chat':
        return <AvinciGroupChat />;
      case 'design-feedback':
        return <AvinciDesignFeedback />;
      default:
        return <AvinciDashboardContent agents={agents} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Agent Portal</h1>
                <p className="text-gray-600 text-sm">Complete avinci agent and chat system</p>
              </div>
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
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}

// Placeholder components - these will be replaced with actual avinci components
const AvinciDashboardContent = ({ agents }: { agents: any[] }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Agents</p>
            <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Active Chats</p>
            <p className="text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Analytics</p>
            <p className="text-2xl font-bold text-gray-900">Ready</p>
          </div>
        </div>
      </div>
    </div>
    
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome to AI Agent Portal</h2>
      <p className="text-gray-600 mb-6">Complete avinci agent and chat system integrated into ProcessCraft</p>
      <div className="flex space-x-4">
        <button 
          onClick={() => {/* Will be implemented */}}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Generate Agents
        </button>
        <button 
          onClick={() => {/* Will be implemented */}}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          View Library
        </button>
      </div>
    </div>
  </div>
);

const AvinciGenerateAgents = () => {
  const handleGenerateAgents = (data: {
    numberOfAgents: number;
    files: File[];
    uploadResults?: any[];
  }) => {
    console.log('Generating agents with data:', data);
    // Here you would implement the actual agent generation logic
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate AI Agents</h1>
        <p className="text-gray-600">
          Upload transcripts to create realistic AI personas with detailed backgrounds
        </p>
      </div>
      
      <DocumentUpload onGenerateAgents={handleGenerateAgents} />
    </div>
  );
};

const AvinciAgentLibrary = ({ 
  agents, 
  onSelectAgent, 
  onDeleteAgent, 
  onAgentStatusChange 
}: { 
  agents: any[]; 
  onSelectAgent: (agent: any) => void; 
  onDeleteAgent: (agentId: string) => void; 
  onAgentStatusChange: (agentId: string, status: string) => void; 
}) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-green-600" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Agent Library</h1>
      <p className="text-gray-600">Browse and manage your AI agents</p>
    </div>
    
    <AgentGrid 
      agents={agents}
      onSelectAgent={onSelectAgent}
      onDeleteAgent={onDeleteAgent}
      onAgentStatusChange={onAgentStatusChange}
    />
  </div>
);

const AvinciSingleChat = () => (
  <div className="text-center py-12">
    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h2 className="text-xl font-semibold text-gray-900 mb-2">Single Chat</h2>
    <p className="text-gray-600">Chat with individual agents</p>
  </div>
);

const AvinciGroupChat = () => (
  <div className="text-center py-12">
    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h2 className="text-xl font-semibold text-gray-900 mb-2">Group Chat</h2>
    <p className="text-gray-600">Multi-agent conversations</p>
  </div>
);

const AvinciDesignFeedback = () => (
  <div className="text-center py-12">
    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h2 className="text-xl font-semibold text-gray-900 mb-2">Design Feedback</h2>
    <p className="text-gray-600">Get feedback on your designs from AI agents</p>
  </div>
);
