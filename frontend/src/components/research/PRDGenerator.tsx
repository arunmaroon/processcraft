import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Edit3, 
  Download, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Brain, 
  Sparkles,
  Plus,
  Trash2,
  ArrowRight
} from 'lucide-react';
import Button from '../shared/Button';

interface PMFormData {
  step1: {
    productName: string;
    productDescription: string;
    targetUsers: string;
    problemStatement: string;
    businessGoals: string;
  };
  step2: {
    keyFeatures: string[];
    successMetrics: string[];
    constraints: string[];
  };
  competitiveAdvantage: string;
  imageReferences: File[];
  userPersonas: Array<{
    name: string;
    demographics: string;
    painPoints: string[];
    goals: string[];
  }>;
}

interface PRDGeneratorProps {
  project: any;
  onPRDGenerated?: (prd: any) => void;
  onPRDFinalized?: (prd: any, updatedProject?: any) => void;
  isEditMode?: boolean;
  existingPRD?: any;
}

export default function PRDGenerator({ 
  project, 
  onPRDGenerated, 
  onPRDFinalized, 
  isEditMode = false, 
  existingPRD = null 
}: PRDGeneratorProps) {
  const [formData, setFormData] = useState<PMFormData>({
    step1: {
      productName: '',
      productDescription: '',
      targetUsers: '',
      problemStatement: '',
      businessGoals: ''
    },
    step2: {
      keyFeatures: [''],
      successMetrics: [''],
      constraints: ['']
    },
    competitiveAdvantage: '',
    imageReferences: [],
    userPersonas: []
  });

  const [generatedPRD, setGeneratedPRD] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(isEditMode);
  const [editedContent, setEditedContent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showAutoFillNotification, setShowAutoFillNotification] = useState(false);

  // Load existing PRD if in edit mode
  useEffect(() => {
    if (isEditMode && existingPRD) {
      setGeneratedPRD(existingPRD);
      setEditedContent(existingPRD.content || '');
    }
  }, [isEditMode, existingPRD]);

  // Load form data from localStorage and auto-fill from project data
  useEffect(() => {
    const savedFormData = localStorage.getItem(`prd-form-${project?.id}`);
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        console.log('Loading saved form data:', parsedData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    } else if (project) {
      // Auto-fill form with project data if no saved data exists
      console.log('Auto-filling from project data:', project);
      const newFormData = {
        step1: {
          productName: project.name || '',
          productDescription: project.description || '',
          targetUsers: project.prd?.targetUsers?.join(', ') || project.targetUsers || '',
          problemStatement: project.problemStatement || '',
          businessGoals: project.prd?.objectives?.join(', ') || project.businessGoals || ''
        },
        step2: {
          keyFeatures: project.prd?.keyFeatures?.length > 0 ? project.prd.keyFeatures : [''],
          successMetrics: project.prd?.successMetrics?.length > 0 ? project.prd.successMetrics : [''],
          constraints: project.constraints?.length > 0 ? project.constraints : ['']
        },
        competitiveAdvantage: project.competitiveAdvantage || '',
        imageReferences: [],
        userPersonas: project.userPersonas || []
      };
      
      console.log('Setting new form data:', newFormData);
      setFormData(newFormData);
      
      // Show auto-fill notification
      setShowAutoFillNotification(true);
      setTimeout(() => setShowAutoFillNotification(false), 5000);
    }
  }, [project?.id, project]);

  // Save form data to localStorage
  useEffect(() => {
    if (project?.id) {
      console.log('Saving form data to localStorage:', formData);
      localStorage.setItem(`prd-form-${project.id}`, JSON.stringify(formData));
    }
  }, [formData, project?.id]);

  // Load generated PRD from localStorage
  useEffect(() => {
    const savedPRD = localStorage.getItem(`prd-generated-${project?.id}`);
    if (savedPRD) {
      try {
        const prdData = JSON.parse(savedPRD);
        setGeneratedPRD(prdData);
        setEditedContent(prdData.content || '');
        setShowSuccess(true);
      } catch (error) {
        console.error('Error loading saved PRD:', error);
      }
    }
  }, [project?.id]);

  const handleInputChange = (step: keyof PMFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value
      }
    }));
  };

  const handleArrayChange = (step: keyof PMFormData, field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: (prev[step] as any)[field].map((item: string, i: number) => 
          i === index ? value : item
        )
      }
    }));
  };

  const addArrayItem = (step: keyof PMFormData, field: string) => {
    setFormData(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: [...(prev[step] as any)[field], '']
      }
    }));
  };

  const removeArrayItem = (step: keyof PMFormData, field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: (prev[step] as any)[field].filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const generatePRD = async () => {
    setIsGenerating(true);
    setError('');
    setShowSuccess(false);

      try {
        const response = await fetch('/api/prd-generation/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          prompt: 'Generate a comprehensive Product Requirements Document',
          projectData: project,
          pmFormData: formData
          }),
        });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.message || 'Failed to generate PRD');
      }

      let result;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText.substring(0, 200) + '...');
        
        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Empty response from server');
        }
        
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        throw new Error('Invalid response format from server. Please try again.');
      }
      const prdData = {
        ...result,
        title: `${formData.step1.productName} - Product Requirements Document`,
        generatedAt: new Date().toISOString(),
        status: 'generated'
      };

      setGeneratedPRD(prdData);
      setEditedContent(result.content);
      setShowSuccess(true);

      // Save to localStorage
      if (project?.id) {
        localStorage.setItem(`prd-generated-${project.id}`, JSON.stringify(prdData));
      }

      if (onPRDGenerated) {
        onPRDGenerated(prdData);
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const saveEdits = () => {
    if (generatedPRD) {
      const updatedPRD = {
        ...generatedPRD,
        content: editedContent,
        status: 'editing'
      };
      setGeneratedPRD(updatedPRD);
      setIsEditing(false);

      // Save to localStorage
      if (project?.id) {
        localStorage.setItem(`prd-generated-${project.id}`, JSON.stringify(updatedPRD));
      }
    }
  };

  const finalizePRD = () => {
    if (generatedPRD) {
      const finalizedPRD = {
        ...generatedPRD,
        content: editedContent || generatedPRD.content,
        status: 'finalized',
        finalizedAt: new Date().toISOString()
      };
      
      setGeneratedPRD(finalizedPRD);
      setIsEditing(false);
      setShowSuccess(true);

      // Save to localStorage
      if (project?.id) {
        localStorage.setItem(`prd-generated-${project.id}`, JSON.stringify(finalizedPRD));
      }

      if (onPRDFinalized) {
        onPRDFinalized(finalizedPRD);
      }
    }
  };

  const finalizeAndMoveToNextStep = () => {
    if (generatedPRD) {
      const finalizedPRD = {
        ...generatedPRD,
        content: editedContent || generatedPRD.content,
        status: 'finalized',
        finalizedAt: new Date().toISOString()
      };
      
      setGeneratedPRD(finalizedPRD);
      setIsEditing(false);
      setShowSuccess(true);

      // Save to localStorage
      if (project?.id) {
        localStorage.setItem(`prd-generated-${project.id}`, JSON.stringify(finalizedPRD));
      }

      // Create updated project with next stage
      const updatedProject = {
        ...project,
        prd: finalizedPRD,
        currentStage: 'USER_RESEARCH' as const,
        status: 'IN_PROGRESS' as const,
      updatedAt: new Date().toISOString(),
      };

      if (onPRDFinalized) {
        onPRDFinalized(finalizedPRD, updatedProject);
      }
    }
  };

  const downloadPRD = () => {
    if (generatedPRD) {
      const element = document.createElement('a');
      const file = new Blob([editedContent || generatedPRD.content], { type: 'text/markdown' });
      element.href = URL.createObjectURL(file);
      element.download = `${generatedPRD.title || 'PRD'}.md`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  // Clean and format PRD content to remove malformed HTML
  const cleanPRDContent = (content: string): string => {
    if (!content) return '';
    
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
  };

  const formatPRDContent = (content: string): string => {
    if (!content || typeof content !== 'string') {
      console.warn('formatPRDContent: Invalid content provided:', content);
      return '';
    }
    
    try {
      // Clean the content first
      const cleanedContent = cleanPRDContent(content);
      
      if (!cleanedContent || typeof cleanedContent !== 'string') {
        return '<div class="prose prose-lg max-w-none"><p class="text-gray-700">Error processing content. Please try again.</p></div>';
      }
      
      return cleanedContent
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-lg">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 rounded-md">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium text-gray-900 mb-2">$1</h3>')
        .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-medium text-gray-800 mb-2 pl-4 border-l-4 border-blue-300">$1</h4>')
        .replace(/^\* (.*$)/gim, '<li class="mb-0 pl-4 relative"><div class="absolute left-0 top-2 w-2 h-2 bg-blue-500 rounded-full"></div><div class="ml-4">$1</div></li>')
        .replace(/^\d+\. (.*$)/gim, '<li class="mb-0 pl-4 relative"><div class="absolute left-0 top-2 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">$1</div><div class="ml-8">$2</div></li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 bg-yellow-100 px-1 rounded">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm font-mono border">$1</code>')
        .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-gray-700">')
        .replace(/^(?!<[h|l])/gm, '<p class="mb-4 leading-relaxed text-gray-700">')
        .replace(/(<li.*<\/li>)/gs, '<ul class="space-y-2 mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">$1</ul>');
    } catch (error) {
      console.error('Error in formatPRDContent:', error);
      return '<div class="prose prose-lg max-w-none"><p class="text-gray-700">Error formatting content. Please try again.</p></div>';
    }
  };

  const isFormValid = formData.step1.productName.trim() !== '' &&
                    formData.step1.productDescription.trim() !== '' &&
                    formData.step1.targetUsers.trim() !== '' &&
                    formData.step1.problemStatement.trim() !== '' &&
                    formData.step1.businessGoals.trim() !== '';

  // Clean content function
  const cleanContent = (content: string): string => {
    if (!content || typeof content !== 'string') {
      console.warn('cleanContent: Invalid content provided:', content);
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
      console.error('Error in cleanContent:', error);
      return '';
    }
    
    return cleaned;
  };

  // If PRD already exists, show the PRD viewer instead of the form
  if (generatedPRD && !isEditing) {
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
                  <h1 className="text-xl font-semibold text-gray-900">PRD Generator</h1>
                  <p className="text-gray-500 text-sm">AI-powered PRD generation</p>
                </div>
          </div>
              <div className="flex items-center space-x-2">
              <Button
                  onClick={() => setIsEditing(true)}
                variant="outline"
                  leftIcon={<Edit3 className="w-4 h-4" />}
                className="text-sm"
              >
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    const finalPRD = {
                      ...generatedPRD,
                      content: editedContent || generatedPRD.content,
                      status: 'finalized',
                      finalizedAt: new Date().toISOString()
                    };
                    setGeneratedPRD(finalPRD);
                    setIsEditing(false);
                    setShowSuccess(true);
                    if (onPRDFinalized) {
                      onPRDFinalized(finalPRD);
                    }
                  }}
                  leftIcon={<ArrowRight className="w-4 h-4" />}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Move to Research
              </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Document Status */}
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Document Status: Complete</span>
            </div>
            <p className="text-sm text-green-700 mt-1">This PRD has been completed and is ready for the next phase of development.</p>
          </div>
        </div>

        {/* Document Content */}
        <div className="max-w-4xl mx-auto px-6 pb-8">
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: cleanContent(generatedPRD.content || '')
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl font-semibold text-gray-900">PRD Generator</h1>
            <p className="text-gray-500 text-sm">AI-powered PRD generation</p>
          </div>
      </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-green-800">PRD Generation Complete!</h3>
                <p className="text-sm text-green-700 mt-1">Your comprehensive Product Requirements Document is ready for review and editing in seconds.</p>
              </div>
            </div>
          </div>
        )}

        {/* Auto-fill Notification */}
        {showAutoFillNotification && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-blue-800">Form Auto-filled!</h3>
                <p className="text-sm text-blue-700 mt-1">We've pre-filled the form with data from your project creation. You can edit any field as needed.</p>
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

        {/* Main Content - Full Width Form */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-primary-600" />
                Instant Research Input
              </h2>

                <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                <input
                      type="text"
                      id="productName"
                      value={formData.step1.productName}
                      onChange={(e) => handleInputChange('step1', 'productName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>

                  {/* Product Description */}
                  <div>
                    <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-2">
                      Product Description <span className="text-red-500">*</span>
              </label>
                    <textarea
                      id="productDescription"
                      rows={3}
                      value={formData.step1.productDescription}
                      onChange={(e) => handleInputChange('step1', 'productDescription', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what your product does"
                    />
                  </div>

                  {/* Target Users */}
                  <div>
                    <label htmlFor="targetUsers" className="block text-sm font-medium text-gray-700 mb-2">
                      Target Users <span className="text-red-500">*</span>
              </label>
                <input
                      type="text"
                      id="targetUsers"
                      value={formData.step1.targetUsers}
                      onChange={(e) => handleInputChange('step1', 'targetUsers', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Who are your target users?"
                    />
                  </div>

                  {/* Problem Statement */}
                  <div>
                    <label htmlFor="problemStatement" className="block text-sm font-medium text-gray-700 mb-2">
                      Problem Statement <span className="text-red-500">*</span>
              </label>
                    <textarea
                      id="problemStatement"
                      rows={3}
                      value={formData.step1.problemStatement}
                      onChange={(e) => handleInputChange('step1', 'problemStatement', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What problem does your product solve?"
                    />
                  </div>

                  {/* Business Goals */}
                  <div>
                    <label htmlFor="businessGoals" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Goals <span className="text-red-500">*</span>
              </label>
                    <textarea
                      id="businessGoals"
                      rows={3}
                      value={formData.step1.businessGoals}
                      onChange={(e) => handleInputChange('step1', 'businessGoals', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What are your business objectives?"
                    />
          </div>

                  {/* Competitive Advantage */}
          <div>
                    <label htmlFor="competitiveAdvantage" className="block text-sm font-medium text-gray-700 mb-2">
                      Competitive Advantage
            </label>
            <textarea
                      id="competitiveAdvantage"
              rows={3}
                      value={formData.competitiveAdvantage}
                      onChange={(e) => handleInputChange('competitiveAdvantage', 'competitiveAdvantage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What makes your product unique? How do you differentiate from competitors?"
            />
          </div>

                  {/* Key Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Features
                    </label>
                    {formData.step2.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleArrayChange('step2', 'keyFeatures', index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.step2.keyFeatures.length > 1 && (
                          <Button
                            onClick={() => removeArrayItem('step2', 'keyFeatures', index)}
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
            <Button
                      onClick={() => addArrayItem('step2', 'keyFeatures')}
                      variant="outline"
                      leftIcon={<Plus className="w-4 h-4" />}
                      className="mt-2 text-sm"
                    >
                      Add Feature
            </Button>
          </div>

                  {/* Image References Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image References
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setFormData(prev => ({ ...prev, imageReferences: [...prev.imageReferences, ...files] }));
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Plus className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Upload reference images</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                        </div>
                      </label>
                    </div>
                    
                    {/* Display uploaded images */}
                    {formData.imageReferences.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {formData.imageReferences.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Reference ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  imageReferences: prev.imageReferences.filter((_, i) => i !== index)
                                }));
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Success Metrics */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Success Metrics
                    </label>
                    {formData.step2.successMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={metric}
                          onChange={(e) => handleArrayChange('step2', 'successMetrics', index, e.target.value)}
                          placeholder={`Metric ${index + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.step2.successMetrics.length > 1 && (
                  <Button
                            onClick={() => removeArrayItem('step2', 'successMetrics', index)}
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                  </Button>
                        )}
                      </div>
                    ))}
                  <Button
                      onClick={() => addArrayItem('step2', 'successMetrics')}
                      variant="outline"
                      leftIcon={<Plus className="w-4 h-4" />}
                      className="mt-2 text-sm"
                    >
                      Add Metric
                  </Button>
              </div>

                  {/* Constraints */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Constraints
                    </label>
                    {formData.step2.constraints.map((constraint, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={constraint}
                          onChange={(e) => handleArrayChange('step2', 'constraints', index, e.target.value)}
                          placeholder={`Constraint ${index + 1}`}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {formData.step2.constraints.length > 1 && (
                          <Button
                            onClick={() => removeArrayItem('step2', 'constraints', index)}
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      onClick={() => addArrayItem('step2', 'constraints')}
                      variant="outline"
                      leftIcon={<Plus className="w-4 h-4" />}
                      className="mt-2 text-sm"
                    >
                      Add Constraint
                    </Button>
                  </div>

                  {/* Competitive Advantage */}
                  <div>
                    <label htmlFor="competitiveAdvantage" className="block text-sm font-medium text-gray-700 mb-2">
                      Competitive Advantage
                    </label>
                    <textarea
                      id="competitiveAdvantage"
                      rows={3}
                      value={formData.competitiveAdvantage}
                      onChange={(e) => handleInputChange('competitiveAdvantage', 'competitiveAdvantage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What makes your product unique?"
                    />
                              </div>

                  {/* Generate Button */}
                  <div className="pt-6 border-t border-gray-200">
                    <Button
                      onClick={generatePRD}
                      disabled={!isFormValid || isGenerating}
                      loading={isGenerating}
                      leftIcon={isGenerating ? undefined : <Zap className="w-5 h-5" />}
                      className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>AI Research in Progress...</span>
                        </div>
                      ) : (
                        'Generate PRD'
                      )}
                    </Button>
                    {!isFormValid && (
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Please fill in all required fields to generate PRD
                      </p>
                    )}
                </div>
                </div>
              </div>
            </div>
            </div>
        </div>
    </div>
  );
}