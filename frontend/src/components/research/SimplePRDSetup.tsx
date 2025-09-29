import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  Users, 
  ArrowRight,
  Brain,
  CheckCircle
} from 'lucide-react';
import { Project, PRD } from '../../types';
import Button from '../shared/Button';

interface SimplePRDSetupProps {
  project: Project;
  prd: PRD;
  onPRDUpdate: (prd: PRD) => void;
  onGeneratePRD: () => void;
}

interface PRDData {
  // 1. Problem Statement
  problemStatement: string;
  currentPainPoints: string[];
  businessImpact: string;
  
  // 2. Hypothesis
  hypothesis: string;
  assumptions: string[];
  expectedOutcomes: string[];
  
  // 3. Vision & What to Build
  productVision: string;
  keyFeatures: string[];
  successCriteria: string[];
  
  // 4. Users & Personas
  targetUsers: string[];
  userPersonas: Array<{
    name: string;
    demographics: string;
    painPoints: string[];
    goals: string[];
  }>;
  userStories: string[];
}

export default function SimplePRDSetup({ project, prd, onPRDUpdate, onGeneratePRD }: SimplePRDSetupProps) {
  const [prdData, setPRDData] = useState<PRDData>({
    problemStatement: '',
    currentPainPoints: [''],
    businessImpact: '',
    hypothesis: '',
    assumptions: [''],
    expectedOutcomes: [''],
    productVision: '',
    keyFeatures: [''],
    successCriteria: [''],
    targetUsers: [''],
    userPersonas: [{
      name: '',
      demographics: '',
      painPoints: [''],
      goals: ['']
    }],
    userStories: ['']
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 'problem', title: 'Problem Statement', icon: <AlertTriangle className="w-5 h-5" /> },
    { id: 'hypothesis', title: 'Hypothesis', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'vision', title: 'Vision & What to Build', icon: <Target className="w-5 h-5" /> },
    { id: 'users', title: 'Users & Personas', icon: <Users className="w-5 h-5" /> }
  ];

  const updatePRDData = (field: keyof PRDData, value: any) => {
    setPRDData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: keyof PRDData, value: string = '') => {
    const currentArray = prdData[field] as string[];
    updatePRDData(field, [...currentArray, value]);
  };

  const updateArrayItem = (field: keyof PRDData, index: number, value: string) => {
    const currentArray = prdData[field] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    updatePRDData(field, newArray);
  };

  const removeArrayItem = (field: keyof PRDData, index: number) => {
    const currentArray = prdData[field] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    updatePRDData(field, newArray);
  };

  const addUserPersona = () => {
    updatePRDData('userPersonas', [
      ...prdData.userPersonas,
      { name: '', demographics: '', painPoints: [''], goals: [''] }
    ]);
  };

  const updateUserPersona = (index: number, field: keyof PRDData['userPersonas'][0], value: any) => {
    const newPersonas = [...prdData.userPersonas];
    newPersonas[index] = { ...newPersonas[index], [field]: value };
    updatePRDData('userPersonas', newPersonas);
  };

  const addPersonaArrayItem = (personaIndex: number, field: 'painPoints' | 'goals', value: string = '') => {
    const newPersonas = [...prdData.userPersonas];
    newPersonas[personaIndex][field] = [...newPersonas[personaIndex][field], value];
    updatePRDData('userPersonas', newPersonas);
  };

  const updatePersonaArrayItem = (personaIndex: number, field: 'painPoints' | 'goals', itemIndex: number, value: string) => {
    const newPersonas = [...prdData.userPersonas];
    newPersonas[personaIndex][field][itemIndex] = value;
    updatePRDData('userPersonas', newPersonas);
  };

  const removePersonaArrayItem = (personaIndex: number, field: 'painPoints' | 'goals', itemIndex: number) => {
    const newPersonas = [...prdData.userPersonas];
    newPersonas[personaIndex][field] = newPersonas[personaIndex][field].filter((_, i) => i !== itemIndex);
    updatePRDData('userPersonas', newPersonas);
  };

  const isFormComplete = () => {
    return prdData.problemStatement && 
           prdData.hypothesis && 
           prdData.productVision &&
           prdData.userPersonas.some(p => p.name && p.demographics);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Problem Statement
        return (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Problem Statement</h3>
              <p className="text-red-700 text-sm">
                Clearly define the problem you're solving. What pain points exist in the current state?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  What problem are we solving?
                </label>
                <textarea
                  value={prdData.problemStatement}
                  onChange={(e) => updatePRDData('problemStatement', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={4}
                  placeholder="Describe the core problem your product will solve. Be specific about the pain points and challenges users face."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Pain Points
                </label>
                <div className="space-y-2">
                  {prdData.currentPainPoints.map((pain, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={pain}
                        onChange={(e) => updateArrayItem('currentPainPoints', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="What specific pain points do users experience?"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('currentPainPoints', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('currentPainPoints')}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    + Add pain point
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Impact
                </label>
                <textarea
                  value={prdData.businessImpact}
                  onChange={(e) => updatePRDData('businessImpact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="How does this problem impact the business? What are the costs of not solving it?"
                />
              </div>
            </div>
          </div>
        );

      case 1: // Hypothesis
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Hypothesis</h3>
              <p className="text-yellow-700 text-sm">
                What do you believe will solve this problem? What are your assumptions and expected outcomes?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lightbulb className="w-4 h-4 inline mr-2" />
                  Our Hypothesis
                </label>
                <textarea
                  value={prdData.hypothesis}
                  onChange={(e) => updatePRDData('hypothesis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={4}
                  placeholder="We believe that by [solution approach], we will [expected outcome] for [target users] because [reasoning]."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Assumptions
                </label>
                <div className="space-y-2">
                  {prdData.assumptions.map((assumption, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={assumption}
                        onChange={(e) => updateArrayItem('assumptions', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="What assumptions are we making?"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('assumptions', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('assumptions')}
                    className="text-sm text-yellow-600 hover:text-yellow-700"
                  >
                    + Add assumption
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Outcomes
                </label>
                <div className="space-y-2">
                  {prdData.expectedOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={outcome}
                        onChange={(e) => updateArrayItem('expectedOutcomes', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="What outcomes do we expect to achieve?"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('expectedOutcomes', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('expectedOutcomes')}
                    className="text-sm text-yellow-600 hover:text-yellow-700"
                  >
                    + Add expected outcome
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Vision & What to Build
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Vision & What to Build</h3>
              <p className="text-blue-700 text-sm">
                Define your product vision and what you plan to build to solve the problem.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  Product Vision
                </label>
                <textarea
                  value={prdData.productVision}
                  onChange={(e) => updatePRDData('productVision', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="What is your vision for this product? How will it transform the user experience?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Features
                </label>
                <div className="space-y-2">
                  {prdData.keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateArrayItem('keyFeatures', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What key features will the product have?"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('keyFeatures', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('keyFeatures')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add feature
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Criteria
                </label>
                <div className="space-y-2">
                  {prdData.successCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={criteria}
                        onChange={(e) => updateArrayItem('successCriteria', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="How will we measure success?"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('successCriteria', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('successCriteria')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add success criteria
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Users & Personas
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Users & Personas</h3>
              <p className="text-green-700 text-sm">
                Define who your users are, their demographics, pain points, and goals.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Users
                </label>
                <div className="space-y-2">
                  {prdData.targetUsers.map((user, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={user}
                        onChange={(e) => updateArrayItem('targetUsers', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Who are your target users?"
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
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    + Add target user
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900">User Personas</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addUserPersona}
                  >
                    Add Persona
                  </Button>
                </div>

                <div className="space-y-4">
                  {prdData.userPersonas.map((persona, personaIndex) => (
                    <div key={personaIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">Persona {personaIndex + 1}</h5>
                        {prdData.userPersonas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newPersonas = prdData.userPersonas.filter((_, i) => i !== personaIndex);
                              updatePRDData('userPersonas', newPersonas);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={persona.name}
                            onChange={(e) => updateUserPersona(personaIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., Sarah the Small Business Owner"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Demographics</label>
                          <input
                            type="text"
                            value={persona.demographics}
                            onChange={(e) => updateUserPersona(personaIndex, 'demographics', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g., 35-year-old restaurant owner, tech-savvy"
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Pain Points</label>
                          <div className="space-y-2">
                            {persona.painPoints.map((pain, painIndex) => (
                              <div key={painIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={pain}
                                  onChange={(e) => updatePersonaArrayItem(personaIndex, 'painPoints', painIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="What problems do they face?"
                                />
                                <button
                                  type="button"
                                  onClick={() => removePersonaArrayItem(personaIndex, 'painPoints', painIndex)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addPersonaArrayItem(personaIndex, 'painPoints')}
                              className="text-sm text-green-600 hover:text-green-700"
                            >
                              + Add pain point
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                          <div className="space-y-2">
                            {persona.goals.map((goal, goalIndex) => (
                              <div key={goalIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={goal}
                                  onChange={(e) => updatePersonaArrayItem(personaIndex, 'goals', goalIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="What do they want to achieve?"
                                />
                                <button
                                  type="button"
                                  onClick={() => removePersonaArrayItem(personaIndex, 'goals', goalIndex)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addPersonaArrayItem(personaIndex, 'goals')}
                              className="text-sm text-green-600 hover:text-green-700"
                            >
                              + Add goal
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Stories
                </label>
                <div className="space-y-2">
                  {prdData.userStories.map((story, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={story}
                        onChange={(e) => updateArrayItem('userStories', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="As a [user type], I want [goal] so that [benefit]"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('userStories', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('userStories')}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    + Add user story
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">PRD Setup</h2>
            <p className="text-gray-600 mt-1">
              Define the key aspects of your product to generate a comprehensive PRD
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-lg font-semibold text-blue-600">
              {currentStep + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(index)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentStep === index
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {step.icon}
            <span className="font-medium">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        <div className="flex space-x-3">
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={onGeneratePRD}
              disabled={!isFormComplete()}
              leftIcon={<Brain className="w-4 h-4" />}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Generate PRD
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Form Completion Status */}
      {!isFormComplete() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800 text-sm">
              Please complete the required fields (Problem Statement, Hypothesis, Product Vision, and at least one User Persona) to generate the PRD.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

