import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Eye, 
  MoreVertical, 
  Trash2, 
  Moon, 
  Sun,
  User,
  X
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  age: number;
  occupation: string;
  status: 'ACTIVE' | 'SLEEPING' | 'DELETED';
  tech_savviness: string;
  english_literacy: string;
  confidence: number;
  avatar?: string;
  bio?: string;
  goals?: string[];
  painPoints?: string[];
  behaviors?: string[];
}

interface AgentGridProps {
  agents: Agent[];
  onSelectAgent?: (agent: Agent) => void;
  onDeleteAgent?: (agentId: string) => void;
  onAgentStatusChange?: (agentId: string, status: string) => void;
}

const AgentGrid: React.FC<AgentGridProps> = ({ 
  agents, 
  onSelectAgent, 
  onDeleteAgent, 
  onAgentStatusChange 
}) => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500';
      case 'sleeping':
        return 'bg-amber-500';
      case 'deleted':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getTechLevelColor = (level: string) => {
    const normalized = (level || '').toLowerCase();
    if (['high', 'advanced'].includes(normalized)) return 'bg-green-100 text-green-800';
    if (['medium', 'intermediate'].includes(normalized)) return 'bg-blue-100 text-blue-800';
    if (['basic', 'low', 'beginner'].includes(normalized)) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowDetailView(true);
    if (onSelectAgent) {
      onSelectAgent(agent);
    }
  };

  const handleChatClick = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Starting chat with:', agent.name);
    // Implement chat functionality
  };

  const handleStatusToggle = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = agent.status === 'ACTIVE' ? 'SLEEPING' : 'ACTIVE';
    if (onAgentStatusChange) {
      onAgentStatusChange(agent.id, newStatus);
    }
  };

  const handleDelete = (agent: Agent, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteAgent) {
      onDeleteAgent(agent.id);
    }
  };

  const toggleMenu = (agentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === agentId ? null : agentId);
  };

  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Agents Found</h3>
        <p className="text-gray-600">Generate some agents to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleAgentClick(agent)}
          >
            {/* Agent Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(agent.status)}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-600">{agent.age} years old</p>
                  </div>
                </div>
                
                {/* Action Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => toggleMenu(agent.id, e)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {openMenuId === agent.id && (
                    <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="py-2">
                        <button
                          onClick={(e) => handleChatClick(agent, e)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Start Chat</span>
                        </button>
                        <button
                          onClick={(e) => handleStatusToggle(agent, e)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                        >
                          {agent.status === 'ACTIVE' ? (
                            <>
                              <Moon className="w-4 h-4" />
                              <span>Put to Sleep</span>
                            </>
                          ) : (
                            <>
                              <Sun className="w-4 h-4" />
                              <span>Wake Up</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDelete(agent, e)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Details */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{agent.occupation}</p>
                  <p className="text-xs text-gray-500">Occupation</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTechLevelColor(agent.tech_savviness)}`}>
                      {agent.tech_savviness || 'Unknown'} Tech
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{Math.round(agent.confidence * 100)}%</p>
                    <p className="text-xs text-gray-500">Confidence</p>
                  </div>
                </div>

                {agent.bio && (
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-2">{agent.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={(e) => handleChatClick(agent, e)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAgentClick(agent);
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  agent.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                  agent.status === 'SLEEPING' ? 'bg-amber-100 text-amber-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {agent.status}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail View Modal */}
      {showDetailView && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedAgent.name}</h2>
                <button
                  onClick={() => setShowDetailView(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Age</p>
                    <p className="text-lg text-gray-900">{selectedAgent.age}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Occupation</p>
                    <p className="text-lg text-gray-900">{selectedAgent.occupation}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tech Savviness</p>
                    <p className="text-lg text-gray-900">{selectedAgent.tech_savviness}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">English Literacy</p>
                    <p className="text-lg text-gray-900">{selectedAgent.english_literacy}</p>
                  </div>
                </div>

                {selectedAgent.goals && selectedAgent.goals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Goals</h3>
                    <ul className="space-y-2">
                      {selectedAgent.goals.map((goal, index) => (
                        <li key={index} className="text-gray-700">• {goal}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedAgent.painPoints && selectedAgent.painPoints.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pain Points</h3>
                    <ul className="space-y-2">
                      {selectedAgent.painPoints.map((painPoint, index) => (
                        <li key={index} className="text-gray-700">• {painPoint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedAgent.behaviors && selectedAgent.behaviors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Behaviors</h3>
                    <ul className="space-y-2">
                      {selectedAgent.behaviors.map((behavior, index) => (
                        <li key={index} className="text-gray-700">• {behavior}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentGrid;
