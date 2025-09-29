import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, CheckCircle, Clock, AlertCircle, Download, Edit3, ArrowRight } from 'lucide-react';
import Button from '../shared/Button';

interface PRDStreamingViewerProps {
  project: any;
  onEdit: () => void;
  onFinalize: (prd: any) => void;
  onMoveToNext: () => void;
}

const PRDStreamingViewer: React.FC<PRDStreamingViewerProps> = ({
  project,
  onEdit,
  onFinalize,
  onMoveToNext
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [aiStatus, setAiStatus] = useState('');
  const [formData, setFormData] = useState({
    productName: project?.name || '',
    productDescription: project?.description || '',
    problemStatement: '',
    targetUsers: '',
    businessGoals: '',
    keyFeatures: '',
    successMetrics: '',
    competitiveAdvantage: '',
    constraints: ''
  });

  // Load existing PRD content from project or localStorage
  useEffect(() => {
    if (project?.prd?.content) {
      setGeneratedContent(project.prd.content);
      setIsComplete(true);
      setShowForm(false);
    } else if (project?.id) {
      // Check localStorage for saved PRD
      const savedPRD = localStorage.getItem(`prd-generated-${project.id}`);
      if (savedPRD) {
        try {
          const prdData = JSON.parse(savedPRD);
          if (prdData.content) {
            setGeneratedContent(prdData.content);
            setIsComplete(true);
            setShowForm(false);
          }
        } catch (error) {
          console.error('Error loading saved PRD:', error);
        }
      }
    }
  }, [project]);

  const generationSteps = [
    '🔍 Analyzing project requirements and user inputs...',
    '📊 Researching market landscape and competitive analysis...',
    '👥 Creating detailed user personas and journey mapping...',
    '💡 Defining product vision and strategic positioning...',
    '🎯 Crafting comprehensive problem statement...',
    '⚡ Designing solution architecture and core features...',
    '📈 Developing success metrics and KPIs...',
    '🚀 Building implementation roadmap and timeline...',
    '🛡️ Assessing risks and mitigation strategies...',
    '📋 Finalizing PRD structure and formatting...'
  ];

  const generatePRD = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedContent('');
    setGenerationProgress(0);
    setIsComplete(false);
    setShowForm(false);
    setCurrentStepIndex(0);
    setAiStatus('Initializing AI analysis...');

    // Simulate step progression
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex < generationSteps.length) {
          setAiStatus(generationSteps[nextIndex]);
          setGenerationProgress((nextIndex / generationSteps.length) * 90);
          return nextIndex;
        }
        return prev;
      });
    }, 2000);

    try {
      const response = await fetch('/api/prd-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a comprehensive Product Requirements Document for ${formData.productName}`,
          projectData: {
            ...project,
            name: formData.productName,
            description: formData.productDescription
          },
          pmFormData: formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PRD');
      }

      const result = await response.json();
      console.log('PRD Generation Result:', result);
      
      if (result.content) {
        clearInterval(stepInterval);
        console.log('Setting generated content:', result.content.substring(0, 200) + '...');
        setGeneratedContent(result.content);
        setGenerationProgress(100);
        setCurrentSection('Complete');
        setAiStatus('✅ PRD generation completed successfully!');
        setIsComplete(true);
        setIsGenerating(false);
      } else {
        console.error('PRD generation failed:', result.error);
        throw new Error(result.error || 'Failed to generate PRD');
      }

    } catch (error) {
      clearInterval(stepInterval);
      console.error('Error generating PRD:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate PRD');
      setAiStatus('❌ Generation failed. Please try again.');
      setIsGenerating(false);
    }
  };

  const formatPRDContent = (content: string) => {
    if (!content || typeof content !== 'string') {
      console.warn('formatPRDContent: Invalid content provided:', content);
      return '';
    }

    // Clean up the content
    let cleaned;
    try {
      cleaned = content
        .replace(/```markdown\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 border-b border-gray-200 pb-2">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')
        .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-0 flex items-start"><span class="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span><span class="text-gray-700">$1</span></li>')
        .replace(/^- (.*$)/gim, '<li class="ml-6 mb-0 flex items-start"><span class="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span><span class="text-gray-700">$1</span></li>')
        .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-6 mb-0 flex items-start"><span class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold flex items-center justify-center mr-3 flex-shrink-0">$1</span><span class="text-gray-700">$2</span></li>')
        .replace(/\n\n/g, '</p><p class="mb-4 text-gray-700 leading-relaxed">')
        .replace(/\n/g, '<br>');

      // Wrap in paragraphs
      cleaned = `<div class="prose prose-lg max-w-none">${cleaned}</div>`;

      // Fix list formatting - only if cleaned is valid
      if (cleaned && typeof cleaned === 'string') {
        cleaned = cleaned.replace(/<li class="ml-6 mb-2 flex items-start"><span class="w-1\.5 h-1\.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"><\/span><span class="text-gray-700">(.*?)<\/span><\/li>/g, (match, content) => {
          return `<ul class="space-y-2 mb-4"><li class="flex items-start"><span class="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span><span class="text-gray-700">${content}</span></li></ul>`;
        });
      }
    } catch (error) {
      console.error('Error in formatPRDContent:', error);
      return '<div class="prose prose-lg max-w-none"><p class="text-gray-700">Error formatting content. Please try again.</p></div>';
    }

    return cleaned;
  };

  const exportPRD = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${project.name}-PRD.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generatePRD();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-md">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">PRD Generator</h1>
                <p className="text-gray-500 text-sm">AI-powered PRD generation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isComplete && (
                <>
                  <Button
                    onClick={onEdit}
                    variant="outline"
                    leftIcon={<Edit3 className="w-4 h-4" />}
                    className="text-sm px-4 py-2"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={exportPRD}
                    variant="outline"
                    leftIcon={<Download className="w-4 h-4" />}
                    className="text-sm px-4 py-2"
                  >
                    Export
                  </Button>
                  <Button
                    onClick={() => onFinalize({ content: generatedContent, project })}
                    leftIcon={<CheckCircle className="w-4 h-4" />}
                    className="text-sm px-4 py-2 bg-green-600 hover:bg-green-700"
                  >
                    Finalize
                  </Button>
                  <Button
                    onClick={onMoveToNext}
                    leftIcon={<ArrowRight className="w-4 h-4" />}
                    className="text-sm px-4 py-2"
                  >
                    Move to Research
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generation Progress */}
      {isGenerating && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {aiStatus || 'Generating PRD...'}
                  </span>
                  <span className="text-sm text-gray-500">{Math.round(generationProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {generationSteps[currentStepIndex] || 'Processing...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-6 mt-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Generation Failed</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={generatePRD}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRD Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {showForm ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Information</h2>
                <p className="text-gray-600">Fill out the form below to generate a comprehensive PRD</p>
              </div>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.productName}
                      onChange={(e) => handleInputChange('productName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Users *
                    </label>
                    <input
                      type="text"
                      value={formData.targetUsers}
                      onChange={(e) => handleInputChange('targetUsers', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Parents, Children aged 5-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description *
                  </label>
                  <textarea
                    value={formData.productDescription}
                    onChange={(e) => handleInputChange('productDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what your product does and its main purpose"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Problem Statement *
                  </label>
                  <textarea
                    value={formData.problemStatement}
                    onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What problem does your product solve?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Goals *
                  </label>
                  <textarea
                    value={formData.businessGoals}
                    onChange={(e) => handleInputChange('businessGoals', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What are your main business objectives?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Features *
                  </label>
                  <textarea
                    value={formData.keyFeatures}
                    onChange={(e) => handleInputChange('keyFeatures', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="List the main features and functionality"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Success Metrics
                    </label>
                    <textarea
                      value={formData.successMetrics}
                      onChange={(e) => handleInputChange('successMetrics', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="How will you measure success?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Competitive Advantage
                    </label>
                    <textarea
                      value={formData.competitiveAdvantage}
                      onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="What makes your product unique?"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Constraints
                  </label>
                  <textarea
                    value={formData.constraints}
                    onChange={(e) => handleInputChange('constraints', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any technical, business, or resource constraints?"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    leftIcon={<Sparkles className="w-4 h-4" />}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Generate PRD
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : generatedContent ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div
                dangerouslySetInnerHTML={{
                  __html: formatPRDContent(generatedContent || '')
                }}
              />
            </div>
          </div>
        ) : isGenerating ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generating Your PRD</h3>
              <p className="text-gray-600">Our AI is analyzing your project and creating a comprehensive Product Requirements Document...</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PRDStreamingViewer;
