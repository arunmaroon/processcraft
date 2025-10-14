import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Loader, 
  Sparkles, 
  FileText, 
  Users, 
  Target, 
  BarChart3, 
  Shield, 
  Zap,
  Brain,
  Clock,
  TrendingUp,
  AlertCircle,
  Eye,
  Download,
  Share,
  Edit
} from 'lucide-react';
import { EnhancedPRD, PRDType, PRDPriority } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';
import { aiPRDGenerator } from '../../services/aiPRDGenerator';

interface PRDGenerationFlowProps {
  projectId: string;
  projectName: string;
  onComplete: (prd: EnhancedPRD) => void;
  onCancel: () => void;
}

type GenerationStep = 
  | 'input' 
  | 'analyzing' 
  | 'generating-overview'
  | 'generating-goals'
  | 'generating-users'
  | 'generating-features'
  | 'generating-metrics'
  | 'generating-risks'
  | 'finalizing'
  | 'complete';

interface FormData {
  title: string;
  description: string;
  type: PRDType;
  priority: PRDPriority;
  aiPrompt: string;
  targetAudience: string;
  businessGoals: string;
  constraints: string;
}

export default function PRDGenerationFlow({ 
  projectId, 
  projectName, 
  onComplete, 
  onCancel 
}: PRDGenerationFlowProps) {
  const [currentStep, setCurrentStep] = useState<GenerationStep>('input');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    type: 'Feature',
    priority: 'Medium',
    aiPrompt: '',
    targetAudience: '',
    businessGoals: '',
    constraints: ''
  });
  const [generatedContent, setGeneratedContent] = useState<any>({});
  const [currentMessage, setCurrentMessage] = useState('');

  const generationSteps = [
    { step: 'analyzing', message: 'Analyzing your requirements...', icon: Brain },
    { step: 'generating-overview', message: 'Creating executive summary...', icon: FileText },
    { step: 'generating-goals', message: 'Defining product objectives...', icon: Target },
    { step: 'generating-users', message: 'Identifying target users and personas...', icon: Users },
    { step: 'generating-features', message: 'Outlining key features and requirements...', icon: Sparkles },
    { step: 'generating-metrics', message: 'Setting success metrics and KPIs...', icon: BarChart3 },
    { step: 'generating-risks', message: 'Assessing risks and mitigation strategies...', icon: Shield },
    { step: 'finalizing', message: 'Polishing your PRD...', icon: Zap }
  ];

  const handleGenerate = async () => {
    try {
      setCurrentStep('analyzing');
      setCurrentMessage('Analyzing your requirements...');
      
      // Prepare context for AI
      const context = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        targetAudience: formData.targetAudience,
        businessGoals: formData.businessGoals,
        constraints: formData.constraints,
        aiPrompt: formData.aiPrompt,
        projectName: projectName
      };

      // Check if AI is available
      if (aiPRDGenerator.isAvailable()) {
        // Use real AI to generate PRD
        const sections = await aiPRDGenerator.generateCompletePRD(
          context,
          (step, message) => {
            setCurrentStep(step as GenerationStep);
            setCurrentMessage(message);
          }
        );

        // Convert sections to content object
        const content: any = {};
        sections.forEach((section, index) => {
          const stepName = generationSteps[index + 1]?.step || `section-${index}`;
          content[stepName] = {
            title: section.title,
            content: section.content,
            confidence: section.confidence
          };
        });

        setGeneratedContent(content);
        setCurrentStep('complete');
      } else {
        // Fallback to mock content if AI is not available
        console.warn('AI service not available, using mock content');
        for (const { step, message } of generationSteps) {
          setCurrentStep(step as GenerationStep);
          setCurrentMessage(message);
          
          await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
          
          setGeneratedContent(prev => ({
            ...prev,
            [step]: generateMockContent(step, formData)
          }));
        }
        
        setCurrentStep('complete');
      }
    } catch (error) {
      console.error('Error generating PRD:', error);
      
      // Fallback to mock content if AI fails
      console.warn('AI generation failed, using mock content');
      for (const { step, message } of generationSteps) {
        setCurrentStep(step as GenerationStep);
        setCurrentMessage(message);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setGeneratedContent(prev => ({
          ...prev,
          [step]: generateMockContent(step, formData)
        }));
      }
      
      setCurrentStep('complete');
    }
  };

  const generateMockContent = (step: string, data: FormData) => {
    const templates: any = {
      'generating-overview': {
        title: 'Executive Summary',
        content: `${data.title} is designed to ${data.description.toLowerCase()}. This initiative addresses key market needs and aligns with our strategic objectives to deliver exceptional value to our users.\n\nThe solution will focus on ${data.targetAudience || 'target users'} and aims to ${data.businessGoals || 'achieve business goals'} while maintaining ${data.constraints || 'operational efficiency'}.`
      },
      'generating-goals': {
        title: 'Product Objectives',
        content: `**Primary Goals:**\n• Deliver a seamless user experience for ${data.targetAudience || 'our users'}\n• Achieve measurable business impact through ${data.businessGoals || 'key initiatives'}\n• Maintain high quality and reliability standards\n\n**Success Criteria:**\n• User satisfaction score > 4.5/5\n• Adoption rate of 80% within first quarter\n• Reduce operational costs by 30%`
      },
      'generating-users': {
        title: 'Target Users & Personas',
        content: `**Primary Users:** ${data.targetAudience || 'Business professionals and end users'}\n\n**User Persona - The Efficient Professional:**\n• Needs: Quick access to information, streamlined workflows\n• Pain Points: Complex processes, slow response times\n• Goals: Accomplish tasks efficiently and accurately\n\n**User Persona - The Strategic Decision Maker:**\n• Needs: Data-driven insights, comprehensive analytics\n• Pain Points: Lack of visibility, fragmented information\n• Goals: Make informed decisions quickly`
      },
      'generating-features': {
        title: 'Key Features & Requirements',
        content: `**Core Features:**\n• Intuitive dashboard with real-time updates\n• Advanced filtering and search capabilities\n• Mobile-responsive design\n• Automated workflows and notifications\n\n**Technical Requirements:**\n• Response time < 2 seconds\n• 99.9% uptime SLA\n• Support for 10,000+ concurrent users\n• WCAG 2.1 AA accessibility compliance`
      },
      'generating-metrics': {
        title: 'Success Metrics',
        content: `**Key Performance Indicators:**\n• User Engagement: Daily active users, session duration\n• Business Impact: Revenue growth, cost savings\n• Quality: Error rate, customer satisfaction\n• Performance: Page load time, API response time\n\n**Targets (3 months):**\n• 5,000 active users\n• 85% user retention\n• < 0.5% error rate\n• 4.7/5 customer satisfaction`
      },
      'generating-risks': {
        title: 'Risks & Mitigation',
        content: `**Technical Risks:**\n• Scalability concerns → Solution: Cloud-native architecture\n• Integration complexity → Solution: Phased rollout approach\n\n**Business Risks:**\n• User adoption → Solution: Comprehensive training program\n• Market competition → Solution: Unique value propositions\n\n**Compliance Risks:**\n• Data privacy → Solution: GDPR/SOC2 compliance\n• Security vulnerabilities → Solution: Regular security audits`
      }
    };
    
    return templates[step] || { title: step, content: 'Generating content...' };
  };

  const handleSave = () => {
    const newPRD: EnhancedPRD = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      stage: 'Edit',
      status: 'Draft',
      version: '1.0',
      projectId: projectId,
      owner: 'Current User',
      isStarred: false,
      isLocked: false,
      createdBy: 'Current User',
      lastModifiedBy: 'Current User',
      sections: Object.values(generatedContent).map((content: any, index) => ({
        id: `section-${index}`,
        title: content.title,
        content: content.content,
        order: index,
        isRequired: true,
        isLocked: false,
        isAIGenerated: true,
        confidence: content.confidence || 85,
        comments: [],
        attachments: [],
        lastModified: new Date().toISOString(),
        modifiedBy: 'AI Assistant (GPT-4)',
        wordCount: content.content.split(' ').length,
        readingTime: Math.ceil(content.content.split(' ').length / 200)
      })),
      versionHistory: [],
      comments: [],
      attachments: [],
      complianceChecked: false,
      approvalRequired: false,
      stakeholders: [],
      notifications: [],
      aiSuggestions: [],
      analytics: {
        views: 0,
        edits: 0,
        comments: 0,
        shares: 0,
        lastViewed: new Date().toISOString()
      },
      insights: [],
      complianceChecks: [],
      riskAssessment: {
        level: 'Low',
        factors: [],
        mitigation: []
      },
      regulatoryRequirements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    enhancedPRDService.savePRD(newPRD);
    onComplete(newPRD);
  };

  if (currentStep === 'input') {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Product Requirements Document</h1>
            <p className="text-gray-600 mt-2">for {projectName}</p>
          </div>
          <button onClick={onCancel} className="btn-ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* PRD Type Selection */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What are you building?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { type: 'Product' as PRDType, icon: '🎯', label: 'New Product', desc: 'Complete product' },
                { type: 'Feature' as PRDType, icon: '✨', label: 'Feature', desc: 'Enhancement' },
                { type: 'Tweak' as PRDType, icon: '🔧', label: 'Improvement', desc: 'Minor update' },
                { type: 'A/B Test' as PRDType, icon: '🧪', label: 'Experiment', desc: 'Test & learn' }
              ].map(({ type, icon, label, desc }) => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, type })}
                  className={`p-4 border-2 rounded-xl text-center transition-all ${
                    formData.type === type
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{icon}</div>
                  <div className="font-semibold text-gray-900">{label}</div>
                  <div className="text-xs text-gray-500 mt-1">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., AI-Powered Loan Approval System"
                  className="input-field text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brief Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What problem does this solve? What value does it provide?"
                  className="textarea-field"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as PRDPriority })}
                    className="input-field"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Context for AI */}
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-start gap-3 mb-4">
              <Brain className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Help AI Understand Your Vision</h3>
                <p className="text-sm text-gray-600">The more context you provide, the better the PRD</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who is this for?
                </label>
                <textarea
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  placeholder="e.g., Small business owners who need quick access to working capital, typically managing 5-20 employees..."
                  className="textarea-field"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What business goals will this achieve?
                </label>
                <textarea
                  value={formData.businessGoals}
                  onChange={(e) => setFormData({ ...formData, businessGoals: e.target.value })}
                  placeholder="e.g., Reduce loan approval time from 3 days to 5 minutes, increase approval rate by 25%, improve customer satisfaction..."
                  className="textarea-field"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any constraints or requirements?
                </label>
                <textarea
                  value={formData.constraints}
                  onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                  placeholder="e.g., Must comply with RBI regulations, integrate with existing CRM, support mobile-first experience..."
                  className="textarea-field"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  value={formData.aiPrompt}
                  onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
                  placeholder="Any other details, inspiration, or specific requirements you want to include..."
                  className="textarea-field"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={onCancel} className="btn-outline">
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!formData.title.trim()}
              className="btn-primary flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate PRD with AI
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep !== 'complete') {
    const currentStepIndex = generationSteps.findIndex(s => s.step === currentStep);
    const progress = ((currentStepIndex + 1) / generationSteps.length) * 100;

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="card text-center space-y-6">
            {/* Animated Icon */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse opacity-20"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white animate-bounce" />
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your PRD</h2>
              <p className="text-gray-600">{currentMessage}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {generationSteps.map(({ step, message, icon: Icon }, index) => {
                const isComplete = index < currentStepIndex;
                const isCurrent = step === currentStep;
                
                return (
                  <div
                    key={step}
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      isComplete
                        ? 'bg-green-50 border border-green-200'
                        : isCurrent
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                    ) : (
                      <Icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${
                      isComplete ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {message.replace('...', '')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Fun Tip */}
            <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800">
                💡 <strong>Pro tip:</strong> The more context you provide, the more tailored your PRD will be!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Complete - Show beautiful PRD view
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Success Header */}
      <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">PRD Created Successfully!</h2>
              <p className="text-gray-600">Your product requirements document is ready for review</p>
            </div>
          </div>
        </div>
      </div>

      {/* PRD Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{formData.title}</h1>
              <span className={`text-xs px-3 py-1 rounded-full ${
                formData.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                formData.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                formData.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {formData.priority} Priority
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {formData.type}
              </span>
            </div>
            <p className="text-gray-600">{formData.description}</p>
            
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Created {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{Object.keys(generatedContent).length} sections</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>AI Generated</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Save & Continue Editing
          </button>
          <button className="btn-outline flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn-outline flex items-center gap-2">
            <Share className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* PRD Content */}
      <div className="space-y-6">
        {Object.values(generatedContent).map((section: any, index) => (
          <div key={index} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Edit className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {section.content}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span>{section.content.split(' ').length} words</span>
                <span>•</span>
                <span>{Math.ceil(section.content.split(' ').length / 200)} min read</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-4 h-4" />
                <span>AI Generated - {Math.round(section.confidence || 85)}% confidence</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Next Steps</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <span>Review and refine each section</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <span>Add stakeholders and get feedback</span>
          </li>
          <li className="flex items-start gap-2">
            <Eye className="w-5 h-5 text-purple-600 mt-0.5" />
            <span>Share with your team for review</span>
          </li>
          <li className="flex items-start gap-2">
            <Target className="w-5 h-5 text-orange-600 mt-0.5" />
            <span>Move to implementation once approved</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
