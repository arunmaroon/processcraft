import express from 'express';
import OpenAI from 'openai';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key' 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

interface Persona {
  id: string;
  name: string;
  demographics: string;
  behaviors: string[];
  painPoints: string[];
  goals: string[];
  techComfort: 'low' | 'medium' | 'high';
  devicePreference: 'mobile' | 'desktop' | 'tablet' | 'any';
}

interface DesignInput {
  focus: string;
  keyGoals: string[];
  targetPersonas: string[];
  deviceTypes: string[];
  constraints: string[];
  accessibilityStandards: string[];
  designSystem: string;
  brandGuidelines: string;
}

interface WireframeVariant {
  id: string;
  name: string;
  personaId: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  layout: any;
  description: string;
  uxPatterns: string[];
  navigationFlow: any[];
  accessibilityScore: number;
  userSatisfactionScore: number;
  generatedAt: string;
  status: 'draft' | 'reviewed' | 'approved' | 'rejected';
}

// POST /api/ux-designer/generate-wireframes - Generate AI-powered wireframes
router.post('/generate-wireframes', async (req, res) => {
  try {
    const { projectId, designInput, prdData, researchData, personas } = req.body;

    console.log('🎨 Generating wireframes with AI...');
    console.log('Project:', projectId);
    console.log('Design focus:', designInput.focus);
    console.log('Target personas:', designInput.targetPersonas.length);
    console.log('Device types:', designInput.deviceTypes);

    // Generate wireframes for each persona and device combination
    const wireframes: WireframeVariant[] = [];

    for (const personaId of designInput.targetPersonas) {
      const persona = personas.find((p: Persona) => p.id === personaId);
      if (!persona) continue;

      for (const deviceType of designInput.deviceTypes) {
        try {
          const wireframe = await generateWireframeForPersona({
            persona,
            deviceType,
            designInput,
            prdData,
            researchData
          });

          wireframes.push(wireframe);
        } catch (error) {
          console.error(`Error generating wireframe for ${persona.name} on ${deviceType}:`, error);
        }
      }
    }

    console.log(`✅ Generated ${wireframes.length} wireframes`);

    res.json({
      success: true,
      wireframes,
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'AI UX Designer',
        totalVariants: wireframes.length,
        personas: designInput.targetPersonas.length,
        devices: designInput.deviceTypes.length
      }
    });

  } catch (error) {
    console.error('❌ Error generating wireframes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate wireframes'
    });
  }
});

async function generateWireframeForPersona({
  persona,
  deviceType,
  designInput,
  prdData,
  researchData
}: {
  persona: Persona;
  deviceType: string;
  designInput: DesignInput;
  prdData: any;
  researchData: any;
}): Promise<WireframeVariant> {
  const wireframeId = uuidv4();
  
  // Create AI prompt for wireframe generation
  const prompt = buildWireframePrompt({
    persona,
    deviceType,
    designInput,
    prdData,
    researchData
  });

  let wireframeData;
  
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: getWireframeSystemPrompt()
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      wireframeData = JSON.parse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      wireframeData = generateFallbackWireframe({ persona, deviceType, designInput });
    }
  } else {
    wireframeData = generateFallbackWireframe({ persona, deviceType, designInput });
  }

  return {
    id: wireframeId,
    name: `${persona.name} - ${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} Wireframe`,
    personaId: persona.id,
    deviceType: deviceType as 'mobile' | 'desktop' | 'tablet',
    layout: wireframeData.layout,
    description: wireframeData.description,
    uxPatterns: wireframeData.uxPatterns,
    navigationFlow: wireframeData.navigationFlow,
    accessibilityScore: wireframeData.accessibilityScore,
    userSatisfactionScore: wireframeData.userSatisfactionScore,
    generatedAt: new Date().toISOString(),
    status: 'draft'
  };
}

function buildWireframePrompt({
  persona,
  deviceType,
  designInput,
  prdData,
  researchData
}: {
  persona: Persona;
  deviceType: string;
  designInput: DesignInput;
  prdData: any;
  researchData: any;
}): string {
  return `Generate a comprehensive wireframe for the following persona and device:

**PERSONA DETAILS:**
- Name: ${persona.name}
- Demographics: ${persona.demographics}
- Tech Comfort: ${persona.techComfort}
- Device Preference: ${persona.devicePreference}
- Pain Points: ${persona.painPoints.join(', ')}
- Goals: ${persona.goals.join(', ')}

**DESIGN CONTEXT:**
- Focus: ${designInput.focus}
- Key Goals: ${designInput.keyGoals.join(', ')}
- Device Type: ${deviceType}
- Design System: ${designInput.designSystem}
- Accessibility Standards: ${designInput.accessibilityStandards.join(', ')}
- Constraints: ${designInput.constraints.join(', ')}

**PRD CONTEXT:**
${prdData ? `
- Product: ${prdData.productName || 'N/A'}
- Description: ${prdData.productDescription || 'N/A'}
- Target Users: ${prdData.targetUsers || 'N/A'}
- Problem Statement: ${prdData.problemStatement || 'N/A'}
` : 'No PRD data available'}

**RESEARCH INSIGHTS:**
${researchData ? `
- Research Type: ${researchData.type || 'N/A'}
- Key Insights: ${researchData.insights?.join(', ') || 'N/A'}
- User Behaviors: ${researchData.behaviors?.join(', ') || 'N/A'}
` : 'No research data available'}

**REQUIREMENTS:**
1. Create a wireframe optimized for ${persona.techComfort} tech comfort level
2. Adapt UI complexity based on persona (simpler for low-tech users)
3. Include ${deviceType}-specific UX patterns
4. Ensure accessibility compliance with ${designInput.accessibilityStandards.join(', ')}
5. Address persona pain points in the design
6. Support persona goals through the interface

**OUTPUT FORMAT:**
Return a JSON object with:
- layout: Detailed wireframe structure with components, positioning, and hierarchy
- description: Clear description of the wireframe approach and key features
- uxPatterns: Array of UX patterns used (e.g., "Progressive Disclosure", "Card Layout")
- navigationFlow: Array of navigation steps and user flows
- accessibilityScore: Number 0-100 for accessibility compliance
- userSatisfactionScore: Number 0-100 for predicted user satisfaction

Focus on creating a wireframe that directly addresses the persona's needs and pain points while maintaining excellent UX principles.`;
}

function getWireframeSystemPrompt(): string {
  return `You are an expert UX Designer with deep knowledge of user-centered design, accessibility, and persona-driven design. 

Your expertise includes:
- Creating wireframes that adapt to different user personas and tech comfort levels
- Applying appropriate UX patterns for different device types
- Ensuring accessibility compliance (WCAG 2.1, Section 508)
- Designing interfaces that address specific user pain points
- Creating intuitive navigation flows
- Balancing simplicity with functionality based on user capabilities

When generating wireframes:
1. Always consider the persona's tech comfort level and adapt complexity accordingly
2. Use appropriate UX patterns for the device type (mobile-first, desktop patterns, etc.)
3. Ensure accessibility is built-in from the start
4. Address specific pain points mentioned in the persona data
5. Create clear, logical navigation flows
6. Use the specified design system guidelines
7. Consider the constraints and requirements provided

Generate wireframes that are both functional and delightful, with a focus on solving real user problems.`;
}

function generateFallbackWireframe({
  persona,
  deviceType,
  designInput
}: {
  persona: Persona;
  deviceType: string;
  designInput: DesignInput;
}): any {
  const isMobile = deviceType === 'mobile';
  const isLowTech = persona.techComfort === 'low';
  
  return {
    layout: {
      type: 'wireframe',
      device: deviceType,
      components: [
        {
          type: 'header',
          content: 'App Header',
          position: { x: 0, y: 0, width: '100%', height: 60 },
          style: isLowTech ? 'simple' : 'detailed'
        },
        {
          type: 'navigation',
          content: isMobile ? 'Bottom Navigation' : 'Sidebar Navigation',
          position: isMobile ? 
            { x: 0, y: 'calc(100% - 60px)', width: '100%', height: 60 } :
            { x: 0, y: 60, width: 200, height: 'calc(100% - 60px)' },
          items: isLowTech ? ['Home', 'Profile', 'Help'] : ['Dashboard', 'Analytics', 'Settings', 'Profile']
        },
        {
          type: 'main-content',
          content: 'Main Content Area',
          position: isMobile ?
            { x: 0, y: 60, width: '100%', height: 'calc(100% - 120px)' } :
            { x: 200, y: 60, width: 'calc(100% - 200px)', height: 'calc(100% - 60px)' },
          style: isLowTech ? 'minimal' : 'feature-rich'
        }
      ],
      responsive: true,
      accessibility: {
        colorContrast: 'AA',
        keyboardNavigation: true,
        screenReaderSupport: true
      }
    },
    description: `A ${deviceType} wireframe optimized for ${persona.name} (${persona.techComfort} tech comfort). Features ${isLowTech ? 'simplified' : 'comprehensive'} interface with ${isMobile ? 'mobile-first' : 'desktop-optimized'} design patterns.`,
    uxPatterns: [
      isMobile ? 'Mobile-First Design' : 'Desktop Layout',
      isLowTech ? 'Progressive Disclosure' : 'Information Architecture',
      'Accessible Design',
      'Consistent Navigation'
    ],
    navigationFlow: [
      { step: 1, action: 'Land on homepage', description: 'Clear entry point with main actions' },
      { step: 2, action: 'Navigate to feature', description: 'Intuitive navigation to desired functionality' },
      { step: 3, action: 'Complete task', description: 'Streamlined task completion flow' },
      { step: 4, action: 'Confirmation', description: 'Clear feedback and next steps' }
    ],
    accessibilityScore: 85,
    userSatisfactionScore: isLowTech ? 90 : 80
  };
}

// GET /api/ux-designer/personas - Get available personas
router.get('/personas', async (req, res) => {
  try {
    // This would typically fetch from a database
    // For now, return mock data
    const personas = [
      {
        id: 'persona-1',
        name: 'Tech-Savvy Millennial',
        demographics: 'Age 25-35, Urban, High income',
        techComfort: 'high',
        devicePreference: 'mobile',
        behaviors: ['Uses multiple apps', 'Quick decision maker'],
        painPoints: ['Complex interfaces', 'Slow loading'],
        goals: ['Efficiency', 'Convenience']
      },
      {
        id: 'persona-2',
        name: 'Senior Citizen',
        demographics: 'Age 65+, Suburban, Medium income',
        techComfort: 'low',
        devicePreference: 'desktop',
        behaviors: ['Prefers simple interfaces', 'Takes time to learn'],
        painPoints: ['Small text', 'Complex navigation'],
        goals: ['Ease of use', 'Reliability']
      }
    ];

    res.json({
      success: true,
      personas
    });
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personas'
    });
  }
});

// POST /api/ux-designer/export-wireframes - Export wireframes
router.post('/export-wireframes', async (req, res) => {
  try {
    const { wireframes, format } = req.body;

    console.log(`Exporting ${wireframes.length} wireframes in ${format} format`);

    // This would implement actual export logic
    // For now, return success
    res.json({
      success: true,
      message: `Exported ${wireframes.length} wireframes in ${format} format`,
      downloadUrl: '/api/ux-designer/download/export.zip'
    });
  } catch (error) {
    console.error('Error exporting wireframes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export wireframes'
    });
  }
});

export default router;
