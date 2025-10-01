// Simplified memory management without external vector databases
// import { Pinecone } from 'pinecone-client';
// import { ChromaClient } from 'chromadb';
// import { WeaviateClient } from 'weaviate-ts-client';
// import { OpenAIEmbeddings } from '@langchain/openai/embeddings';
// import { MemoryVectorStore } from '@langchain/community/vectorstores/memory';
// import { Document } from '@langchain/core/documents';
import Redis from 'ioredis';
import { AgentMemory, ConversationMemory, PersonaMemory, ResearchMemory } from '../types/MemoryTypes';

export class AgentMemoryManager {
  private pinecone: Pinecone;
  private chroma: ChromaClient;
  private weaviate: WeaviateClient;
  private redis: Redis;
  private embeddings: OpenAIEmbeddings;
  private vectorStore: MemoryVectorStore;

  constructor() {
    // Initialize Pinecone
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || 'dummy-key',
      environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1'
    });

    // Initialize Chroma
    this.chroma = new ChromaClient({
      path: process.env.CHROMA_URL || 'http://localhost:8000'
    });

    // Initialize Weaviate
    this.weaviate = new WeaviateClient({
      scheme: 'http',
      host: process.env.WEAVIATE_URL || 'localhost:8080'
    });

    // Initialize Redis
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    this.vectorStore = new MemoryVectorStore(this.embeddings);
  }

  // Persona Memory Management
  async storePersonaMemory(agentId: string, personaData: PersonaMemory): Promise<void> {
    try {
      // Store in Pinecone for long-term retrieval
      const index = this.pinecone.Index('persona-memories');
      const embedding = await this.embeddings.embedQuery(JSON.stringify(personaData));
      
      await index.upsert([{
        id: `persona_${agentId}_${Date.now()}`,
        values: embedding,
        metadata: {
          agentId,
          type: 'persona',
          timestamp: new Date().toISOString(),
          ...personaData
        }
      }]);

      // Store in Redis for fast access
      await this.redis.hset(`persona:${agentId}`, {
        demographics: JSON.stringify(personaData.demographics),
        personality: JSON.stringify(personaData.personality),
        preferences: JSON.stringify(personaData.preferences),
        lastUpdated: new Date().toISOString()
      });

      // Store in Chroma for similarity search
      await this.chroma.addDocuments({
        collection: 'persona_memories',
        documents: [JSON.stringify(personaData)],
        metadatas: [{ agentId, type: 'persona' }],
        ids: [`persona_${agentId}_${Date.now()}`]
      });

    } catch (error) {
      console.error('Error storing persona memory:', error);
      throw error;
    }
  }

  async retrievePersonaMemory(agentId: string): Promise<PersonaMemory | null> {
    try {
      // Try Redis first for fast access
      const cached = await this.redis.hgetall(`persona:${agentId}`);
      if (cached && Object.keys(cached).length > 0) {
        return {
          demographics: JSON.parse(cached.demographics || '{}'),
          personality: JSON.parse(cached.personality || '{}'),
          preferences: JSON.parse(cached.preferences || '{}'),
          lastUpdated: cached.lastUpdated
        };
      }

      // Fallback to Pinecone
      const index = this.pinecone.Index('persona-memories');
      const queryResponse = await index.query({
        vector: [0], // Dummy vector for metadata search
        filter: { agentId: { $eq: agentId } },
        topK: 1,
        includeMetadata: true
      });

      if (queryResponse.matches && queryResponse.matches.length > 0) {
        return queryResponse.matches[0].metadata as PersonaMemory;
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

      // Store in Weaviate for semantic search
      await this.weaviate.data
        .creator()
        .withClassName('Conversation')
        .withProperties({
          sessionId,
          agentId: conversation.agentId,
          message: conversation.message,
          response: conversation.response,
          timestamp: conversation.timestamp,
          sentiment: conversation.sentiment,
          topics: conversation.topics
        })
        .do();

      // Store in vector store for similarity search
      const doc = new Document({
        pageContent: `${conversation.message} ${conversation.response}`,
        metadata: {
          sessionId,
          agentId: conversation.agentId,
          timestamp: conversation.timestamp
        }
      });

      await this.vectorStore.addDocuments([doc]);

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
      // Store in Pinecone for long-term research insights
      const index = this.pinecone.Index('research-memories');
      const embedding = await this.embeddings.embedQuery(JSON.stringify(researchData.insights));
      
      await index.upsert([{
        id: `research_${researchData.id}_${Date.now()}`,
        values: embedding,
        metadata: {
          researchId: researchData.id,
          type: 'research',
          timestamp: new Date().toISOString(),
          ...researchData
        }
      }]);

      // Store in Chroma for similarity search
      await this.chroma.addDocuments({
        collection: 'research_memories',
        documents: [JSON.stringify(researchData.insights)],
        metadatas: [{ researchId: researchData.id, type: 'research' }],
        ids: [`research_${researchData.id}_${Date.now()}`]
      });

    } catch (error) {
      console.error('Error storing research memory:', error);
      throw error;
    }
  }

  async searchResearchMemory(query: string, limit: number = 10): Promise<ResearchMemory[]> {
    try {
      // Search in Pinecone
      const index = this.pinecone.Index('research-memories');
      const embedding = await this.embeddings.embedQuery(query);
      
      const searchResponse = await index.query({
        vector: embedding,
        topK: limit,
        includeMetadata: true
      });

      return searchResponse.matches?.map(match => match.metadata as ResearchMemory) || [];

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

  // Memory Similarity Search
  async findSimilarMemories(query: string, agentId?: string, limit: number = 5): Promise<any[]> {
    try {
      const results = await this.vectorStore.similaritySearch(query, limit);
      
      if (agentId) {
        return results.filter(result => result.metadata.agentId === agentId);
      }
      
      return results;
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
      const personaCount = await this.redis.hlen('persona:*');
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

export const agentMemoryManager = new AgentMemoryManager();

// import { ChromaClient } from 'chromadb';
// import { WeaviateClient } from 'weaviate-ts-client';
// import { OpenAIEmbeddings } from '@langchain/openai/embeddings';
// import { MemoryVectorStore } from '@langchain/community/vectorstores/memory';
// import { Document } from '@langchain/core/documents';
import Redis from 'ioredis';
import { AgentMemory, ConversationMemory, PersonaMemory, ResearchMemory } from '../types/MemoryTypes';

export class AgentMemoryManager {
  private pinecone: Pinecone;
  private chroma: ChromaClient;
  private weaviate: WeaviateClient;
  private redis: Redis;
  private embeddings: OpenAIEmbeddings;
  private vectorStore: MemoryVectorStore;

  constructor() {
    // Initialize Pinecone
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || 'dummy-key',
      environment: process.env.PINECONE_ENVIRONMENT || 'us-east-1'
    });

    // Initialize Chroma
    this.chroma = new ChromaClient({
      path: process.env.CHROMA_URL || 'http://localhost:8000'
    });

    // Initialize Weaviate
    this.weaviate = new WeaviateClient({
      scheme: 'http',
      host: process.env.WEAVIATE_URL || 'localhost:8080'
    });

    // Initialize Redis
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    this.vectorStore = new MemoryVectorStore(this.embeddings);
  }

  // Persona Memory Management
  async storePersonaMemory(agentId: string, personaData: PersonaMemory): Promise<void> {
    try {
      // Store in Pinecone for long-term retrieval
      const index = this.pinecone.Index('persona-memories');
      const embedding = await this.embeddings.embedQuery(JSON.stringify(personaData));
      
      await index.upsert([{
        id: `persona_${agentId}_${Date.now()}`,
        values: embedding,
        metadata: {
          agentId,
          type: 'persona',
          timestamp: new Date().toISOString(),
          ...personaData
        }
      }]);

      // Store in Redis for fast access
      await this.redis.hset(`persona:${agentId}`, {
        demographics: JSON.stringify(personaData.demographics),
        personality: JSON.stringify(personaData.personality),
        preferences: JSON.stringify(personaData.preferences),
        lastUpdated: new Date().toISOString()
      });

      // Store in Chroma for similarity search
      await this.chroma.addDocuments({
        collection: 'persona_memories',
        documents: [JSON.stringify(personaData)],
        metadatas: [{ agentId, type: 'persona' }],
        ids: [`persona_${agentId}_${Date.now()}`]
      });

    } catch (error) {
      console.error('Error storing persona memory:', error);
      throw error;
    }
  }

  async retrievePersonaMemory(agentId: string): Promise<PersonaMemory | null> {
    try {
      // Try Redis first for fast access
      const cached = await this.redis.hgetall(`persona:${agentId}`);
      if (cached && Object.keys(cached).length > 0) {
        return {
          demographics: JSON.parse(cached.demographics || '{}'),
          personality: JSON.parse(cached.personality || '{}'),
          preferences: JSON.parse(cached.preferences || '{}'),
          lastUpdated: cached.lastUpdated
        };
      }

      // Fallback to Pinecone
      const index = this.pinecone.Index('persona-memories');
      const queryResponse = await index.query({
        vector: [0], // Dummy vector for metadata search
        filter: { agentId: { $eq: agentId } },
        topK: 1,
        includeMetadata: true
      });

      if (queryResponse.matches && queryResponse.matches.length > 0) {
        return queryResponse.matches[0].metadata as PersonaMemory;
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

      // Store in Weaviate for semantic search
      await this.weaviate.data
        .creator()
        .withClassName('Conversation')
        .withProperties({
          sessionId,
          agentId: conversation.agentId,
          message: conversation.message,
          response: conversation.response,
          timestamp: conversation.timestamp,
          sentiment: conversation.sentiment,
          topics: conversation.topics
        })
        .do();

      // Store in vector store for similarity search
      const doc = new Document({
        pageContent: `${conversation.message} ${conversation.response}`,
        metadata: {
          sessionId,
          agentId: conversation.agentId,
          timestamp: conversation.timestamp
        }
      });

      await this.vectorStore.addDocuments([doc]);

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
      // Store in Pinecone for long-term research insights
      const index = this.pinecone.Index('research-memories');
      const embedding = await this.embeddings.embedQuery(JSON.stringify(researchData.insights));
      
      await index.upsert([{
        id: `research_${researchData.id}_${Date.now()}`,
        values: embedding,
        metadata: {
          researchId: researchData.id,
          type: 'research',
          timestamp: new Date().toISOString(),
          ...researchData
        }
      }]);

      // Store in Chroma for similarity search
      await this.chroma.addDocuments({
        collection: 'research_memories',
        documents: [JSON.stringify(researchData.insights)],
        metadatas: [{ researchId: researchData.id, type: 'research' }],
        ids: [`research_${researchData.id}_${Date.now()}`]
      });

    } catch (error) {
      console.error('Error storing research memory:', error);
      throw error;
    }
  }

  async searchResearchMemory(query: string, limit: number = 10): Promise<ResearchMemory[]> {
    try {
      // Search in Pinecone
      const index = this.pinecone.Index('research-memories');
      const embedding = await this.embeddings.embedQuery(query);
      
      const searchResponse = await index.query({
        vector: embedding,
        topK: limit,
        includeMetadata: true
      });

      return searchResponse.matches?.map(match => match.metadata as ResearchMemory) || [];

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

  // Memory Similarity Search
  async findSimilarMemories(query: string, agentId?: string, limit: number = 5): Promise<any[]> {
    try {
      const results = await this.vectorStore.similaritySearch(query, limit);
      
      if (agentId) {
        return results.filter(result => result.metadata.agentId === agentId);
      }
      
      return results;
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
      const personaCount = await this.redis.hlen('persona:*');
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

export const agentMemoryManager = new AgentMemoryManager();
