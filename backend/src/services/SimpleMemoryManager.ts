import Redis from 'ioredis';
import { AgentMemory, ConversationMemory, PersonaMemory, ResearchMemory } from '../types/MemoryTypes';

export class SimpleMemoryManager {
  private redis: Redis;

  constructor() {
    // Initialize Redis
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
  }

  // Persona Memory Management
  async storePersonaMemory(agentId: string, personaData: PersonaMemory): Promise<void> {
    try {
      // Store in Redis for fast access
      await this.redis.hset(`persona:${agentId}`, {
        demographics: JSON.stringify(personaData.demographics),
        personality: JSON.stringify(personaData.personality),
        preferences: JSON.stringify(personaData.preferences),
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error storing persona memory:', error);
      throw error;
    }
  }

  async retrievePersonaMemory(agentId: string): Promise<PersonaMemory | null> {
    try {
      // Get from Redis
      const cached = await this.redis.hgetall(`persona:${agentId}`);
      if (cached && Object.keys(cached).length > 0) {
        return {
          demographics: JSON.parse(cached.demographics || '{}'),
          personality: JSON.parse(cached.personality || '{}'),
          preferences: JSON.parse(cached.preferences || '{}'),
          lastUpdated: cached.lastUpdated
        };
      }

      return null;
    } catch (error) {
      console.error('Error retrieving persona memory:', error);
      return null;
    }
  }

  // Conversation Memory Management
  async storeConversationMemory(sessionId: string, conversation: ConversationMemory): Promise<void> {
    try {
      // Store in Redis for real-time access
      await this.redis.lpush(`conversation:${sessionId}`, JSON.stringify(conversation));
      await this.redis.expire(`conversation:${sessionId}`, 86400); // 24 hours

    } catch (error) {
      console.error('Error storing conversation memory:', error);
      throw error;
    }
  }

  async retrieveConversationMemory(sessionId: string, limit: number = 50): Promise<ConversationMemory[]> {
    try {
      // Get from Redis
      const conversations = await this.redis.lrange(`conversation:${sessionId}`, 0, limit - 1);
      return conversations.map(conv => JSON.parse(conv));
    } catch (error) {
      console.error('Error retrieving conversation memory:', error);
      return [];
    }
  }

  // Research Memory Management
  async storeResearchMemory(researchData: ResearchMemory): Promise<void> {
    try {
      // Store in Redis
      await this.redis.hset(`research:${researchData.id}`, {
        insights: JSON.stringify(researchData.insights),
        demographics: JSON.stringify(researchData.demographics),
        patterns: JSON.stringify(researchData.patterns),
        recommendations: JSON.stringify(researchData.recommendations),
        confidence: researchData.confidence.toString(),
        timestamp: researchData.timestamp,
        source: researchData.source
      });

    } catch (error) {
      console.error('Error storing research memory:', error);
      throw error;
    }
  }

  async searchResearchMemory(query: string, limit: number = 10): Promise<ResearchMemory[]> {
    try {
      // Simple text search in Redis
      const keys = await this.redis.keys('research:*');
      const results: ResearchMemory[] = [];

      for (const key of keys) {
        const data = await this.redis.hgetall(key);
        if (data && data.insights) {
          const insights = JSON.parse(data.insights);
          const searchText = JSON.stringify(insights).toLowerCase();
          
          if (searchText.includes(query.toLowerCase())) {
            results.push({
              id: key.replace('research:', ''),
              insights: insights,
              demographics: JSON.parse(data.demographics || '{}'),
              patterns: JSON.parse(data.patterns || '[]'),
              recommendations: JSON.parse(data.recommendations || '[]'),
              confidence: parseFloat(data.confidence || '0'),
              timestamp: data.timestamp || new Date().toISOString(),
              source: data.source || 'unknown'
            });
          }
        }
      }

      return results.slice(0, limit);

    } catch (error) {
      console.error('Error searching research memory:', error);
      return [];
    }
  }

  // Agent Memory Retrieval
  async getAgentMemory(agentId: string, sessionId: string): Promise<AgentMemory> {
    try {
      const personaMemory = await this.retrievePersonaMemory(agentId);
      const conversationMemory = await this.retrieveConversationMemory(sessionId);
      const researchMemory = await this.searchResearchMemory(`agent ${agentId}`, 5);

      return {
        agentId,
        sessionId,
        persona: personaMemory,
        conversations: conversationMemory,
        research: researchMemory,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting agent memory:', error);
      return {
        agentId,
        sessionId,
        persona: null,
        conversations: [],
        research: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Memory Similarity Search (simplified)
  async findSimilarMemories(query: string, agentId?: string, limit: number = 5): Promise<any[]> {
    try {
      // Simple text-based similarity search
      const conversations = await this.redis.keys('conversation:*');
      const results = [];

      for (const key of conversations) {
        const convs = await this.redis.lrange(key, 0, 10);
        for (const conv of convs) {
          const conversation = JSON.parse(conv);
          const text = `${conversation.message} ${conversation.response}`.toLowerCase();
          
          if (text.includes(query.toLowerCase())) {
            results.push({
              content: text,
              metadata: {
                agentId: conversation.agentId,
                sessionId: conversation.sessionId,
                timestamp: conversation.timestamp,
                type: 'conversation',
                score: 0.8 // Simple score
              }
            });
          }
        }
      }

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error finding similar memories:', error);
      return [];
    }
  }

  // Memory Cleanup
  async cleanupOldMemories(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Clean up Redis conversation memories
      const keys = await this.redis.keys('conversation:*');
      for (const key of keys) {
        const conversations = await this.redis.lrange(key, 0, -1);
        const validConversations = conversations.filter(conv => {
          const conversation = JSON.parse(conv);
          return new Date(conversation.timestamp) > cutoffDate;
        });
        
        if (validConversations.length === 0) {
          await this.redis.del(key);
        } else {
          await this.redis.del(key);
          await this.redis.lpush(key, ...validConversations);
        }
      }

    } catch (error) {
      console.error('Error cleaning up old memories:', error);
    }
  }

  // Memory Analytics
  async getMemoryAnalytics(): Promise<any> {
    try {
      const personaCount = await this.redis.keys('persona:*').then(keys => keys.length);
      const conversationCount = await this.redis.keys('conversation:*').then(keys => keys.length);
      
      return {
        personaMemories: personaCount,
        conversationMemories: conversationCount,
        lastCleanup: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting memory analytics:', error);
      return {};
    }
  }
}

export const agentMemoryManager = new SimpleMemoryManager();
import { AgentMemory, ConversationMemory, PersonaMemory, ResearchMemory } from '../types/MemoryTypes';

export class SimpleMemoryManager {
  private redis: Redis;

  constructor() {
    // Initialize Redis
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
  }

  // Persona Memory Management
  async storePersonaMemory(agentId: string, personaData: PersonaMemory): Promise<void> {
    try {
      // Store in Redis for fast access
      await this.redis.hset(`persona:${agentId}`, {
        demographics: JSON.stringify(personaData.demographics),
        personality: JSON.stringify(personaData.personality),
        preferences: JSON.stringify(personaData.preferences),
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error storing persona memory:', error);
      throw error;
    }
  }

  async retrievePersonaMemory(agentId: string): Promise<PersonaMemory | null> {
    try {
      // Get from Redis
      const cached = await this.redis.hgetall(`persona:${agentId}`);
      if (cached && Object.keys(cached).length > 0) {
        return {
          demographics: JSON.parse(cached.demographics || '{}'),
          personality: JSON.parse(cached.personality || '{}'),
          preferences: JSON.parse(cached.preferences || '{}'),
          lastUpdated: cached.lastUpdated
        };
      }

      return null;
    } catch (error) {
      console.error('Error retrieving persona memory:', error);
      return null;
    }
  }

  // Conversation Memory Management
  async storeConversationMemory(sessionId: string, conversation: ConversationMemory): Promise<void> {
    try {
      // Store in Redis for real-time access
      await this.redis.lpush(`conversation:${sessionId}`, JSON.stringify(conversation));
      await this.redis.expire(`conversation:${sessionId}`, 86400); // 24 hours

    } catch (error) {
      console.error('Error storing conversation memory:', error);
      throw error;
    }
  }

  async retrieveConversationMemory(sessionId: string, limit: number = 50): Promise<ConversationMemory[]> {
    try {
      // Get from Redis
      const conversations = await this.redis.lrange(`conversation:${sessionId}`, 0, limit - 1);
      return conversations.map(conv => JSON.parse(conv));
    } catch (error) {
      console.error('Error retrieving conversation memory:', error);
      return [];
    }
  }

  // Research Memory Management
  async storeResearchMemory(researchData: ResearchMemory): Promise<void> {
    try {
      // Store in Redis
      await this.redis.hset(`research:${researchData.id}`, {
        insights: JSON.stringify(researchData.insights),
        demographics: JSON.stringify(researchData.demographics),
        patterns: JSON.stringify(researchData.patterns),
        recommendations: JSON.stringify(researchData.recommendations),
        confidence: researchData.confidence.toString(),
        timestamp: researchData.timestamp,
        source: researchData.source
      });

    } catch (error) {
      console.error('Error storing research memory:', error);
      throw error;
    }
  }

  async searchResearchMemory(query: string, limit: number = 10): Promise<ResearchMemory[]> {
    try {
      // Simple text search in Redis
      const keys = await this.redis.keys('research:*');
      const results: ResearchMemory[] = [];

      for (const key of keys) {
        const data = await this.redis.hgetall(key);
        if (data && data.insights) {
          const insights = JSON.parse(data.insights);
          const searchText = JSON.stringify(insights).toLowerCase();
          
          if (searchText.includes(query.toLowerCase())) {
            results.push({
              id: key.replace('research:', ''),
              insights: insights,
              demographics: JSON.parse(data.demographics || '{}'),
              patterns: JSON.parse(data.patterns || '[]'),
              recommendations: JSON.parse(data.recommendations || '[]'),
              confidence: parseFloat(data.confidence || '0'),
              timestamp: data.timestamp || new Date().toISOString(),
              source: data.source || 'unknown'
            });
          }
        }
      }

      return results.slice(0, limit);

    } catch (error) {
      console.error('Error searching research memory:', error);
      return [];
    }
  }

  // Agent Memory Retrieval
  async getAgentMemory(agentId: string, sessionId: string): Promise<AgentMemory> {
    try {
      const personaMemory = await this.retrievePersonaMemory(agentId);
      const conversationMemory = await this.retrieveConversationMemory(sessionId);
      const researchMemory = await this.searchResearchMemory(`agent ${agentId}`, 5);

      return {
        agentId,
        sessionId,
        persona: personaMemory,
        conversations: conversationMemory,
        research: researchMemory,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting agent memory:', error);
      return {
        agentId,
        sessionId,
        persona: null,
        conversations: [],
        research: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Memory Similarity Search (simplified)
  async findSimilarMemories(query: string, agentId?: string, limit: number = 5): Promise<any[]> {
    try {
      // Simple text-based similarity search
      const conversations = await this.redis.keys('conversation:*');
      const results = [];

      for (const key of conversations) {
        const convs = await this.redis.lrange(key, 0, 10);
        for (const conv of convs) {
          const conversation = JSON.parse(conv);
          const text = `${conversation.message} ${conversation.response}`.toLowerCase();
          
          if (text.includes(query.toLowerCase())) {
            results.push({
              content: text,
              metadata: {
                agentId: conversation.agentId,
                sessionId: conversation.sessionId,
                timestamp: conversation.timestamp,
                type: 'conversation',
                score: 0.8 // Simple score
              }
            });
          }
        }
      }

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error finding similar memories:', error);
      return [];
    }
  }

  // Memory Cleanup
  async cleanupOldMemories(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      // Clean up Redis conversation memories
      const keys = await this.redis.keys('conversation:*');
      for (const key of keys) {
        const conversations = await this.redis.lrange(key, 0, -1);
        const validConversations = conversations.filter(conv => {
          const conversation = JSON.parse(conv);
          return new Date(conversation.timestamp) > cutoffDate;
        });
        
        if (validConversations.length === 0) {
          await this.redis.del(key);
        } else {
          await this.redis.del(key);
          await this.redis.lpush(key, ...validConversations);
        }
      }

    } catch (error) {
      console.error('Error cleaning up old memories:', error);
    }
  }

  // Memory Analytics
  async getMemoryAnalytics(): Promise<any> {
    try {
      const personaCount = await this.redis.keys('persona:*').then(keys => keys.length);
      const conversationCount = await this.redis.keys('conversation:*').then(keys => keys.length);
      
      return {
        personaMemories: personaCount,
        conversationMemories: conversationCount,
        lastCleanup: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting memory analytics:', error);
      return {};
    }
  }
}

export const agentMemoryManager = new SimpleMemoryManager();
