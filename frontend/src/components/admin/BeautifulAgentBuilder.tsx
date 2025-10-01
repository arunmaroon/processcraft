import { useState, useEffect } from 'react';
import { Bot, Settings, TestTube, CheckCircle, AlertCircle, Clock, Users, Filter, Search, FileText, Sparkles, Trash2, Moon, Play, Pause, MoreVertical, Star, Zap, Target, Heart, Brain, Shield, TrendingUp, MessageCircle, Edit } from 'lucide-react';
import PersonaCard from './PersonaCard';
import EnhancedPersonaCard from './EnhancedPersonaCard';
import DetailedPersonaCard from './DetailedPersonaCard';
import CleanAgentCard from './CleanAgentCard';
import DetailedPersonaView from './DetailedPersonaView';
import AgentChat from './AgentChat';
import DocumentBasedAgentCreator from './DocumentBasedAgentCreator';
import ConfigurationBasedAgentCreator from './ConfigurationBasedAgentCreator';

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
  gender?: string;
  photo?: string;
  tagline?: string;
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
    gender?: string;
    income?: string;
    maritalStatus?: string;
    creditScore?: number;
  };
  dynamicBehaviors?: {
    culturalAdaptations?: boolean;
    [key: string]: any;
  };
  // Additional properties that might exist
  photoDescription?: string;
  income?: string;
  maritalStatus?: string;
  creditScore?: number;
  category?: string;
  bio?: string;
  personality?: string;
  uniqueTraits?: string[];
  specificNeeds?: string[];
  quote?: string;
  goals?: string[];
  painPoints?: string[];
  pain_points?: string[];
  behaviors?: string[];
  technologyUse?: string;
  techSavviness?: string;
  experience?: {
    level: string;
    context: string;
    device_preference: string;
    frequency: string;
  };
  concerns?: string[];
  communication_style?: string;
  preferences?: string[];
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

export default function BeautifulAgentBuilder({ onAgentsBuilt, generatedPersonas = [], onAgentSleep, onAgentDelete }: AgentBuilderProps) {
  console.log('BeautifulAgentBuilder received generatedPersonas:', generatedPersonas);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingProgress, setBuildingProgress] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOccupation, setFilterOccupation] = useState('');
  const [filterTechLevel, setFilterTechLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showSleeping, setShowSleeping] = useState(true);
  const [selectedPersonaForChat, setSelectedPersonaForChat] = useState<Persona | null>(null);
  const [selectedPersonaForDetail, setSelectedPersonaForDetail] = useState<Persona | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState<'agents' | 'document-upload' | 'configuration'>('agents');
  const [buildSubTab, setBuildSubTab] = useState<'upload' | 'detailed'>('upload');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error', show: boolean}>({message: '', type: 'success', show: false});

  // Function to create detailed personas with comprehensive data
  const createDetailedPersonas = (basePersonas: Persona[]): Persona[] => {
    return basePersonas.map((persona, index) => ({
      ...persona,
      // Enhanced demographics
      demographics: {
        ...persona.demographics,
        age: persona.age || 25 + (index * 5),
        occupation: persona.demographics?.occupation || ['Software Engineer', 'Product Manager', 'Designer', 'Marketing Manager', 'Business Analyst'][index % 5],
        income_range: persona.demographics?.income_range || ['₹3L-₹6L', '₹6L-₹12L', '₹12L-₹20L', '₹20L-₹35L', '₹35L+'][index % 5],
        location: persona.demographics?.location || ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'][index % 5],
        education: persona.demographics?.education || ['Graduate', 'Post Graduate', 'MBA', 'Engineering', 'PhD'][index % 5],
        family_status: persona.demographics?.family_status || ['Single', 'Married', 'Married with kids', 'Divorced', 'Widowed'][index % 5],
        tech_savviness: persona.demographics?.tech_savviness || ['High', 'Medium', 'Low', 'Very Low'][index % 4],
        english_literacy: persona.demographics?.english_literacy || ['Fluent', 'Good', 'Basic', 'Limited'][index % 4]
      },
      
      // Enhanced experience
      experience: {
        level: persona.experience?.level || ['Expert', 'Advanced', 'Intermediate', 'Beginner'][index % 4],
        context: persona.experience?.context || ['Professional', 'Personal', 'Mixed', 'Educational'][index % 4],
        device_preference: persona.experience?.device_preference || ['Mobile', 'Desktop', 'Tablet', 'Mixed'][index % 4],
        frequency: persona.experience?.frequency || ['Daily', 'Weekly', 'Monthly', 'Occasionally'][index % 4]
      },
      
      // Enhanced goals and motivations
      goals: persona.goals || [
        'Complete tasks efficiently',
        'Save time and effort',
        'Make informed decisions',
        'Stay connected with family',
        'Advance career',
        'Learn new skills',
        'Maintain work-life balance',
        'Achieve financial security'
      ].slice(0, 3 + (index % 3)),
      
      concerns: persona.concerns || [
        'Data privacy and security',
        'Complex user interfaces',
        'Technical difficulties',
        'Time constraints',
        'Cost implications',
        'Learning curve',
        'Reliability issues',
        'Support availability'
      ].slice(0, 2 + (index % 3)),
      
      behaviors: persona.behaviors || [
        'Researches before making decisions',
        'Prefers step-by-step guidance',
        'Values user reviews and ratings',
        'Seeks help when stuck',
        'Compares multiple options',
        'Reads instructions carefully',
        'Asks questions when uncertain',
        'Shares experiences with others'
      ].slice(0, 3 + (index % 3)),
      
      communication_style: persona.communication_style || [
        'Direct and to the point',
        'Detailed and explanatory',
        'Friendly and conversational',
        'Professional and formal',
        'Casual and relaxed'
      ][index % 5],
      
      preferences: persona.preferences || [
        'Clean, simple interfaces',
        'Mobile-first design',
        'Fast loading times',
        'Clear navigation',
        'Helpful error messages',
        'Customizable options',
        'Offline functionality',
        'Multi-language support'
      ].slice(0, 3 + (index % 3)),
      
      pain_points: persona.pain_points || [
        'Confusing navigation',
        'Slow loading times',
        'Poor mobile experience',
        'Unclear error messages',
        'Too many steps to complete tasks',
        'Lack of customer support',
        'Inconsistent design',
        'Hidden features'
      ].slice(0, 3 + (index % 3)),
      
      quote: persona.quote || [
        "I need something that just works without me having to think about it.",
        "I want to understand what I'm doing at every step of the way.",
        "Time is precious, so I need tools that help me work faster.",
        "I prefer to research thoroughly before making any decisions.",
        "I value security and privacy above convenience."
      ][index % 5],
      
      confidence: persona.confidence || 0.75 + (index * 0.05),
      
      // Enhanced background
      background: {
        education: persona.background?.education || [
          'Bachelor of Technology in Computer Science from IIT Delhi',
          'MBA in Marketing from IIM Ahmedabad',
          'Master of Design from NID',
          'Bachelor of Commerce from Delhi University',
          'Master of Science in Data Science from IISc Bangalore'
        ][index % 5],
        
        work_experience: persona.background?.work_experience || [
          '5+ years in software development, currently Senior Developer at a tech startup',
          '8+ years in product management, leading cross-functional teams',
          '3+ years in UX design, specializing in mobile applications',
          '10+ years in marketing, with expertise in digital campaigns',
          '6+ years in business analysis, focusing on process optimization'
        ][index % 5],
        
        family: persona.background?.family || [
          'Single, living with roommates in a shared apartment',
          'Married with two young children, living in a nuclear family',
          'Recently married, planning to start a family soon',
          'Divorced, single parent with one teenager',
          'Living with elderly parents, taking care of their needs'
        ][index % 5],
        
        lifestyle: persona.background?.lifestyle || [
          'Workaholic who enjoys late-night coding sessions and weekend hackathons',
          'Balanced lifestyle with regular gym sessions and family time',
          'Creative professional who finds inspiration in art and travel',
          'Conservative approach to technology, prefers tried-and-tested solutions',
          'Early adopter who loves trying new technologies and gadgets'
        ][index % 5]
      },
      
      created_at: persona.created_at || new Date().toISOString()
    }));
  };

  // Sleep/Delete functionality
  const handleAgentSleep = async (agentId: string) => {
    try {
      const currentAgent = generatedPersonas.find(p => p.id === agentId);
      if (!currentAgent) return;

      const newStatus = currentAgent.status === 'SLEEPING' ? 'ACTIVE' : 'SLEEPING';
      
      // Update backend
      const response = await fetch(`/api/admin-research/agents/${agentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        const updatedPersonas = generatedPersonas.map(p => 
          p.id === agentId ? { ...p, status: newStatus } : p
        );
        
        // Update localStorage
        localStorage.setItem('aiAgents', JSON.stringify(updatedPersonas));
        
        // Update parent component
        if (onAgentSleep) {
          onAgentSleep(agentId);
        }
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  const handleAgentDelete = (agentId: string) => {
    console.log('handleAgentDelete called for:', agentId);
    
    // Single confirmation with DELETE input
    const agent = generatedPersonas.find(p => p.id === agentId);
    const agentName = agent?.name || 'Unknown Agent';
    const deleteText = window.prompt(`⚠️ WARNING: You are about to permanently delete AI agent "${agentName}" (ID: ${agentId}).\n\nThis action cannot be undone and will remove all data associated with this agent.\n\nTo confirm deletion, please type "DELETE" (case sensitive):`);
    
    if (deleteText !== 'DELETE') {
      alert('❌ Deletion cancelled. You must type "DELETE" exactly to confirm.');
      return;
    }
    
    // Call parent component's delete function
    if (onAgentDelete) {
      onAgentDelete(agentId);
    }
  };

  const handleAgentChat = (persona: Persona) => {
    setSelectedPersonaForChat(persona);
  };

  const handleAgentsGenerated = (newAgents: any[]) => {
    console.log('🎯 handleAgentsGenerated called with:', newAgents);
    console.log('📊 Current generatedPersonas count:', generatedPersonas.length);
    console.log('🔍 New agents type:', typeof newAgents);
    console.log('🔍 New agents is array:', Array.isArray(newAgents));
    console.log('🔍 New agents length:', newAgents?.length);
    
    // Convert to the expected format
    const convertedAgents = newAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      age: agent.age,
      gender: agent.gender,
      photoDescription: agent.photoDescription || `A professional headshot of ${agent.name}`,
      demographics: {
        age: agent.age,
        occupation: agent.demographics?.occupation || agent.occupation,
        income_range: agent.demographics?.income_range || agent.income,
        location: agent.demographics?.location || agent.location,
        education: agent.demographics?.education || agent.education,
        family_status: agent.demographics?.family_status || 'Not specified',
        tech_savviness: agent.demographics?.tech_savviness || agent.techSavviness,
        english_literacy: agent.demographics?.english_literacy || 'Fluent'
      },
      bio: agent.bio || `${agent.name} is a professional with expertise in their field.`,
      personality: agent.personality || 'Professional',
      uniqueTraits: agent.uniqueTraits || [],
      specificNeeds: agent.specificNeeds || [],
      quote: agent.quote || `"I need solutions that help me achieve my goals efficiently."`,
      status: agent.status || 'ACTIVE',
      source: agent.source || 'Generated',
      goals: agent.goals || [],
      painPoints: agent.painPoints || [],
      behaviors: agent.behaviors || [],
      preferences: agent.preferences || [],
      communication_style: agent.communication_style || 'Professional',
      techSavviness: agent.techSavviness || 'Medium',
      background: agent.background || {
        education: agent.education || 'Not specified',
        work_experience: agent.occupation || 'Not specified',
        family: 'Not specified',
        lifestyle: agent.location || 'Not specified'
      }
    }));

    console.log('🔄 Converted agents:', convertedAgents);
    console.log('💾 Updating state and localStorage...');

    // Update localStorage and call parent callback
    const updatedAgents = [...generatedPersonas, ...convertedAgents];
    console.log('📈 Updated personas count:', updatedAgents.length);
    localStorage.setItem('aiAgents', JSON.stringify(updatedAgents));
    console.log('💾 Saved to localStorage');
    
    // Call parent callback to update the data
    if (onAgentsBuilt) {
      onAgentsBuilt();
    }
    
    // Show success notification
    setNotification({
      message: `Successfully generated ${convertedAgents.length} new AI agents!`,
      type: 'success',
      show: true
    });
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
    
    // Switch to agents tab to show the results
    console.log('🔄 Switching to agents tab');
    setActiveTab('agents');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Load agents from props or localStorage on component mount
  useEffect(() => {
    console.log('🔄 Loading agents...');
    console.log('📦 Props generatedPersonas:', generatedPersonas);
    
    if (generatedPersonas && generatedPersonas.length > 0) {
      console.log('📦 Using agents from props:', generatedPersonas);
    } else {
      console.log('🔄 No agents in props, checking localStorage...');
      const savedAgents = localStorage.getItem('aiAgents');
      if (savedAgents) {
        try {
          const parsedAgents = JSON.parse(savedAgents);
          console.log('📦 Found agents in localStorage:', parsedAgents);
          // Call parent to refresh data
          if (onAgentsBuilt) {
            onAgentsBuilt();
          }
        } catch (error) {
          console.error('❌ Error parsing saved agents:', error);
        }
      } else {
        console.log('📭 No saved agents found in localStorage');
      }
    }
  }, [generatedPersonas, onAgentsBuilt]);

  const filteredPersonas = (generatedPersonas || []).filter(persona => {
    const matchesSearch = persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         persona.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         persona.demographics?.occupation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOccupation = !filterOccupation || persona.demographics?.occupation === filterOccupation;
    const matchesTechLevel = !filterTechLevel || persona.demographics?.tech_savviness === filterTechLevel;
    const matchesStatus = !filterStatus || persona.status === filterStatus;
    
    return matchesSearch && matchesOccupation && matchesTechLevel && matchesStatus;
  });

  const activePersonas = (filteredPersonas || []).filter(p => p.status !== 'SLEEPING' && p.status !== 'DELETED');
  const sleepingPersonas = (filteredPersonas || []).filter(p => p.status === 'SLEEPING');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI agents...</p>
        </div>
      </div>
    );
  }

  if (selectedPersonaForChat) {
    return (
      <AgentChat 
        agent={{
          id: selectedPersonaForChat.id,
          name: selectedPersonaForChat.name,
          age: selectedPersonaForChat.age,
          gender: selectedPersonaForChat.gender || selectedPersonaForChat.demographics?.gender || 'Not specified',
          demographics: {
            occupation: selectedPersonaForChat.demographics?.occupation || 'Not specified',
            income_range: selectedPersonaForChat.income || selectedPersonaForChat.demographics?.income_range || 'Not specified',
            location: selectedPersonaForChat.demographics?.location || 'Not specified',
            education: selectedPersonaForChat.demographics?.education || 'Not specified',
            family_status: selectedPersonaForChat.demographics?.family_status || 'Not specified',
            tech_savviness: selectedPersonaForChat.techSavviness || selectedPersonaForChat.demographics?.tech_savviness || 'Not specified',
            english_literacy: selectedPersonaForChat.demographics?.english_literacy || 'Not specified'
          },
          communication_style: selectedPersonaForChat.communication_style || 'Professional',
          behaviors: selectedPersonaForChat.behaviors || [],
          preferences: selectedPersonaForChat.preferences || [],
          pain_points: selectedPersonaForChat.painPoints || selectedPersonaForChat.pain_points || [],
          quote: selectedPersonaForChat.quote || '',
          background: {
            education: selectedPersonaForChat.demographics?.education || 'Not specified',
            work_experience: selectedPersonaForChat.demographics?.occupation || 'Not specified',
            family: selectedPersonaForChat.demographics?.family_status || 'Not specified',
            lifestyle: selectedPersonaForChat.demographics?.location || 'Not specified'
          }
        }} 
        onClose={() => setSelectedPersonaForChat(null)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Agents</h2>
        <p className="text-gray-600">Create and manage AI-generated user personas</p>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${
          notification.type === 'success' ? 'border-l-4 border-green-400' : 'border-l-4 border-red-400'
        }`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('agents')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'agents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>View Agents ({generatedPersonas.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('document-upload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'document-upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Document Upload</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('configuration')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'configuration'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configuration</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'build' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Build AI Agents</h3>
                <p className="text-sm text-gray-600">Generate agents using advanced AI stack with Grok-3, GPT-4o, Claude-3, and Gemini</p>
              </div>
            </div>

            {/* Build Sub-tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setBuildSubTab('upload')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    buildSubTab === 'upload'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Upload with Basic Config</span>
                  </div>
                </button>
                <button
                  onClick={() => setBuildSubTab('detailed')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    buildSubTab === 'detailed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Complete Detailed Config</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Sub-tab Content */}
            {buildSubTab === 'upload' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Upload with Basic Configuration</h4>
                      <p className="text-sm text-gray-600">Quick setup with essential parameters for rapid agent generation</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">AI Stack Features</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Grok-3 for document reasoning</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>GPT-4o for multimodal analysis</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Claude-3 for ethical alignment</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Gemini for validation & optimization</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Basic Configuration</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>Agent count (1-10 slider)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>Tech savviness level</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>English proficiency</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>Fintech savviness</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab('document-upload')}
                      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Start Upload with Basic Config →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {buildSubTab === 'detailed' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Settings className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Complete Detailed Configuration</h4>
                      <p className="text-sm text-gray-600">Full control over every aspect of agent generation and behavior</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Advanced AI Features</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Dynamic behaviors & cultural adaptations</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Group interactions & social influences</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span>Continuous learning & adaptation</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span>Real-time analytics & bias detection</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Detailed Configuration</h5>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>Individual agent attributes</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>Goals, pain points, quotes</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>Demographics & cultural context</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span>Behavioral patterns & preferences</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab('configuration')}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Start Detailed Configuration →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{generatedPersonas.length}</div>
                  <div className="text-sm text-gray-600">Total Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {generatedPersonas.filter(p => p.status === 'ACTIVE').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {generatedPersonas.filter(p => p.status === 'SLEEPING').length}
                  </div>
                  <div className="text-sm text-gray-600">Sleeping Agents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {generatedPersonas.filter(p => p.dynamicBehaviors?.culturalAdaptations).length}
                  </div>
                  <div className="text-sm text-gray-600">Cultural Adaptations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'document-upload' && (
        <DocumentBasedAgentCreator onAgentsGenerated={handleAgentsGenerated} />
      )}

      {activeTab === 'configuration' && (
        <ConfigurationBasedAgentCreator onAgentsGenerated={handleAgentsGenerated} />
      )}

      {activeTab === 'agents' && (
        <>
          {/* Build Agent Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New AI Agents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('document-upload')}
                className="flex items-center justify-center space-x-3 p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
              >
                <FileText className="w-8 h-8 text-blue-600 group-hover:text-blue-700" />
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">Build via Document</h4>
                  <p className="text-sm text-gray-600">Upload research documents and generate agents</p>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('configuration')}
                className="flex items-center justify-center space-x-3 p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors group"
              >
                <Settings className="w-8 h-8 text-green-600 group-hover:text-green-700" />
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">Build via Config</h4>
                  <p className="text-sm text-gray-600">Configure detailed parameters for agent generation</p>
                </div>
              </button>
            </div>
          </div>

          {/* Agent Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{generatedPersonas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{activePersonas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Moon className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Sleeping</p>
              <p className="text-2xl font-bold text-yellow-600">{sleepingPersonas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-purple-600">
                {generatedPersonas.length > 0 
                  ? Math.round((generatedPersonas.reduce((sum, p) => sum + (p.confidence || 0), 0) / generatedPersonas.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          <select
            value={filterOccupation}
            onChange={(e) => setFilterOccupation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Occupations</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Product Manager">Product Manager</option>
            <option value="Designer">Designer</option>
            <option value="Manager">Manager</option>
            <option value="Business Owner">Business Owner</option>
            <option value="Analyst">Analyst</option>
          </select>
          <select
            value={filterTechLevel}
            onChange={(e) => setFilterTechLevel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Tech Levels</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
            <option value="Very Low">Very Low</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterOccupation('');
              setFilterTechLevel('');
              setFilterStatus('');
            }}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Clear
          </button>
          
          <button
            onClick={() => setShowSleeping(!showSleeping)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              showSleeping 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Moon className="w-4 h-4 inline mr-1" />
            {showSleeping ? 'Hide Sleeping' : 'Show Sleeping'}
          </button>
        </div>
      </div>

      {/* AI-Generated Personas Section */}
      {generatedPersonas && generatedPersonas.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Generated Personas</h3>
              <p className="text-sm text-gray-600">Personas created from your research documents</p>
            </div>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {activePersonas.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {createDetailedPersonas(activePersonas).map((persona) => (
              <CleanAgentCard
                key={persona.id}
                agent={{
                  id: persona.id,
                  name: persona.name,
                  age: persona.age,
                  gender: persona.gender || persona.demographics?.gender || 'Not specified',
                  occupation: persona.demographics?.occupation || 'Not specified',
                  education: persona.demographics?.education || 'Not specified',
                  location: persona.demographics?.location || 'Not specified',
                  income: persona.income || persona.demographics?.income_range || 'Not specified',
                  techSavviness: persona.techSavviness || persona.demographics?.tech_savviness || 'Not specified',
                  category: persona.category || 'Not specified',
                  bio: persona.bio || '',
                  personality: persona.personality,
                  uniqueTraits: persona.uniqueTraits,
                  specificNeeds: persona.specificNeeds,
                  quote: persona.quote || '',
                  status: persona.status === 'DELETED' ? 'ACTIVE' : persona.status
                }}
                onSleep={handleAgentSleep}
                onDelete={handleAgentDelete}
                onChat={(agentId) => {
                  const agent = createDetailedPersonas(activePersonas).find(p => p.id === agentId);
                  if (agent) {
                    setSelectedPersonaForChat(agent);
                    setShowChat(true);
                  }
                }}
                onClick={(agentId) => {
                  const agent = createDetailedPersonas(activePersonas).find(p => p.id === agentId);
                  if (agent) {
                    setSelectedPersonaForDetail(agent);
                  }
                }}
              />
            ))}
          </div>

          {/* Sleeping Agents */}
          {showSleeping && sleepingPersonas.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sleeping Agents</h3>
                  <p className="text-sm text-gray-600">Agents that are currently inactive</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {sleepingPersonas.length} Sleeping
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {createDetailedPersonas(sleepingPersonas).map((persona) => (
                  <div key={persona.id} className="opacity-75">
                    <CleanAgentCard
                      agent={{
                        id: persona.id,
                        name: persona.name,
                        age: persona.age,
                        gender: persona.gender || persona.demographics?.gender || 'Not specified',
                        occupation: persona.demographics.occupation,
                        education: persona.demographics.education || 'Not specified',
                        location: persona.demographics.location,
                        income: persona.income || persona.demographics?.income_range || persona.demographics?.income || 'Not specified',
                        techSavviness: persona.techSavviness || persona.demographics?.tech_savviness || 'Not specified',
                        category: persona.category || 'Not specified',
                        bio: persona.bio || '',
                        personality: persona.personality,
                        uniqueTraits: persona.uniqueTraits,
                        specificNeeds: persona.specificNeeds,
                        quote: persona.quote || '',
                        status: persona.status === 'DELETED' ? 'ACTIVE' : (persona.status || 'ACTIVE')
                      }}
                      onSleep={handleAgentSleep}
                      onDelete={handleAgentDelete}
                      onChat={(agentId) => {
                        const agent = createDetailedPersonas(sleepingPersonas).find(p => p.id === agentId);
                        if (agent) {
                          setSelectedPersonaForChat(agent);
                          setShowChat(true);
                        }
                      }}
                      onClick={(agentId) => {
                        const agent = createDetailedPersonas(sleepingPersonas).find(p => p.id === agentId);
                        if (agent) {
                          setSelectedPersonaForDetail(agent);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {(!generatedPersonas || generatedPersonas.length === 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Agents Generated</h3>
          <p className="text-gray-600 mb-6">Upload research documents and generate AI agents to get started.</p>
          <button
            onClick={onAgentsBuilt}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Agents
          </button>
        </div>
      )}

      {/* Detailed Persona View Modal */}
      {selectedPersonaForDetail && (
        <DetailedPersonaView
          persona={{
            id: selectedPersonaForDetail.id,
            name: selectedPersonaForDetail.name,
            photoDescription: selectedPersonaForDetail.photoDescription || 'A professional headshot',
            age: selectedPersonaForDetail.age,
            gender: selectedPersonaForDetail.gender || selectedPersonaForDetail.demographics?.gender || 'Not specified',
            occupation: selectedPersonaForDetail.demographics.occupation,
            education: selectedPersonaForDetail.demographics.education || 'Not specified',
            location: selectedPersonaForDetail.demographics.location,
            income: selectedPersonaForDetail.income || selectedPersonaForDetail.demographics?.income_range || selectedPersonaForDetail.demographics?.income || 'Not specified',
            maritalStatus: selectedPersonaForDetail.maritalStatus || selectedPersonaForDetail.demographics?.maritalStatus || 'Not specified',
            creditScore: selectedPersonaForDetail.creditScore || selectedPersonaForDetail.demographics?.creditScore || 650,
            category: selectedPersonaForDetail.category || 'Not specified',
            bio: selectedPersonaForDetail.bio || '',
            goals: selectedPersonaForDetail.goals || [],
            painPoints: selectedPersonaForDetail.painPoints || selectedPersonaForDetail.pain_points || [],
            behaviors: selectedPersonaForDetail.behaviors || [],
            technologyUse: selectedPersonaForDetail.technologyUse || '',
            quote: selectedPersonaForDetail.quote || '',
            status: selectedPersonaForDetail.status === 'DELETED' ? 'ACTIVE' : (selectedPersonaForDetail.status || 'ACTIVE'),
            personality: selectedPersonaForDetail.personality,
            uniqueTraits: selectedPersonaForDetail.uniqueTraits,
            specificNeeds: selectedPersonaForDetail.specificNeeds
          }}
          onClose={() => setSelectedPersonaForDetail(null)}
          onSleep={handleAgentSleep}
          onDelete={handleAgentDelete}
          onChat={(agentId) => {
            const agent = createDetailedPersonas(activePersonas).find(p => p.id === agentId);
            if (agent) {
              setSelectedPersonaForDetail(null);
              setSelectedPersonaForChat(agent);
              setShowChat(true);
            }
          }}
        />
      )}
        </>
      )}
    </div>
  );
}