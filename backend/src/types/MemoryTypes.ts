export interface AgentMemory {
  agentId: string;
  persona: {
    name: string;
    demographics: {
      age: number;
      location: string;
      occupation: string;
      income: string;
      familyStatus: string;
      techSavviness: string;
      englishLiteracy: string;
    };
    personality: {
      traits: string[];
      communicationStyle: string;
      emotionalTone: string;
      responseLength: 'brief' | 'moderate' | 'detailed';
      riskTolerance: 'low' | 'medium' | 'high';
      decisionMaking: 'analytical' | 'intuitive' | 'collaborative';
    };
    preferences: {
      topics: string[];
      communicationChannels: string[];
      responseTime: 'immediate' | 'within_hour' | 'within_day';
      formality: 'casual' | 'professional' | 'formal';
    };
    lastUpdated: string;
  };
}

export interface ConversationMemory {
  sessionId: string;
  agentId: string;
  messages: {
    role: 'user' | 'agent';
    content: string;
    timestamp: string;
  }[];
  context: {
    topic: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: 'low' | 'medium' | 'high';
  };
  lastUpdated: string;
}

export interface ResearchMemory {
  researchId: string;
  agentId: string;
  insights: {
    keyFindings: string[];
    patterns: string[];
    recommendations: string[];
  };
  data: {
    sources: string[];
    metrics: Record<string, number>;
    trends: string[];
  };
  lastUpdated: string;
}

export interface MemorySearchResult {
  type: 'agent' | 'conversation' | 'research';
  id: string;
  content: string;
  relevance: number;
  metadata: {
    agentId?: string;
    sessionId?: string;
    timestamp: string;
    type: 'conversation' | 'persona' | 'research';
    score: number;
  };
}