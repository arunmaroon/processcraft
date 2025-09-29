import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Edit3, 
  Save, 
  X, 
  ArrowUp
} from 'lucide-react';
import { Project, PRD } from '../../types';
import Button from '../shared/Button';
import PRDGenerator from './PRDGenerator';

interface PRDViewerProps {
  project: Project;
  prd: PRD;
  onPRDUpdate?: (updatedPRD: PRD) => void;
}

export default function PRDViewer({ project, prd, onPRDUpdate }: PRDViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasscodeForm, setShowPasscodeForm] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [displayPRD, setDisplayPRD] = useState<PRD>(prd);
  const [showEditForm, setShowEditForm] = useState(false);
  const [savedFormData, setSavedFormData] = useState<any>(null);
  const [generatedPRD, setGeneratedPRD] = useState<any>(null);

  useEffect(() => {
    console.log('🔍 PRD Data received:', JSON.stringify(prd, null, 2));
    
    // Check if we need to load from localStorage
    if (!prd.content && project?.id) {
      const savedPRD = localStorage.getItem(`prd-generated-${project.id}`);
      if (savedPRD) {
        try {
          const parsedPRD = JSON.parse(savedPRD);
          console.log('🔍 Loaded PRD from localStorage:', parsedPRD);
          setDisplayPRD(parsedPRD);
          return;
        } catch (error) {
          console.error('Error parsing saved PRD:', error);
        }
      }
    }
    
    setDisplayPRD(prd);
  }, [prd, project?.id]);

  // Load saved form data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem(`pm-form-data-${project.id}`);
    if (savedData) {
      try {
        setSavedFormData(JSON.parse(savedData));
      } catch (err) {
        console.error('Failed to load saved form data:', err);
      }
    }
  }, [project.id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditClick = () => {
    setShowPasscodeForm(true);
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '01234') {
      setShowEditForm(true);
      setShowPasscodeForm(false);
    } else {
      alert('Incorrect passcode');
    }
  };

  const handleSave = () => {
    if (onPRDUpdate) {
      onPRDUpdate(displayPRD);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDisplayPRD(prd);
    setIsEditing(false);
  };

  const handlePRDGenerated = (generatedPRD: any) => {
    console.log('New PRD generated from edit form:', generatedPRD);
    setGeneratedPRD(generatedPRD);
  };

  const handlePRDFinalized = (finalPRD: PRD) => {
    console.log('PRD finalized from edit form:', finalPRD);
    if (onPRDUpdate) {
      onPRDUpdate(finalPRD);
    }
    setShowEditForm(false);
  };

  const handleFormCancel = () => {
    setShowEditForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Clean and format PRD content to remove malformed HTML
  const cleanPRDContent = (content: string): string => {
    if (!content || typeof content !== 'string') {
      console.warn('PRDViewer cleanPRDContent: Invalid content provided:', content);
      return '';
    }
    
    try {
      // Aggressive cleaning - remove ALL CSS class patterns
      let cleaned = content
        // Remove any number followed by CSS classes (any combination)
        .replace(/\d+\s+[a-z-]+-[a-z0-9]+(?:\s+[a-z-]+-[a-z0-9]+)*/g, '')
        // Remove any remaining CSS class patterns
        .replace(/[a-z-]+-[a-z0-9]+(?:\s+[a-z-]+-[a-z0-9]+)*/g, '')
        // Remove any standalone numbers
        .replace(/\b\d+\b/g, '')
        // Clean up extra spaces and line breaks
        .replace(/\s+/g, ' ')
        .replace(/\n\s+/g, '\n')
        .replace(/\s+\n/g, '\n')
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .trim();
      
      return cleaned;
    } catch (error) {
      console.error('Error in PRDViewer cleanPRDContent:', error);
      return '';
    }
  };

  // Format PRD content with beautiful typography
  const formatPRDContent = (content: string): string => {
    if (!content || content === 'No PRD content available.') return '<div class="text-center py-12 text-gray-500"><p>No PRD content available.</p></div>';
    
    // Clean the content first
    const cleanedContent = cleanPRDContent(content);
    
    // Check if content is already HTML (contains HTML tags)
    if (cleanedContent.includes('<') && cleanedContent.includes('>')) {
      // Content is already HTML, just return it with proper styling wrapper
      return `<div class="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900">${cleanedContent}</div>`;
    }
    
    // Split content into lines for better processing
    const lines = content.split('\n');
    const formattedLines: string[] = [];
    let inList = false;
    let listType = '';
    let listItems: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Code blocks
      if (trimmedLine.startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          formattedLines.push(`<div class="mb-6 bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre class="text-gray-100 text-sm font-mono"><code>${codeBlockContent.join('\n')}</code></pre>
          </div>`);
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          // Start code block
          if (inList) {
            formattedLines.push(closeList());
            inList = false;
          }
          inCodeBlock = true;
        }
        continue;
      }
      
      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }
      
      // Headers with beautiful styling
      if (trimmedLine.startsWith('# ')) {
        if (inList) {
          formattedLines.push(closeList());
          inList = false;
        }
        formattedLines.push(`<div class="mb-8 mt-12 first:mt-0">
          <h1 class="text-4xl font-bold text-gray-900 mb-6 pb-4 border-b-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 rounded-xl shadow-sm">
            ${trimmedLine.substring(2)}
          </h1>
        </div>`);
      } else if (trimmedLine.startsWith('## ')) {
        if (inList) {
          formattedLines.push(closeList());
          inList = false;
        }
        formattedLines.push(`<div class="mb-8 mt-10">
          <h2 class="text-3xl font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-gray-300 bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 rounded-lg shadow-sm">
            ${trimmedLine.substring(3)}
          </h2>
        </div>`);
      } else if (trimmedLine.startsWith('### ')) {
        if (inList) {
          formattedLines.push(closeList());
          inList = false;
        }
        formattedLines.push(`<div class="mb-6 mt-8">
          <h3 class="text-2xl font-medium text-gray-900 mb-3 flex items-center">
            <div class="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            ${trimmedLine.substring(4)}
          </h3>
        </div>`);
      } else if (trimmedLine.startsWith('#### ')) {
        if (inList) {
          formattedLines.push(closeList());
          inList = false;
        }
        formattedLines.push(`<div class="mb-5 mt-6">
          <h4 class="text-xl font-medium text-gray-800 mb-2 pl-4 border-l-4 border-blue-300 bg-blue-50 py-2 px-4 rounded-r-lg">
            ${trimmedLine.substring(5)}
          </h4>
        </div>`);
      }
      // Lists with beautiful styling
      else if (trimmedLine.startsWith('- ')) {
        if (!inList || listType !== 'ul') {
          if (inList) formattedLines.push(closeList());
          inList = true;
          listType = 'ul';
          listItems = [];
        }
        listItems.push(`<li class="mb-4 pl-6 relative">
          <div class="absolute left-0 top-3 w-2 h-2 bg-blue-500 rounded-full"></div>
          <div class="ml-4 text-gray-700 leading-relaxed">${formatInlineMarkdown(trimmedLine.substring(2))}</div>
        </li>`);
      } else if (/^\d+\. /.test(trimmedLine)) {
        if (!inList || listType !== 'ol') {
          if (inList) formattedLines.push(closeList());
          inList = true;
          listType = 'ol';
          listItems = [];
        }
        const listItem = trimmedLine.replace(/^\d+\. /, '');
        listItems.push(`<li class="mb-4 pl-6 relative">
          <div class="absolute left-0 top-2 w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
            ${trimmedLine.match(/^\d+/)?.[0]}
          </div>
          <div class="ml-10 text-gray-700 leading-relaxed">${formatInlineMarkdown(listItem)}</div>
        </li>`);
      }
      // Empty lines
      else if (trimmedLine === '') {
        if (inList) {
          formattedLines.push(closeList());
          inList = false;
        }
        formattedLines.push('<div class="h-6"></div>');
      }
      // Regular paragraphs
      else {
        if (inList) {
          formattedLines.push(closeList());
          inList = false;
        }
        if (trimmedLine) {
          formattedLines.push(`<div class="mb-6 leading-relaxed text-gray-700">
            <p class="text-lg">${formatInlineMarkdown(line)}</p>
          </div>`);
        }
      }
    }
    
    // Close any open list
    if (inList) {
      formattedLines.push(closeList());
    }
    
    function closeList() {
      if (listItems.length === 0) return '';
      const listClass = listType === 'ul' ? 'space-y-3' : 'space-y-4';
      const result = `<div class="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 shadow-sm">
        <${listType} class="${listClass}">
          ${listItems.join('')}
        </${listType}>
      </div>`;
      listItems = [];
      return result;
    }
    
    return formattedLines.join('\n');
  };

  // Enhanced inline markdown formatting
  const formatInlineMarkdown = (text: string): string => {
    if (!text || typeof text !== 'string') {
      console.warn('PRDViewer formatInlineMarkdown: Invalid text provided:', text);
      return '';
    }
    
    try {
      // First, escape any existing HTML to prevent double-encoding
      let escapedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      
      return escapedText
        // Bold text with better styling
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 bg-yellow-100 px-2 py-1 rounded-md shadow-sm">$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600 font-medium">$1</em>')
        // Inline code with better styling
        .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-gray-100 px-3 py-1 rounded-md text-sm font-mono border border-gray-600 shadow-sm">$1</code>')
        // Links with better styling
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline font-medium hover:bg-blue-50 px-1 py-0.5 rounded transition-colors">$1</a>')
        // Highlight important terms
        .replace(/\b(important|critical|key|essential|priority|target|goal|objective)\b/gi, '<span class="bg-red-100 text-red-800 px-2 py-1 rounded-md font-semibold shadow-sm">$1</span>')
        // Highlight metrics and percentages
        .replace(/\b(\d+%|\d+\.\d+%)\b/g, '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-md font-semibold">$1</span>')
        // Highlight numbers
        .replace(/\b(\d+)\b/g, '<span class="bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-medium">$1</span>');
    } catch (error) {
      console.error('Error in PRDViewer formatInlineMarkdown:', error);
      return text || '';
    }
  };

  // If editing form is shown, render the PRDGenerator
  if (showEditForm) {
    return (
      <PRDGenerator
        project={project}
        prd={prd}
        onPRDGenerated={handlePRDGenerated}
        onPRDFinalized={handlePRDFinalized}
        isEditing={true}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Product Requirements Document</h1>
                  <p className="text-gray-600">{project.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleEditClick}
                    leftIcon={<Edit3 className="w-4 h-4" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Download
                  </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PRD Content - Clean and Focused */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div 
                className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{
                  __html: formatPRDContent(
                    displayPRD.content || 
                    displayPRD.generatedContent?.content || 
                    displayPRD.sections?.overview || 
                    displayPRD.description ||
                    (displayPRD as any)?.content ||
                    (displayPRD as any)?.generatedContent ||
                    'No PRD content available.'
                  )
                }}
              />
                      </div>
                    </div>
                  </div>
          </div>

          {/* Back to Top Button */}
          {showBackToTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}

          {/* Passcode Modal */}
          {showPasscodeForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter Passcode to Edit</h3>
                <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passcode
                    </label>
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter passcode"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasscodeForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Submit
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
    </div>
  );
}