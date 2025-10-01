import React, { useState } from 'react';
import { Plus, Minus, Settings, Users, Brain, Target } from 'lucide-react';
import { Range } from 'react-range';

interface AgentFactoryProps {
  onGenerateAgents: (criteria: any) => void;
  isGenerating: boolean;
}

interface GenerationCriteria {
  demographics: {
    age: { min: number; max: number };
    income: { min: number; max: number };
    education: string;
    occupation: string;
    location: string;
    family_status: string;
  };
  behavioral: {
    personality_traits: string[];
    communication_style: string;
    risk_tolerance: string;
    tech_comfort: string;
    decision_making: string;
  };
  psychological: {
    motivations: string[];
    fears: string[];
    values: string[];
    aspirations: string[];
  };
  financial: {
    credit_profile: string;
    banking_behavior: string;
    investment_style: string;
    spending_patterns: string;
  };
  sample_size: number;
  quality_threshold: number;
}

const AgentFactory: React.FC<AgentFactoryProps> = ({ onGenerateAgents, isGenerating }) => {
  const [criteria, setCriteria] = useState<GenerationCriteria>({
    demographics: {
      age: { min: 25, max: 45 },
      income: '',
      education: '',
      occupation: '',
      location: '',
      family_status: ''
    },
    behavioral: {
      personality_traits: [],
      communication_style: '',
      risk_tolerance: '',
      tech_comfort: '',
      decision_making: ''
    },
    psychological: {
      motivations: [],
      fears: [],
      values: [],
      aspirations: []
    },
    financial: {
      credit_profile: '',
      banking_behavior: '',
      investment_style: '',
      spending_patterns: ''
    },
    sample_size: 5,
    quality_threshold: 0.8
  });

  const [activeTab, setActiveTab] = useState<'demographics' | 'behavioral' | 'psychological' | 'financial'>('demographics');

  const incomeRanges = [
    'under-5L', '5L-10L', '10L-15L', '15L-20L', '20L-25L', 
    '25L-30L', '30L-40L', '40L-50L', '50L-75L', '75L+'
  ];

  const educationLevels = [
    'School', 'Graduate', 'Post-Graduate', 'Professional', 'Technical'
  ];

  const occupations = [
    'Salaried',
    'Business'
  ];

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Tier-2 City', 'Tier-3 City', 'Rural'
  ];

  const familyStatuses = [
    'Single', 'Married', 'Divorced', 'Widowed', 'Joint Family', 'Nuclear Family'
  ];

  const personalityTraits = [
    'Open-minded', 'Conscientious', 'Extraverted', 'Agreeable', 'Neurotic',
    'Analytical', 'Creative', 'Practical', 'Optimistic', 'Cautious'
  ];

  const communicationStyles = [
    'Direct', 'Detailed', 'Emotional', 'Logical', 'Visual', 'Auditory'
  ];

  const riskTolerances = [
    'Very Low', 'Low', 'Medium', 'High', 'Very High'
  ];

  const techComforts = [
    'Digital Native', 'Comfortable', 'Basic', 'Assisted', 'Offline-first'
  ];

  const decisionMakings = [
    'Analytical', 'Intuitive', 'Collaborative', 'Independent', 'Risk-averse'
  ];

  const motivations = [
    'Financial Security', 'Career Growth', 'Family Well-being', 'Personal Growth',
    'Social Recognition', 'Work-Life Balance', 'Innovation', 'Stability'
  ];

  const fears = [
    'Financial Loss', 'Job Insecurity', 'Health Issues', 'Technology Change',
    'Social Isolation', 'Failure', 'Uncertainty', 'Privacy Breach'
  ];

  const values = [
    'Honesty', 'Integrity', 'Family', 'Success', 'Security', 'Freedom',
    'Innovation', 'Tradition', 'Community', 'Independence'
  ];

  const aspirations = [
    'Early Retirement', 'Home Ownership', 'Business Success', 'Travel',
    'Education', 'Health & Fitness', 'Creative Pursuits', 'Social Impact'
  ];

  const creditProfiles = [
    'First-time', 'Good History', 'Defaults', 'No Credit', 'Rebuilding'
  ];

  const bankingBehaviors = [
    'Conservative', 'Moderate', 'Aggressive', 'Impulsive', 'Analytical'
  ];

  const investmentStyles = [
    'Conservative', 'Balanced', 'Aggressive', 'Speculative', 'Passive'
  ];

  const spendingPatterns = [
    'Frugal', 'Moderate', 'Generous', 'Impulsive', 'Planned'
  ];

  const handleDemographicChange = (field: keyof typeof criteria.demographics, value: any) => {
    setCriteria(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        [field]: value
      }
    }));
  };

  const handleBehavioralChange = (field: keyof typeof criteria.behavioral, value: any) => {
    setCriteria(prev => ({
      ...prev,
      behavioral: {
        ...prev.behavioral,
        [field]: value
      }
    }));
  };

  const handlePsychologicalChange = (field: keyof typeof criteria.psychological, value: any) => {
    setCriteria(prev => ({
      ...prev,
      psychological: {
        ...prev.psychological,
        [field]: value
      }
    }));
  };

  const handleFinancialChange = (field: keyof typeof criteria.financial, value: any) => {
    setCriteria(prev => ({
      ...prev,
      financial: {
        ...prev.financial,
        [field]: value
      }
    }));
  };

  const handleArrayChange = (category: keyof typeof criteria, field: string, value: string, checked: boolean) => {
    setCriteria(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof criteria],
        [field]: checked
          ? [...(prev[category as keyof typeof criteria] as any)[field], value]
          : (prev[category as keyof typeof criteria] as any)[field].filter((item: string) => item !== value)
      }
    }));
  };

  const handleGenerate = () => {
    onGenerateAgents(criteria);
  };

  const renderDemographicsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={criteria.demographics.age.min}
              onChange={(e) => handleDemographicChange('age', { ...criteria.demographics.age, min: parseInt(e.target.value) })}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="18"
              max="80"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              value={criteria.demographics.age.max}
              onChange={(e) => handleDemographicChange('age', { ...criteria.demographics.age, max: parseInt(e.target.value) })}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="18"
              max="80"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Income Range</label>
          <select
            value={criteria.demographics.income}
            onChange={(e) => handleDemographicChange('income', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Income Range</option>
            {incomeRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
          <select
            value={criteria.demographics.education}
            onChange={(e) => handleDemographicChange('education', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Education Level</option>
            {educationLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
          <select
            value={criteria.demographics.occupation}
            onChange={(e) => handleDemographicChange('occupation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Occupation</option>
            {occupations.map(occupation => (
              <option key={occupation} value={occupation}>{occupation}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <select
            value={criteria.demographics.location}
            onChange={(e) => handleDemographicChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Location</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Family Status</label>
          <select
            value={criteria.demographics.family_status}
            onChange={(e) => handleDemographicChange('family_status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Family Status</option>
            {familyStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderBehavioralTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Personality Traits</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {personalityTraits.map(trait => (
            <label key={trait} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={criteria.behavioral.personality_traits.includes(trait)}
                onChange={(e) => handleArrayChange('behavioral', 'personality_traits', trait, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{trait}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Communication Style</label>
          <select
            value={criteria.behavioral.communication_style}
            onChange={(e) => handleBehavioralChange('communication_style', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Communication Style</option>
            {communicationStyles.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Risk Tolerance</label>
          <select
            value={criteria.behavioral.risk_tolerance}
            onChange={(e) => handleBehavioralChange('risk_tolerance', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Risk Tolerance</option>
            {riskTolerances.map(tolerance => (
              <option key={tolerance} value={tolerance}>{tolerance}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tech Comfort</label>
          <select
            value={criteria.behavioral.tech_comfort}
            onChange={(e) => handleBehavioralChange('tech_comfort', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Tech Comfort</option>
            {techComforts.map(comfort => (
              <option key={comfort} value={comfort}>{comfort}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Decision Making</label>
          <select
            value={criteria.behavioral.decision_making}
            onChange={(e) => handleBehavioralChange('decision_making', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Decision Making Style</option>
            {decisionMakings.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderPsychologicalTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Motivations</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {motivations.map(motivation => (
            <label key={motivation} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={criteria.psychological.motivations.includes(motivation)}
                onChange={(e) => handleArrayChange('psychological', 'motivations', motivation, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{motivation}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fears</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {fears.map(fear => (
            <label key={fear} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={criteria.psychological.fears.includes(fear)}
                onChange={(e) => handleArrayChange('psychological', 'fears', fear, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{fear}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Values</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {values.map(value => (
            <label key={value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={criteria.psychological.values.includes(value)}
                onChange={(e) => handleArrayChange('psychological', 'values', value, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{value}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Aspirations</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {aspirations.map(aspiration => (
            <label key={aspiration} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={criteria.psychological.aspirations.includes(aspiration)}
                onChange={(e) => handleArrayChange('psychological', 'aspirations', aspiration, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{aspiration}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Credit Profile</label>
          <select
            value={criteria.financial.credit_profile}
            onChange={(e) => handleFinancialChange('credit_profile', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Credit Profile</option>
            {creditProfiles.map(profile => (
              <option key={profile} value={profile}>{profile}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Banking Behavior</label>
          <select
            value={criteria.financial.banking_behavior}
            onChange={(e) => handleFinancialChange('banking_behavior', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Banking Behavior</option>
            {bankingBehaviors.map(behavior => (
              <option key={behavior} value={behavior}>{behavior}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Investment Style</label>
          <select
            value={criteria.financial.investment_style}
            onChange={(e) => handleFinancialChange('investment_style', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Investment Style</option>
            {investmentStyles.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Spending Patterns</label>
          <select
            value={criteria.financial.spending_patterns}
            onChange={(e) => handleFinancialChange('spending_patterns', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Spending Patterns</option>
            {spendingPatterns.map(pattern => (
              <option key={pattern} value={pattern}>{pattern}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Agent Factory</h2>
        <p className="text-gray-600">Configure criteria for AI agent generation</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'demographics', label: 'Demographics', icon: Users },
          { id: 'behavioral', label: 'Behavioral', icon: Brain },
          { id: 'psychological', label: 'Psychological', icon: Target },
          { id: 'financial', label: 'Financial', icon: Settings }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'demographics' && renderDemographicsTab()}
        {activeTab === 'behavioral' && renderBehavioralTab()}
        {activeTab === 'psychological' && renderPsychologicalTab()}
        {activeTab === 'financial' && renderFinancialTab()}
      </div>

      {/* Generation Settings */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Generation Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sample Size</label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCriteria(prev => ({ ...prev, sample_size: Math.max(1, prev.sample_size - 1) }))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-lg font-medium w-12 text-center">{criteria.sample_size}</span>
              <button
                onClick={() => setCriteria(prev => ({ ...prev, sample_size: Math.min(50, prev.sample_size + 1) }))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality Threshold</label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.1"
              value={criteria.quality_threshold}
              onChange={(e) => setCriteria(prev => ({ ...prev, quality_threshold: parseFloat(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5</span>
              <span className="font-medium">{criteria.quality_threshold}</span>
              <span>1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Generating Agents...</span>
            </>
          ) : (
            <>
              <Users className="w-5 h-5" />
              <span>Generate Agents</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AgentFactory;
