import React, { useState } from 'react';
import { 
  Target, 
  Users, 
  BarChart3, 
  Building2, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  Globe, 
  Clock, 
  DollarSign,
  CheckCircle,
  Plus,
  Trash2,
  ArrowRight,
  Brain,
  FileText
} from 'lucide-react';
import { Project, PRD } from '../../types';
import Button from '../shared/Button';

interface StrategicPRDSetupProps {
  project: Project;
  prd: PRD;
  onPRDUpdate: (prd: PRD) => void;
  onGeneratePRD: () => void;
}

interface StrategicData {
  // Core Product Info
  productVision: string;
  productMission: string;
  valueProposition: string;
  
  // Market & Business
  marketSize: string;
  targetMarket: string;
  competitiveAdvantage: string;
  businessModel: string;
  revenueStreams: string[];
  
  // User & Experience
  userPersonas: Array<{
    name: string;
    description: string;
    painPoints: string[];
    goals: string[];
  }>;
  userJourney: string;
  keyUserStories: string[];
  
  // Technical & Operational
  technicalRequirements: string[];
  performanceMetrics: string[];
  complianceRequirements: string[];
  riskFactors: string[];
  
  // Timeline & Resources
  timeline: string;
  budget: string;
  teamSize: string;
  dependencies: string[];
}

export default function StrategicPRDSetup({ project, prd, onPRDUpdate, onGeneratePRD }: StrategicPRDSetupProps) {
  const [strategicData, setStrategicData] = useState<StrategicData>({
    productVision: '',
    productMission: '',
    valueProposition: '',
    marketSize: '',
    targetMarket: '',
    competitiveAdvantage: '',
    businessModel: '',
    revenueStreams: [''],
    userPersonas: [{
      name: '',
      description: '',
      painPoints: [''],
      goals: ['']
    }],
    userJourney: '',
    keyUserStories: [''],
    technicalRequirements: [''],
    performanceMetrics: [''],
    complianceRequirements: [''],
    riskFactors: [''],
    timeline: '',
    budget: '',
    teamSize: '',
    dependencies: ['']
  });

  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    { id: 'vision', title: 'Product Vision & Strategy', icon: <Target className="w-5 h-5" /> },
    { id: 'market', title: 'Market & Business Context', icon: <Building2 className="w-5 h-5" /> },
    { id: 'users', title: 'Users & Experience', icon: <Users className="w-5 h-5" /> },
    { id: 'technical', title: 'Technical & Operational', icon: <Brain className="w-5 h-5" /> },
    { id: 'execution', title: 'Timeline & Resources', icon: <Clock className="w-5 h-5" /> }
  ];

  const updateStrategicData = (field: keyof StrategicData, value: any) => {
    setStrategicData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: keyof StrategicData, value: string = '') => {
    const currentArray = strategicData[field] as string[];
    updateStrategicData(field, [...currentArray, value]);
  };

  const updateArrayItem = (field: keyof StrategicData, index: number, value: string) => {
    const currentArray = strategicData[field] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    updateStrategicData(field, newArray);
  };

  const removeArrayItem = (field: keyof StrategicData, index: number) => {
    const currentArray = strategicData[field] as string[];
    const newArray = currentArray.filter((_, i) => i !== index);
    updateStrategicData(field, newArray);
  };

  const addUserPersona = () => {
    updateStrategicData('userPersonas', [
      ...strategicData.userPersonas,
      { name: '', description: '', painPoints: [''], goals: [''] }
    ]);
  };

  const updateUserPersona = (index: number, field: keyof StrategicData['userPersonas'][0], value: any) => {
    const newPersonas = [...strategicData.userPersonas];
    newPersonas[index] = { ...newPersonas[index], [field]: value };
    updateStrategicData('userPersonas', newPersonas);
  };

  const addPersonaArrayItem = (personaIndex: number, field: 'painPoints' | 'goals', value: string = '') => {
    const newPersonas = [...strategicData.userPersonas];
    newPersonas[personaIndex][field] = [...newPersonas[personaIndex][field], value];
    updateStrategicData('userPersonas', newPersonas);
  };

  const updatePersonaArrayItem = (personaIndex: number, field: 'painPoints' | 'goals', itemIndex: number, value: string) => {
    const newPersonas = [...strategicData.userPersonas];
    newPersonas[personaIndex][field][itemIndex] = value;
    updateStrategicData('userPersonas', newPersonas);
  };

  const removePersonaArrayItem = (personaIndex: number, field: 'painPoints' | 'goals', itemIndex: number) => {
    const newPersonas = [...strategicData.userPersonas];
    newPersonas[personaIndex][field] = newPersonas[personaIndex][field].filter((_, i) => i !== itemIndex);
    updateStrategicData('userPersonas', newPersonas);
  };

  const isFormComplete = () => {
    return strategicData.productVision && 
           strategicData.productMission && 
           strategicData.valueProposition &&
           strategicData.targetMarket &&
           strategicData.userPersonas.some(p => p.name && p.description);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0: // Vision & Strategy
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Strategic Thinking Prompts</h3>
              <p className="text-blue-700 text-sm">
                Define your product's core purpose and strategic direction. Think about the long-term vision and how this product fits into your company's overall strategy.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  Product Vision
                </label>
                <textarea
                  value={strategicData.productVision}
                  onChange={(e) => updateStrategicData('productVision', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="What is the ultimate goal this product will achieve? (e.g., 'To democratize financial services for everyone')"
                />
                <p className="text-xs text-gray-500 mt-1">Think 5-10 years ahead. What world are you creating?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lightbulb className="w-4 h-4 inline mr-2" />
                  Product Mission
                </label>
                <textarea
                  value={strategicData.productMission}
                  onChange={(e) => updateStrategicData('productMission', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="How will you achieve your vision? (e.g., 'By building intuitive, secure, and accessible financial tools')"
                />
                <p className="text-xs text-gray-500 mt-1">Focus on the 'how' - your approach to achieving the vision.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Value Proposition
                </label>
                <textarea
                  value={strategicData.valueProposition}
                  onChange={(e) => updateStrategicData('valueProposition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="What unique value do you provide? (e.g., 'The only financial platform that combines AI-powered insights with human financial advisors')"
                />
                <p className="text-xs text-gray-500 mt-1">What makes you different and why should customers choose you?</p>
              </div>
            </div>
          </div>
        );

      case 1: // Market & Business
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Market & Business Context</h3>
              <p className="text-green-700 text-sm">
                Understand your market opportunity, competitive landscape, and business model. This helps justify the product's existence and potential success.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Market Size
                </label>
                <input
                  type="text"
                  value={strategicData.marketSize}
                  onChange={(e) => updateStrategicData('marketSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., ₹50,000Cr TAM, ₹5,000Cr SAM, ₹500Cr SOM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Target Market
                </label>
                <input
                  type="text"
                  value={strategicData.targetMarket}
                  onChange={(e) => updateStrategicData('targetMarket', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Small business owners, 25-45 years old"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Competitive Advantage
                </label>
                <textarea
                  value={strategicData.competitiveAdvantage}
                  onChange={(e) => updateStrategicData('competitiveAdvantage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="What gives you an edge over competitors? (e.g., proprietary technology, exclusive partnerships, unique data)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Business Model
                </label>
                <textarea
                  value={strategicData.businessModel}
                  onChange={(e) => updateStrategicData('businessModel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="How will you make money? (e.g., Subscription, Freemium, Transaction fees, Advertising)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Revenue Streams
                </label>
                <div className="space-y-2">
                  {strategicData.revenueStreams.map((stream, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={stream}
                        onChange={(e) => updateArrayItem('revenueStreams', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={`Revenue stream ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('revenueStreams', index)}
                        leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('revenueStreams')}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Revenue Stream
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Users & Experience
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Users & Experience Design</h3>
              <p className="text-purple-700 text-sm">
                Deeply understand your users, their needs, and how they'll interact with your product. This drives all design and development decisions.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900">User Personas</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addUserPersona}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Persona
                  </Button>
                </div>

                <div className="space-y-4">
                  {strategicData.userPersonas.map((persona, personaIndex) => (
                    <div key={personaIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900">Persona {personaIndex + 1}</h5>
                        {strategicData.userPersonas.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newPersonas = strategicData.userPersonas.filter((_, i) => i !== personaIndex);
                              updateStrategicData('userPersonas', newPersonas);
                            }}
                            leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={persona.name}
                            onChange={(e) => updateUserPersona(personaIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="e.g., Sarah the Small Business Owner"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={persona.description}
                            onChange={(e) => updateUserPersona(personaIndex, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  placeholder="What problems do they face?"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePersonaArrayItem(personaIndex, 'painPoints', painIndex)}
                                  leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                                />
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addPersonaArrayItem(personaIndex, 'painPoints')}
                              leftIcon={<Plus className="w-4 h-4" />}
                            >
                              Add Pain Point
                            </Button>
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
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  placeholder="What do they want to achieve?"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePersonaArrayItem(personaIndex, 'goals', goalIndex)}
                                  leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                                />
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addPersonaArrayItem(personaIndex, 'goals')}
                              leftIcon={<Plus className="w-4 h-4" />}
                            >
                              Add Goal
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  User Journey
                </label>
                <textarea
                  value={strategicData.userJourney}
                  onChange={(e) => updateStrategicData('userJourney', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Describe the typical user journey from awareness to success (e.g., Discovery → Trial → Onboarding → Regular Use → Advocacy)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Key User Stories
                </label>
                <div className="space-y-2">
                  {strategicData.keyUserStories.map((story, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={story}
                        onChange={(e) => updateArrayItem('keyUserStories', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="As a [user type], I want [goal] so that [benefit]"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('keyUserStories', index)}
                        leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('keyUserStories')}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add User Story
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Technical & Operational
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Technical & Operational Requirements</h3>
              <p className="text-orange-700 text-sm">
                Define technical constraints, performance requirements, and operational considerations that will guide development and deployment.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Brain className="w-4 h-4 inline mr-2" />
                  Technical Requirements
                </label>
                <div className="space-y-2">
                  {strategicData.technicalRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateArrayItem('technicalRequirements', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Must support 10,000 concurrent users, Real-time data processing"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('technicalRequirements', index)}
                        leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('technicalRequirements')}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Requirement
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BarChart3 className="w-4 h-4 inline mr-2" />
                  Performance Metrics
                </label>
                <div className="space-y-2">
                  {strategicData.performanceMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={metric}
                        onChange={(e) => updateArrayItem('performanceMetrics', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Page load time < 2 seconds, 99.9% uptime"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('performanceMetrics', index)}
                        leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('performanceMetrics')}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Metric
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Compliance Requirements
                </label>
                <div className="space-y-2">
                  {strategicData.complianceRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateArrayItem('complianceRequirements', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., GDPR compliance, SOC 2 Type II, HIPAA"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('complianceRequirements', index)}
                        leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('complianceRequirements')}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Requirement
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Risk Factors
                </label>
                <div className="space-y-2">
                  {strategicData.riskFactors.map((risk, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={risk}
                        onChange={(e) => updateArrayItem('riskFactors', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., Regulatory changes, Technology obsolescence, Market competition"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('riskFactors', index)}
                        leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('riskFactors')}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Risk
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Timeline & Resources
        return (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">Timeline & Resources</h3>
              <p className="text-indigo-700 text-sm">
                Define project timeline, budget, team requirements, and dependencies. This helps with planning and resource allocation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Timeline
                </label>
                <input
                  type="text"
                  value={strategicData.timeline}
                  onChange={(e) => updateStrategicData('timeline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 6 months to MVP, 12 months to full launch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Budget
                </label>
                <input
                  type="text"
                  value={strategicData.budget}
                  onChange={(e) => updateStrategicData('budget', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., ₹50L for MVP, ₹2Cr for full product"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Team Size
                </label>
                <input
                  type="text"
                  value={strategicData.teamSize}
                  onChange={(e) => updateStrategicData('teamSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 8 developers, 2 designers, 1 PM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Dependencies
                </label>
                <div className="space-y-2">
                  {strategicData.dependencies.map((dep, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={dep}
                        onChange={(e) => updateArrayItem('dependencies', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Third-party API integration, Legal approval"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem('dependencies', index)}
                        leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('dependencies')}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add Dependency
                  </Button>
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
            <h2 className="text-2xl font-bold text-gray-900">Strategic PRD Setup</h2>
            <p className="text-gray-600 mt-1">
              Help us understand your product strategy so we can generate a comprehensive PRD
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="text-lg font-semibold text-blue-600">
              {currentSection + 1} of {sections.length}
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => setCurrentSection(index)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentSection === index
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {section.icon}
            <span className="font-medium">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {renderSection()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
        >
          Previous
        </Button>

        <div className="flex space-x-3">
          {currentSection === sections.length - 1 ? (
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
              onClick={() => setCurrentSection(Math.min(sections.length - 1, currentSection + 1))}
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
              Please complete the required fields (Product Vision, Mission, Value Proposition, Target Market, and at least one User Persona) to generate the PRD.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
