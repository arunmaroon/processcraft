import Redis from 'ioredis';
import { AgentMemory, ConversationMemory, ResearchMemory } from '../types/MemoryTypes';

// Define PersonaMemory interface locally since it's not in MemoryTypes
export interface PersonaMemory {
  demographics: {
    age: number;
    location: string;
    occupation: string;
    income: string;
    familyStatus: string;
    techSavviness: string;
    englishLiteracy: string;
  };
  personality: {
    traits: string[];
    communicationStyle: string;
    emotionalTone: string;
    responseLength: 'brief' | 'moderate' | 'detailed';
    riskTolerance: 'low' | 'medium' | 'high';
    decisionMaking: 'analytical' | 'intuitive' | 'collaborative';
  };
  preferences: {
    topics: string[];
    communicationChannels: string[];
    responseTime: 'immediate' | 'within_hour' | 'within_day';
    formality: 'casual' | 'professional' | 'formal';
  };
  lastUpdated: string;
}

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

  // Agent Memory Management
  async storeAgentMemory(agentId: string, memory: AgentMemory): Promise<void> {
    try {
      await this.redis.hset(`agent:${agentId}`, {
        agentId: memory.agentId,
        persona: JSON.stringify(memory.persona)
      });
    } catch (error) {
      console.error('Error storing agent memory:', error);
      throw error;
    }
  }

  async retrieveAgentMemory(agentId: string): Promise<AgentMemory | null> {
    try {
      const cached = await this.redis.hgetall(`agent:${agentId}`);
      if (cached && Object.keys(cached).length > 0) {
        return {
          agentId: cached.agentId,
          persona: JSON.parse(cached.persona || '{}')
        };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving agent memory:', error);
      return null;
    }
  }

  // Conversation Memory Management
  async storeConversationMemory(sessionId: string, memory: ConversationMemory): Promise<void> {
    try {
      await this.redis.hset(`conversation:${sessionId}`, {
        sessionId: memory.sessionId,
        agentId: memory.agentId,
        messages: JSON.stringify(memory.messages),
        context: JSON.stringify(memory.context),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error storing conversation memory:', error);
      throw error;
    }
  }

  async retrieveConversationMemory(sessionId: string): Promise<ConversationMemory | null> {
    try {
      const cached = await this.redis.hgetall(`conversation:${sessionId}`);
      if (cached && Object.keys(cached).length > 0) {
        return {
          sessionId: cached.sessionId,
          agentId: cached.agentId,
          messages: JSON.parse(cached.messages || '[]'),
          context: JSON.parse(cached.context || '{}'),
          lastUpdated: cached.lastUpdated
        };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving conversation memory:', error);
      return null;
    }
  }

  // Research Memory Management
  async storeResearchMemory(researchId: string, memory: ResearchMemory): Promise<void> {
    try {
      await this.redis.hset(`research:${researchId}`, {
        researchId: memory.researchId,
        agentId: memory.agentId,
        insights: JSON.stringify(memory.insights),
        data: JSON.stringify(memory.data),
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error storing research memory:', error);
      throw error;
    }
  }

  async retrieveResearchMemory(researchId: string): Promise<ResearchMemory | null> {
    try {
      const cached = await this.redis.hgetall(`research:${researchId}`);
      if (cached && Object.keys(cached).length > 0) {
        return {
          researchId: cached.researchId,
          agentId: cached.agentId,
          insights: JSON.parse(cached.insights || '{}'),
          data: JSON.parse(cached.data || '{}'),
          lastUpdated: cached.lastUpdated
        };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving research memory:', error);
      return null;
    }
  }

  // Memory Search
  async findSimilarMemories(query: string, agentId?: string, limit: number = 5): Promise<any[]> {
    try {
      // Simple search implementation
      const results = [];
      
      // Search in agent memories
      if (agentId) {
        const agentMemory = await this.retrieveAgentMemory(agentId);
        if (agentMemory) {
          results.push({
            type: 'agent',
            id: agentMemory.agentId,
            content: JSON.stringify(agentMemory.persona),
            relevance: 0.8,
            metadata: {
              agentId: agentMemory.agentId,
              timestamp: agentMemory.persona.lastUpdated,
              type: 'persona',
              score: 0.8
            }
          });
        }
      }

      // Search in conversation memories
      const conversationKeys = await this.redis.keys('conversation:*');
      for (const key of conversationKeys.slice(0, limit)) {
        const memory = await this.retrieveConversationMemory(key.replace('conversation:', ''));
        if (memory && memory.messages.some(msg => msg.content.toLowerCase().includes(query.toLowerCase()))) {
          results.push({
            type: 'conversation',
            id: memory.sessionId,
            content: memory.messages.map(m => m.content).join(' '),
            relevance: 0.7,
            metadata: {
              agentId: memory.agentId,
              sessionId: memory.sessionId,
              timestamp: memory.lastUpdated,
              type: 'conversation',
              score: 0.7
            }
          });
        }
      }

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error searching memories:', error);
      return [];
    }
  }

  // Cleanup old memories
  async cleanupOldMemories(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      // Clean up old conversation memories
      const conversationKeys = await this.redis.keys('conversation:*');
      for (const key of conversationKeys) {
        const memory = await this.retrieveConversationMemory(key.replace('conversation:', ''));
        if (memory && new Date(memory.lastUpdated) < cutoffDate) {
          await this.redis.del(key);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old memories:', error);
    }
  }

  // Get agent memory for specific agent and session
  async getAgentMemory(agentId: string, sessionId?: string): Promise<any> {
    try {
      const agentMemory = await this.retrieveAgentMemory(agentId);
      let conversationMemory = null;
      
      if (sessionId) {
        conversationMemory = await this.retrieveConversationMemory(sessionId);
      }

      return {
        agent: agentMemory,
        conversation: conversationMemory
      };
    } catch (error) {
      console.error('Error getting agent memory:', error);
      return null;
    }
  }
}

export const agentMemoryManager = new SimpleMemoryManager();