import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Edit3, 
  Save, 
  X,
  User,
  Target,
  BarChart3,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react';
import Button from '../shared/Button';

interface PMFormData {
  productName: string;
  productDescription: string;
  targetUsers: string;
  problemStatement: string;
  businessGoals: string;
  keyFeatures: string[];
  successMetrics: string[];
  constraints: string[];
  competitiveAdvantage: string;
  userPersonas: Array<{
    name: string;
    demographics: string;
    painPoints: string[];
    goals: string[];
  }>;
}

interface PRDData {
  id: string;
  title: string;
  content: string;
  status: 'generated' | 'editing' | 'finalized';
  generatedAt: string;
  metadata?: {
    generatedBy: string;
    confidence: number;
    source: string;
  };
}

interface PRDGeneratorProps {
  project: any;
  onPRDGenerated?: (prd: PRDData) => void;
  onPRDFinalized?: (prd: PRDData) => void;
  isEditMode?: boolean;
  existingPRD?: PRDData | null;
}

export default function PRDGenerator({ project, onPRDGenerated, onPRDFinalized, isEditMode = false, existingPRD = null }: PRDGeneratorProps) {
  const [formData, setFormData] = useState<PMFormData>({
    productName: project?.name || '',
    productDescription: project?.description || '',
    targetUsers: '',
    problemStatement: '',
    businessGoals: '',
    keyFeatures: [''],
    successMetrics: [''],
    constraints: [''],
    competitiveAdvantage: '',
    userPersonas: [{
      name: '',
      demographics: '',
      painPoints: [''],
      goals: ['']
    }]
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPRD, setGeneratedPRD] = useState<PRDData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-save form data
  useEffect(() => {
    const saveData = () => {
      localStorage.setItem(`prd-form-${project?.id}`, JSON.stringify(formData));
    };
    
    const timeoutId = setTimeout(saveData, 500);
    return () => clearTimeout(timeoutId);
  }, [formData, project?.id]);

  // Load saved PRD data on component mount
  useEffect(() => {
    const loadSavedPRD = () => {
      const savedPRD = localStorage.getItem(`prd-generated-${project?.id}`);
      if (savedPRD) {
        try {
          const prdData = JSON.parse(savedPRD);
          console.log('📂 Loading saved PRD:', prdData);
          setGeneratedPRD(prdData);
          setEditedContent(prdData.content);
          setShowSuccess(true);
        } catch (error) {
          console.error('Error loading saved PRD:', error);
        }
      }
    };

    if (isEditMode && existingPRD) {
      console.log('📝 Edit mode - loading existing PRD:', existingPRD);
      setGeneratedPRD(existingPRD);
      setEditedContent(existingPRD.content);
      setShowSuccess(true);
    } else {
      loadSavedPRD();
    }
  }, [project?.id, isEditMode, existingPRD]);

  // Load saved form data
  useEffect(() => {
    const savedFormData = localStorage.getItem(`prd-form-${project?.id}`);
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(parsed);
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, [project?.id]);

  const isFormValid = formData.productName && 
    formData.productDescription && 
    formData.targetUsers && 
    formData.problemStatement && 
    formData.businessGoals;

  const generatePRD = async () => {
    setIsGenerating(true);
    setError('');
    setShowSuccess(false);

    try {
      console.log('🚀 Starting PRD generation...');
      console.log('Form data:', formData);
      
      const response = await fetch('/api/prd-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Generate a comprehensive Product Requirements Document',
          projectData: {
            name: project?.name,
            description: project?.description,
            currentStage: project?.currentStage
          },
          pmFormData: formData
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ PRD generation result:', result);

      if (result.success) {
        const prdData: PRDData = {
          id: `prd-${Date.now()}`,
          title: `${formData.productName} - Product Requirements Document`,
          content: result.content,
          status: 'generated',
          generatedAt: new Date().toISOString(),
          metadata: result.metadata
        };

        console.log('📄 Generated PRD data:', prdData);
        console.log('📏 Content length:', prdData.content.length);
        console.log('📝 Content preview:', prdData.content.substring(0, 200) + '...');

        setGeneratedPRD(prdData);
        setEditedContent(result.content);
        setShowSuccess(true);
        
        // Save to localStorage
        localStorage.setItem(`prd-generated-${project?.id}`, JSON.stringify(prdData));
        
        if (onPRDGenerated) {
          onPRDGenerated(prdData);
        }
      } else {
        throw new Error(result.error || 'Failed to generate PRD');
      }
    } catch (error) {
      console.error('❌ PRD generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate PRD');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTestPRD = () => {
    const testPRD: PRDData = {
      id: `test-prd-${Date.now()}`,
      title: `${formData.productName} - Test PRD`,
      content: `# ${formData.productName} - Product Requirements Document

## Executive Summary
This is a test PRD generated for ${formData.productName}. The product aims to ${formData.businessGoals}.

## Problem Statement
${formData.problemStatement}

## Target Users
${formData.targetUsers}

## Key Features
${formData.keyFeatures.filter(f => f.trim()).map((feature, index) => `${index + 1}. ${feature}`).join('\n')}

## Success Metrics
${formData.successMetrics.filter(m => m.trim()).map((metric, index) => `${index + 1}. ${metric}`).join('\n')}

## Constraints
${formData.constraints.filter(c => c.trim()).map((constraint, index) => `${index + 1}. ${constraint}`).join('\n')}

## Competitive Advantage
${formData.competitiveAdvantage}

## User Personas
${formData.userPersonas.filter(p => p.name.trim()).map((persona, index) => `
### Persona ${index + 1}: ${persona.name}
- Demographics: ${persona.demographics}
- Pain Points: ${persona.painPoints.filter(pp => pp.trim()).join(', ')}
- Goals: ${persona.goals.filter(g => g.trim()).join(', ')}
`).join('\n')}

This is a test PRD to verify the layout and formatting works correctly.`,
      status: 'generated',
      generatedAt: new Date().toISOString(),
      metadata: {
        generatedBy: 'Test Generator',
        confidence: 0.8,
        source: 'test'
      }
    };

    console.log('🧪 Generated test PRD:', testPRD);
    setGeneratedPRD(testPRD);
    setEditedContent(testPRD.content);
    setShowSuccess(true);
    
    // Save to localStorage
    localStorage.setItem(`prd-generated-${project?.id}`, JSON.stringify(testPRD));
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const saveEdits = () => {
    setIsEditing(false);
    // Edits are automatically saved to editedContent state
  };

  const finalizePRD = () => {
    if (!generatedPRD) return;

    const finalizedPRD: PRDData = {
      ...generatedPRD,
      content: editedContent || generatedPRD.content,
      status: 'finalized',
      generatedAt: new Date().toISOString()
    };

    console.log('✅ Finalizing PRD:', finalizedPRD);
    console.log('📏 Finalized content length:', finalizedPRD.content.length);
    console.log('📝 Using content:', editedContent ? 'edited' : 'original');

    // Save finalized PRD
    localStorage.setItem(`prd-generated-${project?.id}`, JSON.stringify(finalizedPRD));
    
    if (onPRDFinalized) {
      onPRDFinalized(finalizedPRD);
    }

    setGeneratedPRD(finalizedPRD);
    setIsEditing(false);
    setShowSuccess(true);
  };

  const downloadPRD = () => {
    if (!generatedPRD) return;

    const element = document.createElement('a');
    const file = new Blob([editedContent || generatedPRD.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${generatedPRD.title || 'PRD'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Function to format PRD content with beautiful typography
  const formatPRDContent = (content: string): string => {
    if (!content) return '';
    
    console.log('🎨 Formatting PRD content, length:', content.length);
    
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
    
    const result = formattedLines.join('\n');
    console.log('🎨 Formatted content length:', result.length);
    return result;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">Product Requirements Document Generator</h1>
            <p className="text-gray-600 text-sm mt-1">Fill out the form and AI will generate a comprehensive PRD for you</p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-green-800">PRD Generated Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">Your comprehensive Product Requirements Document is ready for review and editing.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">Generation Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Side by Side Layout */}
        <div className="flex h-screen">
          {/* Left Panel - Form */}
          <div className="w-1/2 border-r border-gray-200 bg-white overflow-y-auto">
            <div className="p-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-primary-600" />
                  Product Information
                </h2>

                <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your product name"
                    />
                  </div>

                  {/* Product Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Description *
                    </label>
                    <textarea
                      value={formData.productDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, productDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Describe what your product does and its main purpose"
                    />
                  </div>

                  {/* Target Users */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Users *
                    </label>
                    <textarea
                      value={formData.targetUsers}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetUsers: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Who are your target users? (e.g., tech-savvy millennials, small business owners)"
                    />
                  </div>

                  {/* Problem Statement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Problem Statement *
                    </label>
                    <textarea
                      value={formData.problemStatement}
                      onChange={(e) => setFormData(prev => ({ ...prev, problemStatement: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="What problem does your product solve?"
                    />
                  </div>

                  {/* Business Goals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Goals *
                    </label>
                    <textarea
                      value={formData.businessGoals}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessGoals: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="What are your main business objectives?"
                    />
                  </div>

                  {/* Key Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Features
                    </label>
                    {formData.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...formData.keyFeatures];
                            newFeatures[index] = e.target.value;
                            setFormData(prev => ({ ...prev, keyFeatures: newFeatures }));
                          }}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder={`Feature ${index + 1}`}
                        />
                        {formData.keyFeatures.length > 1 && (
                          <button
                            onClick={() => {
                              const newFeatures = formData.keyFeatures.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, keyFeatures: newFeatures }));
                            }}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, keyFeatures: [...prev.keyFeatures, ''] }))}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      + Add Feature
                    </button>
                  </div>

                  {/* Success Metrics */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Success Metrics
                    </label>
                    {formData.successMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={metric}
                          onChange={(e) => {
                            const newMetrics = [...formData.successMetrics];
                            newMetrics[index] = e.target.value;
                            setFormData(prev => ({ ...prev, successMetrics: newMetrics }));
                          }}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder={`Metric ${index + 1}`}
                        />
                        {formData.successMetrics.length > 1 && (
                          <button
                            onClick={() => {
                              const newMetrics = formData.successMetrics.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, successMetrics: newMetrics }));
                            }}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, successMetrics: [...prev.successMetrics, ''] }))}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      + Add Metric
                    </button>
                  </div>

                  {/* Constraints */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Constraints
                    </label>
                    {formData.constraints.map((constraint, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={constraint}
                          onChange={(e) => {
                            const newConstraints = [...formData.constraints];
                            newConstraints[index] = e.target.value;
                            setFormData(prev => ({ ...prev, constraints: newConstraints }));
                          }}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder={`Constraint ${index + 1}`}
                        />
                        {formData.constraints.length > 1 && (
                          <button
                            onClick={() => {
                              const newConstraints = formData.constraints.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, constraints: newConstraints }));
                            }}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, constraints: [...prev.constraints, ''] }))}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      + Add Constraint
                    </button>
                  </div>

                  {/* Competitive Advantage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Competitive Advantage
                    </label>
                    <textarea
                      value={formData.competitiveAdvantage}
                      onChange={(e) => setFormData(prev => ({ ...prev, competitiveAdvantage: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="What makes your product unique?"
                    />
                  </div>

                  {/* User Personas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Personas
                    </label>
                    {formData.userPersonas.map((persona, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Persona {index + 1}</h4>
                          {formData.userPersonas.length > 1 && (
                            <button
                              onClick={() => {
                                const newPersonas = formData.userPersonas.filter((_, i) => i !== index);
                                setFormData(prev => ({ ...prev, userPersonas: newPersonas }));
                              }}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={persona.name}
                            onChange={(e) => {
                              const newPersonas = [...formData.userPersonas];
                              newPersonas[index].name = e.target.value;
                              setFormData(prev => ({ ...prev, userPersonas: newPersonas }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Persona name"
                          />
                          <input
                            type="text"
                            value={persona.demographics}
                            onChange={(e) => {
                              const newPersonas = [...formData.userPersonas];
                              newPersonas[index].demographics = e.target.value;
                              setFormData(prev => ({ ...prev, userPersonas: newPersonas }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Demographics (age, location, etc.)"
                          />
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Pain Points</label>
                            {persona.painPoints.map((painPoint, painIndex) => (
                              <div key={painIndex} className="flex items-center space-x-2 mb-1">
                                <input
                                  type="text"
                                  value={painPoint}
                                  onChange={(e) => {
                                    const newPersonas = [...formData.userPersonas];
                                    newPersonas[index].painPoints[painIndex] = e.target.value;
                                    setFormData(prev => ({ ...prev, userPersonas: newPersonas }));
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  placeholder={`Pain point ${painIndex + 1}`}
                                />
                                {persona.painPoints.length > 1 && (
                                  <button
                                    onClick={() => {
                                      const newPersonas = [...formData.userPersonas];
                                      newPersonas[index].painPoints = newPersonas[index].painPoints.filter((_, i) => i !== painIndex);
                                      setFormData(prev => ({ ...prev, userPersonas: newPersonas }));
                                    }}
                                    className="p-1 text-red-600 hover:text-red-800"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newPersonas = [...formData.userPersonas];
                                newPersonas[index].painPoints.push('');
                                setFormData(prev => ({ ...prev, userPersonas: newPersonas }));
                              }}
                              className="text-xs text-primary-600 hover:text-primary-800"
                            >
                              + Add Pain Point
                            </button>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Goals</label>
                            {persona.goals.map((goal, goalIndex) => (
                              <div key={goalIndex} className="flex items-center space-x-2 mb-1">
                                <input
                                  type="text"
                                  value={goal}
                                  onChange={(e) => {
                                    const newPersonas = [...formData.userPersonas];
                                    newPersonas[index].goals[goalIndex] = e.target.value;
                                    setFormData(prev => ({ ...prev, userPersonas: newPersonas }));
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  placeholder={`Goal ${goalIndex + 1}`}
                                />
                                {persona.goals.length > 1 && (
                                  <button
                                    onClick={() => {
                                      const newPersonas = [...formData.userPersonas];
                                      newPersonas[index].goals = newPersonas[index].goals.filter((_, i) => i !== goalIndex);
                                      setFormData(prev => ({ ...prev, userPersonas: newPersonas }));
                                    }}
                                    className="p-1 text-red-600 hover:text-red-800"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newPersonas = [...formData.userPersonas];
                                newPersonas[index].goals.push('');
                                setFormData(prev => ({ ...prev, userPersonas: newPersonas }));
                              }}
                              className="text-xs text-primary-600 hover:text-primary-800"
                            >
                              + Add Goal
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        userPersonas: [...prev.userPersonas, { name: '', demographics: '', painPoints: [''], goals: [''] }]
                      }))}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      + Add Persona
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <Button
                    onClick={generatePRD}
                    disabled={!isFormValid || isGenerating}
                    loading={isGenerating}
                    leftIcon={isGenerating ? undefined : <Brain className="w-5 h-5" />}
                    className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating PRD...</span>
                      </div>
                    ) : (
                      'Generate PRD with AI'
                    )}
                  </Button>
                  
                  <div className="flex space-x-2 mt-2">
                    <Button
                      onClick={generateTestPRD}
                      variant="outline"
                      className="flex-1 py-2 text-sm"
                    >
                      🧪 Test PRD
                    </Button>
                    {generatedPRD && (
                      <Button
                        onClick={() => {
                          setGeneratedPRD(null);
                          setEditedContent('');
                          setShowSuccess(false);
                          localStorage.removeItem(`prd-generated-${project?.id}`);
                        }}
                        variant="outline"
                        className="flex-1 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Clear PRD
                      </Button>
                    )}
                  </div>
                  {!isFormValid && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Please fill in all required fields to generate PRD
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - PRD Display */}
          <div className="w-1/2 bg-gray-50 overflow-y-auto">
            <div className="p-6">
              {generatedPRD ? (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full">
                  {/* PRD Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">Generated PRD</h2>
                          <p className="text-sm text-gray-600">
                            {generatedPRD.title} • {new Date(generatedPRD.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!isEditing && (
                          <Button
                            onClick={startEditing}
                            variant="outline"
                            leftIcon={<Edit3 className="w-4 h-4" />}
                            className="text-sm bg-white hover:bg-gray-50 border-gray-300"
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          onClick={downloadPRD}
                          variant="outline"
                          leftIcon={<Download className="w-4 h-4" />}
                          className="text-sm bg-white hover:bg-gray-50 border-gray-300"
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Edit PRD Content</h3>
                        <div className="flex space-x-2">
                          <Button
                            onClick={saveEdits}
                            variant="outline"
                            leftIcon={<Save className="w-4 h-4" />}
                            className="text-sm"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={finalizePRD}
                            leftIcon={<CheckCircle className="w-4 h-4" />}
                            className="text-sm"
                          >
                            Finalize
                          </Button>
                        </div>
                      </div>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={25}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm leading-relaxed"
                        placeholder="Edit your PRD content here..."
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Success Message */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center text-green-800">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="font-semibold">PRD Generated Successfully</span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">Your comprehensive Product Requirements Document is ready for review and editing.</p>
                      </div>

                      {/* PRD Content */}
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-semibold text-gray-700">PRD Preview</span>
                            </div>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{Math.ceil((editedContent || generatedPRD.content).length / 1000)}k characters</span>
                              <span>•</span>
                              <span className="capitalize">{generatedPRD.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto">
                          <div className="p-6">
                            <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900">
                              <div 
                                className="text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{
                                  __html: formatPRDContent(editedContent || generatedPRD.content)
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          generatedPRD.status === 'generated' ? 'bg-blue-500' :
                          generatedPRD.status === 'editing' ? 'bg-yellow-500' :
                          generatedPRD.status === 'finalized' ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                        <span className="capitalize">{generatedPRD.status}</span>
                      </div>
                      <div className="text-gray-400">•</div>
                      <div>
                        Generated {new Date(generatedPRD.generatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      AI Generated
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200 p-8 text-center h-full flex items-center justify-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Generate Your PRD</h3>
                      <p className="text-gray-600 text-sm">
                        Fill out the form on the left and click "Generate PRD with AI" to create your comprehensive Product Requirements Document.
                      </p>
                    </div>
                    <div className="flex justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        AI-Powered
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Editable
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        Downloadable
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
