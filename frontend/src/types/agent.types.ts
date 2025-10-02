export interface Agent {
  id: string;
  name: string;
  avatar_url?: string;
  
  // Demographics
  age?: number;
  gender?: string;
  location?: {
    city: string;
    state: string;
    country: string;
    tier: string;
  };
  education?: string;
  occupation?: string;
  industry?: string;
  income_range?: string;
  family_status?: string;
  
  // Behavioral Traits
  personality?: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    [key: string]: any;
  };
  communication_style?: {
    directness: number;
    formality: number;
    emotional_expression: number;
    detail_level: number;
    [key: string]: any;
  };
  risk_tolerance?: string;
  tech_comfort?: string;
  financial_behavior?: {
    spending_pattern: string;
    saving_habits: string;
    investment_approach: string;
    [key: string]: any;
  };
  decision_making_style?: string;
  
  // Financial Profile
  credit_score_range?: string;
  banking_history?: any;
  loan_history?: any;
  investment_behavior?: any;
  spending_patterns?: any;
  
  // Psychological Profile
  motivations?: string[];
  fears?: string[];
  values?: string[];
  aspirations?: string[];
  pain_points?: string[];
  
  // Interaction Patterns
  response_patterns?: any;
  emotional_triggers?: any;
  conversation_style?: any;
  typical_phrases?: string[];
  
  // Performance Metrics
  consistency_score?: number;
  realism_score?: number;
  engagement_score?: number;
  usage_count?: number;
  
  // Metadata
  created_from?: string;
  generation_method?: string;
  quality_flags?: any;
  tags?: string[];
  notes?: string;
  
  created_at?: Date;
  updated_at?: Date;
}

export interface Conversation {
  id: string;
  agent_id: string;
  session_id: string;
  user_message: string;
  agent_response: string;
  emotional_state?: string;
  context_awareness?: any;
  relationship_with_interviewer?: string;
  energy_level?: number;
  topics_covered?: string[];
  decisions_made?: any[];
  evolving_opinions?: any;
  response_time_ms?: number;
  quality_score?: number;
  created_at?: Date;
}

export interface ResearchData {
  id: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  content?: string;
  processed_content?: string;
  insights?: any;
  quality_score?: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  metadata?: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface AgentGenerationCriteria {
  demographics: {
    age?: { min: number; max: number };
    income?: string;
    education?: string;
    occupation?: string;
    location?: string;
    family_status?: string;
  };
  behavioral: {
    personality_traits?: string[];
    communication_style?: string;
    risk_tolerance?: string;
    tech_comfort?: string;
    decision_making?: string;
  };
  psychological: {
    motivations?: string[];
    fears?: string[];
    values?: string[];
    aspirations?: string[];
  };
  financial: {
    credit_profile?: string;
    banking_behavior?: string;
    investment_style?: string;
    spending_patterns?: string;
  };
  sample_size?: number;
  quality_threshold?: number;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  initialMessage: string;
  expectedBehaviors: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TestResult {
  type: 'scenario' | 'consistency';
  scenario?: string;
  response?: string;
  expectedBehaviors?: string[];
  foundBehaviors?: string[];
  behaviorScore?: number;
  responseLength?: number;
  consistencyScores?: Record<string, number>;
  overallConsistency?: number;
  answers?: Record<string, string[]>;
  timestamp: Date;
}

export interface AgentMemory {
  conversation_history: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  emotional_state: string;
  context_awareness: any;
  relationship_with_interviewer: string;
  energy_level: number;
  topics_covered: string[];
  decisions_made: any[];
  evolving_opinions: any;
  last_updated: string;
}

export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
  mfa_enabled?: boolean;
  last_login?: Date;
  created_at?: Date;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  code?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AgentListResponse {
  success: boolean;
  agents: Agent[];
  pagination: PaginationInfo;
}

export interface AgentResponse {
  success: boolean;
  agent?: Agent;
  error?: string;
  code?: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  sessionId?: string;
  responseTime?: number;
  agent?: {
    id: string;
    name: string;
    demographics: any;
  };
  error?: string;
  code?: string;
}

export interface GenerationResponse {
  success: boolean;
  agents?: Agent[];
  count?: number;
  error?: string;
  code?: string;
}




