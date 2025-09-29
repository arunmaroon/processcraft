import React, { useState } from 'react';
import { Save, Edit, CheckCircle, AlertCircle, Plus, FileText, Sparkles, Target, Users, BarChart3, Brain, ArrowRight } from 'lucide-react';
import { Project, PRD } from '../../types';
import { PMOnly } from '../shared/RoleGuard';
import Button from '../shared/Button';
import StrategicPRDSetup from './StrategicPRDSetup';
import PRDViewer from './PRDViewer';

interface ProductThinkingProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export default function ProductThinking({ project, onProjectUpdate }: ProductThinkingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'generate' | 'preview' | 'finalize'>('setup');
  const [generatedPRD, setGeneratedPRD] = useState<any>(null);
  const [strategicData, setStrategicData] = useState<any>(null);
  const [prd, setPRD] = useState<PRD>(project.prd || {
    id: Date.now().toString(),
    objectives: [],
    targetUsers: [],
    successMetrics: [],
    businessContext: '',
    constraints: [],
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const handleSave = () => {
    console.log('ProductThinking: Saving PRD and moving to Research stage');
    const updatedPRD = { 
      ...prd, 
      status: 'COMPLETED' as const,
      updatedAt: new Date().toISOString() 
    };
    const updatedProject = {
      ...project,
      prd: updatedPRD,
      currentStage: 'USER_RESEARCH' as const,
      updatedAt: new Date().toISOString(),
    };
    console.log('ProductThinking: Updated project:', updatedProject);
    onProjectUpdate(updatedProject);
    setIsEditing(false);
  };

  const handleStrategicDataUpdate = (data: any) => {
    setStrategicData(data);
  };

  const handleGeneratePRD = async () => {
    console.log('ProductThinking: Generating PRD with strategic data:', strategicData);
    setCurrentStep('generate');
    
    try {
      const response = await fetch('/api/research/generate-prd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          prd: prd,
          strategicData: strategicData,
          projectName: project.name,
          projectDescription: project.description
        }),
      });

      if (response.ok) {
        const generatedPRD = await response.json();
        console.log('ProductThinking: Generated PRD:', generatedPRD);
        setGeneratedPRD(generatedPRD);
        setCurrentStep('preview');
      } else {
        console.error('ProductThinking: Failed to generate PRD');
        setCurrentStep('setup');
      }
    } catch (error) {
      console.error('ProductThinking: Error generating PRD:', error);
      setCurrentStep('setup');
    }
  };

  const handlePRDFinalized = (finalPRD: PRD) => {
    setPRD(finalPRD);
    setCurrentStep('finalize');
    const updatedProject = {
      ...project,
      prd: finalPRD,
      currentStage: 'USER_RESEARCH' as const,
      updatedAt: new Date().toISOString(),
    };
    onProjectUpdate(updatedProject);
  };

  const handleEditPRD = () => {
    setCurrentStep('setup');
    setIsEditing(true);
  };

  const handleExportPRD = () => {
    // TODO: Implement PDF export
    console.log('Exporting PRD to PDF...');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Edit className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show PRD Viewer if PRD is completed and we're not editing
  if (prd && prd.status === 'COMPLETED' && !isEditing) {
    return (
      <PRDViewer
        project={project}
        prd={prd}
        generatedPRD={generatedPRD}
        onEdit={handleEditPRD}
        onExport={handleExportPRD}
        canEdit={false} // Only PM can edit, others can only view
      />
    );
  }

  // Show Strategic PRD Setup for PM when creating/editing
  if (currentStep === 'setup' && (isEditing || !prd || prd.status === 'DRAFT')) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">PRD Generator</h2>
            <p className="text-gray-500 text-sm">AI-powered PRD generation</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prd.status)}`}>
              {getStatusIcon(prd.status)}
              <span>{(prd.status || 'unknown').replace('_', ' ').toLowerCase()}</span>
            </div>
            {isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        <StrategicPRDSetup
          project={project}
          prd={prd}
          onPRDUpdate={setPRD}
          onGeneratePRD={handleGeneratePRD}
        />
      </div>
    );
  }

  // Show PRD Generation in progress
  if (currentStep === 'generate') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Brain className="w-12 h-12 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Generating Your PRD</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our AI is analyzing your strategic inputs and generating a comprehensive Product Requirements Document...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show PRD Preview
  if (currentStep === 'preview' && generatedPRD) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">PRD Generated Successfully!</h3>
              <p className="text-green-700 text-sm">Review the generated PRD below and make any necessary edits.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Generated PRD Preview</h2>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setCurrentStep('generate')}
            >
              Regenerate
            </Button>
            <Button
              onClick={() => {
                const finalPRD = {
                  ...prd,
                  status: 'COMPLETED' as const,
                  updatedAt: new Date().toISOString()
                };
                handlePRDFinalized(finalPRD);
              }}
              leftIcon={<CheckCircle className="w-4 h-4" />}
              className="bg-green-600 hover:bg-green-700"
            >
              Finalize PRD
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: generatedPRD.content }} />
          </div>
        </div>
      </div>
    );
  }

  // Show Finalization
  if (currentStep === 'finalize') {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">PRD Completed Successfully!</h3>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Your Product Requirements Document has been finalized and the project is ready to move to the Research stage.
        </p>
        <Button
          onClick={() => setCurrentStep('setup')}
          leftIcon={<ArrowRight className="w-4 h-4" />}
          className="bg-green-600 hover:bg-green-700"
        >
          Continue to Research Stage
        </Button>
      </div>
    );
  }

  // Default state - show PRD creation prompt
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Product Requirements Document</h2>
          <p className="text-gray-500 text-sm">AI-powered PRD generation</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prd.status)}`}>
            {getStatusIcon(prd.status)}
            <span>{(prd.status || 'unknown').replace('_', ' ').toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* PRD Creation Prompt */}
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <FileText className="w-12 h-12 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready to create your PRD?</h3>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Our strategic thinking framework will help you define your product vision, understand your market, 
          and create a comprehensive Product Requirements Document that drives success.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Strategic Vision</h4>
            <p className="text-sm text-gray-600">Define your product vision, mission, and value proposition</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">User Research</h4>
            <p className="text-sm text-gray-600">Understand your users, their needs, and journey</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">AI Generation</h4>
            <p className="text-sm text-gray-600">AI-powered PRD generation based on your inputs</p>
          </div>
        </div>
        <PMOnly>
          <Button
            onClick={() => setCurrentStep('setup')}
            leftIcon={<Sparkles className="w-5 h-5" />}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
          >
            Start Strategic PRD Setup
          </Button>
        </PMOnly>
      </div>
    </div>
  );
}
