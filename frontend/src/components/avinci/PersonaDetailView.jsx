import React from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Avatar, Button } from './design-system';

const PersonaDetailView = ({ agent, onClose, onChat }) => {
  if (!agent) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGaugeColor = (level) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                    <img
                      src={agent.avatar_url || agent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name || 'Persona')}&background=random&color=fff&size=200`}
                      alt={agent.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                      onError={(e) => {
                        if (agent.demographics?.gender) {
                          const gender = agent.demographics.gender.toLowerCase().includes('male') ? 'men' : 'women';
                          e.target.src = `https://randomuser.me/api/portraits/${gender}/${Math.floor(Math.random() * 99) + 1}.jpg`;
                        } else {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name || 'Persona')}&background=random&color=fff&size=200`;
                        }
                      }}
                    />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
                <p className="text-lg text-gray-600 font-medium">{agent.role_title}</p>
                <p className="text-sm text-gray-500">{agent.company} • {agent.location}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-600">Age: {agent.age} years</span>
                  <span className="text-sm text-gray-600">Education: {agent.education}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="primary"
                onClick={() => onChat(agent)}
                className="px-6"
              >
                Start Chat
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="px-4"
              >
                Close
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Quote */}
          {agent.quote && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <blockquote className="text-lg italic text-gray-700">
                "{agent.quote}"
              </blockquote>
            </Card>
          )}

          {/* Demographics */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Demographics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {agent.demographics?.age && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{agent.demographics.age}</div>
                  <div className="text-sm text-gray-600">Age</div>
                </div>
              )}
              {agent.demographics?.gender && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">{agent.demographics.gender}</div>
                  <div className="text-sm text-gray-600">Gender</div>
                </div>
              )}
              {agent.demographics?.education && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">{agent.demographics.education}</div>
                  <div className="text-sm text-gray-600">Education</div>
                </div>
              )}
              {agent.demographics?.income_range && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">{agent.demographics.income_range}</div>
                  <div className="text-sm text-gray-600">Income</div>
                </div>
              )}
            </div>
          </div>

          {/* Gauges */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Domain Literacy</span>
                  <span className="text-sm text-gray-500 capitalize">{agent.gauges?.domain || agent.domain_literacy?.level}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getGaugeColor(agent.gauges?.domain || agent.domain_literacy?.level)}`}
                    style={{ width: `${(agent.gauges?.domain || agent.domain_literacy?.level) === 'high' ? 100 : (agent.gauges?.domain || agent.domain_literacy?.level) === 'medium' ? 60 : 30}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">English Literacy</span>
                  <span className="text-sm text-gray-500 capitalize">{agent.gauges?.english_literacy}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getGaugeColor(agent.gauges?.english_literacy)}`}
                    style={{ width: `${agent.gauges?.english_literacy === 'high' ? 100 : agent.gauges?.english_literacy === 'medium' ? 60 : 30}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Tech Savviness</span>
                  <span className="text-sm text-gray-500 capitalize">{agent.gauges?.tech || agent.tech_savviness}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getGaugeColor(agent.gauges?.tech || agent.tech_savviness)}`}
                    style={{ width: `${(agent.gauges?.tech || agent.tech_savviness) === 'high' ? 100 : (agent.gauges?.tech || agent.tech_savviness) === 'medium' ? 60 : 30}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Communication</span>
                  <span className="text-sm text-gray-500 capitalize">{agent.gauges?.comms || agent.communication_style?.sentence_length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getGaugeColor((agent.gauges?.comms || agent.communication_style?.sentence_length) === 'long' ? 'high' : (agent.gauges?.comms || agent.communication_style?.sentence_length) === 'medium' ? 'medium' : 'low')}`}
                    style={{ width: `${(agent.gauges?.comms || agent.communication_style?.sentence_length) === 'long' ? 100 : (agent.gauges?.comms || agent.communication_style?.sentence_length) === 'medium' ? 60 : 30}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Objectives & Needs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Objectives</h2>
              <div className="space-y-2">
                {agent.objectives?.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Needs</h2>
              <div className="space-y-2">
                {agent.needs?.map((need, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{need}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fears & Apprehensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Fears</h2>
              <div className="space-y-2">
                {agent.fears?.map((fear, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">{fear}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Apprehensions</h2>
              <div className="space-y-2">
                {agent.apprehensions?.map((apprehension, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">{apprehension}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Communication Style */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Communication Style</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Speech Patterns</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Formality:</span> {agent.communication_style?.formality}/10</div>
                  <div><span className="font-medium">Sentence Length:</span> {agent.communication_style?.sentence_length}</div>
                  <div><span className="font-medium">Question Style:</span> {agent.communication_style?.question_style}</div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Vocabulary</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Complexity:</span> {agent.vocabulary_profile?.complexity}/10</div>
                  <div><span className="font-medium">Common Words:</span> {(agent.vocabulary_profile?.common_words || []).slice(0, 3).join(', ')}</div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Emotional Profile</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Baseline:</span> {agent.emotional_profile?.baseline}</div>
                  <div><span className="font-medium">Patience:</span> {agent.cognitive_profile?.patience}/10</div>
                </div>
              </div>
            </div>
          </div>

          {/* Knowledge Bounds */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Knowledge Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-green-700 mb-2">Confident</h3>
                <div className="space-y-1">
                  {(agent.knowledge_bounds?.confident || []).map((topic, index) => (
                    <Badge key={index} variant="success" size="sm">{topic}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-yellow-700 mb-2">Partial Knowledge</h3>
                <div className="space-y-1">
                  {(agent.knowledge_bounds?.partial || []).map((topic, index) => (
                    <Badge key={index} variant="warning" size="sm">{topic}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-red-700 mb-2">Unknown</h3>
                <div className="space-y-1">
                  {(agent.knowledge_bounds?.unknown || []).map((topic, index) => (
                    <Badge key={index} variant="error" size="sm">{topic}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Master System Prompt */}
          {agent.master_system_prompt && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Persona Instructions</h2>
              <Card className="bg-gray-50">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {agent.master_system_prompt}
                </pre>
              </Card>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PersonaDetailView;
