import React from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';

interface Stage {
  id: number;
  title: string;
  icon: React.ReactNode;
  color: string;
  status: 'completed' | 'active' | 'pending';
}

interface StageNavigationProps {
  stages: Stage[];
  currentStage: number;
  onStageChange: (stage: number) => void;
  completedStages: number[];
}

const StageNavigation: React.FC<StageNavigationProps> = ({
  stages,
  currentStage,
  onStageChange,
  completedStages
}) => {
  const canNavigateToStage = (stageId: number) => {
    // Can navigate to current stage, completed stages, or next stage if current is completed
    const canNavigate = stageId === currentStage || 
           completedStages.includes(stageId) || 
           (stageId === currentStage + 1 && completedStages.includes(currentStage));
    console.log('canNavigateToStage', { stageId, currentStage, completedStages, canNavigate });
    return canNavigate;
  };

  const getStageStatus = (stageId: number) => {
    if (completedStages.includes(stageId)) return 'completed';
    if (stageId === currentStage) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3 overflow-hidden">
      {/* Material Design Header */}
      <div className="px-3 sm:px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-900">Research Stages</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span className="text-xs text-gray-600">Stage {currentStage} of {stages.length}</span>
          </div>
        </div>
      </div>

      {/* Material Design Stepper */}
      <div className="p-3 sm:p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-max">
          {stages.map((stage, index) => {
            const isCompleted = completedStages.includes(stage.id);
            const isActive = stage.id === currentStage;
            const canNavigate = canNavigateToStage(stage.id);
            
            return (
              <div key={stage.id} className="flex items-center flex-1 min-w-0">
                {/* Stage Circle */}
                <div className="flex flex-col items-center min-w-0">
                  <button
                    onClick={() => canNavigate && onStageChange(stage.id)}
                    disabled={!canNavigate}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-500 text-white shadow-lg'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : canNavigate
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                    title={`${stage.title}${isCompleted ? ' (Completed)' : isActive ? ' (Current)' : ''}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <span className="text-xs font-medium">{stage.id}</span>
                    )}
                  </button>
                  
                  {/* Stage Label */}
                  <div className="mt-1 text-center min-w-0">
                    <div className={`text-xs font-medium truncate ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {stage.title}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < stages.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 sm:mx-2 min-w-0">
                    <div className={`h-full ${
                      completedStages.includes(stage.id) ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StageNavigation;
