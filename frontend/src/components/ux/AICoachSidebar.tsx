import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Lightbulb, 
  Target, 
  Shield, 
  Users, 
  Smartphone, 
  Monitor, 
  AlertCircle, 
  CheckCircle, 
  Info,
  X,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface AICoachSuggestion {
  id: string;
  type: 'accessibility' | 'ux' | 'persona' | 'device' | 'constraint';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
  icon: React.ReactNode;
  category: string;
}

interface AICoachSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  designInput: any;
  prdData?: any;
  researchData?: any;
  personas: any[];
}

export default function AICoachSidebar({ 
  isOpen, 
  onClose, 
  designInput, 
  prdData, 
  researchData, 
  personas 
}: AICoachSidebarProps) {
  const [suggestions, setSuggestions] = useState<AICoachSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'insights' | 'patterns'>('suggestions');

  useEffect(() => {
    if (isOpen) {
      analyzeDesignInput();
    }
  }, [isOpen, designInput, prdData, researchData]);

  const analyzeDesignInput = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const newSuggestions = generateAISuggestions();
      setSuggestions(newSuggestions);
      setIsAnalyzing(false);
    }, 1500);
  };

  const generateAISuggestions = (): AICoachSuggestion[] => {
    const suggestions: AICoachSuggestion[] = [];

    // Analyze design focus
    if (designInput.focus) {
      if (designInput.focus.toLowerCase().includes('simplify')) {
        suggestions.push({
          id: 'simplify-1',
          type: 'ux',
          priority: 'high',
          title: 'Progressive Disclosure',
          description: 'Consider using progressive disclosure to simplify complex flows while maintaining functionality.',
          action: 'Add progressive disclosure patterns',
          icon: <Target className="w-4 h-4" />,
          category: 'UX Pattern'
        });
      }
    }

    // Analyze personas
    const lowTechPersonas = personas.filter(p => p.techComfort === 'low');
    if (lowTechPersonas.length > 0) {
      suggestions.push({
        id: 'persona-1',
        type: 'persona',
        priority: 'high',
        title: 'Simplify for Low-Tech Users',
        description: `${lowTechPersonas.length} persona(s) have low tech comfort. Consider larger buttons, clearer labels, and simpler navigation.`,
        action: 'Adjust interface complexity',
        icon: <Users className="w-4 h-4" />,
        category: 'Persona Optimization'
      });
    }

    // Analyze device types
    if (designInput.deviceTypes.includes('mobile') && designInput.deviceTypes.includes('desktop')) {
      suggestions.push({
        id: 'device-1',
        type: 'device',
        priority: 'medium',
        title: 'Mobile-First Approach',
        description: 'Designing for both mobile and desktop? Start with mobile-first to ensure optimal touch interactions.',
        action: 'Implement mobile-first design',
        icon: <Smartphone className="w-4 h-4" />,
        category: 'Responsive Design'
      });
    }

    // Analyze accessibility
    if (designInput.accessibilityStandards.includes('WCAG 2.1 AA')) {
      suggestions.push({
        id: 'accessibility-1',
        type: 'accessibility',
        priority: 'high',
        title: 'Color Contrast Check',
        description: 'Ensure sufficient color contrast ratios (4.5:1 for normal text) for WCAG 2.1 AA compliance.',
        action: 'Verify color contrast',
        icon: <Shield className="w-4 h-4" />,
        category: 'Accessibility'
      });
    }

    // Analyze constraints
    if (designInput.constraints.some(c => c.toLowerCase().includes('budget'))) {
      suggestions.push({
        id: 'constraint-1',
        type: 'constraint',
        priority: 'medium',
        title: 'Cost-Effective Solutions',
        description: 'Budget constraints detected. Consider using existing design system components and standard patterns.',
        action: 'Optimize for cost',
        icon: <Target className="w-4 h-4" />,
        category: 'Constraint Management'
      });
    }

    // Analyze goals
    if (designInput.keyGoals.some(goal => goal.toLowerCase().includes('conversion'))) {
      suggestions.push({
        id: 'ux-1',
        type: 'ux',
        priority: 'high',
        title: 'Conversion Optimization',
        description: 'Focus on clear CTAs, reduced friction, and trust signals to improve conversion rates.',
        action: 'Add conversion elements',
        icon: <Target className="w-4 h-4" />,
        category: 'UX Strategy'
      });
    }

    return suggestions;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accessibility': return <Shield className="w-4 h-4" />;
      case 'ux': return <Lightbulb className="w-4 h-4" />;
      case 'persona': return <Users className="w-4 h-4" />;
      case 'device': return <Smartphone className="w-4 h-4" />;
      case 'constraint': return <Target className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Design Coach</h3>
              <p className="text-xs text-gray-600">Real-time suggestions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'suggestions'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Suggestions
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'insights'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab('patterns')}
          className={`flex-1 px-4 py-2 text-sm font-medium ${
            activeTab === 'patterns'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Patterns
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isAnalyzing ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Analyzing your design input...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'suggestions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">AI Suggestions</h4>
                  <button
                    onClick={analyzeDesignInput}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                
                {suggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No suggestions yet</p>
                    <p className="text-xs text-gray-400">Fill out the form to get AI recommendations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getTypeIcon(suggestion.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="text-sm font-medium text-gray-900">
                                {suggestion.title}
                              </h5>
                              <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-50">
                                {suggestion.category}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 mb-2">
                              {suggestion.description}
                            </p>
                            {suggestion.action && (
                              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                {suggestion.action} →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Design Insights</h4>
                
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <h5 className="text-sm font-medium text-blue-900">Persona Analysis</h5>
                    </div>
                    <p className="text-xs text-blue-700">
                      {personas.length} persona(s) identified. 
                      {personas.filter(p => p.techComfort === 'low').length > 0 && 
                        ` ${personas.filter(p => p.techComfort === 'low').length} require simplified interfaces.`
                      }
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <h5 className="text-sm font-medium text-green-900">Accessibility</h5>
                    </div>
                    <p className="text-xs text-green-700">
                      {designInput.accessibilityStandards.join(', ')} compliance required. 
                      Consider color contrast, keyboard navigation, and screen reader support.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-purple-600" />
                      <h5 className="text-sm font-medium text-purple-900">Design Goals</h5>
                    </div>
                    <p className="text-xs text-purple-700">
                      Focus: {designInput.focus || 'Not specified'}. 
                      {designInput.keyGoals.length} key goal(s) identified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'patterns' && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Recommended Patterns</h4>
                
                <div className="space-y-3">
                  {[
                    { name: 'Progressive Disclosure', description: 'Show information gradually', icon: <Target className="w-4 h-4" /> },
                    { name: 'Card Layout', description: 'Organize content in cards', icon: <Monitor className="w-4 h-4" /> },
                    { name: 'Bottom Navigation', description: 'Mobile-friendly navigation', icon: <Smartphone className="w-4 h-4" /> },
                    { name: 'Breadcrumbs', description: 'Show user location', icon: <Target className="w-4 h-4" /> }
                  ].map((pattern, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="text-gray-600">{pattern.icon}</div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">{pattern.name}</h5>
                          <p className="text-xs text-gray-600">{pattern.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Brain className="w-3 h-3" />
          <span>AI Coach powered by GPT-4</span>
        </div>
      </div>
    </div>
  );
}
