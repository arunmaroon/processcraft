import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Users, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Eye, 
  Edit3, 
  Download, 
  Upload, 
  Brain, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  FileText,
  Target,
  Lightbulb,
  Shield,
  RefreshCw,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Share2,
  X
} from 'lucide-react';
import Button from '../shared/Button';
import AICoachSidebar from './AICoachSidebar';
import WireframeViewer from './WireframeViewer';

interface Persona {
  id: string;
  name: string;
  demographics: string;
  behaviors: string[];
  painPoints: string[];
  goals: string[];
  techComfort: 'low' | 'medium' | 'high';
  devicePreference: 'mobile' | 'desktop' | 'tablet' | 'any';
}

interface WireframeVariant {
  id: string;
  name: string;
  personaId: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  layout: any; // SVG/JSON wireframe data
  description: string;
  uxPatterns: string[];
  navigationFlow: any[];
  accessibilityScore: number;
  userSatisfactionScore: number;
  generatedAt: string;
  status: 'draft' | 'reviewed' | 'approved' | 'rejected';
}

interface DesignInput {
  focus: string;
  keyGoals: string[];
  targetPersonas: string[];
  deviceTypes: string[];
  constraints: string[];
  accessibilityStandards: string[];
  designSystem: string;
  brandGuidelines: string;
}

interface UXDesignerModuleProps {
  project: any;
  prdData?: any;
  researchData?: any;
  personas?: Persona[];
  onWireframesGenerated?: (wireframes: WireframeVariant[]) => void;
}

export default function UXDesignerModule({ 
  project, 
  prdData, 
  researchData, 
  personas = [], 
  onWireframesGenerated 
}: UXDesignerModuleProps) {
  const [currentStep, setCurrentStep] = useState<'input' | 'generating' | 'review' | 'edit'>('input');
  const [designInput, setDesignInput] = useState<DesignInput>({
    focus: '',
    keyGoals: [''],
    targetPersonas: [],
    deviceTypes: ['mobile'],
    constraints: [''],
    accessibilityStandards: ['WCAG 2.1 AA'],
    designSystem: 'Material Design',
    brandGuidelines: ''
  });
  const [wireframes, setWireframes] = useState<WireframeVariant[]>([]);
  const [selectedWireframe, setSelectedWireframe] = useState<WireframeVariant | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAICoach, setShowAICoach] = useState(true);
  const [showWireframeViewer, setShowWireframeViewer] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Load PRD and research data on mount
  useEffect(() => {
    if (prdData) {
      // Auto-populate design input based on PRD
      setDesignInput(prev => ({
        ...prev,
        focus: prdData.focus || '',
        keyGoals: prdData.keyGoals || [''],
        constraints: prdData.constraints || ['']
      }));
    }
  }, [prdData]);

  // Load personas from research data
  useEffect(() => {
    if (researchData?.personas) {
      setDesignInput(prev => ({
        ...prev,
        targetPersonas: researchData.personas.map((p: any) => p.id)
      }));
    }
  }, [researchData]);

  const generateWireframes = async () => {
    setIsGenerating(true);
    setError('');
    setGenerationProgress(0);
    setCurrentStep('generating');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/ux-designer/generate-wireframes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project?.id,
          designInput,
          prdData,
          researchData,
          personas
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (result.success) {
        setWireframes(result.wireframes);
        setCurrentStep('review');
        setShowSuccess(true);
        
        if (onWireframesGenerated) {
          onWireframesGenerated(result.wireframes);
        }
      } else {
        throw new Error(result.error || 'Failed to generate wireframes');
      }
    } catch (error) {
      console.error('❌ Wireframe generation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate wireframes');
      setCurrentStep('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateDesignInput = (field: keyof DesignInput, value: any) => {
    setDesignInput(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addGoal = () => {
    setDesignInput(prev => ({
      ...prev,
      keyGoals: [...prev.keyGoals, '']
    }));
  };

  const removeGoal = (index: number) => {
    setDesignInput(prev => ({
      ...prev,
      keyGoals: prev.keyGoals.filter((_, i) => i !== index)
    }));
  };

  const addConstraint = () => {
    setDesignInput(prev => ({
      ...prev,
      constraints: [...prev.constraints, '']
    }));
  };

  const removeConstraint = (index: number) => {
    setDesignInput(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index)
    }));
  };

  const isFormValid = designInput.focus.trim() && 
    designInput.keyGoals.some(goal => goal.trim()) &&
    designInput.targetPersonas.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI-Powered UX Designer</h1>
                <p className="text-gray-600 text-sm mt-1">Generate persona-aware wireframes from your PRD and research insights</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setShowAICoach(!showAICoach)}
                  variant="outline"
                  leftIcon={<Brain className="w-4 h-4" />}
                  className={showAICoach ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
                >
                  AI Coach
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-green-800">Wireframes Generated Successfully!</h3>
                <p className="text-sm text-green-700 mt-1">Your persona-aware wireframes are ready for review and editing.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">Generation Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex h-screen">
          {/* Left Panel - Input Form */}
          <div className="w-1/2 border-r border-gray-200 bg-white overflow-y-auto">
            <div className="p-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Palette className="w-6 h-6 mr-2 text-primary-600" />
                  Design Input
                </h2>

                <div className="space-y-6">
                  {/* Design Focus */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Design Focus *
                    </label>
                    <textarea
                      value={designInput.focus}
                      onChange={(e) => updateDesignInput('focus', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Describe your design focus (e.g., simplify loan onboarding for beginners)"
                    />
                  </div>

                  {/* Key Goals */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Key Goals
                    </label>
                    {designInput.keyGoals.map((goal, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={goal}
                          onChange={(e) => {
                            const newGoals = [...designInput.keyGoals];
                            newGoals[index] = e.target.value;
                            updateDesignInput('keyGoals', newGoals);
                          }}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder={`Goal ${index + 1}`}
                        />
                        {designInput.keyGoals.length > 1 && (
                          <button
                            onClick={() => removeGoal(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addGoal}
                      className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Goal
                    </button>
                  </div>

                  {/* Target Personas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Personas *
                    </label>
                    <div className="space-y-2">
                      {personas.map((persona) => (
                        <label key={persona.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={designInput.targetPersonas.includes(persona.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateDesignInput('targetPersonas', [...designInput.targetPersonas, persona.id]);
                              } else {
                                updateDesignInput('targetPersonas', designInput.targetPersonas.filter(id => id !== persona.id));
                              }
                            }}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{persona.name}</div>
                            <div className="text-sm text-gray-600">{persona.demographics}</div>
                            <div className="text-xs text-gray-500">
                              Tech: {persona.techComfort} • Device: {persona.devicePreference}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Device Types */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Device Types
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'mobile', label: 'Mobile', icon: Smartphone },
                        { id: 'tablet', label: 'Tablet', icon: Tablet },
                        { id: 'desktop', label: 'Desktop', icon: Monitor }
                      ].map(({ id, label, icon: Icon }) => (
                        <label key={id} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={designInput.deviceTypes.includes(id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateDesignInput('deviceTypes', [...designInput.deviceTypes, id]);
                              } else {
                                updateDesignInput('deviceTypes', designInput.deviceTypes.filter(type => type !== id));
                              }
                            }}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Constraints */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Constraints
                    </label>
                    {designInput.constraints.map((constraint, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={constraint}
                          onChange={(e) => {
                            const newConstraints = [...designInput.constraints];
                            newConstraints[index] = e.target.value;
                            updateDesignInput('constraints', newConstraints);
                          }}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder={`Constraint ${index + 1}`}
                        />
                        {designInput.constraints.length > 1 && (
                          <button
                            onClick={() => removeConstraint(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addConstraint}
                      className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Constraint
                    </button>
                  </div>

                  {/* Design System */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Design System
                    </label>
                    <select
                      value={designInput.designSystem}
                      onChange={(e) => updateDesignInput('designSystem', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="Material Design">Material Design</option>
                      <option value="Human Interface Guidelines">Human Interface Guidelines</option>
                      <option value="Fluent Design">Fluent Design</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {/* Accessibility Standards */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accessibility Standards
                    </label>
                    <div className="space-y-2">
                      {['WCAG 2.1 AA', 'WCAG 2.1 AAA', 'Section 508', 'Custom'].map((standard) => (
                        <label key={standard} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={designInput.accessibilityStandards.includes(standard)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateDesignInput('accessibilityStandards', [...designInput.accessibilityStandards, standard]);
                              } else {
                                updateDesignInput('accessibilityStandards', designInput.accessibilityStandards.filter(s => s !== standard));
                              }
                            }}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-900">{standard}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <Button
                    onClick={generateWireframes}
                    disabled={!isFormValid || isGenerating}
                    loading={isGenerating}
                    leftIcon={isGenerating ? undefined : <Brain className="w-5 h-5" />}
                    className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:scale-100 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating Wireframes...</span>
                      </div>
                    ) : (
                      'Generate AI Wireframes'
                    )}
                  </Button>
                  
                  {!isFormValid && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Please fill in all required fields to generate wireframes
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Wireframes Display */}
          <div className="w-1/2 bg-gray-50 overflow-y-auto">
            <div className="p-6">
              {currentStep === 'generating' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                      <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">AI is Generating Your Wireframes</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Creating persona-aware wireframes with UX best practices...
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${generationProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{generationProgress}% complete</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'review' && wireframes.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Generated Wireframes</h3>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setCurrentStep('edit')}
                          leftIcon={<Edit3 className="w-4 h-4" />}
                          variant="outline"
                        >
                          Edit Mode
                        </Button>
                        <Button
                          leftIcon={<Download className="w-4 h-4" />}
                          variant="outline"
                        >
                          Export All
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {wireframes.map((wireframe) => (
                      <div key={wireframe.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900">{wireframe.name}</h4>
                              <p className="text-sm text-gray-600">{wireframe.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {wireframe.deviceType}
                              </span>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {wireframe.accessibilityScore}/100
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <Palette className="w-12 h-12 mx-auto mb-2" />
                              <p className="text-sm">Wireframe Preview</p>
                              <p className="text-xs">Interactive wireframe will be displayed here</p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => {
                                  setSelectedWireframe(wireframe);
                                  setShowWireframeViewer(true);
                                }}
                                leftIcon={<Eye className="w-4 h-4" />}
                                variant="outline"
                                size="sm"
                              >
                                View
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedWireframe(wireframe);
                                  setShowWireframeViewer(true);
                                }}
                                leftIcon={<Edit3 className="w-4 h-4" />}
                                variant="outline"
                                size="sm"
                              >
                                Edit
                              </Button>
                            </div>
                            <div className="text-xs text-gray-500">
                              {wireframe.uxPatterns.length} UX patterns
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 'input' && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200 p-8 text-center h-full flex items-center justify-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
                      <Palette className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Generate Wireframes</h3>
                      <p className="text-gray-600 text-sm">
                        Fill out the form on the left and click "Generate AI Wireframes" to create persona-aware wireframes.
                      </p>
                    </div>
                    <div className="flex justify-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        Persona-Aware
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        UX Best Practices
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        Instant Results
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Coach Sidebar */}
      <AICoachSidebar
        isOpen={showAICoach}
        onClose={() => setShowAICoach(false)}
        designInput={designInput}
        prdData={prdData}
        researchData={researchData}
        personas={personas}
      />

      {/* Wireframe Viewer */}
      {showWireframeViewer && (
        <WireframeViewer
          wireframes={wireframes}
          selectedWireframe={selectedWireframe}
          onSelectWireframe={setSelectedWireframe}
          onClose={() => setShowWireframeViewer(false)}
          onEdit={(wireframe) => {
            // Handle edit functionality
            console.log('Edit wireframe:', wireframe);
          }}
          onExport={(wireframe) => {
            // Handle export functionality
            console.log('Export wireframe:', wireframe);
          }}
          onDelete={(wireframeId) => {
            // Handle delete functionality
            setWireframes(wireframes.filter(w => w.id !== wireframeId));
            if (selectedWireframe?.id === wireframeId) {
              setSelectedWireframe(null);
              setShowWireframeViewer(false);
            }
          }}
        />
      )}
    </div>
  );
}
