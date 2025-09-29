import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import { DesignData, Wireframe, UserFlow, Annotation } from '../types';

const router = express.Router();

// Initialize OpenAI client (only if API key is available)
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key' 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

// POST /api/design/wireframes - Generate wireframes
router.post('/wireframes', async (req, res) => {
  try {
    const { projectId, prd, researchInsights, principles, framework } = req.body;

    // Generate wireframes using AI
    const wireframes = await generateWireframes(prd, researchInsights, principles, framework);
    
    const designData: DesignData = {
      id: uuidv4(),
      principles: principles || [],
      framework: framework || 'Material Design',
      wireframes,
      userFlows: [],
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save design data
    const designPath = path.join(__dirname, '../../exports/wireframes', `${projectId}-design.json`);
    fs.writeFileSync(designPath, JSON.stringify(designData, null, 2));

    res.json(designData);
  } catch (error) {
    console.error('Error generating wireframes:', error);
    res.status(500).json({ error: 'Failed to generate wireframes' });
  }
});

// POST /api/design/flows - Generate user flows
router.post('/flows', async (req, res) => {
  try {
    const { projectId, wireframes, userJourney } = req.body;

    // Generate user flows using AI
    const userFlows = await generateUserFlows(wireframes, userJourney);
    
    // Update existing design data
    const designPath = path.join(__dirname, '../../exports/wireframes', `${projectId}-design.json`);
    let designData: DesignData = { id: '', principles: [], framework: '', wireframes: [], userFlows: [], status: 'DRAFT', createdAt: '', updatedAt: '' };
    
    if (fs.existsSync(designPath)) {
      designData = JSON.parse(fs.readFileSync(designPath, 'utf8'));
    }
    
    designData.userFlows = userFlows;
    designData.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(designPath, JSON.stringify(designData, null, 2));

    res.json(designData);
  } catch (error) {
    console.error('Error generating user flows:', error);
    res.status(500).json({ error: 'Failed to generate user flows' });
  }
});

// POST /api/design/annotate - Add annotations to wireframe
router.post('/annotate', async (req, res) => {
  try {
    const { projectId, wireframeId, annotation } = req.body;

    // Load design data
    const designPath = path.join(__dirname, '../../exports/wireframes', `${projectId}-design.json`);
    if (!fs.existsSync(designPath)) {
      return res.status(404).json({ error: 'Design data not found' });
    }

    const designData: DesignData = JSON.parse(fs.readFileSync(designPath, 'utf8'));
    const wireframe = designData.wireframes.find((w: Wireframe) => w.id === wireframeId);
    
    if (!wireframe) {
      return res.status(404).json({ error: 'Wireframe not found' });
    }

    // Add annotation
    const newAnnotation: Annotation = {
      id: uuidv4(),
      type: annotation.type || 'NOTE',
      content: annotation.content,
      position: annotation.position || { x: 0, y: 0 },
      createdBy: annotation.createdBy || 'system',
      createdAt: new Date().toISOString()
    };

    wireframe.annotations.push(newAnnotation);
    designData.updatedAt = new Date().toISOString();
    
    fs.writeFileSync(designPath, JSON.stringify(designData, null, 2));

    res.json(newAnnotation);
  } catch (error) {
    console.error('Error adding annotation:', error);
    res.status(500).json({ error: 'Failed to add annotation' });
  }
});

// Helper function to generate wireframes
async function generateWireframes(prd: any, researchInsights: any[], principles: string[], framework: string) {
  const prompt = `
    Generate wireframes for the following product based on the PRD and research insights:
    
    PRD: ${JSON.stringify(prd, null, 2)}
    Research Insights: ${JSON.stringify(researchInsights, null, 2)}
    Design Principles: ${principles.join(', ')}
    Framework: ${framework}
    
    Create wireframes for the following screens:
    1. Onboarding flow (2-3 screens)
    2. Main dashboard/home screen
    3. Key feature screens (3-4 screens)
    4. Settings/profile screen
    
    For each wireframe, provide:
    - name (descriptive title)
    - description (what the screen does)
    - screenType (e.g., "onboarding", "dashboard", "feature")
    - content (SVG representation or detailed description)
    - annotations (empty array for now)
    - version (1)
    
    Format as a JSON array of wireframe objects.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX designer creating wireframes. Generate detailed, user-centered wireframes that follow design principles and address user needs identified in research.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = completion.choices[0].message.content;
    const wireframes = JSON.parse(content || '[]');
    
    // Add IDs to wireframes
    return wireframes.map((wireframe: any) => ({
      id: uuidv4(),
      ...wireframe,
      annotations: []
    }));
  } catch (error) {
    console.error('Error generating wireframes:', error);
    return [];
  }
}

// Helper function to generate user flows
async function generateUserFlows(wireframes: Wireframe[], userJourney: string) {
  const prompt = `
    Generate user flows based on the wireframes and user journey:
    
    Wireframes: ${JSON.stringify(wireframes, null, 2)}
    User Journey: ${userJourney}
    
    Create user flows that:
    1. Map the complete user journey
    2. Include decision points and conditions
    3. Show screen transitions
    4. Account for error states
    5. Include alternative paths
    
    For each flow, provide:
    - name (descriptive title)
    - description (what the flow accomplishes)
    - steps (array of flow steps)
    - screens (array of wireframe IDs)
    
    Format as a JSON array of user flow objects.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX designer creating user flows. Generate comprehensive flows that map user journeys and include all necessary decision points and edge cases.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const content = completion.choices[0].message.content;
    const flows = JSON.parse(content || '[]');
    
    // Add IDs to flows
    return flows.map((flow: any) => ({
      id: uuidv4(),
      ...flow,
      steps: flow.steps?.map((step: any) => ({
        id: uuidv4(),
        ...step
      })) || []
    }));
  } catch (error) {
    console.error('Error generating user flows:', error);
    return [];
  }
}

export default router;
