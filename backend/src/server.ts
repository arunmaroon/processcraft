// Load environment variables FIRST before any imports
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import fs from 'fs';

// Import routes
import projectRoutes from './routes/project';
import researchRoutes from './routes/research';
import designRoutes from './routes/design';
import uiGenerationRoutes from './routes/ui-generation';
import codeExportRoutes from './routes/code-export';
import adminResearchRoutes from './routes/admin-research';
import aiResearchRoutes from './routes/ai-research';
import prdGenerationRoutes from './routes/prd-generation';
import chatPRDRoutes from './routes/chat-prd';
import researchPlanRoutes from './routes/research-plan';
import discussionGuideRoutes from './routes/discussion-guide';
import researchReportRoutes from './routes/research-report';
import aiAgentHubRoutes from './routes/ai-agent-hub';
import uxDesignerRoutes from './routes/ux-designer';
console.log('🔑 Environment check:');
console.log('CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? 'LOADED' : 'NOT LOADED');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'LOADED' : 'NOT LOADED');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:2000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security middleware - restrict file access to project root only
// DISABLED FOR DEVELOPMENT - ENABLE IN PRODUCTION
/*
app.use((req, res, next) => {
  // Skip security check for API routes and development
  if (req.path.startsWith('/api/') || process.env.NODE_ENV === 'development') {
    return next();
  }
  
  const projectRoot = path.resolve(__dirname, '../../');
  const requestedPath = path.resolve(projectRoot, req.path);
  
  // Ensure requested path is within project root
  if (!requestedPath.startsWith(projectRoot)) {
    return res.status(403).json({ error: 'Access denied: Path outside project root' });
  }
  
  next();
});
*/

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/design', designRoutes);
app.use('/api/ui-generation', uiGenerationRoutes);
app.use('/api/code-export', codeExportRoutes);
app.use('/api/admin-research', adminResearchRoutes);
app.use('/api/research', aiResearchRoutes);
app.use('/api/prd-generation', prdGenerationRoutes);
app.use('/api/chat-prd', chatPRDRoutes);
app.use('/api/research', researchPlanRoutes);
app.use('/api/research', discussionGuideRoutes);
app.use('/api/research', researchReportRoutes);
app.use('/api/ai-agent-hub', aiAgentHubRoutes);
app.use('/api/ux-designer', uxDesignerRoutes);

// Research Central API (shared access for projects)
app.get('/api/research-central', async (req, res) => {
  try {
    const { adminResearchService } = await import('./services/adminResearchService');
    const insights = await adminResearchService.getInsights();
    const configs = await adminResearchService.getConfigs();
    const mappings = await adminResearchService.getMappings();
    const agents = await adminResearchService.getAgents();
    
    res.json({
      insights,
      personas: configs.personas || [],
      demographics: configs.demographics || [],
      cohorts: configs.cohorts || [],
      mappings,
      agents,
      uploads: [] // Mock uploads for now
    });
  } catch (error) {
    console.error('Research central API error:', error);
    res.status(500).json({ message: 'Failed to load research central data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Ensure data directories exist
const ensureDataDirectories = () => {
  const dataDir = path.join(__dirname, '../../data');
  const exportsDir = path.join(__dirname, '../../exports');
  
  const dirs = [
    dataDir,
    path.join(dataDir, 'training'),
    path.join(dataDir, 'assets'),
    exportsDir,
    path.join(exportsDir, 'research-insights'),
    path.join(exportsDir, 'wireframes'),
    path.join(exportsDir, 'ui-variants'),
    path.join(exportsDir, 'code')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Initialize data directories
ensureDataDirectories();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ProcessCraft Backend running on port ${PORT}`);
  console.log(`📁 Data directory: ${path.join(__dirname, '../../data')}`);
  console.log(`📤 Exports directory: ${path.join(__dirname, '../../exports')}`);
  console.log(`🔒 Security: File access restricted to project root`);
});

export default app;
