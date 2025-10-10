import { Pool } from 'pg';
import { CompleteAgentProfile } from '../services/PersonaSynthesizer';

export class AgentDatabase {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/agent_chat',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async initializeTables(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // Create ai_agents table
      await client.query(`
        CREATE TABLE IF NOT EXISTS ai_agents (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          age INTEGER NOT NULL,
          occupation VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          source_file VARCHAR(255) NOT NULL,
          transcript_text TEXT NOT NULL,
          speech_patterns JSONB NOT NULL,
          vocabulary_analysis JSONB NOT NULL,
          emotional_markers JSONB NOT NULL,
          cognitive_patterns JSONB NOT NULL,
          tech_behavior JSONB NOT NULL,
          real_quotes TEXT[] NOT NULL,
          personality_data JSONB NOT NULL,
          master_system_prompt TEXT NOT NULL,
          avatar_url VARCHAR(500) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          is_active BOOLEAN DEFAULT true
        )
      `);

      // Create chat_sessions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS chat_sessions (
          id VARCHAR(255) PRIMARY KEY,
          agent_id VARCHAR(255) REFERENCES ai_agents(id),
          user_id VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create chat_messages table
      await client.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id VARCHAR(255) PRIMARY KEY,
          session_id VARCHAR(255) REFERENCES chat_sessions(id),
          role VARCHAR(10) CHECK (role IN ('user', 'assistant')) NOT NULL,
          content TEXT NOT NULL,
          emotional_state VARCHAR(50),
          response_delay_ms INTEGER,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create uploads table for tracking processing
      await client.query(`
        CREATE TABLE IF NOT EXISTS uploads (
          id VARCHAR(255) PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          participant_count INTEGER NOT NULL,
          processed_count INTEGER DEFAULT 0,
          status VARCHAR(50) DEFAULT 'processing',
          created_at TIMESTAMP DEFAULT NOW(),
          completed_at TIMESTAMP
        )
      `);

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async saveAgent(agent: CompleteAgentProfile): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        INSERT INTO ai_agents (
          id, name, age, occupation, category, source_file, transcript_text,
          speech_patterns, vocabulary_analysis, emotional_markers, cognitive_patterns,
          tech_behavior, real_quotes, personality_data, master_system_prompt,
          avatar_url, created_at, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          age = EXCLUDED.age,
          occupation = EXCLUDED.occupation,
          category = EXCLUDED.category,
          source_file = EXCLUDED.source_file,
          transcript_text = EXCLUDED.transcript_text,
          speech_patterns = EXCLUDED.speech_patterns,
          vocabulary_analysis = EXCLUDED.vocabulary_analysis,
          emotional_markers = EXCLUDED.emotional_markers,
          cognitive_patterns = EXCLUDED.cognitive_patterns,
          tech_behavior = EXCLUDED.tech_behavior,
          real_quotes = EXCLUDED.real_quotes,
          personality_data = EXCLUDED.personality_data,
          master_system_prompt = EXCLUDED.master_system_prompt,
          avatar_url = EXCLUDED.avatar_url,
          is_active = EXCLUDED.is_active
      `, [
        agent.id, agent.name, agent.age, agent.occupation, agent.category,
        agent.source_file, agent.transcript_text, JSON.stringify(agent.speech_patterns),
        JSON.stringify(agent.vocabulary_analysis), JSON.stringify(agent.emotional_markers),
        JSON.stringify(agent.cognitive_patterns), JSON.stringify(agent.tech_behavior),
        agent.real_quotes, JSON.stringify(agent.personality_data),
        agent.master_system_prompt, agent.avatar_url, agent.created_at, agent.is_active
      ]);
      
      console.log(`Agent ${agent.name} saved to database`);
    } catch (error) {
      console.error('Error saving agent:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getAgent(agentId: string): Promise<CompleteAgentProfile | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM ai_agents WHERE id = $1 AND is_active = true
      `, [agentId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        age: row.age,
        occupation: row.occupation,
        category: row.category,
        source_file: row.source_file,
        transcript_text: row.transcript_text,
        speech_patterns: row.speech_patterns,
        vocabulary_analysis: row.vocabulary_analysis,
        emotional_markers: row.emotional_markers,
        cognitive_patterns: row.cognitive_patterns,
        tech_behavior: row.tech_behavior,
        real_quotes: row.real_quotes,
        personality_data: row.personality_data,
        master_system_prompt: row.master_system_prompt,
        avatar_url: row.avatar_url,
        created_at: row.created_at,
        is_active: row.is_active
      };
    } catch (error) {
      console.error('Error getting agent:', error);
      return null;
    } finally {
      client.release();
    }
  }

  async getAllAgents(): Promise<CompleteAgentProfile[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM ai_agents WHERE is_active = true ORDER BY created_at DESC
      `);
      
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        age: row.age,
        occupation: row.occupation,
        category: row.category,
        source_file: row.source_file,
        transcript_text: row.transcript_text,
        speech_patterns: row.speech_patterns,
        vocabulary_analysis: row.vocabulary_analysis,
        emotional_markers: row.emotional_markers,
        cognitive_patterns: row.cognitive_patterns,
        tech_behavior: row.tech_behavior,
        real_quotes: row.real_quotes,
        personality_data: row.personality_data,
        master_system_prompt: row.master_system_prompt,
        avatar_url: row.avatar_url,
        created_at: row.created_at,
        is_active: row.is_active
      }));
    } catch (error) {
      console.error('Error getting all agents:', error);
      return [];
    } finally {
      client.release();
    }
  }

  async createChatSession(agentId: string, userId: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const client = await this.pool.connect();
    
    try {
      await client.query(`
        INSERT INTO chat_sessions (id, agent_id, user_id) VALUES ($1, $2, $3)
      `, [sessionId, agentId, userId]);
      
      return sessionId;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async saveChatMessage(
    sessionId: string, 
    role: 'user' | 'assistant', 
    content: string, 
    emotionalState?: string, 
    responseDelay?: number
  ): Promise<void> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const client = await this.pool.connect();
    
    try {
      await client.query(`
        INSERT INTO chat_messages (id, session_id, role, content, emotional_state, response_delay_ms)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [messageId, sessionId, role, content, emotionalState, responseDelay]);
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getChatHistory(sessionId: string): Promise<any[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT role, content, emotional_state, response_delay_ms, created_at
        FROM chat_messages 
        WHERE session_id = $1 
        ORDER BY created_at ASC
      `, [sessionId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    } finally {
      client.release();
    }
  }

  async createUpload(uploadId: string, filename: string, participantCount: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        INSERT INTO uploads (id, filename, participant_count) VALUES ($1, $2, $3)
      `, [uploadId, filename, participantCount]);
    } catch (error) {
      console.error('Error creating upload record:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateUploadProgress(uploadId: string, processedCount: number, status: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        UPDATE uploads 
        SET processed_count = $1, status = $2, completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END
        WHERE id = $3
      `, [processedCount, status, uploadId]);
    } catch (error) {
      console.error('Error updating upload progress:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async getUploadStatus(uploadId: string): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM uploads WHERE id = $1
      `, [uploadId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting upload status:', error);
      return null;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}



