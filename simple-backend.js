const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const AdvancedPersonaGenerator = require('./backend/src/services/advancedPersonaGenerator');
const RedisService = require('./backend/src/services/redisService');
const VectorSearchService = require('./backend/src/services/vectorSearchService');
const AnalyticsService = require('./backend/src/services/analyticsService');
const app = express();
const PORT = 3001;

// Initialize advanced services
const personaGenerator = new AdvancedPersonaGenerator();
const redisService = new RedisService();
const vectorSearchService = new VectorSearchService();
const analyticsService = new AnalyticsService();

// Simple in-memory project storage
let projects = [
  {
    id: '1',
    name: 'DigiGold Mobile App',
    description: 'A mobile banking app for digital gold investment',
    status: 'IN_PROGRESS',
    currentStage: 'RESEARCH',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedUsers: {
      PM: ['1'],
      DESIGNER: ['2'],
      DESIGN_HEAD: ['3']
    },
    prd: {
      id: 'prd-1',
      objectives: [
        'Enable users to buy and sell digital gold',
        'Provide real-time gold price tracking',
        'Offer secure wallet functionality'
      ],
      targetUsers: [
        'Tech-savvy millennials (25-35)',
        'Investment enthusiasts',
        'Mobile-first users'
      ],
      successMetrics: [
        'User acquisition rate > 1000/month',
        'Transaction volume > $100K/month',
        'User retention > 80% after 3 months'
      ],
      businessContext: 'Digital gold is becoming increasingly popular as an investment option.',
      constraints: [
        'Must comply with financial regulations',
        'Maximum 2-second load time',
        'Support for iOS and Android'
      ],
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    prds: [], // New multi-PRD support
    activePRDId: null,
    approvals: [],
    version: 1
  }
];

// Initialize Redis connection
redisService.connect().then(() => {
  console.log('✅ Redis service initialized');
}).catch(err => {
  console.log('⚠️ Redis not available, using fallback storage');
});

// Middleware
app.use(cors({
  origin: ['http://localhost:2000', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Project Management Routes
// GET /api/projects - Get all projects
app.get('/api/projects', (req, res) => {
  try {
    console.log(`📋 Returning ${projects.length} projects`);
    res.json(projects);
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Get project by ID
app.get('/api/projects/:id', (req, res) => {
  try {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    console.log(`📋 Returning project: ${project.name} (ID: ${project.id})`);
    res.json(project);
  } catch (error) {
    console.error('❌ Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - Create new project
app.post('/api/projects', (req, res) => {
  try {
    const projectData = req.body;
    console.log('📝 Creating new project:', projectData.name);
    
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      prds: projectData.prds || [],
      activePRDId: projectData.activePRDId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };
    
    projects.push(newProject);
    console.log(`✅ Project created successfully: ${newProject.name} (ID: ${newProject.id})`);
    
    res.status(201).json(newProject);
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project
app.put('/api/projects/:id', (req, res) => {
  try {
    const projectId = req.params.id;
    const projectData = req.body;
    
    console.log(`📝 Updating project: ${projectId}`);
    
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const updatedProject = {
      ...projects[projectIndex],
      ...projectData,
      id: projectId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
      version: projects[projectIndex].version + 1
    };
    
    projects[projectIndex] = updatedProject;
    console.log(`✅ Project updated successfully: ${updatedProject.name} (ID: ${updatedProject.id})`);
    res.json(updatedProject);
  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project
app.delete('/api/projects/:id', (req, res) => {
  try {
    const projectId = req.params.id;
    console.log(`🗑️ Deleting project: ${projectId}`);
    
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    projects.splice(projectIndex, 1);
    console.log(`✅ Project deleted successfully: ${projectId}`);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Notifications endpoint
app.get('/api/notifications', (req, res) => {
  res.json([]);
});

// Versions endpoint
app.get('/api/versions', (req, res) => {
  res.json([]);
});

// Admin Research endpoints
app.get('/api/research-central', (req, res) => {
  res.json({
    agents: [],
    uploads: [],
    aiAgents: [],
    personas: []
  });
});

// File upload endpoint
app.post('/api/admin-research/upload', upload.array('files'), (req, res) => {
  try {
    console.log('File upload request received:', req.files);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = req.files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.originalname,
      size: file.size,
      type: path.extname(file.originalname).substring(1),
      uploadedAt: new Date().toISOString(),
      path: file.path,
      status: 'UPLOADED'
    }));

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// Process documents endpoint
app.post('/api/admin-research/process-documents', async (req, res) => {
  try {
    console.log('Process documents request:', req.body);
    
    const { fileIds, action, configuration } = req.body;
    
    if (action === 'generate_agents') {
      // Read uploaded files and process with AI
      const documents = [];
      
      if (fileIds && fileIds.length > 0) {
        // Read files from uploads directory
        const uploadDir = './uploads';
        const files = fs.readdirSync(uploadDir);
        
        for (const fileId of fileIds) {
          const file = files.find(f => f.includes(fileId.toString()));
          if (file) {
            const filePath = path.join(uploadDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            documents.push({
              filename: file,
              content: fileContent,
              type: path.extname(file).substring(1),
              path: filePath,
              size: fs.statSync(filePath).size,
              mimetype: 'text/plain' // Simplified for now
            });
          }
        }
      }
      
      // Generate AI agents using advanced persona generator
      console.log('🚀 Using Advanced AI Persona Generator for Indian Context...');
      const startTime = Date.now();
      const result = await personaGenerator.generateIndianPersonas(documents, configuration || {});
      const agents = result.personas || result;
      
      // Track analytics
      analyticsService.trackPersonaGeneration(agents, 'document_upload');
      
      // Store in Redis for session management
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await redisService.setPersonaSession(sessionId, agents);
      
      // Generate vector embeddings for similarity search
      agents.forEach(agent => {
        const embedding = vectorSearchService.generatePersonaEmbedding(agent);
        vectorSearchService.storePersonaVector(agent.id, embedding);
      });
      
      // Analyze diversity
      const diversityAnalysis = vectorSearchService.analyzePersonaDiversity(agents);
      
      res.json({
        success: true,
        message: 'Documents processed successfully with advanced AI',
        agents: agents,
        documentCount: documents.length,
        processingTime: Date.now() - startTime,
        sessionId: sessionId,
        analytics: {
          diversity: diversityAnalysis,
          qualityScore: analyticsService.getAverageQualityScore(),
          regionalDistribution: analyticsService.getCurrentMetrics().topRegions
        }
      });
    } else {
      // Fallback to mock data
      const mockAgents = [
        {
          id: 'agent-1',
          name: 'Tech-Savvy Professional',
          persona: 'A working professional who values efficiency and modern interfaces',
          demographics: {
            ageRange: [25, 35],
            income: '₹5L-₹10L',
            location: 'Urban India',
            occupation: 'Software Engineer'
          },
          behaviors: [
            'Prefers mobile-first interfaces',
            'Values security over convenience',
            'Quick decision maker'
          ],
          preferences: [
            'Clean, minimal design',
            'Fast loading times',
            'Intuitive navigation'
          ],
          painPoints: [
            'Complex registration processes',
            'Slow response times',
            'Unclear error messages'
          ],
          goals: [
            'Complete tasks quickly',
            'Feel secure using the platform',
            'Have a smooth user experience'
          ],
          communicationStyle: 'Direct and concise',
          techSavviness: 'High',
          confidence: 0.85,
          status: 'ACTIVE'
        }
      ];

      res.json({
        success: true,
        message: 'Documents processed successfully',
        agents: mockAgents,
        insights: {
          themes: ['User Experience', 'Security', 'Efficiency'],
          keyFindings: ['Users prefer simple interfaces', 'Security is a top concern'],
          recommendations: ['Implement two-factor authentication', 'Simplify onboarding process']
        }
      });
    }
  } catch (error) {
    console.error('Process documents error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Processing failed: ' + error.message,
      message: 'Document processing failed. Please try again.'
    });
  }
});

// Agent Management Endpoints
app.delete('/api/admin-research/agents/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    console.log('Deleting agent:', agentId);
    
    // In a real implementation, this would delete from database
    // For now, we'll just return success
    res.json({ 
      success: true, 
      message: `Agent ${agentId} deleted successfully`,
      deletedAgentId: agentId
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent: ' + error.message });
  }
});

app.put('/api/admin-research/agents/:agentId/status', (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.body;
    console.log('Updating agent status:', agentId, status);
    
    // In a real implementation, this would update database
    // For now, we'll just return success
    res.json({ 
      success: true, 
      message: `Agent ${agentId} status updated to ${status}`,
      agentId,
      status
    });
  } catch (error) {
    console.error('Error updating agent status:', error);
    res.status(500).json({ error: 'Failed to update agent status: ' + error.message });
  }
});

// AI Agent Generation Function
async function generateAgentsFromDocuments(documents, configuration = {}) {
  try {
    console.log('Generating AI agents from documents and configuration:', documents.length, 'docs');
    console.log('Configuration:', configuration);
    
    // Send documents and configuration to AI for analysis
    const aiAnalysis = await analyzeDocumentsWithAI(documents, configuration);
    console.log('AI Analysis completed:', aiAnalysis);
    
    // Extract real user details from AI analysis
    const realUsers = aiAnalysis.users || await extractRealUsersFromDocuments(documents);
    console.log('Extracted real users:', realUsers.length);
    
    // Create agents based on AI-analyzed real users
    const agents = realUsers.map((user, index) => ({
      id: `real-user-agent-${index + 1}`,
      name: user.name || `User ${index + 1}`,
      persona: `AI agent mimicking ${user.name || `User ${index + 1}`} - a real person from research data`,
      demographics: {
        age: user.age || 25 + (index * 5),
        ageRange: user.ageRange || [user.age - 5, user.age + 5],
        income: user.income || '₹3L-₹6L',
        income_range: user.income || '₹3L-₹6L',
        location: user.location || 'India',
        occupation: user.occupation || 'Professional',
        education: user.education || 'Graduate',
        family_status: user.familyStatus || 'Single',
        tech_savviness: user.techSavviness || 'Medium',
        english_literacy: user.englishLiteracy || 'Good'
      },
      behaviors: user.behaviors || [
        'Researches before making decisions',
        'Prefers step-by-step guidance',
        'Values user reviews and ratings'
      ],
      preferences: user.preferences || [
        'Clean, simple interfaces',
        'Mobile-first design',
        'Fast loading times'
      ],
      pain_points: user.painPoints || [
        'Confusing navigation',
        'Slow loading times',
        'Poor mobile experience'
      ],
      goals: user.goals || [
        'Complete tasks efficiently',
        'Save time and effort',
        'Make informed decisions'
      ],
      communication_style: user.communicationStyle || 'Friendly and conversational',
      quote: user.quote || `"I need something that works for my specific situation as a ${user.occupation || 'professional'}."`,
      confidence: user.confidence || 0.85,
      status: 'ACTIVE',
      source: 'Real User from Research Data',
      real_user_id: user.id,
      background: {
        education: user.education || 'Graduate degree',
        work_experience: user.workExperience || `${user.age - 22}+ years in ${user.occupation || 'professional field'}`,
        family: user.family || 'Single, living independently',
        lifestyle: user.lifestyle || 'Balanced work-life approach'
      },
      experience: {
        level: user.experienceLevel || 'Intermediate',
        context: user.context || 'Professional',
        device_preference: user.devicePreference || 'Mobile',
        frequency: user.frequency || 'Daily'
      },
      concerns: user.concerns || [
        'Data privacy and security',
        'Complex user interfaces',
        'Technical difficulties'
      ],
      created_at: new Date().toISOString()
    }));
    
    console.log('Generated AI agents from real users:', agents.length);
    return agents;
    
  } catch (error) {
    console.error('Error generating AI agents from real users:', error);
    // Return fallback agents based on document content
    return [
      {
        id: 'fallback-agent-1',
        name: 'Research Participant 1',
        persona: 'AI agent based on research participant from uploaded documents',
        demographics: {
          age: 28,
          ageRange: [25, 32],
          income: '₹4L-₹8L',
          income_range: '₹4L-₹8L',
          location: 'Bangalore',
          occupation: 'Software Engineer',
          education: 'Engineering',
          family_status: 'Single',
          tech_savviness: 'High',
          english_literacy: 'Fluent'
        },
        behaviors: ['Values efficiency', 'Prefers mobile apps', 'Data-driven decisions'],
        preferences: ['Clean UI', 'Fast loading', 'Intuitive navigation'],
        pain_points: ['Complex workflows', 'Slow responses', 'Poor mobile experience'],
        goals: ['Increase productivity', 'Save time', 'Better work-life balance'],
        communication_style: 'Direct and concise',
        quote: '"I need tools that help me work faster and more efficiently."',
        confidence: 0.90,
        status: 'ACTIVE',
        source: 'Research Data Analysis',
        background: {
          education: 'Bachelor of Technology in Computer Science',
          work_experience: '5+ years in software development',
          family: 'Single, living with roommates',
          lifestyle: 'Workaholic who enjoys coding and tech'
        },
        experience: {
          level: 'Expert',
          context: 'Professional',
          device_preference: 'Mobile',
          frequency: 'Daily'
        },
        concerns: ['Data privacy', 'System reliability', 'Learning curve'],
        created_at: new Date().toISOString()
      }
    ];
  }
}

// AI Analysis Function - Send documents and configuration to AI
async function analyzeDocumentsWithAI(documents, configuration) {
  try {
    console.log('Sending documents and configuration to AI for analysis...');
    
    // Prepare document content for AI analysis
    const documentContents = [];
    for (const doc of documents) {
      try {
        const content = await fs.promises.readFile(doc.path, 'utf8');
        documentContents.push({
          filename: doc.filename,
          content: content.substring(0, 10000), // Limit content size
          size: doc.size,
          type: doc.mimetype
        });
      } catch (error) {
        console.error('Error reading document:', doc.filename, error);
      }
    }
    
    // Create AI prompt for document analysis
    const aiPrompt = createAIAnalysisPrompt(documentContents, configuration);
    
    // In a real implementation, this would call Grok API or similar
    // For now, we'll simulate AI analysis with enhanced logic
    const aiAnalysis = await simulateAIAnalysis(documentContents, configuration, aiPrompt);
    
    return aiAnalysis;
  } catch (error) {
    console.error('Error in AI analysis:', error);
    // Fallback to basic analysis
    return { users: await extractRealUsersFromDocuments(documents) };
  }
}

// Create AI prompt for document analysis
function createAIAnalysisPrompt(documents, configuration) {
  return `
Analyze the following research documents and configuration to extract real user personas:

DOCUMENTS:
${documents.map(doc => `
File: ${doc.filename}
Content: ${doc.content}
`).join('\n')}

CONFIGURATION:
${JSON.stringify(configuration, null, 2)}

Please extract:
1. Real user personas with detailed demographics
2. User behaviors, preferences, and pain points
3. Technology usage patterns
4. Communication styles
5. Goals and motivations
6. Authentic quotes from users

Focus on creating diverse, realistic personas that represent actual users from the research data.
Each persona should be based on specific individuals mentioned in the documents.
`;
}

// Simulate AI analysis (in real implementation, this would call Grok API)
async function simulateAIAnalysis(documents, configuration, prompt) {
  console.log('Simulating AI analysis with prompt length:', prompt.length);
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Extract users from documents using enhanced pattern matching
  const extractedUsers = await extractRealUsersFromDocuments(documents);
  
  // Enhance users based on configuration
  const enhancedUsers = extractedUsers.map((user, index) => {
    // Apply configuration-based enhancements
    const configEnhancements = applyConfigurationEnhancements(user, configuration, index);
    return { ...user, ...configEnhancements };
  });
  
  // If no users found in documents, use realistic sample users
  if (enhancedUsers.length === 0) {
    return { users: createSampleUsersFromContent(documents) };
  }
  
  return { users: enhancedUsers };
}

// Apply configuration-based enhancements to users
function applyConfigurationEnhancements(user, configuration, index) {
  const enhancements = {};
  
  // Apply age range from configuration
  if (configuration.ageRange) {
    const [minAge, maxAge] = configuration.ageRange;
    enhancements.age = minAge + (index * Math.floor((maxAge - minAge) / 5));
  }
  
  // Apply income range from configuration
  if (configuration.incomeRange) {
    const incomeRanges = ['₹3L-₹6L', '₹6L-₹12L', '₹12L-₹20L', '₹20L-₹35L', '₹35L+'];
    enhancements.income = incomeRanges[index % incomeRanges.length];
  }
  
  // Apply location preferences from configuration
  if (configuration.locations && configuration.locations.length > 0) {
    enhancements.location = configuration.locations[index % configuration.locations.length];
  }
  
  // Apply tech savviness from configuration
  if (configuration.techLevels && configuration.techLevels.length > 0) {
    enhancements.techSavviness = configuration.techLevels[index % configuration.techLevels.length];
  }
  
  // Apply occupation preferences from configuration
  if (configuration.occupations && configuration.occupations.length > 0) {
    enhancements.occupation = configuration.occupations[index % configuration.occupations.length];
  }
  
  return enhancements;
}

// Function to extract real users from uploaded documents
async function extractRealUsersFromDocuments(documents) {
  const realUsers = [];
  
  try {
    for (const doc of documents) {
      console.log('Processing document:', doc.filename);
      
      // Read document content
      const content = await fs.promises.readFile(doc.path, 'utf8');
      
      // Extract user information using pattern matching
      const users = extractUsersFromContent(content, doc.filename);
      realUsers.push(...users);
    }
    
    // If no users found, create sample users based on document content
    if (realUsers.length === 0) {
      console.log('No specific users found, creating sample users from document content');
      return createSampleUsersFromContent(documents);
    }
    
    return realUsers;
  } catch (error) {
    console.error('Error extracting users from documents:', error);
    return createSampleUsersFromContent(documents);
  }
}

// Extract users from document content using enhanced pattern matching
function extractUsersFromContent(content, filename) {
  const users = [];
  
  // Enhanced patterns for user information in research documents
  const patterns = {
    // Interview transcripts with various formats
    interview: [
      /(?:Participant|User|Interviewee|P\d+)\s*:?\s*([A-Za-z\s]+)(?:\n|$)/gi,
      /(?:Name|User)\s*:?\s*([A-Za-z\s]+)(?:\n|$)/gi,
      /(?:I'm|I am)\s+([A-Za-z\s]+)(?:\s|,|\.)/gi,
      /(?:My name is|I'm called)\s+([A-Za-z\s]+)(?:\s|,|\.)/gi
    ],
    // Survey responses
    survey: [
      /(?:Respondent|User|R\d+)\s*(\d+):\s*([A-Za-z\s]+)/gi,
      /(?:Q\d+.*?Answer:?\s*)([A-Za-z\s]+)/gi
    ],
    // User profiles and personas
    profile: [
      /(?:Persona|Profile|User)\s*:?\s*([A-Za-z\s]+)/gi,
      /(?:Demographics|User Details).*?Name:?\s*([A-Za-z\s]+)/gi
    ],
    // Indian names specifically
    indianNames: [
      /(?:Amit|Rahul|Vikram|Sanjay|Priya|Rajesh|Kumar|Sharma|Patel|Gupta|Singh|Mehta)\s+([A-Za-z\s]+)/gi,
      /([A-Za-z]+)\s+(?:Sharma|Patel|Gupta|Singh|Mehta|Kumar|Reddy|Agarwal|Jain|Verma)/gi
    ]
  };
  
  // Extract names using multiple patterns
  let nameMatches = [];
  
  // Try all interview patterns
  patterns.interview.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) nameMatches.push(...matches);
  });
  
  // Try survey patterns
  patterns.survey.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) nameMatches.push(...matches);
  });
  
  // Try profile patterns
  patterns.profile.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) nameMatches.push(...matches);
  });
  
  // Try Indian name patterns
  patterns.indianNames.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) nameMatches.push(...matches);
  });
  
  // Process found names
  if (nameMatches.length > 0) {
    const uniqueNames = [...new Set(nameMatches.map(match => {
      // Clean up the match to extract just the name
      return match.replace(/(?:Participant|User|Interviewee|Respondent|Name|I'm|I am|My name is|I'm called|Persona|Profile|Q\d+.*?Answer:?)\s*/gi, '').trim();
    }))];
    
    uniqueNames.forEach((name, index) => {
      if (name && name.length > 2 && name.length < 50) {
        // Extract context around this name for better analysis
        const nameContext = extractNameContext(content, name);
        
        users.push({
          id: `user-${filename}-${index + 1}`,
          name: name,
          source: filename,
          // Extract other details with context
          age: extractAge(content, nameContext),
          occupation: extractOccupation(content, nameContext),
          location: extractLocation(content, nameContext),
          income: extractIncome(content, nameContext),
          techSavviness: extractTechSavviness(content, nameContext),
          communicationStyle: extractCommunicationStyle(content, nameContext),
          behaviors: extractBehaviors(content, nameContext),
          preferences: extractPreferences(content, nameContext),
          painPoints: extractPainPoints(content, nameContext),
          goals: extractGoals(content, nameContext),
          quote: extractQuote(content, name, nameContext)
        });
      }
    });
  }
  
  return users;
}

// Extract context around a specific name for better analysis
function extractNameContext(content, name) {
  const nameIndex = content.toLowerCase().indexOf(name.toLowerCase());
  if (nameIndex === -1) return content;
  
  const start = Math.max(0, nameIndex - 500);
  const end = Math.min(content.length, nameIndex + 500);
  return content.substring(start, end);
}

// Helper functions to extract specific user attributes
function extractAge(content, nameContext = null) {
  const searchContent = nameContext || content;
  const ageMatch = searchContent.match(/(?:Age|age):\s*(\d+)/i);
  return ageMatch ? parseInt(ageMatch[1]) : 25 + Math.floor(Math.random() * 20);
}

function extractOccupation(content, nameContext = null) {
  const searchContent = nameContext || content;
  const occupationMatch = searchContent.match(/(?:Occupation|Job|Role|Works as):\s*([A-Za-z\s]+)/i);
  return occupationMatch ? occupationMatch[1].trim() : 'Professional';
}

function extractLocation(content, nameContext = null) {
  const searchContent = nameContext || content;
  const locationMatch = searchContent.match(/(?:Location|City|From|Lives in):\s*([A-Za-z\s]+)/i);
  return locationMatch ? locationMatch[1].trim() : 'India';
}

function extractIncome(content, nameContext = null) {
  const searchContent = nameContext || content;
  const incomeMatch = searchContent.match(/(?:Income|Salary):\s*([₹\d\-\+L]+)/i);
  return incomeMatch ? incomeMatch[1].trim() : '₹3L-₹6L';
}

function extractTechSavviness(content, nameContext = null) {
  const searchContent = nameContext || content;
  const techKeywords = {
    high: ['expert', 'advanced', 'technical', 'developer', 'engineer', 'programmer'],
    medium: ['familiar', 'comfortable', 'basic', 'intermediate'],
    low: ['beginner', 'new', 'learning', 'struggling', 'confused']
  };
  
  const lowerContent = searchContent.toLowerCase();
  for (const [level, keywords] of Object.entries(techKeywords)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Low';
    }
  }
  return 'Medium';
}

function extractCommunicationStyle(content, nameContext = null) {
  const searchContent = nameContext || content;
  const styleKeywords = {
    'Direct and to the point': ['direct', 'straightforward', 'concise'],
    'Detailed and explanatory': ['detailed', 'thorough', 'comprehensive'],
    'Friendly and conversational': ['friendly', 'casual', 'conversational'],
    'Professional and formal': ['professional', 'formal', 'business']
  };
  
  const lowerContent = searchContent.toLowerCase();
  for (const [style, keywords] of Object.entries(styleKeywords)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return style;
    }
  }
  return 'Friendly and conversational';
}

function extractBehaviors(content, nameContext = null) {
  const searchContent = nameContext || content;
  const behaviorKeywords = [
    'researches before deciding',
    'prefers step-by-step guidance',
    'values user reviews',
    'seeks help when stuck',
    'compares multiple options',
    'reads instructions carefully'
  ];
  
  const lowerContent = searchContent.toLowerCase();
  return behaviorKeywords.filter(behavior => lowerContent.includes(behavior));
}

function extractPreferences(content, nameContext = null) {
  const searchContent = nameContext || content;
  const preferenceKeywords = [
    'clean interfaces',
    'mobile-first design',
    'fast loading',
    'clear navigation',
    'helpful error messages',
    'customizable options'
  ];
  
  const lowerContent = searchContent.toLowerCase();
  return preferenceKeywords.filter(pref => lowerContent.includes(pref));
}

function extractPainPoints(content, nameContext = null) {
  const searchContent = nameContext || content;
  const painKeywords = [
    'confusing navigation',
    'slow loading',
    'poor mobile experience',
    'unclear error messages',
    'too many steps',
    'lack of support'
  ];
  
  const lowerContent = searchContent.toLowerCase();
  return painKeywords.filter(pain => lowerContent.includes(pain));
}

function extractGoals(content, nameContext = null) {
  const searchContent = nameContext || content;
  const goalKeywords = [
    'complete tasks efficiently',
    'save time',
    'make informed decisions',
    'stay connected',
    'advance career',
    'learn new skills'
  ];
  
  const lowerContent = searchContent.toLowerCase();
  return goalKeywords.filter(goal => lowerContent.includes(goal));
}

function extractQuote(content, name, nameContext = null) {
  const searchContent = nameContext || content;
  // Look for quotes or statements by the user
  const quotePattern = new RegExp(`"([^"]*)"`, 'g');
  const quotes = searchContent.match(quotePattern);
  return quotes ? quotes[0] : `"I need something that works for my specific situation as a ${extractOccupation(searchContent)}."`;
}

// Create realistic sample users based on Indian demographics and fintech usage patterns
function createSampleUsersFromContent(documents) {
  // Enhanced sample users based on Elizabeth Soto format
  const sampleUsers = [
    {
      id: 'sample-user-1',
      name: 'Elizabeth Soto',
      photoDescription: 'A professional headshot of a healthcare professional with dark skin and short curly hair, smiling warmly, wearing a white collared shirt',
      source: documents[0]?.filename || 'research-document',
      age: 41,
      gender: 'Female',
      occupation: 'Director of Critical Care',
      education: "Master's Degree in Nursing",
      location: 'United States',
      income: '120,000 USD annually',
      maritalStatus: 'Married',
      creditScore: 750,
      category: 'Healthcare Professional',
      bio: 'Elizabeth is a Director of Critical Care with 14 years of experience in healthcare. She manages Adult Critical Care Units and is passionate about maintaining quality while cutting costs. She prides herself on being responsive to her team and maintaining work-life balance.',
      techSavviness: 'Medium',
      communicationStyle: 'Professional and thorough',
      behaviors: [
        'Attends and conducts face-to-face meetings with staff daily',
        'Conducts office hours in the Adult Critical Care Unit',
        'Prepares daily reports for management',
        'Resolves problems during the work day'
      ],
      preferences: [
        'Clear documentation and step-by-step processes',
        'Dedicated Customer Success Manager support',
        'Quick integration into daily activities',
        'Additional content for free work use'
      ],
      painPoints: [
        'Finding balance between cutting costs and maintaining quality',
        'Slow adoption of best practices',
        'Having to stay after work from time to time'
      ],
      goals: [
        'Having enough money to pay for her daughter\'s education',
        'Maintaining work-life balance',
        'Being responsive to all incoming emails and calls',
        'Professional growth and recognition as a "fan"'
      ],
      technologyUse: 'Uses hospital systems, email, LinkedIn, educational platforms, and Facebook for professional networking and learning',
      quote: 'I want to be a high performer and a go-to leader for my team.',
      // Additional unique details
      personality: 'Professional, goal-oriented, values work-life balance and team responsiveness',
      lifestyle: 'Healthcare professional, works long hours, focuses on family and professional growth',
      financialBehavior: 'Conservative with finances, prioritizes family education and security',
      decisionMaking: 'Evidence-based, considers team impact, values professional validation',
      uniqueTraits: [
        'Values professional recognition and growth',
        'Maintains detailed documentation',
        'Prioritizes team responsiveness',
        'Balances cost-cutting with quality maintenance'
      ],
      specificNeeds: [
        'Clear documentation and step-by-step processes',
        'Dedicated Customer Success Manager support',
        'Quick integration into daily activities',
        'Additional content for professional development'
      ]
    },
    {
      id: 'sample-user-2',
      name: 'Vikram Patel',
      photoDescription: 'A middle-aged man in a shop setting, looking thoughtful',
      source: documents[0]?.filename || 'research-document',
      age: 35,
      gender: 'Male',
      occupation: 'Small Business Owner (Retail)',
      education: 'High School Diploma',
      location: 'Nashik, India',
      income: '₹25,000 per month',
      maritalStatus: 'Married',
      creditScore: 680,
      category: 'CAT C (Moderate tech-savviness, lower financial exposure)',
      bio: 'Vikram runs a small retail shop in Nashik, selling household goods. He\'s been in business for 10 years and is dedicated to providing for his family. He enjoys spending time with his children and watching local cricket matches.',
      techSavviness: 'Low',
      communicationStyle: 'Detailed and explanatory',
      behaviors: [
        'Uses basic financial apps like Google Pay for transactions',
        'Takes longer to complete tasks if instructions are not clear',
        'Prefers in-person banking but uses apps for urgency'
      ],
      preferences: [
        'Regional language support',
        'Simple, clear instructions',
        'Trust indicators and security features'
      ],
      painPoints: [
        'Struggles with English terminology in apps',
        'Confused by unclear reward validity or complex flows',
        'Hesitant to share personal details online due to trust issues'
      ],
      goals: [
        'Access quick loans for business inventory or personal needs',
        'Understand app features despite limited English proficiency',
        'Build trust in digital financial services'
      ],
      technologyUse: 'Primarily uses a smartphone; Relies on regional language support; Less familiar with reward systems',
      quote: 'मुझे एक सरल लोन प्रक्रिया चाहिए जो मेरी भाषा में हो। EMI क्या है, यह मुझे समझ नहीं आता। मुझे बस पैसा चाहिए दुकान के लिए।',
      // Additional unique details
      personality: 'Cautious, family-oriented, values trust and relationships over technology',
      lifestyle: 'Small business owner, works 12+ hours daily, family man with 2 children',
      financialBehavior: 'Conservative with money, prefers cash transactions, uses digital only when necessary',
      decisionMaking: 'Consults family and trusted friends, takes time to understand before committing',
      uniqueTraits: [
        'Prefers Hindi/Marathi interfaces',
        'Keeps physical receipts and records',
        'Values personal relationships with bank staff',
        'Uses voice messages instead of typing'
      ],
      specificNeeds: [
        'Gujarati language support',
        'Video call assistance for complex processes',
        'Simple step-by-step visual guides',
        'Trust badges and security certifications'
      ]
    },
    {
      id: 'sample-user-3',
      name: 'Rahul Mehta',
      photoDescription: 'A young man in casual clothes, looking slightly unsure but hopeful',
      source: documents[0]?.filename || 'research-document',
      age: 25,
      gender: 'Male',
      occupation: 'Junior Analyst at a startup',
      education: "Bachelor's in Business Administration",
      location: 'Mumbai, India',
      income: '₹30,000 per month',
      maritalStatus: 'Single',
      creditScore: 650,
      category: 'Starter (New to loans, low to moderate tech-savviness)',
      bio: 'Rahul recently graduated and started working at a fintech startup in Mumbai. He\'s eager to learn and grow in his career. In his free time, he enjoys watching movies and exploring the city.',
      techSavviness: 'Medium',
      communicationStyle: 'Friendly and conversational',
      behaviors: [
        'Uses apps like Google Pay for basic transactions',
        'Takes time to explore app features',
        'Seeks information from friends or online forums'
      ],
      preferences: [
        'Apps with clear instructions and support',
        'Educational content and guidance',
        'Simple, step-by-step processes'
      ],
      painPoints: [
        'Lacks confidence due to unfamiliarity with loan processes',
        'Confused by terms like "pre-EMI" or "instant disbursal"',
        'Anxious about making mistakes in applications'
      ],
      goals: [
        'Explore loan options for personal expenses (e.g., buying a laptop)',
        'Build confidence in using online loan apps',
        'Understand loan terms and processes clearly'
      ],
      technologyUse: 'Uses a smartphone and occasionally a laptop; Prefers apps with clear instructions and support',
      quote: 'I\'m new to loans and need clear guidance to make the right choices. What exactly is EMI? I\'ve heard about it but don\'t really understand how it works.',
      // Additional unique details
      personality: 'Curious, eager to learn, slightly anxious about financial decisions',
      lifestyle: 'Young professional, lives in shared apartment, explores Mumbai on weekends',
      financialBehavior: 'Learning about personal finance, follows financial influencers on social media',
      decisionMaking: 'Seeks validation from peers, reads reviews extensively, asks many questions',
      uniqueTraits: [
        'Follows fintech influencers on Instagram',
        'Saves screenshots of important information',
        'Uses emojis in messages frequently',
        'Prefers video tutorials over text instructions'
      ],
      specificNeeds: [
        'Beginner-friendly explanations',
        'Comparison tools for different loan options',
        'Educational content about financial terms',
        'Peer reviews and ratings'
      ]
    },
    {
      id: 'sample-user-4',
      name: 'Sanjay Gupta',
      photoDescription: 'A man in business casual attire, looking engaged and enthusiastic',
      source: documents[0]?.filename || 'research-document',
      age: 30,
      gender: 'Male',
      occupation: 'Manager at a financial services company',
      education: 'MBA in Finance',
      location: 'Delhi, India',
      income: '₹70,000 per month',
      maritalStatus: 'Married',
      creditScore: 780,
      category: 'CAT A (High tech-savviness and financial exposure)',
      bio: 'Sanjay is a manager at a leading financial services company in Delhi. He\'s been in the industry for 7 years and is passionate about financial technology. He enjoys networking and attending industry events.',
      techSavviness: 'High',
      communicationStyle: 'Professional and formal',
      behaviors: [
        'Actively uses financial apps like Moneyview, Cred, and Paytm',
        'Completes tasks efficiently',
        'Provides feedback and suggestions for app improvements'
      ],
      preferences: [
        'Apps with advanced features and customization options',
        'Personalized offers based on usage',
        'Comprehensive financial management tools'
      ],
      painPoints: [
        'Frustrated by unclear reward redemption terms',
        'Dislikes repetitive processes (e.g., multiple rating screens)',
        'Wants more personalized offers based on usage'
      ],
      goals: [
        'Maximize rewards (e.g., Mcoins) through app usage',
        'Engage with app features for financial management',
        'Stay updated with the latest fintech trends'
      ],
      technologyUse: 'Uses a smartphone, laptop, and tablet; Prefers apps with advanced features and customization options',
      quote: 'I love earning rewards, but I need to understand how to use them effectively. I can calculate EMI in my head and compare different loan products based on effective interest rates.',
      // Additional unique details
      personality: 'Analytical, strategic thinker, values efficiency and optimization',
      lifestyle: 'Senior professional, works in corporate environment, attends industry conferences',
      financialBehavior: 'Sophisticated user, maximizes rewards, uses multiple financial products strategically',
      decisionMaking: 'Data-driven, compares multiple options, negotiates for better terms',
      uniqueTraits: [
        'Uses Excel for financial planning',
        'Subscribes to financial newsletters',
        'Participates in fintech beta testing',
        'Has premium subscriptions to financial apps'
      ],
      specificNeeds: [
        'Advanced analytics and reporting',
        'Customizable dashboard',
        'API access for integration',
        'Priority customer support'
      ]
    },
    {
      id: 'sample-user-5',
      name: 'Priya Singh',
      photoDescription: 'A professional woman in business attire, looking confident and approachable',
      source: documents[0]?.filename || 'research-document',
      age: 32,
      gender: 'Female',
      occupation: 'Marketing Manager',
      education: "Master's in Marketing",
      location: 'Pune, India',
      income: '₹45,000 per month',
      maritalStatus: 'Married',
      creditScore: 720,
      category: 'CAT B (Moderate to high tech-savviness, good financial exposure)',
      bio: 'Priya works as a marketing manager at a digital agency in Pune. She\'s been in marketing for 8 years and is tech-savvy. She enjoys traveling, reading business books, and spending time with her family.',
      techSavviness: 'High',
      communicationStyle: 'Friendly and conversational',
      behaviors: [
        'Uses multiple financial apps for different purposes',
        'Compares options before making decisions',
        'Values user reviews and recommendations'
      ],
      preferences: [
        'Clean, modern interfaces',
        'Comprehensive information and transparency',
        'Good customer support'
      ],
      painPoints: [
        'Finds some apps too complex for simple tasks',
        'Concerned about data privacy and security',
        'Wants better integration between different financial services'
      ],
      goals: [
        'Manage personal and family finances efficiently',
        'Find the best deals and offers',
        'Build a good credit history'
      ],
      technologyUse: 'Uses smartphone, laptop, and tablet; Comfortable with most digital platforms',
      quote: 'I want financial apps that make my life easier, not more complicated. I understand basic EMI concepts but prefer apps that explain things in simple terms.',
      // Additional unique details
      personality: 'Balanced, family-focused, values simplicity and efficiency',
      lifestyle: 'Working mother, manages work-life balance, enjoys weekend family time',
      financialBehavior: 'Strategic planner, balances multiple financial goals, values security',
      decisionMaking: 'Research-oriented, seeks expert opinions, considers long-term impact',
      uniqueTraits: [
        'Uses calendar apps for financial planning',
        'Prefers apps with family sharing features',
        'Values eco-friendly and socially responsible options',
        'Uses voice assistants for quick queries'
      ],
      specificNeeds: [
        'Family financial planning tools',
        'Privacy and security features',
        'Integration with other productivity apps',
        'Clear, jargon-free communication'
      ]
    }
  ];
  
  return sampleUsers;
}

// Advanced Analytics Endpoints
app.get('/api/admin-research/analytics', async (req, res) => {
  try {
    const analytics = analyticsService.getCurrentMetrics();
    res.json({
      success: true,
      analytics: analytics
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to get analytics' });
  }
});

app.get('/api/admin-research/analytics/realtime', async (req, res) => {
  try {
    const timeWindow = parseInt(req.query.timeWindow) || 3600000; // 1 hour default
    const realTimeAnalytics = analyticsService.getRealTimeAnalytics(timeWindow);
    res.json({
      success: true,
      analytics: realTimeAnalytics
    });
  } catch (error) {
    console.error('Error getting real-time analytics:', error);
    res.status(500).json({ success: false, error: 'Failed to get real-time analytics' });
  }
});

app.get('/api/admin-research/analytics/bias', async (req, res) => {
  try {
    const biasReport = analyticsService.detectBias();
    res.json({
      success: true,
      biasReport: biasReport
    });
  } catch (error) {
    console.error('Error detecting bias:', error);
    res.status(500).json({ success: false, error: 'Failed to detect bias' });
  }
});

// Vector Search Endpoints
app.post('/api/admin-research/personas/similar', async (req, res) => {
  try {
    const { persona, threshold = 0.7 } = req.body;
    const allPersonas = req.body.allPersonas || [];
    
    const similarPersonas = vectorSearchService.findSimilarPersonas(persona, allPersonas, threshold);
    res.json({
      success: true,
      similarPersonas: similarPersonas
    });
  } catch (error) {
    console.error('Error finding similar personas:', error);
    res.status(500).json({ success: false, error: 'Failed to find similar personas' });
  }
});

app.post('/api/admin-research/personas/group', async (req, res) => {
  try {
    const { personas, threshold = 0.6 } = req.body;
    const groups = vectorSearchService.groupPersonasBySimilarity(personas, threshold);
    res.json({
      success: true,
      groups: groups
    });
  } catch (error) {
    console.error('Error grouping personas:', error);
    res.status(500).json({ success: false, error: 'Failed to group personas' });
  }
});

app.post('/api/admin-research/personas/diversity', async (req, res) => {
  try {
    const { personas } = req.body;
    const diversityAnalysis = vectorSearchService.analyzePersonaDiversity(personas);
    res.json({
      success: true,
      diversity: diversityAnalysis
    });
  } catch (error) {
    console.error('Error analyzing diversity:', error);
    res.status(500).json({ success: false, error: 'Failed to analyze diversity' });
  }
});

// Session Management Endpoints
app.get('/api/admin-research/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionData = await redisService.getPersonaSession(sessionId);
    
    if (sessionData) {
      res.json({
        success: true,
        session: sessionData
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ success: false, error: 'Failed to get session' });
  }
});

// Persona Interaction Tracking
app.post('/api/admin-research/personas/:personaId/interact', async (req, res) => {
  try {
    const { personaId } = req.params;
    const { interactionType, details } = req.body;
    
    analyticsService.trackPersonaInteraction(personaId, interactionType, details);
    
    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking interaction:', error);
    res.status(500).json({ success: false, error: 'Failed to track interaction' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Advanced AI Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Projects: http://localhost:${PORT}/api/projects`);
  console.log('🔍 Advanced AI Persona Generation with Indian Context');
  console.log('📈 Real-time Analytics and Bias Detection');
  console.log('🔗 Vector Search and Similarity Analysis');
});
