import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import { CodeExport, CodeFile, DeploymentConfig, MCPSimulation } from '../types';

const router = express.Router();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key' 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

// POST /api/code-export/generate - Generate production code
router.post('/generate', async (req, res) => {
  try {
    const { projectId, uiVariant, framework, language } = req.body;

    // Generate production code
    const codeExport = await generateProductionCode(uiVariant, framework, language);
    
    // Save code export
    const codePath = path.join(__dirname, '../../exports/code', `${projectId}-code.json`);
    fs.writeFileSync(codePath, JSON.stringify(codeExport, null, 2));

    // Write individual code files
    const codeDir = path.join(__dirname, '../../exports/code', projectId);
    if (!fs.existsSync(codeDir)) {
      fs.mkdirSync(codeDir, { recursive: true });
    }

    codeExport.files.forEach((file: CodeFile) => {
      const filePath = path.join(codeDir, file.path);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, file.content);
    });

    res.json(codeExport);
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

// POST /api/code-export/simulate-mcp - Simulate MCP deployment
router.post('/simulate-mcp', async (req, res) => {
  try {
    const { projectId, deploymentConfig } = req.body;

    // Simulate MCP deployment
    const mcpSimulation = await simulateMCPDeployment(projectId, deploymentConfig);
    
    res.json(mcpSimulation);
  } catch (error) {
    console.error('Error simulating MCP deployment:', error);
    res.status(500).json({ error: 'Failed to simulate MCP deployment' });
  }
});

// GET /api/code-export/:projectId/download - Download code as ZIP
router.get('/:projectId/download', (req, res) => {
  try {
    const projectId = req.params.projectId;
    const codeDir = path.join(__dirname, '../../exports/code', projectId);
    
    if (!fs.existsSync(codeDir)) {
      return res.status(404).json({ error: 'Code not found' });
    }

    // Create ZIP file (simplified - in production, use a proper ZIP library)
    const codeExportPath = path.join(__dirname, '../../exports/code', `${projectId}-code.json`);
    if (fs.existsSync(codeExportPath)) {
      const codeExport: CodeExport = JSON.parse(fs.readFileSync(codeExportPath, 'utf8'));
      
      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${projectId}-code-export.json"`);
      
      res.json(codeExport);
    } else {
      res.status(404).json({ error: 'Code export not found' });
    }
  } catch (error) {
    console.error('Error downloading code:', error);
    res.status(500).json({ error: 'Failed to download code' });
  }
});

// Helper function to generate production code
async function generateProductionCode(uiVariant: any, framework: string, language: string) {
  const prompt = `
    Generate production-ready code for the UI variant:
    
    UI Variant: ${JSON.stringify(uiVariant, null, 2)}
    Framework: ${framework}
    Language: ${language}
    
    Create a complete, production-ready codebase including:
    1. Component files (one per screen)
    2. Style files (CSS/SCSS)
    3. Configuration files (package.json, etc.)
    4. Asset files
    5. Documentation (README.md)
    
    Ensure the code:
    - Follows best practices for ${framework}
    - Is fully functional and deployable
    - Includes proper TypeScript types
    - Has responsive design
    - Includes accessibility features
    - Has proper error handling
    - Is well-documented
    
    Format as a CodeExport object with:
    - framework
    - language
    - files (array of CodeFile objects)
    - dependencies (array of strings)
    - buildInstructions (array of strings)
    - deploymentConfig (DeploymentConfig object)
    - mcpSimulation (MCPSimulation object)
    - status: 'READY'
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert full-stack developer. Generate production-ready, deployable code that follows best practices and industry standards.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 6000
    });

    const content = completion.choices[0].message.content;
    const codeData = JSON.parse(content || '{}');
    
    // Create CodeExport object
    const codeExport: CodeExport = {
      id: uuidv4(),
      framework: framework as any,
      language: language as any,
      files: codeData.files || [],
      dependencies: codeData.dependencies || [],
      buildInstructions: codeData.buildInstructions || [],
      deploymentConfig: codeData.deploymentConfig || {
        platform: 'VERCEL',
        environment: 'PRODUCTION',
        variables: {},
        buildCommand: 'npm run build',
        startCommand: 'npm start'
      },
      mcpSimulation: {
        endpoint: `https://api.processcraft.com/mcp/${uuidv4()}`,
        status: 'CONNECTING',
        responseTime: 0,
        features: ['deployment', 'monitoring', 'scaling'],
        previewUrl: `https://preview.processcraft.com/${uuidv4()}`
      },
      status: 'READY',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return codeExport;
  } catch (error) {
    console.error('Error generating production code:', error);
    return {
      id: uuidv4(),
      framework: framework as any,
      language: language as any,
      files: [],
      dependencies: [],
      buildInstructions: [],
      deploymentConfig: {
        platform: 'VERCEL',
        environment: 'PRODUCTION',
        variables: {},
        buildCommand: 'npm run build',
        startCommand: 'npm start'
      },
      mcpSimulation: {
        endpoint: '',
        status: 'ERROR',
        responseTime: 0,
        features: []
      },
      status: 'GENERATING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

// Helper function to simulate MCP deployment
async function simulateMCPDeployment(projectId: string, deploymentConfig: DeploymentConfig) {
  // Simulate deployment process
  const steps = [
    'Validating configuration...',
    'Building application...',
    'Running tests...',
    'Deploying to staging...',
    'Running integration tests...',
    'Deploying to production...',
    'Setting up monitoring...',
    'Configuring CDN...',
    'Deployment complete!'
  ];

  const mcpSimulation: MCPSimulation = {
    endpoint: `https://api.processcraft.com/mcp/${projectId}`,
    status: 'CONNECTING',
    responseTime: Math.random() * 1000 + 500, // Random response time between 500-1500ms
    features: ['deployment', 'monitoring', 'scaling', 'analytics'],
    previewUrl: `https://preview.processcraft.com/${projectId}`
  };

  // Simulate deployment steps
  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second per step
    console.log(`MCP Deployment: ${steps[i]}`);
  }

  mcpSimulation.status = 'CONNECTED';
  mcpSimulation.responseTime = Math.random() * 200 + 100; // Final response time

  return mcpSimulation;
}

export default router;
