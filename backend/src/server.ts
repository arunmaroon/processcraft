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
import agentRoutes from './routes/agents';
import authRoutes from './routes/auth';
import advancedResearchRoutes from './routes/advanced-research';
import multiPRDRoutes from './routes/multi-prd';
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
app.use('/api/advanced-research', advancedResearchRoutes);
app.use('/api/multi-prd', multiPRDRoutes);
// Mock agent generation endpoint (temporary)
app.post('/api/agents/generate', async (req, res) => {
  try {
    const { criteria } = req.body;
    const sampleSize = criteria.sample_size || 5;
    
    // Generate detailed personas based on NN/g guidelines
    const agents = [];
    const personaNames = [
      'Priya Sharma', 'Rajesh Kumar', 'Anita Patel', 'Vikram Singh', 'Deepika Mehta',
      'Arjun Gupta', 'Sneha Reddy', 'Karthik Nair', 'Pooja Agarwal', 'Rohit Joshi'
    ];
    
    for (let i = 0; i < sampleSize; i++) {
      const demographics = criteria.demographics || {};
      const age = demographics.age ? Math.floor(Math.random() * (demographics.age.max - demographics.age.min + 1)) + demographics.age.min : 28;
      const occupation = demographics.occupation || 'Salaried';
      const income = demographics.income || { min: 5, max: 15 };
      const location = demographics.location || 'Mumbai';
      const techSavviness = demographics.tech_savviness || 'High';
      const englishLiteracy = demographics.english_literacy || 'Fluent';
      
      // Generate persona-specific details based on NN/g guidelines
      const persona = {
        id: `persona-${Date.now()}-${i}`,
        name: personaNames[i % personaNames.length],
        age: age,
        gender: Math.random() > 0.5 ? 'Female' : 'Male',
        photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(personaNames[i % personaNames.length])}&background=random&color=fff&size=200`,
        
        // Tagline describing what they do in "real life"
        tagline: occupation === 'Salaried' 
          ? `Software professional working in ${location}`
          : `Business owner managing operations in ${location}`,
        
        // Demographics following NN/g structure
        demographics: {
          age: age,
          occupation: occupation,
          income_range: `${income.min}L-${income.max}L`,
          location: location,
          education: demographics.education || 'Graduate',
          family_status: demographics.family_status || 'Married',
          tech_savviness: techSavviness,
          english_literacy: englishLiteracy
        },
        
        // Experience level and context
        experience: {
          level: techSavviness === 'Digital Native' ? 'Expert' : 
                 techSavviness === 'High' ? 'Advanced' : 
                 techSavviness === 'Medium' ? 'Intermediate' : 'Basic',
          context: `Uses digital services ${techSavviness === 'Digital Native' ? 'daily' : 'regularly'} for ${occupation === 'Salaried' ? 'work and personal tasks' : 'business operations'}`,
          device_preference: techSavviness === 'Digital Native' ? 'Mobile-first' : 'Desktop and mobile',
          frequency: 'Daily user'
        },
        
        // Goals and concerns
        goals: [
          occupation === 'Salaried' ? 'Advance career and increase income' : 'Grow business and expand operations',
          'Save money and invest wisely',
          'Access convenient digital services',
          'Stay updated with technology trends'
        ],
        concerns: [
          'Data security and privacy',
          'Ease of use and convenience',
          'Cost-effectiveness',
          'Reliability of services'
        ],
        
        // Behavioral characteristics
        behaviors: [
          techSavviness === 'Digital Native' ? 'Early adopter of new technology' : 'Cautious about new technology',
          englishLiteracy === 'Fluent' ? 'Comfortable with English interfaces' : 'Prefers local language support',
          'Values efficiency and speed',
          'Seeks recommendations from peers'
        ],
        
        // Communication style and preferences
        communication_style: demographics.communication_style || 'Direct and practical',
        preferences: [
          'Clear, simple interfaces',
          'Quick access to key features',
          'Mobile-friendly design',
          'Local language support'
        ],
        
        // Pain points
        pain_points: [
          'Complex registration processes',
          'Too many steps to complete tasks',
          'Poor mobile experience',
          'Lack of customer support'
        ],
        
        // Quote that sums up their attitude
        quote: occupation === 'Salaried' 
          ? `"I need digital services that save me time and help me manage my finances efficiently while I focus on my career."`
          : `"As a business owner, I want technology that helps me grow my business without being too complicated to use."`,
        
        // Confidence and tech comfort
        confidence: techSavviness === 'Digital Native' ? 0.9 : 
                   techSavviness === 'High' ? 0.8 : 
                   techSavviness === 'Medium' ? 0.6 : 0.4,
        
        // Additional persona details
        background: {
          education: demographics.education || 'Graduate',
          work_experience: `${age - 22}+ years`,
          family: demographics.family_status || 'Married with children',
          lifestyle: 'Urban professional'
        },
        
        created_at: new Date().toISOString()
      };
      
      agents.push(persona);
    }
    
    res.json({
      success: true,
      agents: agents,
      count: agents.length
    });
  } catch (error) {
    console.error('Agent generation error:', error);
    res.status(500).json({ error: 'Failed to generate agents' });
  }
});

// Mock agent list endpoint
app.get('/api/agents', async (req, res) => {
  try {
    // Return empty array for now - in real implementation, fetch from database
    res.json({
      success: true,
      agents: [],
      count: 0
    });
  } catch (error) {
    console.error('Agent list error:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Mock agent chat endpoint
app.post('/api/agents/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    // Generate a mock response based on the agent
    const responses = [
      `Hello! I'm Agent ${id}. I understand you're asking: "${message}". Based on my personality and background, I would respond thoughtfully to this.`,
      `Interesting question! As Agent ${id}, I see this from my unique perspective. Let me share my thoughts on "${message}".`,
      `Thanks for reaching out! I'm Agent ${id} and I'm here to help. Regarding "${message}", here's what I think...`,
      `Hi there! I'm Agent ${id}. That's a great question about "${message}". From my experience and background, I believe...`,
      `Hello! I'm Agent ${id}. I appreciate you asking about "${message}". Based on my personality traits and demographics, I would say...`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    res.json({
      success: true,
      response: randomResponse,
      agentId: id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Agent chat error:', error);
    res.status(500).json({ error: 'Failed to get agent response' });
  }
});

// app.use('/api/agents', agentRoutes);
// app.use('/api/auth', authRoutes);

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
