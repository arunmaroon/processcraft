import React, { useState } from 'react';
import { Play, CheckCircle, ArrowRight, Upload, Users, Brain, Zap } from 'lucide-react';

const WorkflowDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'upload',
      title: 'Upload Research Documents',
      description: 'Drag and drop your research files (PDFs, interviews, surveys, notes)',
      icon: Upload,
      color: 'bg-blue-500',
      details: [
        'Support for multiple file formats',
        'Automatic file validation',
        'Real-time upload progress',
        'Batch upload capabilities'
      ]
    },
    {
      id: 'process',
      title: 'AI Processing & Analysis',
      description: 'Grok AI analyzes your documents to extract user insights and patterns',
      icon: Brain,
      color: 'bg-purple-500',
      details: [
        'Natural language processing',
        'User persona extraction',
        'Behavioral pattern analysis',
        'Demographic insights'
      ]
    },
    {
      id: 'configure',
      title: 'Configure Agent Criteria',
      description: 'Set up demographic, behavioral, and psychological parameters',
      icon: Users,
      color: 'bg-green-500',
      details: [
        'Age, income, education ranges',
        'Personality trait selection',
        'Communication style preferences',
        'Financial behavior patterns'
      ]
    },
    {
      id: 'generate',
      title: 'Generate AI Agents',
      description: 'Create hyper-realistic agents based on your research data',
      icon: Zap,
      color: 'bg-orange-500',
      details: [
        '500+ unique combinations',
        'Research-informed personas',
        'Quality scoring and validation',
        'Batch generation capabilities'
      ]
    }
  ];

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const resetDemo = () => {
    setCurrentStep(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Integrated Upload & Build Workflow</h2>
        <p className="text-gray-600 text-lg">
          Experience the seamless process of uploading research documents and building AI agents in one unified interface
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isActive 
                      ? `${step.color} border-current text-white` 
                      : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <IconComponent className="w-6 h-6" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Display */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-start space-x-6">
          <div className={`flex-shrink-0 w-16 h-16 ${steps[currentStep].color} rounded-lg flex items-center justify-center`}>
            {React.createElement(steps[currentStep].icon, { className: "w-8 h-8 text-white" })}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-gray-600 text-lg mb-4">
              {steps[currentStep].description}
            </p>
            <ul className="space-y-2">
              {steps[currentStep].details.map((detail, index) => (
                <li key={index} className="flex items-center space-x-2 text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <button
          onClick={resetDemo}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Reset Demo
        </button>
        
        <button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <span>{currentStep === steps.length - 1 ? 'Complete' : 'Next'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Key Benefits */}
      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Key Benefits of the Integrated Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Faster Workflow</h4>
            <p className="text-gray-600 text-sm">
              Upload and build agents in one seamless process, reducing time from hours to minutes
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Research-Informed</h4>
            <p className="text-gray-600 text-sm">
              Agents are generated based on your actual research data, not generic templates
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Higher Quality</h4>
            <p className="text-gray-600 text-sm">
              More realistic and contextually relevant agents that truly represent your user base
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto">
          <Play className="w-5 h-5" />
          <span>Try the Integrated Workflow</span>
        </button>
        <p className="text-gray-500 text-sm mt-2">
          Access the full system at <code className="bg-gray-100 px-2 py-1 rounded">/admin/agents</code>
        </p>
      </div>
    </div>
  );
};

export default WorkflowDemo;
