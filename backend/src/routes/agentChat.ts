import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AgentDatabase } from '../models/AgentDatabase';
import { RealisticChatEngine } from '../services/RealisticChatEngine';
import Redis from 'ioredis';

const router = express.Router();
const agentDatabase = new AgentDatabase();

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// POST /api/agent-chat/start
router.post('/start', async (req, res) => {
  try {
    const { agentId, userId } = req.body;
    
    if (!agentId || !userId) {
      return res.status(400).json({ error: 'agentId and userId are required' });
    }
    
    // Get agent from database
    const agent = await agentDatabase.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Create chat session
    const sessionId = await agentDatabase.createChatSession(agentId, userId);
    
    // Initialize Redis session state
    const initialState = {
      emotional_state: 'neutral',
      topics_discussed: [],
      message_count: 0,
      last_frustration_trigger: null,
      agent_mentioned_facts: []
    };
    
    await redis.setex(`chat:${sessionId}:state`, 3600, JSON.stringify(initialState));
    
    // Generate initial greeting
    const chatEngine = new RealisticChatEngine(agent, redis);
    const greeting = generateInitialGreeting(agent);
    
    // Save initial greeting message
    await agentDatabase.saveChatMessage(sessionId, 'assistant', greeting, 'friendly', 1000);
    
    res.json({
      success: true,
      sessionId,
      agent: {
        id: agent.id,
        name: agent.name,
        age: agent.age,
        occupation: agent.occupation,
        category: agent.category,
        avatar_url: agent.avatar_url,
        tech_comfort: agent.tech_behavior.actual_tech_comfort,
        personality_traits: Object.keys(agent.personality_data).slice(0, 3)
      },
      firstMessage: greeting
    });
    
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

// POST /api/agent-chat/message
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }
    
    // Get session info
    const sessionInfo = await getSessionInfo(sessionId);
    if (!sessionInfo) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Get agent
    const agent = await agentDatabase.getAgent(sessionInfo.agent_id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Save user message
    await agentDatabase.saveChatMessage(sessionId, 'user', message);
    
    // Generate response using chat engine
    const chatEngine = new RealisticChatEngine(agent, redis);
    const response = await chatEngine.generateResponse(message, sessionId);
    
    res.json({
      success: true,
      response: response.response,
      delay: response.delay,
      emotion: response.emotion,
      confidence: response.confidence,
      timestamp: response.timestamp
    });
    
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// GET /api/agent-chat/history/:sessionId
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Get session info
    const sessionInfo = await getSessionInfo(sessionId);
    if (!sessionInfo) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Get agent info
    const agent = await agentDatabase.getAgent(sessionInfo.agent_id);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Get chat history
    const messages = await agentDatabase.getChatHistory(sessionId);
    
    res.json({
      success: true,
      sessionId,
      agent: {
        id: agent.id,
        name: agent.name,
        age: agent.age,
        occupation: agent.occupation,
        category: agent.category,
        avatar_url: agent.avatar_url,
        tech_comfort: agent.tech_behavior.actual_tech_comfort,
        personality_traits: Object.keys(agent.personality_data).slice(0, 3)
      },
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        emotion: msg.emotional_state,
        delay: msg.response_delay_ms,
        timestamp: msg.created_at
      }))
    });
    
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// GET /api/agent-chat/agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await agentDatabase.getAllAgents();
    
    const agentList = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      age: agent.age,
      occupation: agent.occupation,
      category: agent.category,
      avatar_url: agent.avatar_url,
      created_at: agent.created_at,
      real_quotes: agent.real_quotes.slice(0, 3),
      tech_comfort: agent.tech_behavior.actual_tech_comfort,
      personality_traits: Object.keys(agent.personality_data).slice(0, 3)
    }));
    
    res.json({
      success: true,
      agents: agentList,
      count: agentList.length
    });
    
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// Helper function to get session info
async function getSessionInfo(sessionId: string): Promise<any> {
  try {
    const result = await agentDatabase.pool.query(`
      SELECT * FROM chat_sessions WHERE id = $1
    `, [sessionId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting session info:', error);
    return null;
  }
}

// Helper function to generate initial greeting
function generateInitialGreeting(agent: any): string {
  const greetings = [
    `Hi! I'm ${agent.name}. Nice to meet you!`,
    `Hello there! I'm ${agent.name}, a ${agent.age}-year-old ${agent.occupation}.`,
    `Hey! I'm ${agent.name}. What would you like to talk about?`,
    `Hi! I'm ${agent.name}. I'm here to help with whatever you need.`,
    `Hello! I'm ${agent.name}. How can I assist you today?`
  ];
  
  // Use agent's personality to select appropriate greeting
  const personality = agent.personality_data;
  if (personality.communication_blueprint?.response_speed === 'slow') {
    return `Hello... I'm ${agent.name}. Nice to meet you.`;
  } else if (personality.communication_blueprint?.response_speed === 'immediate') {
    return `Hey! I'm ${agent.name}! What's up?`;
  }
  
  return greetings[Math.floor(Math.random() * greetings.length)];
}

export default router;



