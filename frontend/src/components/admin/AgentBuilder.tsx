import { useState, useEffect } from 'react';
import { Bot, Settings, TestTube, CheckCircle, AlertCircle, Clock, Users, Filter, Search, FileText, Sparkles, Trash2, Moon, Play, Pause } from 'lucide-react';
import PersonaCard from './PersonaCard';
import EnhancedPersonaCard from './EnhancedPersonaCard';

interface AIAgent {
  id: string;
  name: string;
  persona: string;
  product: string;
  status: 'BUILDING' | 'ACTIVE' | 'ERROR' | 'TESTING' | 'SLEEPING';
  accuracy: number;
  responses: number;
  lastActive: string;
  personality: {
    communicationStyle: 'FORMAL' | 'CASUAL' | 'FRIENDLY' | 'PROFESSIONAL';
    responseLength: 'BRIEF' | 'MODERATE' | 'DETAILED';
    emotionalTone: 'NEUTRAL' | 'POSITIVE' | 'CONCERNED' | 'ENTHUSIASTIC';
    technicalLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  };
}

interface Persona {
  id: string;
  name: string;
  age: number;
  gender: string;
  photo: string;
  tagline: string;
  status?: 'ACTIVE' | 'SLEEPING' | 'DELETED';
  demographics: {
    age: number;
    occupation: string;
    income_range: string;
    location: string;
    education: string;
    family_status: string;
    tech_savviness: string;
    english_literacy: string;
  };
  experience: {
    level: string;
    context: string;
    device_preference: string;
    frequency: string;
  };
  goals: string[];
  concerns: string[];
  behaviors: string[];
  communication_style: string;
  preferences: string[];
  pain_points: string[];
  quote: string;
  confidence: number;
  background: {
    education: string;
    work_experience: string;
    family: string;
    lifestyle: string;
  };
  created_at: string;
}

interface AgentBuilderProps {
  onAgentsBuilt: () => void;
  generatedPersonas?: Persona[];
  onAgentSleep?: (agentId: string) => void;
  onAgentDelete?: (agentId: string) => void;
}

export default function AgentBuilder({ onAgentsBuilt, generatedPersonas = [], onAgentSleep, onAgentDelete }: AgentBuilderProps) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingProgress, setBuildingProgress] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOccupation, setFilterOccupation] = useState('');
  const [filterTechLevel, setFilterTechLevel] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [progressInterval, setProgressInterval] = useState<number | null>(null);

  // Sleep/Delete functionality
  const handleAgentSleep = (agentId: string) => {
    if (onAgentSleep) {
      onAgentSleep(agentId);
    }
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'SLEEPING' ? 'ACTIVE' : 'SLEEPING' }
        : agent
    ));
  };

  const handleAgentDelete = (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      if (onAgentDelete) {
        onAgentDelete(agentId);
      }
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
    }
  };

  useEffect(() => {
    loadAgents();
    loadUploadedDocuments();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(Array.isArray(data.agents) ? data.agents : []);
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
      setAgents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUploadedDocuments = async () => {
    try {
      const response = await fetch('/api/admin-research/documents');
      if (response.ok) {
        const data = await response.json();
        setUploadedDocuments(Array.isArray(data.documents) ? data.documents : []);
      } else {
        setUploadedDocuments([]);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setUploadedDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const buildAgents = async () => {
    setIsBuilding(true);
    setBuildingProgress(0);
    
    const interval = setInterval(() => {
      setBuildingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBuilding(false);
          onAgentsBuilt();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    setProgressInterval(interval);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SLEEPING': return 'bg-yellow-100 text-yellow-800';
      case 'BUILDING': return 'bg-blue-100 text-blue-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'TESTING': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'SLEEPING': return <Moon className="w-3 h-3 mr-1" />;
      case 'BUILDING': return <Clock className="w-3 h-3 mr-1" />;
      case 'ERROR': return <AlertCircle className="w-3 h-3 mr-1" />;
      case 'TESTING': return <TestTube className="w-3 h-3 mr-1" />;
      default: return <Bot className="w-3 h-3 mr-1" />;
    }
  };

  // Filter personas based on search and filters
  const filteredPersonas = (generatedPersonas || []).filter(persona => {
    if (!persona) return false;
    const matchesSearch = (persona.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (persona.demographics?.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (persona.tagline || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOccupation = !filterOccupation || (persona.demographics?.occupation || '') === filterOccupation;
    const matchesTechLevel = !filterTechLevel || (persona.demographics?.tech_savviness || '') === filterTechLevel;
    
    return matchesSearch && matchesOccupation && matchesTechLevel;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading agents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Agents</h2>
        <p className="text-gray-600">Manage and control your AI agents generated from research data</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search personas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterOccupation}
            onChange={(e) => setFilterOccupation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Occupations</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Product Manager">Product Manager</option>
            <option value="Designer">Designer</option>
            <option value="Manager">Manager</option>
          </select>
          <select
            value={filterTechLevel}
            onChange={(e) => setFilterTechLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Tech Levels</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterOccupation('');
              setFilterTechLevel('');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* AI-Generated Personas from Documents */}
      {generatedPersonas && generatedPersonas.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Sparkles className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-900">AI-Generated Personas from Documents</h3>
            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              {generatedPersonas.length} personas
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(generatedPersonas || []).map((persona) => {
              if (!persona || !persona.id) return null;
              return (
                <div key={persona.id} className="group">
                  <EnhancedPersonaCard
                    persona={persona}
                    isSelected={selectedAgent === persona.id}
                    onSelect={(persona) => setSelectedAgent(persona.id)}
                    showDetails={true}
                  />
                  {/* Action Buttons */}
                  <div className="mt-4 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleAgentSleep(persona.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        persona.status === 'SLEEPING'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {persona.status === 'SLEEPING' ? (
                        <>
                          <Play className="w-4 h-4 inline mr-1" />
                          Wake Up
                        </>
                      ) : (
                        <>
                          <Moon className="w-4 h-4 inline mr-1" />
                          Sleep
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAgentDelete(persona.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!generatedPersonas || generatedPersonas.length === 0) && (
        <div className="text-center py-12">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Agents Yet</h3>
          <p className="text-gray-600 mb-4">
            Upload research documents and process them to generate AI agents.
          </p>
        </div>
      )}
    </div>
  );
}