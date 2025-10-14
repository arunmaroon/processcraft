import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Target, 
  CheckCircle, 
  Edit,
  Download,
  Share2,
  Printer,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Lock
} from 'lucide-react';
import { EnhancedPRD } from '../../types/prd-enhanced';

interface PRDReadViewProps {
  prd: EnhancedPRD;
  onEdit: () => void;
  onClose: () => void;
}

export default function PRDReadView({ prd, onEdit, onClose }: PRDReadViewProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(prd.sections.map(s => s.id))
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      Critical: 'bg-red-100 text-red-800',
      High: 'bg-orange-100 text-orange-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStageColor = (stage: string) => {
    const colors = {
      Create: 'bg-blue-100 text-blue-800',
      Generate: 'bg-purple-100 text-purple-800',
      Edit: 'bg-yellow-100 text-yellow-800',
      Finalise: 'bg-orange-100 text-orange-800',
      Approval: 'bg-green-100 text-green-800',
      Update: 'bg-indigo-100 text-indigo-800'
    };
    return colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalWords = prd.sections.reduce((sum, s) => sum + s.wordCount, 0);
  const totalReadingTime = prd.sections.reduce((sum, s) => sum + s.readingTime, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Actions Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              ← Back
            </button>
            
            <div className="flex items-center gap-2">
              <button className="btn-icon-sm" title="Print">
                <Printer className="w-4 h-4" />
              </button>
              <button className="btn-icon-sm" title="Share">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="btn-icon-sm" title="Download">
                <Download className="w-4 h-4" />
              </button>
              {!prd.isLocked && (
                <button 
                  onClick={onEdit}
                  className="btn-primary flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit PRD
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* PRD Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-12 py-16 text-white">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-wide">
                    {prd.type}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full ${getPriorityColor(prd.priority)} bg-opacity-90`}>
                    {prd.priority} Priority
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold mb-4 leading-tight">
                  {prd.title}
                </h1>
                
                {prd.description && (
                  <p className="text-xl text-blue-100 leading-relaxed max-w-3xl">
                    {prd.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-6">
                {prd.isLocked && (
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <Lock className="w-6 h-6" />
                  </div>
                )}
              </div>
            </div>

            {/* Meta Information Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-white/20">
              <div>
                <div className="flex items-center gap-2 text-blue-200 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Owner</span>
                </div>
                <p className="font-semibold">{prd.owner}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-blue-200 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Created</span>
                </div>
                <p className="font-semibold">{new Date(prd.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-blue-200 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Stage</span>
                </div>
                <p className="font-semibold">{prd.stage}</p>
              </div>
              
              <div>
                <div className="flex items-center gap-2 text-blue-200 mb-1">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-wide">Version</span>
                </div>
                <p className="font-semibold">v{prd.version}</p>
              </div>
            </div>
          </div>

          {/* Document Stats Bar */}
          <div className="bg-gray-50 px-12 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{prd.sections.length} sections</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{totalWords.toLocaleString()} words</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{totalReadingTime} min read</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500">
                <span>Last updated:</span>
                <span className="font-medium text-gray-700">
                  {new Date(prd.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PRD Sections */}
        <div className="space-y-6">
          {prd.sections
            .sort((a, b) => a.order - b.order)
            .map((section, index) => {
              const isExpanded = expandedSections.has(section.id);
              
              return (
                <div 
                  key={section.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl"
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-8 py-5 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      
                      <div className="text-left">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          {section.title}
                          {section.isRequired && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-normal">
                              Required
                            </span>
                          )}
                          {section.isAIGenerated && (
                            <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-normal">
                              <Sparkles className="w-3 h-3" />
                              AI Generated
                            </span>
                          )}
                        </h2>
                        
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{section.wordCount} words</span>
                          <span>•</span>
                          <span>{section.readingTime} min</span>
                          {section.isAIGenerated && (
                            <>
                              <span>•</span>
                              <span className="text-purple-600">Confidence: {section.confidence}%</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Section Content */}
                  {isExpanded && (
                    <div className="px-8 py-6 border-t border-gray-100">
                      <div className="prose prose-lg max-w-none">
                        {section.content ? (
                          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {section.content}
                          </div>
                        ) : (
                          <div className="text-gray-400 italic text-center py-8">
                            No content available for this section
                          </div>
                        )}
                      </div>
                      
                      {/* Section Footer */}
                      {section.lastModified && (
                        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                          <span>
                            Last modified by <span className="font-medium text-gray-700">{section.modifiedBy}</span>
                          </span>
                          <span>
                            {new Date(section.lastModified).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm">
              Document Status: <span className={`font-semibold ${getStageColor(prd.stage)}`}>{prd.stage}</span>
            </span>
          </div>
          
          <p className="text-xs text-gray-400">
            Generated on {new Date(prd.createdAt).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })} using ProcessCraft with Enhanced Carlin Yuen PRD methodology
          </p>
        </div>
      </div>
    </div>
  );
}

