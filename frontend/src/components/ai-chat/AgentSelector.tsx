import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Check, 
  Users, 
  Brain,
  Heart,
  Shield,
  Zap,
  Star,
  Filter
} from 'lucide-react';
import { HumanAgent } from './AIChatTab';

interface AgentSelectorProps {
  availableAgents: HumanAgent[];
  selectedAgents: HumanAgent[];
  maxAgents: number;
  onSelect: (agents: HumanAgent[]) => void;
  onClose: () => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({
  availableAgents,
  selectedAgents,
  maxAgents,
  onSelect,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTrait, setFilterTrait] = useState<string | null>(null);
  const [filterTechLevel, setFilterTechLevel] = useState<string | null>(null);

  const filteredAgents = availableAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.background.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.background.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTrait = !filterTrait || agent.personality.traits.includes(filterTrait);
    
    const matchesTechLevel = !filterTechLevel || agent.personality.techSavviness === filterTechLevel;
    
    return matchesSearch && matchesTrait && matchesTechLevel;
  });

  const handleAgentToggle = (agent: HumanAgent) => {
    const isSelected = selectedAgents.some(selected => selected.id === agent.id);
    
    if (isSelected) {
      onSelect(selectedAgents.filter(selected => selected.id !== agent.id));
    } else if (selectedAgents.length < maxAgents) {
      onSelect([...selectedAgents, agent]);
    }
  };

  const getPersonalityIcon = (traits: string[]) => {
    if (traits.includes('analytical')) return <Brain className="w-4 h-4 text-blue-500" />;
    if (traits.includes('caring')) return <Heart className="w-4 h-4 text-red-500" />;
    if (traits.includes('cautious')) return <Shield className="w-4 h-4 text-yellow-500" />;
    if (traits.includes('innovative')) return <Zap className="w-4 h-4 text-purple-500" />;
    return <Star className="w-4 h-4 text-gray-500" />;
  };

  const getTechLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-blue-600 bg-blue-100';
      case 'expert': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEnglishLevelColor = (level: string) => {
    switch (level) {
      case 'basic': return 'text-orange-600 bg-orange-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'fluent': return 'text-blue-600 bg-blue-100';
      case 'native': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const allTraits = Array.from(new Set(availableAgents.flatMap(agent => agent.personality.traits)));
  const allTechLevels = Array.from(new Set(availableAgents.map(agent => agent.personality.techSavviness)));

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Select AI Agents</h3>
              <span className="text-sm text-gray-500">
                ({selectedAgents.length}/{maxAgents} selected)
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search agents by name, occupation, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterTrait || ''}
                onChange={(e) => setFilterTrait(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Traits</option>
                {allTraits.map(trait => (
                  <option key={trait} value={trait}>{trait}</option>
                ))}
              </select>
              <select
                value={filterTechLevel || ''}
                onChange={(e) => setFilterTechLevel(e.target.value || null)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Tech Levels</option>
                {allTechLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => {
              const isSelected = selectedAgents.some(selected => selected.id === agent.id);
              const canSelect = !isSelected && selectedAgents.length < maxAgents;
              
              return (
                <div
                  key={agent.id}
                  onClick={() => handleAgentToggle(agent)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : canSelect
                      ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-3xl">{agent.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {agent.name}
                        </h4>
                        {isSelected && (
                          <Check className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {agent.background.occupation} • {agent.background.age} years
                      </p>
                      
                      <p className="text-sm text-gray-500 mb-3">
                        {agent.background.location}
                      </p>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        {getPersonalityIcon(agent.personality.traits)}
                        <span className="text-xs text-gray-600">
                          {agent.personality.traits.slice(0, 2).join(', ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTechLevelColor(agent.personality.techSavviness)}`}>
                          {agent.personality.techSavviness} tech
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnglishLevelColor(agent.personality.englishLevel)}`}>
                          {agent.personality.englishLevel} English
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <p className="truncate">{agent.background.experience}</p>
                        <p className="truncate">Goals: {agent.background.goals.slice(0, 2).join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedAgents.length === 0 ? (
                'No agents selected'
              ) : (
                `Selected: ${selectedAgents.map(agent => agent.name).join(', ')}`
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onSelect(selectedAgents)}
                disabled={selectedAgents.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentSelector;



