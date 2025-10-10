import { OpenAI } from 'openai';
import { Pool } from 'pg';
import { MemoryManagementService } from './MemoryManagementService';
import { PersonaExtractionService, ExtractedPersona } from './PersonaExtractionService';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  metadata?: {
    timestamp: Date;
    emotionalTone?: string;
    confidence?: number;
    reasoning?: string;
  };
}

interface ResponseGenerationOptions {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences?: string[];
  enableChainOfThought: boolean;
  enableMemoryIntegration: boolean;
  enableEmotionalAnalysis: boolean;
  enableMultimodal: boolean;
}

interface GeneratedResponse {
  content: string;
  metadata: {
    confidence: number;
    emotionalTone: string;
    reasoning: string;
    memoryUsed: string[];
    responseTime: number;
    tokensUsed: number;
  };
}

export class AdvancedAIModelService {
  private openai: OpenAI;
  private db: Pool;
  private memoryService: MemoryManagementService;
  private personaService: PersonaExtractionService;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.memoryService = new MemoryManagementService();
    this.personaService = new PersonaExtractionService();
  }

  async generateResponse(
    personaId: string,
    userMessage: string,
    sessionId: string,
    options: Partial<ResponseGenerationOptions> = {}
  ): Promise<GeneratedResponse> {
    const startTime = Date.now();
    
    // Get persona
    const persona = await this.personaService.getPersonaById(personaId);
    if (!persona) {
      throw new Error(`Persona ${personaId} not found`);
    }

    // Get relevant context from memory
    const context = await this.memoryService.getRelevantContext(
      sessionId,
      personaId,
      userMessage,
      2000
    );

    // Build conversation history
    const conversationHistory = await this.buildConversationHistory(sessionId, personaId);

    // Generate response using Chain of Thought
    const response = await this.generateWithChainOfThought(
      persona,
      userMessage,
      context,
      conversationHistory,
      options
    );

    // Analyze response
    const emotionalTone = await this.analyzeEmotionalTone(response.content);
    const confidence = await this.calculateConfidence(response.content, persona);
    const reasoning = response.reasoning || '';

    // Store in memory
    await this.memoryService.addToShortTermMemory(
      sessionId,
      personaId,
      userMessage,
      'user'
    );
    
    await this.memoryService.addToShortTermMemory(
      sessionId,
      personaId,
      response.content,
      'assistant',
      {
        confidence,
        emotionalTone,
        reasoning,
      }
    );

    // Update emotional state
    await this.memoryService.updateEmotionalState(sessionId, personaId, response.content);

    const responseTime = Date.now() - startTime;

    return {
      content: response.content,
      metadata: {
        confidence,
        emotionalTone,
        reasoning,
        memoryUsed: this.extractMemoryReferences(context),
        responseTime,
        tokensUsed: this.estimateTokenCount(response.content),
      },
    };
  }

  private async generateWithChainOfThought(
    persona: ExtractedPersona,
    userMessage: string,
    context: string,
    conversationHistory: ChatMessage[],
    options: Partial<ResponseGenerationOptions>
  ): Promise<{ content: string; reasoning: string }> {
    const defaultOptions: ResponseGenerationOptions = {
      temperature: 0.7,
      maxTokens: 500,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1,
      enableChainOfThought: true,
      enableMemoryIntegration: true,
      enableEmotionalAnalysis: true,
      enableMultimodal: false,
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Build system prompt with persona and context
    const systemPrompt = this.buildSystemPrompt(persona, context, finalOptions);

    // Build messages array
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      { role: 'user', content: userMessage },
    ];

    // Generate response
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      temperature: finalOptions.temperature,
      max_tokens: finalOptions.maxTokens,
      top_p: finalOptions.topP,
      frequency_penalty: finalOptions.frequencyPenalty,
      presence_penalty: finalOptions.presencePenalty,
      stop: finalOptions.stopSequences,
    });

    const content = response.choices[0].message.content || '';
    const reasoning = this.extractReasoning(content);

    return {
      content: this.cleanResponse(content),
      reasoning,
    };
  }

  private buildSystemPrompt(
    persona: ExtractedPersona,
    context: string,
    options: ResponseGenerationOptions
  ): string {
    let prompt = persona.promptTemplate;

    // Add context if available
    if (context && options.enableMemoryIntegration) {
      prompt += `\n\nCONTEXT FROM PREVIOUS CONVERSATIONS:\n${context}`;
    }

    // Add Chain of Thought instructions
    if (options.enableChainOfThought) {
      prompt += `\n\nREASONING PROCESS:
Before responding, think through:
1. What is the user asking or saying?
2. What do I know about this topic from my background?
3. How would someone like me naturally respond?
4. What emotions or tone should I convey?
5. What additional context might be helpful?

Then respond naturally as this person would.`;
    }

    // Add emotional analysis instructions
    if (options.enableEmotionalAnalysis) {
      prompt += `\n\nEMOTIONAL GUIDELINES:
- Express emotions authentically based on your personality
- Use appropriate emotional language and tone
- Show empathy when appropriate
- Match your emotional response to the situation
- Use emojis sparingly but effectively`;
    }

    // Add human-like behavior instructions
    prompt += `\n\nHUMAN-LIKE BEHAVIOR:
- Use natural fillers: "um", "you know", "I think", "actually"
- Show hesitation when uncertain: "I'm not sure, but...", "Maybe..."
- Ask clarifying questions when confused
- Reference your personal experience when relevant
- Use contractions naturally (I'm, you're, don't, etc.)
- Vary your response length and style
- Show thinking process: "Let me think...", "Hmm..."
- Express uncertainty when appropriate: "I'm not 100% sure, but..."
- Make small "mistakes" or corrections occasionally
- Use cultural references and context appropriately
- Show genuine interest or concern
- Reference past conversations naturally
- Use appropriate tech level language for your background`;

    return prompt;
  }

  private async buildConversationHistory(
    sessionId: string,
    personaId: string
  ): Promise<ChatMessage[]> {
    const memories = await this.memoryService.getShortTermMemory(sessionId, 20);
    
    return memories.map(memory => ({
      role: memory.type === 'conversation' ? 'assistant' : 'user',
      content: memory.content,
      metadata: {
        timestamp: memory.metadata.timestamp,
        emotionalTone: memory.metadata.emotionalTone,
        confidence: memory.metadata.importance,
      },
    }));
  }

  private extractReasoning(content: string): string {
    // Extract reasoning from Chain of Thought response
    const reasoningMatch = content.match(/REASONING[:\s]*(.*?)(?=\n\n|\n[A-Z]|$)/s);
    return reasoningMatch ? reasoningMatch[1].trim() : '';
  }

  private cleanResponse(content: string): string {
    // Remove reasoning sections and clean up response
    return content
      .replace(/REASONING[:\s]*.*?(?=\n\n|\n[A-Z]|$)/gs, '')
      .replace(/THINKING[:\s]*.*?(?=\n\n|\n[A-Z]|$)/gs, '')
      .trim();
  }

  private async analyzeEmotionalTone(content: string): Promise<string> {
    const prompt = `
    Analyze the emotional tone of this response:
    
    "${content}"
    
    Respond with one of: positive, negative, neutral, excited, concerned, frustrated, curious, confident, uncertain, empathetic, enthusiastic, cautious
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    return response.choices[0].message.content?.toLowerCase() || 'neutral';
  }

  private async calculateConfidence(content: string, persona: ExtractedPersona): Promise<number> {
    // Calculate confidence based on response quality and persona alignment
    let confidence = 0.5; // Base confidence

    // Check if response is substantial
    if (content.length > 50) confidence += 0.1;
    if (content.length > 100) confidence += 0.1;

    // Check for persona-specific language patterns
    const personaPatterns = persona.traits.conversational.commonPhrases;
    const hasPersonaPatterns = personaPatterns.some(pattern => 
      content.toLowerCase().includes(pattern.toLowerCase())
    );
    if (hasPersonaPatterns) confidence += 0.1;

    // Check for appropriate emotional tone
    const emotionalTone = await this.analyzeEmotionalTone(content);
    const expectedTone = this.getExpectedTone(persona);
    if (emotionalTone === expectedTone) confidence += 0.1;

    // Check for natural language patterns
    const hasNaturalPatterns = this.hasNaturalLanguagePatterns(content);
    if (hasNaturalPatterns) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private getExpectedTone(persona: ExtractedPersona): string {
    const personality = persona.traits.psychographics.personality;
    
    if (personality.extraversion > 0.7) return 'enthusiastic';
    if (personality.neuroticism > 0.7) return 'cautious';
    if (personality.agreeableness > 0.7) return 'empathetic';
    if (personality.conscientiousness > 0.7) return 'confident';
    
    return 'neutral';
  }

  private hasNaturalLanguagePatterns(content: string): boolean {
    const patterns = [
      /\b(um|uh|you know|I think|actually|basically)\b/i,
      /\b(I'm|you're|don't|won't|can't|isn't)\b/i,
      /\b(Let me think|Hmm|Well|So|Anyway)\b/i,
      /[.!?]\s*[A-Z]/g, // Multiple sentences
    ];

    return patterns.some(pattern => pattern.test(content));
  }

  private extractMemoryReferences(context: string): string[] {
    // Extract references to specific memories or context
    const references: string[] = [];
    
    if (context.includes('RECENT CONVERSATION')) {
      references.push('recent_conversation');
    }
    
    if (context.includes('RELEVANT BACKGROUND')) {
      references.push('relevant_background');
    }
    
    return references;
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  // Multimodal support
  async generateMultimodalResponse(
    personaId: string,
    userMessage: string,
    imageData?: string,
    sessionId: string,
    options: Partial<ResponseGenerationOptions> = {}
  ): Promise<GeneratedResponse> {
    const persona = await this.personaService.getPersonaById(personaId);
    if (!persona) {
      throw new Error(`Persona ${personaId} not found`);
    }

    const context = await this.memoryService.getRelevantContext(
      sessionId,
      personaId,
      userMessage,
      1500
    );

    const systemPrompt = this.buildSystemPrompt(persona, context, {
      ...options,
      enableMultimodal: true,
    });

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ];

    // Add image if provided
    if (imageData) {
      messages[1].content = [
        { type: 'text', text: userMessage },
        { type: 'image_url', image_url: { url: imageData } },
      ];
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 500,
    });

    const content = response.choices[0].message.content || '';
    const emotionalTone = await this.analyzeEmotionalTone(content);
    const confidence = await this.calculateConfidence(content, persona);

    // Store in memory
    await this.memoryService.addToShortTermMemory(
      sessionId,
      personaId,
      userMessage,
      'user',
      { hasImage: !!imageData }
    );
    
    await this.memoryService.addToShortTermMemory(
      sessionId,
      personaId,
      content,
      'assistant',
      { confidence, emotionalTone }
    );

    return {
      content,
      metadata: {
        confidence,
        emotionalTone,
        reasoning: 'Multimodal response generated',
        memoryUsed: ['multimodal'],
        responseTime: 0, // Would be calculated
        tokensUsed: this.estimateTokenCount(content),
      },
    };
  }

  // Batch processing for multiple personas
  async generateBatchResponses(
    requests: Array<{
      personaId: string;
      userMessage: string;
      sessionId: string;
      options?: Partial<ResponseGenerationOptions>;
    }>
  ): Promise<GeneratedResponse[]> {
    const promises = requests.map(request =>
      this.generateResponse(
        request.personaId,
        request.userMessage,
        request.sessionId,
        request.options
      )
    );

    return Promise.all(promises);
  }

  // Response quality analysis
  async analyzeResponseQuality(
    response: GeneratedResponse,
    persona: ExtractedPersona,
    userMessage: string
  ): Promise<{
    overallScore: number;
    personaAlignment: number;
    naturalness: number;
    relevance: number;
    suggestions: string[];
  }> {
    const personaAlignment = this.calculatePersonaAlignment(response.content, persona);
    const naturalness = this.calculateNaturalness(response.content);
    const relevance = this.calculateRelevance(response.content, userMessage);
    
    const overallScore = (personaAlignment + naturalness + relevance) / 3;
    
    const suggestions = this.generateImprovementSuggestions(
      response.content,
      persona,
      personaAlignment,
      naturalness,
      relevance
    );

    return {
      overallScore,
      personaAlignment,
      naturalness,
      relevance,
      suggestions,
    };
  }

  private calculatePersonaAlignment(content: string, persona: ExtractedPersona): number {
    let score = 0.5;
    
    // Check communication style
    const style = persona.traits.behaviors.communicationStyle;
    if (style === 'formal' && !this.hasCasualLanguage(content)) score += 0.1;
    if (style === 'casual' && this.hasCasualLanguage(content)) score += 0.1;
    if (style === 'technical' && this.hasTechnicalLanguage(content)) score += 0.1;
    
    // Check personality traits
    const personality = persona.traits.psychographics.personality;
    if (personality.extraversion > 0.7 && this.hasEnthusiasticLanguage(content)) score += 0.1;
    if (personality.conscientiousness > 0.7 && this.hasStructuredLanguage(content)) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private calculateNaturalness(content: string): number {
    let score = 0.5;
    
    // Check for natural language patterns
    if (this.hasNaturalLanguagePatterns(content)) score += 0.2;
    if (this.hasAppropriateLength(content)) score += 0.1;
    if (this.hasVariedSentenceStructure(content)) score += 0.1;
    if (this.hasEmotionalExpression(content)) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private calculateRelevance(content: string, userMessage: string): number {
    // Simple relevance calculation - in production, use more sophisticated NLP
    const userWords = userMessage.toLowerCase().split(/\s+/);
    const responseWords = content.toLowerCase().split(/\s+/);
    
    const commonWords = userWords.filter(word => responseWords.includes(word));
    const relevance = commonWords.length / Math.max(userWords.length, 1);
    
    return Math.min(relevance, 1.0);
  }

  private hasCasualLanguage(content: string): boolean {
    const casualPatterns = [/\b(yeah|yep|nope|gonna|wanna|gotta)\b/i];
    return casualPatterns.some(pattern => pattern.test(content));
  }

  private hasTechnicalLanguage(content: string): boolean {
    const technicalPatterns = [/\b(API|database|algorithm|optimization|implementation)\b/i];
    return technicalPatterns.some(pattern => pattern.test(content));
  }

  private hasEnthusiasticLanguage(content: string): boolean {
    const enthusiasticPatterns = [/\b(wow|amazing|fantastic|excited|love|great)\b/i, /!/g];
    return enthusiasticPatterns.some(pattern => pattern.test(content));
  }

  private hasStructuredLanguage(content: string): boolean {
    const structuredPatterns = [/\b(first|second|third|step|process|method)\b/i];
    return structuredPatterns.some(pattern => pattern.test(content));
  }

  private hasAppropriateLength(content: string): boolean {
    const length = content.length;
    return length >= 20 && length <= 500; // Reasonable response length
  }

  private hasVariedSentenceStructure(content: string): boolean {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) return false;
    
    const lengths = sentences.map(s => s.length);
    const variance = Math.max(...lengths) - Math.min(...lengths);
    return variance > 10; // Some variation in sentence length
  }

  private hasEmotionalExpression(content: string): boolean {
    const emotionalPatterns = [/\b(feel|think|believe|hope|wish|worry|excited|concerned)\b/i];
    return emotionalPatterns.some(pattern => pattern.test(content));
  }

  private generateImprovementSuggestions(
    content: string,
    persona: ExtractedPersona,
    personaAlignment: number,
    naturalness: number,
    relevance: number
  ): string[] {
    const suggestions: string[] = [];
    
    if (personaAlignment < 0.7) {
      suggestions.push('Better align with persona communication style');
    }
    
    if (naturalness < 0.7) {
      suggestions.push('Add more natural language patterns and fillers');
    }
    
    if (relevance < 0.7) {
      suggestions.push('Make response more directly relevant to user input');
    }
    
    if (content.length < 20) {
      suggestions.push('Provide more detailed and substantial response');
    }
    
    if (content.length > 500) {
      suggestions.push('Consider making response more concise');
    }
    
    return suggestions;
  }
}






