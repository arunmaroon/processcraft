import React from 'react';
import { 
  MessageCircle, 
  Power, 
  Trash2, 
  MapPin,
  Briefcase,
  GraduationCap,
  User,
  Calendar,
  ChevronRight
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  education: string;
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

interface CleanAgentCardProps {
  agent: Agent;
  onSleep: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  onChat: (agentId: string) => void;
  onClick: (agentId: string) => void;
}

const CleanAgentCard: React.FC<CleanAgentCardProps> = ({
  agent,
  onSleep,
  onDelete,
  onChat,
  onClick
}) => {
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
    if (category.includes('Starter')) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => onClick(agent.id)}
    >
      {/* Header with prominent info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {agent.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span>{agent.age} years old</span>
                <span>•</span>
                <span>{agent.gender}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTechSavvinessColor(agent.techSavviness)}`}>
              {agent.techSavviness}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Occupation</p>
              <p className="text-sm font-medium text-gray-900">{agent.occupation}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Location</p>
              <p className="text-sm font-medium text-gray-900">{agent.location}</p>
            </div>
          </div>
        </div>

        {/* Quote Preview */}
        <div className="bg-gray-50 rounded-lg p-2 mb-3">
          <p className="text-xs text-gray-600 italic">
            "{agent.quote.length > 80 ? agent.quote.substring(0, 80) + '...' : agent.quote}"
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChat(agent.id);
            }}
            className="flex items-center space-x-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Chat</span>
          </button>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSleep(agent.id);
              }}
              className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
              title={agent.status === 'SLEEPING' ? 'Wake Agent' : 'Sleep Agent'}
            >
              <Power className={`w-3 h-3 ${agent.status === 'SLEEPING' ? 'text-yellow-600' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(agent.id);
              }}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete Agent"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanAgentCard;
