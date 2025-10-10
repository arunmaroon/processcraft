import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  UserPlus, 
  Settings, 
  Brain,
  Zap,
  Heart,
  Smile,
  Frown,
  Meh,
  MoreHorizontal
} from 'lucide-react';
import SingleChat from './SingleChat';
import DualChat from './DualChat';
import TripleChat from './TripleChat';
import AgentSelector from './AgentSelector';
import ChatSettings from './ChatSettings';

export type ChatMode = 'single' | 'dual' | 'triple';

export interface HumanAgent {
  id: string;
  name: string;
  avatar: string;
  personality: {
    traits: string[];
    communicationStyle: 'direct' | 'conversational' | 'analytical';
    emotionalTendency: 'expressive' | 'reserved' | 'balanced';
    techSavviness: 'low' | 'medium' | 'high' | 'expert';
    englishLevel: 'basic' | 'intermediate' | 'fluent' | 'native';
  };
  background: {
    age: number;
    occupation: string;
    location: string;
    experience: string;
    goals: string[];
    concerns: string[];
  };
  speakingPatterns: {
    greetings: string[];
    questions: string[];
    confusion: string[];
    excitement: string[];
    concerns: string[];
  };
  culturalContext: {
    language: 'english' | 'hinglish' | 'hindi';
    region: 'north' | 'south' | 'east' | 'west' | 'central';
    values: string[];
  };
}

const AIChatTab: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ChatMode>('single');
  const [selectedAgents, setSelectedAgents] = useState<HumanAgent[]>([]);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Pre-defined human-like agents
  const availableAgents: HumanAgent[] = [
    {
      id: 'rajesh-kumar',
      name: 'Rajesh Kumar',
      avatar: '👨‍💼',
      personality: {
        traits: ['cautious', 'practical', 'family-oriented', 'traditional', 'hardworking'],
        communicationStyle: 'direct',
        emotionalTendency: 'reserved',
        techSavviness: 'low',
        englishLevel: 'basic'
      },
      background: {
        age: 45,
        occupation: 'Small Business Owner',
        location: 'Mumbai',
        experience: '20+ years running small business',
        goals: ['provide for family', 'grow business safely', 'learn new skills gradually'],
        concerns: ['data security', 'making mistakes', 'wasting money', 'family safety']
      },
      speakingPatterns: {
        greetings: ['नमस्ते! कैसे हैं आप?', 'हैलो! सब ठीक है?', 'आप कैसे हैं?'],
        questions: ['यह safe है ना?', 'मैं गलती नहीं करना चाहता', 'क्या आप help कर सकते हैं?'],
        confusion: ['मुझे समझ नहीं आ रहा', 'यह कैसे काम करता है?', 'मैं confused हूं'],
        excitement: ['यह तो अच्छा है!', 'मुझे यह पसंद है', 'बहुत बढ़िया!'],
        concerns: ['मेरे family के लिए ठीक होगा ना?', 'यह safe है ना?', 'मैं गलती नहीं करना चाहता']
      },
      culturalContext: {
        language: 'hinglish',
        region: 'west',
        values: ['family', 'safety', 'tradition', 'hard work']
      }
    },
    {
      id: 'priya-sharma',
      name: 'Priya Sharma',
      avatar: '👩‍💻',
      personality: {
        traits: ['analytical', 'curious', 'helpful', 'detail-oriented', 'innovative'],
        communicationStyle: 'conversational',
        emotionalTendency: 'expressive',
        techSavviness: 'expert',
        englishLevel: 'native'
      },
      background: {
        age: 28,
        occupation: 'Software Engineer',
        location: 'Bangalore',
        experience: '5+ years in fintech startups',
        goals: ['build innovative products', 'advance career', 'learn new technologies'],
        concerns: ['work-life balance', 'keeping up with tech trends', 'product quality']
      },
      speakingPatterns: {
        greetings: ['Hey! How are you doing?', 'Hi there! What\'s up?', 'Hello! How can I help?'],
        questions: ['What\'s the technical architecture?', 'How does this scale?', 'What\'s the user research behind this?'],
        confusion: ['I need more context to understand this', 'Could you explain the technical requirements?', 'I\'m not sure about the implementation details'],
        excitement: ['This is brilliant! I love the approach', 'Wow, this is exactly what I was looking for', 'This is so much better than what I\'ve seen before'],
        concerns: ['I\'m worried about the scalability', 'This could be problematic because...', 'Have you considered the technical debt?']
      },
      culturalContext: {
        language: 'english',
        region: 'south',
        values: ['innovation', 'efficiency', 'quality', 'growth']
      }
    },
    {
      id: 'sneha-patel',
      name: 'Sneha Patel',
      avatar: '👩‍💼',
      personality: {
        traits: ['creative', 'social', 'organized', 'ambitious', 'detail-oriented'],
        communicationStyle: 'conversational',
        emotionalTendency: 'expressive',
        techSavviness: 'medium',
        englishLevel: 'fluent'
      },
      background: {
        age: 32,
        occupation: 'Marketing Manager',
        location: 'Delhi',
        experience: '8+ years in digital marketing',
        goals: ['grow career', 'learn new skills', 'balance work and family'],
        concerns: ['staying relevant', 'work-life balance', 'team management']
      },
      speakingPatterns: {
        greetings: ['Hello! How are you?', 'Hi! What brings you here?', 'Hey! How can I help?'],
        questions: ['What\'s the target audience?', 'How does this align with our brand?', 'What\'s the customer journey?'],
        confusion: ['I\'m not sure I understand the strategy', 'Could you explain the marketing approach?', 'I need more details about the user persona'],
        excitement: ['This is perfect for our target market!', 'I love how user-friendly this is', 'This will definitely improve customer satisfaction'],
        concerns: ['I\'m concerned about the brand alignment', 'This might confuse our customers', 'Have we considered the competitive landscape?']
      },
      culturalContext: {
        language: 'english',
        region: 'north',
        values: ['growth', 'creativity', 'teamwork', 'balance']
      }
    },
    {
      id: 'arjun-singh',
      name: 'Arjun Singh',
      avatar: '👨‍🎓',
      personality: {
        traits: ['thoughtful', 'patient', 'wise', 'traditional', 'respectful'],
        communicationStyle: 'conversational',
        emotionalTendency: 'reserved',
        techSavviness: 'low',
        englishLevel: 'intermediate'
      },
        background: {
        age: 55,
        occupation: 'Retired Teacher',
        location: 'Pune',
        experience: '30+ years in education',
        goals: ['spend time with family', 'learn new things', 'help others'],
        concerns: ['technology complexity', 'privacy', 'change', 'family well-being']
      },
      speakingPatterns: {
        greetings: ['Namaste! Kaise hain aap?', 'Hello! How are you?', 'Good to see you!'],
        questions: ['Is this safe for my family?', 'Will this help my children?', 'How does this work?'],
        confusion: ['I don\'t understand this technology', 'Can you explain in simple terms?', 'This seems very complicated'],
        excitement: ['This is wonderful!', 'I like this approach', 'This will be helpful'],
        concerns: ['I\'m worried about my family\'s safety', 'This seems too complex', 'Will this work for everyone?']
      },
      culturalContext: {
        language: 'hinglish',
        region: 'west',
        values: ['family', 'education', 'respect', 'tradition']
      }
    },
    {
      id: 'meera-reddy',
      name: 'Meera Reddy',
      avatar: '👩‍⚕️',
      personality: {
        traits: ['caring', 'patient', 'detail-oriented', 'empathetic', 'thorough'],
        communicationStyle: 'conversational',
        emotionalTendency: 'expressive',
        techSavviness: 'medium',
        englishLevel: 'fluent'
      },
      background: {
        age: 38,
        occupation: 'Doctor',
        location: 'Hyderabad',
        experience: '12+ years in healthcare',
        goals: ['help patients', 'improve healthcare', 'balance work and family'],
        concerns: ['patient safety', 'work-life balance', 'keeping up with medical advances']
      },
      speakingPatterns: {
        greetings: ['Hello! How are you feeling?', 'Hi! How can I help?', 'Good to see you!'],
        questions: ['How will this affect patient care?', 'Is this safe for everyone?', 'What are the benefits?'],
        confusion: ['I need more medical context', 'Could you explain the health implications?', 'I\'m not sure about the safety aspects'],
        excitement: ['This will really help my patients!', 'I love how this improves healthcare', 'This is exactly what we needed'],
        concerns: ['I\'m concerned about patient safety', 'This might be too complex for some patients', 'Have we considered accessibility?']
      },
      culturalContext: {
        language: 'english',
        region: 'south',
        values: ['health', 'care', 'empathy', 'service']
      }
    }
  ];

  useEffect(() => {
    // Initialize with default agents based on mode
    if (activeMode === 'single' && selectedAgents.length === 0) {
      setSelectedAgents([availableAgents[0]]);
    } else if (activeMode === 'dual' && selectedAgents.length === 0) {
      setSelectedAgents([availableAgents[0], availableAgents[1]]);
    } else if (activeMode === 'triple' && selectedAgents.length === 0) {
      setSelectedAgents([availableAgents[0], availableAgents[1], availableAgents[2]]);
    }
  }, [activeMode, selectedAgents.length]);

  const handleModeChange = (mode: ChatMode) => {
    setActiveMode(mode);
    setSelectedAgents([]);
  };

  const handleAgentSelect = (agents: HumanAgent[]) => {
    setSelectedAgents(agents);
    setShowAgentSelector(false);
  };

  const renderChatComponent = () => {
    if (selectedAgents.length === 0) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Agents to Start Chatting</h3>
            <p className="text-gray-500 mb-4">Choose from our human-like AI agents to begin your conversation</p>
            <button
              onClick={() => setShowAgentSelector(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Select Agents
            </button>
          </div>
        </div>
      );
    }

    switch (activeMode) {
      case 'single':
        return <SingleChat agent={selectedAgents[0]} />;
      case 'dual':
        return <DualChat agents={selectedAgents.slice(0, 2)} />;
      case 'triple':
        return <TripleChat agents={selectedAgents.slice(0, 3)} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Chat</h2>
            </div>
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleModeChange('single')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeMode === 'single'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-1" />
                Single
              </button>
              <button
                onClick={() => handleModeChange('dual')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeMode === 'dual'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Dual
              </button>
              <button
                onClick={() => handleModeChange('triple')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeMode === 'triple'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Triple
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAgentSelector(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Select Agents"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Agents Display */}
      {selectedAgents.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Active Agents:</span>
            <div className="flex items-center space-x-2">
              {selectedAgents.map((agent, index) => (
                <div
                  key={agent.id}
                  className="flex items-center space-x-2 bg-white rounded-lg px-3 py-1 border border-gray-200"
                >
                  <span className="text-lg">{agent.avatar}</span>
                  <span className="text-sm font-medium text-gray-900">{agent.name}</span>
                  <span className="text-xs text-gray-500">
                    {agent.background.occupation}, {agent.background.age}y
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        {renderChatComponent()}
      </div>

      {/* Agent Selector Modal */}
      {showAgentSelector && (
        <AgentSelector
          availableAgents={availableAgents}
          selectedAgents={selectedAgents}
          maxAgents={activeMode === 'single' ? 1 : activeMode === 'dual' ? 2 : 3}
          onSelect={handleAgentSelect}
          onClose={() => setShowAgentSelector(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <ChatSettings
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default AIChatTab;



