import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { Agent, ChatMessage, ChatSession, AgentResponse, ChatInput } from '../../types/agent.types';
import { HumanMimickingService } from './HumanMimickingService';
import { AIAgentGenerationService } from './AIAgentGenerationService';

interface ChatSessionData {
  id: string;
  agentIds: [string, string];
  messages: ChatMessage[];
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export class HumanChatService {
  private openai: OpenAI;
  private sessions: Map<string, ChatSessionData> = new Map();
  private agents: Map<string, Agent> = new Map();
  private humanMimickingService: HumanMimickingService;
  private aiAgentGenerationService: AIAgentGenerationService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.humanMimickingService = new HumanMimickingService();
    this.aiAgentGenerationService = new AIAgentGenerationService();
    this.initializeAgents();
  }

  private async initializeAgents() {
    // Create base agents
    const baseAgents: Agent[] = [
      {
        id: 'tech-savvy-1',
        name: 'Priya Sharma',
        demographics: {
          age: 28,
          location: 'Bangalore',
          occupation: 'Software Engineer',
          familyStatus: 'single',
          education: 'B.Tech Computer Science',
          income: '₹8L-₹12L',
          techSavviness: 'expert',
          englishLiteracy: 'native'
        },
        personality: {
          traits: ['analytical', 'curious', 'helpful', 'detail-oriented', 'innovative'],
          communicationStyle: 'conversational',
          decisionMaking: 'data-driven',
          riskTolerance: 'medium',
          emotionalTendency: 'expressive'
        },
        knowledge: {
          fintechLevel: 'expert',
          domainExpertise: ['mobile apps', 'user experience', 'product development'],
          commonMisconceptions: ['users always know what they want', 'more features = better product'],
          learningStyle: 'visual'
        },
        behaviors: {
          responsePatterns: ['asks technical questions', 'suggests improvements', 'thinks out loud'],
          hesitationTriggers: ['unclear requirements', 'poor user research', 'technical debt'],
          confidenceLevel: 9,
          typicalQuestions: ['What\'s the user research behind this?', 'How does this scale?', 'What\'s the technical architecture?'],
          painPoints: ['poor UX', 'unclear requirements', 'technical limitations']
        },
        preferences: {
          interfaceStyle: 'modern',
          informationDensity: 'high',
          interactionMode: 'interactive'
        },
        background: {
          workExperience: '5+ years in fintech startups',
          family: 'Single, lives with roommates',
          lifestyle: 'Tech-focused, work-life balance',
          goals: ['build innovative products', 'advance career', 'learn new technologies'],
          concerns: ['work-life balance', 'keeping up with tech trends', 'product quality']
        },
        quote: 'Technology should solve real problems, not create new ones.'
      },
      {
        id: 'novice-1',
        name: 'Rajesh Kumar',
        demographics: {
          age: 45,
          location: 'Mumbai',
          occupation: 'Small Business Owner',
          familyStatus: 'married',
          education: 'High School',
          income: '₹4L-₹6L',
          techSavviness: 'low',
          englishLiteracy: 'basic'
        },
        personality: {
          traits: ['cautious', 'practical', 'family-oriented', 'traditional', 'hardworking'],
          communicationStyle: 'direct',
          decisionMaking: 'collaborative',
          riskTolerance: 'low',
          emotionalTendency: 'reserved'
        },
        knowledge: {
          fintechLevel: 'novice',
          domainExpertise: ['traditional business', 'cash transactions', 'customer relations'],
          commonMisconceptions: ['digital payments are unsafe', 'apps are too complicated', 'technology is expensive'],
          learningStyle: 'kinesthetic'
        },
        behaviors: {
          responsePatterns: ['asks for clarification', 'expresses concerns', 'wants step-by-step guidance'],
          hesitationTriggers: ['technical jargon', 'complex processes', 'unclear benefits'],
          confidenceLevel: 4,
          typicalQuestions: ['Is this safe?', 'What if I make a mistake?', 'Can someone help me?'],
          painPoints: ['complex interfaces', 'unclear instructions', 'fear of making mistakes']
        },
        preferences: {
          interfaceStyle: 'simple',
          informationDensity: 'low',
          interactionMode: 'guided'
        },
        background: {
          workExperience: '20+ years running small business',
          family: 'Married with 2 children',
          lifestyle: 'Family-focused, traditional values',
          goals: ['provide for family', 'grow business safely', 'learn new skills gradually'],
          concerns: ['data security', 'making mistakes', 'wasting money', 'family safety']
        },
        quote: 'मुझे कुछ सरल चाहिए जो मैं आसानी से समझ सकूं। मैं गलती नहीं करना चाहता।'
      }
    ];

    // Enhance agents with human-like characteristics
    for (const baseAgent of baseAgents) {
      const enhancedAgent = await this.aiAgentGenerationService.generateHumanLikeAgent(baseAgent);
      this.agents.set(enhancedAgent.id, enhancedAgent);
    }
  }

  async createSession(agentIds: [string, string]): Promise<ChatSession> {
    const sessionId = uuidv4();
    const session: ChatSessionData = {
      id: sessionId,
      agentIds,
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, session);
    return this.mapToChatSession(session);
  }

  async sendMessage(sessionId: string, agentId: string, input: ChatInput): Promise<{ response: AgentResponse; message: ChatMessage }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Generate human-like response
    const response = await this.generateHumanResponse(agent, input, session);
    
    // Create message
    const message: ChatMessage = {
      id: uuidv4(),
      agentId,
      content: response.message,
      type: input.image ? 'image' : 'text',
      timestamp: new Date(),
      metadata: {
        confidence: response.confidence,
        emotion: response.emotion,
        hesitation: response.confidence < 0.6,
        reasoning: response.reasoning
      },
      attachments: input.image ? [{
        type: 'image',
        url: typeof input.image === 'string' ? input.image : 'data:image/jpeg;base64,' + input.image,
        description: 'User uploaded image'
      }] : undefined
    };

    // Add message to session
    session.messages.push(message);
    session.updatedAt = new Date();

    return { response, message };
  }

  private async generateHumanResponse(agent: Agent, input: ChatInput, session: ChatSessionData): Promise<AgentResponse> {
    try {
      // Use the human mimicking service to generate a natural response
      const response = await this.aiAgentGenerationService.enhanceAgentResponse(
        agent, 
        input.text || 'Please analyze this image and provide feedback.',
        session.messages
      );

      // Detect emotion from the response
      const emotion = this.humanMimickingService.detectHumanEmotion(response, agent);
      
      // Calculate confidence based on response characteristics
      const confidence = this.calculateConfidence(response, agent);

      return {
        message: response,
        confidence,
        emotion,
        reasoning: this.generateReasoning(agent, response),
        designFeedback: input.image ? this.generateDesignFeedback(agent, input, response) : undefined
      };
    } catch (error) {
      console.error('Error generating human response:', error);
      return {
        message: this.humanMimickingService.generateHumanFallback(agent),
        confidence: 0.3,
        emotion: 'concerned',
        reasoning: 'Technical difficulty encountered'
      };
    }
  }

  private calculateConfidence(response: string, agent: Agent): number {
    let confidence = 0.7; // Base confidence
    
    // Adjust based on agent personality
    if (agent.personality.traits.includes('confident')) {
      confidence += 0.1;
    }
    if (agent.personality.traits.includes('cautious')) {
      confidence -= 0.1;
    }
    
    // Adjust based on response characteristics
    if (response.includes('?')) {
      confidence -= 0.1; // Questions indicate uncertainty
    }
    if (response.includes('I think') || response.includes('maybe') || response.includes('perhaps')) {
      confidence -= 0.1; // Hedging language indicates uncertainty
    }
    if (response.includes('definitely') || response.includes('certainly') || response.includes('absolutely')) {
      confidence += 0.1; // Strong language indicates confidence
    }
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private generateReasoning(agent: Agent, response: string): string {
    const { personality, background, knowledge } = agent;
    
    let reasoning = 'Based on my personal experience';
    
    if (background.workExperience) {
      reasoning += ` and ${background.workExperience}`;
    }
    
    if (personality.traits.includes('analytical')) {
      reasoning += ', I analyzed this carefully';
    }
    
    if (personality.traits.includes('practical')) {
      reasoning += ' and considered the practical implications';
    }
    
    return reasoning;
  }

  private generateDesignFeedback(agent: Agent, input: ChatInput, response: string): any {
    const { demographics, personality } = agent;
    
    // Generate feedback scores based on agent's perspective
    const usability = demographics.techSavviness === 'low' ? 0.3 + Math.random() * 0.4 : 0.6 + Math.random() * 0.4;
    const aesthetics = personality.traits.includes('creative') ? 0.7 + Math.random() * 0.3 : 0.5 + Math.random() * 0.5;
    const functionality = 0.6 + Math.random() * 0.4;
    const accessibility = demographics.techSavviness === 'low' ? 0.8 + Math.random() * 0.2 : 0.5 + Math.random() * 0.5;
    const overall = (usability + aesthetics + functionality + accessibility) / 4;
    
    return {
      usability,
      aesthetics,
      functionality,
      accessibility,
      overall,
      comments: response
    };
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const session = this.sessions.get(sessionId);
    return session ? this.mapToChatSession(session) : null;
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    return this.agents.get(agentId) || null;
  }

  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async generateAgentConversation(agent1Id: string, agent2Id: string, topic: string): Promise<string[]> {
    const agent1 = this.agents.get(agent1Id);
    const agent2 = this.agents.get(agent2Id);
    
    if (!agent1 || !agent2) {
      throw new Error('One or both agents not found');
    }
    
    return await this.aiAgentGenerationService.generateAgentConversation(agent1, agent2, topic);
  }

  private mapToChatSession(session: ChatSessionData): ChatSession {
    return {
      id: session.id,
      agentIds: session.agentIds,
      messages: session.messages,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };
  }
}



