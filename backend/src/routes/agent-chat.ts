import express from 'express';
import { AgentChatService } from '../services/AgentChatService';
import { MemoryService } from '../services/MemoryService';
import { EthicalGuardrailsService } from '../services/EthicalGuardrailsService';

const router = express.Router();
const chatService = new AgentChatService();
const memoryService = new MemoryService();
const ethicalService = new EthicalGuardrailsService();

// Initialize chat session
router.post('/session', async (req, res) => {
  try {
    const { agentIds, context } = req.body;
    
    if (!agentIds || agentIds.length !== 2) {
      return res.status(400).json({ error: 'Exactly 2 agents required' });
    }

    const session = await chatService.createSession(agentIds, context);
    res.json(session);
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Send message to agent
router.post('/message', async (req, res) => {
  try {
    const { sessionId, agentId, input, context } = req.body;
    
    if (!sessionId || !agentId || !input) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get session and agent info
    const session = await chatService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const agent = await chatService.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Ethical guardrails check
    const ethicalCheck = await ethicalService.checkContent(input.text || '', agent);
    if (!ethicalCheck.safe) {
      return res.status(400).json({ 
        error: 'Content violates ethical guidelines',
        details: ethicalCheck.issues
      });
    }

    // Generate response with memory context
    const memoryContext = await memoryService.getContext(sessionId, agentId);
    const response = await chatService.generateResponse({
      agent,
      input,
      session,
      memoryContext,
      conversationHistory: context.conversationHistory || []
    });

    // Store message and update memory
    const message = await chatService.storeMessage(sessionId, agentId, input, response);
    await memoryService.updateContext(sessionId, agentId, {
      message: input.text || 'Image uploaded',
      response: response.message,
      context: input.context
    });

    res.json({ response, message });
  } catch (error) {
    console.error('Message processing error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get session messages
router.get('/session/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await chatService.getSessionMessages(sessionId);
    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Get session memory
router.get('/session/:sessionId/memory', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const memory = await memoryService.getSessionMemory(sessionId);
    res.json({ memory });
  } catch (error) {
    console.error('Get memory error:', error);
    res.status(500).json({ error: 'Failed to get memory' });
  }
});

// Update session context
router.put('/session/:sessionId/context', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { context } = req.body;
    
    await chatService.updateSessionContext(sessionId, context);
    res.json({ success: true });
  } catch (error) {
    console.error('Update context error:', error);
    res.status(500).json({ error: 'Failed to update context' });
  }
});

// End session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await chatService.endSession(sessionId);
    await memoryService.clearSessionMemory(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Get agent insights
router.get('/session/:sessionId/insights', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const insights = await chatService.generateInsights(sessionId);
    res.json({ insights });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

export default router;



