import React from 'react';
import { Play, Pause, CheckCircle, AlertCircle, Zap, FileText, Edit3, Download, Brain, Sparkles } from 'lucide-react';
import { ResearchData } from '../../types';
import Button from '../shared/Button';
import PRDGenerator from './PRDGenerator';

// Function to format PRD content with beautiful typography
const formatPRDContent = (content: string): string => {
  if (!content) return '';
  
  // Split content into lines for better processing
  const lines = content.split('\n');
  const formattedLines: string[] = [];
  let inList = false;
  let listType = '';
  let listItems: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Headers with beautiful styling
    if (trimmedLine.startsWith('# ')) {
      if (inList) {
        formattedLines.push(closeList());
        inList = false;
      }
      formattedLines.push(`<div class="mb-8 mt-12 first:mt-0">
        <h1 class="text-3xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-lg">
          ${trimmedLine.substring(2)}
        </h1>
      </div>`);
    } else if (trimmedLine.startsWith('## ')) {
      if (inList) {
        formattedLines.push(closeList());
        inList = false;
      }
      formattedLines.push(`<div class="mb-6 mt-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-md">
          ${trimmedLine.substring(3)}
        </h2>
      </div>`);
    } else if (trimmedLine.startsWith('### ')) {
      if (inList) {
        formattedLines.push(closeList());
        inList = false;
      }
      formattedLines.push(`<div class="mb-5 mt-6">
        <h3 class="text-xl font-medium text-gray-900 mb-2 flex items-center">
          <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
          ${trimmedLine.substring(4)}
        </h3>
      </div>`);
    } else if (trimmedLine.startsWith('#### ')) {
      if (inList) {
        formattedLines.push(closeList());
        inList = false;
      }
      formattedLines.push(`<div class="mb-4 mt-5">
        <h4 class="text-lg font-medium text-gray-800 mb-2 pl-4 border-l-4 border-blue-300">
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
      listItems.push(`<li class="mb-3 pl-4 relative">
        <div class="absolute left-0 top-2 w-2 h-2 bg-blue-500 rounded-full"></div>
        <div class="ml-4">${formatInlineMarkdown(trimmedLine.substring(2))}</div>
      </li>`);
    } else if (/^\d+\. /.test(trimmedLine)) {
      if (!inList || listType !== 'ol') {
        if (inList) formattedLines.push(closeList());
        inList = true;
        listType = 'ol';
        listItems = [];
      }
      const listItem = trimmedLine.replace(/^\d+\. /, '');
      listItems.push(`<li class="mb-3 pl-4 relative">
        <div class="absolute left-0 top-2 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">
          ${trimmedLine.match(/^\d+/)?.[0]}
        </div>
        <div class="ml-8">${formatInlineMarkdown(listItem)}</div>
      </li>`);
    }
    // Empty lines
    else if (trimmedLine === '') {
      if (inList) {
        formattedLines.push(closeList());
        inList = false;
      }
      formattedLines.push('<div class="h-4"></div>');
    }
    // Regular paragraphs
    else {
      if (inList) {
        formattedLines.push(closeList());
        inList = false;
      }
      if (trimmedLine) {
        formattedLines.push(`<div class="mb-4 leading-relaxed text-gray-700">
          <p class="text-base">${formatInlineMarkdown(line)}</p>
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
    const listClass = listType === 'ul' ? 'space-y-2' : 'space-y-3';
    const result = `<div class="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
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
  return text
    // Bold text with better styling
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 bg-yellow-100 px-1 rounded">$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>')
    // Inline code with better styling
    .replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm font-mono border">$1</code>')
    // Links with better styling
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline font-medium">$1</a>')
    // Highlight important terms
    .replace(/\b(important|critical|key|essential|priority)\b/gi, '<span class="bg-red-100 text-red-800 px-1 rounded font-medium">$1</span>');
};

interface AIResearchEngineProps {
  researchData: ResearchData;
  isRunning: boolean;
  onRunResearch: () => void;
  onResearchComplete: (data: ResearchData) => void;
  onPRDGenerated?: (prd: any) => void;
}

export default function AIResearchEngine({ 
  researchData, 
  isRunning, 
  onRunResearch, 
  onResearchComplete,
  onPRDGenerated 
}: AIResearchEngineProps) {
  const [showPRDGenerator, setShowPRDGenerator] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [finalizedPRD, setFinalizedPRD] = React.useState<any>(null);

  // Check for existing PRD on component mount
  React.useEffect(() => {
    const savedPRD = localStorage.getItem(`prd-generated-${researchData?.id}`);
    if (savedPRD) {
      try {
        const prdData = JSON.parse(savedPRD);
        if (prdData.status === 'finalized') {
          setFinalizedPRD(prdData);
          setShowPRDGenerator(true);
        }
      } catch (error) {
        console.error('Error loading saved PRD:', error);
      }
    }
  }, [researchData?.id]);

  const handlePRDGenerated = (prd: any) => {
    if (onPRDGenerated) {
      onPRDGenerated(prd);
    }
  };

  const handlePRDFinalized = (prd: any) => {
    setFinalizedPRD(prd);
    setIsEditMode(false);
    if (onPRDGenerated) {
      onPRDGenerated(prd);
    }
  };

  const handleEditPRD = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const downloadPRD = () => {
    if (finalizedPRD) {
      const element = document.createElement('a');
      const file = new Blob([finalizedPRD.content], { type: 'text/markdown' });
      element.href = URL.createObjectURL(file);
      element.download = `${finalizedPRD.title || 'PRD'}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  // If we have a finalized PRD and not in edit mode, show view-only
  if (finalizedPRD && !isEditMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Product Requirements Document</h3>
            <p className="text-gray-600 text-sm mt-1">
              {finalizedPRD.title} • Generated {new Date(finalizedPRD.generatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleEditPRD}
              leftIcon={<Edit3 className="w-4 h-4" />}
              variant="outline"
            >
              Edit PRD
            </Button>
            <Button
              onClick={downloadPRD}
              leftIcon={<Download className="w-4 h-4" />}
              variant="outline"
            >
              Download
            </Button>
          </div>
        </div>

        {/* View-only PRD Display */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <div 
              className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{
                __html: formatPRDContent(finalizedPRD.content)
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showPRDGenerator ? (
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Instant AI Research Engine</h3>
            <p className="text-gray-600">Get immediate AI-powered insights and comprehensive Product Requirements Documents in seconds</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-700">
                <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                  Instant Results
                </div>
                <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Brain className="w-5 h-5 text-blue-500 mr-2" />
                  AI-Powered
                </div>
                <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                  No Timelines
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Single Form Input
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Instant AI Generation
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Real-time Editing
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Immediate Download
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setShowPRDGenerator(true)}
                    leftIcon={<Brain className="w-5 h-5" />}
                    className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
                  >
                    Start Instant Research
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit PRD' : 'PRD Generator'}
            </h3>
            <div className="flex space-x-2">
              {isEditMode && (
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                onClick={() => setShowPRDGenerator(false)}
                variant="outline"
              >
                Back to Overview
              </Button>
            </div>
          </div>
          
          <PRDGenerator
            project={researchData}
            onPRDGenerated={handlePRDGenerated}
            onPRDFinalized={handlePRDFinalized}
            isEditMode={isEditMode}
            existingPRD={finalizedPRD}
          />
        </div>
      )}
    </div>
  );
}
