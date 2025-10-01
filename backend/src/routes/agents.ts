import express from 'express';
import Agent from '../models/Agent';
import Conversation from '../models/Conversation';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { agentMemoryManager } from '../config/redis';
import GrokService from '../services/grokService';

const router = express.Router();

// Initialize Grok service
const grokService = new GrokService({
  apiKey: process.env.GROK_API_KEY || 'dummy-key',
  baseURL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1',
  model: process.env.GROK_MODEL || 'grok-3'
});

// Generate agents based on criteria
router.post('/generate', authenticateToken, requireRole(['super_admin', 'admin']), async (req: AuthRequest, res) => {
  try {
    const { criteria, researchDataIds } = req.body;

    if (!criteria) {
      return res.status(400).json({
        error: 'Generation criteria are required',
        code: 'MISSING_CRITERIA'
      });
    }

    // Get research data if IDs provided
    let researchData: any[] = [];
    if (researchDataIds && researchDataIds.length > 0) {
      // In a real implementation, fetch from ResearchData model
      researchData = [];
    }

    // Generate agents using Grok
    const generatedAgents = await grokService.generateAgents(criteria, researchData);

    // Save agents to database
    const savedAgents = [];
    for (const agentData of generatedAgents) {
      const agent = await Agent.create({
        name: agentData.name,
        demographics: agentData.demographics,
        personality: agentData.personality,
        communication_style: agentData.communication_style,
        psychological_profile: agentData.psychological_profile,
        financial_profile: agentData.financial_profile,
        behavioral_patterns: agentData.behavioral_patterns,
        typical_phrases: agentData.typical_phrases,
        created_from: researchDataIds?.join(',') || 'manual',
        generation_method: 'grok_ai',
        tags: criteria.tags || [],
        consistency_score: 0.8,
        realism_score: 0.8,
        engagement_score: 0.7
      });
      savedAgents.push(agent);
    }

    res.json({
      success: true,
      agents: savedAgents,
      count: savedAgents.length
    });
  } catch (error: any) {
    console.error('Error generating agents:', error);
    res.status(500).json({
      error: 'Failed to generate agents',
      code: 'GENERATION_ERROR',
      details: error.message
    });
  }
});

// Get agents with filters
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      age_min, 
      age_max, 
      income_range, 
      occupation, 
      tags,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.name = {
        [require('sequelize').Op.iLike]: `%${search}%`
      };
    }
    
    if (age_min || age_max) {
      whereClause.age = {};
      if (age_min) whereClause.age[require('sequelize').Op.gte] = Number(age_min);
      if (age_max) whereClause.age[require('sequelize').Op.lte] = Number(age_max);
    }
    
    if (income_range) {
      whereClause.income_range = income_range;
    }
    
    if (occupation) {
      whereClause.occupation = {
        [require('sequelize').Op.iLike]: `%${occupation}%`
      };
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      whereClause.tags = {
        [require('sequelize').Op.overlap]: tagArray
      };
    }

    const { count, rows: agents } = await Agent.findAndCountAll({
      where: whereClause,
      limit: Number(limit),
      offset,
      order: [[sort_by as string, sort_order as string]],
      attributes: { exclude: ['created_at', 'updated_at'] }
    });

    res.json({
      success: true,
      agents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    res.status(500).json({
      error: 'Failed to fetch agents',
      code: 'FETCH_ERROR',
      details: error.message
    });
  }
});

// Get specific agent
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const agent = await Agent.findByPk(id);
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        code: 'AGENT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error: any) {
    console.error('Error fetching agent:', error);
    res.status(500).json({
      error: 'Failed to fetch agent',
      code: 'FETCH_ERROR',
      details: error.message
    });
  }
});

// Update agent
router.put('/:id', authenticateToken, requireRole(['super_admin', 'admin']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        code: 'AGENT_NOT_FOUND'
      });
    }

    await agent.update(updateData);

    res.json({
      success: true,
      agent
    });
  } catch (error: any) {
    console.error('Error updating agent:', error);
    res.status(500).json({
      error: 'Failed to update agent',
      code: 'UPDATE_ERROR',
      details: error.message
    });
  }
});

// Delete agent
router.delete('/:id', authenticateToken, requireRole(['super_admin', 'admin']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        code: 'AGENT_NOT_FOUND'
      });
    }

    // Delete related conversations
    await Conversation.destroy({ where: { agent_id: id } });

    // Clear agent memory
    const sessions = await agentMemoryManager.getAgentSessions(id);
    for (const sessionId of sessions) {
      await agentMemoryManager.clearAgentMemory(id, sessionId);
    }

    await agent.destroy();

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    res.status(500).json({
      error: 'Failed to delete agent',
      code: 'DELETE_ERROR',
      details: error.message
    });
  }
});

// Chat with agent
router.post('/:id/chat', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { message, sessionId = `session_${Date.now()}` } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        code: 'MESSAGE_REQUIRED'
      });
    }

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found',
        code: 'AGENT_NOT_FOUND'
      });
    }

    const startTime = Date.now();
    const response = await grokService.generateAgentResponse(agent, message, sessionId);
    const responseTime = Date.now() - startTime;

    // Save conversation to database
    await Conversation.create({
      agent_id: id,
      session_id: sessionId,
      user_message: message,
      agent_response: response,
      response_time_ms: responseTime,
      quality_score: 0.8 // Default quality score
    });

    res.json({
      success: true,
      response,
      sessionId,
      responseTime,
      agent: {
        id: agent.id,
        name: agent.name,
        demographics: agent.demographics
      }
    });
  } catch (error: any) {
    console.error('Error chatting with agent:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      code: 'CHAT_ERROR',
      details: error.message
    });
  }
});

// Get agent memory
router.get('/:id/memory', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID is required',
        code: 'SESSION_ID_REQUIRED'
      });
    }

    const memory = await agentMemoryManager.getAgentMemory(id, sessionId as string);
    
    res.json({
      success: true,
      memory
    });
  } catch (error: any) {
    console.error('Error fetching agent memory:', error);
    res.status(500).json({
      error: 'Failed to fetch agent memory',
      code: 'MEMORY_ERROR',
      details: error.message
    });
  }
});

// Reset agent state
router.post('/:id/reset', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.body;

    if (sessionId) {
      // Reset specific session
      await agentMemoryManager.clearAgentMemory(id, sessionId);
    } else {
      // Reset all sessions for this agent
      const sessions = await agentMemoryManager.getAgentSessions(id);
      for (const session of sessions) {
        await agentMemoryManager.clearAgentMemory(id, session);
      }
    }

    res.json({
      success: true,
      message: 'Agent state reset successfully'
    });
  } catch (error: any) {
    console.error('Error resetting agent state:', error);
    res.status(500).json({
      error: 'Failed to reset agent state',
      code: 'RESET_ERROR',
      details: error.message
    });
  }
});

// Get agent analytics
router.get('/:id/analytics', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const conversations = await Conversation.findAll({
      where: {
        agent_id: id,
        created_at: {
          [require('sequelize').Op.gte]: startDate
        }
      },
      attributes: [
        'response_time_ms',
        'quality_score',
        'created_at'
      ]
    });

    const analytics = {
      total_conversations: conversations.length,
      average_response_time: conversations.length > 0 
        ? conversations.reduce((sum: number, conv: any) => sum + (conv.response_time_ms || 0), 0) / conversations.length
        : 0,
      average_quality_score: conversations.length > 0
        ? conversations.reduce((sum: number, conv: any) => sum + (conv.quality_score || 0), 0) / conversations.length
        : 0,
      conversations_by_day: conversations.reduce((acc: any, conv: any) => {
        const date = conv.created_at.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error: any) {
    console.error('Error fetching agent analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch agent analytics',
      code: 'ANALYTICS_ERROR',
      details: error.message
    });
  }
});

export default router;
