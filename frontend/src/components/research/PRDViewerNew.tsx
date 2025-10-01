import React, { useState } from 'react';
import { 
  FileText, 
  Edit3, 
  Download, 
  CheckCircle, 
  ArrowRight,
  Calendar,
  User,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Clock,
  Star,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '../shared/Button';

interface PRDViewerNewProps {
  project: any;
  prd: any;
  onEdit?: () => void;
  onFinalize?: () => void;
  onMoveToNext?: () => void;
  userRole?: string;
}

const PRDViewerNew: React.FC<PRDViewerNewProps> = ({
  project,
  prd,
  onEdit,
  onFinalize,
  onMoveToNext,
  userRole = 'PM'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  // Clean content function - more aggressive cleaning
  const cleanContent = (content: string): string => {
    if (!content) return '';
    
    let cleaned = content
      // Remove all CSS class patterns (more comprehensive)
      .replace(/\d+\s+[a-z-]+-[a-z0-9]+(?:\s+[a-z-]+-[a-z0-9]+)*/g, '')
      .replace(/[a-z-]+-[a-z0-9]+(?:\s+[a-z-]+-[a-z0-9]+)*/g, '')
      .replace(/\b\d+\b(?=\s*[a-z-]+-[a-z0-9]+)/g, '')
      .replace(/\b\d+\b(?=\s*[a-z-]+-[a-z0-9]+)/g, '')
      // Remove standalone numbers that are likely CSS artifacts
      .replace(/\b\d+\b(?=\s*[a-z-]+)/g, '')
      // Remove any remaining CSS-like patterns
      .replace(/[a-z-]+-[a-z0-9]+/g, '')
      // Clean up markdown artifacts
      .replace(/##\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      // Remove HTML tags that might be malformed
      .replace(/<[^>]*>/g, '')
      // Clean up extra spaces and line breaks
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\s+\n/g, '\n')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
    
    return cleaned;
  };

  // Parse PRD content into sections
  const parsePRDContent = (content: string) => {
    const cleaned = cleanContent(content);
    const sections = [];
    const lines = cleaned.split('\n');
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) continue;
      
      // Check for main headings (look for patterns like "Executive Summary", "Problem Statement", etc.)
      if (trimmed.match(/^(Executive Summary|Problem Statement|Solution Overview|Key Features|Target Users|User Personas|Functional Requirements|Non-Functional Requirements|Success Metrics|Implementation Plan|Risks and Assumptions|Next Steps)/i)) {
        if (currentSection) {
          sections.push({ ...currentSection, content: currentContent.join('\n') });
        }
        currentSection = {
          id: trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          title: trimmed,
          type: 'main',
          icon: getSectionIcon(trimmed)
        };
        currentContent = [];
      } else if (trimmed.match(/^(Objectives|Goals|Features|Requirements|Metrics|Plan|Risks|Assumptions)/i)) {
        if (currentSection) {
          sections.push({ ...currentSection, content: currentContent.join('\n') });
        }
        currentSection = {
          id: trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          title: trimmed,
          type: 'section',
          icon: getSectionIcon(trimmed)
        };
        currentContent = [];
      } else if (trimmed.startsWith('### ')) {
        if (currentSection) {
          currentContent.push(`<h3 class="text-lg font-semibold text-gray-800 mb-2 mt-4">${trimmed.substring(4)}</h3>`);
        }
      } else if (trimmed.startsWith('- ') || /^\d+\. /.test(trimmed)) {
        const isNumbered = /^\d+\. /.test(trimmed);
        const text = trimmed.replace(/^[-•]\s*|\d+\.\s*/, '');
        const listClass = isNumbered ? 'list-decimal' : 'list-disc';
        currentContent.push(`<li class="mb-2 text-gray-700">${text}</li>`);
      } else if (trimmed) {
        if (currentContent.length > 0 && currentContent[currentContent.length - 1].startsWith('<li')) {
          currentContent.push(`<li class="mb-2 text-gray-700">${trimmed}</li>`);
        } else {
          currentContent.push(`<p class="mb-3 text-gray-700 leading-relaxed">${trimmed}</p>`);
        }
      }
    }

    if (currentSection) {
      sections.push({ ...currentSection, content: currentContent.join('\n') });
    }

    // If no sections were found, create a default one with all content
    if (sections.length === 0 && cleaned) {
      sections.push({
        id: 'content',
        title: 'Product Requirements Document',
        type: 'main',
        icon: getSectionIcon('Product Requirements Document'),
        content: `<div class="prose prose-lg max-w-none"><p class="text-gray-700 leading-relaxed">${cleaned.replace(/\n/g, '<br>')}</p></div>`
      });
    }

    return sections;
  };

  const getSectionIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('executive') || lower.includes('summary')) return <Zap className="w-5 h-5" />;
    if (lower.includes('problem')) return <AlertTriangle className="w-5 h-5" />;
    if (lower.includes('solution')) return <Lightbulb className="w-5 h-5" />;
    if (lower.includes('target') || lower.includes('user')) return <Users className="w-5 h-5" />;
    if (lower.includes('functional') || lower.includes('requirement')) return <Settings className="w-5 h-5" />;
    if (lower.includes('success') || lower.includes('metric')) return <TrendingUp className="w-5 h-5" />;
    if (lower.includes('implementation') || lower.includes('plan')) return <Calendar className="w-5 h-5" />;
    if (lower.includes('risk')) return <Shield className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const sections = parsePRDContent(prd?.content || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project?.name || 'Product Requirements Document'}</h1>
                <p className="text-gray-600 mt-1">Comprehensive product specification and requirements</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
              </div>
              {/* Only PM can edit */}
              {userRole === 'PM' && onEdit && (
                <Button
                  onClick={onEdit}
                  variant="outline"
                  leftIcon={<Edit3 className="w-4 h-4" />}
                  className="px-4 py-2"
                >
                  Edit
                </Button>
              )}
              {/* Only PM can move to next stage */}
              {userRole === 'PM' && onMoveToNext && (
                <Button
                  onClick={onMoveToNext}
                  leftIcon={<ArrowRight className="w-4 h-4" />}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  Move to Research
                </Button>
              )}
              {/* Show view-only indicator for non-PM users */}
              {userRole !== 'PM' && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  View Only - Only PM can edit
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Document Sections
                </h3>
                <nav className="space-y-2">
                  {sections.map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <div className="text-blue-500">{section.icon}</div>
                      <span className="truncate">{section.title}</span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sections</span>
                    <span className="font-semibold text-gray-900">{sections.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Complete</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm text-gray-900">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Document */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Document Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Product Requirements Document</h2>
                    <p className="text-gray-600 mt-1">Version 1.0 • {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setShowFullContent(!showFullContent)}
                      variant="outline"
                      leftIcon={showFullContent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      className="text-sm"
                    >
                      {showFullContent ? 'Collapse' : 'Expand All'}
                    </Button>
                    <Button
                      onClick={() => {/* Download logic */}}
                      variant="outline"
                      leftIcon={<Download className="w-4 h-4" />}
                      className="text-sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {/* Document Content */}
              <div className="p-8">
                {sections.map((section, index) => (
                  <div key={section.id} id={section.id} className="mb-12 last:mb-0">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        {section.icon}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                    </div>
                    
                    <div className="prose prose-lg max-w-none">
                      <div 
                        className="text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: section.content
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Document Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Document Status</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      This PRD has been completed and is ready for the next phase of development. 
                      All requirements have been documented and approved.
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Created by Product Manager</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRDViewerNew;
