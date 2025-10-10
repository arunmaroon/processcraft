import express from 'express';
import { PersonaGenerationService, PersonaProfile } from '../services/PersonaGenerationService';
import { AIAgentService, AgentResponse, ChatMessage } from '../services/AIAgentService';

const router = express.Router();
const personaService = new PersonaGenerationService();
const agentService = new AIAgentService();

// Generate personas from transcripts
router.post('/personas/generate', async (req, res) => {
  try {
    const { transcripts, filename } = req.body;
    
    if (!transcripts || !Array.isArray(transcripts)) {
      return res.status(400).json({ error: 'Transcripts array is required' });
    }

    const personas = await personaService.generateMultiplePersonas(transcripts);
    
    if (filename) {
      await personaService.savePersonasToFile(personas, filename);
    }

    res.json({
      success: true,
      personas,
      count: personas.length,
    });
  } catch (error) {
    console.error('Error generating personas:', error);
    res.status(500).json({ error: 'Failed to generate personas' });
  }
});

// Load personas from file
router.get('/personas/load/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const personas = await personaService.loadPersonasFromFile(filename);
    
    res.json({
      success: true,
      personas,
      count: personas.length,
    });
  } catch (error) {
    console.error('Error loading personas:', error);
    res.status(500).json({ error: 'Failed to load personas' });
  }
});

// Create agent from persona
router.post('/agents/create', async (req, res) => {
  try {
    const { persona } = req.body;
    
    if (!persona) {
      return res.status(400).json({ error: 'Persona is required' });
    }

    const agentName = await agentService.createPersonaAgent(persona);
    
    res.json({
      success: true,
      agentName,
      message: `Agent ${agentName} created successfully`,
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Get available agents
router.get('/agents', (req, res) => {
  try {
    const agents = agentService.getAvailableAgents();
    
    res.json({
      success: true,
      agents,
      count: agents.length,
    });
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// Get agent response
router.post('/agents/:agentName/chat', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { message, threadId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await agentService.getAgentResponse(
      agentName,
      message,
      threadId || 'default'
    );
    
    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error getting agent response:', error);
    res.status(500).json({ error: 'Failed to get agent response' });
  }
});

// Simulate dual agent chat
router.post('/agents/dual-chat', async (req, res) => {
  try {
    const { agent1Name, agent2Name, message, threadId } = req.body;
    
    if (!agent1Name || !agent2Name || !message) {
      return res.status(400).json({ 
        error: 'agent1Name, agent2Name, and message are required' 
      });
    }

    const messages = await agentService.simulateDualAgentChat(
      agent1Name,
      agent2Name,
      message,
      threadId || 'dual_chat'
    );
    
    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error in dual agent chat:', error);
    res.status(500).json({ error: 'Failed to simulate dual agent chat' });
  }
});

// Get persona details
router.get('/agents/:agentName/persona', (req, res) => {
  try {
    const { agentName } = req.params;
    const persona = agentService.getPersona(agentName);
    
    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }
    
    res.json({
      success: true,
      persona,
    });
  } catch (error) {
    console.error('Error getting persona:', error);
    res.status(500).json({ error: 'Failed to get persona' });
  }
});

// Clear agent memory
router.delete('/agents/:agentName/memory', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { threadId } = req.body;
    
    await agentService.clearAgentMemory(agentName, threadId || 'default');
    
    res.json({
      success: true,
      message: `Memory cleared for agent ${agentName}`,
    });
  } catch (error) {
    console.error('Error clearing agent memory:', error);
    res.status(500).json({ error: 'Failed to clear agent memory' });
  }
});

// Test agent with sample transcript
router.post('/agents/test', async (req, res) => {
  try {
    const { transcript, testQuestions } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Generate persona from transcript
    const persona = await personaService.generatePersonaFromTranscript(transcript);
    
    // Create agent
    const agentName = await agentService.createPersonaAgent(persona);
    
    // Test with sample questions if provided
    const testResults = [];
    if (testQuestions && Array.isArray(testQuestions)) {
      for (const question of testQuestions) {
        try {
          const response = await agentService.getAgentResponse(
            agentName,
            question,
            'test'
          );
          testResults.push({
            question,
            response: response.content,
            confidence: response.confidence,
          });
        } catch (error) {
          testResults.push({
            question,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
    
    res.json({
      success: true,
      persona,
      agentName,
      testResults,
    });
  } catch (error) {
    console.error('Error testing agent:', error);
    res.status(500).json({ error: 'Failed to test agent' });
  }
});

export default router;




