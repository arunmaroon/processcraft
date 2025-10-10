export interface Agent {
  id: string;
  name: string;
  persona: string;
  demographics: {
    age: number;
    location: string;
    occupation: string;
    income: string;
    education: string;
    familyStatus: string;
    techSavviness: 'low' | 'medium' | 'high' | 'expert';
    englishLiteracy: 'basic' | 'intermediate' | 'fluent' | 'native';
  };
  personality: {
    traits: string[];
    communicationStyle: 'direct' | 'conversational' | 'formal' | 'casual';
    decisionMaking: 'analytical' | 'intuitive' | 'collaborative' | 'independent';
    riskTolerance: 'low' | 'medium' | 'high';
    emotionalTendency: 'reserved' | 'expressive' | 'balanced';
  };
  knowledge: {
    fintechLevel: 'novice' | 'intermediate' | 'advanced' | 'expert';
    domainExpertise: string[];
    commonMisconceptions: string[];
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  };
  behaviors: {
    responsePatterns: string[];
    hesitationTriggers: string[];
    confidenceLevel: number; // 0-1
    typicalQuestions: string[];
    painPoints: string[];
  };
  preferences: {
    interfaceStyle: 'simple' | 'detailed' | 'minimal' | 'comprehensive';
    informationDensity: 'low' | 'medium' | 'high';
    interactionMode: 'guided' | 'exploratory' | 'efficient';
  };
  background: {
    workExperience: string;
    family: string;
    lifestyle: string;
    goals: string[];
    concerns: string[];
  };
  quote: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'busy';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  agentId: string;
  content: string;
  type: 'text' | 'image' | 'system';
  timestamp: Date;
  isTyping?: boolean;
  metadata?: {
    confidence?: number;
    emotion?: string;
    hesitation?: boolean;
    reasoning?: string;
  };
  attachments?: {
    type: 'image' | 'document';
    url: string;
    description?: string;
  }[];
}

export interface ChatSession {
  id: string;
  agentIds: [string, string];
  messages: ChatMessage[];
  context: {
    topic?: string;
    designPhase?: string;
    researchGoal?: string;
    userInput?: string;
  };
  memory: {
    conversationHistory: string[];
    keyInsights: string[];
    userPreferences: Record<string, any>;
    designFeedback: Record<string, any>;
  };
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentResponse {
  message: string;
  confidence: number;
  emotion: string;
  reasoning: string;
  followUpQuestions?: string[];
  designFeedback?: {
    usability: number;
    aesthetics: number;
    functionality: number;
    accessibility: number;
    overall: number;
    comments: string;
  };
}

export interface ChatInput {
  text?: string;
  image?: File | string;
  context?: {
    designPhase: string;
    researchGoal: string;
    specificQuestion?: string;
  };
}

export interface AgentSelection {
  agent1: Agent | null;
  agent2: Agent | null;
  comparisonMode: boolean;
}

export interface MemoryContext {
  sessionId: string;
  agentId: string;
  conversationHistory: ChatMessage[];
  userContext: Record<string, any>;
  designContext: Record<string, any>;
}

export interface EthicalGuardrails {
  biasDetection: boolean;
  inappropriateContent: boolean;
  privacyProtection: boolean;
  culturalSensitivity: boolean;
  accessibilityCompliance: boolean;
}

export interface ChatConfig {
  maxTokens: number;
  temperature: number;
  model: string;
  enableMemory: boolean;
  enableEthicalGuardrails: boolean;
  responseDelay: {
    min: number;
    max: number;
  };
  typingSpeed: {
    min: number;
    max: number;
  };
}