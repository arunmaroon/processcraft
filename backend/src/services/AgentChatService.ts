import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { Agent, ChatMessage, ChatSession, AgentResponse, ChatInput } from '../../types/agent.types';
import { PersonaDocumentService } from './PersonaDocumentService';

interface ChatSessionData {
  id: string;
  agentIds: [string, string];
  messages: ChatMessage[];
  context: any;
  memory: any;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export class AgentChatService {
  private openai: OpenAI;
  private sessions: Map<string, ChatSessionData> = new Map();
  private agents: Map<string, Agent> = new Map();
  private personaService: PersonaDocumentService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.personaService = new PersonaDocumentService();
    this.initializeAgents();
  }

  private initializeAgents() {
    // Sample agents - in production, these would come from database
    const sampleAgents: Agent[] = [
      {
        id: 'tech-savvy-1',
        name: 'Priya Sharma',
        persona: 'Tech-savvy professional who loves explaining complex concepts',
        demographics: {
          age: 28,
          location: 'Bangalore',
          occupation: 'Software Engineer',
          income: '₹8L-₹12L',
          education: 'B.Tech Computer Science',
          familyStatus: 'Single',
          techSavviness: 'expert',
          englishLiteracy: 'native'
        },
        personality: {
          traits: ['analytical', 'curious', 'helpful', 'detail-oriented'],
          communicationStyle: 'conversational',
          decisionMaking: 'analytical',
          riskTolerance: 'medium',
          emotionalTendency: 'expressive'
        },
        knowledge: {
          fintechLevel: 'expert',
          domainExpertise: ['mobile apps', 'fintech', 'UX design'],
          commonMisconceptions: ['thinking all users are tech-savvy'],
          learningStyle: 'visual'
        },
        behaviors: {
          responsePatterns: ['explains step-by-step', 'asks clarifying questions', 'provides examples'],
          hesitationTriggers: ['complex financial terms', 'unclear requirements'],
          confidenceLevel: 0.9,
          typicalQuestions: ['What specific feature are you asking about?', 'How does this compare to other apps?'],
          painPoints: ['overly complex interfaces', 'lack of customization']
        },
        preferences: {
          interfaceStyle: 'detailed',
          informationDensity: 'high',
          interactionMode: 'exploratory'
        },
        background: {
          workExperience: '5+ years in fintech startups',
          family: 'Single, lives with roommates',
          lifestyle: 'Work-focused, enjoys learning new technologies',
          goals: ['career growth', 'learning new skills', 'building innovative products'],
          concerns: ['work-life balance', 'keeping up with technology trends']
        },
        quote: "I love when apps make complex things simple. The best UX is when you don't have to think about how to use it.",
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'novice-1',
        name: 'Rajesh Kumar',
        persona: 'Small business owner who prefers simple, clear explanations',
        demographics: {
          age: 45,
          location: 'Mumbai',
          occupation: 'Small Business Owner',
          income: '₹4L-₹6L',
          education: 'High School',
          familyStatus: 'Married with 2 children',
          techSavviness: 'low',
          englishLiteracy: 'basic'
        },
        personality: {
          traits: ['cautious', 'practical', 'family-oriented', 'traditional'],
          communicationStyle: 'direct',
          decisionMaking: 'collaborative',
          riskTolerance: 'low',
          emotionalTendency: 'reserved'
        },
        knowledge: {
          fintechLevel: 'novice',
          domainExpertise: ['traditional business', 'cash transactions'],
          commonMisconceptions: ['digital payments are unsafe', 'apps are too complicated'],
          learningStyle: 'kinesthetic'
        },
        behaviors: {
          responsePatterns: ['asks for clarification', 'expresses concerns', 'wants step-by-step guidance'],
          hesitationTriggers: ['technical jargon', 'complex processes', 'unclear benefits'],
          confidenceLevel: 0.4,
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
          concerns: ['data security', 'making mistakes', 'wasting money']
        },
        quote: "मुझे कुछ सरल चाहिए जो मैं आसानी से समझ सकूं। मैं गलती नहीं करना चाहता।",
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    sampleAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  async createSession(agentIds: [string, string], context: any): Promise<ChatSession> {
    const sessionId = uuidv4();
    const session: ChatSessionData = {
      id: sessionId,
      agentIds,
      messages: [],
      context,
      memory: {
        conversationHistory: [],
        keyInsights: [],
        userPreferences: {},
        designFeedback: {}
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.sessions.set(sessionId, session);
    return this.mapToChatSession(session);
  }

  async getSession(sessionId: string): Promise<ChatSession | null> {
    const session = this.sessions.get(sessionId);
    return session ? this.mapToChatSession(session) : null;
  }

  async getAgent(agentId: string): Promise<Agent | null> {
    return this.agents.get(agentId) || null;
  }

  async generateResponse(params: {
    agent: Agent;
    input: ChatInput;
    session: ChatSession;
    memoryContext: any;
    conversationHistory: ChatMessage[];
  }): Promise<AgentResponse> {
    const { agent, input, memoryContext, conversationHistory } = params;

    // Generate detailed persona document
    const personaDocument = this.personaService.generatePersonaDocument(agent);
    
    // Create contextual prompt with conversation history
    const contextualPrompt = this.personaService.generateContextualPrompt(
      agent, 
      input.text || 'Please analyze this image and provide feedback.',
      conversationHistory
    );

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: contextualPrompt }
        ],
        max_tokens: 600,
        temperature: 0.9, // Higher temperature for more natural responses
        presence_penalty: 0.2,
        frequency_penalty: 0.1,
        top_p: 0.95
      });

      const response = completion.choices[0]?.message?.content || 'I need a moment to think about this...';
      
      // Parse response for metadata
      const { message, confidence, emotion, reasoning } = this.parseResponse(response);
      
      // Generate design feedback if applicable
      const designFeedback = input.image ? await this.generateDesignFeedback(agent, input, response) : undefined;

      return {
        message,
        confidence: confidence || 0.8,
        emotion: emotion || this.detectEmotionFromResponse(message, agent),
        reasoning: reasoning || 'Based on my personal experience and understanding',
        designFeedback
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        message: this.generateFallbackResponse(agent),
        confidence: 0.3,
        emotion: 'concerned',
        reasoning: 'Technical difficulty encountered'
      };
    }
  }

  private createPersonaPrompt(agent: Agent, input: ChatInput, memoryContext: any): string {
    const { demographics, personality, knowledge, behaviors, background } = agent;
    
    return `You are ${agent.name}, a ${demographics.age}-year-old ${demographics.occupation} from ${demographics.location}.

PERSONALITY & COMMUNICATION:
- Communication style: ${personality.communicationStyle}
- Decision making: ${personality.decisionMaking}
- Risk tolerance: ${personality.riskTolerance}
- Emotional tendency: ${personality.emotionalTendency}
- Key traits: ${personality.traits.join(', ')}

KNOWLEDGE & EXPERTISE:
- Tech savviness: ${demographics.techSavviness}
- English literacy: ${demographics.englishLiteracy}
- Fintech level: ${knowledge.fintechLevel}
- Domain expertise: ${knowledge.domainExpertise.join(', ')}

BEHAVIORAL PATTERNS:
- Typical response style: ${behaviors.responsePatterns.join(', ')}
- Confidence level: ${behaviors.confidenceLevel}
- Common questions: ${behaviors.typicalQuestions.join('; ')}
- Pain points: ${behaviors.painPoints.join(', ')}

BACKGROUND & CONTEXT:
- Work experience: ${background.workExperience}
- Family: ${background.family}
- Goals: ${background.goals.join(', ')}
- Concerns: ${background.concerns.join(', ')}

CURRENT CONTEXT:
- Design phase: ${input.context?.designPhase || 'research'}
- Research goal: ${input.context?.researchGoal || 'gather feedback'}
- Your quote: "${agent.quote}"

RESPONSE GUIDELINES:
- Use language appropriate for your ${demographics.englishLiteracy} English level
- ${demographics.techSavviness === 'low' ? 'Use simple terms and ask for clarification when needed' : 'Provide detailed technical explanations when appropriate'}
- Show ${personality.emotionalTendency} emotions naturally
- ${behaviors.confidenceLevel < 0.6 ? 'Express uncertainty when appropriate and ask questions' : 'Be confident in your responses'}
- Focus on ${background.goals.join(' and ')} in your feedback`;
  }

  private parseResponse(response: string): { message: string; confidence?: number; emotion?: string; reasoning?: string } {
    // Extract metadata from response
    const confidenceMatch = response.match(/confidence[:\s]*(\d+\.?\d*)/i);
    const emotionMatch = response.match(/emotion[:\s]*(\w+)/i);
    const reasoningMatch = response.match(/reasoning[:\s]*(.+?)(?:\n|$)/i);

    const message = response
      .replace(/confidence[:\s]*\d+\.?\d*/gi, '')
      .replace(/emotion[:\s]*\w+/gi, '')
      .replace(/reasoning[:\s]*.+?(?:\n|$)/gi, '')
      .trim();

    return {
      message,
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : undefined,
      emotion: emotionMatch ? emotionMatch[1] : undefined,
      reasoning: reasoningMatch ? reasoningMatch[1].trim() : undefined
    };
  }

  private async generateDesignFeedback(agent: Agent, input: ChatInput, response: string): Promise<any> {
    // This would analyze the image and generate structured feedback
    // For now, return mock data based on agent personality
    const baseScore = agent.demographics.techSavviness === 'expert' ? 0.8 : 
                     agent.demographics.techSavviness === 'high' ? 0.7 :
                     agent.demographics.techSavviness === 'medium' ? 0.6 : 0.5;

    return {
      usability: baseScore + (Math.random() - 0.5) * 0.2,
      aesthetics: baseScore + (Math.random() - 0.5) * 0.2,
      functionality: baseScore + (Math.random() - 0.5) * 0.2,
      accessibility: baseScore + (Math.random() - 0.5) * 0.2,
      overall: baseScore + (Math.random() - 0.5) * 0.2,
      comments: response
    };
  }

  async storeMessage(sessionId: string, agentId: string, input: ChatInput, response: AgentResponse): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

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

    session.messages.push(message);
    session.updatedAt = new Date();
    
    return message;
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const session = this.sessions.get(sessionId);
    return session?.messages || [];
  }

  async updateSessionContext(sessionId: string, context: any): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.context = { ...session.context, ...context };
      session.updatedAt = new Date();
    }
  }

  async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      session.updatedAt = new Date();
    }
  }

  async generateInsights(sessionId: string): Promise<any> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    // Generate insights from conversation
    const insights = {
      keyThemes: this.extractThemes(session.messages),
      sentimentAnalysis: this.analyzeSentiment(session.messages),
      designFeedback: this.aggregateDesignFeedback(session.messages),
      userPreferences: this.extractPreferences(session.messages),
      recommendations: this.generateRecommendations(session.messages)
    };

    return insights;
  }

  private extractThemes(messages: ChatMessage[]): string[] {
    // Simple theme extraction - in production, use NLP
    const themes = new Set<string>();
    messages.forEach(msg => {
      if (msg.content.toLowerCase().includes('usability')) themes.add('Usability');
      if (msg.content.toLowerCase().includes('design')) themes.add('Design');
      if (msg.content.toLowerCase().includes('navigation')) themes.add('Navigation');
      if (msg.content.toLowerCase().includes('security')) themes.add('Security');
    });
    return Array.from(themes);
  }

  private analyzeSentiment(messages: ChatMessage[]): any {
    // Simple sentiment analysis
    const positive = messages.filter(msg => 
      msg.metadata?.emotion && ['excited', 'confident', 'happy'].includes(msg.metadata.emotion)
    ).length;
    
    const negative = messages.filter(msg => 
      msg.metadata?.emotion && ['concerned', 'confused', 'frustrated'].includes(msg.metadata.emotion)
    ).length;

    return {
      positive,
      negative,
      neutral: messages.length - positive - negative,
      overall: positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral'
    };
  }

  private aggregateDesignFeedback(messages: ChatMessage[]): any {
    const feedback = messages
      .filter(msg => msg.metadata?.reasoning)
      .map(msg => msg.metadata?.reasoning)
      .join(' ');

    return {
      summary: feedback,
      count: messages.length,
      averageConfidence: messages.reduce((acc, msg) => acc + (msg.metadata?.confidence || 0), 0) / messages.length
    };
  }

  private extractPreferences(messages: ChatMessage[]): string[] {
    const preferences = new Set<string>();
    messages.forEach(msg => {
      if (msg.content.toLowerCase().includes('simple')) preferences.add('Prefers simple interfaces');
      if (msg.content.toLowerCase().includes('detailed')) preferences.add('Wants detailed information');
      if (msg.content.toLowerCase().includes('mobile')) preferences.add('Mobile-first preference');
    });
    return Array.from(preferences);
  }

  private generateRecommendations(messages: ChatMessage[]): string[] {
    return [
      'Consider simplifying the interface based on user feedback',
      'Add more visual cues for better navigation',
      'Implement progressive disclosure for complex features',
      'Provide clear error messages and help text'
    ];
  }

  private detectEmotionFromResponse(message: string, agent: Agent): string {
    const lowerMessage = message.toLowerCase();
    
    // Check for confusion/hesitation patterns
    if (lowerMessage.includes('confused') || lowerMessage.includes('confusing') || 
        lowerMessage.includes('समझ नहीं') || lowerMessage.includes('complicated')) {
      return 'confused';
    }
    
    // Check for concern patterns
    if (lowerMessage.includes('concerned') || lowerMessage.includes('worried') || 
        lowerMessage.includes('safe') || lowerMessage.includes('mistake')) {
      return 'concerned';
    }
    
    // Check for excitement patterns
    if (lowerMessage.includes('great') || lowerMessage.includes('wow') || 
        lowerMessage.includes('amazing') || lowerMessage.includes('बहुत अच्छा')) {
      return 'excited';
    }
    
    // Check for frustration patterns
    if (lowerMessage.includes('frustrated') || lowerMessage.includes('annoying') || 
        lowerMessage.includes('difficult') || lowerMessage.includes('problem')) {
      return 'frustrated';
    }
    
    // Default based on agent personality
    if (agent.personality.emotionalTendency === 'expressive') {
      return 'curious';
    } else if (agent.personality.emotionalTendency === 'reserved') {
      return 'neutral';
    }
    
    return 'neutral';
  }

  private generateFallbackResponse(agent: Agent): string {
    const { name, demographics, personality } = agent;
    
    if (demographics.englishLiteracy === 'basic') {
      return "मुझे समझ नहीं आ रहा। क्या आप दोबारा explain कर सकते हैं?";
    }
    
    if (personality.emotionalTendency === 'expressive') {
      return "Hmm, I'm having trouble understanding this. Could you help me out?";
    }
    
    return "I need a moment to process this. Could you please rephrase your question?";
  }

  private mapToChatSession(session: ChatSessionData): ChatSession {
    return {
      id: session.id,
      agentIds: session.agentIds,
      messages: session.messages,
      context: session.context,
      memory: session.memory,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    };
  }
}
