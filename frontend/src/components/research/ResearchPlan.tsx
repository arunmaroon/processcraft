import React, { useState, useEffect } from 'react';
import { FileText, Brain, Users, Target, BookOpen, CheckCircle, Loader2, Edit3, Zap, Sparkles } from 'lucide-react';

interface ResearchPlanProps {
  project: any;
  onPlanCreated: (plan: any) => void;
  prdData?: any; // PRD data to use as input
}

interface ResearchPlanData {
  projectTitle: string;
  objectives: string[];
  researchQuestions: string[];
  methods: any[];
  participants: any;
  background: string;
  literatureReview: string;
  methodology: string;
  expectedOutcomes: string;
  limitations: string;
  successMetrics: string[];
  constraints: string[];
  risks: string[];
}

const ResearchPlan: React.FC<ResearchPlanProps> = ({ project, onPlanCreated, prdData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'config' | 'preview' | 'edit'>('config');
  const [researchInput, setResearchInput] = useState({
    // Basic Project Info
    projectTitle: project.name || '',
    productDescription: '',
    businessContext: '',
    
    // Target Users & Demographics
    targetUsers: '',
    userPersonas: [] as string[],
    ageRange: '',
    incomeLevel: '',
    location: '',
    techLiteracy: '',
    
    // Research Objectives
    researchGoals: '',
    keyQuestions: [] as string[],
    businessObjectives: [] as string[],
    successMetrics: [] as string[],
    
    // Research Scope
    researchScope: '',
    keyFeatures: [] as string[],
    painPoints: [] as string[],
    competitiveAdvantages: [] as string[],
    
    // Methodology Preferences
    preferredMethods: [] as string[],
    teamSize: 3,
    
    // Constraints & Requirements
    constraints: [] as string[],
    specialRequirements: '',
    ethicalConsiderations: '',
    
    reportingNeeds: ''
  });

  const [generatedPlan, setGeneratedPlan] = useState<ResearchPlanData | null>(null);
  const [editablePlan, setEditablePlan] = useState<ResearchPlanData | null>(null);
  const [originalInput, setOriginalInput] = useState<any>(null);

  // Load existing research plan data
  useEffect(() => {
    const savedPlan = localStorage.getItem(`research-plan-${project.id}`);
    const savedInput = localStorage.getItem(`research-input-${project.id}`);
    
    if (savedPlan) {
      try {
        const planData = JSON.parse(savedPlan);
        setGeneratedPlan(planData);
        setEditablePlan(planData);
        setCurrentStep('preview');
      } catch (error) {
        console.error('Error loading saved research plan:', error);
      }
    }
    
    if (savedInput) {
      try {
        const inputData = JSON.parse(savedInput);
        setOriginalInput(inputData);
        setResearchInput(inputData);
      } catch (error) {
        console.error('Error loading saved research input:', error);
      }
    }
  }, [project.id]);

  const researchMethods = [
    {
      id: 'user-interviews',
      name: 'User Interviews',
      type: 'Qualitative',
      description: 'One-on-one interviews to understand user needs and pain points',
      duration: 60,
      participants: 8,
      cost: 1200
    },
    {
      id: 'focus-groups',
      name: 'Focus Groups',
      type: 'Qualitative',
      description: 'Group discussions to explore user attitudes and behaviors',
      duration: 90,
      participants: 12,
      cost: 800
    },
    {
      id: 'surveys',
      name: 'Online Surveys',
      type: 'Quantitative',
      description: 'Structured questionnaires to gather statistical data',
      duration: 20,
      participants: 200,
      cost: 300
    },
    {
      id: 'usability-testing',
      name: 'Usability Testing',
      type: 'Mixed',
      description: 'Observe users interacting with prototypes or products',
      duration: 45,
      participants: 15,
      cost: 900
    },
    {
      id: 'card-sorting',
      name: 'Card Sorting',
      type: 'Qualitative',
      description: 'Understand user mental models and information architecture',
      duration: 30,
      participants: 20,
      cost: 400
    },
    {
      id: 'diary-study',
      name: 'Diary Study',
      type: 'Qualitative',
      description: 'Longitudinal study of user behaviors over time',
      duration: 14,
      participants: 10,
      cost: 600
    }
  ];

  const generatePlan = async () => {
    setIsGenerating(true);
    
    try {
      // Call AI API for real generation
      const response = await fetch('/api/research/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project: project,
          researchInput: researchInput,
          prdData: prdData
        })
      });

      let plan: ResearchPlanData;
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          plan = data.plan;
        } else {
          throw new Error(data.error || 'API returned error');
        }
      } else {
        throw new Error('API request failed');
      }
      
      // Fallback to simulated plan if API fails
      if (!plan) {
        plan = {
        projectTitle: researchInput.projectTitle,
        objectives: [
          'Understand user needs and pain points',
          'Identify opportunities for product improvement',
          'Validate design concepts and assumptions',
          'Gather insights for feature prioritization'
        ],
        researchQuestions: [
          'What are the main challenges users face?',
          'How do users currently solve this problem?',
          'What features are most important to users?',
          'What would make users switch to our solution?'
        ],
        methods: researchMethods.slice(0, 3), // Select top 3 methods
        participants: {
          totalParticipants: researchInput.participantCount,
          demographics: {
            age: '25-45',
            gender: 'Mixed',
            location: 'Global',
            experience: 'Mixed'
          },
          cohorts: [
            { name: 'Power Users', count: 8, criteria: 'Daily active users' },
            { name: 'New Users', count: 6, criteria: 'First-time users' },
            { name: 'Churned Users', count: 6, criteria: 'Recently stopped using' }
          ]
        },
        background: 'This research aims to understand user needs and behaviors to inform product development decisions.',
        literatureReview: 'Based on industry best practices and academic research in user experience design.',
        methodology: 'Mixed-methods approach combining qualitative and quantitative research techniques.',
        expectedOutcomes: 'Actionable insights and recommendations for product improvement.',
        limitations: 'Sample size and geographic constraints may limit generalizability.',
        successMetrics: [
          'User satisfaction scores',
          'Task completion rates',
          'Feature adoption rates',
          'User retention metrics'
        ],
        constraints: [
          'Budget limitations',
          'Participant availability'
        ],
        risks: [
          'Low participant response rate',
          'Technical issues during sessions',
          'Bias in data collection'
         ]
       };
      }

      setGeneratedPlan(plan);
      setEditablePlan({ ...plan });
      setOriginalInput({ ...researchInput }); // Save original input
      setCurrentStep('preview');
      
      // Auto-save the generated plan
      const researchPlanData = {
        ...plan,
        projectId: project.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(`research-plan-${project.id}`, JSON.stringify(researchPlanData));
      localStorage.setItem(`research-input-${project.id}`, JSON.stringify(researchInput));
    } catch (error) {
      console.error('Error generating research plan:', error);
      // Show error message to user
      alert('Failed to generate research plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditPlan = () => {
    setCurrentStep('edit');
    // Restore original input when editing
    if (originalInput) {
      setResearchInput(originalInput);
    }
  };

  const handleSaveEdits = () => {
    if (editablePlan) {
      setGeneratedPlan(editablePlan);
      setCurrentStep('preview');
      // Update the original input with current research input
      setOriginalInput({ ...researchInput });
      localStorage.setItem(`research-input-${project.id}`, JSON.stringify(researchInput));
    }
  };

  const handleConfirmPlan = () => {
    if (generatedPlan) {
      // Save research plan to localStorage
      const researchPlanData = {
        ...generatedPlan,
        projectId: project.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem(`research-plan-${project.id}`, JSON.stringify(researchPlanData));
      localStorage.setItem(`research-input-${project.id}`, JSON.stringify(researchInput));
      
      // Also save to project data
      const projectData = {
        ...project,
        researchPlan: researchPlanData
      };
      
      // Update project in localStorage
      const projects = JSON.parse(localStorage.getItem('processcraft-projects') || '[]');
      const updatedProjects = projects.map((p: any) => 
        p.id === project.id ? projectData : p
      );
      localStorage.setItem('processcraft-projects', JSON.stringify(updatedProjects));
      
      onPlanCreated(generatedPlan);
    }
  };

  const handleBackToConfig = () => {
    setCurrentStep('config');
    setGeneratedPlan(null);
    setEditablePlan(null);
    
    // Restore original input if available
    if (originalInput) {
      setResearchInput(originalInput);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        <div className={`flex items-center space-x-2 ${currentStep === 'config' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'config' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="text-sm font-medium">Configure</span>
        </div>
        <div className={`w-8 h-0.5 ${currentStep === 'preview' || currentStep === 'edit' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center space-x-2 ${currentStep === 'preview' || currentStep === 'edit' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' || currentStep === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="text-sm font-medium">Review & Edit</span>
        </div>
        <div className={`w-8 h-0.5 ${currentStep === 'preview' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex items-center space-x-2 ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="text-sm font-medium">Confirm</span>
        </div>
      </div>

      {/* Step 1: Configuration */}
      {currentStep === 'config' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-yellow-500" />
              Research Plan Generator
            </h3>
            <p className="text-gray-600 text-sm">AI will generate a comprehensive research plan based on your PRD and project details in seconds.</p>
          </div>

          {/* PRD Data Display */}
          {prdData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                PRD Data Available
              </h4>
              <p className="text-sm text-blue-700">AI will use your PRD content to generate targeted research objectives and questions.</p>
            </div>
          )}
        
          {/* Basic Project Information */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-500" />
              Project Information
            </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
              <input
                type="text"
                value={researchInput.projectTitle}
                onChange={(e) => setResearchInput(prev => ({ ...prev, projectTitle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project title"
              />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Description</label>
              <input
                type="text"
                  value={researchInput.productDescription}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, productDescription: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of your product"
              />
            </div>
            
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Context</label>
                <textarea
                  value={researchInput.businessContext}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, businessContext: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe the business context, market situation, and strategic goals"
                />
              </div>
            </div>
          </div>

          {/* Target Users & Demographics */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-500" />
              Target Users & Demographics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Users</label>
              <input
                type="text"
                value={researchInput.targetUsers}
                onChange={(e) => setResearchInput(prev => ({ ...prev, targetUsers: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Small business owners, Students, Working professionals"
              />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                <select
                  value={researchInput.ageRange}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, ageRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select age range</option>
                  <option value="18-25">18-25</option>
                  <option value="25-35">25-35</option>
                  <option value="35-45">35-45</option>
                  <option value="45-55">45-55</option>
                  <option value="55+">55+</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Income Level</label>
                <select
                  value={researchInput.incomeLevel}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, incomeLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select income level</option>
                  <option value="Low">Low (₹0-3L)</option>
                  <option value="Lower-middle">Lower-middle (₹3L-5L)</option>
                  <option value="Middle">Middle (₹5L-7.5L)</option>
                  <option value="Upper-middle">Upper-middle (₹7.5L-10L)</option>
                  <option value="High">High (₹10L+)</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                  value={researchInput.location}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Urban, Rural, Global, Specific cities"
              />
            </div>
            
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tech Literacy</label>
                <select
                  value={researchInput.techLiteracy}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, techLiteracy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select tech literacy</option>
                  <option value="Low">Low (Basic users)</option>
                  <option value="Medium">Medium (Comfortable with tech)</option>
                  <option value="High">High (Tech-savvy)</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Personas (comma-separated)</label>
                <input
                  type="text"
                  value={researchInput.userPersonas.join(', ')}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, userPersonas: e.target.value.split(',').map(p => p.trim()).filter(p => p) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., First-time borrowers, Experienced investors, Small business owners"
                />
              </div>
            </div>
          </div>

          {/* Research Objectives */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-purple-500" />
              Research Objectives
            </h4>
            <div className="space-y-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Research Goals</label>
              <textarea
                value={researchInput.researchGoals}
                onChange={(e) => setResearchInput(prev => ({ ...prev, researchGoals: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                  placeholder="What do you want to learn from this research? What are your main objectives?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Research Questions (one per line)</label>
                <textarea
                  value={researchInput.keyQuestions.join('\n')}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, keyQuestions: e.target.value.split('\n').filter(q => q.trim()) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="What specific questions do you want answered?&#10;What barriers do users face?&#10;How do users currently solve this problem?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Objectives (one per line)</label>
                <textarea
                  value={researchInput.businessObjectives.join('\n')}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, businessObjectives: e.target.value.split('\n').filter(o => o.trim()) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="What business goals should this research support?&#10;Increase user engagement&#10;Reduce churn rate&#10;Improve conversion"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Success Metrics (one per line)</label>
                <textarea
                  value={researchInput.successMetrics.join('\n')}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, successMetrics: e.target.value.split('\n').filter(m => m.trim()) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="How will you measure success?&#10;User satisfaction score > 4.5/5&#10;Task completion rate > 90%&#10;Feature adoption rate > 70%"
                />
              </div>
            </div>
          </div>

          {/* Research Scope */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-orange-500" />
              Research Scope
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Research Scope</label>
                <textarea
                  value={researchInput.researchScope}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, researchScope: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="What aspects of the product/experience will you focus on? What's in scope and out of scope?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Features to Test (one per line)</label>
                <textarea
                  value={researchInput.keyFeatures.join('\n')}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, keyFeatures: e.target.value.split('\n').filter(f => f.trim()) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Which features are most important to test?&#10;User onboarding flow&#10;Payment processing&#10;Search functionality"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Known Pain Points (one per line)</label>
                <textarea
                  value={researchInput.painPoints.join('\n')}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, painPoints: e.target.value.split('\n').filter(p => p.trim()) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="What pain points do you suspect users have?&#10;Complex signup process&#10;Slow loading times&#10;Confusing navigation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Competitive Advantages (one per line)</label>
                <textarea
                  value={researchInput.competitiveAdvantages.join('\n')}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, competitiveAdvantages: e.target.value.split('\n').filter(a => a.trim()) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="What makes your product unique?&#10;Faster processing&#10;Better user experience&#10;Lower fees"
                />
              </div>
            </div>
          </div>

          {/* Methodology Preferences */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-indigo-500" />
              Methodology Preferences
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Methods</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'User Interviews',
                    'Focus Groups', 
                    'Surveys',
                    'Usability Testing',
                    'Card Sorting',
                    'Diary Studies',
                    'A/B Testing',
                    'Ethnographic Research',
                    'Contextual Inquiry',
                    'Heuristic Evaluation'
                  ].map((method) => (
                    <label key={method} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={researchInput.preferredMethods.includes(method)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setResearchInput(prev => ({ 
                              ...prev, 
                              preferredMethods: [...prev.preferredMethods, method] 
                            }));
                          } else {
                            setResearchInput(prev => ({ 
                              ...prev, 
                              preferredMethods: prev.preferredMethods.filter(m => m !== method) 
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              
            </div>
          </div>

          {/* Constraints & Requirements */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-red-500" />
              Constraints & Requirements
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Constraints (one per line)</label>
                <textarea
                  value={researchInput.constraints.join('\n')}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, constraints: e.target.value.split('\n').filter(c => c.trim()) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="What limitations do you have?&#10;Remote-only sessions&#10;Limited participant pool&#10;Budget constraints"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
                <textarea
                  value={researchInput.specialRequirements}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, specialRequirements: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Any special requirements or considerations?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ethical Considerations</label>
                <textarea
                  value={researchInput.ethicalConsiderations}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, ethicalConsiderations: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Any ethical considerations or sensitive topics to address?"
                />
              </div>
            </div>
          </div>

          {/* Reporting Needs */}
          <div className="mb-8">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-teal-500" />
              Reporting & Deliverables
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Needs</label>
                <textarea
                  value={researchInput.reportingNeeds}
                  onChange={(e) => setResearchInput(prev => ({ ...prev, reportingNeeds: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="What reporting format do you need? Any specific deliverables?"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={generatePlan}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI Generating Research Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Instant Research Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Edit */}
      {(currentStep === 'preview' || currentStep === 'edit') && generatedPlan && (
        <div className="space-y-6">
          {/* Preview Header */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Zap className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-green-800">Research Plan Generated Successfully</h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleEditPlan}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Plan</span>
                </button>
                <button
                  onClick={handleBackToConfig}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Back to Config
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Objectives</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{generatedPlan.objectives.length}</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Participants</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{generatedPlan.participants.totalParticipants}</div>
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Research Plan Details</h4>
            
            {/* Objectives */}
            <div className="mb-6">
              <h5 className="text-md font-medium text-gray-700 mb-3">Research Objectives</h5>
              <ul className="list-disc list-inside space-y-1">
                {generatedPlan.objectives?.map((objective, index) => (
                  <li key={index} className="text-gray-600">{objective}</li>
                )) || []}
              </ul>
            </div>

            {/* Research Questions */}
            <div className="mb-6">
              <h5 className="text-md font-medium text-gray-700 mb-3">Research Questions</h5>
              <ul className="list-disc list-inside space-y-1">
                {generatedPlan.researchQuestions?.map((question, index) => (
                  <li key={index} className="text-gray-600">{question}</li>
                )) || []}
              </ul>
            </div>

            {/* Methods */}
            <div className="mb-6">
              <h5 className="text-md font-medium text-gray-700 mb-3">Research Methods</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedPlan.methods?.map((method, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h6 className="font-medium text-gray-900">{method.name}</h6>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{method.type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{method.duration} min</span>
                      <span>{method.participants} participants</span>
                      <span>${method.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleBackToConfig}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to Configuration
              </button>
              <button
                onClick={handleConfirmPlan}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Plan & Continue to Discussion Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchPlan;
