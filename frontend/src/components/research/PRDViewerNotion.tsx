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
  EyeOff,
  Image as ImageIcon,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import Button from '../shared/Button';

interface PRDViewerNotionProps {
  project: any;
  prd: any;
  onEdit?: () => void;
  onFinalize?: () => void;
  onMoveToNext?: () => void;
}

const PRDViewerNotion: React.FC<PRDViewerNotionProps> = ({
  project,
  prd,
  onEdit,
  onFinalize,
  onMoveToNext
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  // Clean content function - more aggressive cleaning
  const cleanContent = (content: string): string => {
    if (!content || typeof content !== 'string') {
      console.warn('PRDViewerNotion cleanContent: Invalid content provided:', content);
      return '';
    }
    
    let cleaned;
    try {
      cleaned = content
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
    } catch (error) {
      console.error('Error in PRDViewerNotion cleanContent:', error);
      return '';
    }
    
    return cleaned;
  };

  // Parse PRD content into sections
  const parsePRDContent = (content: string) => {
    if (!content || typeof content !== 'string') {
      console.warn('PRDViewerNotion parsePRDContent: Invalid content provided:', content);
      return [];
    }
    
    try {
      const cleaned = cleanContent(content);
      if (!cleaned) {
        return [];
      }
      
      const sections = [];
      const lines = cleaned.split('\n');
      let currentSection = null;
      let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) continue;
      
      // Check for main headings
      if (trimmed.match(/^(Executive Summary|Problem Statement|Solution Overview|Key Features|Target Users|User Personas|Functional Requirements|Non-Functional Requirements|Success Metrics|Implementation Plan|Risks and Assumptions|Next Steps|Competitive Advantage)/i)) {
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
    } catch (error) {
      console.error('Error in PRDViewerNotion parsePRDContent:', error);
      return [{
        id: 'error',
        title: 'Error',
        type: 'main',
        icon: <AlertTriangle className="w-5 h-5" />,
        content: '<div class="prose prose-lg max-w-none"><p class="text-red-600">Error parsing content. Please try again.</p></div>'
      }];
    }
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
    if (lower.includes('competitive') || lower.includes('advantage')) return <Target className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const sections = parsePRDContent(prd?.content || '');

  return (
    <div className="min-h-screen bg-white">
      {/* Notion-style Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project?.name || 'Product Requirements Document'}</h1>
                <p className="text-gray-500 text-sm">Created by Product Manager • {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={onEdit}
                variant="outline"
                leftIcon={<Edit3 className="w-4 h-4" />}
                className="text-sm"
              >
                Edit
              </Button>
              <Button
                onClick={onMoveToNext}
                leftIcon={<ArrowRight className="w-4 h-4" />}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white"
              >
                Move to Research
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Notion-style */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Document Status */}
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Document Status: Complete</span>
          </div>
          <p className="text-sm text-green-700 mt-1">This PRD has been completed and is ready for the next phase of development.</p>
        </div>

        {/* Document Content */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={section.id} className="group">
              {/* Section Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  {section.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {section.title}
                </h2>
              </div>
              
              {/* Section Content */}
              <div className="ml-12">
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: section.content
                  }}
                />
              </div>
            </div>
          ))}

          {/* Image References Section */}
          {prd?.imageReferences && prd.imageReferences.length > 0 && (
            <div className="group">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Image References
                </h2>
              </div>
              
              <div className="ml-12">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {prd.imageReferences.map((image: any, index: number) => (
                    <div key={index} className="relative group/image">
                      <img
                        src={image.url || URL.createObjectURL(image)}
                        alt={`Reference ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <button className="opacity-0 group-hover/image:opacity-100 bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 truncate">{image.name || `Reference ${index + 1}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Created by Product Manager</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRDViewerNotion;

