import React, { useState } from 'react';
import { Save, Edit, CheckCircle, AlertCircle, Plus, FileText, Sparkles, Target, Users, BarChart3, Brain, ArrowRight } from 'lucide-react';
import { Project, PRD } from '../../types';
import { PMOnly } from '../shared/RoleGuard';
import Button from '../shared/Button';
import PRDGenerator from './PRDGenerator';
import PRDViewer from './PRDViewer';
import PRDViewerNew from './PRDViewerNew';
import PRDViewerNotion from './PRDViewerNotion';
import PRDStreamingViewer from './PRDStreamingViewer';
import { useApp } from '../../context/AppContext';

interface ProductThinkingProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export default function ProductThinking({ project, onProjectUpdate }: ProductThinkingProps) {
  const { state } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'setup' | 'generate' | 'preview' | 'finalize'>('setup');
  const [generatedPRD, setGeneratedPRD] = useState<any>(null);
  const [strategicData, setStrategicData] = useState<any>(null);
  const [showMoveSuccess, setShowMoveSuccess] = useState(false);
  const [useStreamingViewer, setUseStreamingViewer] = useState(true);
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
    
    // Generate PRD instantly with pre-built content
    const generatedPRD = {
      id: `prd-${Date.now()}`,
      projectId: project.id,
      sections: [
        {
          id: 'executive-summary',
          title: 'Executive Summary',
          content: `This PRD outlines the development of ${project.name}, a ${project.description.toLowerCase()}. The product aims to address key user needs while achieving business objectives through a user-centered design approach.`,
          subsections: []
        },
        {
          id: 'problem-statement',
          title: 'Problem Statement & Business Context',
          content: `The current market lacks a comprehensive solution for ${project.description.toLowerCase()}. Users face challenges in [specific pain points based on strategic data]. This product addresses these gaps by providing [key value propositions].`,
          subsections: []
        },
        {
          id: 'product-vision',
          title: 'Product Vision & Strategy',
          content: `Our vision is to create the leading ${project.description.toLowerCase()} that empowers users to [key outcomes]. The strategy focuses on [strategic approach] with a phased rollout plan.`,
          subsections: []
        },
        {
          id: 'target-users',
          title: 'Target Users and Personas',
          content: `Primary users include ${prd.targetUsers.join(', ')}. Each persona has specific needs, goals, and pain points that drive our design decisions and feature prioritization.`,
          subsections: []
        },
        {
          id: 'user-stories',
          title: 'User Stories and Use Cases',
          content: `As a [user type], I want to [capability] so that I can [benefit]. Key use cases include [primary use cases] with supporting workflows for [secondary use cases].`,
          subsections: []
        },
        {
          id: 'functional-requirements',
          title: 'Functional Requirements',
          content: `Core features include [key features] with supporting functionality for [secondary features]. Each feature is designed to meet specific user needs and business objectives.`,
          subsections: []
        },
        {
          id: 'success-metrics',
          title: 'Success Metrics and KPIs',
          content: `Success will be measured through ${prd.successMetrics.join(', ')}. These metrics align with business objectives and user satisfaction goals.`,
          subsections: []
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('ProductThinking: Generated PRD instantly:', generatedPRD);
    setGeneratedPRD(generatedPRD);
    setCurrentStep('preview');
  };

  const handlePRDFinalized = (finalPRD: PRD, updatedProject?: any) => {
    console.log('ProductThinking: Finalizing PRD:', finalPRD);
    setPRD(finalPRD);
    setCurrentStep('finalize');
    
    // Use provided updatedProject or create default one
    const projectToUpdate = updatedProject || {
      ...project,
      prd: finalPRD,
      currentStage: 'USER_RESEARCH' as const,
      updatedAt: new Date().toISOString(),
    };
    
    // Show success message if moving to next step
    if (updatedProject) {
      setShowMoveSuccess(true);
      setTimeout(() => setShowMoveSuccess(false), 5000); // Hide after 5 seconds
    }
    
    // Save to localStorage immediately
    try {
      const existingProjects = JSON.parse(localStorage.getItem('processcraft_projects') || '[]');
      const updatedProjects = existingProjects.map((p: any) => 
        p.id === project.id ? projectToUpdate : p
      );
      localStorage.setItem('processcraft_projects', JSON.stringify(updatedProjects));
      localStorage.setItem('processcraft_projects_backup', JSON.stringify(updatedProjects));
      localStorage.setItem('processcraft_projects_timestamp', new Date().toISOString());
      console.log('ProductThinking: PRD saved to localStorage immediately');
    } catch (error) {
      console.error('ProductThinking: Error saving to localStorage:', error);
    }
    
    onProjectUpdate(projectToUpdate);
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

  // Clean and format PRD content to remove malformed HTML
  const cleanPRDContent = (content: string): string => {
    if (!content || typeof content !== 'string') {
      console.warn('ProductThinking cleanPRDContent: Invalid content provided:', content);
      return '';
    }
    
    try {
      let cleaned = content
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
      
      return cleaned;
    } catch (error) {
      console.error('Error in ProductThinking cleanPRDContent:', error);
      return '';
    }
  };

  // Show PRD Viewer if PRD has content and we're not editing
  if (prd && (prd.content || prd.status === 'COMPLETED') && !isEditing) {
    return (
      <PRDViewerNotion
        project={project}
        prd={prd}
        onEdit={handleEditPRD}
        onFinalize={handlePRDFinalized}
        onMoveToNext={handlePRDFinalized}
      />
    );
  }

  // Show Strategic PRD Setup for PM when creating/editing
  if (currentStep === 'setup' && (isEditing || !prd || prd.status === 'DRAFT')) {
    return (
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-end">
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

        {useStreamingViewer ? (
          <PRDStreamingViewer
            project={project}
            userRole={state.user?.role}
            onEdit={() => setIsEditing(true)}
            onFinalize={(finalPRD) => {
              setGeneratedPRD(finalPRD);
              handlePRDFinalized(finalPRD);
            }}
            onMoveToNext={() => {
              const updatedProject = {
                ...project,
                currentStage: 'USER_RESEARCH' as const,
                status: 'IN_PROGRESS' as const,
                prd: { ...project.prd, ...generatedPRD }
              };
              onProjectUpdate(updatedProject);
            }}
          />
        ) : (
          <PRDGenerator
            project={project}
            prd={prd}
            onPRDGenerated={(generatedPRD) => {
              setGeneratedPRD(generatedPRD);
              setCurrentStep('preview');
            }}
            onPRDFinalized={handlePRDFinalized}
          />
        )}
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
      <PRDViewerNotion
        project={project}
        prd={generatedPRD}
        onEdit={() => setCurrentStep('generate')}
        onFinalize={() => {
          const finalPRD = { 
            ...prd, 
            status: 'COMPLETED' as const,
            updatedAt: new Date().toISOString() 
          };
          handlePRDFinalized(finalPRD);
        }}
        onMoveToNext={() => {
          const finalPRD = { 
            ...prd, 
            status: 'COMPLETED' as const,
            updatedAt: new Date().toISOString() 
          };
          const updatedProject = {
            ...project,
            prd: finalPRD,
            currentStage: 'USER_RESEARCH' as const,
            status: 'IN_PROGRESS' as const,
            updatedAt: new Date().toISOString(),
          };
          handlePRDFinalized(finalPRD, updatedProject);
        }}
      />
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

      {/* Success Message for Moving to Next Step */}
      {showMoveSuccess && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-green-800">PRD Finalized & Moved to Research Stage!</h3>
              <p className="text-sm text-green-700 mt-1">
                Your PRD has been finalized and the project has been moved to the User Research stage. 
                You can now proceed with research planning and execution.
              </p>
            </div>
          </div>
        </div>
      )}

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
