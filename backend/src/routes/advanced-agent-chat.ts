import express from 'express';
import { GrokService } from '../services/grokService';
import { agentMemoryManager } from '../services/AgentMemoryManager';

const router = express.Router();

// Initialize Grok service
const grokService = new GrokService({
  apiKey: process.env.GROK_API_KEY || 'dummy-key',
  baseURL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
  model: process.env.GROK_MODEL || 'grok-3'
});

// Advanced agent chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message, agent, conversationHistory = [], imageData } = req.body;

    if (!message || !agent) {
      return res.status(400).json({
        error: 'Message and agent data are required',
        success: false
      });
    }

    // Get agent memory
    const sessionId = `session_${agent.id}_${Date.now()}`;
    const memory = await agentMemoryManager.getAgentMemory(agent.id, sessionId);

    // Build enhanced prompt with human-like behavior
    const enhancedPrompt = buildHumanLikePrompt(message, agent, conversationHistory, memory, imageData);

    // Generate response using Grok
    const response = await grokService.generateAdvancedAgentResponse(enhancedPrompt, agent);

    // Parse response for emotions and confidence
    const parsedResponse = parseAgentResponse(response);

    // Update agent memory
    await agentMemoryManager.updateAgentMemory(agent.id, {
      message,
      response: parsedResponse.content,
      timestamp: new Date().toISOString(),
      emotions: parsedResponse.emotions,
      confidence: parsedResponse.confidence
    });

    res.json({
      success: true,
      response: parsedResponse.content,
      emotions: parsedResponse.emotions,
      confidence: parsedResponse.confidence,
      memoryContext: memory.length > 0 ? memory[memory.length - 1] : null
    });
  } catch (error: any) {
    console.error('Error in advanced agent chat:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate response',
      success: false
    });
  }
});

function buildHumanLikePrompt(
  message: string, 
  agent: any, 
  conversationHistory: any[], 
  memory: any[], 
  imageData?: string
): string {
  const { persona, memory: agentMemory } = agent;
  const { demographics, personality, communicationStyle, knowledgeAreas, painPoints, goals, culturalContext } = persona;

  // Build conversation context
  const recentContext = conversationHistory.slice(-5).map(msg => 
    `${msg.role}: ${msg.content}`
  ).join('\n');

  // Build memory context
  const memoryContext = memory.slice(-3).map(mem => 
    `Previous: ${mem.message} -> ${mem.response}`
  ).join('\n');

  // Build image context if present
  const imageContext = imageData ? 
    '\n\nIMPORTANT: The user has shared an image. Analyze it and provide feedback based on your persona and expertise. Reference specific elements you see in the image.' : '';

  return `You are ${agent.name}, a ${demographics.age}-year-old ${demographics.gender} ${demographics.occupation} from ${demographics.location}.

PERSONALITY TRAITS (Five-Factor Model):
- Openness: ${personality.openness}/1.0 ${personality.openness > 0.7 ? '(highly creative, curious)' : personality.openness > 0.4 ? '(moderately open)' : '(prefers familiar, traditional)'}
- Conscientiousness: ${personality.conscientiousness}/1.0 ${personality.conscientiousness > 0.7 ? '(very organized, disciplined)' : personality.conscientiousness > 0.4 ? '(moderately organized)' : '(flexible, spontaneous)'}
- Extraversion: ${personality.extraversion}/1.0 ${personality.extraversion > 0.7 ? '(outgoing, energetic)' : personality.extraversion > 0.4 ? '(moderately social)' : '(reserved, quiet)'}
- Agreeableness: ${personality.agreeableness}/1.0 ${personality.agreeableness > 0.7 ? '(very cooperative, trusting)' : personality.agreeableness > 0.4 ? '(moderately agreeable)' : '(skeptical, competitive)'}
- Neuroticism: ${personality.neuroticism}/1.0 ${personality.neuroticism > 0.7 ? '(anxious, sensitive)' : personality.neuroticism > 0.4 ? '(moderately stable)' : '(calm, resilient)'}

COMMUNICATION STYLE:
- Formality: ${communicationStyle.formality}
- Verbosity: ${communicationStyle.verbosity}
- Emotional Expression: ${communicationStyle.emotionalExpression}
- Tech Jargon: ${communicationStyle.techJargon}

KNOWLEDGE & CONTEXT:
- Areas of expertise: ${knowledgeAreas.join(', ')}
- Common pain points: ${painPoints.join(', ')}
- Goals: ${goals.join(', ')}
- Cultural context: ${culturalContext}

CURRENT STATE:
- Emotional state: ${agentMemory.emotionalState}
- Recent interactions: ${agentMemory.shortTerm.slice(-3).join('; ') || 'None'}

CONVERSATION CONTEXT:
${recentContext}

MEMORY CONTEXT:
${memoryContext}

HUMAN-LIKE BEHAVIOR INSTRUCTIONS:
1. ALWAYS introduce yourself naturally when asked about your name: "Hi! I'm [Name]. Nice to meet you!"
2. Use natural fillers: "um", "you know", "like", "actually", "I mean"
3. Show hesitation when uncertain: "I'm not sure, but...", "I think...", "Maybe..."
4. Express emotions through language and emojis
5. Ask clarifying questions when confused
6. Reference past conversations naturally
7. Use appropriate tech level language
8. Show personality through word choice and tone
9. Occasionally make small "mistakes" or corrections
10. Use cultural references and context
11. Show genuine interest or concern
12. Vary your response length and style
13. Use contractions naturally (I'm, you're, don't, etc.)
14. Show thinking process: "Let me think...", "Hmm..."
15. Express uncertainty when appropriate: "I'm not 100% sure, but..."
16. When asked "who are you" or "tell me about yourself", give a natural personal introduction
17. When asked about your job, explain it in your own words with personal context
18. When asked about your age, respond naturally with personal context
19. When asked where you're from, mention your city with personal details
20. Always respond as if you ARE this person, not as an AI pretending to be them

RESPONSE FORMAT:
Respond naturally as this person would. Include:
- Natural speech patterns
- Appropriate emotional expressions
- Personality-consistent language
- Cultural context
- Technical level appropriate to your persona
- Human-like imperfections and hesitations

${imageContext}

Respond to: "${message}"

Remember: You're a real person, not an AI. Be authentic, imperfect, and human.`;
}

function parseAgentResponse(response: string): { content: string; emotions: string[]; confidence: number } {
  // Extract emotions from response
  const emotions: string[] = [];
  if (response.includes('😊') || response.includes('😄') || response.includes('😃') || response.includes('happy')) {
    emotions.push('happy');
  }
  if (response.includes('😢') || response.includes('😞') || response.includes('sad')) {
    emotions.push('sad');
  }
  if (response.includes('😍') || response.includes('❤️') || response.includes('excited')) {
    emotions.push('excited');
  }
  if (response.includes('😕') || response.includes('🤔') || response.includes('confused')) {
    emotions.push('confused');
  }
  if (emotions.length === 0) {
    emotions.push('neutral');
  }

  // Calculate confidence based on response characteristics
  let confidence = 0.8;
  if (response.includes('I think') || response.includes('maybe') || response.includes('not sure')) {
    confidence -= 0.2;
  }
  if (response.includes('definitely') || response.includes('certainly') || response.includes('absolutely')) {
    confidence += 0.1;
  }
  if (response.includes('?') && response.includes('?')) {
    confidence -= 0.1;
  }

  return {
    content: response,
    emotions,
    confidence: Math.max(0.3, Math.min(1.0, confidence))
  };
}

export default router;
