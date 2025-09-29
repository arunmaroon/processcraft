import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Clock, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StageNavigator from './StageNavigator';
import ProductThinking from '../research/ProductThinking';
import ResearchStage from '../research/ResearchStage';
import DesignStage from '../design/DesignStage';
import UIGeneration from '../ui-generation/UIGeneration';
import CodeExport from '../code-export/CodeExport';
import { WorkflowStage, Project } from '../../types';

const stageComponents: { [key in WorkflowStage]: React.ComponentType<any> } = {
  PRODUCT_THINKING: ProductThinking,
  USER_RESEARCH: ResearchStage,
  UX_DESIGN: DesignStage,
  UI_DESIGN: UIGeneration,
  VISUAL_DESIGN: UIGeneration,
  UX_CONTENT: UIGeneration,
  CODE_EXPORT: CodeExport,
};

// Legacy stage mapping for backward compatibility
const legacyStageMapping: { [key: string]: WorkflowStage } = {
  'RESEARCH': 'USER_RESEARCH',
  'UI_GENERATION': 'UI_DESIGN',
  'PM_MANAGER': 'PRODUCT_THINKING',
  'DESIGNER': 'UX_DESIGN',
  'DESIGN_HEAD': 'VISUAL_DESIGN'
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { getProjectById, updateProject } = useApp();
  const [activeStage, setActiveStage] = useState<WorkflowStage>('PRODUCT_THINKING');

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

  // Handle legacy stage names
  const normalizedStage = legacyStageMapping[activeStage] || activeStage;
  const StageComponent = stageComponents[normalizedStage as WorkflowStage];
  
  // Debug logging
  console.log('ProjectDetail: activeStage:', activeStage);
  console.log('ProjectDetail: normalizedStage:', normalizedStage);
  console.log('ProjectDetail: StageComponent:', StageComponent);
  console.log('ProjectDetail: stageComponents:', stageComponents);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-lg font-semibold text-gray-900">{project.name}</h1>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                project.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                project.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                'bg-emerald-100 text-emerald-800'
              }`}>
                {project.status.replace('_', ' ').toLowerCase()}
              </span>
            </div>
            <p className="text-sm text-gray-500 truncate max-w-md">{project.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>


      {/* Stage Navigator */}
      <StageNavigator
        currentStage={project.currentStage}
        activeStage={activeStage}
        onStageChange={setActiveStage}
        project={project}
      />

      {/* Stage Content */}
      <div className="card">
        {StageComponent ? (
          <StageComponent
            project={project}
            onProjectUpdate={async (updatedProject: Project) => {
              console.log('ProjectDetail: onProjectUpdate called with:', updatedProject);
              await updateProject(updatedProject);
              console.log('ProjectDetail: Project updated successfully');
            }}
          />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Stage Component Not Found</h3>
            <p className="text-gray-600">The selected stage component is not available.</p>
            <p className="text-sm text-gray-500 mt-2">Active Stage: {activeStage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
