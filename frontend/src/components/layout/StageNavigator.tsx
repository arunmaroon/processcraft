import { CheckCircle, Clock, Lock } from 'lucide-react';
import { Project, WorkflowStage } from '../../types';

interface StageNavigatorProps {
  currentStage: WorkflowStage;
  activeStage: WorkflowStage;
  onStageChange: (stage: WorkflowStage) => void;
  project: Project;
}

const stages: { 
  key: WorkflowStage; 
  label: string; 
  color: string;
}[] = [
  {
    key: 'PRODUCT_THINKING',
    label: 'Product Thinking',
    color: 'blue'
  },
  {
    key: 'USER_RESEARCH',
    label: 'User Research',
    color: 'green'
  },
  {
    key: 'UX_DESIGN',
    label: 'UX Design',
    color: 'purple'
  },
  {
    key: 'UI_DESIGN',
    label: 'UI Design',
    color: 'pink'
  },
  {
    key: 'VISUAL_DESIGN',
    label: 'Visual Design',
    color: 'indigo'
  },
  {
    key: 'UX_CONTENT',
    label: 'UX Content',
    color: 'teal'
  },
  {
    key: 'CODE_EXPORT',
    label: 'Code Export',
    color: 'orange'
  }
];

const getStageStatus = (project: Project, stage: WorkflowStage): 'completed' | 'current' | 'locked' => {
  const stageOrder = stages.map(s => s.key);
  const currentIndex = stageOrder.indexOf(project.currentStage);
  const stageIndex = stageOrder.indexOf(stage);

  if (stageIndex < currentIndex) return 'completed';
  if (stageIndex === currentIndex) return 'current';
  return 'locked';
};

const getStageIcon = (status: 'completed' | 'current' | 'locked') => {
  switch (status) {
    case 'completed':
      return CheckCircle;
    case 'current':
      return Clock;
    case 'locked':
      return Lock;
  }
};

export default function StageNavigator({ 
  currentStage, 
  activeStage, 
  onStageChange, 
  project 
}: StageNavigatorProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Workflow Stages</h2>
        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {stages.find(s => s.key === currentStage)?.label}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {stages.map((stage, index) => {
          const status = getStageStatus(project, stage.key);
          const Icon = getStageIcon(status);
          const isActive = activeStage === stage.key;
          const isClickable = status !== 'locked';

          return (
            <div key={stage.key} className="flex flex-col">
              <button
                onClick={() => isClickable && onStageChange(stage.key)}
                disabled={!isClickable}
                className={`
                  w-full p-3 rounded-lg border-2 transition-all duration-200 text-center
                  ${isActive 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : isClickable 
                      ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50' 
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                  }
                `}
                title={`${stage.label} - ${status === 'completed' ? 'Completed' : status === 'current' ? 'In Progress' : 'Locked'}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${status === 'completed' 
                      ? 'bg-green-100 text-green-600' 
                      : status === 'current' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-400'
                    }
                  `}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className={`
                      font-medium text-sm leading-tight
                      ${isActive ? 'text-blue-900' : 'text-gray-900'}
                    `}>
                      {stage.label}
                    </h3>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Current stage info */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`
              w-2 h-2 rounded-full
              ${getStageStatus(project, activeStage) === 'completed' ? 'bg-green-500' : 
                getStageStatus(project, activeStage) === 'current' ? 'bg-blue-500' : 'bg-gray-400'}
            `} />
            <span className="text-sm font-medium text-gray-900">
              {stages.find(s => s.key === activeStage)?.label}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {getStageStatus(project, activeStage) === 'completed' ? 'Completed' : 
             getStageStatus(project, activeStage) === 'current' ? 'In Progress' : 'Locked'}
          </span>
        </div>
      </div>
    </div>
  );
}
