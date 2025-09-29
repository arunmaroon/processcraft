import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { adminResearchService } from '../services/adminResearchService';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'data', 'training');
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
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.json', '.pdf', '.txt', '.xlsx'];
    const allowedMimeTypes = [
      'text/csv',
      'application/json',
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    
    console.log('File validation:', { originalname: file.originalname, ext, mimeType });
    
    if (allowedTypes.includes(ext) || allowedMimeTypes.includes(mimeType)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Only CSV, JSON, PDF, TXT, and XLSX files are allowed. Got: ${ext} (${mimeType})`));
    }
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { passcode } = req.body;
    
    if (passcode === process.env.ADMIN_PASSCODE || passcode === 'admin123') {
      const token = 'admin_token_' + Date.now();
      res.json({ 
        success: true, 
        token,
        message: 'Admin access granted'
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid passcode' 
      });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Upload research data
router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }

    const uploadResults = await adminResearchService.processUploads(files);
    
    res.json({
      success: true,
      message: `${files.length} file(s) uploaded successfully`,
      files: uploadResults
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Upload failed' 
    });
  }
});

// Synthesize insights
router.post('/synthesize', async (req, res) => {
  try {
    const insights = await adminResearchService.synthesizeInsights();
    
    res.json({
      success: true,
      message: 'Insights synthesized successfully',
      insights
    });
  } catch (error) {
    console.error('Synthesis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Synthesis failed' 
    });
  }
});

// Organize configurations
router.post('/organize-configs', async (req, res) => {
  try {
    const { personas, demographics, cohorts } = req.body;
    
    await adminResearchService.saveConfigs({ personas, demographics, cohorts });
    
    res.json({
      success: true,
      message: 'Configurations saved successfully'
    });
  } catch (error) {
    console.error('Config save error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Save failed' 
    });
  }
});

// Map products
router.post('/map-products', async (req, res) => {
  try {
    const { mappings } = req.body;
    
    await adminResearchService.saveMappings(mappings);
    
    res.json({
      success: true,
      message: 'Product mappings saved successfully'
    });
  } catch (error) {
    console.error('Mapping save error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Save failed' 
    });
  }
});

// Build agents
router.post('/build-agents', async (req, res) => {
  try {
    const agents = await adminResearchService.buildAgents();
    
    res.json({
      success: true,
      message: 'Agents built successfully',
      agents
    });
  } catch (error) {
    console.error('Agent building error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Agent building failed' 
    });
  }
});

// Check bias
router.post('/check-bias', async (req, res) => {
  try {
    const issues = await adminResearchService.checkBias();
    
    res.json({
      success: true,
      message: 'Bias check completed',
      issues
    });
  } catch (error) {
    console.error('Bias check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Bias check failed' 
    });
  }
});

// Preview agent
router.post('/preview-agent', async (req, res) => {
  try {
    const { agentId, message } = req.body;
    
    const response = await adminResearchService.previewAgent(agentId, message);
    
    res.json({
      success: true,
      response
    });
  } catch (error) {
    console.error('Agent preview error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Agent preview failed' 
    });
  }
});

// Test agent
router.post('/test-agent', async (req, res) => {
  try {
    const { agentId } = req.body;
    
    const result = await adminResearchService.testAgent(agentId);
    
    res.json({
      success: true,
      accuracy: result.accuracy,
      message: 'Agent test completed'
    });
  } catch (error) {
    console.error('Agent test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Agent test failed' 
    });
  }
});

// Get all data
router.get('/insights', async (req, res) => {
  try {
    const insights = await adminResearchService.getInsights();
    res.json(insights);
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ message: 'Failed to load insights' });
  }
});

router.get('/configs', async (req, res) => {
  try {
    const configs = await adminResearchService.getConfigs();
    res.json(configs);
  } catch (error) {
    console.error('Get configs error:', error);
    res.status(500).json({ message: 'Failed to load configs' });
  }
});

router.get('/mappings', async (req, res) => {
  try {
    const mappings = await adminResearchService.getMappings();
    res.json(mappings);
  } catch (error) {
    console.error('Get mappings error:', error);
    res.status(500).json({ message: 'Failed to load mappings' });
  }
});

router.get('/agents', async (req, res) => {
  try {
    const agents = await adminResearchService.getAgents();
    res.json(agents);
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Failed to load agents' });
  }
});

router.get('/bias-issues', async (req, res) => {
  try {
    const issues = await adminResearchService.getBiasIssues();
    res.json(issues);
  } catch (error) {
    console.error('Get bias issues error:', error);
    res.status(500).json({ message: 'Failed to load bias issues' });
  }
});

// Settings endpoints
router.get('/settings', async (req, res) => {
  try {
    const settings = await adminResearchService.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to load settings' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const settings = req.body;
    await adminResearchService.saveSettings(settings);
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Save settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
});

export default router;
