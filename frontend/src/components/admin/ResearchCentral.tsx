import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Brain, 
  Users, 
  Target, 
  Settings as SettingsIcon, 
  Shield, 
  BarChart3,
  FileText,
  Database,
  Bot,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Play
} from 'lucide-react';
import DataUploader from './DataUploader';
import InsightSynthesizer from './InsightSynthesizer';
import ConfigOrganizer from './ConfigOrganizer';
import ProductMapper from './ProductMapper';
import AgentBuilder from './AgentBuilder';
import BiasChecker from './BiasChecker';
import AgentPreview from './AgentPreview';
import Settings from './Settings';

interface CentralData {
  insights: any[];
  personas: any[];
  demographics: any[];
  cohorts: any[];
  mappings: any[];
  agents: any[];
  uploads: any[];
}

const steps = [
  { id: 'upload', title: 'Upload Data', description: 'Upload your research files', icon: Upload, completed: false },
  { id: 'synthesize', title: 'Synthesize Insights', description: 'Generate AI insights from data', icon: Brain, completed: false },
  { id: 'organize', title: 'Organize Configs', description: 'Set up personas and demographics', icon: Users, completed: false },
  { id: 'map', title: 'Map Products', description: 'Link products to configurations', icon: Target, completed: false },
  { id: 'build', title: 'Build Agents', description: 'Create AI mimicking agents', icon: Bot, completed: false },
  { id: 'check', title: 'Bias Check', description: 'Ensure ethical compliance', icon: Shield, completed: false },
  { id: 'preview', title: 'Preview & Test', description: 'Test agent responses', icon: Play, completed: false },
  { id: 'settings', title: 'Settings', description: 'Configure system settings', icon: SettingsIcon, completed: false }
];

export default function ResearchCentral() {
  const [currentStep, setCurrentStep] = useState(0);
  const [centralData, setCentralData] = useState<CentralData>({
    insights: [],
    personas: [],
    demographics: [],
    cohorts: [],
    mappings: [],
    agents: [],
    uploads: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCentralData();
  }, []);

  const loadCentralData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/research-central');
      if (response.ok) {
        const data = await response.json();
        setCentralData(data);
        updateStepCompletion(data);
      }
    } catch (error) {
      console.log('API not available, using fallback data');
      // Use fallback data
      setCentralData({
        insights: [
          {
            id: 'insight-1',
            title: 'Mobile-First User Behavior',
            description: 'Users strongly prefer mobile interfaces for financial transactions, with 78% of interactions occurring on mobile devices.',
            category: 'BEHAVIOR',
            confidence: 0.85,
            evidence: ['Mobile usage: 78%', 'Desktop usage: 22%', 'User feedback: "Much easier on phone"'],
            source: 'AI Synthesis',
            createdAt: new Date().toISOString()
          }
        ],
        personas: [],
        demographics: [],
        cohorts: [],
        mappings: [],
        agents: [],
        uploads: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStepCompletion = (data: CentralData) => {
    const updatedSteps = steps.map(step => {
      switch (step.id) {
        case 'upload':
          return { ...step, completed: data.uploads.length > 0 };
        case 'synthesize':
          return { ...step, completed: data.insights.length > 0 };
        case 'organize':
          return { ...step, completed: data.personas.length > 0 && data.demographics.length > 0 };
        case 'map':
          return { ...step, completed: data.mappings.length > 0 };
        case 'build':
          return { ...step, completed: data.agents.length > 0 };
        case 'check':
          return { ...step, completed: true }; // Always completed for now
        case 'preview':
          return { ...step, completed: data.agents.length > 0 };
        case 'settings':
          return { ...step, completed: true }; // Always completed for now
        default:
          return step;
      }
    });
    // Update steps state if needed
  };

  const handleDataUploaded = () => {
    loadCentralData();
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'upload':
        return <DataUploader onDataUploaded={handleDataUploaded} />;
      case 'synthesize':
        return <InsightSynthesizer onInsightsGenerated={() => {}} />;
      case 'organize':
        return <ConfigOrganizer onConfigsUpdated={() => {}} />;
      case 'map':
        return <ProductMapper onMappingsUpdated={() => {}} />;
      case 'build':
        return <AgentBuilder onAgentsBuilt={() => {}} />;
      case 'check':
        return <BiasChecker onBiasChecked={() => {}} />;
      case 'preview':
        return <AgentPreview />;
      case 'settings':
        return <Settings />;
      default:
        return <div>Step not found</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Research Central Setup</h2>
            <p className="text-gray-600 mt-1">Set up your AI research system step by step</p>
          </div>
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = step.completed;
            const isClickable = index <= currentStep || step.completed;
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => isClickable && goToStep(index)}
                  disabled={!isClickable}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isActive
                      ? 'border-primary-600 bg-primary-600 text-white'
                      : isCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : isClickable
                      ? 'border-gray-300 bg-white text-gray-600 hover:border-primary-300'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </button>
                
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Step Labels */}
        <div className="flex justify-between mt-4">
          {steps.map((step, index) => (
            <div key={step.id} className="text-center max-w-20">
              <div className={`text-xs font-medium ${
                index === currentStep ? 'text-primary-600' : 
                step.completed ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>
        </div>
        
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          
          <div className="text-sm text-gray-500">
            {currentStep + 1} of {steps.length} steps
          </div>
          
          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              currentStep === steps.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
