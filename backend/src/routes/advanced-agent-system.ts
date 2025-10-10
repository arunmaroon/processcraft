import express from 'express';
import multer from 'multer';
import { DataPreprocessingService } from '../services/DataPreprocessingService';
import { PersonaExtractionService } from '../services/PersonaExtractionService';
import { MemoryManagementService } from '../services/MemoryManagementService';
import { AdvancedAIModelService } from '../services/AdvancedAIModelService';
import { AgentOrchestrationService } from '../services/AgentOrchestrationService';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Initialize services
const dataPreprocessingService = new DataPreprocessingService();
const personaExtractionService = new PersonaExtractionService();
const memoryService = new MemoryManagementService();
const aiService = new AdvancedAIModelService();
const orchestrationService = new AgentOrchestrationService();

// Initialize memory service
memoryService.initialize();

// Data Collection and Preprocessing Routes
router.post('/data/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { source, metadata } = req.body;
    const files = req.files as Express.Multer.File[];
    
    if (!source || !files || files.length === 0) {
      return res.status(400).json({ error: 'Source and files are required' });
    }

    // Process uploaded files
    const userData = files.map(file => ({
      id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: source as any,
      rawData: {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      },
      timestamp: new Date(),
      metadata: metadata ? JSON.parse(metadata) : {},
    }));

    // Preprocess data
    const processedData = await dataPreprocessingService.preprocessUserData(userData);
    
    // Cluster users
    const clusters = await dataPreprocessingService.clusterUsersByTraits(processedData);

    res.json({
      success: true,
      processedData: processedData.length,
      clusters: clusters.length,
      message: 'Data uploaded and processed successfully'
    });
  } catch (error) {
    console.error('Error uploading data:', error);
    res.status(500).json({ error: 'Failed to process uploaded data' });
  }
});

router.post('/data/process', async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Data array is required' });
    }

    const processedData = await dataPreprocessingService.preprocessUserData(data);
    const clusters = await dataPreprocessingService.clusterUsersByTraits(processedData);

    res.json({
      success: true,
      processedData,
      clusters,
    });
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: 'Failed to process data' });
  }
});

// Persona Extraction Routes
router.post('/personas/extract', async (req, res) => {
  try {
    const { processedDataIds } = req.body;
    
    if (!processedDataIds || !Array.isArray(processedDataIds)) {
      return res.status(400).json({ error: 'Processed data IDs are required' });
    }

    // Get processed data (simplified - in production, fetch from DB)
    const processedData = processedDataIds.map(id => ({
      id,
      text: 'Sample processed text data',
      sentiment: 'positive',
      topics: ['technology', 'business'],
      language: 'english',
    }));

    const personas = await personaExtractionService.extractPersonasFromData(processedData);

    res.json({
      success: true,
      personas,
      count: personas.length,
    });
  } catch (error) {
    console.error('Error extracting personas:', error);
    res.status(500).json({ error: 'Failed to extract personas' });
  }
});

router.get('/personas', async (req, res) => {
  try {
    const personas = await personaExtractionService.getAllPersonas();
    
    res.json({
      success: true,
      personas,
      count: personas.length,
    });
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({ error: 'Failed to fetch personas' });
  }
});

router.get('/personas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const persona = await personaExtractionService.getPersonaById(id);
    
    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    res.json({
      success: true,
      persona,
    });
  } catch (error) {
    console.error('Error fetching persona:', error);
    res.status(500).json({ error: 'Failed to fetch persona' });
  }
});

// Single Agent Interaction Routes
router.post('/agents/session/create', async (req, res) => {
  try {
    const { personaId, userId } = req.body;
    
    if (!personaId) {
      return res.status(400).json({ error: 'Persona ID is required' });
    }

    const sessionId = await orchestrationService.createAgentSession(personaId, userId);

    res.json({
      success: true,
      sessionId,
      message: 'Agent session created successfully'
    });
  } catch (error) {
    console.error('Error creating agent session:', error);
    res.status(500).json({ error: 'Failed to create agent session' });
  }
});

router.post('/agents/session/:sessionId/chat', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, options } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await orchestrationService.getAgentResponse(sessionId, message, options);

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error getting agent response:', error);
    res.status(500).json({ error: 'Failed to get agent response' });
  }
});

router.post('/agents/session/:sessionId/multimodal', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, imageData, options } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get persona ID from session
    const sessions = await orchestrationService.getActiveSessions();
    const session = sessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const response = await aiService.generateMultimodalResponse(
      session.personaId,
      message,
      imageData,
      sessionId,
      options
    );

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error getting multimodal response:', error);
    res.status(500).json({ error: 'Failed to get multimodal response' });
  }
});

router.delete('/agents/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    await orchestrationService.endSession(sessionId);

    res.json({
      success: true,
      message: 'Session ended successfully'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Multi-Agent Scenario Routes
router.post('/scenarios/create', async (req, res) => {
  try {
    const {
      name,
      description,
      agentIds,
      scenarioType,
      rules,
      context,
      objectives
    } = req.body;
    
    if (!name || !description || !agentIds || !scenarioType) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const scenarioId = await orchestrationService.createMultiAgentScenario(
      name,
      description,
      agentIds,
      scenarioType,
      rules || {
        turnOrder: 'sequential',
        maxTurns: 10,
        allowInterruption: false,
        requireModeration: false,
      },
      context || '',
      objectives || []
    );

    res.json({
      success: true,
      scenarioId,
      message: 'Multi-agent scenario created successfully'
    });
  } catch (error) {
    console.error('Error creating scenario:', error);
    res.status(500).json({ error: 'Failed to create scenario' });
  }
});

router.post('/scenarios/:scenarioId/run', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const { initialMessage, maxTurns } = req.body;
    
    if (!initialMessage) {
      return res.status(400).json({ error: 'Initial message is required' });
    }

    const response = await orchestrationService.runMultiAgentScenario(
      scenarioId,
      initialMessage,
      maxTurns || 10
    );

    res.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error running scenario:', error);
    res.status(500).json({ error: 'Failed to run scenario' });
  }
});

router.get('/scenarios', async (req, res) => {
  try {
    const scenarios = await orchestrationService.getActiveScenarios();
    
    res.json({
      success: true,
      scenarios,
      count: scenarios.length,
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
});

router.delete('/scenarios/:scenarioId', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    
    await orchestrationService.endScenario(scenarioId);

    res.json({
      success: true,
      message: 'Scenario ended successfully'
    });
  } catch (error) {
    console.error('Error ending scenario:', error);
    res.status(500).json({ error: 'Failed to end scenario' });
  }
});

// Memory Management Routes
router.get('/memory/:sessionId/context', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { personaId, message } = req.query;
    
    if (!personaId || !message) {
      return res.status(400).json({ error: 'Persona ID and message are required' });
    }

    const context = await memoryService.getRelevantContext(
      sessionId,
      personaId as string,
      message as string,
      2000
    );

    res.json({
      success: true,
      context,
    });
  } catch (error) {
    console.error('Error getting memory context:', error);
    res.status(500).json({ error: 'Failed to get memory context' });
  }
});

router.post('/memory/:sessionId/consolidate', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { personaId } = req.body;
    
    if (!personaId) {
      return res.status(400).json({ error: 'Persona ID is required' });
    }

    await memoryService.consolidateMemory(sessionId, personaId);

    res.json({
      success: true,
      message: 'Memory consolidated successfully'
    });
  } catch (error) {
    console.error('Error consolidating memory:', error);
    res.status(500).json({ error: 'Failed to consolidate memory' });
  }
});

// Response Quality Analysis Routes
router.post('/analysis/quality', async (req, res) => {
  try {
    const { response, personaId, userMessage } = req.body;
    
    if (!response || !personaId || !userMessage) {
      return res.status(400).json({ error: 'Response, persona ID, and user message are required' });
    }

    const persona = await personaExtractionService.getPersonaById(personaId);
    if (!persona) {
      return res.status(404).json({ error: 'Persona not found' });
    }

    const analysis = await aiService.analyzeResponseQuality(response, persona, userMessage);

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Error analyzing response quality:', error);
    res.status(500).json({ error: 'Failed to analyze response quality' });
  }
});

// System Monitoring Routes
router.get('/monitoring/metrics', async (req, res) => {
  try {
    const sessions = await orchestrationService.getActiveSessions();
    const scenarios = await orchestrationService.getActiveScenarios();
    
    const metrics = {
      activeSessions: sessions.length,
      activeScenarios: scenarios.length,
      totalPersonas: (await personaExtractionService.getAllPersonas()).length,
      averageConversationCount: sessions.reduce((sum, s) => sum + s.conversationCount, 0) / sessions.length || 0,
      emotionalStates: sessions.reduce((acc, s) => {
        acc[s.emotionalState] = (acc[s.emotionalState] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Batch Processing Routes
router.post('/batch/responses', async (req, res) => {
  try {
    const { requests } = req.body;
    
    if (!requests || !Array.isArray(requests)) {
      return res.status(400).json({ error: 'Requests array is required' });
    }

    const responses = await aiService.generateBatchResponses(requests);

    res.json({
      success: true,
      responses,
    });
  } catch (error) {
    console.error('Error processing batch responses:', error);
    res.status(500).json({ error: 'Failed to process batch responses' });
  }
});

// Health Check
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        dataPreprocessing: 'operational',
        personaExtraction: 'operational',
        memoryManagement: 'operational',
        aiModel: 'operational',
        orchestration: 'operational',
      },
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;






