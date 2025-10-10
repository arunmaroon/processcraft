import React from 'react';
import { 
  Users, 
  MessageSquare, 
  RefreshCw, 
  Clock, 
  Brain,
  Heart,
  Zap,
  Shield
} from 'lucide-react';
import { Agent } from './AIAgentChatTab';

interface AgentGridProps {
  agents: Agent[];
  isLoading: boolean;
  onAgentSelect: (agent: Agent) => void;
  onRefresh: () => void;
}

const AgentGrid: React.FC<AgentGridProps> = ({ 
  agents, 
  isLoading, 
  onAgentSelect, 
  onRefresh 
}) => {
  const getPersonalityIcon = (traits: string[]) => {
    if (traits.includes('enthusiastic') || traits.includes('confident')) {
      return <Heart className="w-4 h-4 text-red-500" />;
    } else if (traits.includes('cautious') || traits.includes('thoughtful')) {
      return <Shield className="w-4 h-4 text-yellow-500" />;
    } else if (traits.includes('friendly') || traits.includes('polite')) {
      return <Brain className="w-4 h-4 text-blue-500" />;
    }
    return <Zap className="w-4 h-4 text-gray-500" />;
  };

  const getTechLevelColor = (level: number) => {
    if (level < 3) return 'text-red-600 bg-red-100';
    if (level < 6) return 'text-yellow-600 bg-yellow-100';
    if (level < 8) return 'text-blue-600 bg-blue-100';
    return 'text-green-600 bg-green-100';
  };

  const getTechLevelLabel = (level: number) => {
    if (level < 3) return 'Low';
    if (level < 6) return 'Medium';
    if (level < 8) return 'High';
    return 'Expert';
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading AI agents...</p>
        </div>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Agents Yet</h3>
          <p className="text-gray-500 mb-4">
            Upload user research transcripts to create realistic AI agents
          </p>
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Agents</h3>
            <p className="text-sm text-gray-500">
              {agents.length} agents created from user research transcripts
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            title="Refresh agents"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => onAgentSelect(agent)}
            >
              {/* Agent Avatar and Basic Info */}
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={agent.avatar_url}
                      alt={agent.name}
                      className="w-16 h-16 rounded-full border-2 border-gray-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {agent.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {agent.age} years old • {agent.occupation}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {agent.category}
                    </p>
                  </div>
                </div>

                {/* Personality Traits */}
                <div className="mt-4 flex items-center space-x-2">
                  {getPersonalityIcon(agent.personality_traits)}
                  <div className="flex flex-wrap gap-1">
                    {agent.personality_traits.slice(0, 3).map((trait, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Comfort Level */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">Tech Comfort</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getTechLevelColor(agent.tech_comfort)}`}>
                      {getTechLevelLabel(agent.tech_comfort)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(agent.tech_comfort / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Real Quotes Preview */}
                {agent.real_quotes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Sample Quotes:</p>
                    <div className="space-y-1">
                      {agent.real_quotes.slice(0, 2).map((quote, index) => (
                        <p key={index} className="text-xs text-gray-600 italic">
                          "{quote.length > 80 ? quote.substring(0, 80) + '...' : quote}"
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>
                    Created {new Date(agent.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Chat Button */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg group-hover:bg-green-50 group-hover:border-green-200 transition-colors">
                <div className="flex items-center justify-center space-x-2 text-green-600 group-hover:text-green-700">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">Start Chat</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Each agent is created from real user research transcripts and replicates authentic speech patterns, 
            personality traits, and behavioral characteristics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentGrid;



