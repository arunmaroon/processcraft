import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

interface MemoryContext {
  sessionId: string;
  agentId: string;
  conversationHistory: string[];
  userContext: Record<string, any>;
  designContext: Record<string, any>;
  keyInsights: string[];
  preferences: Record<string, any>;
  lastUpdated: Date;
}

export class MemoryService {
  private redis: Redis;
  private memoryPrefix = 'agent_memory:';
  private contextPrefix = 'agent_context:';

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  async getContext(sessionId: string, agentId: string): Promise<MemoryContext | null> {
    try {
      const key = `${this.contextPrefix}${sessionId}:${agentId}`;
      const data = await this.redis.get(key);
      
      if (!data) return null;
      
      const context = JSON.parse(data);
      return {
        ...context,
        lastUpdated: new Date(context.lastUpdated)
      };
    } catch (error) {
      console.error('Error getting memory context:', error);
      return null;
    }
  }

  async updateContext(sessionId: string, agentId: string, update: {
    message?: string;
    response?: string;
    context?: any;
  }): Promise<void> {
    try {
      const key = `${this.contextPrefix}${sessionId}:${agentId}`;
      const existing = await this.getContext(sessionId, agentId);
      
      const context: MemoryContext = {
        sessionId,
        agentId,
        conversationHistory: [
          ...(existing?.conversationHistory || []),
          ...(update.message ? [update.message] : []),
          ...(update.response ? [update.response] : [])
        ].slice(-50), // Keep last 50 messages
        userContext: {
          ...existing?.userContext,
          ...update.context
        },
        designContext: existing?.designContext || {},
        keyInsights: existing?.keyInsights || [],
        preferences: existing?.preferences || {},
        lastUpdated: new Date()
      };

      await this.redis.setex(key, 86400, JSON.stringify(context)); // 24 hour TTL
    } catch (error) {
      console.error('Error updating memory context:', error);
    }
  }

  async getSessionMemory(sessionId: string): Promise<any> {
    try {
      const pattern = `${this.contextPrefix}${sessionId}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length === 0) return null;

      const contexts = await Promise.all(
        keys.map(async (key) => {
          const data = await this.redis.get(key);
          return data ? JSON.parse(data) : null;
        })
      );

      return {
        sessionId,
        agents: contexts.map(ctx => ctx.agentId),
        conversationHistory: contexts.flatMap(ctx => ctx.conversationHistory),
        keyInsights: contexts.flatMap(ctx => ctx.keyInsights),
        userPreferences: contexts.reduce((acc, ctx) => ({ ...acc, ...ctx.preferences }), {}),
        designFeedback: contexts.reduce((acc, ctx) => ({ ...acc, ...ctx.designContext }), {}),
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting session memory:', error);
      return null;
    }
  }

  async addKeyInsight(sessionId: string, agentId: string, insight: string): Promise<void> {
    try {
      const context = await this.getContext(sessionId, agentId);
      if (!context) return;

      const keyInsights = [...(context.keyInsights || []), insight].slice(-20); // Keep last 20 insights
      
      await this.updateContext(sessionId, agentId, {
        context: { keyInsights }
      });
    } catch (error) {
      console.error('Error adding key insight:', error);
    }
  }

  async updatePreferences(sessionId: string, agentId: string, preferences: Record<string, any>): Promise<void> {
    try {
      const context = await this.getContext(sessionId, agentId);
      if (!context) return;

      const updatedPreferences = {
        ...context.preferences,
        ...preferences
      };

      await this.updateContext(sessionId, agentId, {
        context: { preferences: updatedPreferences }
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }

  async addDesignFeedback(sessionId: string, agentId: string, feedback: {
    category: string;
    rating: number;
    comment: string;
    timestamp: Date;
  }): Promise<void> {
    try {
      const context = await this.getContext(sessionId, agentId);
      if (!context) return;

      const designFeedback = {
        ...context.designContext,
        [feedback.category]: {
          rating: feedback.rating,
          comment: feedback.comment,
          timestamp: feedback.timestamp.toISOString()
        }
      };

      await this.updateContext(sessionId, agentId, {
        context: { designContext: designFeedback }
      });
    } catch (error) {
      console.error('Error adding design feedback:', error);
    }
  }

  async searchMemory(sessionId: string, query: string): Promise<any[]> {
    try {
      const pattern = `${this.contextPrefix}${sessionId}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length === 0) return [];

      const results = [];
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const context = JSON.parse(data);
          const searchText = [
            ...context.conversationHistory,
            ...context.keyInsights,
            JSON.stringify(context.userContext),
            JSON.stringify(context.designContext)
          ].join(' ').toLowerCase();

          if (searchText.includes(query.toLowerCase())) {
            results.push({
              agentId: context.agentId,
              context,
              relevance: this.calculateRelevance(query, searchText)
            });
          }
        }
      }

      return results.sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      console.error('Error searching memory:', error);
      return [];
    }
  }

  private calculateRelevance(query: string, text: string): number {
    const queryWords = query.toLowerCase().split(' ');
    const textWords = text.split(' ');
    
    let matches = 0;
    queryWords.forEach(word => {
      if (textWords.includes(word)) matches++;
    });

    return matches / queryWords.length;
  }

  async clearSessionMemory(sessionId: string): Promise<void> {
    try {
      const pattern = `${this.contextPrefix}${sessionId}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Error clearing session memory:', error);
    }
  }

  async getMemoryStats(sessionId: string): Promise<any> {
    try {
      const pattern = `${this.contextPrefix}${sessionId}:*`;
      const keys = await this.redis.keys(pattern);
      
      const stats = {
        totalSessions: 1,
        totalAgents: keys.length,
        totalMessages: 0,
        totalInsights: 0,
        memoryUsage: 0
      };

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const context = JSON.parse(data);
          stats.totalMessages += context.conversationHistory?.length || 0;
          stats.totalInsights += context.keyInsights?.length || 0;
          stats.memoryUsage += Buffer.byteLength(data, 'utf8');
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting memory stats:', error);
      return null;
    }
  }

  async close(): Promise<void> {
    await this.redis.quit();
  }
}



