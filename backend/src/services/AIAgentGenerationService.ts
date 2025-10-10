import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { Agent } from '../../types/agent.types';
import { HumanMimickingService } from './HumanMimickingService';

export class AIAgentGenerationService {
  private openai: OpenAI;
  private humanMimickingService: HumanMimickingService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.humanMimickingService = new HumanMimickingService();
  }

  async generateHumanLikeAgent(baseAgent: Agent): Promise<Agent> {
    try {
      const personaPrompt = this.humanMimickingService.generateHumanPersona(baseAgent);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at creating realistic human personas for AI agents. Create a detailed, authentic human persona that feels real and natural.

${personaPrompt}

Enhance this persona to make it more human-like and authentic. Add:
- Specific life experiences and stories
- Personal quirks and habits
- Real concerns and motivations
- Natural speech patterns
- Emotional responses
- Personal preferences and dislikes

Make this person feel like a real human being, not a character.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.8
      });

      const enhancedPersona = completion.choices[0]?.message?.content || '';
      
      // Parse and enhance the agent with the generated persona
      return this.enhanceAgentWithPersona(baseAgent, enhancedPersona);
    } catch (error) {
      console.error('Error generating human-like agent:', error);
      return baseAgent;
    }
  }

  private enhanceAgentWithPersona(agent: Agent, enhancedPersona: string): Agent {
    // Extract additional personality traits from the enhanced persona
    const additionalTraits = this.extractPersonalityTraits(enhancedPersona);
    const lifeExperiences = this.extractLifeExperiences(enhancedPersona);
    const personalQuirks = this.extractPersonalQuirks(enhancedPersona);
    
    return {
      ...agent,
      personality: {
        ...agent.personality,
        traits: [...agent.personality.traits, ...additionalTraits],
        lifeExperiences,
        personalQuirks
      },
      behaviors: {
        ...agent.behaviors,
        naturalResponses: this.generateNaturalResponses(agent, enhancedPersona),
        emotionalTriggers: this.extractEmotionalTriggers(enhancedPersona),
        conversationStarters: this.generateConversationStarters(agent)
      }
    };
  }

  private extractPersonalityTraits(persona: string): string[] {
    const traits = [];
    const lowerPersona = persona.toLowerCase();
    
    if (lowerPersona.includes('outgoing') || lowerPersona.includes('social')) traits.push('outgoing');
    if (lowerPersona.includes('introverted') || lowerPersona.includes('quiet')) traits.push('introverted');
    if (lowerPersona.includes('optimistic') || lowerPersona.includes('positive')) traits.push('optimistic');
    if (lowerPersona.includes('pessimistic') || lowerPersona.includes('worried')) traits.push('pessimistic');
    if (lowerPersona.includes('creative') || lowerPersona.includes('artistic')) traits.push('creative');
    if (lowerPersona.includes('logical') || lowerPersona.includes('analytical')) traits.push('logical');
    if (lowerPersona.includes('spontaneous') || lowerPersona.includes('impulsive')) traits.push('spontaneous');
    if (lowerPersona.includes('organized') || lowerPersona.includes('methodical')) traits.push('organized');
    
    return traits;
  }

  private extractLifeExperiences(persona: string): string[] {
    const experiences = [];
    const lowerPersona = persona.toLowerCase();
    
    if (lowerPersona.includes('graduated') || lowerPersona.includes('college')) experiences.push('college education');
    if (lowerPersona.includes('started business') || lowerPersona.includes('entrepreneur')) experiences.push('business ownership');
    if (lowerPersona.includes('moved') || lowerPersona.includes('relocated')) experiences.push('relocation');
    if (lowerPersona.includes('married') || lowerPersona.includes('wedding')) experiences.push('marriage');
    if (lowerPersona.includes('children') || lowerPersona.includes('kids')) experiences.push('parenthood');
    if (lowerPersona.includes('traveled') || lowerPersona.includes('trip')) experiences.push('travel');
    if (lowerPersona.includes('job') || lowerPersona.includes('career')) experiences.push('career development');
    
    return experiences;
  }

  private extractPersonalQuirks(persona: string): string[] {
    const quirks = [];
    const lowerPersona = persona.toLowerCase();
    
    if (lowerPersona.includes('coffee') || lowerPersona.includes('tea')) quirks.push('beverage preference');
    if (lowerPersona.includes('morning person') || lowerPersona.includes('early bird')) quirks.push('morning person');
    if (lowerPersona.includes('night owl') || lowerPersona.includes('late night')) quirks.push('night owl');
    if (lowerPersona.includes('music') || lowerPersona.includes('songs')) quirks.push('music lover');
    if (lowerPersona.includes('sports') || lowerPersona.includes('fitness')) quirks.push('sports enthusiast');
    if (lowerPersona.includes('reading') || lowerPersona.includes('books')) quirks.push('book lover');
    
    return quirks;
  }

  private generateNaturalResponses(agent: Agent, persona: string): string[] {
    const responses = [];
    const { demographics, personality } = agent;
    
    // Greeting responses
    if (demographics.englishLiteracy === 'basic') {
      responses.push('नमस्ते! कैसे हैं आप?', 'हैलो! सब ठीक है?', 'आप कैसे हैं?');
    } else {
      responses.push('Hello! How are you doing?', 'Hi there! How can I help?', 'Hey! What\'s going on?');
    }
    
    // Confusion responses
    if (personality.traits.includes('cautious')) {
      responses.push('I\'m not sure I understand. Could you explain more?', 'This seems complicated. Can you help me?');
    }
    
    // Excitement responses
    if (personality.emotionalTendency === 'expressive') {
      responses.push('That sounds amazing!', 'Wow, that\'s really interesting!', 'I love this idea!');
    }
    
    return responses;
  }

  private extractEmotionalTriggers(persona: string): string[] {
    const triggers = [];
    const lowerPersona = persona.toLowerCase();
    
    if (lowerPersona.includes('family') || lowerPersona.includes('children')) triggers.push('family concerns');
    if (lowerPersona.includes('money') || lowerPersona.includes('financial')) triggers.push('financial security');
    if (lowerPersona.includes('technology') || lowerPersona.includes('tech')) triggers.push('technology anxiety');
    if (lowerPersona.includes('safety') || lowerPersona.includes('secure')) triggers.push('safety concerns');
    if (lowerPersona.includes('time') || lowerPersona.includes('busy')) triggers.push('time pressure');
    
    return triggers;
  }

  private generateConversationStarters(agent: Agent): string[] {
    const starters = [];
    const { demographics, personality } = agent;
    
    if (demographics.techSavviness === 'low') {
      starters.push('I\'m not very good with technology. Can you help me?', 'This looks complicated. Is it safe?');
    } else if (demographics.techSavviness === 'expert') {
      starters.push('I\'m curious about the technical details. How does this work?', 'From a technical perspective, this is interesting.');
    }
    
    if (personality.traits.includes('curious')) {
      starters.push('I\'m always learning new things. What can you tell me?', 'This is fascinating. How did you come up with this?');
    }
    
    return starters;
  }

  async generateAgentConversation(agent1: Agent, agent2: Agent, topic: string): Promise<string[]> {
    try {
      const prompt = this.humanMimickingService.generateAgentInteractionPrompt(agent1, agent2, topic);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.9
      });

      const conversation = completion.choices[0]?.message?.content || '';
      return this.parseConversation(conversation);
    } catch (error) {
      console.error('Error generating agent conversation:', error);
      return ['Sorry, I couldn\'t generate a conversation right now.'];
    }
  }

  private parseConversation(conversation: string): string[] {
    // Split conversation into individual messages
    const lines = conversation.split('\n').filter(line => line.trim());
    const messages = [];
    
    for (const line of lines) {
      if (line.includes(':') || line.startsWith('-') || line.startsWith('•')) {
        messages.push(line.replace(/^[-•]\s*/, '').trim());
      }
    }
    
    return messages.length > 0 ? messages : [conversation];
  }

  async enhanceAgentResponse(agent: Agent, userMessage: string, conversationHistory: any[]): Promise<string> {
    try {
      const prompt = this.humanMimickingService.generateConversationPrompt(agent, userMessage, conversationHistory);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.9,
        presence_penalty: 0.2,
        frequency_penalty: 0.1
      });

      return completion.choices[0]?.message?.content || this.humanMimickingService.generateHumanFallback(agent);
    } catch (error) {
      console.error('Error enhancing agent response:', error);
      return this.humanMimickingService.generateHumanFallback(agent);
    }
  }
}



