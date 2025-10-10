import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { TranscriptAnalyzer } from '../services/TranscriptAnalyzer';
import { PersonaSynthesizer } from '../services/PersonaSynthesizer';
import { AgentDatabase } from '../models/AgentDatabase';

const router = express.Router();
const transcriptAnalyzer = new TranscriptAnalyzer();
const personaSynthesizer = new PersonaSynthesizer();
const agentDatabase = new AgentDatabase();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/transcripts/';
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
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) and CSV files are allowed'));
    }
  }
});

// POST /api/agent-upload/upload
router.post('/upload', upload.single('file'), async (req, res) => {
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
    await agentDatabase.createUpload(uploadId, req.file.originalname, participants.length);
    
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
router.get('/status/:uploadId', async (req, res) => {
  try {
    const { uploadId } = req.params;
    const status = await agentDatabase.getUploadStatus(uploadId);
    
    if (!status) {
      return res.status(404).json({ error: 'Upload not found' });
    }
    
    res.json({
      uploadId: status.id,
      filename: status.filename,
      participantCount: status.participant_count,
      processedCount: status.processed_count,
      status: status.status,
      progress: Math.round((status.processed_count / status.participant_count) * 100),
      createdAt: status.created_at,
      completedAt: status.completed_at
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to get upload status' });
  }
});

// GET /api/agent-upload/agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await agentDatabase.getAllAgents();
    
    // Return simplified agent data for frontend
    const agentList = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      age: agent.age,
      occupation: agent.occupation,
      category: agent.category,
      avatar_url: agent.avatar_url,
      created_at: agent.created_at,
      real_quotes: agent.real_quotes.slice(0, 3), // First 3 quotes
      tech_comfort: agent.tech_behavior.actual_tech_comfort,
      personality_traits: agent.personality_data.agent_identity ? 
        Object.keys(agent.personality_data).slice(0, 3) : []
    }));
    
    res.json({
      success: true,
      agents: agentList,
      count: agentList.length
    });
    
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// Helper function to parse transcript file
async function parseTranscriptFile(filePath: string): Promise<any[]> {
  const fileExt = path.extname(filePath).toLowerCase();
  
  if (fileExt === '.csv') {
    return parseCSVFile(filePath);
  } else {
    return parseExcelFile(filePath);
  }
}

function parseExcelFile(filePath: string): any[] {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      throw new Error('File must have at least a header row and one data row');
    }
    
    const headers = jsonData[0] as string[];
    const rows = jsonData.slice(1) as any[][];
    
    // Expected columns: Participant, Category, Age, Occupation, Full_Transcript
    const participantIndex = headers.findIndex(h => 
      h.toLowerCase().includes('participant') || h.toLowerCase().includes('name')
    );
    const categoryIndex = headers.findIndex(h => 
      h.toLowerCase().includes('category') || h.toLowerCase().includes('type')
    );
    const ageIndex = headers.findIndex(h => 
      h.toLowerCase().includes('age')
    );
    const occupationIndex = headers.findIndex(h => 
      h.toLowerCase().includes('occupation') || h.toLowerCase().includes('job')
    );
    const transcriptIndex = headers.findIndex(h => 
      h.toLowerCase().includes('transcript') || h.toLowerCase().includes('conversation')
    );
    
    if (participantIndex === -1 || transcriptIndex === -1) {
      throw new Error('Required columns not found. Expected: Participant, Full_Transcript');
    }
    
    const participants = rows
      .filter(row => row[participantIndex] && row[transcriptIndex]) // Must have name and transcript
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

function parseCSVFile(filePath: string): any[] {
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
    
    // Same column mapping as Excel
    const participantIndex = headers.findIndex(h => 
      h.toLowerCase().includes('participant') || h.toLowerCase().includes('name')
    );
    const categoryIndex = headers.findIndex(h => 
      h.toLowerCase().includes('category') || h.toLowerCase().includes('type')
    );
    const ageIndex = headers.findIndex(h => 
      h.toLowerCase().includes('age')
    );
    const occupationIndex = headers.findIndex(h => 
      h.toLowerCase().includes('occupation') || h.toLowerCase().includes('job')
    );
    const transcriptIndex = headers.findIndex(h => 
      h.toLowerCase().includes('transcript') || h.toLowerCase().includes('conversation')
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

// Background processing function
async function processParticipantsAsync(
  uploadId: string, 
  participants: any[], 
  filePath: string
): Promise<void> {
  let processedCount = 0;
  const agentIds: string[] = [];
  
  try {
    console.log(`Starting background processing for ${participants.length} participants`);
    
    for (const participant of participants) {
      try {
        console.log(`Processing participant: ${participant.participant}`);
        
        // 1. Analyze transcript
        const analysis = await transcriptAnalyzer.analyzeTranscript(
          participant.transcript,
          {
            name: participant.participant,
            age: participant.age,
            occupation: participant.occupation
          }
        );
        
        if (!analysis) {
          console.error(`Failed to analyze transcript for ${participant.participant}`);
          processedCount++;
          await agentDatabase.updateUploadProgress(uploadId, processedCount, 'processing');
          continue;
        }
        
        // 2. Synthesize persona
        const agentProfile = await personaSynthesizer.synthesizePersona(
          analysis,
          {
            name: participant.participant,
            age: participant.age,
            occupation: participant.occupation,
            category: participant.category
          }
        );
        
        if (!agentProfile) {
          console.error(`Failed to synthesize persona for ${participant.participant}`);
          processedCount++;
          await agentDatabase.updateUploadProgress(uploadId, processedCount, 'processing');
          continue;
        }
        
        // 3. Add transcript text to profile
        agentProfile.transcript_text = participant.transcript;
        agentProfile.source_file = filePath;
        
        // 4. Save to database
        await agentDatabase.saveAgent(agentProfile);
        agentIds.push(agentProfile.id);
        
        processedCount++;
        console.log(`Successfully processed ${participant.participant} (${processedCount}/${participants.length})`);
        
        // Update progress
        await agentDatabase.updateUploadProgress(uploadId, processedCount, 'processing');
        
        // Add small delay to prevent overwhelming the AI APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing participant ${participant.participant}:`, error);
        processedCount++;
        await agentDatabase.updateUploadProgress(uploadId, processedCount, 'processing');
      }
    }
    
    // Mark as completed
    await agentDatabase.updateUploadProgress(uploadId, processedCount, 'completed');
    console.log(`Background processing completed. Created ${agentIds.length} agents.`);
    
    // Clean up uploaded file
    try {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up uploaded file: ${filePath}`);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
    
  } catch (error) {
    console.error('Background processing error:', error);
    await agentDatabase.updateUploadProgress(uploadId, processedCount, 'failed');
  }
}

export default router;



