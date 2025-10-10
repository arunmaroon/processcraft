import Redis from 'ioredis';

// Redis configuration for agent memory and session management
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

// Agent memory management
export class AgentMemoryManager {
  private redis: Redis;

  constructor(redisInstance: Redis) {
    this.redis = redisInstance;
  }

  // Store agent memory for a session
  async setAgentMemory(agentId: string, sessionId: string, memory: any): Promise<void> {
    const key = `agent_memory:${agentId}:${sessionId}`;
    await this.redis.setex(key, 3600 * 24, JSON.stringify(memory)); // 24 hour expiry
  }

  // Get agent memory for a session
  async getAgentMemory(agentId: string, sessionId: string): Promise<any> {
    const key = `agent_memory:${agentId}:${sessionId}`;
    const memory = await this.redis.get(key);
    return memory ? JSON.parse(memory) : null;
  }

  // Update conversation history
  async addConversation(agentId: string, sessionId: string, message: any): Promise<void> {
    const key = `agent_memory:${agentId}:${sessionId}`;
    const memory = await this.getAgentMemory(agentId, sessionId) || {
      conversation_history: [],
      emotional_state: 'neutral',
      context_awareness: {},
      relationship_with_interviewer: 'professional',
      energy_level: 0.7,
      topics_covered: [],
      decisions_made: [],
      evolving_opinions: {},
    };

    memory.conversation_history.push(message);
    memory.last_updated = new Date().toISOString();
    
    await this.setAgentMemory(agentId, sessionId, memory);
  }

  // Update emotional state
  async updateEmotionalState(agentId: string, sessionId: string, state: string): Promise<void> {
    const key = `agent_memory:${agentId}:${sessionId}`;
    const memory = await this.getAgentMemory(agentId, sessionId) || {};
    memory.emotional_state = state;
    memory.last_updated = new Date().toISOString();
    
    await this.setAgentMemory(agentId, sessionId, memory);
  }

  // Update energy level
  async updateEnergyLevel(agentId: string, sessionId: string, level: number): Promise<void> {
    const key = `agent_memory:${agentId}:${sessionId}`;
    const memory = await this.getAgentMemory(agentId, sessionId) || {};
    memory.energy_level = Math.max(0, Math.min(1, level));
    memory.last_updated = new Date().toISOString();
    
    await this.setAgentMemory(agentId, sessionId, memory);
  }

  // Add topic to covered topics
  async addTopic(agentId: string, sessionId: string, topic: string): Promise<void> {
    const key = `agent_memory:${agentId}:${sessionId}`;
    const memory = await this.getAgentMemory(agentId, sessionId) || { topics_covered: [] };
    
    if (!memory.topics_covered) memory.topics_covered = [];
    if (!memory.topics_covered.includes(topic)) {
      memory.topics_covered.push(topic);
    }
    memory.last_updated = new Date().toISOString();
    
    await this.setAgentMemory(agentId, sessionId, memory);
  }

  // Clear agent memory for a session
  async clearAgentMemory(agentId: string, sessionId: string): Promise<void> {
    const key = `agent_memory:${agentId}:${sessionId}`;
    await this.redis.del(key);
  }

  // Get all sessions for an agent
  async getAgentSessions(agentId: string): Promise<string[]> {
    const pattern = `agent_memory:${agentId}:*`;
    const keys = await this.redis.keys(pattern);
    return keys.map(key => key.split(':')[2]);
  }

  // Cleanup expired memories
  async cleanupExpiredMemories(): Promise<void> {
    // This would typically be handled by Redis TTL, but we can add manual cleanup if needed
    const pattern = 'agent_memory:*';
    const keys = await this.redis.keys(pattern);
    
    for (const key of keys) {
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) {
        // Key has no expiry, set one
        await this.redis.expire(key, 3600 * 24);
      }
    }
  }
}

export const agentMemoryManager = new AgentMemoryManager(redis);
export { redis };
export default redis;















