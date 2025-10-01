import React, { useState, useEffect } from 'react';
import { Users, Bot, Target, Sliders, CheckCircle, Plus, Trash2, Edit3, Save } from 'lucide-react';
import DualRangeSlider from '../ui/DualRangeSlider';

interface AIAgent {
  id: string;
  name: string;
  description: string;
  persona: string;
  expertise: string[];
  selected: boolean;
}

interface UserDemographics {
  ageRange: [number, number];
  incomeRange: [number, number];
  creditScoreRange: [number, number];
  occupation: string[];
  employmentType: string[];
  education: string[];
  location: string[];
}

interface PreferredMethod {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface ResearchSetupProps {
  project: any;
  onSetupComplete: (setup: any) => void;
}

const ResearchSetup: React.FC<ResearchSetupProps> = ({ project, onSetupComplete }) => {
  const [aiAgents, setAIAgents] = useState<AIAgent[]>([
    {
      id: 'senior-pm',
      name: 'Senior Product Manager',
      description: 'Experienced PM with 10+ years in fintech',
      persona: 'Strategic thinker, data-driven, user-focused',
      expertise: ['Product Strategy', 'User Research', 'Market Analysis'],
      selected: true
    },
    {
      id: 'ux-researcher',
      name: 'UX Researcher',
      description: 'Specialist in user behavior and usability',
      persona: 'Empathetic, analytical, detail-oriented',
      expertise: ['User Interviews', 'Usability Testing', 'Behavioral Analysis'],
      selected: true
    },
    {
      id: 'data-analyst',
      name: 'Data Analyst',
      description: 'Expert in quantitative research and metrics',
      persona: 'Logical, precise, numbers-focused',
      expertise: ['Data Analysis', 'Statistical Modeling', 'KPI Tracking'],
      selected: false
    },
    {
      id: 'business-analyst',
      name: 'Business Analyst',
      description: 'Focuses on business requirements and processes',
      persona: 'Process-oriented, systematic, business-minded',
      expertise: ['Business Process', 'Requirements Analysis', 'Stakeholder Management'],
      selected: false
    },
    {
      id: 'tech-lead',
      name: 'Technical Lead',
      description: 'Deep technical expertise and architecture knowledge',
      persona: 'Technical, innovative, solution-oriented',
      expertise: ['Technical Architecture', 'Feasibility Analysis', 'Implementation Planning'],
      selected: false
    }
  ]);

  const [userDemographics, setUserDemographics] = useState<UserDemographics>({
    ageRange: [25, 55],
    incomeRange: [15000, 100000],
    creditScoreRange: [600, 800],
    occupation: ['Software Engineer', 'Business Professional', 'Entrepreneur'],
    employmentType: ['Salaried', 'Self-Employed'],
    education: ['Graduate', 'Post-Graduate'],
    location: ['Bengaluru', 'Mumbai', 'Delhi', 'Chennai']
  });

  const [preferredMethods, setPreferredMethods] = useState<PreferredMethod[]>([
    {
      id: 'user-interviews',
      name: 'User Interviews',
      description: 'One-on-one qualitative interviews',
      selected: true
    },
    {
      id: 'focus-groups',
      name: 'Focus Groups',
      description: 'Group discussions with multiple participants',
      selected: false
    },
    {
      id: 'surveys',
      name: 'Surveys',
      description: 'Quantitative data collection',
      selected: true
    },
    {
      id: 'usability-testing',
      name: 'Usability Testing',
      description: 'Observing users interact with prototypes',
      selected: false
    },
    {
      id: 'card-sorting',
      name: 'Card Sorting',
      description: 'Understanding information architecture',
      selected: false
    },
    {
      id: 'diary-studies',
      name: 'Diary Studies',
      description: 'Long-term user behavior tracking',
      selected: false
    }
  ]);

  const [researchObjectives, setResearchObjectives] = useState<string>('');
  const [researchQuestions, setResearchQuestions] = useState<string>('');

  const handleAIAgentToggle = (agentId: string) => {
    setAIAgents(prev => 
      prev.map(agent => 
        agent.id === agentId ? { ...agent, selected: !agent.selected } : agent
      )
    );
  };

  const handleDemographicsChange = (field: keyof UserDemographics, value: any) => {
    setUserDemographics(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMethodToggle = (methodId: string) => {
    setPreferredMethods(prev => 
      prev.map(method => 
        method.id === methodId ? { ...method, selected: !method.selected } : method
      )
    );
  };

  const handleSaveSetup = () => {
    const setup = {
      aiAgents: aiAgents.filter(agent => agent.selected),
      userDemographics,
      preferredMethods: preferredMethods.filter(method => method.selected),
      researchObjectives,
      researchQuestions,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem(`research-setup-${project.id}`, JSON.stringify(setup));
    
    onSetupComplete(setup);
  };

  const selectedAgentsCount = aiAgents.filter(agent => agent.selected).length;
  const selectedMethodsCount = preferredMethods.filter(method => method.selected).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sliders className="w-6 h-6 mr-2 text-blue-500" />
              AI Research Setup Configuration
            </h3>
            <p className="text-gray-600 text-sm">Configure AI agents, user demographics, and research methods for AI-powered research</p>
          </div>
          <button
            onClick={handleSaveSetup}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{selectedAgentsCount}</div>
            <div className="text-sm text-blue-800">AI Agents Selected</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{selectedMethodsCount}</div>
            <div className="text-sm text-green-800">Research Methods</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{userDemographics.occupation.length}</div>
            <div className="text-sm text-purple-800">Target Occupations</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{userDemographics.location.length}</div>
            <div className="text-sm text-orange-800">Target Locations</div>
          </div>
        </div>
      </div>

      {/* AI Agents Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <Bot className="w-5 h-5 mr-2 text-purple-500" />
          Choose AI Agents
        </h4>
        <p className="text-gray-600 text-sm mb-4">Select AI personas that will conduct the research analysis</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiAgents.map((agent) => (
            <div
              key={agent.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                agent.selected 
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => handleAIAgentToggle(agent.id)}
              >
                <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-gray-900">{agent.name}</h5>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  agent.selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                }`}>
                  {agent.selected && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
              <p className="text-xs text-gray-500 mb-2"><strong>Persona:</strong> {agent.persona}</p>
              <div className="flex flex-wrap gap-1">
                {agent.expertise.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                    {skill}
                  </span>
                ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* User Demographics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-green-500" />
          User Demographics
        </h4>
        <p className="text-gray-600 text-sm mb-6">Define the target user characteristics using sliders and multi-select options</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Age Range Dual Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Range: {userDemographics.ageRange[0]} - {userDemographics.ageRange[1]} years
            </label>
            <div className="relative">
              <div className="relative h-6">
                {/* Track */}
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
                
                {/* Active range */}
                <div 
                  className="absolute top-1/2 h-2 bg-green-500 rounded-full transform -translate-y-1/2"
                  style={{
                    left: `${((userDemographics.ageRange[0] - 18) / (65 - 18)) * 100}%`,
                    width: `${((userDemographics.ageRange[1] - userDemographics.ageRange[0]) / (65 - 18)) * 100}%`
                  }}
                ></div>
                
                {/* Min handle */}
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={userDemographics.ageRange[0]}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    const newMax = Math.max(newMin, userDemographics.ageRange[1]);
                    handleDemographicsChange('ageRange', [newMin, newMax]);
                  }}
                  className="absolute top-1/2 left-0 w-full h-6 opacity-0 cursor-pointer transform -translate-y-1/2"
                  style={{ zIndex: userDemographics.ageRange[0] > userDemographics.ageRange[1] - 5 ? 5 : 3 }}
                />
                
                {/* Max handle */}
                <input
                  type="range"
                  min="18"
                  max="65"
                  value={userDemographics.ageRange[1]}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    const newMin = Math.min(newMax, userDemographics.ageRange[0]);
                    handleDemographicsChange('ageRange', [newMin, newMax]);
                  }}
                  className="absolute top-1/2 left-0 w-full h-6 opacity-0 cursor-pointer transform -translate-y-1/2"
                  style={{ zIndex: userDemographics.ageRange[1] < userDemographics.ageRange[0] + 5 ? 5 : 3 }}
                />
                
                {/* Handle indicators */}
                <div 
                  className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 cursor-pointer hover:bg-green-600 transition-colors"
                  style={{ left: `calc(${((userDemographics.ageRange[0] - 18) / (65 - 18)) * 100}% - 12px)` }}
                ></div>
                <div 
                  className="absolute w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 cursor-pointer hover:bg-green-600 transition-colors"
                  style={{ left: `calc(${((userDemographics.ageRange[1] - 18) / (65 - 18)) * 100}% - 12px)` }}
                ></div>
            </div>
            
              {/* Range labels */}
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>18</span>
                <span>65</span>
              </div>
            </div>
          </div>

          {/* Income Range Dual Slider */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Income Range (INR): ₹{userDemographics.incomeRange[0].toLocaleString('en-IN')} - ₹{userDemographics.incomeRange[1].toLocaleString('en-IN')}
            </label>
            <div className="relative">
              <div className="relative h-6">
                {/* Track */}
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
                
                {/* Active range */}
                <div 
                  className="absolute top-1/2 h-2 bg-blue-500 rounded-full transform -translate-y-1/2"
                  style={{
                    left: `${((userDemographics.incomeRange[0] - 10000) / (200000 - 10000)) * 100}%`,
                    width: `${((userDemographics.incomeRange[1] - userDemographics.incomeRange[0]) / (200000 - 10000)) * 100}%`
                  }}
                ></div>
                
                {/* Replaced with DualRangeSlider component */}
                
                {/* Min handle - Enhanced for better interaction */}
                <div 
                  className="absolute w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-xl transform -translate-y-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-all duration-200 hover:bg-blue-600"
                  style={{ left: `calc(${((userDemographics.incomeRange[0] - 10000) / (200000 - 10000)) * 100}% - 16px)` }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startValue = userDemographics.incomeRange[0];
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                      if (!rect) return;
                      
                      const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                      const newValue = Math.max(10000, Math.min(200000, 10000 + (percentage / 100) * 190000));
                      const steppedValue = Math.round(newValue / 5000) * 5000;
                      const newMin = Math.min(steppedValue, userDemographics.incomeRange[1] - 5000);
                      
                      if (newMin !== userDemographics.incomeRange[0]) {
                        handleDemographicsChange('incomeRange', [newMin, userDemographics.incomeRange[1]]);
                      }
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    ₹{userDemographics.incomeRange[0].toLocaleString('en-IN')}
                  </div>
                </div>
                
                {/* Max handle - Enhanced for better interaction */}
                <div 
                  className="absolute w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-xl transform -translate-y-1/2 cursor-grab active:cursor-grabbing hover:scale-110 transition-all duration-200 hover:bg-blue-600"
                  style={{ left: `calc(${((userDemographics.incomeRange[1] - 10000) / (200000 - 10000)) * 100}% - 16px)` }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const startX = e.clientX;
                    const startValue = userDemographics.incomeRange[1];
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                      if (!rect) return;
                      
                      const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                      const newValue = Math.max(10000, Math.min(200000, 10000 + (percentage / 100) * 190000));
                      const steppedValue = Math.round(newValue / 5000) * 5000;
                      const newMax = Math.max(steppedValue, userDemographics.incomeRange[0] + 5000);
                      
                      if (newMax !== userDemographics.incomeRange[1]) {
                        handleDemographicsChange('incomeRange', [userDemographics.incomeRange[0], newMax]);
                      }
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    ₹{userDemographics.incomeRange[1].toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              
              {/* Range labels */}
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>₹10,000</span>
                <span>₹2,00,000</span>
              </div>
            </div>
          </div>
          
          {/* Credit Score Range Dual Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit Score Range: {userDemographics.creditScoreRange[0]} - {userDemographics.creditScoreRange[1]}
            </label>
            <div className="relative">
              <div className="relative h-6">
                {/* Track */}
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
                
                {/* Active range */}
                <div 
                  className="absolute top-1/2 h-2 bg-purple-500 rounded-full transform -translate-y-1/2"
                  style={{
                    left: `${((userDemographics.creditScoreRange[0] - 300) / (850 - 300)) * 100}%`,
                    width: `${((userDemographics.creditScoreRange[1] - userDemographics.creditScoreRange[0]) / (850 - 300)) * 100}%`
                  }}
                ></div>
                
                {/* Min handle */}
                <input
                  type="range"
                  min="300"
                  max="850"
                  value={userDemographics.creditScoreRange[0]}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value);
                    const newMax = Math.max(newMin, userDemographics.creditScoreRange[1]);
                    handleDemographicsChange('creditScoreRange', [newMin, newMax]);
                  }}
                  className="absolute top-1/2 left-0 w-full h-6 opacity-0 cursor-pointer transform -translate-y-1/2"
                  style={{ zIndex: userDemographics.creditScoreRange[0] > userDemographics.creditScoreRange[1] - 50 ? 5 : 3 }}
                />
                
                {/* Max handle */}
                <input
                  type="range"
                  min="300"
                  max="850"
                  value={userDemographics.creditScoreRange[1]}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value);
                    const newMin = Math.min(newMax, userDemographics.creditScoreRange[0]);
                    handleDemographicsChange('creditScoreRange', [newMin, newMax]);
                  }}
                  className="absolute top-1/2 left-0 w-full h-6 opacity-0 cursor-pointer transform -translate-y-1/2"
                  style={{ zIndex: userDemographics.creditScoreRange[1] < userDemographics.creditScoreRange[0] + 50 ? 5 : 3 }}
                />
                
                {/* Handle indicators */}
                <div 
                  className="absolute w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 cursor-pointer hover:bg-purple-600 transition-colors"
                  style={{ left: `calc(${((userDemographics.creditScoreRange[0] - 300) / (850 - 300)) * 100}% - 12px)` }}
                ></div>
                <div 
                  className="absolute w-6 h-6 bg-purple-500 rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 cursor-pointer hover:bg-purple-600 transition-colors"
                  style={{ left: `calc(${((userDemographics.creditScoreRange[1] - 300) / (850 - 300)) * 100}% - 12px)` }}
                ></div>
                </div>
              
              {/* Range labels */}
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>300</span>
                <span>850</span>
              </div>
            </div>
        </div>

          {/* Occupation Multi-select */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
            <div className="grid grid-cols-2 gap-2">
              {['Software Engineer', 'Business Professional', 'Entrepreneur', 'Doctor', 'Teacher', 'Banker', 'Consultant', 'Other'].map((occupation) => (
                <label key={occupation} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userDemographics.occupation.includes(occupation)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleDemographicsChange('occupation', [...userDemographics.occupation, occupation]);
                      } else {
                        handleDemographicsChange('occupation', userDemographics.occupation.filter(occ => occ !== occupation));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{occupation}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Employment Type Multi-select */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type</label>
            <div className="space-y-2">
              {['Salaried', 'Self-Employed', 'Freelancer', 'Business Owner', 'Student', 'Retired'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userDemographics.employmentType.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleDemographicsChange('employmentType', [...userDemographics.employmentType, type]);
                      } else {
                        handleDemographicsChange('employmentType', userDemographics.employmentType.filter(emp => emp !== type));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
            </div>
            
          {/* Education Multi-select */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
            <div className="space-y-2">
              {['High School', 'Diploma', 'Graduate', 'Post-Graduate', 'PhD', 'Professional Degree'].map((edu) => (
                <label key={edu} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userDemographics.education.includes(edu)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleDemographicsChange('education', [...userDemographics.education, edu]);
                      } else {
                        handleDemographicsChange('education', userDemographics.education.filter(ed => ed !== edu));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{edu}</span>
                </label>
              ))}
            </div>
            </div>
            
          {/* Location Multi-select */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Locations</label>
            <div className="grid grid-cols-2 gap-2">
              {['Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad'].map((location) => (
                <label key={location} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={userDemographics.location.includes(location)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleDemographicsChange('location', [...userDemographics.location, location]);
                      } else {
                        handleDemographicsChange('location', userDemographics.location.filter(loc => loc !== location));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{location}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preferred Research Methods */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-orange-500" />
          Preferred Research Methods
        </h4>
        <p className="text-gray-600 text-sm mb-4">Select multiple research methods for comprehensive data collection</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preferredMethods.map((method) => (
            <div
              key={method.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                method.selected 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleMethodToggle(method.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-gray-900">{method.name}</h5>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  method.selected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                }`}>
                  {method.selected && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
              </div>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          ))}
        </div>
            </div>

      {/* Research Objectives and Questions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Research Objectives & Questions</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Research Objectives</label>
            <textarea
              value={researchObjectives}
              onChange={(e) => setResearchObjectives(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="What are the main objectives of this research? What do you want to learn about your users?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Research Questions</label>
            <textarea
              value={researchQuestions}
              onChange={(e) => setResearchQuestions(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
              placeholder="What specific questions do you want to answer through this research?"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchSetup;
