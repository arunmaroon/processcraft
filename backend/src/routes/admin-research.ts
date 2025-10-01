import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import grokResearchService from '../services/grokResearchService';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/research-documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.json', '.pdf', '.txt', '.xlsx', '.docx'];
    
    // Handle case where originalname might be null or undefined
    if (!file.originalname) {
      console.log('File upload attempt: originalname is null/undefined');
      return cb(new Error('File name is required'));
    }
    
    const ext = path.extname(file.originalname).toLowerCase();
    console.log('File upload attempt:', file.originalname, 'Extension:', ext);
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      console.log('File type rejected:', ext, 'Allowed types:', allowedTypes);
      cb(new Error('Invalid file type. Only CSV, JSON, PDF, TXT, XLSX, and DOCX files are allowed.'));
    }
  }
});

// Store uploaded documents metadata
let uploadedDocuments: any[] = [];

// Upload documents endpoint
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = files.map(file => ({
      id: uuidv4(),
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
      files: uploadedFiles
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Upload failed',
      success: false 
    });
  }
});

// Get all uploaded documents
router.get('/documents', (req, res) => {
  try {
    res.json({
      success: true,
      documents: uploadedDocuments
    });
  } catch (error: any) {
    console.error('Get documents error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch documents',
      success: false 
    });
  }
});

// Delete a document
router.delete('/documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    const documentIndex = uploadedDocuments.findIndex(doc => doc.id === id);
    
    if (documentIndex === -1) {
      return res.status(404).json({ 
        error: 'Document not found',
        success: false 
      });
    }

    const document = uploadedDocuments[documentIndex];
    
    // Delete file from filesystem
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    // Remove from stored documents
    uploadedDocuments.splice(documentIndex, 1);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete document error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to delete document',
      success: false 
    });
  }
});

// Preview document content
router.get('/documents/:id/preview', (req, res) => {
  try {
    const { id } = req.params;
    const document = uploadedDocuments.find(doc => doc.id === id);
    
    if (!document) {
      return res.status(404).json({ 
        error: 'Document not found',
        success: false 
      });
    }

    // Read document content for preview
    let content = '';
    try {
      if (document.mimetype === 'text/plain' || document.mimetype === 'application/json') {
        content = fs.readFileSync(document.path, 'utf8');
      } else if (document.mimetype === 'text/csv') {
        content = fs.readFileSync(document.path, 'utf8');
      } else {
        content = `Preview not available for ${document.mimetype} files.`;
      }
    } catch (readError) {
      content = `Error reading file: ${readError}`;
    }

    res.json({
      success: true,
      id: document.id,
      name: document.originalName,
      type: document.mimetype,
      size: document.size,
      content: content.substring(0, 5000), // Limit preview to 5000 characters
      isPreview: true
    });
  } catch (error: any) {
    console.error('Preview document error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to preview document',
      success: false 
    });
  }
});

// Generate agent response using Grok
router.post('/generate-agent-response', async (req, res) => {
  try {
    const { message, agent } = req.body;

    if (!message || !agent) {
      return res.status(400).json({ 
        error: 'Message and agent data are required',
        success: false 
      });
    }

    // Use Grok to generate response based on enhanced agent context
    const response = await grokResearchService.generateAgentResponse(message, agent);
    
    res.json({
      success: true,
      response: response
    });
  } catch (error: any) {
    console.error('Error generating agent response:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate agent response',
      success: false 
    });
  }
});

// Process documents with Grok
router.post('/process-documents', async (req, res) => {
  try {
    const { fileIds, action } = req.body;
    
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
          // For PDF and other binary files, we'll need additional processing
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
      const agents = await grokResearchService.generateAgentsFromDocuments(documentContents);
      
      res.json({
        success: true,
        message: 'Documents processed successfully',
        agents: agents,
        processedDocuments: documentsToProcess.length
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
  } catch (error: any) {
    console.error('Process documents error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process documents',
      success: false 
    });
  }
});

// Generate insights from documents
router.post('/synthesize', async (req, res) => {
  try {
    // Get all uploaded documents
    const documentContents = [];
    for (const doc of uploadedDocuments) {
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
      }
    }

    if (documentContents.length === 0) {
      return res.status(400).json({ 
        error: 'No documents available for synthesis',
        success: false 
      });
    }

    // Generate insights using Grok
    const insights = await grokResearchService.generateInsightsFromDocuments(documentContents);
    
    res.json({
      success: true,
      insights: insights
    });
  } catch (error: any) {
    console.error('Synthesis error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to generate insights',
      success: false 
    });
  }
});

export default router;
