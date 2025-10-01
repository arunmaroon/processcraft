import React, { useState, useEffect } from 'react';
import { Bot, Users, Target, Brain, CheckCircle, AlertCircle, Clock, Trash2, Eye, X } from 'lucide-react';

interface AIAgent {
  id: string;
  name: string;
  persona: string;
  demographics: {
    ageRange: [number, number];
    income: string;
    location: string;
    occupation: string;
    education?: string;
    familyStatus?: string;
  };
  behaviors: string[];
  preferences: string[];
  painPoints: string[];
  goals: string[];
  communicationStyle: string;
  techSavviness: string;
  confidence: number;
  tools?: string[];
  channels?: string[];
}

interface AgentDisplayProps {
  agents: AIAgent[];
  onAgentDelete?: (agentId: string) => void;
  onAgentView?: (agent: AIAgent) => void;
}

export default function AgentDisplay({ agents, onAgentDelete, onAgentView }: AgentDisplayProps) {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTechSavviness, setFilterTechSavviness] = useState<string>('ALL');

  const filteredAgents = (agents || []).filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.persona.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTech = filterTechSavviness === 'ALL' || agent.techSavviness === filterTechSavviness;
    return matchesSearch && matchesTech;
  });

  const getTechSavvinessColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Agents</h2>
        <p className="text-gray-600">AI-powered agents that mimic different user personas based on uploaded research data</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterTechSavviness}
          onChange={(e) => setFilterTechSavviness(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">All Tech Levels</option>
          <option value="High">High Tech Savviness</option>
          <option value="Medium">Medium Tech Savviness</option>
          <option value="Low">Low Tech Savviness</option>
        </select>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(filteredAgents || []).map((agent) => (
          <div key={agent.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{agent.demographics?.occupation}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTechSavvinessColor(agent.techSavviness)}`}>
                  {agent.techSavviness}
                </span>
                <span className={`text-sm font-medium ${getConfidenceColor(agent.confidence)}`}>
                  {Math.round(agent.confidence * 100)}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Persona</h4>
                <p className="text-sm text-gray-600">{agent.persona}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Demographics</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Age: {agent.demographics?.ageRange?.[0]}-{agent.demographics?.ageRange?.[1]}</p>
                  <p>Income: {agent.demographics?.income}</p>
                  <p>Location: {agent.demographics?.location}</p>
                  <p>Occupation: {agent.demographics?.occupation}</p>
                  {agent.demographics?.education && (
                    <p>Education: {agent.demographics.education}</p>
                  )}
                  {agent.demographics?.familyStatus && (
                    <p>Family: {agent.demographics.familyStatus}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Key Behaviors</h4>
                <div className="space-y-1">
                  {(agent.behaviors || []).slice(0, 3).map((behavior, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 flex-shrink-0"></span>
                      {behavior}
                    </div>
                  ))}
                  {agent.behaviors.length > 3 && (
                    <p className="text-xs text-gray-500">+{agent.behaviors.length - 3} more</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedAgent(agent)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  {onAgentDelete && (
                    <button
                      onClick={() => onAgentDelete(agent.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-600">
            {searchQuery || filterTechSavviness !== 'ALL' 
              ? 'Try adjusting your search or filter criteria'
              : 'Upload research data and process documents to generate AI agents'
            }
          </p>
        </div>
      )}

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedAgent.name}</h2>
                    <p className="text-gray-600">{selectedAgent.demographics?.occupation}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Persona */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Persona</h3>
                <p className="text-gray-700">{selectedAgent.persona}</p>
              </div>

              {/* Demographics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Demographics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Age Range</p>
                    <p className="text-gray-900">{selectedAgent.demographics?.ageRange?.[0]}-{selectedAgent.demographics?.ageRange?.[1]} years</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Income</p>
                    <p className="text-gray-900">{selectedAgent.demographics?.income}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Location</p>
                    <p className="text-gray-900">{selectedAgent.demographics?.location}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Occupation</p>
                    <p className="text-gray-900">{selectedAgent.demographics?.occupation}</p>
                  </div>
                  {selectedAgent.demographics?.education && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Education</p>
                      <p className="text-gray-900">{selectedAgent.demographics.education}</p>
                    </div>
                  )}
                  {selectedAgent.demographics?.familyStatus && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Family Status</p>
                      <p className="text-gray-900">{selectedAgent.demographics.familyStatus}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tools & Channels */}
              {(selectedAgent.tools || selectedAgent.channels) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tools & Channels</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedAgent.tools && selectedAgent.tools.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Tools They Use</p>
                        <div className="flex flex-wrap gap-2">
                          {(selectedAgent.tools || []).map((tool, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedAgent.channels && selectedAgent.channels.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Communication Channels</p>
                        <div className="flex flex-wrap gap-2">
                          {(selectedAgent.channels || []).map((channel, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                              {channel}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Behaviors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Behaviors</h3>
                <ul className="space-y-2">
                  {(selectedAgent.behaviors || []).map((behavior, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {behavior}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Preferences</h3>
                <ul className="space-y-2">
                  {(selectedAgent.preferences || []).map((preference, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {preference}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pain Points */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pain Points</h3>
                <ul className="space-y-2">
                  {(selectedAgent.painPoints || []).map((painPoint, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {painPoint}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Goals */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Goals</h3>
                <ul className="space-y-2">
                  {(selectedAgent.goals || []).map((goal, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Communication Style */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Communication Style</h3>
                <p className="text-gray-700">{selectedAgent.communicationStyle}</p>
              </div>

              {/* Tech Savviness */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tech Savviness</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTechSavvinessColor(selectedAgent.techSavviness)}`}>
                    {selectedAgent.techSavviness}
                  </span>
                  <span className={`text-sm font-medium ${getConfidenceColor(selectedAgent.confidence)}`}>
                    {Math.round(selectedAgent.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
