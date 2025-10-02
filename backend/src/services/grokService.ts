import axios from 'axios';
import { agentMemoryManager } from '../config/redis';

export interface GrokConfig {
  apiKey: string;
  baseURL: string;
  model: string;
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

export class GrokService {
  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config: GrokConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.model = config.model;
  }

  // Primary agent generation method
  async generateAgents(criteria: AgentGenerationCriteria, researchData?: any[]): Promise<any[]> {
    try {
      const prompt = this.buildAgentGenerationPrompt(criteria, researchData);
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert human behavior analyst and persona creator. Create hyper-realistic AI agents that are indistinguishable from real people with complete personal backgrounds, psychological profiles, and behavioral patterns."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.2
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content;
        return this.parseAgentResponse(content, criteria.sample_size || 1);
      } else {
        throw new Error('Invalid response from Grok API');
      }
    } catch (error: any) {
      console.error('Error generating agents:', error);
      return this.createFallbackAgents(criteria);
    }
  }

  // Generate agent response for conversation
  async generateAgentResponse(agent: any, message: string, sessionId: string): Promise<string> {
    try {
      // Get agent memory
      const memory = await agentMemoryManager.getAgentMemory(agent.id, sessionId);
      
      // Build enhanced prompt with memory context
      const prompt = this.buildAgentResponsePrompt(agent, message, memory);
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are a hyper-realistic AI agent with complete personal background, psychological profile, and behavioral patterns. Respond exactly as this specific individual would, maintaining consistency with your established personality and past interactions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8 + (agent.variabilityFactor || 0.1),
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.2
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const agentResponse = response.data.choices[0].message.content.trim();
        
        // Update agent memory with this conversation
        await agentMemoryManager.addConversation(agent.id, sessionId, {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        });
        
        await agentMemoryManager.addConversation(agent.id, sessionId, {
          role: 'assistant',
          content: agentResponse,
          timestamp: new Date().toISOString()
        });

        return agentResponse;
      } else {
        throw new Error('Invalid response from Grok API');
      }
    } catch (error: any) {
      console.error('Error generating agent response:', error);
      return this.createFallbackAgentResponse(agent, message);
    }
  }

  // Process research data for insights
  async processResearchData(researchData: any[]): Promise<any> {
    try {
      const prompt = this.buildResearchAnalysisPrompt(researchData);
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: this.model,
        messages: [
          {
            role: "system",
            content: "You are an expert research analyst. Analyze the provided research data to extract detailed user personas, behavioral patterns, emotional responses, pain points, goals, demographics, and communication styles. Create a rich taxonomy of user types with specific characteristics and interaction patterns."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.7,
        top_p: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
      });

      if (response.data && response.data.choices && response.data.choices.length > 0) {
        return JSON.parse(response.data.choices[0].message.content);
      } else {
        throw new Error('Invalid response from Grok API');
      }
    } catch (error: any) {
      console.error('Error processing research data:', error);
      return this.createFallbackInsights(researchData);
    }
  }

  private buildAgentGenerationPrompt(criteria: AgentGenerationCriteria, researchData?: any[]): string {
    const researchContext = researchData ? 
      `\n\nRESEARCH CONTEXT:\n${researchData.map(doc => `File: ${doc.filename}\nContent: ${doc.content?.substring(0, 500)}...`).join('\n\n')}` : '';

    return `Create ${criteria.sample_size || 1} hyper-realistic AI agent(s) with these exact characteristics:

DEMOGRAPHIC PROFILE:
- Age: ${criteria.demographics.age ? `${criteria.demographics.age.min}-${criteria.demographics.age.max} years` : 'Not specified'}
- Income: ${criteria.demographics.income || 'Not specified'}
- Education: ${criteria.demographics.education || 'Not specified'}
- Occupation: ${criteria.demographics.occupation || 'Not specified'}
- Location: ${criteria.demographics.location || 'Not specified'}
- Family Status: ${criteria.demographics.family_status || 'Not specified'}

BEHAVIORAL TRAITS:
- Personality: ${criteria.behavioral.personality_traits?.join(', ') || 'Not specified'}
- Communication Style: ${criteria.behavioral.communication_style || 'Not specified'}
- Risk Tolerance: ${criteria.behavioral.risk_tolerance || 'Not specified'}
- Tech Comfort: ${criteria.behavioral.tech_comfort || 'Not specified'}
- Decision Making: ${criteria.behavioral.decision_making || 'Not specified'}

PSYCHOLOGICAL PROFILE:
- Motivations: ${criteria.psychological.motivations?.join(', ') || 'Not specified'}
- Fears: ${criteria.psychological.fears?.join(', ') || 'Not specified'}
- Values: ${criteria.psychological.values?.join(', ') || 'Not specified'}
- Aspirations: ${criteria.psychological.aspirations?.join(', ') || 'Not specified'}

FINANCIAL PROFILE:
- Credit Profile: ${criteria.financial.credit_profile || 'Not specified'}
- Banking Behavior: ${criteria.financial.banking_behavior || 'Not specified'}
- Investment Style: ${criteria.financial.investment_style || 'Not specified'}
- Spending Patterns: ${criteria.financial.spending_patterns || 'Not specified'}
${researchContext}

Each agent must be a fully-formed individual with:

1. PERSONAL IDENTITY
- Complete name with cultural authenticity
- Detailed personal background and life story
- Family situation and relationships
- Educational and professional journey
- Current life circumstances and challenges

2. PSYCHOLOGICAL PROFILE
- Core personality traits (Big 5 + cultural dimensions)
- Emotional patterns and typical responses
- Cognitive biases and decision-making style
- Internal contradictions that make them human
- Coping mechanisms and stress responses

3. BEHAVIORAL PATTERNS
- Communication style and speech patterns
- Technology adoption and digital behavior
- Financial decision-making approach
- Risk assessment methodology
- Social influence susceptibility

4. CONTEXTUAL KNOWLEDGE
- Industry-specific understanding
- Regional and cultural awareness
- Economic environment perception
- Generational perspectives
- Personal financial history and current situation

5. INTERACTION CAPABILITIES
- Natural conversation flow
- Appropriate emotional responses
- Memory of past interactions
- Ability to show confusion, change opinions
- Realistic response timing and depth

Output a comprehensive JSON array with each agent having this structure:
{
  "name": "string",
  "demographics": { "age": number, "gender": "string", "location": {...}, ... },
  "personality": { "openness": number, "conscientiousness": number, ... },
  "communication_style": { "directness": number, "formality": number, ... },
  "psychological_profile": { "motivations": [...], "fears": [...], ... },
  "financial_profile": { "credit_score_range": "string", ... },
  "behavioral_patterns": { "response_patterns": {...}, ... },
  "typical_phrases": [...],
  "variabilityFactor": number
}`;
  }

  private buildAgentResponsePrompt(agent: any, message: string, memory: any): string {
    const conversationHistory = memory?.conversation_history ? 
      memory.conversation_history.slice(-10).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') : '';

    return `You are ${agent.name}, a ${agent.demographics?.age || 'unknown'} year old ${agent.demographics?.occupation || 'person'} from ${agent.demographics?.location?.city || 'unknown location'}.

COMPLETE PROFILE:
${JSON.stringify(agent, null, 2)}

CURRENT MEMORY STATE:
- Emotional State: ${memory?.emotional_state || 'neutral'}
- Energy Level: ${memory?.energy_level || 0.7}
- Topics Covered: ${memory?.topics_covered?.join(', ') || 'none'}
- Relationship Context: ${memory?.relationship_with_interviewer || 'professional'}

${conversationHistory ? `RECENT CONVERSATION:\n${conversationHistory}\n` : ''}

Respond to this query exactly as this person would, considering:
- Your complete personal background and current situation
- Your communication style and personality traits
- Your emotional state and relationship context
- Your knowledge level and cultural perspective
- Your financial situation and past experiences
- Any relevant memories from previous conversations

Be completely authentic to this character. Show appropriate emotions, use natural speech patterns, include personal references when relevant, and maintain absolute consistency with your established personality and background.

QUERY: "${message}"

Respond as this person naturally would in a real conversation:`;
  }

  private buildResearchAnalysisPrompt(researchData: any[]): string {
    const dataSummary = researchData.map(doc => 
      `File: ${doc.filename}\nType: ${doc.file_type}\nContent: ${doc.content?.substring(0, 1000)}...`
    ).join('\n\n');

    return `Analyze this comprehensive research dataset and extract detailed user personas, behavioral patterns, emotional responses, pain points, goals, demographics, and communication styles.

RESEARCH DATA:
${dataSummary}

Create a rich taxonomy of user types with specific characteristics, quote examples, and interaction patterns. Focus on nuanced differences between user segments.

Output structured JSON with:
1. User personas with detailed demographics and psychological profiles
2. Behavioral patterns and decision-making styles
3. Emotional triggers and communication preferences
4. Pain points and motivations
5. Cultural and regional variations
6. Technology adoption patterns
7. Financial behavior insights

Format as a comprehensive analysis that can be used to generate realistic AI agents.`;
  }

  private parseAgentResponse(content: string, expectedCount: number): any[] {
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, expectedCount);
      }
      
      // If single object, wrap in array
      if (typeof parsed === 'object') {
        return [parsed];
      }
      
      throw new Error('Invalid JSON format');
    } catch (error) {
      console.error('Error parsing agent response:', error);
      return this.createFallbackAgents({ sample_size: expectedCount });
    }
  }

  private createFallbackAgents(criteria: AgentGenerationCriteria): any[] {
    const count = criteria.sample_size || 1;
    const agents = [];
    
    for (let i = 0; i < count; i++) {
      agents.push({
        name: `Agent ${i + 1}`,
        demographics: {
          age: criteria.demographics.age?.min || 25,
          gender: 'Not specified',
          location: { city: 'Unknown', state: 'Unknown', country: 'Unknown' },
          education: criteria.demographics.education || 'Not specified',
          occupation: criteria.demographics.occupation || 'Not specified',
          income_range: criteria.demographics.income || 'Not specified',
          family_status: criteria.demographics.family_status || 'Not specified'
        },
        personality: {
          openness: 0.5,
          conscientiousness: 0.5,
          extraversion: 0.5,
          agreeableness: 0.5,
          neuroticism: 0.5
        },
        communication_style: {
          directness: 0.5,
          formality: 0.5,
          emotional_expression: 0.5,
          detail_level: 0.5
        },
        psychological_profile: {
          motivations: criteria.psychological.motivations || ['General motivation'],
          fears: criteria.psychological.fears || ['General concerns'],
          values: criteria.psychological.values || ['General values'],
          aspirations: criteria.psychological.aspirations || ['General goals']
        },
        financial_profile: {
          credit_score_range: criteria.financial.credit_profile || 'Not specified',
          banking_behavior: criteria.financial.banking_behavior || 'Not specified',
          investment_style: criteria.financial.investment_style || 'Not specified',
          spending_patterns: criteria.financial.spending_patterns || 'Not specified'
        },
        behavioral_patterns: {
          response_patterns: {},
          emotional_triggers: {},
          conversation_style: {}
        },
        typical_phrases: ['I think...', 'In my experience...', 'That\'s interesting...'],
        variabilityFactor: 0.1
      });
    }
    
    return agents;
  }

  private createFallbackAgentResponse(agent: any, message: string): string {
    const responses = [
      `As ${agent.name}, I'd say: "${message}" - that's interesting from my perspective.`,
      `Well, from my experience, I think "${message}" relates to how I typically approach things.`,
      `You know, I see "${message}" differently based on my background.`,
      `That's a good point about "${message}". In my situation, I often handle things differently.`,
      `Interesting perspective on "${message}". From where I sit, I'd approach this by considering my usual preferences.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private createFallbackInsights(researchData: any[]): any {
    return {
      personas: [
        {
          name: 'General User',
          demographics: { age_range: '25-45', income: 'Medium', education: 'Graduate' },
          behaviors: ['Regular user', 'Tech comfortable'],
          pain_points: ['General concerns'],
          motivations: ['Convenience', 'Efficiency']
        }
      ],
      patterns: ['General behavioral patterns'],
      insights: ['General insights from research data']
    };
  }
}

export default GrokService;




