import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Brain, 
  Users, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Trash2, 
  Edit3,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  UserCheck,
  BarChart3,
  Target,
  Clock,
  Globe,
  Heart,
  MessageSquare,
  TrendingUp,
  X
} from 'lucide-react';
import Button from '../shared/Button';

interface SyntheticAgent {
  id: string;
  name: string;
  age: string;
  demographics: {
    gender: string;
    location: string;
    income: string;
    education: string;
    occupation: string;
  };
  behaviors: string[];
  personality: {
    traits: string[];
    communicationStyle: string;
    emotionalTone: string;
    responseLength: 'brief' | 'moderate' | 'detailed';
  };
  sampleQuote: string;
  confidence: number;
  sourceData: string[];
  createdAt: string;
  status: 'draft' | 'generated' | 'reviewed' | 'published';
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  insights?: number;
}

export default function AIAgentHub() {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'library'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [syntheticAgents, setSyntheticAgents] = useState<SyntheticAgent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<SyntheticAgent | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Load existing data on mount
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      // Load uploaded files
      const filesResponse = await fetch('/api/admin-research/files');
      if (filesResponse.ok) {
        const files = await filesResponse.json();
        setUploadedFiles(files);
      }

      // Load synthetic agents
      const agentsResponse = await fetch('/api/admin-research/agents');
      if (agentsResponse.ok) {
        const agents = await agentsResponse.json();
        setSyntheticAgents(agents);
      }
    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/admin-research/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedFiles(prev => [...prev, ...result.files]);
        // Auto-synthesize insights
        await synthesizeInsights();
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const synthesizeInsights = async () => {
    try {
      const response = await fetch('/api/admin-research/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Insights synthesized:', result.insights);
      }
    } catch (error) {
      console.error('Synthesis error:', error);
    }
  };

  const generateAgents = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const response = await fetch('/api/admin-research/generate-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setGenerationProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval);
              setSyntheticAgents(result.agents);
              setIsGenerating(false);
              setActiveTab('gallery');
              return 100;
            }
            return prev + 10;
          });
        }, 200);
      }
    } catch (error) {
      console.error('Agent generation error:', error);
      setIsGenerating(false);
    }
  };

  const publishAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/admin-research/publish-agent/${agentId}`, {
        method: 'POST',
      });

      if (response.ok) {
        setSyntheticAgents(prev => 
          prev.map(agent => 
            agent.id === agentId 
              ? { ...agent, status: 'published' }
              : agent
          )
        );
      }
    } catch (error) {
      console.error('Publish error:', error);
    }
  };

  const deleteAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/admin-research/delete-agent/${agentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSyntheticAgents(prev => prev.filter(agent => agent.id !== agentId));
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const previewAgent = (agent: SyntheticAgent) => {
    setSelectedAgent(agent);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Agent Hub</h1>
                <p className="text-sm text-gray-600">Create a living library of synthetic users</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {syntheticAgents.filter(a => a.status === 'published').length} Published Agents
              </div>
              <Button
                onClick={generateAgents}
                disabled={isGenerating || uploadedFiles.length === 0}
                loading={isGenerating}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isGenerating ? 'Generating...' : 'Generate Agents'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'upload', label: 'Upload Data', icon: Upload },
              { id: 'gallery', label: 'Agent Gallery', icon: Users },
              { id: 'library', label: 'Central Library', icon: Globe }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === 'gallery' && syntheticAgents.length > 0 && (
                  <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                    {syntheticAgents.length}
                  </span>
                )}
                {tab.id === 'library' && syntheticAgents.filter(a => a.status === 'published').length > 0 && (
                  <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                    {syntheticAgents.filter(a => a.status === 'published').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <UploadDataTab 
            files={uploadedFiles}
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
            onSynthesize={synthesizeInsights}
          />
        )}

        {activeTab === 'gallery' && (
          <AgentGalleryTab 
            agents={syntheticAgents}
            onPreview={previewAgent}
            onPublish={publishAgent}
            onDelete={deleteAgent}
            isGenerating={isGenerating}
            progress={generationProgress}
          />
        )}

        {activeTab === 'library' && (
          <CentralLibraryTab 
            agents={syntheticAgents.filter(a => a.status === 'published')}
            onPreview={previewAgent}
          />
        )}
      </div>

      {/* Agent Preview Modal */}
      {showPreview && selectedAgent && (
        <AgentPreviewModal 
          agent={selectedAgent}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

// Upload Data Tab Component
function UploadDataTab({ 
  files, 
  onFileUpload, 
  isUploading, 
  onSynthesize 
}: {
  files: UploadedFile[];
  onFileUpload: (files: FileList) => void;
  isUploading: boolean;
  onSynthesize: () => void;
}) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    onFileUpload(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileUpload(e.target.files);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop your research data here
          </h3>
          <p className="text-gray-600 mb-4">
            Upload interview notes, survey data, recordings, market reports
          </p>
          <div className="flex justify-center space-x-4">
            <input
              type="file"
              multiple
              accept=".csv,.json,.pdf,.txt,.xlsx"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Choose Files
            </label>
            <Button
              onClick={onSynthesize}
              disabled={files.length === 0}
              variant="outline"
              leftIcon={<Brain className="w-4 h-4" />}
            >
              Synthesize Insights
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: CSV, JSON, PDF, TXT, XLSX (max 10MB each)
          </p>
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {files.map(file => (
              <div key={file.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Upload className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    file.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : file.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {file.status}
                  </span>
                  {file.insights && (
                    <span className="text-xs text-gray-500">
                      {file.insights} insights
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Agent Gallery Tab Component
function AgentGalleryTab({ 
  agents, 
  onPreview, 
  onPublish, 
  onDelete, 
  isGenerating, 
  progress 
}: {
  agents: SyntheticAgent[];
  onPreview: (agent: SyntheticAgent) => void;
  onPublish: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  isGenerating: boolean;
  progress: number;
}) {
  if (isGenerating) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Generating Synthetic Agents
          </h3>
          <p className="text-gray-600 mb-4">
            AI is analyzing your research data and creating realistic user personas...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">{progress}% complete</p>
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No agents generated yet
          </h3>
          <p className="text-gray-600">
            Upload research data and click "Generate Agents" to create synthetic users
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Generated Agents ({agents.length})
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Target className="w-4 h-4" />
          <span>Review and publish agents to Central Library</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onPreview={onPreview}
            onPublish={onPublish}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

// Agent Card Component
function AgentCard({ 
  agent, 
  onPreview, 
  onPublish, 
  onDelete 
}: {
  agent: SyntheticAgent;
  onPreview: (agent: SyntheticAgent) => void;
  onPublish: (agentId: string) => void;
  onDelete: (agentId: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{agent.name}</h4>
            <p className="text-sm text-gray-500">{agent.age}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`px-2 py-1 text-xs rounded-full ${
            agent.status === 'published' 
              ? 'bg-green-100 text-green-800'
              : agent.status === 'reviewed'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {agent.status}
          </span>
        </div>
      </div>

      {/* Demographics */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Globe className="w-4 h-4" />
          <span>{agent.demographics.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>{agent.demographics.income}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <BarChart3 className="w-4 h-4" />
          <span>{agent.demographics.occupation}</span>
        </div>
      </div>

      {/* Sample Quote */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-gray-700 italic">"{agent.sampleQuote}"</p>
      </div>

      {/* Behaviors */}
      <div className="mb-4">
        <p className="text-xs font-medium text-gray-500 mb-2">Key Behaviors</p>
        <div className="flex flex-wrap gap-1">
          {agent.behaviors.slice(0, 3).map((behavior, index) => (
            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              {behavior}
            </span>
          ))}
          {agent.behaviors.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{agent.behaviors.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => onPreview(agent)}
            variant="outline"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
          >
            Preview
          </Button>
          {agent.status !== 'published' && (
            <Button
              onClick={() => onPublish(agent.id)}
              size="sm"
              leftIcon={<CheckCircle className="w-4 h-4" />}
              className="bg-green-600 hover:bg-green-700"
            >
              Publish
            </Button>
          )}
        </div>
        <button
          onClick={() => onDelete(agent.id)}
          className="p-1 text-gray-400 hover:text-red-600"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Confidence Score */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Confidence</span>
          <span className="font-medium">{Math.round(agent.confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full"
            style={{ width: `${agent.confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Central Library Tab Component
function CentralLibraryTab({ 
  agents, 
  onPreview 
}: {
  agents: SyntheticAgent[];
  onPreview: (agent: SyntheticAgent) => void;
}) {
  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No published agents yet
          </h3>
          <p className="text-gray-600">
            Publish agents from the gallery to make them available to all projects
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Central Library ({agents.length} agents)
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CheckCircle className="w-4 h-4" />
          <span>Available to all projects</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <div key={agent.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{agent.name}</h4>
                <p className="text-sm text-gray-500">{agent.age}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 italic">"{agent.sampleQuote}"</p>
            <Button
              onClick={() => onPreview(agent)}
              variant="outline"
              size="sm"
              leftIcon={<Eye className="w-4 h-4" />}
              className="w-full"
            >
              View Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Agent Preview Modal Component
function AgentPreviewModal({ 
  agent, 
  onClose 
}: {
  agent: SyntheticAgent;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Agent Preview</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{agent.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Age:</span>
                  <span className="ml-2 font-medium">{agent.age}</span>
                </div>
                <div>
                  <span className="text-gray-500">Gender:</span>
                  <span className="ml-2 font-medium">{agent.demographics.gender}</span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2 font-medium">{agent.demographics.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Income:</span>
                  <span className="ml-2 font-medium">{agent.demographics.income}</span>
                </div>
                <div>
                  <span className="text-gray-500">Education:</span>
                  <span className="ml-2 font-medium">{agent.demographics.education}</span>
                </div>
              </div>
            </div>

            {/* Personality */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Personality Traits</h4>
              <div className="flex flex-wrap gap-2">
                {agent.personality.traits.map((trait, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Behaviors */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Key Behaviors</h4>
              <ul className="space-y-2">
                {agent.behaviors.map((behavior, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{behavior}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Quote */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Sample Quote</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 italic">"{agent.sampleQuote}"</p>
              </div>
            </div>

            {/* Communication Style */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Communication Style</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Style:</span>
                  <span className="ml-2 font-medium">{agent.personality.communicationStyle}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tone:</span>
                  <span className="ml-2 font-medium">{agent.personality.emotionalTone}</span>
                </div>
                <div>
                  <span className="text-gray-500">Length:</span>
                  <span className="ml-2 font-medium">{agent.personality.responseLength}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
