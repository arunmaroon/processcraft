import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key' 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../data/ai-agent-hub/uploads');
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
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.json', '.pdf', '.txt', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

// Interface for synthetic agents
interface SyntheticAgent {
  id: string;
  name: string;
  age: string;
  demographics: {
    gender: string;
    location: string;
    income: string;
    education: string;
    occupation: string;
  };
  behaviors: string[];
  personality: {
    traits: string[];
    communicationStyle: string;
    emotionalTone: string;
    responseLength: 'brief' | 'moderate' | 'detailed';
  };
  sampleQuote: string;
  confidence: number;
  sourceData: string[];
  createdAt: string;
  status: 'draft' | 'generated' | 'reviewed' | 'published';
}

// Interface for uploaded files
interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  insights?: number;
  filePath: string;
}

// Store for uploaded files and agents
let uploadedFiles: UploadedFile[] = [];
let syntheticAgents: SyntheticAgent[] = [];

// Load existing data on startup
const loadExistingData = () => {
  try {
    const filesPath = path.join(__dirname, '../../data/ai-agent-hub/files.json');
    if (fs.existsSync(filesPath)) {
      uploadedFiles = JSON.parse(fs.readFileSync(filesPath, 'utf8'));
    }

    const agentsPath = path.join(__dirname, '../../data/ai-agent-hub/agents.json');
    if (fs.existsSync(agentsPath)) {
      syntheticAgents = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading existing data:', error);
  }
};

// Save data to files
const saveData = () => {
  try {
    const dataDir = path.join(__dirname, '../../data/ai-agent-hub');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(dataDir, 'files.json'),
      JSON.stringify(uploadedFiles, null, 2)
    );

    fs.writeFileSync(
      path.join(dataDir, 'agents.json'),
      JSON.stringify(syntheticAgents, null, 2)
    );
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Initialize data
loadExistingData();

// GET /api/ai-agent-hub/files - Get uploaded files
router.get('/files', (req, res) => {
  res.json(uploadedFiles);
});

// GET /api/ai-agent-hub/agents - Get synthetic agents
router.get('/agents', (req, res) => {
  res.json(syntheticAgents);
});

// POST /api/ai-agent-hub/upload - Upload research files
router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const newFiles: UploadedFile[] = [];

    for (const file of req.files) {
      const uploadedFile: UploadedFile = {
        id: uuidv4(),
        name: file.originalname,
        type: path.extname(file.originalname).toLowerCase(),
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'processing',
        filePath: file.path
      };

      newFiles.push(uploadedFile);
      uploadedFiles.push(uploadedFile);
    }

    // Process files asynchronously
    processFiles(newFiles);

    res.json({ 
      success: true, 
      files: newFiles,
      message: 'Files uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Process uploaded files
const processFiles = async (files: UploadedFile[]) => {
  for (const file of files) {
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update file status
      file.status = 'completed';
      file.insights = Math.floor(Math.random() * 20) + 5; // Mock insights count
      
      saveData();
    } catch (error) {
      console.error('Error processing file:', error);
      file.status = 'error';
    }
  }
};

// POST /api/ai-agent-hub/synthesize - Synthesize insights from uploaded files
router.post('/synthesize', async (req, res) => {
  try {
    const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
    
    if (completedFiles.length === 0) {
      return res.status(400).json({ error: 'No completed files to synthesize' });
    }

    // Mock synthesis process
    const insights = {
      totalFiles: completedFiles.length,
      totalInsights: completedFiles.reduce((sum, file) => sum + (file.insights || 0), 0),
      categories: ['usability', 'behavior', 'preference', 'pain_points', 'goals'],
      synthesizedAt: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      insights,
      message: 'Insights synthesized successfully' 
    });
  } catch (error) {
    console.error('Synthesis error:', error);
    res.status(500).json({ error: 'Synthesis failed' });
  }
});

// POST /api/ai-agent-hub/generate-agents - Generate synthetic agents
router.post('/generate-agents', async (req, res) => {
  try {
    const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
    
    if (completedFiles.length === 0) {
      return res.status(400).json({ error: 'No completed files to generate agents from' });
    }

    // Generate synthetic agents
    const agents = await generateSyntheticAgents(completedFiles);
    syntheticAgents = [...syntheticAgents, ...agents];
    
    saveData();

    res.json({ 
      success: true, 
      agents,
      message: `${agents.length} synthetic agents generated successfully` 
    });
  } catch (error) {
    console.error('Agent generation error:', error);
    res.status(500).json({ error: 'Agent generation failed' });
  }
});

// Generate synthetic agents from research data
const generateSyntheticAgents = async (files: UploadedFile[]): Promise<SyntheticAgent[]> => {
  const agents: SyntheticAgent[] = [];
  const agentCount = Math.min(12, Math.max(6, Math.floor(files.length * 2))); // 6-12 agents

  for (let i = 0; i < agentCount; i++) {
    const agent = await generateSingleAgent(files, i);
    agents.push(agent);
  }

  return agents;
};

// Generate a single synthetic agent
const generateSingleAgent = async (files: UploadedFile[], index: number): Promise<SyntheticAgent> => {
  // Mock agent generation - in real implementation, this would use AI
  const names = [
    'Sarah Chen', 'Marcus Johnson', 'Elena Rodriguez', 'David Kim', 'Priya Patel',
    'James Wilson', 'Maria Garcia', 'Alex Thompson', 'Lisa Anderson', 'Carlos Mendez',
    'Jennifer Lee', 'Michael Brown', 'Amanda Taylor', 'Robert Davis', 'Jessica White'
  ];

  const ages = ['25-30', '31-35', '36-40', '41-45', '46-50', '51-55', '56-60'];
  const genders = ['Female', 'Male', 'Non-binary'];
  const locations = ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Chicago, IL'];
  const incomes = ['₹3L-5L', '₹5L-7.5L', '₹7.5L-10L', '₹10L-15L', '₹15L+'];
  const educations = ['High School', 'Associate', 'Bachelor\'s', 'Master\'s', 'PhD'];
  const occupations = [
    'Software Engineer', 'Marketing Manager', 'Teacher', 'Nurse', 'Sales Rep',
    'Designer', 'Consultant', 'Entrepreneur', 'Student', 'Retired'
  ];

  const behaviors = [
    'Early adopter of new technology',
    'Prefers mobile over desktop',
    'Values convenience over cost',
    'Research-heavy decision maker',
    'Social media active',
    'Price-conscious shopper',
    'Brand loyal',
    'Seeks expert opinions',
    'Impatient with slow interfaces',
    'Prefers visual content'
  ];

  const personalityTraits = [
    'Analytical', 'Creative', 'Practical', 'Optimistic', 'Cautious',
    'Adventurous', 'Methodical', 'Spontaneous', 'Detail-oriented', 'Big-picture thinker'
  ];

  const communicationStyles = ['Direct', 'Conversational', 'Formal', 'Casual', 'Technical'];
  const emotionalTones = ['Neutral', 'Positive', 'Concerned', 'Excited', 'Frustrated'];
  const responseLengths: ('brief' | 'moderate' | 'detailed')[] = ['brief', 'moderate', 'detailed'];

  const sampleQuotes = [
    "I need something that just works without me having to think about it.",
    "I always read reviews before making any purchase decision.",
    "I'm willing to pay more for better quality and service.",
    "I prefer to do my research online before talking to anyone.",
    "I want to see exactly what I'm getting before I buy.",
    "I'm always looking for the best deal and discounts.",
    "I trust recommendations from friends and family most.",
    "I need clear instructions and good customer support.",
    "I'm not very tech-savvy, so I need simple solutions.",
    "I value my time and don't want to waste it on complicated processes."
  ];

  const agent: SyntheticAgent = {
    id: uuidv4(),
    name: names[index % names.length],
    age: ages[Math.floor(Math.random() * ages.length)],
    demographics: {
      gender: genders[Math.floor(Math.random() * genders.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      income: incomes[Math.floor(Math.random() * incomes.length)],
      education: educations[Math.floor(Math.random() * educations.length)],
      occupation: occupations[Math.floor(Math.random() * occupations.length)]
    },
    behaviors: behaviors
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 5) + 3),
    personality: {
      traits: personalityTraits
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 2),
      communicationStyle: communicationStyles[Math.floor(Math.random() * communicationStyles.length)],
      emotionalTone: emotionalTones[Math.floor(Math.random() * emotionalTones.length)],
      responseLength: responseLengths[Math.floor(Math.random() * responseLengths.length)]
    },
    sampleQuote: sampleQuotes[Math.floor(Math.random() * sampleQuotes.length)],
    confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
    sourceData: files.map(f => f.name),
    createdAt: new Date().toISOString(),
    status: 'generated'
  };

  return agent;
};

// POST /api/ai-agent-hub/publish-agent/:id - Publish agent to central library
router.post('/publish-agent/:id', (req, res) => {
  try {
    const agentId = req.params.id;
    const agent = syntheticAgents.find(a => a.id === agentId);
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    agent.status = 'published';
    saveData();

    res.json({ 
      success: true, 
      message: 'Agent published to central library' 
    });
  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ error: 'Publish failed' });
  }
});

// DELETE /api/ai-agent-hub/delete-agent/:id - Delete agent
router.delete('/delete-agent/:id', (req, res) => {
  try {
    const agentId = req.params.id;
    const agentIndex = syntheticAgents.findIndex(a => a.id === agentId);
    
    if (agentIndex === -1) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    syntheticAgents.splice(agentIndex, 1);
    saveData();

    res.json({ 
      success: true, 
      message: 'Agent deleted successfully' 
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// GET /api/ai-agent-hub/central-library - Get published agents for projects
router.get('/central-library', (req, res) => {
  try {
    const publishedAgents = syntheticAgents.filter(a => a.status === 'published');
    res.json({ 
      success: true, 
      agents: publishedAgents,
      count: publishedAgents.length
    });
  } catch (error) {
    console.error('Central library error:', error);
    res.status(500).json({ error: 'Failed to fetch central library' });
  }
});

export default router;
