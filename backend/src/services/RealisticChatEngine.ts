import OpenAI from 'openai';
import { CompleteAgentProfile } from './PersonaSynthesizer';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface ChatResponse {
  response: string;
  delay: number;
  emotion: string;
  timestamp: Date;
  confidence: number;
}

export interface ConversationState {
  emotional_state: 'neutral' | 'interested' | 'confused' | 'frustrated' | 'giving_up';
  topics_discussed: string[];
  message_count: number;
  last_frustration_trigger: Date | null;
  agent_mentioned_facts: string[];
}

export class RealisticChatEngine {
  private agent: CompleteAgentProfile;
  private redis: any; // Redis client will be injected

  constructor(agent: CompleteAgentProfile, redisClient: any) {
    this.agent = agent;
    this.redis = redisClient;
  }

  async generateResponse(userMessage: string, sessionId: string): Promise<ChatResponse> {
    try {
      console.log(`Generating response for agent ${this.agent.name}...`);
      
      // 1. Load conversation state from Redis
      const conversationState = await this.loadConversationState(sessionId);
      
      // 2. Analyze user message
      const messageAnalysis = this.analyzeUserMessage(userMessage);
      
      // 3. Build dynamic system prompt
      const systemPrompt = this.buildDynamicSystemPrompt(conversationState, messageAnalysis);
      
      // 4. Load conversation history
      const conversationHistory = await this.loadConversationHistory(sessionId);
      
      // 5. Generate response with OpenAI
      const response = await this.generateAIResponse(systemPrompt, conversationHistory, userMessage);
      
      // 6. Post-process response for realism
      const processedResponse = this.postProcessResponse(response);
      
      // 7. Calculate realistic delay
      const delay = this.calculateResponseDelay(userMessage, processedResponse);
      
      // 8. Update conversation state
      const newState = this.updateConversationState(conversationState, userMessage, processedResponse);
      await this.saveConversationState(sessionId, newState);
      
      // 9. Save message to database
      await this.saveMessage(sessionId, 'assistant', processedResponse, newState.emotional_state, delay);
      
      console.log(`Response generated for ${this.agent.name}: ${processedResponse.substring(0, 50)}...`);
      
      return {
        response: processedResponse,
        delay,
        emotion: newState.emotional_state,
        timestamp: new Date(),
        confidence: this.calculateConfidence(processedResponse)
      };
      
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        response: this.generateFallbackResponse(),
        delay: 2000,
        emotion: 'confused',
        timestamp: new Date(),
        confidence: 0.3
      };
    }
  }

  private async loadConversationState(sessionId: string): Promise<ConversationState> {
    try {
      const state = await this.redis.get(`chat:${sessionId}:state`);
      if (state) {
        return JSON.parse(state);
      }
    } catch (error) {
      console.error('Error loading conversation state:', error);
    }
    
    return {
      emotional_state: 'neutral',
      topics_discussed: [],
      message_count: 0,
      last_frustration_trigger: null,
      agent_mentioned_facts: []
    };
  }

  private analyzeUserMessage(message: string): {
    sentiment: 'positive' | 'negative' | 'neutral';
    complexity: 'simple' | 'moderate' | 'complex';
    topics: string[];
  } {
    const words = message.toLowerCase().split(' ');
    
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'awesome', 'love', 'like', 'yes', 'sure', 'okay'];
    const negativeWords = ['bad', 'terrible', 'hate', 'no', 'wrong', 'confused', 'frustrated'];
    
    const positiveCount = words.filter(w => positiveWords.includes(w)).length;
    const negativeCount = words.filter(w => negativeWords.includes(w)).length;
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';
    
    // Complexity analysis
    const complexWords = words.filter(w => w.length > 8).length;
    const complexity = complexWords > 3 ? 'complex' : complexWords > 1 ? 'moderate' : 'simple';
    
    // Extract topics (simple keyword extraction)
    const topics = words.filter(w => w.length > 4 && !['this', 'that', 'with', 'from', 'they', 'them'].includes(w));
    
    return { sentiment, complexity, topics };
  }

  private buildDynamicSystemPrompt(state: ConversationState, analysis: any): string {
    let prompt = this.agent.master_system_prompt;
    
    // Add current emotional state
    prompt += `\n\nCURRENT EMOTIONAL STATE: You are currently feeling ${state.emotional_state}.`;
    
    // Add context based on user message
    if (analysis.sentiment === 'negative') {
      prompt += `\nThe user seems frustrated or negative. Respond appropriately to their mood.`;
    } else if (analysis.sentiment === 'positive') {
      prompt += `\nThe user seems positive and engaged. Match their enthusiasm.`;
    }
    
    if (analysis.complexity === 'complex') {
      prompt += `\nThe user is using complex language. ${this.agent.tech_behavior.actual_tech_comfort < 5 ? 'Ask for clarification if needed.' : 'You can handle this complexity.'}`;
    }
    
    // Add conversation context
    if (state.topics_discussed.length > 0) {
      prompt += `\n\nRECENT CONVERSATION SUMMARY:\n- You've been talking about: ${state.topics_discussed.slice(-5).join(', ')}\n- Don't repeat yourself about: ${state.topics_discussed.slice(0, 3).join(', ')}`;
    }
    
    if (state.agent_mentioned_facts.length > 0) {
      prompt += `\n- Things you've already mentioned: ${state.agent_mentioned_facts.slice(-3).join(', ')}`;
    }
    
    return prompt;
  }

  private async loadConversationHistory(sessionId: string): Promise<any[]> {
    try {
      const history = await this.redis.lrange(`chat:${sessionId}:messages`, 0, 9);
      return history.map(msg => JSON.parse(msg));
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return [];
    }
  }

  private async generateAIResponse(systemPrompt: string, history: any[], userMessage: string): Promise<string> {
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add conversation history
    history.forEach(msg => {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    });
    
    // Add current user message
    messages.push({ role: 'user', content: userMessage });
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages,
      temperature: 0.8, // High variation for realism
      max_tokens: 250, // Shorter responses = more human
      top_p: 0.9,
      frequency_penalty: 0.6 // Avoid repetition
    });
    
    return completion.choices[0]?.message?.content || 'I need a moment to think about that.';
  }

  private postProcessResponse(response: string): string {
    let processed = response;
    
    // Add filler words
    processed = this.addFillerWords(processed);
    
    // Add self-corrections
    processed = this.addSelfCorrections(processed);
    
    // Mimic typos if low tech comfort
    if (this.agent.tech_behavior.actual_tech_comfort < 4) {
      processed = this.mimicTypos(processed);
    }
    
    // Ensure vocabulary match
    processed = this.ensureVocabularyMatch(processed);
    
    return processed;
  }

  private addFillerWords(text: string): string {
    const fillers = this.agent.speech_patterns.filler_words;
    if (fillers.length === 0) return text;
    
    const sentences = text.split(/[.!?]+/);
    const processedSentences = sentences.map((sentence, index) => {
      if (sentence.trim().length === 0) return sentence;
      
      // 30% chance to add filler word
      if (Math.random() < 0.3) {
        const filler = fillers[Math.floor(Math.random() * fillers.length)];
        return `${filler} ${sentence.trim()}`;
      }
      return sentence.trim();
    });
    
    return processedSentences.join('. ').replace(/\.\s*\./g, '.');
  }

  private addSelfCorrections(text: string): string {
    if (this.agent.speech_patterns.self_corrections_frequency === 'frequent' && Math.random() < 0.2) {
      const corrections = ['I mean...', 'actually...', 'wait, no...', 'or rather...'];
      const correction = corrections[Math.floor(Math.random() * corrections.length)];
      
      // Insert correction at random position
      const words = text.split(' ');
      const insertPos = Math.floor(Math.random() * words.length);
      words.splice(insertPos, 0, correction);
      return words.join(' ');
    }
    return text;
  }

  private mimicTypos(text: string): string {
    if (Math.random() > 0.05) return text; // 5% chance
    
    const typos = {
      'the': 'teh',
      'and': 'adn',
      'you': 'yu',
      'are': 'r',
      'your': 'ur',
      'to': '2',
      'for': '4'
    };
    
    let processed = text;
    Object.entries(typos).forEach(([correct, typo]) => {
      if (Math.random() < 0.1) { // 10% chance per word
        processed = processed.replace(new RegExp(`\\b${correct}\\b`, 'gi'), typo);
      }
    });
    
    return processed;
  }

  private ensureVocabularyMatch(text: string): string {
    const commonVocab = this.agent.vocabulary_analysis.common_vocabulary;
    const avoidedWords = this.agent.vocabulary_analysis.avoided_words;
    
    let processed = text;
    
    // Replace avoided words with simpler alternatives
    avoidedWords.forEach(word => {
      const alternatives = this.getSimpleAlternatives(word);
      if (alternatives.length > 0) {
        const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
        processed = processed.replace(new RegExp(`\\b${word}\\b`, 'gi'), alternative);
      }
    });
    
    return processed;
  }

  private getSimpleAlternatives(complexWord: string): string[] {
    const alternatives: { [key: string]: string[] } = {
      'utilize': ['use'],
      'facilitate': ['help'],
      'implement': ['do', 'make'],
      'optimize': ['improve'],
      'leverage': ['use'],
      'synthesize': ['combine'],
      'analyze': ['look at'],
      'comprehensive': ['complete'],
      'sophisticated': ['fancy'],
      'paradigm': ['way']
    };
    
    return alternatives[complexWord.toLowerCase()] || [];
  }

  private calculateResponseDelay(userMessage: string, agentResponse: string): number {
    const readingTime = userMessage.split(' ').length * 200; // 200ms per word
    const thinkingTime = this.calculateThinkingTime(userMessage);
    const typingTime = agentResponse.length * this.getTypingSpeed();
    
    const totalDelay = readingTime + thinkingTime + typingTime;
    
    // Add random variance ±20%
    const variance = totalDelay * 0.2 * (Math.random() - 0.5);
    const finalDelay = Math.max(1000, Math.min(8000, totalDelay + variance));
    
    return Math.round(finalDelay);
  }

  private calculateThinkingTime(userMessage: string): number {
    const complexity = userMessage.split(' ').length > 10 ? 1.5 : 1.0;
    const understandingSpeed = this.agent.cognitive_patterns.understanding_speed === 'slow' ? 2.0 : 
                              this.agent.cognitive_patterns.understanding_speed === 'fast' ? 0.5 : 1.0;
    
    return 1000 * complexity * understandingSpeed;
  }

  private getTypingSpeed(): number {
    const techComfort = this.agent.tech_behavior.actual_tech_comfort;
    return techComfort < 3 ? 100 : techComfort < 7 ? 80 : 60; // ms per character
  }

  private updateConversationState(
    currentState: ConversationState, 
    userMessage: string, 
    agentResponse: string
  ): ConversationState {
    const newState = { ...currentState };
    
    // Update emotional state based on triggers
    newState.emotional_state = this.updateEmotionalState(currentState, userMessage);
    
    // Update topics discussed
    const messageTopics = this.extractTopics(userMessage + ' ' + agentResponse);
    newState.topics_discussed = [...newState.topics_discussed, ...messageTopics].slice(-10);
    
    // Update message count
    newState.message_count += 1;
    
    // Update frustration trigger
    if (newState.emotional_state === 'frustrated') {
      newState.last_frustration_trigger = new Date();
    }
    
    // Extract agent mentioned facts
    const agentFacts = this.extractAgentFacts(agentResponse);
    newState.agent_mentioned_facts = [...newState.agent_mentioned_facts, ...agentFacts].slice(-5);
    
    return newState;
  }

  private updateEmotionalState(currentState: ConversationState, userMessage: string): ConversationState['emotional_state'] {
    const triggers = this.agent.personality_data.behavioral_triggers;
    
    // Check for frustration triggers
    if (triggers.gets_frustrated_when.some(trigger => 
      userMessage.toLowerCase().includes(trigger.toLowerCase()))) {
      return 'frustrated';
    }
    
    // Check for excitement triggers
    if (triggers.gets_excited_when.some(trigger => 
      userMessage.toLowerCase().includes(trigger.toLowerCase()))) {
      return 'interested';
    }
    
    // Check for confusion triggers
    if (userMessage.toLowerCase().includes('confused') || 
        userMessage.toLowerCase().includes('don\'t understand')) {
      return 'confused';
    }
    
    // Gradual state transitions
    if (currentState.emotional_state === 'frustrated' && 
        currentState.last_frustration_trigger && 
        Date.now() - currentState.last_frustration_trigger.getTime() > 30000) {
      return 'neutral';
    }
    
    return currentState.emotional_state;
  }

  private extractTopics(text: string): string[] {
    const words = text.toLowerCase().split(' ')
      .filter(w => w.length > 4)
      .filter(w => !['this', 'that', 'with', 'from', 'they', 'them', 'have', 'been', 'will', 'would'].includes(w));
    
    return [...new Set(words)].slice(0, 3);
  }

  private extractAgentFacts(text: string): string[] {
    // Simple extraction of facts the agent mentioned about themselves
    const facts: string[] = [];
    
    if (text.includes('I am') || text.includes('I\'m')) {
      facts.push(text);
    }
    
    return facts;
  }

  private async saveConversationState(sessionId: string, state: ConversationState): Promise<void> {
    try {
      await this.redis.setex(`chat:${sessionId}:state`, 3600, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving conversation state:', error);
    }
  }

  private async saveMessage(sessionId: string, role: string, content: string, emotion: string, delay: number): Promise<void> {
    try {
      const message = {
        role,
        content,
        emotion,
        delay,
        timestamp: new Date().toISOString()
      };
      
      await this.redis.lpush(`chat:${sessionId}:messages`, JSON.stringify(message));
      await this.redis.ltrim(`chat:${sessionId}:messages`, 0, 19); // Keep last 20 messages
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  private calculateConfidence(response: string): number {
    let confidence = 0.7; // Base confidence
    
    // Adjust based on response characteristics
    if (response.includes('?')) confidence -= 0.1; // Questions indicate uncertainty
    if (response.includes('I think') || response.includes('maybe')) confidence -= 0.1;
    if (response.includes('definitely') || response.includes('certainly')) confidence += 0.1;
    
    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private generateFallbackResponse(): string {
    const fallbacks = [
      "I need a moment to think about that.",
      "Let me process that for a second.",
      "Hmm, that's interesting.",
      "I'm not sure I understand completely.",
      "Could you explain that a bit more?"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}



