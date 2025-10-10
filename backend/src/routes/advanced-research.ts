import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import SimpleAgentOrchestrator from '../framework/SimpleAgentOrchestrator';
import { ragPipeline } from '../services/SimpleRAGPipeline';
import { agentMemoryManager } from '../services/SimpleMemoryManager';
import { biasDetectionEngine } from '../services/SimpleBiasDetectionEngine';
import { consistencyScorer } from '../services/SimpleConsistencyScorer';
import { sentimentAnalyzer } from '../services/SimpleSentimentAnalyzer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/advanced-research');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt', '.csv', '.xlsx', '.mp3', '.wav', '.mp4', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed`));
    }
  }
});

// Initialize orchestrator
const orchestrator = new SimpleAgentOrchestrator();

// Advanced Research Session Management
router.post('/sessions', async (req: express.Request, res: express.Response) => {
  try {
    const { userProfile, researchGoals, agentConfigs } = req.body;

    if (!userProfile || !researchGoals) {
      return res.status(400).json({
        error: 'User profile and research goals are required',
        success: false
      });
    }

    // Add agents to orchestrator
    if (agentConfigs && agentConfigs.length > 0) {
      for (const agentConfig of agentConfigs) {
        await orchestrator.addAgent(agentConfig);
      }
    }

    // Start research session
    const sessionResult = await orchestrator.orchestrateResearchSession(userProfile, researchGoals);

    res.json({
      success: true,
      session: sessionResult,
      message: 'Research session completed successfully'
    });

  } catch (error: any) {
    console.error('Error starting research session:', error);
    res.status(500).json({
      error: error.message || 'Failed to start research session',
      success: false
    });
  }
});

// Document Processing and RAG
router.post('/documents/process', upload.array('files'), async (req: express.Request, res: express.Response) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({
        error: 'No files uploaded',
        success: false
      });
    }

    const processedDocuments = [];

    for (const file of req.files) {
      try {
        const document = await ragPipeline.processDocument(file.path, file.originalname);
        processedDocuments.push(document);
      } catch (error: any) {
        console.error(`Error processing file ${file.originalname}:`, error);
        processedDocuments.push({
          id: `error_${Date.now()}`,
          filename: file.originalname,
          error: error.message,
          success: false
        });
      }
    }

    res.json({
      success: true,
      documents: processedDocuments,
      message: `${processedDocuments.length} documents processed`
    });

  } catch (error: any) {
    console.error('Error processing documents:', error);
    res.status(500).json({
      error: error.message || 'Failed to process documents',
      success: false
    });
  }
});

// RAG Query
router.post('/query', async (req: express.Request, res: express.Response) => {
  try {
    const { question, context, filters } = req.body;

    if (!question) {
      return res.status(400).json({
        error: 'Question is required',
        success: false
      });
    }

    const ragResponse = await ragPipeline.queryResearchData(question, { context, filters });

    res.json({
      success: true,
      response: ragResponse,
      message: 'Query processed successfully'
    });

  } catch (error: any) {
    console.error('Error processing query:', error);
    res.status(500).json({
      error: error.message || 'Failed to process query',
      success: false
    });
  }
});

// Multimodal Analysis
router.post('/analyze/multimodal', upload.single('file'), async (req: express.Request, res: express.Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { file } = req;
    const fileType = file.mimetype;

    // Mock analysis based on file type
    let analysisResult;
    
    if (fileType.startsWith('image/')) {
      analysisResult = {
        type: 'image',
        analysis: {
          objects: ['person', 'computer', 'desk', 'chair'],
          emotions: ['neutral', 'focused'],
          colors: ['blue', 'white', 'gray'],
          text: ['ProcessCraft', 'AI-Powered UX'],
          confidence: 0.87
        }
      };
    } else if (fileType.startsWith('audio/')) {
      analysisResult = {
        type: 'audio',
        analysis: {
          transcription: 'This is a sample audio transcription for testing purposes.',
          emotions: ['neutral', 'confident'],
          sentiment: 'positive',
          confidence: 0.92
        }
      };
    } else {
      analysisResult = {
        type: 'document',
        analysis: {
          text: 'Document content analysis would go here.',
          keywords: ['research', 'user', 'experience', 'design'],
          sentiment: 'neutral',
          confidence: 0.75
        }
      };
    }

    res.json({
      success: true,
      data: {
        filename: file.originalname,
        fileType,
        analysis: analysisResult
      }
    });
  } catch (error) {
    console.error('Error in multimodal analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed'
    });
  }
});

// Performance Analytics
router.get('/analytics/dashboard', async (req: express.Request, res: express.Response) => {
  try {
    // Mock dashboard data for now
    const dashboardData = {
      overview: {
        totalAgents: 5,
        activeSessions: 3,
        averagePerformance: 85.2,
        topPerformers: [
          {
            agentId: 'agent-1',
            name: 'Raj Kumar',
            performanceScore: 92.5,
            trend: 'improving' as const,
            lastActive: new Date().toISOString()
          },
          {
            agentId: 'agent-2',
            name: 'Priya Sharma',
            performanceScore: 88.3,
            trend: 'stable' as const,
            lastActive: new Date().toISOString()
          }
        ],
        recentActivity: [
          {
            timestamp: new Date().toISOString(),
            type: 'agent_created',
            description: 'New agent "Raj Kumar" created',
            agentId: 'agent-1'
          },
          {
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'session_started',
            description: 'Research session started',
            sessionId: 'session-1'
          }
        ]
      },
      trends: {
        performance: { direction: 'up', velocity: 2.3, volatility: 0.8, prediction: 87.5 },
        engagement: { direction: 'up', velocity: 1.8, volatility: 0.6, prediction: 82.1 },
        bias: { direction: 'down', velocity: -0.5, volatility: 0.3, prediction: 12.2 },
        consistency: { direction: 'up', velocity: 1.2, volatility: 0.4, prediction: 89.7 },
        sentiment: { direction: 'up', velocity: 0.9, volatility: 0.7, prediction: 78.4 }
      },
      alerts: [
        {
          id: 'alert-1',
          type: 'bias_detected',
          severity: 'medium' as const,
          message: 'Potential bias detected in Agent 3 responses',
          timestamp: new Date().toISOString(),
          agentId: 'agent-3'
        }
      ]
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

// Bias Detection
router.post('/analyze/bias', async (req: express.Request, res: express.Response) => {
  try {
    const { conversationHistory } = req.body;

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return res.status(400).json({
        error: 'Conversation history is required',
        success: false
      });
    }

    const biasResult = await biasDetectionEngine.detectBias(conversationHistory);

    res.json({
      success: true,
      bias: biasResult,
      message: 'Bias analysis completed'
    });

  } catch (error: any) {
    console.error('Error analyzing bias:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze bias',
      success: false
    });
  }
});

// Consistency Scoring
router.post('/analyze/consistency', async (req: express.Request, res: express.Response) => {
  try {
    const { conversationHistory } = req.body;

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return res.status(400).json({
        error: 'Conversation history is required',
        success: false
      });
    }

    const consistencyResult = await consistencyScorer.scoreConsistency(conversationHistory);

    res.json({
      success: true,
      consistency: consistencyResult,
      message: 'Consistency analysis completed'
    });

  } catch (error: any) {
    console.error('Error analyzing consistency:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze consistency',
      success: false
    });
  }
});

// Sentiment Analysis
router.post('/analyze/sentiment', async (req: express.Request, res: express.Response) => {
  try {
    const { conversationHistory } = req.body;

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return res.status(400).json({
        error: 'Conversation history is required',
        success: false
      });
    }

    const sentimentResult = await sentimentAnalyzer.analyzeSentiment(conversationHistory);

    res.json({
      success: true,
      sentiment: sentimentResult,
      message: 'Sentiment analysis completed'
    });

  } catch (error: any) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze sentiment',
      success: false
    });
  }
});

// Memory Management
router.get('/memory/agent/:agentId', async (req: express.Request, res: express.Response) => {
  try {
    const { agentId } = req.params;
    const { sessionId } = req.query;

    const memory = await agentMemoryManager.getAgentMemory(agentId, sessionId as string);

    res.json({
      success: true,
      memory,
      message: 'Agent memory retrieved successfully'
    });

  } catch (error: any) {
    console.error('Error getting agent memory:', error);
    res.status(500).json({
      error: error.message || 'Failed to get agent memory',
      success: false
    });
  }
});

router.post('/memory/search', async (req: express.Request, res: express.Response) => {
  try {
    const { query, agentId, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query is required',
        success: false
      });
    }

    const results = await agentMemoryManager.findSimilarMemories(query, agentId, limit);

    res.json({
      success: true,
      results,
      message: 'Memory search completed'
    });

  } catch (error: any) {
    console.error('Error searching memory:', error);
    res.status(500).json({
      error: error.message || 'Failed to search memory',
      success: false
    });
  }
});

// Research Pattern Analysis
router.post('/analyze/patterns', async (req: express.Request, res: express.Response) => {
  try {
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds)) {
      return res.status(400).json({
        error: 'Document IDs are required',
        success: false
      });
    }

    const documents = [];
    for (const docId of documentIds) {
      const doc = await ragPipeline.getDocument(docId);
      if (doc) documents.push(doc);
    }

    const patternAnalysis = await ragPipeline.analyzeResearchPatterns(documents);

    res.json({
      success: true,
      analysis: patternAnalysis,
      message: 'Pattern analysis completed'
    });

  } catch (error: any) {
    console.error('Error analyzing patterns:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze patterns',
      success: false
    });
  }
});

export default router;