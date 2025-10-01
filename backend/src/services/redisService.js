const Redis = require('ioredis');

class RedisService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.redis = new Redis({
        host: 'localhost',
        port: 6379,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
      });

      this.redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.redis.on('error', (err) => {
        console.error('❌ Redis connection error:', err);
        this.isConnected = false;
      });

      return this.redis;
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      this.isConnected = false;
      return null;
    }
  }

  async setPersonaSession(sessionId, personas) {
    if (!this.isConnected) return false;
    
    try {
      const key = `persona_session:${sessionId}`;
      const data = {
        personas: personas,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };
      
      await this.redis.setex(key, 86400, JSON.stringify(data)); // 24 hours TTL
      return true;
    } catch (error) {
      console.error('❌ Error setting persona session:', error);
      return false;
    }
  }

  async getPersonaSession(sessionId) {
    if (!this.isConnected) return null;
    
    try {
      const key = `persona_session:${sessionId}`;
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Error getting persona session:', error);
      return null;
    }
  }

  async cachePersonaGeneration(config, result) {
    if (!this.isConnected) return false;
    
    try {
      const configHash = this.generateConfigHash(config);
      const key = `persona_cache:${configHash}`;
      const data = {
        config: config,
        result: result,
        createdAt: new Date().toISOString()
      };
      
      await this.redis.setex(key, 3600, JSON.stringify(data)); // 1 hour TTL
      return true;
    } catch (error) {
      console.error('❌ Error caching persona generation:', error);
      return false;
    }
  }

  async getCachedPersonaGeneration(config) {
    if (!this.isConnected) return null;
    
    try {
      const configHash = this.generateConfigHash(config);
      const key = `persona_cache:${configHash}`;
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Error getting cached persona generation:', error);
      return null;
    }
  }

  generateConfigHash(config) {
    const crypto = require('crypto');
    const configString = JSON.stringify(config, Object.keys(config).sort());
    return crypto.createHash('md5').update(configString).digest('hex');
  }

  async setUserInteraction(userId, interaction) {
    if (!this.isConnected) return false;
    
    try {
      const key = `user_interaction:${userId}`;
      const data = {
        interaction: interaction,
        timestamp: new Date().toISOString()
      };
      
      await this.redis.lpush(key, JSON.stringify(data));
      await this.redis.ltrim(key, 0, 99); // Keep last 100 interactions
      await this.redis.expire(key, 7 * 24 * 60 * 60); // 7 days TTL
      return true;
    } catch (error) {
      console.error('❌ Error setting user interaction:', error);
      return false;
    }
  }

  async getUserInteractions(userId) {
    if (!this.isConnected) return [];
    
    try {
      const key = `user_interaction:${userId}`;
      const interactions = await this.redis.lrange(key, 0, -1);
      return interactions.map(interaction => JSON.parse(interaction));
    } catch (error) {
      console.error('❌ Error getting user interactions:', error);
      return [];
    }
  }

  async setPersonaAnalytics(personaId, analytics) {
    if (!this.isConnected) return false;
    
    try {
      const key = `persona_analytics:${personaId}`;
      const data = {
        analytics: analytics,
        updatedAt: new Date().toISOString()
      };
      
      await this.redis.setex(key, 3600, JSON.stringify(data)); // 1 hour TTL
      return true;
    } catch (error) {
      console.error('❌ Error setting persona analytics:', error);
      return false;
    }
  }

  async getPersonaAnalytics(personaId) {
    if (!this.isConnected) return null;
    
    try {
      const key = `persona_analytics:${personaId}`;
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Error getting persona analytics:', error);
      return null;
    }
  }

  async disconnect() {
    if (this.redis) {
      await this.redis.disconnect();
      this.isConnected = false;
    }
  }
}

module.exports = RedisService;
