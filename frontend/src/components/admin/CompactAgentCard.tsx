import React, { useState } from 'react';
import { 
  User, 
  MessageCircle, 
  Power, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Briefcase,
  DollarSign,
  Smartphone
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  location: string;
  income: string;
  techSavviness: string;
  category: string;
  bio: string;
  personality?: string;
  uniqueTraits?: string[];
  specificNeeds?: string[];
  quote: string;
  status?: 'ACTIVE' | 'SLEEPING';
}

interface CompactAgentCardProps {
  agent: Agent;
  onSleep: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  onChat: (agentId: string) => void;
}

const CompactAgentCard: React.FC<CompactAgentCardProps> = ({
  agent,
  onSleep,
  onDelete,
  onChat
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTechSavvinessColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('CAT A')) return 'text-blue-600 bg-blue-50';
    if (category.includes('CAT B')) return 'text-purple-600 bg-purple-50';
    if (category.includes('CAT C')) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Compact Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {agent.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">{agent.name}</h3>
              <p className="text-xs text-gray-500">{agent.occupation}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTechSavvinessColor(agent.techSavviness)}`}>
              {agent.techSavviness}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{agent.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="w-3 h-3" />
            <span>{agent.income}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Smartphone className="w-3 h-3" />
            <span>{agent.age} years</span>
          </div>
        </div>

        {/* Quote Preview */}
        <div className="mt-2 text-xs text-gray-600 italic">
          "{agent.quote.length > 60 ? agent.quote.substring(0, 60) + '...' : agent.quote}"
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="space-y-3">
            {/* Category */}
            <div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(agent.category)}`}>
                {agent.category}
              </span>
            </div>

            {/* Bio */}
            <div>
              <h4 className="text-xs font-medium text-gray-700 mb-1">About</h4>
              <p className="text-xs text-gray-600">{agent.bio}</p>
            </div>

            {/* Personality */}
            {agent.personality && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Personality</h4>
                <p className="text-xs text-gray-600">{agent.personality}</p>
              </div>
            )}

            {/* Unique Traits */}
            {agent.uniqueTraits && agent.uniqueTraits.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Unique Traits</h4>
                <div className="flex flex-wrap gap-1">
                  {agent.uniqueTraits.slice(0, 3).map((trait, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {trait}
                    </span>
                  ))}
                  {agent.uniqueTraits.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{agent.uniqueTraits.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Specific Needs */}
            {agent.specificNeeds && agent.specificNeeds.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Specific Needs</h4>
                <div className="flex flex-wrap gap-1">
                  {agent.specificNeeds.slice(0, 2).map((need, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {need}
                    </span>
                  ))}
                  {agent.specificNeeds.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{agent.specificNeeds.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onChat(agent.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Chat</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onSleep(agent.id)}
                  className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
                  title={agent.status === 'SLEEPING' ? 'Wake Agent' : 'Sleep Agent'}
                >
                  <Power className={`w-4 h-4 ${agent.status === 'SLEEPING' ? 'text-yellow-600' : ''}`} />
                </button>
                <button
                  onClick={() => onDelete(agent.id)}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Agent"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactAgentCard;
