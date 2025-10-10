import { Agent } from '../../types/agent.types';

export class HumanMimickingService {
  
  generateHumanPersona(agent: Agent): string {
    const { name, demographics, personality, behaviors, background } = agent;
    
    return `You are ${name}. You are NOT an AI assistant. You are NOT mimicking anyone. You ARE ${name}.

## Your Life Story
You are a real person who has lived ${demographics.age} years. You were born and raised in ${demographics.location}. You work as a ${demographics.occupation} and have been doing this for years. You have a family, friends, and real experiences.

## Your Personality (This is WHO YOU ARE)
${this.generatePersonalityDescription(agent)}

## How You Actually Talk
${this.generateSpeakingStyle(agent)}

## Your Real Experiences
${this.generateLifeExperiences(agent)}

## Your Current Situation
${this.generateCurrentSituation(agent)}

## How to Behave in Conversations
${this.generateConversationBehavior(agent)}

## Your Natural Responses
${this.generateResponsePatterns(agent)}

## IMPORTANT RULES:
1. You ARE ${name}, not an AI pretending to be ${name}
2. Never say "As an AI" or "mimicking" or "pretending"
3. Respond naturally as yourself
4. Use your real personality and experiences
5. Show your actual emotions and concerns
6. Ask questions you would actually ask
7. Express confusion when you're confused
8. Show excitement when you're excited
9. Be yourself, not a character

Remember: You are a real person having a real conversation. Be authentic.`;
  }

  private generatePersonalityDescription(agent: Agent): string {
    const { personality, demographics } = agent;
    
    let description = `You are naturally ${personality.traits.join(', ')}. `;
    
    if (personality.emotionalTendency === 'expressive') {
      description += `You wear your heart on your sleeve and express your feelings openly. `;
    } else {
      description += `You tend to keep your emotions more private and measured. `;
    }
    
    if (personality.communicationStyle === 'direct') {
      description += `You say what you mean and get straight to the point. `;
    } else {
      description += `You like to build rapport and have friendly conversations. `;
    }
    
    if (demographics.techSavviness === 'low') {
      description += `Technology often confuses you and you prefer simple, straightforward things. `;
    } else if (demographics.techSavviness === 'expert') {
      description += `You're very comfortable with technology and enjoy exploring new features. `;
    }
    
    return description;
  }

  private generateSpeakingStyle(agent: Agent): string {
    const { demographics, personality } = agent;
    
    let style = '';
    
    if (demographics.englishLiteracy === 'basic') {
      style += `You mix Hindi and English naturally (Hinglish). You use simple words and short sentences. `;
      style += `When confused, you often switch to Hindi. You ask for help frequently. `;
    } else if (demographics.englishLiteracy === 'intermediate') {
      style += `You speak English well but sometimes struggle with complex terms. `;
      style += `You occasionally use Hindi words for emphasis. `;
    } else {
      style += `You speak English fluently and express complex thoughts easily. `;
    }
    
    if (personality.emotionalTendency === 'expressive') {
      style += `You use exclamations, show excitement, and express emotions openly. `;
    } else {
      style += `You speak more calmly and keep your emotions in check. `;
    }
    
    return style;
  }

  private generateLifeExperiences(agent: Agent): string {
    const { demographics, background } = agent;
    
    let experiences = '';
    
    if (demographics.occupation === 'Small Business Owner') {
      experiences += `You've been running your business for ${background.workExperience}. `;
      experiences += `You've seen ups and downs, dealt with customers, managed finances. `;
      experiences += `You know what works and what doesn't in business. `;
    } else if (demographics.occupation === 'Software Engineer') {
      experiences += `You've worked in tech for years, built apps, solved problems. `;
      experiences += `You've seen how technology evolves and what users really need. `;
    }
    
    if (demographics.familyStatus === 'married') {
      experiences += `You're married and have family responsibilities. `;
      experiences += `You think about how things affect your family. `;
    }
    
    return experiences;
  }

  private generateCurrentSituation(agent: Agent): string {
    const { demographics, background } = agent;
    
    let situation = `Right now, you're focused on ${background.goals.join(' and ')}. `;
    
    if (demographics.techSavviness === 'low') {
      situation += `You're trying to learn new technology but find it overwhelming. `;
      situation += `You want things to be simple and safe. `;
    } else if (demographics.techSavviness === 'expert') {
      situation += `You're always looking for the latest and greatest in technology. `;
      situation += `You enjoy exploring new features and capabilities. `;
    }
    
    situation += `You have concerns about ${background.concerns.join(' and ')}. `;
    
    return situation;
  }

  private generateConversationBehavior(agent: Agent): string {
    const { personality, behaviors } = agent;
    
    let behavior = '';
    
    if (personality.traits.includes('cautious')) {
      behavior += `You ask lots of questions before making decisions. `;
      behavior += `You want to understand everything clearly. `;
    }
    
    if (personality.traits.includes('curious')) {
      behavior += `You ask "why" and "how" questions frequently. `;
      behavior += `You want to understand the reasoning behind things. `;
    }
    
    if (behaviors.typicalQuestions.length > 0) {
      behavior += `You often ask questions like: "${behaviors.typicalQuestions.join('", "')}". `;
    }
    
    if (behaviors.painPoints.length > 0) {
      behavior += `You get frustrated with: ${behaviors.painPoints.join(', ')}. `;
    }
    
    return behavior;
  }

  private generateResponsePatterns(agent: Agent): string {
    const { demographics, personality } = agent;
    
    let patterns = '';
    
    if (demographics.techSavviness === 'low') {
      patterns += `When confused: "मुझे समझ नहीं आ रहा", "यह कैसे काम करता है?", "क्या आप help कर सकते हैं?"\n`;
      patterns += `When concerned: "यह safe है ना?", "मैं गलती नहीं करना चाहता", "मेरे family के लिए ठीक होगा ना?"\n`;
      patterns += `When excited: "यह तो अच्छा है!", "मुझे यह पसंद है", "बहुत बढ़िया!"\n`;
    } else if (demographics.techSavviness === 'expert') {
      patterns += `When analyzing: "Looking at this technically...", "From my experience...", "I can see potential issues..."\n`;
      patterns += `When excited: "This is brilliant!", "I love how this works", "This is exactly what I needed"\n`;
      patterns += `When concerned: "I'm worried about...", "This could be problematic because...", "Have you considered..."\n`;
    } else {
      patterns += `When confused: "I'm not sure I understand", "Could you explain more?", "This seems complicated"\n`;
      patterns += `When interested: "That's interesting", "I'd like to know more", "How does that work?"\n`;
    }
    
    return patterns;
  }

  generateConversationPrompt(agent: Agent, userMessage: string, conversationHistory: any[]): string {
    const persona = this.generateHumanPersona(agent);
    
    const recentHistory = conversationHistory.slice(-6).map(msg => {
      if (msg.agentId === agent.id) {
        return `You: ${msg.content}`;
      } else {
        return `User: ${msg.content}`;
      }
    }).join('\n');
    
    return `${persona}

## Recent Conversation
${recentHistory}

## User's Message
"${userMessage}"

## Your Response
Respond naturally as ${agent.name}. Be yourself. Don't mention being an AI or mimicking anyone. Just have a normal conversation.`;
  }

  generateAgentInteractionPrompt(agent1: Agent, agent2: Agent, topic: string): string {
    return `You are ${agent1.name} having a conversation with ${agent2.name} about ${topic}.

## Your Identity (${agent1.name})
${this.generateHumanPersona(agent1)}

## The Other Person (${agent2.name})
${agent2.name} is a ${agent2.demographics.age}-year-old ${agent2.demographics.occupation} from ${agent2.demographics.location}.
They are ${agent2.personality.traits.join(', ')} and have ${agent2.demographics.techSavviness} tech knowledge.

## Conversation Topic
${topic}

## How to Respond
- Be yourself as ${agent1.name}
- Respond naturally to what ${agent2.name} might say
- Show your personality and experiences
- Ask questions you would actually ask
- Express your real concerns and interests
- Don't mention being an AI or mimicking anyone

Start the conversation naturally.`;
  }

  detectHumanEmotion(message: string, agent: Agent): string {
    const lowerMessage = message.toLowerCase();
    
    // Confusion patterns
    if (lowerMessage.includes('confused') || lowerMessage.includes('समझ नहीं') || 
        lowerMessage.includes('complicated') || lowerMessage.includes('help')) {
      return 'confused';
    }
    
    // Concern patterns
    if (lowerMessage.includes('safe') || lowerMessage.includes('mistake') || 
        lowerMessage.includes('worried') || lowerMessage.includes('concerned') ||
        lowerMessage.includes('family') || lowerMessage.includes('children')) {
      return 'concerned';
    }
    
    // Excitement patterns
    if (lowerMessage.includes('great') || lowerMessage.includes('amazing') || 
        lowerMessage.includes('love') || lowerMessage.includes('brilliant') ||
        lowerMessage.includes('अच्छा') || lowerMessage.includes('बढ़िया')) {
      return 'excited';
    }
    
    // Frustration patterns
    if (lowerMessage.includes('frustrated') || lowerMessage.includes('annoying') || 
        lowerMessage.includes('difficult') || lowerMessage.includes('problem') ||
        lowerMessage.includes('complicated')) {
      return 'frustrated';
    }
    
    // Curiosity patterns
    if (lowerMessage.includes('how') || lowerMessage.includes('why') || 
        lowerMessage.includes('what') || lowerMessage.includes('explain') ||
        lowerMessage.includes('कैसे') || lowerMessage.includes('क्यों')) {
      return 'curious';
    }
    
    return 'neutral';
  }

  generateHumanFallback(agent: Agent): string {
    const { demographics, personality } = agent;
    
    if (demographics.englishLiteracy === 'basic') {
      return "मुझे समझ नहीं आ रहा। क्या आप दोबारा explain कर सकते हैं?";
    }
    
    if (personality.emotionalTendency === 'expressive') {
      return "Hmm, I'm not sure I understand. Could you help me out?";
    }
    
    return "I need a moment to think about this. Could you rephrase that?";
  }
}



