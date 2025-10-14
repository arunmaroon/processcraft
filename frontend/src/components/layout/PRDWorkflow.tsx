import React, { useState } from 'react';
import { ArrowLeft, FileText, Users, Palette, Code, CheckCircle } from 'lucide-react';
import { Project } from '../../types';
import { EnhancedPRD } from '../../types/prd-enhanced';
import ProductThinking from '../research/ProductThinking';
import ResearchStage from '../research/ResearchStage';
import DesignStage from '../design/DesignStage';
import UIGeneration from '../ui-generation/UIGeneration';
import CodeExport from '../code-export/CodeExport';
import { WorkflowStage } from '../../types';

interface PRDWorkflowProps {
  project: Project;
  prd: EnhancedPRD;
  onBack: () => void;
  onPRDUpdate: (prd: EnhancedPRD) => void;
}

const stageComponents: { [key in WorkflowStage]: React.ComponentType<any> } = {
  PRODUCT_THINKING: ProductThinking,
  USER_RESEARCH: ResearchStage,
  UX_DESIGN: DesignStage,
  UI_DESIGN: UIGeneration,
  VISUAL_DESIGN: UIGeneration,
  UX_CONTENT: UIGeneration,
  CODE_EXPORT: CodeExport,
};

const stageInfo = {
  PRODUCT_THINKING: { name: 'Product Thinking', icon: FileText, color: 'text-blue-600' },
  USER_RESEARCH: { name: 'User Research', icon: Users, color: 'text-green-600' },
  UX_DESIGN: { name: 'UX Design', icon: Palette, color: 'text-purple-600' },
  UI_DESIGN: { name: 'UI Design', icon: Palette, color: 'text-purple-600' },
  VISUAL_DESIGN: { name: 'Visual Design', icon: Palette, color: 'text-purple-600' },
  UX_CONTENT: { name: 'UX Content', icon: FileText, color: 'text-orange-600' },
  CODE_EXPORT: { name: 'Code Export', icon: Code, color: 'text-gray-600' },
};

export default function PRDWorkflow({ project, prd, onBack, onPRDUpdate }: PRDWorkflowProps) {
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('PRODUCT_THINKING');

  const workflowStages: WorkflowStage[] = [
    'PRODUCT_THINKING',
    'USER_RESEARCH', 
    'UX_DESIGN',
    'UI_DESIGN',
    'VISUAL_DESIGN',
    'UX_CONTENT',
    'CODE_EXPORT'
  ];

  const handleStageChange = (stage: WorkflowStage) => {
    setCurrentStage(stage);
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    // Update the project if needed
    console.log('Project updated:', updatedProject);
  };

  const CurrentStageComponent = stageComponents[currentStage];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{prd.title}</h1>
              <p className="text-sm text-gray-600">{project.name} • {prd.type}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">v{prd.version}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              prd.stage === 'Create' ? 'bg-blue-50 text-blue-700' :
              prd.stage === 'Edit' ? 'bg-green-50 text-green-700' :
              prd.stage === 'Approval' ? 'bg-purple-50 text-purple-700' :
              'bg-gray-50 text-gray-700'
            }`}>
              {prd.stage}
            </span>
          </div>
        </div>
      </div>

      {/* Stage Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-6 overflow-x-auto">
          {workflowStages.map((stage, index) => {
            const info = stageInfo[stage];
            const isActive = currentStage === stage;
            const isCompleted = false; // TODO: Implement completion logic
            
            return (
              <div key={stage} className="flex items-center gap-2">
                <button
                  onClick={() => handleStageChange(stage)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : isCompleted
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <info.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                  <span>{info.name}</span>
                  {isCompleted && <CheckCircle className="w-4 h-4" />}
                </button>
                
                {index < workflowStages.length - 1 && (
                  <div className={`w-8 h-0.5 ${
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Content */}
      <div className="flex-1 overflow-y-auto">
        <CurrentStageComponent
          project={project}
          onProjectUpdate={handleProjectUpdate}
        />
      </div>
    </div>
  );
}
