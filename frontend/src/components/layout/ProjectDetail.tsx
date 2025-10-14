import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ProjectPRDs from './ProjectPRDs';
import PRDWorkflow from './PRDWorkflow';
import PRDCreate from '../research/PRDCreate';
import { WorkflowStage, Project } from '../../types';
import { EnhancedPRD } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { getProjectById, updateProject } = useApp();
  const [activeStage, setActiveStage] = useState<WorkflowStage>('PRODUCT_THINKING');
  const [currentView, setCurrentView] = useState<'prds' | 'prd-workflow' | 'create-prd'>('prds');
  const [selectedPRD, setSelectedPRD] = useState<EnhancedPRD | null>(null);

  const project = getProjectById(id!);

  // Sync activeStage with project.currentStage when project changes
  useEffect(() => {
    if (project && project.currentStage) {
      console.log('ProjectDetail: Syncing activeStage with project.currentStage:', project.currentStage);
      setActiveStage(project.currentStage);
    }
  }, [project?.currentStage]);

  // Check for research completion and redirect if needed
  useEffect(() => {
    const isResearchCompleted = localStorage.getItem('research_completed') === 'true';
    if (isResearchCompleted && project && project.currentStage === 'USER_RESEARCH') {
      console.log('ProjectDetail: Research completed, redirecting to UX_DESIGN');
      const updatedProject = {
        ...project,
        currentStage: 'UX_DESIGN' as WorkflowStage
      };
      updateProject(updatedProject);
    }
  }, [project, updateProject]);

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handlePRDSelect = (prd: EnhancedPRD) => {
    setSelectedPRD(prd);
    setCurrentView('prd-workflow');
  };

  const handleCreatePRD = () => {
    setCurrentView('create-prd');
  };

  const handleBackToPRDs = () => {
    setCurrentView('prds');
    setSelectedPRD(null);
  };

  const handlePRDCreated = (prd: EnhancedPRD) => {
    setSelectedPRD(prd);
    setCurrentView('prd-workflow');
  };

  const handlePRDUpdate = (updatedPRD: EnhancedPRD) => {
    enhancedPRDService.savePRD(updatedPRD);
    setSelectedPRD(updatedPRD);
  };

  if (currentView === 'prd-workflow' && selectedPRD) {
    return (
      <PRDWorkflow
        project={project}
        prd={selectedPRD}
        onBack={handleBackToPRDs}
        onPRDUpdate={handlePRDUpdate}
      />
    );
  }

  if (currentView === 'create-prd') {
    return (
      <div className="h-full">
        <PRDCreate
          projectId={project.id}
          onPRDCreated={handlePRDCreated}
          onCancel={handleBackToPRDs}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
      <ProjectPRDs
        project={project}
        onBack={() => window.history.back()}
        onPRDSelect={handlePRDSelect}
        onCreatePRD={handleCreatePRD}
      />
    </div>
  );
}
