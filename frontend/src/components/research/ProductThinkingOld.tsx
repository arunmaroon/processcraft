import { useState } from 'react';
import { Save, Edit, CheckCircle, AlertCircle, Plus, FileText, Sparkles, Target, Users, BarChart3, Brain, ArrowRight } from 'lucide-react';
import { Project, PRD } from '../../types';
import { PMOnly } from '../shared/RoleGuard';
import Button from '../shared/Button';
import PRDCreationWizard from './PRDCreationWizard';
import PRDGenerator from './PRDGenerator';
import StrategicPRDSetup from './StrategicPRDSetup';
import PRDViewer from './PRDViewer';

interface ProductThinkingProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export default function ProductThinking({ project, onProjectUpdate }: ProductThinkingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
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

  const handlePRDComplete = (completedPRD: PRD) => {
    setPRD(completedPRD);
    const updatedProject = {
      ...project,
      prd: completedPRD,
      updatedAt: new Date().toISOString(),
    };
    onProjectUpdate(updatedProject);
    setShowWizard(false);
    setCurrentStep('generate');
  };

  const handlePRDGenerated = (generated: any) => {
    setGeneratedPRD(generated);
    setCurrentStep('preview');
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

  const handleEditPRD = () => {
    setCurrentStep('setup');
    setIsEditing(true);
  };

  const handleExportPRD = () => {
    // TODO: Implement PDF export
    console.log('Exporting PRD to PDF...');
  };

  const steps = [
    { id: 'setup', title: 'PRD Setup', description: 'Define basic PRD information', icon: <FileText className="w-5 h-5" /> },
    { id: 'generate', title: 'Generate PRD', description: 'AI-powered PRD generation', icon: <Brain className="w-5 h-5" /> },
    { id: 'preview', title: 'Preview & Edit', description: 'Review and edit generated PRD', icon: <Edit className="w-5 h-5" /> },
    { id: 'finalize', title: 'Finalize', description: 'Approve and move to next stage', icon: <CheckCircle className="w-5 h-5" /> }
  ];


  const addArrayItem = (field: 'objectives' | 'targetUsers' | 'successMetrics' | 'constraints') => {
    setPRD(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayItem = (field: 'objectives' | 'targetUsers' | 'successMetrics' | 'constraints', index: number, value: string) => {
    setPRD(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (field: 'objectives' | 'targetUsers' | 'successMetrics' | 'constraints', index: number) => {
    setPRD(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'COMPLETED':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
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
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showWizard) {
    return (
      <PRDCreationWizard
        project={project}
        onPRDComplete={handlePRDComplete}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Product Requirements Document</h2>
          <p className="text-gray-600">Define your product objectives, target users, and success metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prd.status)}`}>
            {getStatusIcon(prd.status)}
            <span>{prd.status.replace('_', ' ').toLowerCase()}</span>
          </div>
          <PMOnly>
            <div className="flex space-x-2">
              {!prd || prd.status === 'DRAFT' ? (
                <Button
                  onClick={() => setShowWizard(true)}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create PRD
                </Button>
              ) : !isEditing ? (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowWizard(true)}
                    leftIcon={<Edit className="w-4 h-4" />}
                  >
                    Edit PRD
                  </Button>
                  <Button
                    onClick={handleSave}
                    leftIcon={<Save className="w-4 h-4" />}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Complete & Move to Research
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save
                  </Button>
                </>
              )}
            </div>
          </PMOnly>
        </div>
      </div>

      {/* Feedback */}
      {prd.feedback && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Feedback from PM Manager</h4>
              <p className="text-yellow-700 mt-1">{prd.feedback}</p>
            </div>
          </div>
        </div>
      )}

      {/* PRD Content */}
      {!prd || prd.status === 'DRAFT' ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to create your PRD?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our guided wizard will help you create a comprehensive Product Requirements Document 
            that covers all essential aspects of your product vision.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Product Objectives</h4>
              <p className="text-sm text-gray-600">Define clear goals and success criteria</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Target Users</h4>
              <p className="text-sm text-gray-600">Identify and understand your audience</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Success Metrics</h4>
              <p className="text-sm text-gray-600">Measure what matters for your product</p>
            </div>
          </div>
          <PMOnly>
            <Button
              onClick={() => setShowWizard(true)}
              leftIcon={<Sparkles className="w-5 h-5" />}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
            >
              Start PRD Creation Wizard
            </Button>
          </PMOnly>
        </div>
      ) : (
        <div className="space-y-6">
        {/* Business Context */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Context
          </label>
          {isEditing ? (
            <textarea
              value={prd.businessContext}
              onChange={(e) => setPRD(prev => ({ ...prev, businessContext: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              placeholder="Describe the business context and market opportunity..."
            />
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">
                {prd.businessContext || 'No business context provided'}
              </p>
            </div>
          )}
        </div>

        {/* Objectives */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objectives
          </label>
          {isEditing ? (
            <div className="space-y-2">
              {prd.objectives.map((objective, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => updateArrayItem('objectives', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter objective"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('objectives', index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('objectives')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add objective
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {prd.objectives.length > 0 ? (
                prd.objectives.map((objective, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{objective}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No objectives defined</p>
              )}
            </div>
          )}
        </div>

        {/* Target Users */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Users
          </label>
          {isEditing ? (
            <div className="space-y-2">
              {prd.targetUsers.map((user, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={user}
                    onChange={(e) => updateArrayItem('targetUsers', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter target user type"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('targetUsers', index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('targetUsers')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add target user
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {prd.targetUsers.length > 0 ? (
                prd.targetUsers.map((user, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{user}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No target users defined</p>
              )}
            </div>
          )}
        </div>

        {/* Success Metrics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Success Metrics
          </label>
          {isEditing ? (
            <div className="space-y-2">
              {prd.successMetrics.map((metric, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={metric}
                    onChange={(e) => updateArrayItem('successMetrics', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter success metric"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('successMetrics', index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('successMetrics')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add success metric
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {prd.successMetrics.length > 0 ? (
                prd.successMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{metric}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No success metrics defined</p>
              )}
            </div>
          )}
        </div>

        {/* Constraints */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Constraints
          </label>
          {isEditing ? (
            <div className="space-y-2">
              {prd.constraints.map((constraint, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={constraint}
                    onChange={(e) => updateArrayItem('constraints', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter constraint"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('constraints', index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('constraints')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                + Add constraint
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {prd.constraints.length > 0 ? (
                prd.constraints.map((constraint, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{constraint}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No constraints defined</p>
              )}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
