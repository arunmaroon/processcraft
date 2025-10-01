import React, { useState } from 'react';
import { Settings, Users, Plus, X, Sparkles } from 'lucide-react';

interface ConfigurationBasedAgentCreatorProps {
  onAgentsGenerated: (agents: any[]) => void;
}

interface AgentConfig {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  education: string;
  location: string;
  income: string;
  techSavviness: string;
  personality: string;
  goals: string[];
  painPoints: string[];
  quote: string;
}

const ConfigurationBasedAgentCreator: React.FC<ConfigurationBasedAgentCreatorProps> = ({ onAgentsGenerated }) => {
  const [agents, setAgents] = useState<AgentConfig[]>([
    {
      name: '',
      age: 30,
      gender: 'Female',
      occupation: '',
      education: 'Bachelor\'s Degree',
      location: '',
      income: '₹50,000-₹75,000',
      techSavviness: 'Medium',
      personality: 'Analytical',
      goals: [],
      painPoints: [],
      quote: ''
    }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);

  const addAgent = () => {
    setAgents(prev => [...prev, {
      name: '',
      age: 30,
      gender: 'Female',
      occupation: '',
      education: 'Bachelor\'s Degree',
      location: '',
      income: '₹50,000-₹75,000',
      techSavviness: 'Medium',
      personality: 'Analytical',
      goals: [],
      painPoints: [],
      quote: ''
    }]);
  };

  const removeAgent = (index: number) => {
    if (agents.length > 1) {
      setAgents(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateAgent = (index: number, field: keyof AgentConfig, value: any) => {
    setAgents(prev => prev.map((agent, i) => 
      i === index ? { ...agent, [field]: value } : agent
    ));
  };

  const addArrayItem = (index: number, field: 'goals' | 'painPoints', value: string) => {
    if (value.trim()) {
      setAgents(prev => prev.map((agent, i) => 
        i === index ? { 
          ...agent, 
          [field]: [...agent[field], value.trim()] 
        } : agent
      ));
    }
  };

  const removeArrayItem = (index: number, field: 'goals' | 'painPoints', itemIndex: number) => {
    setAgents(prev => prev.map((agent, i) => 
      i === index ? { 
        ...agent, 
        [field]: agent[field].filter((_, j) => j !== itemIndex) 
      } : agent
    ));
  };

  const generateAgents = async () => {
    const validAgents = agents.filter(agent => 
      agent.name.trim() && agent.occupation.trim() && agent.location.trim()
    );

    if (validAgents.length === 0) {
      alert('Please fill in at least one complete agent configuration');
      return;
    }

    setIsGenerating(true);

    try {
      // Convert configuration to agent format
      const generatedAgents = validAgents.map((agent, index) => ({
        id: `config-agent-${index + 1}`,
        name: agent.name,
        age: agent.age,
        gender: agent.gender,
        photoDescription: `A professional headshot of ${agent.name}`,
        demographics: {
          age: agent.age,
          occupation: agent.occupation,
          income_range: agent.income,
          location: agent.location,
          education: agent.education,
          family_status: 'Not specified',
          tech_savviness: agent.techSavviness,
          english_literacy: 'Fluent'
        },
        bio: `${agent.name} is a ${agent.occupation} based in ${agent.location}. ${agent.personality.toLowerCase()} professional with ${agent.techSavviness.toLowerCase()} technical skills.`,
        personality: agent.personality,
        uniqueTraits: [`${agent.personality} approach`, 'Goal-oriented'],
        specificNeeds: agent.goals,
        quote: agent.quote || `"I need solutions that help me achieve my goals efficiently."`,
        status: 'ACTIVE',
        source: 'Configuration Based',
        goals: agent.goals,
        painPoints: agent.painPoints,
        behaviors: [`${agent.personality} decision making`, 'Focused on results'],
        preferences: ['Clear communication', 'Efficient processes'],
        communication_style: agent.personality === 'Analytical' ? 'Data-driven' : 'Direct',
        techSavviness: agent.techSavviness,
        background: {
          education: agent.education,
          work_experience: agent.occupation,
          family: 'Not specified',
          lifestyle: agent.location
        }
      }));

      onAgentsGenerated(generatedAgents);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating agents:', error);
      alert('Failed to generate agents. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <Settings className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configuration-Based Agent Creation</h3>
            <p className="text-sm text-gray-600">Manually configure AI agents with specific attributes and characteristics</p>
          </div>
        </div>

        <div className="space-y-6">
          {agents.map((agent, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Agent {index + 1}</h4>
                {agents.length > 1 && (
                  <button
                    onClick={() => removeAgent(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={agent.name}
                      onChange={(e) => updateAgent(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Elizabeth Soto"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input
                        type="number"
                        value={agent.age}
                        onChange={(e) => updateAgent(index, 'age', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="18"
                        max="80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        value={agent.gender}
                        onChange={(e) => updateAgent(index, 'gender', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Occupation *</label>
                    <input
                      type="text"
                      value={agent.occupation}
                      onChange={(e) => updateAgent(index, 'occupation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Director of Critical Care"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                    <select
                      value={agent.education}
                      onChange={(e) => updateAgent(index, 'education', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="High School">High School</option>
                      <option value="Bachelor's Degree">Bachelor's Degree</option>
                      <option value="Master's Degree">Master's Degree</option>
                      <option value="Doctorate">Doctorate</option>
                      <option value="Professional Certification">Professional Certification</option>
                    </select>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <input
                      type="text"
                      value={agent.location}
                      onChange={(e) => updateAgent(index, 'location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., United States"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Income Range</label>
                    <select
                      value={agent.income}
                      onChange={(e) => updateAgent(index, 'income', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="₹25,000-₹40,000">₹25,000-₹40,000</option>
                      <option value="₹40,000-₹60,000">₹40,000-₹60,000</option>
                      <option value="₹50,000-₹75,000">₹50,000-₹75,000</option>
                      <option value="₹75,000-₹1,00,000">₹75,000-₹1,00,000</option>
                      <option value="₹1,00,000+">₹1,00,000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tech Savviness</label>
                    <select
                      value={agent.techSavviness}
                      onChange={(e) => updateAgent(index, 'techSavviness', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Personality</label>
                    <select
                      value={agent.personality}
                      onChange={(e) => updateAgent(index, 'personality', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Analytical">Analytical</option>
                      <option value="Creative">Creative</option>
                      <option value="Practical">Practical</option>
                      <option value="Strategic">Strategic</option>
                      <option value="Collaborative">Collaborative</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Goals and Pain Points */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                  <div className="space-y-2">
                    {agent.goals.map((goal, goalIndex) => (
                      <div key={goalIndex} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700 flex-1">{goal}</span>
                        <button
                          onClick={() => removeArrayItem(index, 'goals', goalIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add a goal..."
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addArrayItem(index, 'goals', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pain Points</label>
                  <div className="space-y-2">
                    {agent.painPoints.map((painPoint, painIndex) => (
                      <div key={painIndex} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700 flex-1">{painPoint}</span>
                        <button
                          onClick={() => removeArrayItem(index, 'painPoints', painIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add a pain point..."
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addArrayItem(index, 'painPoints', e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
                <textarea
                  value={agent.quote}
                  onChange={(e) => updateAgent(index, 'quote', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="e.g., 'I want to be a high performer and a go-to leader for my team.'"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add Agent Button */}
        <div className="mt-6">
          <button
            onClick={addAgent}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another Agent</span>
          </button>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={generateAgents}
            disabled={isGenerating}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-colors ${
              isGenerating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Generating Agents...</span>
              </>
            ) : (
              <>
                <Users className="w-5 h-5" />
                <span>Generate {agents.length} AI Agents from Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationBasedAgentCreator;
