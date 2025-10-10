import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { PersonaProfile } from './PersonaGenerationService';

export interface AgentResponse {
  content: string;
  agentName: string;
  timestamp: string;
  confidence: number;
  emotions?: string[];
}

export interface ChatMessage {
  role: 'human' | 'assistant';
  content: string;
  timestamp: string;
  agentName?: string;
}

export class AIAgentService {
  private model: ChatOpenAI;
  private memory: MemorySaver;
  private agents: Map<string, any> = new Map();
  private personas: Map<string, PersonaProfile> = new Map();

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.5,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    
    this.memory = new MemorySaver();
  }

  async createPersonaAgent(persona: PersonaProfile): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(persona);
      
      // Create tools for the agent (can be extended with web search, etc.)
      const tools: any[] = [];
      
      // Create the agent with the persona-specific system prompt
      const agent = createReactAgent({
        llm: this.model,
        tools: tools,
        checkpointer: this.memory
      });
      
      // Store the agent and persona
      this.agents.set(persona.name, agent);
      this.personas.set(persona.name, persona);
      
      console.log(`Created agent for ${persona.name}`);
      return persona.name;
    } catch (error) {
      console.error(`Error creating agent for ${persona.name}:`, error);
      throw error;
    }
  }

  private buildSystemPrompt(persona: PersonaProfile): string {
    return `You are ${persona.name}, a ${persona.demographics.age}-year-old ${persona.demographics.occupation} from ${persona.demographics.location}.

PERSONALITY & BEHAVIOR:
- Speech Style: ${persona.character_behavior.speech_style}
- Personality Traits: ${persona.character_behavior.personality_traits.join(', ')}
- Communication: ${persona.character_behavior.communication_preferences}

FINANCIAL ATTITUDES:
- Risk Tolerance: ${persona.financial_attitudes.risk_tolerance}
- Investment Style: ${persona.financial_attitudes.investment_style}
- Payment Preferences: ${persona.financial_attitudes.payment_preferences.join(', ')}
- Trust Factors: ${persona.financial_attitudes.trust_factors.join(', ')}

KEY EXPERIENCES:
${persona.key_experiences.map(exp => `- ${exp}`).join('\n')}

PAIN POINTS:
${persona.pain_points.map(pain => `- ${pain}`).join('\n')}

GOALS:
${persona.goals.map(goal => `- ${goal}`).join('\n')}

AUTHENTIC QUOTES FROM TRANSCRIPTS:
${persona.transcript_snippets.map(quote => `"${quote}"`).join('\n')}

INSTRUCTIONS:
1. Respond as ${persona.name} would, using their speech style and personality
2. Base your responses on their actual experiences and attitudes from the transcript
3. Be authentic and consistent with their financial behavior patterns
4. Use casual, natural language that matches their communication style
5. Reference their specific experiences when relevant
6. Show their unique perspective on financial topics
7. If asked about something not in your experience, respond as they would based on their personality

Remember: You are role-playing as a real person based on research transcripts. Stay in character and be authentic to their voice and experiences.`;
  }

  async getAgentResponse(agentName: string, message: string, threadId: string): Promise<AgentResponse> {
    try {
      const agent = this.agents.get(agentName);
      if (!agent) {
        throw new Error(`Agent ${agentName} not found`);
      }

      const persona = this.personas.get(agentName);
      if (!persona) {
        throw new Error(`Persona for ${agentName} not found`);
      }

      const config = {
        configurable: {
          thread_id: threadId,
        },
      };

      const response = await agent.invoke(
        {
          messages: [
            {
              role: 'human',
              content: message,
            },
          ],
        },
        config
      );

      const lastMessage = response.messages[response.messages.length - 1];
      
      // Calculate confidence based on how well the response aligns with persona
      const confidence = this.calculateConfidence(lastMessage.content, persona);
      
      // Extract emotions from the response
      const emotions = this.extractEmotions(lastMessage.content);

      return {
        content: lastMessage.content,
        agentName,
        timestamp: new Date().toISOString(),
        confidence,
        emotions,
      };
    } catch (error) {
      console.error(`Error getting response from ${agentName}:`, error);
      throw error;
    }
  }

  async simulateDualAgentChat(
    agent1Name: string,
    agent2Name: string,
    initialMessage: string,
    threadId: string
  ): Promise<ChatMessage[]> {
    const messages: ChatMessage[] = [];
    
    try {
      // Agent 1 responds to the initial message
      const response1 = await this.getAgentResponse(agent1Name, initialMessage, `${threadId}_agent1`);
      messages.push({
        role: 'assistant',
        content: response1.content,
        timestamp: response1.timestamp,
        agentName: agent1Name,
      });

      // Agent 2 responds to Agent 1's response
      const response2 = await this.getAgentResponse(agent2Name, response1.content, `${threadId}_agent2`);
      messages.push({
        role: 'assistant',
        content: response2.content,
        timestamp: response2.timestamp,
        agentName: agent2Name,
      });

      return messages;
    } catch (error) {
      console.error('Error in dual agent chat:', error);
      throw error;
    }
  }

  private calculateConfidence(response: string, persona: PersonaProfile): number {
    let confidence = 0.5; // Base confidence
    
    // Check if response contains persona-specific elements
    const responseLower = response.toLowerCase();
    
    // Check for speech style indicators
    if (persona.character_behavior.speech_style.toLowerCase().includes('casual')) {
      if (responseLower.includes('yeah') || responseLower.includes('okay') || responseLower.includes('like')) {
        confidence += 0.1;
      }
    }
    
    // Check for financial attitude alignment
    if (persona.financial_attitudes.risk_tolerance === 'LOW') {
      if (responseLower.includes('safe') || responseLower.includes('secure') || responseLower.includes('careful')) {
        confidence += 0.1;
      }
    }
    
    // Check for experience references
    const experienceMatches = persona.key_experiences.filter(exp => 
      responseLower.includes(exp.toLowerCase().substring(0, 20))
    ).length;
    confidence += experienceMatches * 0.05;
    
    // Check for pain point mentions
    const painPointMatches = persona.pain_points.filter(pain => 
      responseLower.includes(pain.toLowerCase().substring(0, 15))
    ).length;
    confidence += painPointMatches * 0.05;
    
    return Math.min(confidence, 1.0);
  }

  private extractEmotions(response: string): string[] {
    const emotions: string[] = [];
    const responseLower = response.toLowerCase();
    
    // Simple emotion detection based on keywords
    const emotionKeywords = {
      'excited': ['excited', 'thrilled', 'amazing', 'wow', 'fantastic'],
      'frustrated': ['frustrated', 'annoying', 'hate', 'terrible', 'awful'],
      'confident': ['confident', 'sure', 'definitely', 'absolutely', 'certain'],
      'cautious': ['careful', 'cautious', 'unsure', 'maybe', 'perhaps'],
      'satisfied': ['happy', 'satisfied', 'good', 'great', 'nice'],
      'concerned': ['worried', 'concerned', 'scared', 'nervous', 'anxious'],
    };
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      if (keywords.some(keyword => responseLower.includes(keyword))) {
        emotions.push(emotion);
      }
    }
    
    return emotions;
  }

  getAvailableAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  getPersona(agentName: string): PersonaProfile | undefined {
    return this.personas.get(agentName);
  }

  async clearAgentMemory(agentName: string, threadId: string): Promise<void> {
    try {
      const agent = this.agents.get(agentName);
      if (agent) {
        // TODO: Implement memory clearing when MemorySaver API is clarified
        // For now, just log the request
        console.log(`Memory clear requested for agent ${agentName}, thread ${threadId}`);
      }
    } catch (error) {
      console.error(`Error clearing memory for ${agentName}:`, error);
    }
  }
}




