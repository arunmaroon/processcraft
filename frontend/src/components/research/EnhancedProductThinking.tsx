import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Edit, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  FileText, 
  Sparkles, 
  Target, 
  Users, 
  BarChart3, 
  Brain, 
  ArrowRight,
  Bot,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  Eye,
  Copy,
  Archive,
  Star,
  Zap,
  Clock,
  User,
  X,
  Send,
  MoreHorizontal,
  Grid3x3,
  List
} from 'lucide-react';
import { Project, PRD } from '../../types';
import { EnhancedPRD, PRDStage, PRDPriority, AISuggestion } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';
import { enhancedPRDAIService } from '../../services/enhancedPRDAIService';
import { PMOnly } from '../shared/RoleGuard';
import Button from '../shared/Button';
import PRDGenerationFlow from './PRDGenerationFlow';
import PRDReadView from './PRDReadView';

interface EnhancedProductThinkingProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export default function EnhancedProductThinking({ project, onProjectUpdate }: EnhancedProductThinkingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'overview' | 'prd-list' | 'prd-editor' | 'prd-create' | 'prd-read'>('overview');
  const [selectedPRD, setSelectedPRD] = useState<EnhancedPRD | null>(null);
  const [prds, setPrds] = useState<EnhancedPRD[]>([]);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  useEffect(() => {
    loadPRDs();
  }, [project.id]);

  const loadPRDs = () => {
    const projectPRDs = enhancedPRDService.getPRDsByProject(project.id);
    setPrds(projectPRDs);
  };

  const handleCreatePRD = () => {
    setCurrentStep('prd-create');
  };

  const handleViewPRD = (prd: EnhancedPRD) => {
    setSelectedPRD(prd);
    setCurrentStep('prd-read');
  };

  const handleEditPRD = (prd: EnhancedPRD) => {
    setSelectedPRD(prd);
    setCurrentStep('prd-editor');
  };

  const handleSavePRD = (prd: EnhancedPRD) => {
    enhancedPRDService.savePRD(prd);
    loadPRDs();
    setCurrentStep('prd-read');
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim() || !selectedPRD) return;

    setIsGenerating(true);
    try {
      const suggestion = await enhancedPRDAIService.generateSuggestion(
        aiPrompt,
        selectedPRD.stage,
        undefined,
        selectedPRD.type
      );
      
      setAiSuggestions(prev => [suggestion, ...prev]);
      setAiPrompt('');
    } catch (error) {
      console.error('Failed to generate AI suggestion:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSuggestion = (suggestion: AISuggestion) => {
    if (!selectedPRD || !suggestion.sectionId) return;

    const updatedSections = selectedPRD.sections.map(section =>
      section.id === suggestion.sectionId
        ? { 
            ...section, 
            content: section.content + '\n\n' + suggestion.content,
            isAIGenerated: true,
            confidence: suggestion.confidence
          }
        : section
    );

    const updatedPRD = { ...selectedPRD, sections: updatedSections };
    handleSavePRD(updatedPRD);
    enhancedPRDService.updateAISuggestion(suggestion.id, 'accepted');
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    enhancedPRDService.updateAISuggestion(suggestionId, 'rejected');
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const handleAddComment = (sectionId: string, content: string) => {
    if (!selectedPRD || !content.trim()) return;

    const comment = {
      id: Date.now().toString(),
      content: content.trim(),
      author: 'Current User',
      authorRole: 'PM',
      createdAt: new Date().toISOString(),
      sectionId,
      isResolved: false,
      mentions: [],
      reactions: []
    };

    const updatedSections = selectedPRD.sections.map(section =>
      section.id === sectionId
        ? { ...section, comments: [...section.comments, comment] }
        : section
    );

    const updatedPRD = { ...selectedPRD, sections: updatedSections };
    handleSavePRD(updatedPRD);
    setNewComment('');
  };

  const getStageColor = (stage: PRDStage) => {
    switch (stage) {
      case 'Create': return 'text-blue-600 bg-blue-50';
      case 'Generate': return 'text-yellow-600 bg-yellow-50';
      case 'Edit': return 'text-green-600 bg-green-50';
      case 'Finalise': return 'text-purple-600 bg-purple-50';
      case 'Approval': return 'text-green-600 bg-green-50';
      case 'Update': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: PRDPriority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // PRD Read View (Elegant Display)
  if (currentStep === 'prd-read' && selectedPRD) {
    return (
      <PRDReadView
        prd={selectedPRD}
        onEdit={() => setCurrentStep('prd-editor')}
        onClose={() => setCurrentStep('prd-list')}
      />
    );
  }

  if (currentStep === 'prd-create') {
    return (
      <PRDGenerationFlow
        projectId={project.id}
        projectName={project.name}
        onComplete={(prd) => {
          setSelectedPRD(prd);
          setCurrentStep('prd-read');
          loadPRDs();
        }}
        onCancel={() => setCurrentStep('overview')}
      />
    );
  }

  if (currentStep === 'prd-editor' && selectedPRD) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedPRD.title}</h2>
            <p className="text-gray-600">Editing PRD for {project.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAISidebarOpen(!isAISidebarOpen)}
              className="btn-outline flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              AI Assistant
            </button>
            <button
              onClick={() => setCurrentStep('prd-list')}
              className="btn-secondary"
            >
              ← Back to PRDs
            </button>
          </div>
        </div>

        {/* PRD Editor Content */}
        <div className="space-y-6">
          {selectedPRD.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div key={section.id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    {section.isRequired && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                        Required
                      </span>
                    )}
                    {section.isAIGenerated && (
                      <div className="flex items-center gap-1 text-purple-600">
                        <Bot className="w-4 h-4" />
                        <span className="text-xs">AI Generated</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded transition-colors hover:bg-gray-100 text-gray-400"
                      title="Comments"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {section.comments.length > 0 && (
                        <span className="ml-1 text-xs bg-red-600 text-white rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                          {section.comments.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <textarea
                    value={section.content}
                    onChange={(e) => {
                      const updatedSections = selectedPRD.sections.map(s =>
                        s.id === section.id 
                          ? { 
                              ...s, 
                              content: e.target.value,
                              lastModified: new Date().toISOString(),
                              modifiedBy: 'Current User',
                              wordCount: e.target.value.split(' ').length,
                              readingTime: Math.ceil(e.target.value.split(' ').length / 200)
                            } 
                          : s
                      );
                      setSelectedPRD({ ...selectedPRD, sections: updatedSections });
                    }}
                    className="textarea-field"
                    placeholder={`Enter ${section.title.toLowerCase()}...`}
                    rows={6}
                  />
                </div>

                {/* Section Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{section.wordCount} words</span>
                  <span>•</span>
                  <span>{section.readingTime} min read</span>
                  <span>•</span>
                  <span>Last modified: {new Date(section.lastModified).toLocaleDateString()}</span>
                  {section.isAIGenerated && (
                    <>
                      <span>•</span>
                      <span className="text-purple-600">AI Confidence: {section.confidence}%</span>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>

        {/* AI Sidebar */}
        {isAISidebarOpen && (
          <div className="fixed right-0 top-0 w-80 h-full bg-white border-l border-gray-200 z-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsAISidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask AI for suggestions..."
                  className="input-field flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateAI()}
                />
                <button
                  onClick={handleGenerateAI}
                  disabled={!aiPrompt.trim() || isGenerating}
                  className="btn-primary"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">AI Suggestions</h4>
              {aiSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-500">{suggestion.prompt}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAcceptSuggestion(suggestion)}
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                        title="Accept suggestion"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleRejectSuggestion(suggestion.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        title="Reject suggestion"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{suggestion.content}</p>
                  <div className="text-xs text-gray-500">
                    Confidence: {suggestion.confidence}% • {suggestion.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 'prd-list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">PRD Management</h2>
            <p className="text-gray-600">Manage Product Requirements Documents for {project.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={handleCreatePRD}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New PRD
            </button>
            <button
              onClick={() => setCurrentStep('overview')}
              className="btn-secondary"
            >
              ← Back to Overview
            </button>
          </div>
        </div>

        {/* PRD Grid/List View */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'>
          {prds.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No PRDs yet</h3>
              <p className="text-gray-500 mb-4">Create your first PRD to get started</p>
              <button
                onClick={handleCreatePRD}
                className="btn-primary"
              >
                Create First PRD
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            prds.map((prd) => (
              <div
                key={prd.id}
                className="card card-hover group"
                onClick={() => handleViewPRD(prd)}
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {prd.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {prd.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      {prd.isLocked && <Lock className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
                    {prd.description || 'No description'}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(prd.priority)}`}>
                      {prd.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(prd.stage)}`}>
                      {prd.stage}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                      {prd.type}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600 pt-3 border-t border-gray-100">
                    <div>
                      <FileText className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                      <span>{prd.sections.length}</span>
                    </div>
                    <div>
                      <MessageCircle className="w-4 h-4 mx-auto mb-1 text-green-600" />
                      <span>{prd.comments.length}</span>
                    </div>
                    <div>
                      <Bot className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                      <span>{prd.aiSuggestions.length}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span>v{prd.version}</span>
                      <span>{new Date(prd.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // List View
            prds.map((prd) => (
              <div
                key={prd.id}
                className="card card-hover"
                onClick={() => handleViewPRD(prd)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{prd.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(prd.priority)}`}>
                        {prd.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(prd.stage)}`}>
                        {prd.stage}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="capitalize">{prd.type}</span>
                      <span>•</span>
                      <span>v{prd.version}</span>
                      <span>•</span>
                      <span>Updated {new Date(prd.updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{prd.sections.length} sections</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{prd.comments.length} comments</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bot className="w-4 h-4" />
                        <span>{prd.aiSuggestions.length} AI suggestions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {prd.isLocked && (
                      <div className="text-yellow-500" title="Locked">
                        🔒
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle more options
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Overview step
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Thinking</h2>
          <p className="text-gray-600">Define your product strategy and requirements for {project.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentStep('prd-list')}
            className="btn-outline flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            PRD Management
          </button>
          <button
            onClick={() => setCurrentStep('prd-create')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New PRD
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total PRDs</p>
              <p className="text-2xl font-bold text-gray-900">{prds.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {prds.filter(p => p.stage === 'Edit' || p.stage === 'Generate').length}
              </p>
            </div>
            <Edit className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {prds.filter(p => p.stage === 'Approval' || p.stage === 'Update').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Suggestions</p>
              <p className="text-2xl font-bold text-gray-900">
                {prds.reduce((acc, prd) => acc + prd.aiSuggestions.length, 0)}
              </p>
            </div>
            <Bot className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Project PRDs - Grid View */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">PRDs for {project.name}</h3>
          {prds.length > 0 && (
            <button
              onClick={() => setCurrentStep('prd-list')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All ({prds.length}) →
            </button>
          )}
        </div>
        {prds.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No PRDs yet</h4>
            <p className="text-gray-500 mb-6">Create your first Product Requirements Document</p>
            <button
              onClick={handleCreatePRD}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create First PRD
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prds.map((prd) => (
              <div
                key={prd.id}
                className="card card-hover group cursor-pointer"
                onClick={() => handleViewPRD(prd)}
              >
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors mb-1">
                        {prd.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {prd.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {prd.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                      {prd.isLocked && <Lock className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(prd.priority)}`}>
                      {prd.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(prd.stage)}`}>
                      {prd.stage}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                      {prd.type}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600 pt-3 border-t border-gray-100 mt-auto">
                    <div>
                      <FileText className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                      <span>{prd.sections.length}</span>
                    </div>
                    <div>
                      <MessageCircle className="w-4 h-4 mx-auto mb-1 text-green-600" />
                      <span>{prd.comments.length}</span>
                    </div>
                    <div>
                      <Bot className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                      <span>{prd.aiSuggestions.length}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span>v{prd.version}</span>
                      <span>{new Date(prd.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCreatePRD}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <Plus className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Create New PRD</h4>
              <p className="text-sm text-gray-600">Start a new Product Requirements Document</p>
            </div>
          </button>
          
          <button
            onClick={() => setCurrentStep('prd-list')}
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <FileText className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <h4 className="font-medium text-gray-900 group-hover:text-green-600">Manage PRDs</h4>
              <p className="text-sm text-gray-600">View and edit existing PRDs</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
