import { createClient } from 'redis';
import { Pool } from 'pg';
import { OpenAI } from 'openai';

interface MemoryEntry {
  id: string;
  sessionId: string;
  personaId: string;
  type: 'conversation' | 'preference' | 'fact' | 'emotion' | 'goal';
  content: string;
  metadata: {
    timestamp: Date;
    importance: number; // 0-1 scale
    context: string[];
    emotionalTone?: string;
    topics: string[];
  };
  embedding?: number[];
}

interface ConversationMemory {
  sessionId: string;
  personaId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: any;
  }>;
  summary: string;
  keyInsights: string[];
  emotionalState: string;
  lastUpdated: Date;
}

interface LongTermMemory {
  personaId: string;
  facts: string[];
  preferences: string[];
  goals: string[];
  relationships: string[];
  experiences: string[];
  lastUpdated: Date;
}

export class MemoryManagementService {
  private redis: any;
  private db: Pool;
  private openai: OpenAI;
  private vectorStore: any; // Would be Pinecone or similar in production

  constructor() {
    this.redis = createClient({
      url: process.env.REDIS_URL,
    });
    
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async initialize(): Promise<void> {
    await this.redis.connect();
    console.log('Memory Management Service initialized');
  }

  // Short-term memory (Redis) - Session-based
  async addToShortTermMemory(
    sessionId: string,
    personaId: string,
    message: string,
    role: 'user' | 'assistant',
    metadata?: any
  ): Promise<void> {
    const memoryEntry: MemoryEntry = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      personaId,
      type: 'conversation',
      content: message,
      metadata: {
        timestamp: new Date(),
        importance: await this.calculateImportance(message),
        context: await this.extractContext(message),
        emotionalTone: await this.analyzeEmotionalTone(message),
        topics: await this.extractTopics(message),
      },
    };

    // Store in Redis with TTL (24 hours)
    await this.redis.setex(
      `session:${sessionId}:${memoryEntry.id}`,
      86400,
      JSON.stringify(memoryEntry)
    );

    // Add to session list
    await this.redis.lpush(`session:${sessionId}:messages`, memoryEntry.id);

    // Update conversation summary
    await this.updateConversationSummary(sessionId, personaId);
  }

  async getShortTermMemory(sessionId: string, limit: number = 20): Promise<MemoryEntry[]> {
    const messageIds = await this.redis.lrange(`session:${sessionId}:messages`, 0, limit - 1);
    const memories: MemoryEntry[] = [];

    for (const id of messageIds) {
      const memoryData = await this.redis.get(`session:${sessionId}:${id}`);
      if (memoryData) {
        memories.push(JSON.parse(memoryData));
      }
    }

    return memories.sort((a, b) => 
      new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
    );
  }

  // Long-term memory (PostgreSQL + Vector DB) - Persona-based
  async addToLongTermMemory(
    personaId: string,
    content: string,
    type: 'fact' | 'preference' | 'goal' | 'experience',
    importance: number = 0.5
  ): Promise<void> {
    const memoryEntry: MemoryEntry = {
      id: `ltm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: 'longterm',
      personaId,
      type,
      content,
      metadata: {
        timestamp: new Date(),
        importance,
        context: await this.extractContext(content),
        emotionalTone: await this.analyzeEmotionalTone(content),
        topics: await this.extractTopics(content),
      },
    };

    // Generate embedding for semantic search
    memoryEntry.embedding = await this.generateEmbedding(content);

    // Store in PostgreSQL
    await this.storeLongTermMemory(memoryEntry);

    // Store in vector DB for semantic search
    await this.storeInVectorDB(memoryEntry);
  }

  async searchLongTermMemory(
    personaId: string,
    query: string,
    limit: number = 5
  ): Promise<MemoryEntry[]> {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Search vector DB (simplified - would use Pinecone in production)
    const similarMemories = await this.searchVectorDB(queryEmbedding, personaId, limit);

    return similarMemories;
  }

  async getRelevantContext(
    sessionId: string,
    personaId: string,
    currentMessage: string,
    maxTokens: number = 1000
  ): Promise<string> {
    // Get recent conversation
    const recentMemories = await this.getShortTermMemory(sessionId, 10);
    
    // Search for relevant long-term memories
    const relevantMemories = await this.searchLongTermMemory(personaId, currentMessage, 5);
    
    // Combine and format context
    const context = this.formatContext(recentMemories, relevantMemories, maxTokens);
    
    return context;
  }

  // Memory consolidation and summarization
  async consolidateMemory(sessionId: string, personaId: string): Promise<void> {
    const memories = await this.getShortTermMemory(sessionId, 50);
    
    if (memories.length < 5) return; // Not enough to consolidate

    // Extract key insights
    const keyInsights = await this.extractKeyInsights(memories);
    
    // Extract facts, preferences, and goals
    const facts = await this.extractFacts(memories);
    const preferences = await this.extractPreferences(memories);
    const goals = await this.extractGoals(memories);

    // Store in long-term memory
    for (const fact of facts) {
      await this.addToLongTermMemory(personaId, fact, 'fact', 0.7);
    }

    for (const preference of preferences) {
      await this.addToLongTermMemory(personaId, preference, 'preference', 0.8);
    }

    for (const goal of goals) {
      await this.addToLongTermMemory(personaId, goal, 'goal', 0.9);
    }

    // Update conversation summary
    await this.updateConversationSummary(sessionId, personaId);
  }

  // Emotional state tracking
  async updateEmotionalState(sessionId: string, personaId: string, message: string): Promise<void> {
    const emotionalTone = await this.analyzeEmotionalTone(message);
    
    await this.redis.setex(
      `session:${sessionId}:emotional_state`,
      3600, // 1 hour TTL
      emotionalTone
    );

    // Store emotional memory
    await this.addToLongTermMemory(
      personaId,
      `Emotional state: ${emotionalTone} - ${message}`,
      'emotion',
      0.6
    );
  }

  async getEmotionalState(sessionId: string): Promise<string> {
    const state = await this.redis.get(`session:${sessionId}:emotional_state`);
    return state || 'neutral';
  }

  // Private helper methods
  private async calculateImportance(message: string): Promise<number> {
    const prompt = `
    Rate the importance of this message on a scale of 0-1:
    
    Message: "${message}"
    
    Consider:
    - Does it contain personal information?
    - Does it express strong preferences or opinions?
    - Does it contain goals or aspirations?
    - Does it reveal important facts about the person?
    
    Respond with only a number between 0 and 1.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const importance = parseFloat(response.choices[0].message.content || '0.5');
    return Math.max(0, Math.min(1, importance));
  }

  private async extractContext(message: string): Promise<string[]> {
    const prompt = `
    Extract the main context topics from this message:
    
    Message: "${message}"
    
    Return 3-5 context topics as a comma-separated list.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const topics = response.choices[0].message.content || '';
    return topics.split(',').map(t => t.trim()).filter(Boolean);
  }

  private async analyzeEmotionalTone(message: string): Promise<string> {
    const prompt = `
    Analyze the emotional tone of this message:
    
    Message: "${message}"
    
    Respond with one of: positive, negative, neutral, excited, concerned, frustrated, curious, confident, uncertain
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    return response.choices[0].message.content?.toLowerCase() || 'neutral';
  }

  private async extractTopics(message: string): Promise<string[]> {
    const prompt = `
    Extract the main topics from this message:
    
    Message: "${message}"
    
    Return 2-4 topics as a comma-separated list.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const topics = response.choices[0].message.content || '';
    return topics.split(',').map(t => t.trim()).filter(Boolean);
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  }

  private async updateConversationSummary(sessionId: string, personaId: string): Promise<void> {
    const memories = await this.getShortTermMemory(sessionId, 20);
    
    if (memories.length < 3) return;

    const conversation = memories
      .map(m => `${m.metadata.timestamp}: ${m.content}`)
      .join('\n');

    const prompt = `
    Summarize this conversation in 2-3 sentences, focusing on:
    - Main topics discussed
    - Key decisions or preferences expressed
    - Current emotional state
    
    Conversation:
    ${conversation}
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const summary = response.choices[0].message.content || '';
    
    await this.redis.setex(
      `session:${sessionId}:summary`,
      3600,
      summary
    );
  }

  private async extractKeyInsights(memories: MemoryEntry[]): Promise<string[]> {
    const content = memories
      .map(m => m.content)
      .join('\n');

    const prompt = `
    Extract 3-5 key insights from this conversation:
    
    ${content}
    
    Focus on important facts, preferences, or decisions mentioned.
    Return as a bulleted list.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const insights = response.choices[0].message.content || '';
    return insights.split('\n').map(i => i.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
  }

  private async extractFacts(memories: MemoryEntry[]): Promise<string[]> {
    const content = memories
      .map(m => m.content)
      .join('\n');

    const prompt = `
    Extract factual statements about the person from this conversation:
    
    ${content}
    
    Return 3-5 facts as a bulleted list.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const facts = response.choices[0].message.content || '';
    return facts.split('\n').map(f => f.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
  }

  private async extractPreferences(memories: MemoryEntry[]): Promise<string[]> {
    const content = memories
      .map(m => m.content)
      .join('\n');

    const prompt = `
    Extract preferences and opinions from this conversation:
    
    ${content}
    
    Return 3-5 preferences as a bulleted list.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const preferences = response.choices[0].message.content || '';
    return preferences.split('\n').map(p => p.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
  }

  private async extractGoals(memories: MemoryEntry[]): Promise<string[]> {
    const content = memories
      .map(m => m.content)
      .join('\n');

    const prompt = `
    Extract goals and aspirations from this conversation:
    
    ${content}
    
    Return 3-5 goals as a bulleted list.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const goals = response.choices[0].message.content || '';
    return goals.split('\n').map(g => g.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
  }

  private formatContext(
    recentMemories: MemoryEntry[],
    relevantMemories: MemoryEntry[],
    maxTokens: number
  ): string {
    let context = '';
    let tokenCount = 0;

    // Add recent conversation
    context += 'RECENT CONVERSATION:\n';
    for (const memory of recentMemories.slice(0, 5)) {
      const entry = `${memory.metadata.timestamp}: ${memory.content}\n`;
      if (tokenCount + entry.length > maxTokens * 0.7) break;
      context += entry;
      tokenCount += entry.length;
    }

    // Add relevant long-term memories
    if (relevantMemories.length > 0) {
      context += '\nRELEVANT BACKGROUND:\n';
      for (const memory of relevantMemories.slice(0, 3)) {
        const entry = `${memory.type}: ${memory.content}\n`;
        if (tokenCount + entry.length > maxTokens) break;
        context += entry;
        tokenCount += entry.length;
      }
    }

    return context;
  }

  private async storeLongTermMemory(memory: MemoryEntry): Promise<void> {
    const query = `
      INSERT INTO long_term_memory 
      (id, session_id, persona_id, type, content, metadata, embedding, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO UPDATE SET
      content = EXCLUDED.content,
      metadata = EXCLUDED.metadata,
      updated_at = NOW()
    `;

    await this.db.query(query, [
      memory.id,
      memory.sessionId,
      memory.personaId,
      memory.type,
      memory.content,
      JSON.stringify(memory.metadata),
      JSON.stringify(memory.embedding),
    ]);
  }

  private async storeInVectorDB(memory: MemoryEntry): Promise<void> {
    // In production, this would store in Pinecone or similar
    // For now, we'll store in Redis as a simplified version
    await this.redis.setex(
      `vector:${memory.personaId}:${memory.id}`,
      86400 * 30, // 30 days
      JSON.stringify({
        id: memory.id,
        content: memory.content,
        embedding: memory.embedding,
        metadata: memory.metadata,
      })
    );
  }

  private async searchVectorDB(
    queryEmbedding: number[],
    personaId: string,
    limit: number
  ): Promise<MemoryEntry[]> {
    // Simplified vector search - in production, use Pinecone
    const pattern = `vector:${personaId}:*`;
    const keys = await this.redis.keys(pattern);
    
    const memories: MemoryEntry[] = [];
    
    for (const key of keys.slice(0, limit)) {
      const data = await this.redis.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        memories.push({
          id: parsed.id,
          sessionId: 'longterm',
          personaId,
          type: 'fact',
          content: parsed.content,
          metadata: parsed.metadata,
          embedding: parsed.embedding,
        });
      }
    }
    
    return memories;
  }

  async cleanup(): Promise<void> {
    await this.redis.quit();
  }
}






