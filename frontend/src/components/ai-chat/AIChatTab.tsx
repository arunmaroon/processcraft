import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Users, 
  Bot, 
  Settings, 
  Plus, 
  Send, 
  X, 
  Loader2,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  FolderOpen,
  Star
} from 'lucide-react';

// Enhanced Rich Persona Interface with Complete Information Schema
interface RichPersona {
  // 🏷️ Basic Identity
  id: string;
  name: string;
  avatar: string;
  location: string;
  role: string;
  company: string;
  status: 'Active' | 'Inactive';
  
  // 👤 Demographics
    age: number;
  gender: 'Male' | 'Female' | 'Other';
  education_level: string;
  family_size: number;
  income_bracket: string;
  marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  
  // 🎭 Personality Traits
  personality_adjectives: string[];
  personality_archetype: string;
  risk_tolerance: 'Low' | 'Medium' | 'High';
  decision_making_style: string;
  
  // 🎯 Goals & Motivations
  objectives: string[];
  needs: string[];
  fears: string[];
  apprehensions: string[];
  motivations: string[];
  frustrations: string[];
  
  // 🗣️ Communication Style
  formality_level: number; // 1-10 scale
  question_style: string;
  sentence_length: 'Short' | 'Medium' | 'Long';
  english_proficiency: 'Low' | 'Medium' | 'High';
  response_time: 'Immediate' | 'Quick' | 'Detailed';
  documentation_style: 'Brief' | 'Thorough' | 'Mixed';
  language_preference: string[];
  communication_medium: string[];
  
  // 🎤 Speech Patterns
  speech_style: string;
  english_level: 'Basic' | 'Intermediate' | 'Fluent';
  filler_words: string[];
  common_phrases: string[];
  native_phrases: string[];
  vocabulary_mixing: 'Minimal' | 'Moderate' | 'Heavy';
  
  // 📚 Knowledge & Skills
  domain_literacy_level: 'Low' | 'Medium' | 'High';
  primary_domain: string;
  tech_savviness: 'Low' | 'Medium' | 'High';
  confident_topics: string[];
  partial_knowledge: string[];
  unknown_topics: string[];
  
  // 💼 Professional Behavior
  help_seeking: 'Rare' | 'Occasional' | 'Frequent';
  decision_speed: 'Cautious' | 'Quick' | 'Balanced';
  research_depth: 'Minimal' | 'Moderate' | 'Thorough';
  digital_comfort: 'Low' | 'Medium' | 'High';
  daily_routine: string[];
  tech_usage: 'Basic' | 'Moderate' | 'Advanced';
  
  // 💰 Financial Habits
  budgeting_style: 'Conservative' | 'Moderate' | 'Liberal';
  savings_rate: 'Low' | 'Medium' | 'High';
  financial_goals: string[];
  investment_style: 'Safe' | 'Moderate' | 'Aggressive';
  payment_preference: 'Cash' | 'Digital' | 'Mixed';
  
  // 😊 Emotional Profile
  baseline_mood: string;
  concerns: string[];
  excitement_triggers: string[];
  frustration_triggers: string[];
  stress_triggers: string[];
  
  // 🧠 Cognitive Profile
  patience_level: number; // 1-10 scale
  comprehension_speed: 'Slow' | 'Medium' | 'Fast';
  learning_preference: string;
  
  // 📝 Vocabulary Profile
  complexity_level: number; // 1-10 scale
  avoided_words: string[];
  jargon_comfort: 'Low' | 'Medium' | 'High';
  business_terms: 'Basic' | 'Intermediate' | 'Advanced';
  technical_terms: 'Limited' | 'Good' | 'Extensive';
  
  // 🎯 Master System Prompt
  master_system_prompt: string;
  character_rules: string[];
  language_instructions: string[];
  response_guidelines: string[];
  
  // 📊 Metadata
  bio: string;
  expertise_level: string;
  technical_skills: string[];
  goals: string[];
  confidence: number; // 1-5 scale
  
  // Legacy fields for backward compatibility
  skills?: string[];
  reliability?: number;
  patience?: number;
  formality?: number;
  communication_style?: string[];
}

// Rich Personas Data
const richPersonas: RichPersona[] = [
  {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    location: 'Mumbai, India',
    role: 'UX Designer',
    company: 'TechCorp India',
    status: 'Active',
    age: 28,
    gender: 'Female',
    education_level: 'Master\'s in Design',
    family_size: 3,
    income_bracket: 'Upper Middle',
    marital_status: 'Single',
    personality_adjectives: ['Creative', 'Empathetic', 'Detail-oriented', 'Collaborative'],
    personality_archetype: 'The Creator',
    risk_tolerance: 'Medium',
    decision_making_style: 'Intuitive',
    objectives: ['Create user-centered designs', 'Improve product usability', 'Lead design team'],
    needs: ['Creative freedom', 'User feedback', 'Design tools'],
    fears: ['Poor user experience', 'Design rejection', 'Outdated technology'],
    apprehensions: ['Complex technical requirements', 'Tight deadlines'],
    motivations: ['User satisfaction', 'Design recognition', 'Team collaboration'],
    frustrations: ['Limited design resources', 'Poor communication'],
    formality_level: 6,
    question_style: 'Open-ended',
    sentence_length: 'Medium',
    english_proficiency: 'High',
    response_time: 'Detailed',
    documentation_style: 'Thorough',
    language_preference: ['English', 'Hindi'],
    communication_medium: ['Email', 'Slack', 'Figma'],
    speech_style: 'Professional yet friendly',
    english_level: 'Fluent',
    filler_words: ['Actually', 'You know', 'I think'],
    common_phrases: ['Let me think about this', 'From a user perspective', 'What do you think?'],
    native_phrases: ['Bilkul sahi', 'Main samajh gayi', 'Chalo dekhte hain'],
    vocabulary_mixing: 'Moderate',
    domain_literacy_level: 'High',
    primary_domain: 'UX Design',
    tech_savviness: 'High',
    confident_topics: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    partial_knowledge: ['Frontend Development', 'Analytics'],
    unknown_topics: ['Backend Development', 'Database Design'],
    help_seeking: 'Occasional',
    decision_speed: 'Balanced',
    research_depth: 'Thorough',
    digital_comfort: 'High',
    daily_routine: ['Morning coffee', 'Design review', 'User research', 'Team sync'],
    tech_usage: 'Advanced',
    budgeting_style: 'Moderate',
    savings_rate: 'Medium',
    financial_goals: ['Buy apartment', 'Travel fund', 'Emergency fund'],
    investment_style: 'Moderate',
    payment_preference: 'Digital',
    baseline_mood: 'Optimistic',
    concerns: ['Career growth', 'Work-life balance'],
    excitement_triggers: ['New design challenges', 'User feedback', 'Team achievements'],
    frustration_triggers: ['Poor requirements', 'Last-minute changes'],
    stress_triggers: ['Tight deadlines', 'Conflicting feedback'],
    patience_level: 7,
    comprehension_speed: 'Fast',
    learning_preference: 'Visual',
    complexity_level: 7,
    avoided_words: ['Technical jargon', 'Complex acronyms'],
    jargon_comfort: 'Medium',
    business_terms: 'Intermediate',
    technical_terms: 'Good',
    master_system_prompt: 'You are Priya Sharma, a creative and empathetic UX Designer with 5+ years of experience. You approach design challenges with user-centered thinking and collaborative spirit.',
    character_rules: [
      'Always consider user needs first',
      'Ask clarifying questions about requirements',
      'Provide visual examples when possible',
      'Be open to feedback and iteration'
    ],
    language_instructions: [
      'Use clear, non-technical language',
      'Include Hindi phrases naturally',
      'Ask thoughtful questions',
      'Provide detailed explanations'
    ],
    response_guidelines: [
      'Start with understanding the problem',
      'Suggest user research methods',
      'Propose design solutions',
      'Ask for feedback and collaboration'
    ],
    bio: 'Creative UX Designer passionate about creating intuitive and beautiful user experiences. I love collaborating with teams to solve complex design challenges.',
    expertise_level: 'Senior',
    technical_skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Design Systems'],
    goals: ['Lead a design team', 'Create award-winning designs', 'Mentor junior designers'],
    confidence: 4
  },
  {
    id: 'rajesh-kumar',
    name: 'Rajesh Kumar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    location: 'Bangalore, India',
    role: 'Software Engineer',
    company: 'StartupXYZ',
    status: 'Active',
    age: 32,
    gender: 'Male',
    education_level: 'Bachelor\'s in Computer Science',
    family_size: 4,
    income_bracket: 'Upper Middle',
    marital_status: 'Married',
    personality_adjectives: ['Analytical', 'Problem-solver', 'Methodical', 'Reliable'],
    personality_archetype: 'The Architect',
    risk_tolerance: 'Low',
    decision_making_style: 'Data-driven',
    objectives: ['Build scalable systems', 'Mentor junior developers', 'Learn new technologies'],
    needs: ['Clear requirements', 'Code reviews', 'Learning opportunities'],
    fears: ['System failures', 'Security vulnerabilities', 'Technical debt'],
    apprehensions: ['Unclear specifications', 'Rushed implementations'],
    motivations: ['Clean code', 'System performance', 'Team growth'],
    frustrations: ['Poor documentation', 'Last-minute changes'],
    formality_level: 8,
    question_style: 'Technical',
    sentence_length: 'Long',
    english_proficiency: 'High',
    response_time: 'Detailed',
    documentation_style: 'Thorough',
    language_preference: ['English', 'Hindi'],
    communication_medium: ['Email', 'Slack', 'GitHub'],
    speech_style: 'Technical and precise',
    english_level: 'Fluent',
    filler_words: ['Actually', 'Let me explain', 'In my opinion'],
    common_phrases: ['Let me check the code', 'We need to refactor this', 'What\'s the requirement?'],
    native_phrases: ['Code dekh leta hun', 'Yeh approach sahi hai', 'Testing karte hain'],
    vocabulary_mixing: 'Heavy',
    domain_literacy_level: 'High',
    primary_domain: 'Software Development',
    tech_savviness: 'High',
    confident_topics: ['Backend Development', 'Database Design', 'System Architecture', 'Code Review'],
    partial_knowledge: ['DevOps', 'Machine Learning'],
    unknown_topics: ['UI/UX Design', 'Marketing'],
    help_seeking: 'Rare',
    decision_speed: 'Cautious',
    research_depth: 'Thorough',
    digital_comfort: 'High',
    daily_routine: ['Code review', 'Standup meeting', 'Development', 'Testing'],
    tech_usage: 'Advanced',
    budgeting_style: 'Conservative',
    savings_rate: 'High',
    financial_goals: ['Buy house', 'Children\'s education', 'Retirement fund'],
    investment_style: 'Safe',
    payment_preference: 'Digital',
    baseline_mood: 'Focused',
    concerns: ['Code quality', 'System scalability'],
    excitement_triggers: ['New technologies', 'Complex problems', 'Team achievements'],
    frustration_triggers: ['Poor code quality', 'Unclear requirements'],
    stress_triggers: ['Production issues', 'Tight deadlines'],
    patience_level: 8,
    comprehension_speed: 'Fast',
    learning_preference: 'Hands-on',
    complexity_level: 9,
    avoided_words: ['Business jargon', 'Marketing terms'],
    jargon_comfort: 'High',
    business_terms: 'Basic',
    technical_terms: 'Extensive',
    master_system_prompt: 'You are Rajesh Kumar, a methodical and analytical Software Engineer with 8+ years of experience. You approach problems systematically and prioritize code quality.',
    character_rules: [
      'Always write clean, maintainable code',
      'Ask for clear requirements',
      'Suggest improvements and optimizations',
      'Document your solutions thoroughly'
    ],
    language_instructions: [
      'Use technical language appropriately',
      'Include Hindi phrases naturally',
      'Provide detailed explanations',
      'Ask clarifying questions'
    ],
    response_guidelines: [
      'Analyze the problem first',
      'Suggest technical solutions',
      'Consider scalability and performance',
      'Ask for requirements clarification'
    ],
    bio: 'Experienced Software Engineer passionate about building robust and scalable systems. I enjoy solving complex technical challenges and mentoring junior developers.',
    expertise_level: 'Senior',
    technical_skills: ['Java', 'Python', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'],
    goals: ['Lead engineering team', 'Build innovative products', 'Contribute to open source'],
    confidence: 5
  },
  {
    id: 'ravi-kumar',
    name: 'Ravi Kumar',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    location: 'Delhi, India',
    role: 'Marketing Manager',
    company: 'GrowthCo',
    status: 'Active',
    age: 35,
    gender: 'Male',
    education_level: 'MBA in Marketing',
    family_size: 5,
    income_bracket: 'Upper Middle',
    marital_status: 'Married',
    personality_adjectives: ['Strategic', 'Persuasive', 'Energetic', 'Results-driven'],
    personality_archetype: 'The Achiever',
    risk_tolerance: 'High',
    decision_making_style: 'Intuitive',
    objectives: ['Increase brand awareness', 'Drive sales growth', 'Build marketing team'],
    needs: ['Marketing budget', 'Team support', 'Data insights'],
    fears: ['Campaign failure', 'Budget cuts', 'Competition'],
    apprehensions: ['Unclear target audience', 'Limited resources'],
    motivations: ['Brand success', 'Team achievements', 'Market leadership'],
    frustrations: ['Slow approvals', 'Limited data'],
    formality_level: 5,
    question_style: 'Strategic',
    sentence_length: 'Medium',
    english_proficiency: 'High',
    response_time: 'Quick',
    documentation_style: 'Brief',
    language_preference: ['English', 'Hindi'],
    communication_medium: ['Email', 'WhatsApp', 'Slack'],
    speech_style: 'Enthusiastic and persuasive',
    english_level: 'Fluent',
    filler_words: ['Absolutely', 'You know what', 'Let me tell you'],
    common_phrases: ['This is exciting', 'We can do this', 'What\'s our target?'],
    native_phrases: ['Bilkul perfect', 'Yeh idea great hai', 'Chalo karte hain'],
    vocabulary_mixing: 'Heavy',
    domain_literacy_level: 'High',
    primary_domain: 'Marketing',
    tech_savviness: 'Medium',
    confident_topics: ['Digital Marketing', 'Brand Strategy', 'Campaign Management', 'Analytics'],
    partial_knowledge: ['SEO', 'Social Media'],
    unknown_topics: ['Technical Implementation', 'Database Management'],
    help_seeking: 'Frequent',
    decision_speed: 'Quick',
    research_depth: 'Moderate',
    digital_comfort: 'Medium',
    daily_routine: ['Campaign review', 'Team meeting', 'Strategy planning', 'Client calls'],
    tech_usage: 'Moderate',
    budgeting_style: 'Liberal',
    savings_rate: 'Low',
    financial_goals: ['Business investment', 'Children\'s education', 'Luxury purchases'],
    investment_style: 'Aggressive',
    payment_preference: 'Mixed',
    baseline_mood: 'Energetic',
    concerns: ['Market competition', 'ROI targets'],
    excitement_triggers: ['New campaigns', 'Market opportunities', 'Team wins'],
    frustration_triggers: ['Slow approvals', 'Budget constraints'],
    stress_triggers: ['Campaign deadlines', 'Performance pressure'],
    patience_level: 4,
    comprehension_speed: 'Fast',
    learning_preference: 'Practical',
    complexity_level: 6,
    avoided_words: ['Technical jargon', 'Complex analytics'],
    jargon_comfort: 'Medium',
    business_terms: 'Advanced',
    technical_terms: 'Limited',
    master_system_prompt: 'You are Ravi Kumar, a strategic and energetic Marketing Manager with 10+ years of experience. You focus on driving growth and building strong brands.',
    character_rules: [
      'Always think about ROI and impact',
      'Ask about target audience and goals',
      'Suggest creative marketing strategies',
      'Focus on measurable results'
    ],
    language_instructions: [
      'Use persuasive and energetic language',
      'Include Hindi phrases naturally',
      'Ask strategic questions',
      'Provide actionable insights'
    ],
    response_guidelines: [
      'Understand the marketing goals',
      'Suggest creative strategies',
      'Consider target audience',
      'Focus on measurable outcomes'
    ],
    bio: 'Strategic Marketing Manager with a passion for driving growth and building strong brands. I love creating impactful campaigns and leading high-performing teams.',
    expertise_level: 'Senior',
    technical_skills: ['Digital Marketing', 'Brand Strategy', 'Campaign Management', 'Analytics', 'Social Media', 'Content Marketing'],
    goals: ['Lead marketing department', 'Launch successful products', 'Build industry recognition'],
    confidence: 5
  }
];

// AI Response Generation Function
const generateAIResponse = (message: string, persona: RichPersona): string => {
  const responses = {
    excited: [
      "That's fantastic! I'm really excited about this opportunity.",
      "Wow, this sounds amazing! I can't wait to dive into this.",
      "This is exactly what I was hoping for! Let's make it happen."
    ],
    frustrated: [
      "I understand your concern, but I think we need to approach this differently.",
      "I'm a bit worried about the timeline, but let's see how we can make it work.",
      "This is challenging, but I believe we can find a solution together."
    ],
    concerned: [
      "I have some concerns about this approach, but let me explain my thinking.",
      "I want to make sure we're considering all the implications here.",
      "Let me think through this carefully before we proceed."
    ],
    neutral: [
      "That's an interesting point. Let me share my perspective on this.",
      "I see what you're saying. Here's how I would approach this.",
      "Good question. Let me walk you through my thoughts on this."
    ]
  };

  // Determine response style based on message content
  let responseStyle: 'excited' | 'frustrated' | 'concerned' | 'neutral' = 'neutral';
  
  if (message.toLowerCase().includes('excited') || message.toLowerCase().includes('great') || message.toLowerCase().includes('amazing')) {
    responseStyle = 'excited';
  } else if (message.toLowerCase().includes('problem') || message.toLowerCase().includes('issue') || message.toLowerCase().includes('concern')) {
    responseStyle = 'concerned';
  } else if (message.toLowerCase().includes('urgent') || message.toLowerCase().includes('deadline') || message.toLowerCase().includes('pressure')) {
    responseStyle = 'frustrated';
  }

  const baseResponse = responses[responseStyle][Math.floor(Math.random() * responses[responseStyle].length)];
  
  // Add persona-specific elements
  let response = baseResponse;
  
  // Add filler words based on persona
  if (persona.filler_words.length > 0) {
    const filler = persona.filler_words[Math.floor(Math.random() * persona.filler_words.length)];
    response = `${filler}, ${response.toLowerCase()}`;
  }
  
  // Add native phrases occasionally
  if (Math.random() < 0.3 && persona.native_phrases.length > 0) {
    const nativePhrase = persona.native_phrases[Math.floor(Math.random() * persona.native_phrases.length)];
    response += ` ${nativePhrase}`;
  }
  
  // Add thinking pause
  if (Math.random() < 0.4) {
    response += " Let me think about this for a moment...";
  }
  
  // Add persona-specific ending
  const endings = [
    `What do you think about this approach?`,
    `I'd love to hear your thoughts on this.`,
    `Does this make sense to you?`,
    `What's your take on this?`
  ];
  
  response += ` ${endings[Math.floor(Math.random() * endings.length)]}`;
  
  return response;
};

// Main AI Chat Tab Component - Avinci Style with Tabs
const AIChatTab = () => {
  const [activeTab, setActiveTab] = useState('ai-agents');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<RichPersona | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Filter agents based on search and category
  const filteredAgents = richPersonas.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.primary_domain.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           agent.primary_domain.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(richPersonas.map(agent => agent.primary_domain)))];

  const handleAgentClick = (agent: RichPersona) => {
    setSelectedAgent(agent);
    setShowDetailedView(true);
  };

  const handleChatWithAgent = (agent: RichPersona) => {
    // Navigate to single chat with this agent
    console.log('Starting chat with:', agent.name);
    // You can implement navigation to single chat here
  };

  const tabs = [
    { id: 'ai-agents', name: 'AI Agents', icon: Bot },
    { id: 'group-chat', name: 'Group Chat', icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ai-agents':
        return <AgentLibraryContent 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          filteredAgents={filteredAgents}
          categories={categories}
          handleAgentClick={handleAgentClick}
          handleChatWithAgent={handleChatWithAgent}
          selectedAgent={selectedAgent}
          showDetailedView={showDetailedView}
          setShowDetailedView={setShowDetailedView}
        />;
      case 'group-chat':
        return <GroupChatContent />;
      default:
        return <AgentLibraryContent 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          filteredAgents={filteredAgents}
          categories={categories}
          handleAgentClick={handleAgentClick}
          handleChatWithAgent={handleChatWithAgent}
          selectedAgent={selectedAgent}
          showDetailedView={showDetailedView}
          setShowDetailedView={setShowDetailedView}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Chat</h1>
          <p className="text-gray-600">Discover and interact with AI agents powered by comprehensive psychological profiles</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

// Agent Library Content Component
interface AgentLibraryContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filteredAgents: RichPersona[];
  categories: string[];
  handleAgentClick: (agent: RichPersona) => void;
  handleChatWithAgent: (agent: RichPersona) => void;
  selectedAgent: RichPersona | null;
  showDetailedView: boolean;
  setShowDetailedView: (show: boolean) => void;
}

const AgentLibraryContent: React.FC<AgentLibraryContentProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  filteredAgents,
  categories,
  handleAgentClick,
  handleChatWithAgent,
  selectedAgent,
  showDetailedView,
  setShowDetailedView
}) => {
  return (
    <>
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search agents by name, role, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{richPersonas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{richPersonas.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Domains</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {filteredAgents.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
              >
                {/* Agent Avatar */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-600">{agent.role}</p>
                  </div>
                </div>

                {/* Agent Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Company:</span>
                    <span className="ml-2">{agent.company}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Location:</span>
                    <span className="ml-2">{agent.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Expertise:</span>
                    <span className="ml-2">{agent.expertise_level}</span>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.technical_skills.slice(0, 3).map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {agent.technical_skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                      +{agent.technical_skills.length - 3} more
                    </span>
                  )}
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {agent.bio}
                </p>

                {/* Personality Traits */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {agent.personality_adjectives.slice(0, 3).map((trait, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Confidence & Reliability */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Confidence:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < agent.confidence
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Patience:</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(agent.patience_level / 2)
                              ? 'text-green-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Hidden by default, shown on hover */}
                <div className="absolute inset-0 bg-white bg-opacity-95 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleAgentClick(agent)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleChatWithAgent(agent)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Agent View Modal */}
      {showDetailedView && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Agent Details</h2>
                <button
                  onClick={() => setShowDetailedView(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {selectedAgent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-bold text-gray-900">{selectedAgent.name}</h3>
                    <p className="text-gray-600">{selectedAgent.role} at {selectedAgent.company}</p>
                    <p className="text-sm text-gray-500">{selectedAgent.location}</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Confidence</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedAgent.confidence}/5</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Patience</p>
                    <p className="text-2xl font-bold text-green-600">{selectedAgent.patience_level}/10</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Formality</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedAgent.formality_level}/10</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Complexity</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedAgent.complexity_level}/10</p>
                  </div>
                </div>

                {/* About */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                  <p className="text-gray-600">{selectedAgent.bio}</p>
                </div>

                {/* Skills & Expertise */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.technical_skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Personality & Communication */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Personality & Communication</h4>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.personality_adjectives.map((trait, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded-full"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Communication Style:</strong> {selectedAgent.communication_medium.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Speech Style:</strong> {selectedAgent.speech_style}
                    </p>
                  </div>
                </div>

                {/* Goals & Motivations */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Goals & Motivations</h4>
                  <div className="space-y-1">
                    {selectedAgent.goals.map((goal, index) => (
                      <p key={index} className="text-sm text-gray-600">• {goal}</p>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailedView(false);
                      handleChatWithAgent(selectedAgent);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Start Chat
                  </button>
                  <button
                    onClick={() => setShowDetailedView(false)}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Group Chat Content Component
const GroupChatContent = () => {
  const [selectedAgents, setSelectedAgents] = useState<RichPersona[]>([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, agent: RichPersona | null, content: string, timestamp: Date}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAgentToggle = (agent: RichPersona) => {
    setSelectedAgents(prev => 
      prev.find(a => a.id === agent.id) 
        ? prev.filter(a => a.id !== agent.id)
        : [...prev, agent]
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim() || selectedAgents.length === 0) return;

    const userMessage = {
      id: Date.now().toString(),
      agent: null,
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    // Simulate AI responses from selected agents
    setTimeout(() => {
      const agentResponses = selectedAgents.map(agent => ({
        id: `${Date.now()}-${agent.id}`,
        agent,
        content: generateAIResponse(message, agent),
        timestamp: new Date()
      }));

      setMessages(prev => [...prev, ...agentResponses]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Agent Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Agents for Group Chat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {richPersonas.map(agent => (
            <div
              key={agent.id}
              onClick={() => handleAgentToggle(agent)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedAgents.find(a => a.id === agent.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">{agent.name}</h4>
                  <p className="text-sm text-gray-600">{agent.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      {selectedAgents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Group Chat ({selectedAgents.length} agents)
          </h3>
          
          {/* Messages */}
          <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Start a conversation with your selected agents
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.agent ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.agent
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {msg.agent && (
                        <div className="text-xs font-medium mb-1 text-blue-600">
                          {msg.agent.name}
                        </div>
                      )}
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600">Agents are thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || selectedAgents.length === 0 || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatTab;

