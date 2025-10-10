const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 7501;

// Middleware
app.use(cors({
  origin: ['http://localhost:2000', 'http://localhost:3000', 'http://localhost:5001', 'http://localhost:7500'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
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
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log(`Uploading file: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  }
});

// Human-like agent data
const humanAgents = {
  'priya-sharma': {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    demographics: {
      age: 28,
      location: 'Bangalore',
      occupation: 'Software Engineer',
      familyStatus: 'single',
      education: 'B.Tech Computer Science',
      income: '₹8L-₹12L',
      techSavviness: 'expert',
      englishLiteracy: 'native'
    },
    personality: {
      traits: ['analytical', 'curious', 'helpful', 'detail-oriented', 'innovative', 'tech-savvy'],
      communicationStyle: 'conversational',
      emotionalTendency: 'expressive'
    },
    background: {
      workExperience: '5+ years in fintech startups',
      goals: ['build innovative products', 'advance career', 'learn new technologies'],
      concerns: ['work-life balance', 'keeping up with tech trends']
    },
    speakingPatterns: [
      'I love how this works technically',
      'From my experience in fintech...',
      'This is really interesting from a UX perspective',
      'I can see potential improvements here',
      'The technical architecture looks solid',
      'This reminds me of similar challenges I\'ve faced'
    ],
    confusionResponses: [
      'I need more context to understand this properly',
      'Could you explain the technical requirements?',
      'I\'m not sure about the implementation details'
    ],
    excitementResponses: [
      'This is brilliant! I love the approach',
      'Wow, this is exactly what I was looking for',
      'This is so much better than what I\'ve seen before'
    ]
  },
  'rajesh-kumar': {
    id: 'rajesh-kumar',
    name: 'Rajesh Kumar',
    demographics: {
      age: 45,
      location: 'Mumbai',
      occupation: 'Small Business Owner',
      familyStatus: 'married',
      education: 'High School',
      income: '₹4L-₹6L',
      techSavviness: 'low',
      englishLiteracy: 'basic'
    },
    personality: {
      traits: ['cautious', 'practical', 'family-oriented', 'traditional', 'hardworking'],
      communicationStyle: 'direct',
      emotionalTendency: 'reserved'
    },
    background: {
      workExperience: '20+ years running small business',
      goals: ['provide for family', 'grow business safely', 'learn new skills gradually'],
      concerns: ['data security', 'making mistakes', 'wasting money', 'family safety']
    },
    speakingPatterns: [
      'मुझे यह समझ नहीं आ रहा',
      'यह safe है ना?',
      'मैं गलती नहीं करना चाहता',
      'क्या आप help कर सकते हैं?',
      'मेरे family के लिए ठीक होगा ना?',
      'यह बहुत complicated लग रहा है',
      'मुझे simple चीजें पसंद हैं'
    ],
    confusionResponses: [
      'मुझे समझ नहीं आ रहा। क्या आप explain कर सकते हैं?',
      'यह कैसे काम करता है?',
      'मैं confused हूं। Help कर सकते हैं?'
    ],
    excitementResponses: [
      'यह तो अच्छा है!',
      'मुझे यह पसंद है',
      'बहुत बढ़िया!'
    ]
  },
  'sneha-patel': {
    id: 'sneha-patel',
    name: 'Sneha Patel',
    demographics: {
      age: 32,
      location: 'Delhi',
      occupation: 'Marketing Manager',
      familyStatus: 'married',
      education: 'MBA Marketing',
      income: '₹6L-₹8L',
      techSavviness: 'medium',
      englishLiteracy: 'fluent'
    },
    personality: {
      traits: ['creative', 'social', 'organized', 'ambitious', 'detail-oriented'],
      communicationStyle: 'conversational',
      emotionalTendency: 'expressive'
    },
    background: {
      workExperience: '8+ years in digital marketing',
      goals: ['grow career', 'learn new skills', 'balance work and family'],
      concerns: ['staying relevant', 'work-life balance', 'team management']
    },
    speakingPatterns: [
      'From a marketing perspective, this looks great',
      'I can see how this would appeal to customers',
      'This is really user-friendly, which is important',
      'I like how this simplifies the process',
      'This could really help with customer engagement'
    ],
    confusionResponses: [
      'I\'m not sure I understand the target audience',
      'Could you explain the marketing strategy?',
      'I need more details about the user journey'
    ],
    excitementResponses: [
      'This is perfect for our target market!',
      'I love how user-friendly this is',
      'This will definitely improve customer satisfaction'
    ]
  }
};

// Chat sessions storage
const chatSessions = new Map();

// AI Agent storage (in-memory for now)
const aiAgents = new Map();
const uploads = new Map();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Human-like AI Chat System is running'
  });
});

app.get('/api/projects', (req, res) => {
  console.log('📋 Returning 1 projects');
  res.json({
    success: true,
    projects: [
      {
        id: 'project-1',
        name: 'UX Research Chat System',
        description: 'AI-powered dual-agent chat for UX research',
        status: 'active',
        currentStage: 'USER_RESEARCH',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedUsers: {
          PM: ['1'],
          RESEARCHER: ['2'],
          UX_DESIGNER: ['3'],
          UI_DESIGNER: ['4'],
          VISUAL_DESIGNER: ['5'],
          UX_WRITER: ['6'],
          DEVELOPER: ['7']
        },
        approvals: []
      }
    ]
  });
});

// Get all human-like agents
app.get('/api/agents', (req, res) => {
  try {
    const agents = Object.values(humanAgents);
    console.log(`🤖 Returning ${agents.length} human-like agents`);
    res.json({ success: true, agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Create chat session
app.post('/api/chat/session', (req, res) => {
  try {
    const { agentIds } = req.body;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session = {
      id: sessionId,
      agentIds: agentIds || ['priya-sharma', 'rajesh-kumar'],
      messages: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    chatSessions.set(sessionId, session);
    
    console.log(`💬 Created chat session: ${sessionId}`);
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Send message to agent
app.post('/api/chat/message', (req, res) => {
  try {
    const { sessionId, agentId, input } = req.body;
    
    if (!sessionId || !agentId || !input) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const agent = humanAgents[agentId];
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Generate human-like response
    const response = generateHumanResponse(agent, input.text || 'Please analyze this image and provide feedback.');
    const emotion = detectEmotion(response, agent);
    const confidence = calculateConfidence(response, agent);

    const responseData = {
      message: response,
      confidence,
      emotion,
      reasoning: generateReasoning(agent, response),
      designFeedback: input.image ? generateDesignFeedback(agent, response) : undefined
    };

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      content: response,
      type: input.image ? 'image' : 'text',
      timestamp: new Date(),
      metadata: {
        confidence,
        emotion,
        hesitation: confidence < 0.6,
        reasoning: responseData.reasoning
      },
      attachments: input.image ? [{
        type: 'image',
        url: typeof input.image === 'string' ? input.image : 'data:image/jpeg;base64,' + input.image,
        description: 'User uploaded image'
      }] : undefined
    };

    session.messages.push(message);
    session.updatedAt = new Date();

    console.log(`💬 ${agent.name} responded: ${response.substring(0, 50)}...`);
    res.json({ response: responseData, message });
  } catch (error) {
    console.error('Message processing error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    console.log('General file upload request received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const mimeType = req.file.mimetype;
    
    let category = 'document';
    if (mimeType.startsWith('image/')) category = 'image';
    else if (mimeType.startsWith('video/')) category = 'video';
    else if (mimeType.startsWith('audio/')) category = 'audio';
    else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExtension)) category = 'archive';
    else if (['js', 'css', 'html', 'xml', 'json'].includes(fileExtension)) category = 'code';
    else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'].includes(fileExtension)) category = 'document';
    
    const uploadedFile = {
      id: Date.now() + Math.random(),
      name: req.file.originalname,
      size: req.file.size,
      type: fileExtension,
      mimeType: mimeType,
      category: category,
      uploadedAt: new Date().toISOString(),
      path: req.file.path,
      status: 'UPLOADED',
      canProcess: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'rtf', 'jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)
    };

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: uploadedFile
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// Excel agent creation
app.post('/api/agents/upload-excel', upload.single('excelFile'), async (req, res) => {
  try {
    console.log('Excel file upload request received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No Excel file uploaded' });
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (!['.xlsx', '.xls'].includes(fileExtension)) {
      return res.status(400).json({ error: 'Only Excel files (.xlsx, .xls) are supported for agent creation' });
    }

    console.log('Reading Excel file from:', req.file.path);
    const workbook = XLSX.readFile(req.file.path);
    console.log('Workbook sheets:', workbook.SheetNames);
    
    const agents = [];
    const sheets = [];

    workbook.SheetNames.forEach(sheetName => {
      console.log('Processing sheet:', sheetName);
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log('Sheet data length:', jsonData.length);
      
      if (jsonData.length === 0) return;

      const headers = jsonData[0];
      const rows = jsonData.slice(1);
      
      console.log('Headers:', headers);
      console.log('Rows count:', rows.length);
      
      const data = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      sheets.push({
        sheetName,
        headers,
        data
      });

      data.forEach((rowData, index) => {
        console.log(`Creating agent from row ${index + 1}:`, rowData);
        const agent = createAgentFromRowData(rowData, sheetName, index);
        if (agent) {
          agents.push(agent);
          console.log('Created agent:', agent.name);
        }
      });
    });

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Successfully created ${agents.length} agents from ${sheets.length} sheets`,
      agents,
      sheets: sheets.map(sheet => ({
        name: sheet.sheetName,
        agentCount: sheet.data.length,
        headers: sheet.headers
      })),
      summary: {
        totalAgents: agents.length,
        totalSheets: sheets.length,
        agentsBySheet: sheets.map(sheet => ({
          sheetName: sheet.sheetName,
          count: sheet.data.length
        }))
      }
    });
  } catch (error) {
    console.error('Excel upload error:', error);
    res.status(500).json({ error: 'Failed to process Excel file: ' + error.message });
  }
});

// Excel template download
app.get('/api/agents/excel-template', (req, res) => {
  try {
    console.log('Generating Excel template...');
    
    const templateData = [
      {
        'Name': 'Priya Sharma',
        'Age': 28,
        'Location': 'Bangalore',
        'Occupation': 'Software Engineer',
        'Tech Savviness': 'expert',
        'English Literacy': 'native',
        'Personality Traits': 'analytical,curious,helpful',
        'Background': '5+ years in fintech startups',
        'Goals': 'build innovative products,advance career',
        'Concerns': 'work-life balance,keeping up with tech trends'
      },
      {
        'Name': 'Rajesh Kumar',
        'Age': 45,
        'Location': 'Mumbai',
        'Occupation': 'Small Business Owner',
        'Tech Savviness': 'low',
        'English Literacy': 'basic',
        'Personality Traits': 'cautious,practical,family-oriented',
        'Background': '20+ years running small business',
        'Goals': 'provide for family,grow business safely',
        'Concerns': 'data security,making mistakes,wasting money'
      }
    ];

    console.log('Creating worksheet...');
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agents');
    
    console.log('Writing Excel buffer...');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    console.log('Buffer size:', buffer.length);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=agent-template.xlsx');
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error('Template generation error:', error);
    res.status(500).json({ error: 'Failed to generate template: ' + error.message });
  }
});

// Helper functions for human-like responses
function generateHumanResponse(agent, userMessage) {
  const { demographics, personality, speakingPatterns, confusionResponses, excitementResponses } = agent;
  
  // Analyze user message for context
  const lowerMessage = userMessage.toLowerCase();
  const isQuestion = lowerMessage.includes('?') || lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('why');
  const isConfused = lowerMessage.includes('confused') || lowerMessage.includes('help') || lowerMessage.includes('explain');
  const isExcited = lowerMessage.includes('great') || lowerMessage.includes('amazing') || lowerMessage.includes('love');
  
  // Generate response based on agent personality and context
  if (demographics.techSavviness === 'low' && demographics.englishLiteracy === 'basic') {
    // Novice user with basic English - use Hinglish
    if (isConfused) {
      return confusionResponses[Math.floor(Math.random() * confusionResponses.length)];
    } else if (isExcited) {
      return excitementResponses[Math.floor(Math.random() * excitementResponses.length)];
    } else {
      return speakingPatterns[Math.floor(Math.random() * speakingPatterns.length)];
    }
  } else if (demographics.techSavviness === 'expert') {
    // Tech-savvy user - use technical language
    if (isQuestion) {
      return 'That\'s a great question! From a technical perspective, I can see several interesting aspects here. What specific part are you most curious about?';
    } else if (isConfused) {
      return 'I need more context to give you a proper technical analysis. Could you provide more details about the requirements?';
    } else {
      return speakingPatterns[Math.floor(Math.random() * speakingPatterns.length)];
    }
  } else {
    // Medium tech level - balanced approach
    if (isQuestion) {
      return 'I can see what you\'re asking about. Could you explain a bit more about what you\'re looking for?';
    } else if (isConfused) {
      return 'I\'m not entirely sure I understand. Could you help me with more context?';
    } else {
      return speakingPatterns[Math.floor(Math.random() * speakingPatterns.length)];
    }
  }
}

function detectEmotion(message, agent) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('confused') || lowerMessage.includes('समझ नहीं') || 
      lowerMessage.includes('complicated') || lowerMessage.includes('help')) {
    return 'confused';
  }
  
  if (lowerMessage.includes('safe') || lowerMessage.includes('mistake') || 
      lowerMessage.includes('worried') || lowerMessage.includes('concerned') ||
      lowerMessage.includes('family') || lowerMessage.includes('children')) {
    return 'concerned';
  }
  
  if (lowerMessage.includes('great') || lowerMessage.includes('amazing') || 
      lowerMessage.includes('love') || lowerMessage.includes('brilliant') ||
      lowerMessage.includes('अच्छा') || lowerMessage.includes('बढ़िया')) {
    return 'excited';
  }
  
  if (lowerMessage.includes('frustrated') || lowerMessage.includes('annoying') || 
      lowerMessage.includes('difficult') || lowerMessage.includes('problem')) {
    return 'frustrated';
  }
  
  if (lowerMessage.includes('how') || lowerMessage.includes('why') || 
      lowerMessage.includes('what') || lowerMessage.includes('explain') ||
      lowerMessage.includes('कैसे') || lowerMessage.includes('क्यों')) {
    return 'curious';
  }
  
  return 'neutral';
}

function calculateConfidence(message, agent) {
  let confidence = 0.7; // Base confidence
  
  // Adjust based on agent personality
  if (agent.personality.traits.includes('confident')) {
    confidence += 0.1;
  }
  if (agent.personality.traits.includes('cautious')) {
    confidence -= 0.1;
  }
  
  // Adjust based on response characteristics
  if (message.includes('?')) {
    confidence -= 0.1; // Questions indicate uncertainty
  }
  if (message.includes('I think') || message.includes('maybe') || message.includes('perhaps')) {
    confidence -= 0.1; // Hedging language indicates uncertainty
  }
  if (message.includes('definitely') || message.includes('certainly') || message.includes('absolutely')) {
    confidence += 0.1; // Strong language indicates confidence
  }
  
  return Math.max(0.1, Math.min(1.0, confidence));
}

function generateReasoning(agent, response) {
  const { personality, background } = agent;
  
  let reasoning = 'Based on my personal experience';
  
  if (background.workExperience) {
    reasoning += ` and ${background.workExperience}`;
  }
  
  if (personality.traits.includes('analytical')) {
    reasoning += ', I analyzed this carefully';
  }
  
  if (personality.traits.includes('practical')) {
    reasoning += ' and considered the practical implications';
  }
  
  return reasoning;
}

function generateDesignFeedback(agent, response) {
  const { demographics, personality } = agent;
  
  // Generate feedback scores based on agent's perspective
  const usability = demographics.techSavviness === 'low' ? 0.3 + Math.random() * 0.4 : 0.6 + Math.random() * 0.4;
  const aesthetics = personality.traits.includes('creative') ? 0.7 + Math.random() * 0.3 : 0.5 + Math.random() * 0.5;
  const functionality = 0.6 + Math.random() * 0.4;
  const accessibility = demographics.techSavviness === 'low' ? 0.8 + Math.random() * 0.2 : 0.5 + Math.random() * 0.5;
  const overall = (usability + aesthetics + functionality + accessibility) / 4;
  
  return {
    usability,
    aesthetics,
    functionality,
    accessibility,
    overall,
    comments: response
  };
}

function createAgentFromRowData(rowData, sheetName, index) {
  try {
    const agentId = `agent_${sheetName}_${index}_${Date.now()}`;
    
    return {
      id: agentId,
      name: rowData.Name || `Agent ${index + 1}`,
      demographics: {
        age: parseInt(rowData.Age) || 30,
        location: rowData.Location || 'Unknown',
        occupation: rowData.Occupation || 'Unknown',
        familyStatus: 'unknown',
        education: 'Unknown',
        income: 'Unknown',
        techSavviness: rowData['Tech Savviness'] || 'medium',
        englishLiteracy: rowData['English Literacy'] || 'intermediate'
      },
      personality: {
        traits: (rowData['Personality Traits'] || '').split(',').map(t => t.trim()).filter(t => t),
        communicationStyle: 'conversational',
        emotionalTendency: 'neutral'
      },
      background: {
        workExperience: rowData.Background || 'Unknown',
        goals: (rowData.Goals || '').split(',').map(g => g.trim()).filter(g => g),
        concerns: (rowData.Concerns || '').split(',').map(c => c.trim()).filter(c => c)
      },
      speakingPatterns: [
        'I can see what you\'re asking about',
        'From my experience, this looks interesting',
        'I have some thoughts about this',
        'This is worth considering'
      ],
      confusionResponses: [
        'I\'m not sure I understand completely',
        'Could you explain more about this?',
        'I need more context to help properly'
      ],
      excitementResponses: [
        'This looks really promising!',
        'I\'m excited about this approach',
        'This could be very useful'
      ]
    };
  } catch (error) {
    console.error('Error creating agent from row data:', error);
    return null;
  }
}

// AI Agent Upload Routes
app.post('/api/agent-upload/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Processing uploaded file: ${req.file.originalname}`);
    
    // Generate upload ID
    const uploadId = uuidv4();
    
    // Parse the uploaded file
    const participants = await parseTranscriptFile(req.file.path);
    
    if (participants.length === 0) {
      return res.status(400).json({ error: 'No valid participants found in file' });
    }

    // Create upload record
    uploads.set(uploadId, {
      id: uploadId,
      filename: req.file.originalname,
      participantCount: participants.length,
      processedCount: 0,
      status: 'processing',
      createdAt: new Date()
    });
    
    // Process participants in background
    processParticipantsAsync(uploadId, participants, req.file.path);
    
    res.json({
      success: true,
      uploadId,
      participantCount: participants.length,
      status: 'processing',
      message: 'File uploaded successfully. Processing participants...'
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/agent-upload/status/:uploadId
app.get('/api/agent-upload/status/:uploadId', (req, res) => {
  try {
    const { uploadId } = req.params;
    const status = uploads.get(uploadId);
    
    if (!status) {
      return res.status(404).json({ error: 'Upload not found' });
    }
    
    res.json({
      uploadId: status.id,
      filename: status.filename,
      participantCount: status.participantCount,
      processedCount: status.processedCount,
      status: status.status,
      progress: Math.round((status.processedCount / status.participantCount) * 100),
      createdAt: status.createdAt,
      completedAt: status.completedAt
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get upload status' });
  }
});

// GET /api/agent-upload/agents
app.get('/api/agent-upload/agents', (req, res) => {
  try {
    const agents = Array.from(aiAgents.values());
    
    res.json({
      success: true,
      agents: agents,
      count: agents.length
    });
    
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// AI Agent Chat Routes
app.post('/api/agent-chat/start', (req, res) => {
  try {
    const { agentId, userId } = req.body;
    
    if (!agentId || !userId) {
      return res.status(400).json({ error: 'agentId and userId are required' });
    }
    
    // Get agent
    const agent = aiAgents.get(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Create chat session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    chatSessions.set(sessionId, {
      id: sessionId,
      agentId,
      userId,
      createdAt: new Date()
    });
    
    // Generate initial greeting
    const greeting = generateInitialGreeting(agent);
    
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
        tech_comfort: agent.tech_behavior?.actual_tech_comfort || 5,
        personality_traits: agent.personality_traits || []
      },
      firstMessage: greeting
    });
    
  } catch (error) {
    console.error('Error starting chat session:', error);
    res.status(500).json({ error: 'Failed to start chat session' });
  }
});

app.post('/api/agent-chat/message', (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }
    
    // Get session
    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Get agent
    const agent = aiAgents.get(session.agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Generate response using agent's personality
    const response = generateAgentResponse(agent, message);
    const delay = calculateResponseDelay(message, response);
    const emotion = detectEmotion(response);
    
    res.json({
      success: true,
      response: response,
      delay: delay,
      emotion: emotion,
      confidence: 0.8,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

app.get('/api/agent-chat/agents', (req, res) => {
  try {
    const agents = Array.from(aiAgents.values());
    
    res.json({
      success: true,
      agents: agents,
      count: agents.length
    });
    
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// Helper functions for AI Agent system
async function parseTranscriptFile(filePath) {
  const fileExt = path.extname(filePath).toLowerCase();
  
  if (fileExt === '.csv') {
    return parseCSVFile(filePath);
  } else {
    return parseExcelFile(filePath);
  }
}

function parseExcelFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      throw new Error('File must have at least a header row and one data row');
    }
    
    const headers = jsonData[0];
    const rows = jsonData.slice(1);
    
    // Expected columns: Participant, Category, Age, Occupation, Full_Transcript
    const participantIndex = headers.findIndex(h => 
      h && h.toLowerCase().includes('participant')
    );
    const categoryIndex = headers.findIndex(h => 
      h && h.toLowerCase().includes('category')
    );
    const ageIndex = headers.findIndex(h => 
      h && h.toLowerCase().includes('age')
    );
    const occupationIndex = headers.findIndex(h => 
      h && h.toLowerCase().includes('occupation')
    );
    const transcriptIndex = headers.findIndex(h => 
      h && h.toLowerCase().includes('transcript')
    );
    
    if (participantIndex === -1 || transcriptIndex === -1) {
      throw new Error('Required columns not found. Expected: Participant, Full_Transcript');
    }
    
    const participants = rows
      .filter(row => row[participantIndex] && row[transcriptIndex])
      .map(row => ({
        participant: row[participantIndex]?.toString().trim() || 'Unknown',
        category: row[categoryIndex]?.toString().trim() || 'General',
        age: parseInt(row[ageIndex]) || 30,
        occupation: row[occupationIndex]?.toString().trim() || 'Unknown',
        transcript: row[transcriptIndex]?.toString().trim() || ''
      }));
    
    console.log(`Parsed ${participants.length} participants from Excel file`);
    return participants;
    
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw error;
  }
}

function parseCSVFile(filePath) {
  try {
    const csvContent = fs.readFileSync(filePath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );
    
    const participantIndex = headers.findIndex(h => 
      h.toLowerCase().includes('participant')
    );
    const categoryIndex = headers.findIndex(h => 
      h.toLowerCase().includes('category')
    );
    const ageIndex = headers.findIndex(h => 
      h.toLowerCase().includes('age')
    );
    const occupationIndex = headers.findIndex(h => 
      h.toLowerCase().includes('occupation')
    );
    const transcriptIndex = headers.findIndex(h => 
      h.toLowerCase().includes('transcript')
    );
    
    if (participantIndex === -1 || transcriptIndex === -1) {
      throw new Error('Required columns not found. Expected: Participant, Full_Transcript');
    }
    
    const participants = rows
      .filter(row => row[participantIndex] && row[transcriptIndex])
      .map(row => ({
        participant: row[participantIndex]?.trim() || 'Unknown',
        category: row[categoryIndex]?.trim() || 'General',
        age: parseInt(row[ageIndex]) || 30,
        occupation: row[occupationIndex]?.trim() || 'Unknown',
        transcript: row[transcriptIndex]?.trim() || ''
      }));
    
    console.log(`Parsed ${participants.length} participants from CSV file`);
    return participants;
    
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    throw error;
  }
}

async function processParticipantsAsync(uploadId, participants, filePath) {
  let processedCount = 0;
  
  try {
    console.log(`Starting background processing for ${participants.length} participants`);
    
    for (const participant of participants) {
      try {
        console.log(`Processing participant: ${participant.participant}`);
        
        // Create a simple agent profile based on transcript analysis
        const agent = createAgentFromTranscript(participant);
        aiAgents.set(agent.id, agent);
        
        processedCount++;
        console.log(`Successfully processed ${participant.participant} (${processedCount}/${participants.length})`);
        
        // Update progress
        const upload = uploads.get(uploadId);
        if (upload) {
          upload.processedCount = processedCount;
          uploads.set(uploadId, upload);
        }
        
        // Add small delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error processing participant ${participant.participant}:`, error);
        processedCount++;
      }
    }
    
    // Mark as completed
    const upload = uploads.get(uploadId);
    if (upload) {
      upload.status = 'completed';
      upload.completedAt = new Date();
      uploads.set(uploadId, upload);
    }
    
    console.log(`Background processing completed. Created ${processedCount} agents.`);
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up uploaded file: ${filePath}`);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
    
  } catch (error) {
    console.error('Background processing error:', error);
    const upload = uploads.get(uploadId);
    if (upload) {
      upload.status = 'failed';
      uploads.set(uploadId, upload);
    }
  }
}

function createAgentFromTranscript(participant) {
  const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Enhanced analysis of transcript
  const transcript = participant.transcript.toLowerCase();
  const words = transcript.split(' ');
  const originalTranscript = participant.transcript; // Keep original for better quote extraction
  
  // Analyze speech patterns more thoroughly
  const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically', 'literally'].filter(word => 
    transcript.includes(word)
  );
  
  const questions = (transcript.match(/\?/g) || []).length;
  const exclamations = (transcript.match(/!/g) || []).length;
  const hesitations = (transcript.match(/\.\.\./g) || []).length;
  
  // More sophisticated tech comfort analysis
  const techWords = ['app', 'website', 'online', 'digital', 'computer', 'phone', 'internet', 'software', 'technology', 'tech'];
  const techMentions = techWords.filter(word => transcript.includes(word)).length;
  const techComfort = Math.min(10, Math.max(1, techMentions * 1.5 + (questions > 3 ? 2 : 0)));
  
  // Enhanced emotional pattern detection
  const frustrationWords = ['confused', 'difficult', 'hard', 'problem', 'issue', 'wrong', 'terrible', 'awful', 'hate', 'frustrated', 'annoying'];
  const excitementWords = ['great', 'awesome', 'love', 'amazing', 'wonderful', 'excellent', 'fantastic', 'brilliant', 'perfect', 'incredible'];
  const confusionWords = ['not sure', 'don\'t understand', 'confused', 'unclear', 'what do you mean', 'i don\'t get it'];
  
  const frustrationCount = frustrationWords.filter(word => transcript.includes(word)).length;
  const excitementCount = excitementWords.filter(word => transcript.includes(word)).length;
  const confusionCount = confusionWords.filter(word => transcript.includes(word)).length;
  
  // Extract better real quotes with context
  const sentences = originalTranscript.split(/[.!?]+/).filter(s => s.trim().length > 15);
  const realQuotes = sentences.slice(0, 8).map(s => s.trim()).filter(s => s.length > 20);
  
  // Extract specific emotional quotes
  const frustratedQuotes = sentences.filter(s => 
    frustrationWords.some(word => s.toLowerCase().includes(word))
  ).slice(0, 3).map(s => s.trim());
  
  const excitedQuotes = sentences.filter(s => 
    excitementWords.some(word => s.toLowerCase().includes(word))
  ).slice(0, 3).map(s => s.trim());
  
  const confusedQuotes = sentences.filter(s => 
    confusionWords.some(word => s.toLowerCase().includes(word))
  ).slice(0, 3).map(s => s.trim());
  
  return {
    id: agentId,
    name: participant.participant,
    age: participant.age,
    occupation: participant.occupation,
    category: participant.category,
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.participant}&backgroundColor=b6e3f4`,
    transcript_text: participant.transcript,
    speech_patterns: {
      sentence_length: words.length > 20 ? 'long' : words.length > 10 ? 'medium' : 'short',
      formality: questions > 5 ? 3 : 7,
      filler_words: fillerWords,
      common_phrases: extractCommonPhrases(participant.transcript),
      self_corrections_frequency: questions > 3 ? 'frequent' : 'occasional',
      question_asking_style: questions > 5 ? 'direct' : 'indirect'
    },
    vocabulary_analysis: {
      complexity_level: Math.min(10, Math.max(1, words.length / 10)),
      technical_terms_used: techWords.filter(word => transcript.includes(word)),
      common_vocabulary: extractCommonWords(participant.transcript),
      avoided_words: []
    },
    emotional_markers: {
      excitement_triggers: excitementWords.filter(word => transcript.includes(word)),
      frustration_points: frustrationWords.filter(word => transcript.includes(word)),
      confusion_triggers: confusionWords.filter(word => transcript.includes(word)),
      cautious_about: techComfort < 4 ? ['technology', 'new things', 'complex features'] : ['advanced features'],
      confident_about: techComfort > 6 ? ['basic technology', 'simple apps'] : ['everyday tasks', 'simple things'],
      excited_quotes: excitedQuotes,
      frustrated_quotes: frustratedQuotes,
      confused_quotes: confusedQuotes
    },
    cognitive_patterns: {
      understanding_speed: techComfort < 4 ? 'slow' : techComfort > 7 ? 'fast' : 'medium',
      need_for_examples: techComfort < 5,
      question_before_action: questions > 3,
      processes_info_style: 'practical'
    },
    tech_behavior: {
      actual_tech_comfort: techComfort,
      struggles_with: techComfort < 4 ? ['complex interfaces', 'technical terms'] : [],
      navigates_well: techComfort > 6 ? ['simple apps', 'basic features'] : [],
      asks_for_help_on: techComfort < 5 ? ['new features', 'complex tasks'] : []
    },
    real_quotes: realQuotes,
    personality_data: {
      agent_identity: {
        name: participant.participant,
        age: participant.age,
        occupation: participant.occupation,
        background_story: `A ${participant.age}-year-old ${participant.occupation} who participated in user research.`
      },
      communication_blueprint: {
        typical_response_length: words.length > 30 ? 'paragraph' : '3-4 sentences',
        response_speed: techComfort < 4 ? 'slow' : 'thoughtful',
        verbosity: Math.min(10, Math.max(1, words.length / 5)),
        uses_emojis: exclamations > 2,
        punctuation_style: 'casual'
      },
      knowledge_boundaries: {
        knows_confidently: techComfort > 6 ? ['basic technology'] : ['everyday tasks'],
        knows_somewhat: ['new features'],
        doesnt_know: techComfort < 4 ? ['complex technology'] : [],
        pretends_to_know: []
      },
      behavioral_triggers: {
        gets_frustrated_when: frustrationWords.filter(word => transcript.includes(word)),
        gets_excited_when: excitementWords.filter(word => transcript.includes(word)),
        needs_reassurance_about: ['safety', 'privacy'],
        loses_interest_if: ['too complex', 'too technical']
      },
      conversation_memory_style: {
        references_past_conversation: true,
        forgets_details_easily: techComfort < 4,
        asks_repeated_questions: questions > 5
      }
    },
    personality_traits: extractPersonalityTraits(participant.transcript),
    created_at: new Date(),
    is_active: true
  };
}

function extractCommonPhrases(transcript) {
  const phrases = [];
  const words = transcript.toLowerCase().split(' ');
  
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    if (phrase.length > 5 && !phrases.includes(phrase)) {
      phrases.push(phrase);
    }
  }
  
  return phrases.slice(0, 5);
}

function extractCommonWords(transcript) {
  const words = transcript.toLowerCase().split(' ')
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'from', 'they', 'them', 'have', 'been', 'will', 'would'].includes(word));
  
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}

function extractPersonalityTraits(transcript) {
  const traits = [];
  const text = transcript.toLowerCase();
  
  if (text.includes('confused') || text.includes('difficult')) traits.push('cautious');
  if (text.includes('love') || text.includes('great')) traits.push('enthusiastic');
  if (text.includes('help') || text.includes('please')) traits.push('polite');
  if (text.includes('think') || text.includes('maybe')) traits.push('thoughtful');
  if (text.includes('sure') || text.includes('definitely')) traits.push('confident');
  
  return traits.length > 0 ? traits : ['friendly'];
}

function generateInitialGreeting(agent) {
  const greetings = [
    `Hi! I'm ${agent.name}. Nice to meet you!`,
    `Hello there! I'm ${agent.name}, a ${agent.age}-year-old ${agent.occupation}.`,
    `Hey! I'm ${agent.name}. What would you like to talk about?`,
    `Hi! I'm ${agent.name}. I'm here to help with whatever you need.`,
    `Hello! I'm ${agent.name}. How can I assist you today?`
  ];
  
  return greetings[Math.floor(Math.random() * greetings.length)];
}

function generateAgentResponse(agent, userMessage) {
  const { personality_data, speech_patterns, real_quotes, transcript_text, tech_behavior, emotional_markers } = agent;
  
  // Analyze user message to understand context
  const userMessageLower = userMessage.toLowerCase();
  const isQuestion = userMessage.includes('?');
  const isTechRelated = /app|website|technology|digital|computer|phone|internet|software|tech/i.test(userMessage);
  const isComplaint = /problem|issue|difficult|confusing|hard|wrong|bad|terrible/i.test(userMessage);
  const isPraise = /great|good|excellent|amazing|wonderful|love|like/i.test(userMessage);
  
  // Generate context-aware response based on agent's actual transcript data
  let response = '';
  
  // Use real quotes from transcript as base responses
  if (real_quotes && real_quotes.length > 0) {
    // Select appropriate quote based on context using enhanced emotional data
    let selectedQuote = '';
    
    if (isTechRelated && tech_behavior.actual_tech_comfort < 4) {
      // Low tech comfort - show confusion using confused quotes
      if (emotional_markers.confused_quotes && emotional_markers.confused_quotes.length > 0) {
        selectedQuote = emotional_markers.confused_quotes[Math.floor(Math.random() * emotional_markers.confused_quotes.length)];
      } else {
        selectedQuote = real_quotes.find(q => 
          q.toLowerCase().includes('confused') || 
          q.toLowerCase().includes('difficult') || 
          q.toLowerCase().includes('not sure')
        ) || real_quotes[0];
      }
    } else if (isPraise && emotional_markers.excitement_triggers.length > 0) {
      // High excitement - use enthusiastic quotes
      if (emotional_markers.excited_quotes && emotional_markers.excited_quotes.length > 0) {
        selectedQuote = emotional_markers.excited_quotes[Math.floor(Math.random() * emotional_markers.excited_quotes.length)];
      } else {
        selectedQuote = real_quotes.find(q => 
          q.toLowerCase().includes('great') || 
          q.toLowerCase().includes('love') || 
          q.toLowerCase().includes('amazing')
        ) || real_quotes[0];
      }
    } else if (isComplaint && emotional_markers.frustration_points.length > 0) {
      // Frustration - use complaint-related quotes
      if (emotional_markers.frustrated_quotes && emotional_markers.frustrated_quotes.length > 0) {
        selectedQuote = emotional_markers.frustrated_quotes[Math.floor(Math.random() * emotional_markers.frustrated_quotes.length)];
      } else {
        selectedQuote = real_quotes.find(q => 
          q.toLowerCase().includes('problem') || 
          q.toLowerCase().includes('issue') || 
          q.toLowerCase().includes('difficult')
        ) || real_quotes[0];
      }
    } else {
      // Default - use any quote
      selectedQuote = real_quotes[Math.floor(Math.random() * real_quotes.length)];
    }
    
    response = selectedQuote;
  } else {
    // Fallback if no real quotes
    response = "I'm not sure what to say about that.";
  }
  
  // Add contextual responses based on user message
  if (isQuestion) {
    const questionResponses = [
      "That's a good question...",
      "Hmm, let me think about that...",
      "I'm not sure I understand...",
      "Can you explain that differently?",
      "What do you mean by that?"
    ];
    response = `${questionResponses[Math.floor(Math.random() * questionResponses.length)]} ${response}`;
  }
  
  // Add tech comfort level responses
  if (isTechRelated) {
    if (tech_behavior.actual_tech_comfort < 3) {
      response = `I'm not very good with technology, but ${response.toLowerCase()}`;
    } else if (tech_behavior.actual_tech_comfort > 7) {
      response = `From a technical perspective, ${response.toLowerCase()}`;
    }
  }
  
  // Add emotional context
  if (isComplaint && emotional_markers.frustration_points.length > 0) {
    response = `I know what you mean, ${response.toLowerCase()}`;
  } else if (isPraise && emotional_markers.excitement_triggers.length > 0) {
    response = `I totally agree! ${response}`;
  }
  
  // Add filler words based on speech patterns
  if (speech_patterns.filler_words && speech_patterns.filler_words.length > 0) {
    const fillerChance = speech_patterns.self_corrections_frequency === 'frequent' ? 0.5 : 0.3;
    if (Math.random() < fillerChance) {
      const filler = speech_patterns.filler_words[Math.floor(Math.random() * speech_patterns.filler_words.length)];
      response = `${filler} ${response}`;
    }
  }
  
  // Add self-corrections if agent does this frequently
  if (speech_patterns.self_corrections_frequency === 'frequent' && Math.random() < 0.3) {
    const corrections = ['I mean...', 'Actually...', 'Wait, no...', 'Let me rephrase...'];
    const correction = corrections[Math.floor(Math.random() * corrections.length)];
    response = `${correction} ${response}`;
  }
  
  // Add personality-specific speech patterns
  if (personality_data.communication_blueprint?.response_speed === 'slow') {
    response = `Well... ${response}`;
  } else if (personality_data.communication_blueprint?.response_speed === 'immediate') {
    response = `Right! ${response}`;
  }
  
  // Add hesitation for low tech comfort users
  if (tech_behavior.actual_tech_comfort < 4 && Math.random() < 0.4) {
    response = `I'm not sure, but ${response.toLowerCase()}`;
  }
  
  // Ensure response feels natural and not too polished
  if (response.length > 200) {
    response = response.substring(0, 200) + '...';
  }
  
  return response;
}

function calculateResponseDelay(userMessage, agentResponse) {
  const readingTime = userMessage.split(' ').length * 200;
  const thinkingTime = 1000 + Math.random() * 2000;
  const typingTime = agentResponse.length * 50;
  
  return Math.round(readingTime + thinkingTime + typingTime);
}

function detectEmotion(response) {
  if (response.includes('!') || response.includes('amazing') || response.includes('great')) {
    return 'excited';
  } else if (response.includes('?') || response.includes('confused')) {
    return 'confused';
  } else if (response.includes('difficult') || response.includes('problem')) {
    return 'frustrated';
  } else {
    return 'neutral';
  }
}

// Admin Research Routes for Document Processing and Agent Generation
let uploadedDocuments = [];

// Upload documents endpoint
app.post('/api/admin-research/upload', upload.array('files', 10), (req, res) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = files.map(file => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    }));

    // Add to stored documents
    uploadedDocuments.push(...uploadedFiles);

    res.json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      files: uploadedFiles,
      fileIds: uploadedFiles.map(f => f.id)
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Upload failed',
      success: false 
    });
  }
});

// Process documents endpoint
app.post('/api/admin-research/process-documents', (req, res) => {
  try {
    const { fileIds, action, configuration } = req.body;
    
    if (!fileIds || fileIds.length === 0) {
      return res.status(400).json({ 
        error: 'No file IDs provided',
        success: false 
      });
    }

    // Get documents by IDs
    const documentsToProcess = uploadedDocuments.filter(doc => fileIds.includes(doc.id));
    
    if (documentsToProcess.length === 0) {
      return res.status(404).json({ 
        error: 'No documents found with provided IDs',
        success: false 
      });
    }

    // Read document contents
    const documentContents = [];
    for (const doc of documentsToProcess) {
      try {
        let content = '';
        if (doc.mimetype === 'text/plain' || doc.mimetype === 'application/json') {
          content = fs.readFileSync(doc.path, 'utf8');
        } else if (doc.mimetype === 'text/csv') {
          content = fs.readFileSync(doc.path, 'utf8');
        } else {
          content = `[Binary file: ${doc.originalName}]`;
        }
        
        documentContents.push({
          filename: doc.originalName,
          content: content,
          type: doc.mimetype
        });
      } catch (readError) {
        console.error(`Error reading file ${doc.originalName}:`, readError);
        documentContents.push({
          filename: doc.originalName,
          content: `[Error reading file: ${readError}]`,
          type: doc.mimetype
        });
      }
    }

    if (action === 'generate_agents') {
      // Generate AI agents based on documents
      const agents = generateAgentsFromDocuments(documentContents, configuration);
      
      res.json({
        success: true,
        message: 'Documents processed successfully',
        agents: agents,
        processedDocuments: documentsToProcess.length,
        insights: {
          totalDocuments: documentsToProcess.length,
          totalAgents: agents.length,
          agentTypes: [...new Set(agents.map(a => a.demographics?.occupation || 'Unknown'))],
          demographics: {
            ageRange: [Math.min(...agents.map(a => a.demographics?.age || 25)), Math.max(...agents.map(a => a.demographics?.age || 45))],
            locations: [...new Set(agents.map(a => a.demographics?.location || 'Unknown'))],
            occupations: [...new Set(agents.map(a => a.demographics?.occupation || 'Unknown'))]
          }
        }
      });
    } else {
      // Default processing
      res.json({
        success: true,
        message: 'Documents processed successfully',
        processedDocuments: documentsToProcess.length,
        contents: documentContents
      });
    }
  } catch (error) {
    console.error('Process documents error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process documents',
      success: false 
    });
  }
});

// Generate agents from documents
function generateAgentsFromDocuments(documents, configuration = {}) {
  const agents = [];
  const config = {
    personaCount: configuration.personaCount || 5,
    ageRange: configuration.ageRange || [25, 45],
    incomeRange: configuration.incomeRange || ['₹3L-₹6L', '₹6L-₹12L', '₹12L-₹20L'],
    locations: configuration.locations || ['Bangalore', 'Mumbai', 'Delhi', 'Pune'],
    techLevels: configuration.techLevels || ['Low', 'Medium', 'High'],
    occupations: configuration.occupations || ['Software Engineer', 'Business Owner', 'Manager', 'Analyst'],
    ...configuration
  };

  // Extract insights from documents
  const documentText = documents.map(d => d.content).join(' ');
  const insights = extractInsightsFromText(documentText);

  // Generate agents based on document insights and configuration
  for (let i = 0; i < config.personaCount; i++) {
    const agent = {
      id: `agent_${Date.now()}_${i}`,
      name: generateIndianName(),
      demographics: {
        age: Math.floor(Math.random() * (config.ageRange[1] - config.ageRange[0] + 1)) + config.ageRange[0],
        location: config.locations[Math.floor(Math.random() * config.locations.length)],
        occupation: config.occupations[Math.floor(Math.random() * config.occupations.length)],
        income: config.incomeRange[Math.floor(Math.random() * config.incomeRange.length)],
        familyStatus: Math.random() > 0.5 ? 'Married' : 'Single',
        techSavviness: config.techLevels[Math.floor(Math.random() * config.techLevels.length)],
        englishLiteracy: Math.random() > 0.3 ? 'Fluent' : 'Conversational'
      },
      personality: {
        traits: generatePersonalityTraits(),
        communicationStyle: generateCommunicationStyle(),
        emotionalTone: generateEmotionalTone(),
        responseLength: ['brief', 'moderate', 'detailed'][Math.floor(Math.random() * 3)],
        riskTolerance: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        decisionMaking: ['analytical', 'intuitive', 'collaborative'][Math.floor(Math.random() * 3)]
      },
      preferences: {
        topics: generateTopicsFromInsights(insights),
        communicationChannels: ['mobile', 'desktop', 'app'][Math.floor(Math.random() * 3)],
        responseTime: ['immediate', 'within_hour', 'within_day'][Math.floor(Math.random() * 3)],
        formality: ['casual', 'professional', 'formal'][Math.floor(Math.random() * 3)]
      },
      researchContext: {
        source: 'document_upload',
        insights: insights,
        confidence: 0.8 + Math.random() * 0.2
      },
      lastUpdated: new Date().toISOString()
    };
    
    agents.push(agent);
  }

  return agents;
}

// Helper functions for agent generation
function generateIndianName() {
  const firstNames = ['Priya', 'Rajesh', 'Anita', 'Vikram', 'Deepika', 'Arjun', 'Sneha', 'Karthik', 'Pooja', 'Rohit', 'Shreya', 'Amit', 'Kavya', 'Suresh', 'Meera'];
  const lastNames = ['Sharma', 'Kumar', 'Patel', 'Singh', 'Mehta', 'Gupta', 'Reddy', 'Nair', 'Agarwal', 'Joshi', 'Iyer', 'Malhotra', 'Chopra', 'Bansal', 'Arora'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generatePersonalityTraits() {
  const traits = ['analytical', 'creative', 'practical', 'empathetic', 'ambitious', 'cautious', 'optimistic', 'realistic', 'collaborative', 'independent'];
  return traits.sort(() => 0.5 - Math.random()).slice(0, 3);
}

function generateCommunicationStyle() {
  const styles = ['direct', 'diplomatic', 'conversational', 'formal', 'casual'];
  return styles[Math.floor(Math.random() * styles.length)];
}

function generateEmotionalTone() {
  const tones = ['positive', 'neutral', 'reserved', 'enthusiastic', 'thoughtful'];
  return tones[Math.floor(Math.random() * tones.length)];
}

function generateTopicsFromInsights(insights) {
  const baseTopics = ['technology', 'finance', 'user experience', 'productivity', 'innovation'];
  const insightTopics = insights.keywords || [];
  return [...baseTopics, ...insightTopics].slice(0, 5);
}

function extractInsightsFromText(text) {
  // Simple keyword extraction
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = {};
  words.forEach(word => {
    if (word.length > 4) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  });
  
  const keywords = Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
  
  return {
    keywords,
    themes: ['user experience', 'technology adoption', 'financial services'],
    patterns: ['mobile-first', 'security-conscious', 'value-oriented']
  };
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Human-like AI Chat System running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 Projects: http://localhost:${PORT}/api/projects`);
  console.log(`🤖 Agents: http://localhost:${PORT}/api/agents`);
  console.log(`💬 Chat: http://localhost:${PORT}/api/chat`);
  console.log(`📄 Document Upload: http://localhost:${PORT}/api/admin-research/upload`);
  console.log(`🔍 Process Documents: http://localhost:${PORT}/api/admin-research/process-documents`);
  console.log('🎭 Human-like AI Agents with Natural Conversations');
  console.log('💭 Realistic Persona-based Responses');
  console.log('🔍 Cultural Context and Language Patterns');
  console.log('💬 Dual-Agent Chat System Ready');
  console.log('📄 Document-based Agent Generation Ready');
});