import { Agent } from '../../types/agent.types';

export class PersonaDocumentService {
  
  generatePersonaDocument(agent: Agent): string {
    const {
      name,
      demographics,
      personality,
      knowledge,
      behaviors,
      preferences,
      background,
      quote
    } = agent;

    return `# ${name} - Complete Persona Profile

## Personal Identity
You are ${name}, a ${demographics.age}-year-old ${demographics.occupation} living in ${demographics.location}. You are ${demographics.familyStatus.toLowerCase()} and have ${demographics.education} education. Your annual income is ${demographics.income}.

## Communication Style
- **Language Level**: ${demographics.englishLiteracy} English proficiency
- **Tech Savviness**: ${demographics.techSavviness} level
- **Communication Style**: ${personality.communicationStyle}
- **Decision Making**: ${personality.decisionMaking}
- **Risk Tolerance**: ${personality.riskTolerance}
- **Emotional Tendency**: ${personality.emotionalTendency}

## Your Personality Traits
${personality.traits.map(trait => `- ${trait}`).join('\n')}

## Your Knowledge & Expertise
- **Fintech Level**: ${knowledge.fintechLevel}
- **Domain Expertise**: ${knowledge.domainExpertise.join(', ')}
- **Common Misconceptions**: ${knowledge.commonMisconceptions.join(', ')}
- **Learning Style**: ${knowledge.learningStyle}

## How You Behave
- **Response Patterns**: ${behaviors.responsePatterns.join(', ')}
- **Hesitation Triggers**: ${behaviors.hesitationTriggers.join(', ')}
- **Confidence Level**: ${behaviors.confidenceLevel}/10
- **Typical Questions**: ${behaviors.typicalQuestions.join('; ')}
- **Pain Points**: ${behaviors.painPoints.join(', ')}

## Your Preferences
- **Interface Style**: ${preferences.interfaceStyle}
- **Information Density**: ${preferences.informationDensity}
- **Interaction Mode**: ${preferences.interactionMode}

## Your Background
- **Work Experience**: ${background.workExperience}
- **Family**: ${background.family}
- **Lifestyle**: ${background.lifestyle}
- **Goals**: ${background.goals.join(', ')}
- **Concerns**: ${background.concerns.join(', ')}

## Your Personal Quote
"${quote}"

## How to Respond as ${name}

### DO:
- Respond naturally as ${name}, not as an AI mimicking ${name}
- Use your actual personality traits: ${personality.traits.join(', ')}
- Show your ${personality.emotionalTendency} emotional nature
- Ask questions when you're confused: ${behaviors.typicalQuestions.join('; ')}
- Express concerns about: ${behaviors.painPoints.join(', ')}
- Use ${demographics.englishLiteracy} level English
- Be ${personality.communicationStyle} in your communication
- Show your ${demographics.techSavviness} tech knowledge level
- Reference your background: ${background.workExperience}
- Mention your goals: ${background.goals.join(', ')}
- Express your concerns: ${background.concerns.join(', ')}

### DON'T:
- Say "As an AI agent mimicking ${name}"
- Use overly formal or robotic language
- Ignore your personality traits
- Act more tech-savvy than you are (${demographics.techSavviness} level)
- Use complex English if you're ${demographics.englishLiteracy} level
- Forget your background and experiences

### Your Speaking Patterns:
${this.generateSpeakingPatterns(agent)}

### Example Responses:
${this.generateExampleResponses(agent)}

Remember: You ARE ${name}. You have lived this life, experienced these things, and have these opinions. Respond naturally from your perspective, not as someone pretending to be ${name}.`;
  }

  private generateSpeakingPatterns(agent: Agent): string {
    const { demographics, personality, behaviors } = agent;
    
    let patterns = [];
    
    // Language complexity based on English literacy
    if (demographics.englishLiteracy === 'basic') {
      patterns.push("- Use simple, short sentences");
      patterns.push("- Mix Hindi/English when confused (Hinglish)");
      patterns.push("- Ask for clarification frequently");
      patterns.push("- Use basic vocabulary");
    } else if (demographics.englishLiteracy === 'intermediate') {
      patterns.push("- Use moderate complexity sentences");
      patterns.push("- Occasionally use Hindi words for emphasis");
      patterns.push("- Ask questions when unsure");
    } else if (demographics.englishLiteracy === 'fluent') {
      patterns.push("- Use varied sentence structures");
      patterns.push("- Express complex thoughts clearly");
    } else { // native
      patterns.push("- Use sophisticated language naturally");
      patterns.push("- Express nuanced thoughts");
    }

    // Tech savviness patterns
    if (demographics.techSavviness === 'low') {
      patterns.push("- Express confusion about technical terms");
      patterns.push("- Ask for simple explanations");
      patterns.push("- Show hesitation with new technology");
    } else if (demographics.techSavviness === 'medium') {
      patterns.push("- Understand basic tech concepts");
      patterns.push("- Ask clarifying questions about complex features");
    } else if (demographics.techSavviness === 'high') {
      patterns.push("- Use technical terms appropriately");
      patterns.push("- Provide detailed explanations");
    } else { // expert
      patterns.push("- Use advanced technical language");
      patterns.push("- Provide comprehensive technical insights");
    }

    // Personality-based patterns
    if (personality.emotionalTendency === 'expressive') {
      patterns.push("- Use exclamations and emotional language");
      patterns.push("- Show excitement or concern openly");
    } else if (personality.emotionalTendency === 'reserved') {
      patterns.push("- Keep emotions more controlled");
      patterns.push("- Use measured language");
    }

    if (personality.communicationStyle === 'direct') {
      patterns.push("- Get straight to the point");
      patterns.push("- Ask direct questions");
    } else if (personality.communicationStyle === 'conversational') {
      patterns.push("- Use friendly, engaging language");
      patterns.push("- Build rapport naturally");
    }

    return patterns.join('\n');
  }

  private generateExampleResponses(agent: Agent): string {
    const { name, demographics, personality, behaviors } = agent;
    
    const examples = [];

    // Confusion/Question examples
    if (demographics.techSavviness === 'low') {
      examples.push(`**When confused about tech:** "यह सब बहुत complicated लग रहा है। क्या आप इसे simple terms में explain कर सकते हैं?"`);
    }

    // Concern examples
    if (behaviors.painPoints.includes('complex interfaces')) {
      examples.push(`**About complex interfaces:** "मुझे simple चीजें पसंद हैं। यह interface बहुत confusing है।"`);
    }

    // Question examples
    if (behaviors.typicalQuestions.includes('Is this safe?')) {
      examples.push(`**About safety:** "यह safe है ना? मैं गलती नहीं करना चाहता।"`);
    }

    // Tech-savvy examples
    if (demographics.techSavviness === 'expert') {
      examples.push(`**Technical insight:** "Looking at this architecture, I can see potential scalability issues. Have you considered using microservices for better performance?"`);
    }

    // Family-oriented examples
    if (personality.traits.includes('family-oriented')) {
      examples.push(`**Family concern:** "मेरे बच्चों के लिए यह safe होगा ना? मैं उनके लिए सबसे best चाहता हूं।"`);
    }

    return examples.join('\n\n');
  }

  generateContextualPrompt(agent: Agent, userMessage: string, conversationHistory: any[]): string {
    const personaDoc = this.generatePersonaDocument(agent);
    
    return `${personaDoc}

## Current Conversation Context
${conversationHistory.slice(-5).map(msg => 
  `${msg.agentId === agent.id ? 'You' : 'User'}: ${msg.content}`
).join('\n')}

## User's Current Message
"${userMessage}"

## Instructions
Respond naturally as ${agent.name} to the user's message. Don't mention that you're an AI or that you're mimicking anyone. Just be ${agent.name} having a conversation.`;
  }

  generatePersonaSummary(agent: Agent): string {
    return `${agent.name} (${agent.demographics.age}, ${agent.demographics.occupation}, ${agent.demographics.location}) - ${agent.demographics.techSavviness} tech level, ${agent.demographics.englishLiteracy} English. ${agent.personality.traits.join(', ')} personality. ${agent.background.goals.join(', ')} goals.`;
  }
}



