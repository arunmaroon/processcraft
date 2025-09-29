import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Target, 
  Users, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  Brain,
  BarChart3,
  Clock,
  Save,
  Download,
  Eye
} from 'lucide-react';
import { Project, PRD } from '../../types';

interface PRDFormData {
  // Problem/Opportunity
  problemStatement: string;
  opportunityDescription: string;
  
  // Target users & use cases
  targetUsers: string;
  primaryUseCases: string;
  
  // Current journeys/Landscape
  currentJourney: string;
  competitiveLandscape: string;
  
  // Proposed solution/Elevator pitch
  elevatorPitch: string;
  mvpValueProps: string[];
  conceptualModel: string;
  
  // Goals/Measurable outcomes
  goals: string[];
  
  // MVP/Functional requirements
  requirements: {
    id: string;
    description: string;
    priority: 'P0' | 'P1' | 'P2';
    useCase: string;
    category: 'functionality' | 'telemetry' | 'user-journey';
  }[];
  
  // Additional info
  projectName: string;
  projectDescription: string;
  successMetrics: string[];
}

interface PRDGeneratorFormProps {
  project: Project;
  onFormSubmit: (formData: PRDFormData) => void;
  onPRDGenerated: (generatedPRD: any) => void;
  initialData?: Partial<PRDFormData>;
}

const PRDGeneratorForm: React.FC<PRDGeneratorFormProps> = ({ 
  project, 
  onFormSubmit, 
  onPRDGenerated, 
  initialData 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PRDFormData>({
    problemStatement: initialData?.problemStatement || '',
    opportunityDescription: initialData?.opportunityDescription || '',
    targetUsers: initialData?.targetUsers || '',
    primaryUseCases: initialData?.primaryUseCases || '',
    currentJourney: initialData?.currentJourney || '',
    competitiveLandscape: initialData?.competitiveLandscape || '',
    elevatorPitch: initialData?.elevatorPitch || '',
    mvpValueProps: initialData?.mvpValueProps || ['', '', ''],
    conceptualModel: initialData?.conceptualModel || '',
    goals: initialData?.goals || ['', '', ''],
    requirements: initialData?.requirements || [],
    projectName: initialData?.projectName || project.name,
    projectDescription: initialData?.projectDescription || project.description,
    successMetrics: initialData?.successMetrics || ['', '', '']
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPRD, setGeneratedPRD] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Auto-save form data to localStorage
  useEffect(() => {
    const saveData = () => {
      localStorage.setItem(`prd-form-${project.id}`, JSON.stringify(formData));
    };
    
    const timeoutId = setTimeout(saveData, 500); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [formData, project.id]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`prd-form-${project.id}`);
    if (savedData && !initialData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
      } catch (err) {
        console.error('Failed to load saved form data:', err);
      }
    }
  }, [project.id, initialData]);

  // If initialData is provided, use it to populate the form
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const steps = [
    { id: 1, title: 'Problem & Users', icon: <Target className="w-5 h-5" /> },
    { id: 2, title: 'Solution & Goals', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 3, title: 'Generate PRD', icon: <Brain className="w-5 h-5" /> }
  ];

  const handleInputChange = (field: keyof PRDFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof PRDFormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, {
        id: Date.now().toString(),
        description: '',
        priority: 'P1',
        useCase: '',
        category: 'functionality'
      }]
    }));
  };

  const updateRequirement = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map(req => 
        req.id === id ? { ...req, [field]: value } : req
      )
    }));
  };

  const removeRequirement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req.id !== id)
    }));
  };

  const generatePRD = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      // Call onFormSubmit to store the form data
      onFormSubmit(formData);
      
      // Prepare the prompt for LLM
      const prompt = `Generate a comprehensive Product Requirements Document (PRD) based on the following information:

PROJECT DETAILS:
- Project Name: ${formData.projectName}
- Project Description: ${formData.projectDescription}

PROBLEM & OPPORTUNITY:
- Problem Statement: ${formData.problemStatement}
- Opportunity Description: ${formData.opportunityDescription}

TARGET USERS & USE CASES:
- Target Users: ${formData.targetUsers}
- Primary Use Cases: ${formData.primaryUseCases}

CURRENT STATE & LANDSCAPE:
- Current User Journey: ${formData.currentJourney}
- Competitive Landscape: ${formData.competitiveLandscape}

PROPOSED SOLUTION:
- Elevator Pitch: ${formData.elevatorPitch}
- MVP Value Propositions: ${formData.mvpValueProps.filter(prop => prop.trim()).join(', ')}
- Conceptual Model: ${formData.conceptualModel}

GOALS & REQUIREMENTS:
- Goals: ${formData.goals.filter(goal => goal.trim()).join(', ')}
- Success Metrics: ${formData.successMetrics.filter(metric => metric.trim()).join(', ')}
- Functional Requirements: ${formData.requirements.map(req => `[${req.priority}] ${req.description} (Use Case: ${req.useCase}, Category: ${req.category})`).join('; ')}

Please generate a professional PRD following Carlin Yuen's framework with clear sections, detailed content, and actionable insights. Make it comprehensive and ready for stakeholder review.`;

      // Call LLM API (simulated for now - replace with actual API call)
      const response = await callLLMAPI(prompt);
      
      if (response.success) {
        setGeneratedPRD(response.content);
        onPRDGenerated({
          id: `prd-${Date.now()}`,
          title: `${formData.projectName} PRD`,
          content: response.content,
          generatedAt: new Date().toISOString(),
          sourceData: formData
        });
      } else {
        throw new Error(response.error || 'Failed to generate PRD');
      }
    } catch (err) {
      console.error('PRD Generation Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PRD. Please try again.');
      
      // Fallback to basic generation if LLM fails
      const fallbackPRD = generateFallbackPRD();
      setGeneratedPRD(fallbackPRD);
    } finally {
      setIsGenerating(false);
    }
  };

  // Real LLM API call
  const callLLMAPI = async (prompt: string) => {
    try {
      const response = await fetch('/api/prd-generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          projectData: {
            name: project.name,
            description: project.description
          },
          pmFormData: formData
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('LLM API Error:', error);
      // Return fallback response on API error
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API request failed',
        content: generateFallbackPRD(),
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: 'Fallback Generator',
          confidence: 0.6,
          source: 'fallback-api-error'
        }
      };
    }
  };

  const generateFallbackPRD = () => {
    return `# Product Requirements Document: ${formData.projectName}

## 1. Problem/Opportunity

### Problem Statement
${formData.problemStatement}

### Opportunity Description
${formData.opportunityDescription}

## 2. Target Users & Use Cases

### Target Users
${formData.targetUsers}

### Primary Use Cases
${formData.primaryUseCases}

## 3. Current State & Landscape

### Current User Journey
${formData.currentJourney}

### Competitive Landscape
${formData.competitiveLandscape}

## 4. Proposed Solution

### Elevator Pitch
${formData.elevatorPitch}

### MVP Value Propositions
${formData.mvpValueProps.filter(prop => prop.trim()).map((prop, index) => `${index + 1}. ${prop}`).join('\n')}

### Conceptual Model
${formData.conceptualModel}

## 5. Goals & Measurable Outcomes

${formData.goals.filter(goal => goal.trim()).map((goal, index) => `${index + 1}. ${goal}`).join('\n')}

## 6. MVP/Functional Requirements

### Success Metrics
${formData.successMetrics.filter(metric => metric.trim()).map((metric, index) => `${index + 1}. ${metric}`).join('\n')}

### Functional Requirements

${formData.requirements.map(req => `
**[${req.priority}]** ${req.description}
- Use Case: ${req.useCase}
- Category: ${req.category}
`).join('\n')}

## 7. Appendix

This PRD serves as the foundation for product development. Additional detailed specifications, user research findings, and technical requirements will be linked here as they become available.

---
*Generated on ${new Date().toLocaleDateString()} using ProcessCraft AI*
*Based on PM input data and Carlin Yuen's PRD framework*`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Problem & Opportunity */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Problem & Opportunity</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Problem Statement *
                  </label>
                  <textarea
                    value={formData.problemStatement}
                    onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                    placeholder="What user or business problem(s) are you solving? Be as crisp and clear as possible."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opportunity Description *
                  </label>
                  <textarea
                    value={formData.opportunityDescription}
                    onChange={(e) => handleInputChange('opportunityDescription', e.target.value)}
                    placeholder="Why is this a valuable opportunity for the team to pursue?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Target Users & Use Cases */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Users & Use Cases</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Users *
                  </label>
                  <textarea
                    value={formData.targetUsers}
                    onChange={(e) => handleInputChange('targetUsers', e.target.value)}
                    placeholder="Who are your target users? Be specific about demographics, roles, and characteristics."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Use Cases *
                  </label>
                  <textarea
                    value={formData.primaryUseCases}
                    onChange={(e) => handleInputChange('primaryUseCases', e.target.value)}
                    placeholder="What are the main use cases your target users will have? How will they interact with your product?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Current State & Landscape */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current State & Landscape</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current User Journey
                  </label>
                  <textarea
                    value={formData.currentJourney}
                    onChange={(e) => handleInputChange('currentJourney', e.target.value)}
                    placeholder="What are users doing today to solve this problem? What's painful about the current process?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Competitive Landscape
                  </label>
                  <textarea
                    value={formData.competitiveLandscape}
                    onChange={(e) => handleInputChange('competitiveLandscape', e.target.value)}
                    placeholder="How are other products in the landscape solving this problem? What solutions have been tried?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Proposed Solution */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Proposed Solution</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Elevator Pitch *
                  </label>
                  <textarea
                    value={formData.elevatorPitch}
                    onChange={(e) => handleInputChange('elevatorPitch', e.target.value)}
                    placeholder="Give a 2-3 line elevator pitch for your proposed solution in plain English."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Top 3 MVP Value Propositions *
                  </label>
                  {formData.mvpValueProps.map((prop, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        value={prop}
                        onChange={(e) => handleArrayChange('mvpValueProps', index, e.target.value)}
                        placeholder={`Value proposition ${index + 1}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conceptual Model
                  </label>
                  <textarea
                    value={formData.conceptualModel}
                    onChange={(e) => handleInputChange('conceptualModel', e.target.value)}
                    placeholder="Describe the conceptual model of your product. How do users think about and interact with it?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Goals & Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals & Requirements</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goals & Measurable Outcomes (2-3 bullets) *
                  </label>
                  {formData.goals.map((goal, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => handleArrayChange('goals', index, e.target.value)}
                        placeholder={`Goal ${index + 1}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Success Metrics (2-3 bullets) *
                  </label>
                  {formData.successMetrics.map((metric, index) => (
                    <div key={index} className="mb-2">
                      <input
                        type="text"
                        value={metric}
                        onChange={(e) => handleArrayChange('successMetrics', index, e.target.value)}
                        placeholder={`Success metric ${index + 1}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Functional Requirements */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Functional Requirements</h3>
              <div className="space-y-3">
                {formData.requirements.map((req) => (
                  <div key={req.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <input
                          type="text"
                          value={req.description}
                          onChange={(e) => updateRequirement(req.id, 'description', e.target.value)}
                          placeholder="e.g., First-time user must accept privacy policy"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                        <select
                          value={req.priority}
                          onChange={(e) => updateRequirement(req.id, 'priority', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="P0">P0 - Required for MVP</option>
                          <option value="P1">P1 - High value</option>
                          <option value="P2">P2 - Nice to have</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Use Case</label>
                        <input
                          type="text"
                          value={req.useCase}
                          onChange={(e) => updateRequirement(req.id, 'useCase', e.target.value)}
                          placeholder="e.g., User onboarding"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                        <select
                          value={req.category}
                          onChange={(e) => updateRequirement(req.id, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="functionality">Functionality</option>
                          <option value="telemetry">Telemetry</option>
                          <option value="user-journey">User Journey</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => removeRequirement(req.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove Requirement
                    </button>
                  </div>
                ))}
                <button
                  onClick={addRequirement}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  + Add Requirement
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Ready to Generate PRD</h3>
              <p className="text-blue-800 mb-4">
                Based on Carlin Yuen's PRD framework, your AI-generated PRD will include:
              </p>
              <ul className="text-blue-800 space-y-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Clear problem statement and opportunity</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Target users and use cases</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Current state and competitive landscape</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Proposed solution with elevator pitch</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Goals and measurable outcomes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Prioritized functional requirements</span>
                </li>
              </ul>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={generatePRD}
                disabled={isGenerating}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Brain className="w-5 h-5 animate-spin" />
                    <span>Generating PRD with AI...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    <span>Generate PRD</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">PRD Generator</h1>
            <p className="text-gray-500 text-sm">AI-powered PRD generation</p>
          </div>
        </div>
        
        {/* Project Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              placeholder="Enter project name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description
            </label>
            <input
              type="text"
              value={formData.projectDescription}
              onChange={(e) => handleInputChange('projectDescription', e.target.value)}
              placeholder="Brief project description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.id
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.icon
                )}
                <span className="font-medium">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`w-6 h-0.5 mx-1 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
          disabled={currentStep === 3}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-medium text-red-800">Generation Error</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError('')}
            className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Generated PRD */}
      {generatedPRD && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Generated PRD</h3>
                <p className="text-sm text-gray-500">Based on your input data and AI generation</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  // Save to localStorage
                  localStorage.setItem(`prd-generated-${project.id}`, generatedPRD);
                  alert('PRD saved successfully!');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button 
                onClick={() => {
                  // Download as markdown file
                  const blob = new Blob([generatedPRD], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${formData.projectName}-PRD.md`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800">{generatedPRD}</pre>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-blue-600 animate-spin" />
            <div>
              <h3 className="text-lg font-medium text-blue-900">Generating PRD with AI</h3>
              <p className="text-sm text-blue-700">Processing your input data and generating comprehensive PRD...</p>
            </div>
          </div>
          <div className="mt-4 bg-blue-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PRDGeneratorForm;
