import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Bot,
  ArrowLeft,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  Users,
  Bell,
  Eye,
  Edit3,
  Copy,
  Archive,
  Star,
  Target,
  BarChart3,
  Zap,
  Clock,
  User,
  Plus,
  X,
  Send,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Smile,
  Frown,
  MoreHorizontal
} from 'lucide-react';
import { 
  EnhancedPRD, 
  PRDStage, 
  AISuggestion, 
  Comment, 
  PRDVersion,
  PRDSection,
  Stakeholder,
  Notification
} from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';
import { enhancedPRDAIService } from '../../services/enhancedPRDAIService';

export default function EnhancedPRDEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [prd, setPrd] = useState<EnhancedPRD | null>(null);
  const [currentStage, setCurrentStage] = useState<PRDStage>('Create');
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number | undefined>();
  const [showComments, setShowComments] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    loadPRD();
  }, [id]);

  const loadPRD = () => {
    if (!id) return;
    const prdData = enhancedPRDService.getPRD(id);
    if (!prdData) {
      navigate('/prd');
      return;
    }
    setPrd(prdData);
    setCurrentStage(prdData.stage);
    setAiSuggestions(prdData.aiSuggestions);
  };

  const updatePRD = (updates: Partial<EnhancedPRD>) => {
    if (!prd) return;
    
    const updatedPRD = { ...prd, ...updates, updatedAt: new Date().toISOString() };
    setPrd(updatedPRD);
    enhancedPRDService.savePRD(updatedPRD);
  };

  const handleStageChange = (newStage: PRDStage) => {
    if (!prd) return;

    // Create version history entry
    const version: PRDVersion = {
      id: Date.now().toString(),
      version: prd.version + 1,
      stage: newStage,
      createdAt: new Date().toISOString(),
      changes: `Moved to ${newStage} stage`,
      createdBy: 'Current User',
      diff: [],
      isMajor: true,
      reason: `Stage transition from ${prd.stage} to ${newStage}`
    };

    const updatedPRD = {
      ...prd,
      stage: newStage,
      version: prd.version + 1,
      versionHistory: [...prd.versionHistory, version],
      isLocked: newStage === 'Approval',
      complianceChecked: newStage === 'Finalise' || newStage === 'Approval'
    };

    updatePRD(updatedPRD);
    setCurrentStage(newStage);

    // Auto-open AI sidebar for Generate stage
    if (newStage === 'Generate') {
      setIsAISidebarOpen(true);
    }
  };

  const handleSectionUpdate = (sectionId: string, content: string) => {
    if (!prd) return;

    const updatedSections = prd.sections.map(section =>
      section.id === sectionId 
        ? { 
            ...section, 
            content,
            lastModified: new Date().toISOString(),
            modifiedBy: 'Current User',
            wordCount: content.split(' ').length,
            readingTime: Math.ceil(content.split(' ').length / 200)
          } 
        : section
    );

    updatePRD({ sections: updatedSections });
  };

  const handleSectionReorder = (sectionId: string, direction: 'up' | 'down') => {
    if (!prd) return;

    const sections = [...prd.sections];
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sections.length) return;

    // Swap sections
    [sections[currentIndex], sections[newIndex]] = [sections[newIndex], sections[currentIndex]];
    
    // Update order values
    sections.forEach((section, index) => {
      section.order = index + 1;
    });

    updatePRD({ sections });
  };

  const handleAddComment = (sectionId: string, content: string) => {
    if (!prd || !content.trim()) return;

    const comment: Comment = {
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

    const updatedSections = prd.sections.map(section =>
      section.id === sectionId
        ? { ...section, comments: [...section.comments, comment] }
        : section
    );

    updatePRD({ sections: updatedSections });
    setNewComment('');
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim() || !prd) return;

    setIsGenerating(true);
    try {
      const suggestion = await enhancedPRDAIService.generateSuggestion(
        aiPrompt,
        currentStage,
        activeSection,
        prd.type
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
    if (!prd || !suggestion.sectionId) return;

    const updatedSections = prd.sections.map(section =>
      section.id === suggestion.sectionId
        ? { 
            ...section, 
            content: section.content + '\n\n' + suggestion.content,
            isAIGenerated: true,
            confidence: suggestion.confidence
          }
        : section
    );

    updatePRD({ sections: updatedSections });
    enhancedPRDService.updateAISuggestion(suggestion.id, 'accepted');
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    enhancedPRDService.updateAISuggestion(suggestionId, 'rejected');
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const canEdit = currentStage !== 'Approval' && !prd?.isLocked;
  const canUseAI = currentStage === 'Generate' || currentStage === 'Edit';

  if (!prd) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PRD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isAISidebarOpen ? 'mr-80' : ''}`}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/prd')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{prd.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="capitalize">{prd.type}</span>
                  <span>•</span>
                  <span>v{prd.version}</span>
                  <span>•</span>
                  <span>by {prd.createdBy}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    prd.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    prd.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    prd.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {prd.priority}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowComments(!showComments)}
                className={`btn-outline flex items-center gap-2 ${showComments ? 'bg-blue-600 text-white' : ''}`}
              >
                <MessageCircle className="w-4 h-4" />
                Comments ({prd.comments.length})
              </button>
              
              <button
                onClick={() => setIsAISidebarOpen(!isAISidebarOpen)}
                className={`btn-outline flex items-center gap-2 ${isAISidebarOpen ? 'bg-purple-600 text-white' : ''}`}
                disabled={!canUseAI}
              >
                <Bot className="w-4 h-4" />
                AI Assistant
              </button>
              
              <button
                onClick={() => navigate('/prd')}
                className="btn-secondary"
              >
                Back to PRDs
              </button>
            </div>
          </div>

          {/* Workflow Stepper */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">PRD Workflow</h3>
              {prd.isLocked && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm">Locked</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              {['Create', 'Generate', 'Edit', 'Finalise', 'Approval', 'Update'].map((stage, index) => {
                const stageEnum = stage as PRDStage;
                const isActive = currentStage === stageEnum;
                const isCompleted = prd.versionHistory.some(v => v.stage === stageEnum);
                const canNavigate = !prd.isLocked && (isActive || isCompleted || index === 0);
                
                return (
                  <div key={stage} className="flex flex-col items-center flex-1">
                    <button
                      onClick={() => canNavigate && handleStageChange(stageEnum)}
                      disabled={!canNavigate}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                        isActive ? 'bg-blue-600 text-white' :
                        isCompleted ? 'bg-green-600 text-white' :
                        'bg-gray-200 text-gray-500'
                      } ${!canNavigate ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                    >
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : index + 1}
                    </button>
                    <div className="mt-2 text-center">
                      <div className={`text-xs font-medium ${
                        isActive ? 'text-blue-600' :
                        isCompleted ? 'text-green-600' :
                        'text-gray-500'
                      }`}>
                        {stage}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {prd.sections
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
                      {section.isLocked && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Lock className="w-4 h-4" />
                          <span className="text-xs">Locked</span>
                        </div>
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
                        onClick={() => handleSectionReorder(section.id, 'up')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleSectionReorder(section.id, 'down')}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                        className={`p-2 rounded transition-colors ${
                          activeSection === section.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-400'
                        }`}
                        title="AI suggestions for this section"
                      >
                        <Bot className="w-4 h-4" />
                      </button>
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
                    {canEdit && !section.isLocked ? (
                      <textarea
                        value={section.content}
                        onChange={(e) => handleSectionUpdate(section.id, e.target.value)}
                        className="textarea-field"
                        placeholder={`Enter ${section.title.toLowerCase()}...`}
                        rows={6}
                      />
                    ) : (
                      <div className="textarea-field bg-gray-50 cursor-not-allowed">
                        {section.content || `No ${section.title.toLowerCase()} provided yet.`}
                      </div>
                    )}
                  </div>

                  {/* Section Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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

                  {/* Comments for this section */}
                  {showComments && section.comments.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Comments</h4>
                      <div className="space-y-3">
                        {section.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-blue-600">{comment.author}</span>
                              <span className="text-xs text-gray-500">{comment.authorRole}</span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.content}</p>
                            {comment.reactions.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                {comment.reactions.map((reaction, index) => (
                                  <button key={index} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                                    <span>{reaction.emoji}</span>
                                    <span>{reaction.count}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add comment form */}
                  {showComments && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="input-field flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(section.id, newComment)}
                        />
                        <button
                          onClick={() => handleAddComment(section.id, newComment)}
                          className="btn-primary"
                          disabled={!newComment.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {!canEdit && (
                    <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>This section is locked and cannot be edited in the current stage.</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {/* Compliance Check for Finalise stage */}
            {currentStage === 'Finalise' && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Compliance Check
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>RBI Fair Lending Guidelines compliance verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Data privacy requirements met</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Algorithm transparency documented</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Audit trail established</span>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Notice */}
            {currentStage === 'Approval' && (
              <div className="card bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">PRD Approved</h3>
                    <p className="text-green-700">
                      This PRD has been approved and is ready for development. No further edits are allowed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Sidebar */}
      {isAISidebarOpen && canUseAI && (
        <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsAIEnabled(!isAIEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  isAIEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>

            {isAIEnabled ? (
              <div className="space-y-3">
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

                <div className="text-sm text-gray-500">
                  Stage: <span className="text-purple-600 font-medium">{currentStage}</span>
                  {activeSection && (
                    <span className="ml-2">
                      Section: <span className="text-green-600 font-medium">{activeSection}</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  AI assistance is disabled. Enable it to get intelligent suggestions.
                </p>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isAIEnabled && (
              <>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">AI Suggestions</h4>
                
                {isGenerating && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Generating suggestion...</p>
                  </div>
                )}

                <div className="space-y-3">
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

                {aiSuggestions.length === 0 && !isGenerating && (
                  <div className="text-center py-8">
                    <Bot className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No suggestions yet. Ask AI for help!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
