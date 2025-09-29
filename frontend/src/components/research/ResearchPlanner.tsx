import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Users, Target, BarChart3, Sparkles, Brain, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { Project, Cohort, Persona, Demographics } from '../../types';
import Button from '../shared/Button';

interface ResearchPlannerProps {
  project: Project;
  onPlanCreated: (data: {
    product: string;
    cohorts: Cohort[];
    personas: Persona[];
    demographics: Demographics;
  }) => void;
}

export default function ResearchPlanner({ project, onPlanCreated }: ResearchPlannerProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [researchConfig, setResearchConfig] = useState({
    methodology: 'mixed',
    duration: '2-3 weeks',
    sampleSize: 'medium',
    aiAssistance: true,
    customPrompts: ''
  });
  const [formData, setFormData] = useState({
    product: project.prd?.objectives.join(', ') || '',
    cohorts: [
      {
        id: '1',
        name: 'Primary Users',
        description: 'Main target audience',
        demographics: {
          ageRange: [25, 35] as [number, number],
          gender: ['All'],
          location: ['Global'],
          income: ['$50K-$100K'],
          education: ['Bachelor\'s Degree']
        },
        size: 1000
      }
    ] as Cohort[],
    personas: [
      {
        id: '1',
        name: 'Tech-Savvy Professional',
        description: 'Young professional who values efficiency and modern design',
        goals: ['Quick transactions', 'Real-time updates', 'Mobile-first experience'],
        painPoints: ['Complex interfaces', 'Slow loading times', 'Poor mobile experience'],
        behaviors: ['Uses mobile apps daily', 'Prefers minimal design', 'Values security'],
        designPreferences: {
          complexity: 'MODERATE' as const,
          interactionStyle: 'DASHBOARD' as const,
          colorScheme: 'LIGHT' as const,
          accessibility: 'STANDARD' as const
        }
      }
    ] as Persona[],
    demographics: {
      ageRange: [25, 35] as [number, number],
      gender: ['All'],
      location: ['Global'],
      income: ['$50K-$100K'],
      education: ['Bachelor\'s Degree']
    } as Demographics
  });

  const addCohort = useCallback(() => {
    const newCohort: Cohort = {
      id: Date.now().toString(),
      name: '',
      description: '',
      demographics: {
        ageRange: [25, 35],
        gender: ['All'],
        location: ['Global'],
        income: ['$50K-$100K'],
        education: ['Bachelor\'s Degree']
      },
      size: 500
    };
    setFormData(prev => ({
      ...prev,
      cohorts: [...prev.cohorts, newCohort]
    }));
  }, []);

  const updateCohort = (index: number, field: keyof Cohort, value: any) => {
    setFormData(prev => ({
      ...prev,
      cohorts: prev.cohorts.map((cohort, i) => 
        i === index ? { ...cohort, [field]: value } : cohort
      )
    }));
  };

  const removeCohort = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cohorts: prev.cohorts.filter((_, i) => i !== index)
    }));
  };

  const addPersona = () => {
    const newPersona: Persona = {
      id: Date.now().toString(),
      name: '',
      description: '',
      goals: [''],
      painPoints: [''],
      behaviors: [''],
      designPreferences: {
        complexity: 'MODERATE',
        interactionStyle: 'DASHBOARD',
        colorScheme: 'LIGHT',
        accessibility: 'STANDARD'
      }
    };
    setFormData(prev => ({
      ...prev,
      personas: [...prev.personas, newPersona]
    }));
  };

  const updatePersona = (index: number, field: keyof Persona, value: any) => {
    setFormData(prev => ({
      ...prev,
      personas: prev.personas.map((persona, i) => 
        i === index ? { ...persona, [field]: value } : persona
      )
    }));
  };

  const removePersona = (index: number) => {
    setFormData(prev => ({
      ...prev,
      personas: prev.personas.filter((_, i) => i !== index)
    }));
  };

  const updatePersonaArray = (personaIndex: number, field: 'goals' | 'painPoints' | 'behaviors', itemIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      personas: prev.personas.map((persona, i) => 
        i === personaIndex 
          ? { 
              ...persona, 
              [field]: persona[field].map((item, j) => j === itemIndex ? value : item)
            }
          : persona
      )
    }));
  };

  const addPersonaArrayItem = (personaIndex: number, field: 'goals' | 'painPoints' | 'behaviors') => {
    setFormData(prev => ({
      ...prev,
      personas: prev.personas.map((persona, i) => 
        i === personaIndex 
          ? { ...persona, [field]: [...persona[field], ''] }
          : persona
      )
    }));
  };

  const removePersonaArrayItem = (personaIndex: number, field: 'goals' | 'painPoints' | 'behaviors', itemIndex: number) => {
    setFormData(prev => ({
      ...prev,
      personas: prev.personas.map((persona, i) => 
        i === personaIndex 
          ? { 
              ...persona, 
              [field]: persona[field].filter((_, j) => j !== itemIndex)
            }
          : persona
      )
    }));
  };

  // AI Generation Functions
  const generateAICohorts = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/research/generate-cohorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: formData.product,
          demographics: formData.demographics,
          methodology: researchConfig.methodology
        })
      });
      
      if (response.ok) {
        const suggestions = await response.json();
        setAiSuggestions((prev: any) => ({ ...prev, cohorts: suggestions }));
      }
    } catch (error) {
      console.error('Error generating AI cohorts:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIPersonas = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/research/generate-personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: formData.product,
          cohorts: formData.cohorts,
          methodology: researchConfig.methodology
        })
      });
      
      if (response.ok) {
        const suggestions = await response.json();
        setAiSuggestions((prev: any) => ({ ...prev, personas: suggestions }));
      }
    } catch (error) {
      console.error('Error generating AI personas:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateResearchQuestions = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/research/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: formData.product,
          personas: formData.personas,
          methodology: researchConfig.methodology,
          customPrompts: researchConfig.customPrompts
        })
      });
      
      if (response.ok) {
        const suggestions = await response.json();
        setAiSuggestions((prev: any) => ({ ...prev, questions: suggestions }));
      }
    } catch (error) {
      console.error('Error generating research questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyAISuggestions = (type: 'cohorts' | 'personas') => {
    if (aiSuggestions && aiSuggestions[type]) {
      if (type === 'cohorts') {
        setFormData(prev => ({
          ...prev,
          cohorts: [...prev.cohorts, ...aiSuggestions[type]]
        }));
      } else if (type === 'personas') {
        setFormData(prev => ({
          ...prev,
          personas: [...prev.personas, ...aiSuggestions[type]]
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous validation errors
    setValidationErrors([]);
    
    // Validate form data
    const errors: string[] = [];
    if (!formData.product.trim()) {
      errors.push('Product description is required');
    }
    
    if (formData.cohorts.length === 0) {
      errors.push('At least one cohort is required');
    }
    
    if (formData.personas.length === 0) {
      errors.push('At least one persona is required');
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    console.log('ResearchPlanner: Creating research plan with data:', formData);
    onPlanCreated(formData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Research Planning</h3>
        <p className="text-gray-600">Set up your virtual research lab with AI-assisted cohorts, personas, and demographics</p>
      </div>

      {/* AI Configuration Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">AI Research Assistant</h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIPanel(!showAIPanel)}
            leftIcon={<Settings className="w-4 h-4" />}
          >
            {showAIPanel ? 'Hide' : 'Configure'} AI
          </Button>
        </div>

        {showAIPanel && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Methodology</label>
              <select
                value={researchConfig.methodology}
                onChange={(e) => setResearchConfig(prev => ({ ...prev, methodology: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mixed">Mixed Methods</option>
                <option value="qualitative">Qualitative</option>
                <option value="quantitative">Quantitative</option>
                <option value="ethnographic">Ethnographic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select
                value={researchConfig.duration}
                onChange={(e) => setResearchConfig(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1 week">1 Week</option>
                <option value="2-3 weeks">2-3 Weeks</option>
                <option value="1 month">1 Month</option>
                <option value="2+ months">2+ Months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sample Size</label>
              <select
                value={researchConfig.sampleSize}
                onChange={(e) => setResearchConfig(prev => ({ ...prev, sampleSize: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Small (10-50)</option>
                <option value="medium">Medium (50-200)</option>
                <option value="large">Large (200-1000)</option>
                <option value="xlarge">X-Large (1000+)</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateAICohorts}
            disabled={isGenerating}
            leftIcon={isGenerating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            Generate Cohorts
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={generateAIPersonas}
            disabled={isGenerating}
            leftIcon={isGenerating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            Generate Personas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={generateResearchQuestions}
            disabled={isGenerating}
            leftIcon={isGenerating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          >
            Generate Questions
          </Button>
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {aiSuggestions && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-3">AI Suggestions</h4>
          <div className="space-y-3">
            {aiSuggestions.cohorts && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700">Suggested Cohorts</span>
                  <Button
                    size="sm"
                    onClick={() => applyAISuggestions('cohorts')}
                    leftIcon={<Plus className="w-3 h-3" />}
                  >
                    Add All
                  </Button>
                </div>
                <div className="text-sm text-green-600">
                  {aiSuggestions.cohorts.length} cohorts generated
                </div>
              </div>
            )}
            {aiSuggestions.personas && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-700">Suggested Personas</span>
                  <Button
                    size="sm"
                    onClick={() => applyAISuggestions('personas')}
                    leftIcon={<Plus className="w-3 h-3" />}
                  >
                    Add All
                  </Button>
                </div>
                <div className="text-sm text-green-600">
                  {aiSuggestions.personas.length} personas generated
                </div>
              </div>
            )}
            {aiSuggestions.questions && (
              <div>
                <span className="text-sm font-medium text-green-700">Research Questions Generated</span>
                <div className="text-sm text-green-600 mt-1">
                  {aiSuggestions.questions.length} questions ready for review
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
          <ul className="list-disc list-inside space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Description
          </label>
          <textarea
            value={formData.product}
            onChange={(e) => setFormData(prev => ({ ...prev, product: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
            placeholder="Describe the product or feature you're researching..."
            required
          />
        </div>

        {/* Cohorts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Research Cohorts
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCohort}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Cohort
            </Button>
          </div>

          <div className="space-y-4">
            {formData.cohorts.map((cohort, index) => (
              <div key={cohort.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Cohort {index + 1}</h5>
                  {formData.cohorts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCohort(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={cohort.name}
                      onChange={(e) => updateCohort(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Primary Users"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                    <input
                      type="number"
                      value={cohort.size}
                      onChange={(e) => updateCohort(index, 'size', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={cohort.description}
                    onChange={(e) => updateCohort(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={2}
                    placeholder="Describe this cohort..."
                    required
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Demographics</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Age Range</label>
                      <div className="flex space-x-1">
                        <input
                          type="number"
                          value={cohort.demographics.ageRange[0]}
                          onChange={(e) => updateCohort(index, 'demographics', {
                            ...cohort.demographics,
                            ageRange: [parseInt(e.target.value), cohort.demographics.ageRange[1]]
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          min="18"
                          max="100"
                        />
                        <span className="flex items-center text-gray-500">-</span>
                        <input
                          type="number"
                          value={cohort.demographics.ageRange[1]}
                          onChange={(e) => updateCohort(index, 'demographics', {
                            ...cohort.demographics,
                            ageRange: [cohort.demographics.ageRange[0], parseInt(e.target.value)]
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          min="18"
                          max="100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Gender</label>
                      <select
                        value={cohort.demographics.gender[0]}
                        onChange={(e) => updateCohort(index, 'demographics', {
                          ...cohort.demographics,
                          gender: [e.target.value]
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="All">All</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Location</label>
                      <select
                        value={cohort.demographics.location[0]}
                        onChange={(e) => updateCohort(index, 'demographics', {
                          ...cohort.demographics,
                          location: [e.target.value]
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="Global">Global</option>
                        <option value="North America">North America</option>
                        <option value="Europe">Europe</option>
                        <option value="Asia">Asia</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Income</label>
                      <select
                        value={cohort.demographics.income[0]}
                        onChange={(e) => updateCohort(index, 'demographics', {
                          ...cohort.demographics,
                          income: [e.target.value]
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="$0-$25K">$0-$25K</option>
                        <option value="$25K-$50K">$25K-$50K</option>
                        <option value="$50K-$100K">$50K-$100K</option>
                        <option value="$100K+">$100K+</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              User Personas
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPersona}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Persona
            </Button>
          </div>

          <div className="space-y-6">
            {formData.personas.map((persona, index) => (
              <div key={persona.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium text-gray-900">Persona {index + 1}</h5>
                  {formData.personas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePersona(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={persona.name}
                      onChange={(e) => updatePersona(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Tech-Savvy Professional"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interaction Style</label>
                    <select
                      value={persona.designPreferences.interactionStyle}
                      onChange={(e) => updatePersona(index, 'designPreferences', {
                        ...persona.designPreferences,
                        interactionStyle: e.target.value as any
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="CHAT">Chat Interface</option>
                      <option value="FORM">Form Interface</option>
                      <option value="DASHBOARD">Dashboard Interface</option>
                      <option value="MOBILE">Mobile Interface</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={persona.description}
                    onChange={(e) => updatePersona(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={2}
                    placeholder="Describe this persona..."
                    required
                  />
                </div>

                {/* Goals */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                  {persona.goals.map((goal, goalIndex) => (
                    <div key={goalIndex} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => updatePersonaArray(index, 'goals', goalIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter a goal..."
                        required
                      />
                      {persona.goals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePersonaArrayItem(index, 'goals', goalIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addPersonaArrayItem(index, 'goals')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add goal
                  </button>
                </div>

                {/* Pain Points */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pain Points</label>
                  {persona.painPoints.map((painPoint, painIndex) => (
                    <div key={painIndex} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={painPoint}
                        onChange={(e) => updatePersonaArray(index, 'painPoints', painIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter a pain point..."
                        required
                      />
                      {persona.painPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePersonaArrayItem(index, 'painPoints', painIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addPersonaArrayItem(index, 'painPoints')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add pain point
                  </button>
                </div>

                {/* Behaviors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Behaviors</label>
                  {persona.behaviors.map((behavior, behaviorIndex) => (
                    <div key={behaviorIndex} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={behavior}
                        onChange={(e) => updatePersonaArray(index, 'behaviors', behaviorIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Enter a behavior..."
                        required
                      />
                      {persona.behaviors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePersonaArrayItem(index, 'behaviors', behaviorIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addPersonaArrayItem(index, 'behaviors')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add behavior
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button
            type="submit"
            leftIcon={<BarChart3 className="w-4 h-4" />}
          >
            Create Research Plan
          </Button>
        </div>
      </form>
    </div>
  );
}
