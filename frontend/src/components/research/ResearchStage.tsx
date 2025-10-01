import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from '../shared/Button';
import ResearchPlan from './ResearchPlan';
import DiscussionGuide from './DiscussionGuide';
import ResearchReport from './ResearchReport';
import ResearchSetup from './ResearchSetup';
import PRDViewerNotion from './PRDViewerNotion';

interface ResearchStageProps {
  project: any;
  onProjectUpdate: (project: any) => void;
}

const ResearchStage: React.FC<ResearchStageProps> = ({ project, onProjectUpdate }) => {
  const { state } = useApp();
  const user = state.user;
  const [currentStage, setCurrentStage] = useState(1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [researchPlan, setResearchPlan] = useState<any>(null);
  const [discussionGuide, setDiscussionGuide] = useState<any>(null);
  const [researchReport, setResearchReport] = useState<any>(null);
  const [showPRD, setShowPRD] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [prdData, setPrdData] = useState<any>(null);

  // Check if user has Research role (case insensitive)
  const canConductResearch = user?.role?.toLowerCase() === 'research' || user?.role?.toLowerCase() === 'researcher';

  const stages = [
    { id: 1, name: 'Research Plan', description: 'Generate AI-powered research plan' },
    { id: 2, name: 'Research Setup', description: 'Configure AI agents and user demographics' },
    { id: 3, name: 'Discussion Guide', description: 'Create comprehensive discussion guide' },
    { id: 4, name: 'Data Collection', description: 'Conduct user interviews' },
    { id: 5, name: 'Research Report', description: 'Generate comprehensive research report' }
  ];

  useEffect(() => {
    console.log('ResearchStage: Loading data for project:', project.id);
    console.log('ResearchStage: Project data:', project);
    
    // Load saved data from localStorage
    const savedPlan = localStorage.getItem(`researchPlan_${project.id}`);
    const savedGuide = localStorage.getItem(`discussionGuide_${project.id}`);
    const savedStages = localStorage.getItem(`completedStages_${project.id}`);
    const savedPRD = localStorage.getItem(`prd-generated-${project.id}`);
    
    console.log('ResearchStage: Saved PRD from localStorage:', savedPRD ? 'Found' : 'Not found');
    
    if (savedPlan) {
      setResearchPlan(JSON.parse(savedPlan));
    }
    if (savedGuide) {
      setDiscussionGuide(JSON.parse(savedGuide));
    }
    if (savedStages) {
      setCompletedStages(JSON.parse(savedStages));
    }
    
    // Check for PRD data in multiple places
    if (savedPRD) {
      try {
        const prdData = JSON.parse(savedPRD);
        console.log('ResearchStage: Loaded PRD from localStorage:', prdData);
        setPrdData(prdData);
        // Don't auto-show PRD - keep it hidden by default
        return;
      } catch (error) {
        console.error('Error parsing saved PRD:', error);
      }
    }
    
    // Check project.prd.content
    if (project?.prd?.content) {
      console.log('ResearchStage: Loading PRD from project.prd.content:', project.prd);
      setPrdData(project.prd);
      // Don't auto-show PRD - keep it hidden by default
      return;
    }
    
    // Check project.prd (without .content)
    if (project?.prd) {
      console.log('ResearchStage: Loading PRD from project.prd:', project.prd);
      setPrdData(project.prd);
      // Don't auto-show PRD - keep it hidden by default
      return;
    }
    
    console.log('ResearchStage: No PRD data found anywhere');
  }, [project.id, project.prd]);

  const handlePlanGenerated = (plan: any) => {
    setResearchPlan(plan);
    localStorage.setItem(`researchPlan_${project.id}`, JSON.stringify(plan));
    
    // Mark stage 1 as completed and move to stage 2
    setCompletedStages(prev => [...prev, 1]);
    setCurrentStage(2);
    
    // Save completed stages to localStorage
    localStorage.setItem(`completedStages_${project.id}`, JSON.stringify([...completedStages, 1]));
  };

  const handlePlanCompleted = (plan?: any) => {
    if (plan) {
      setResearchPlan(plan);
      localStorage.setItem(`researchPlan_${project.id}`, JSON.stringify(plan));
    }
    setCompletedStages(prev => [...prev, 1]);
    localStorage.setItem(`completedStages_${project.id}`, JSON.stringify([...completedStages, 1]));
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleGuideGenerated = (guide: any) => {
    setDiscussionGuide(guide);
    localStorage.setItem(`discussionGuide_${project.id}`, JSON.stringify(guide));
  };

  const handleReportGenerated = (report: any) => {
    setResearchReport(report);
    localStorage.setItem(`researchReport_${project.id}`, JSON.stringify(report));
  };

  const handleSetupComplete = (setup: any) => {
    console.log('Research setup completed:', setup);
    setCompletedStages(prev => [...prev, 2]);
    setCurrentStage(3);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleGuideCompleted = (guide?: any) => {
    if (guide) {
      setDiscussionGuide(guide);
      localStorage.setItem(`discussionGuide_${project.id}`, JSON.stringify(guide));
    }
    setCompletedStages(prev => [...prev, 2]);
    localStorage.setItem(`completedStages_${project.id}`, JSON.stringify([...completedStages, 2]));
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const isResearcher = true; // For now, always allow editing

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Material Design App Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 py-4 max-w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-gray-900">Research Workflow</h1>
                <p className="text-gray-500 text-sm">AI-powered user research and insights generation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {completedStages.length >= 5 && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-full">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs sm:text-sm font-medium text-green-800">Research Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-3 sm:p-4 max-w-full space-y-6">
          {/* PRD Viewer */}
          {showPRD && prdData && (
            <div>
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Product Requirements Document</h2>
                <button
                  onClick={() => setShowPRD(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Research Stages
                </button>
              </div>
              <PRDViewerNotion
                project={project}
                prd={prdData}
                userRole={user?.role}
                onEdit={() => {
                  // Only PM can edit
                  if (user?.role === 'PM') {
                    // Navigate to Product Thinking stage for editing
                    const updatedProject = {
                      ...project,
                      currentStage: 'PRODUCT_THINKING' as const,
                      updatedAt: new Date().toISOString(),
                    };
                    onProjectUpdate(updatedProject);
                  }
                }}
                onFinalize={() => {
                  // Only PM can finalize
                  if (user?.role === 'PM') {
                    const updatedProject = {
                      ...project,
                      prd: { ...project.prd, status: 'COMPLETED' },
                      updatedAt: new Date().toISOString(),
                    };
                    onProjectUpdate(updatedProject);
                  }
                }}
                onMoveToNext={() => {
                  // Only PM can move to next stage
                  if (user?.role === 'PM') {
                    const updatedProject = {
                      ...project,
                      currentStage: 'UX_DESIGN' as const,
                      updatedAt: new Date().toISOString(),
                    };
                    onProjectUpdate(updatedProject);
                  }
                }}
              />
            </div>
          )}

          {/* Material Design Content */}
          {!showPRD && (
            <div>
              {/* Role Access Control */}
              {!canConductResearch ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <Brain className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800">Research Access Restricted</h3>
                    <p className="text-yellow-700 mt-1">
                      Only users with Research or Researcher role can conduct research activities. 
                      Your current role: <span className="font-semibold">{user?.role || 'Unknown'}</span>
                    </p>
                    <p className="text-sm text-yellow-600 mt-2">
                      Contact your administrator to get Research/Researcher role access.
                    </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Progress Indicator */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-medium text-gray-900">Progress</h2>
                      <div className="flex items-center space-x-3">
                        {prdData && (
                          <button
                            onClick={() => setShowPRD(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            View PRD
                          </button>
                        )}
                        <span className="text-sm text-gray-500">
                          {Math.min(completedStages.length, 5)} of 5 stages completed
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((completedStages.length / 5) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stage Navigation */}
                  <StageNavigation
                    stages={stages}
                    currentStage={currentStage}
                    onStageChange={setCurrentStage}
                    completedStages={completedStages}
                  />

                  {/* Stage Content */}
                  <div className="mt-6">
              {/* Stage 1: Research Plan */}
              {currentStage === 1 && (
              <ResearchPlan
                project={project}
                onPlanCreated={handlePlanGenerated}
                prdData={project.prd}
              />
              )}

              {/* Stage 3: Discussion Guide */}
              {currentStage === 3 && (
                <DiscussionGuide
                  researchPlan={researchPlan}
                  prdData={project.prd}
                  onGuideGenerated={handleGuideGenerated}
                  onGuideCompleted={handleGuideCompleted}
                  initialGuide={discussionGuide}
                />
              )}

              {/* Stage 5: Research Report */}
              {currentStage === 5 && (
                <ResearchReport
                  researchPlan={researchPlan}
                  prdData={project.prd}
                  onReportGenerated={handleReportGenerated}
                />
              )}

              {/* Stage 2: Research Setup */}
              {currentStage === 2 && (
                <ResearchSetup
                  project={project}
                  onSetupComplete={handleSetupComplete}
                />
              )}

              {/* Stage 4: Data Collection */}
              {currentStage === 4 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Data Collection</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Stage 4
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Conduct Interviews</h4>
                        <p className="text-sm text-gray-600">Use the discussion guide to conduct user interviews</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Record Insights</h4>
                        <p className="text-sm text-gray-600">Document key findings and user feedback</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Collect Data</h4>
                        <p className="text-sm text-gray-600">Gather quantitative and qualitative data</p>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          console.log('Completing data collection');
                          setCompletedStages(prev => [...prev, 4]);
                          setShowSuccessMessage(true);
                          setTimeout(() => setShowSuccessMessage(false), 3000);
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Complete Data Collection
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 5: Synthesis & Report */}
              {currentStage === 5 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Synthesis & Report</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Stage 5
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Analyze Data</h4>
                        <p className="text-sm text-gray-600">Synthesize findings from interviews and research</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Generate Insights</h4>
                        <p className="text-sm text-gray-600">Create actionable insights and recommendations</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Create Report</h4>
                        <p className="text-sm text-gray-600">Compile findings into a comprehensive report</p>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => {
                          console.log('Completing synthesis');
                          setCompletedStages(prev => [...prev, 5]);
                          setShowSuccessMessage(true);
                          setTimeout(() => setShowSuccessMessage(false), 3000);
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Complete Synthesis
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* All stages completed message */}
              {completedStages.length === 5 && (
                <div className="bg-white rounded-lg shadow-sm border border-green-200">
                  <div className="p-4 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Research Completed!</h3>
                    <p className="text-sm text-gray-600 mb-4">All research stages have been completed successfully.</p>
                    <div className="flex justify-center space-x-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
                        View Report
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                        Export Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Stage Navigation Component
const StageNavigation: React.FC<{
  stages: any[];
  currentStage: number;
  onStageChange: (stage: number) => void;
  completedStages: number[];
}> = ({ stages, currentStage, onStageChange, completedStages }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-wrap gap-2">
        {stages.map((stage) => (
          <button
            key={stage.id}
            onClick={() => onStageChange(stage.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentStage === stage.id
                ? 'bg-blue-600 text-white'
                : completedStages.includes(stage.id)
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {stage.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ResearchStage;