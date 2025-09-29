import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Target, 
  Users, 
  BarChart3, 
  Building, 
  AlertTriangle,
  Lightbulb,
  FileText,
  Save,
  Eye,
  Edit3,
  Plus,
  X,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  DollarSign,
  Zap
} from 'lucide-react';
import { Project, PRD } from '../../types';
import Button from '../shared/Button';

interface PRDCreationWizardProps {
  project: Project;
  onPRDComplete: (prd: PRD) => void;
  onCancel: () => void;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const PRDCreationWizard: React.FC<PRDCreationWizardProps> = ({ 
  project, 
  onPRDComplete, 
  onCancel 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [prd, setPRD] = useState<PRD>(() => {
    if (project.prd) {
      return project.prd;
    }
    return {
      id: `prd-${Date.now()}`,
      objectives: [''],
      targetUsers: [''],
      successMetrics: [''],
      businessContext: '',
      constraints: [''],
      status: 'DRAFT' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [userDemographics, setUserDemographics] = useState<{[key: string]: any}>({});
  const [ageRanges, setAgeRanges] = useState<{[key: string]: {min: number, max: number}}>({});
  const [incomeRanges, setIncomeRanges] = useState<{[key: string]: {min: number, max: number}}>({});

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const steps: WizardStep[] = [
    {
      id: 'overview',
      title: 'Product Overview',
      description: 'Define your product vision and core objectives',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      id: 'users',
      title: 'Target Users',
      description: 'Identify and define your target audience',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      id: 'metrics',
      title: 'Success Metrics',
      description: 'Define how you\'ll measure success',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      id: 'context',
      title: 'Business Context',
      description: 'Understand market and business environment',
      icon: <Building className="w-6 h-6" />,
      color: 'bg-orange-500'
    },
    {
      id: 'constraints',
      title: 'Constraints & Risks',
      description: 'Identify limitations and potential challenges',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-red-500'
    },
    {
      id: 'review',
      title: 'Review & Finalize',
      description: 'Review your PRD and make final adjustments',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-indigo-500'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    const completedPRD = {
      ...prd,
      status: 'COMPLETED' as const,
      updatedAt: new Date().toISOString()
    };
    onPRDComplete(completedPRD);
  };

  const addArrayItem = (field: 'objectives' | 'targetUsers' | 'successMetrics' | 'constraints') => {
    setPRD(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  // Ensure at least one item exists in arrays
  const ensureMinItems = (field: 'objectives' | 'targetUsers' | 'successMetrics' | 'constraints') => {
    if (prd[field].length === 0) {
      addArrayItem(field);
    }
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

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Overview
        return prd.objectives.length > 0 && prd.objectives.some(obj => obj.trim() !== '');
      case 1: // Users
        return prd.targetUsers.length > 0 && prd.targetUsers.some(user => user.trim() !== '');
      case 2: // Metrics
        return prd.successMetrics.length > 0 && prd.successMetrics.some(metric => metric.trim() !== '');
      case 3: // Context
        return prd.businessContext.trim() !== '';
      case 4: // Constraints
        return true; // Optional step
      case 5: // Review
        return true;
      default:
        return false;
    }
  };

  const getStepProgress = () => {
    const completedSteps = steps.slice(0, currentStep + 1).filter((_, index) => isStepValid(index));
    return (completedSteps.length / steps.length) * 100;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Product Overview
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">What are you building?</h3>
              <p className="text-gray-600">Define your product objectives and what success looks like</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Objectives <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-3">What are the main goals this product should achieve?</p>
                {prd.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={objective}
                        onChange={(e) => updateArrayItem('objectives', index, e.target.value)}
                        placeholder="e.g., Increase user engagement by 40%"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {prd.objectives.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('objectives', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('objectives')}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Objective</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 1: // Target Users
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Who are your users?</h3>
              <p className="text-gray-600">Define your target audience and their characteristics</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target User Groups <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-3">Who will use this product? Be specific about demographics, roles, and needs.</p>
                {prd.targetUsers.map((user, index) => (
                  <div key={index} className="space-y-3 mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={user}
                          onChange={(e) => updateArrayItem('targetUsers', index, e.target.value)}
                          placeholder="e.g., Small business owners aged 25-45 who need financial management tools"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      {prd.targetUsers.length > 1 && (
                        <button
                          onClick={() => removeArrayItem('targetUsers', index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Demographics Section for each user group */}
                    <div className="ml-4 space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Demographics & Characteristics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Age Range</label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="18"
                                max="80"
                                value={ageRanges[`age_${index}`]?.min || 25}
                                onChange={(e) => {
                                  const min = parseInt(e.target.value);
                                  setAgeRanges(prev => ({ ...prev, [`age_${index}`]: { ...prev[`age_${index}`], min } }));
                                  setUserDemographics(prev => ({ ...prev, [`age_${index}`]: `${min}-${ageRanges[`age_${index}`]?.max || 45} years` }));
                                }}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
                              />
                              <span className="text-xs text-gray-500">to</span>
                              <input
                                type="number"
                                min="18"
                                max="80"
                                value={ageRanges[`age_${index}`]?.max || 45}
                                onChange={(e) => {
                                  const max = parseInt(e.target.value);
                                  setAgeRanges(prev => ({ ...prev, [`age_${index}`]: { ...prev[`age_${index}`], max } }));
                                  setUserDemographics(prev => ({ ...prev, [`age_${index}`]: `${ageRanges[`age_${index}`]?.min || 25}-${max} years` }));
                                }}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
                              />
                              <span className="text-xs text-gray-500">years</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-lg h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-lg relative"
                                style={{ 
                                  width: `${((ageRanges[`age_${index}`]?.max || 45) - (ageRanges[`age_${index}`]?.min || 25)) / 62 * 100}%`,
                                  marginLeft: `${((ageRanges[`age_${index}`]?.min || 25) - 18) / 62 * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-2">Income Level (Annual)</label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">$</span>
                              <input
                                type="number"
                                min="0"
                                max="1000000"
                                step="1000"
                                value={incomeRanges[`income_${index}`]?.min || 50000}
                                onChange={(e) => {
                                  const min = parseInt(e.target.value);
                                  setIncomeRanges(prev => ({ ...prev, [`income_${index}`]: { ...prev[`income_${index}`], min } }));
                                  setUserDemographics(prev => ({ ...prev, [`income_${index}`]: `$${(min/1000).toFixed(0)}k-$${(incomeRanges[`income_${index}`]?.max || 100000)/1000}k annually` }));
                                }}
                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
                              />
                              <span className="text-xs text-gray-500">to</span>
                              <span className="text-xs text-gray-500">$</span>
                              <input
                                type="number"
                                min="0"
                                max="1000000"
                                step="1000"
                                value={incomeRanges[`income_${index}`]?.max || 100000}
                                onChange={(e) => {
                                  const max = parseInt(e.target.value);
                                  setIncomeRanges(prev => ({ ...prev, [`income_${index}`]: { ...prev[`income_${index}`], max } }));
                                  setUserDemographics(prev => ({ ...prev, [`income_${index}`]: `$${(incomeRanges[`income_${index}`]?.min || 50000)/1000}k-$${(max/1000).toFixed(0)}k annually` }));
                                }}
                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
                              />
                            </div>
                            <div className="w-full bg-gray-200 rounded-lg h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-lg relative"
                                style={{ 
                                  width: `${((incomeRanges[`income_${index}`]?.max || 100000) - (incomeRanges[`income_${index}`]?.min || 50000)) / 1000000 * 100}%`,
                                  marginLeft: `${(incomeRanges[`income_${index}`]?.min || 50000) / 1000000 * 100}%`
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>$0</span>
                              <span>$1M+</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                          <input
                            type="text"
                            value={userDemographics[`location_${index}`] || ''}
                            onChange={(e) => setUserDemographics(prev => ({ ...prev, [`location_${index}`]: e.target.value }))}
                            placeholder="e.g., Urban areas, US/EU"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Tech Savviness</label>
                          <select
                            value={userDemographics[`tech_${index}`] || ''}
                            onChange={(e) => setUserDemographics(prev => ({ ...prev, [`tech_${index}`]: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="">Select level</option>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">Pain Points & Needs</label>
                          <textarea
                            value={userDemographics[`painPoints_${index}`] || ''}
                            onChange={(e) => setUserDemographics(prev => ({ ...prev, [`painPoints_${index}`]: e.target.value }))}
                            placeholder="e.g., Struggles with manual financial tracking, needs real-time insights, wants mobile access"
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('targetUsers')}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User Group</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 2: // Success Metrics
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">How will you measure success?</h3>
              <p className="text-gray-600">Define key metrics that will indicate if your product is working</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Success Metrics <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-3">What measurable outcomes will show your product is successful?</p>
                {prd.successMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={metric}
                        onChange={(e) => updateArrayItem('successMetrics', index, e.target.value)}
                        placeholder="e.g., 50% increase in daily active users within 6 months"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    {prd.successMetrics.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('successMetrics', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('successMetrics')}
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Metric</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 3: // Business Context
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Building className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">What's the business context?</h3>
              <p className="text-gray-600">Understand the market, competition, and business environment</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Context <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-3">Describe the market situation, competitive landscape, and business drivers.</p>
                <textarea
                  value={prd.businessContext}
                  onChange={(e) => setPRD(prev => ({ ...prev, businessContext: e.target.value }))}
                  placeholder="e.g., The fintech market is growing rapidly with increasing demand for mobile-first solutions. Our main competitors are X and Y, but we differentiate through our focus on small businesses and simplified user experience. The business needs to capture 5% market share within 2 years to meet revenue targets."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 4: // Constraints & Risks
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">What are the constraints?</h3>
              <p className="text-gray-600">Identify limitations, risks, and challenges that might impact your product</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constraints & Risks
                </label>
                <p className="text-sm text-gray-500 mb-3">What limitations or challenges should the team be aware of?</p>
                {prd.constraints.map((constraint, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={constraint}
                        onChange={(e) => updateArrayItem('constraints', index, e.target.value)}
                        placeholder="e.g., Must comply with GDPR regulations, Budget limited to $100k, Must launch by Q2 2024"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    {prd.constraints.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('constraints', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('constraints')}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Constraint</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 5: // Review & Finalize
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Review your PRD</h3>
              <p className="text-gray-600">Review all sections and make final adjustments before completing</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  Product Objectives
                </h4>
                <ul className="space-y-2">
                  {prd.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-green-600" />
                  Target Users
                </h4>
                <div className="space-y-4">
                  {prd.targetUsers.map((user, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{user}</span>
                      </div>
                      {(userDemographics[`age_${index}`] || userDemographics[`income_${index}`] || userDemographics[`location_${index}`] || userDemographics[`tech_${index}`] || userDemographics[`painPoints_${index}`]) && (
                        <div className="ml-6 space-y-1">
                          <h5 className="text-sm font-medium text-gray-600 mb-2">Demographics:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {userDemographics[`age_${index}`] && (
                              <div><span className="font-medium">Age:</span> {userDemographics[`age_${index}`]}</div>
                            )}
                            {userDemographics[`income_${index}`] && (
                              <div><span className="font-medium">Income:</span> {userDemographics[`income_${index}`]}</div>
                            )}
                            {userDemographics[`location_${index}`] && (
                              <div><span className="font-medium">Location:</span> {userDemographics[`location_${index}`]}</div>
                            )}
                            {userDemographics[`tech_${index}`] && (
                              <div><span className="font-medium">Tech Level:</span> {userDemographics[`tech_${index}`]}</div>
                            )}
                          </div>
                          {userDemographics[`painPoints_${index}`] && (
                            <div className="mt-2">
                              <span className="font-medium text-sm">Pain Points:</span>
                              <p className="text-sm text-gray-600 mt-1">{userDemographics[`painPoints_${index}`]}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Success Metrics
                </h4>
                <ul className="space-y-2">
                  {prd.successMetrics.map((metric, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-orange-600" />
                  Business Context
                </h4>
                <p className="text-gray-700 bg-white p-3 rounded border">{prd.businessContext}</p>
              </div>

              {prd.constraints.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Constraints & Risks
                  </h4>
                  <ul className="space-y-2">
                    {prd.constraints.map((constraint, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">PRD Creation Wizard</h1>
          </div>
          <p className="text-gray-600">Create a comprehensive Product Requirements Document for {project.name}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{Math.round(getStepProgress())}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  index === currentStep
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : index < currentStep
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  index === currentStep
                    ? 'bg-blue-500 text-white'
                    : index < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  {index < currentStep ? <CheckCircle className="w-4 h-4" /> : step.icon}
                </div>
                <span className="font-medium text-sm">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-6 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="px-6 py-2"
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
          </div>

          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="px-6 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid(currentStep)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Complete PRD
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRDCreationWizard;
