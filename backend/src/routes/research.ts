import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import { ResearchData, Cohort, Persona, Insight, ResearchReport } from '../types';
import grokResearchService from '../services/grokResearchService';

const router = express.Router();

// Initialize OpenAI client (only if API key is available)
const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key' 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

// POST /api/research/plan - Create research plan
router.post('/plan', async (req, res) => {
  try {
    const { projectId, product, cohorts, personas, demographics } = req.body;

    // Generate AI-powered research plan
    const researchPlan = openai 
      ? await generateResearchPlan(product, cohorts, personas, demographics)
      : generateMockResearchPlan(product, cohorts, personas, demographics);
    
    const researchData: ResearchData = {
      id: uuidv4(),
      product,
      cohorts: cohorts || [],
      personas: personas || [],
      insights: [],
      status: 'PLANNED',
      report: researchPlan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save research data
    const researchDir = path.join(__dirname, '../../exports/research-insights');
    if (!fs.existsSync(researchDir)) {
      fs.mkdirSync(researchDir, { recursive: true });
    }
    const researchPath = path.join(researchDir, `${projectId}-research.json`);
    fs.writeFileSync(researchPath, JSON.stringify(researchData, null, 2));

    res.json(researchData);
  } catch (error) {
    console.error('Error creating research plan:', error);
    res.status(500).json({ error: 'Failed to create research plan' });
  }
});

// POST /api/research/run - Run AI research
router.post('/run', async (req, res) => {
  try {
    const { projectId, researchData } = req.body;

    // Run AI-powered research
    const insights = openai 
      ? await runAIResearch(researchData)
      : generateMockInsights();
    
    const updatedResearchData: ResearchData = {
      ...researchData,
      insights,
      status: 'COMPLETED',
      updatedAt: new Date().toISOString()
    };

    // Save updated research data
    const researchDir = path.join(__dirname, '../../exports/research-insights');
    if (!fs.existsSync(researchDir)) {
      fs.mkdirSync(researchDir, { recursive: true });
    }
    const researchPath = path.join(researchDir, `${projectId}-research.json`);
    fs.writeFileSync(researchPath, JSON.stringify(updatedResearchData, null, 2));

    res.json(updatedResearchData);
  } catch (error) {
    console.error('Error running research:', error);
    res.status(500).json({ error: 'Failed to run research' });
  }
});

// POST /api/research/insights - Generate insights from data
router.post('/insights', async (req, res) => {
  try {
    const { researchData, trainingData } = req.body;

    // Load training data if provided
    let trainingContext = '';
    if (trainingData) {
      const trainingPath = path.join(__dirname, '../../data/training', trainingData);
      if (fs.existsSync(trainingPath)) {
        trainingContext = fs.readFileSync(trainingPath, 'utf8');
      }
    }

    // Generate insights using AI
    const insights = await generateInsights(researchData, trainingContext);

    res.json(insights);
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// POST /api/research/generate-cohorts - Generate AI cohorts
router.post('/generate-cohorts', async (req, res) => {
  try {
    const { product, demographics, methodology } = req.body;
    
    const cohorts = openai 
      ? await generateAICohorts(product, demographics, methodology)
      : generateMockCohorts(product, demographics);
    
    res.json(cohorts);
  } catch (error) {
    console.error('Error generating cohorts:', error);
    res.status(500).json({ error: 'Failed to generate cohorts' });
  }
});

// POST /api/research/generate-personas - Generate AI personas
router.post('/generate-personas', async (req, res) => {
  try {
    const { product, cohorts, methodology } = req.body;
    
    const personas = openai 
      ? await generateAIPersonas(product, cohorts, methodology)
      : generateMockPersonas(product, cohorts);
    
    res.json(personas);
  } catch (error) {
    console.error('Error generating personas:', error);
    res.status(500).json({ error: 'Failed to generate personas' });
  }
});

// POST /api/research/generate-questions - Generate research questions
router.post('/generate-questions', async (req, res) => {
  try {
    const { product, personas, methodology, customPrompts } = req.body;
    
    const questions = openai 
      ? await generateResearchQuestions(product, personas, methodology, customPrompts)
      : generateMockQuestions(product, personas);
    
    res.json(questions);
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// POST /api/research/generate-discussion-guide - Generate discussion guide
router.post('/generate-discussion-guide', async (req, res) => {
  try {
    const { project, personas, cohorts, config, researchPlan, prdData } = req.body;
    
    console.log('📋 Generating AI discussion guide with Grok...');
    console.log('Project:', project?.name);
    console.log('Research Plan available:', !!researchPlan);
    console.log('PRD Data available:', !!prdData);
    console.log('🔑 Grok API Key available:', process.env.GROK_API_KEY ? 'YES' : 'NO');

    // Use Grok Research Service for AI-powered discussion guide generation
    const result = await grokResearchService.generateDiscussionGuide({
      project: project || { name: 'Product Research', description: 'Product concept' },
      researchPlan: researchPlan || { objectives: ['Understand user needs'], methodology: 'User interviews' },
      prdData: prdData,
      researchSetup: req.body.researchSetup || null
    });

    console.log('✅ Discussion Guide Generation completed');
    console.log('Generated by:', result.metadata.generatedBy);
    console.log('Confidence:', result.metadata.confidence);
    console.log('Source:', result.metadata.source);
    console.log('Content length:', result.content?.length || 0);

    // Parse the AI response into structured discussion guide
    const discussionGuide = parseDiscussionGuideResponse(result.content, researchPlan);
    
    res.json({
      success: true,
      discussionGuide: discussionGuide,
      metadata: result.metadata
    });
  } catch (error) {
    console.error('Error generating discussion guide:', error);
    res.status(500).json({ error: 'Failed to generate discussion guide' });
  }
});

// POST /api/research/generate-insights - Generate comprehensive insights
router.post('/generate-insights', async (req, res) => {
  try {
    const { project, researchData, config } = req.body;
    
    const insights = openai 
      ? await generateComprehensiveInsights(project, researchData, config)
      : generateMockComprehensiveInsights(project, researchData);
    
    res.json(insights);
  } catch (error) {
    console.error('Error generating comprehensive insights:', error);
    res.status(500).json({ error: 'Failed to generate comprehensive insights' });
  }
});

// POST /api/research/refresh-insights - Refresh existing insights
router.post('/refresh-insights', async (req, res) => {
  try {
    const { project, researchData, existingInsights, config } = req.body;
    
    const refreshedInsights = openai 
      ? await refreshInsights(project, researchData, existingInsights, config)
      : existingInsights; // Return existing if no AI
    
    res.json(refreshedInsights);
  } catch (error) {
    console.error('Error refreshing insights:', error);
    res.status(500).json({ error: 'Failed to refresh insights' });
  }
});

// POST /api/research/generate-prd - Generate comprehensive PRD
router.post('/generate-prd', async (req, res) => {
  try {
    const { project, prd, strategicData, projectName, projectDescription, config, customPrompt } = req.body;
    
    const generatedPRD = openai 
      ? await generateComprehensivePRD(project, prd, strategicData, projectName, projectDescription, config, customPrompt)
      : generateMockPRD(project, prd, strategicData, projectName, projectDescription, config, customPrompt);
    
    res.json(generatedPRD);
  } catch (error) {
    console.error('Error generating PRD:', error);
    res.status(500).json({ error: 'Failed to generate PRD' });
  }
});

// Helper function to generate research plan
async function generateResearchPlan(product: string, cohorts: any[], personas: any[], demographics: any) {
  const prompt = `
    Generate a comprehensive research plan for the product: "${product}"
    
    Cohorts: ${JSON.stringify(cohorts)}
    Personas: ${JSON.stringify(personas)}
    Demographics: ${JSON.stringify(demographics)}
    
    Create a research plan that includes:
    1. Research objectives
    2. Methodology (quantitative and qualitative)
    3. Sample size recommendations
    4. Key research questions
    5. Success metrics
    6. Timeline
    7. Risk mitigation strategies
    
    Format as a structured JSON object with clear sections.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX researcher. Generate detailed, actionable research plans that follow industry best practices.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content || '{}');
  } catch (error) {
    console.error('Error generating research plan:', error);
    return {
      summary: 'Research plan generation failed',
      keyFindings: [],
      recommendations: [],
      methodology: 'AI-powered research',
      dataQuality: 0.8,
      nextSteps: ['Review and refine research plan']
    };
  }
}

// Helper function to run AI research
async function runAIResearch(researchData: ResearchData) {
  const prompt = `
    Conduct virtual user research for the product: "${researchData.product}"
    
    Research Data: ${JSON.stringify(researchData, null, 2)}
    
    Generate realistic research insights including:
    1. Pain points (3-5 key issues)
    2. User behaviors (2-3 patterns)
    3. Preferences (2-3 key preferences)
    4. Opportunities (2-3 improvement areas)
    5. Quotes from virtual users (3-5 realistic quotes)
    
    For each insight, provide:
    - Category (PAIN_POINT, OPPORTUNITY, BEHAVIOR, PREFERENCE)
    - Title (concise)
    - Description (detailed)
    - Confidence score (0-1)
    - Source (e.g., "Virtual User Interview", "Survey Data")
    - Quotes (if applicable)
    
    Format as a JSON array of insight objects.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX researcher conducting virtual user research. Generate realistic, actionable insights based on the provided research data.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 3000
    });

    const content = completion.choices[0].message.content;
    const insights = JSON.parse(content || '[]');
    
    // Add IDs and timestamps to insights
    return insights.map((insight: any) => ({
      id: uuidv4(),
      ...insight,
      createdAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error running AI research:', error);
    return [];
  }
}

// Helper function to generate insights
async function generateInsights(researchData: ResearchData, trainingContext: string) {
  const prompt = `
    Analyze the following research data and generate actionable insights:
    
    Research Data: ${JSON.stringify(researchData, null, 2)}
    
    ${trainingContext ? `Training Context: ${trainingContext}` : ''}
    
    Generate insights that:
    1. Are specific and actionable
    2. Connect to business objectives
    3. Inform design decisions
    4. Include confidence levels
    5. Provide clear next steps
    
    Format as a JSON array of insight objects with:
    - id (string)
    - category (PAIN_POINT, OPPORTUNITY, BEHAVIOR, PREFERENCE)
    - title (string)
    - description (string)
    - confidence (number 0-1)
    - source (string)
    - quotes (array of strings, optional)
    - createdAt (ISO string)
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX researcher analyzing research data. Generate actionable insights that will inform design decisions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

// Mock function for when OpenAI is not available
function generateMockResearchPlan(product: string, cohorts: Cohort[], personas: Persona[], demographics: any) {
  return {
    objectives: [
      'Understand user behavior patterns',
      'Identify key pain points and opportunities',
      'Validate design assumptions'
    ],
    methodology: 'Mixed-method approach combining quantitative surveys and qualitative interviews',
    timeline: '2-3 weeks',
    participants: cohorts.reduce((total, cohort) => total + cohort.size, 0),
    keyQuestions: [
      'How do users currently interact with similar products?',
      'What are the main challenges users face?',
      'What features are most important to users?'
    ]
  };
}

function generateMockInsights() {
  return [
    {
      id: 'insight-1',
      title: 'Mobile-First User Behavior',
      description: 'Users strongly prefer mobile interfaces for financial transactions, with 78% of interactions occurring on mobile devices.',
      category: 'BEHAVIOR',
      confidence: 0.85,
      evidence: ['Mobile usage: 78%', 'Desktop usage: 22%', 'User feedback: "Much easier on phone"'],
      source: 'Mock Research',
      createdAt: new Date().toISOString()
    },
    {
      id: 'insight-2',
      title: 'Security as Primary Concern',
      description: 'Users prioritize security features over convenience, with 89% mentioning security as their top concern.',
      category: 'SECURITY',
      confidence: 0.92,
      evidence: ['Security mentions: 89%', 'Convenience mentions: 45%', 'User feedback: "Safety first"'],
      source: 'Mock Research',
      createdAt: new Date().toISOString()
    }
  ];
}

// AI Generation Functions
async function generateAICohorts(product: string, demographics: any, methodology: string) {
  const prompt = `
    Generate 3-5 research cohorts for the product: "${product}"
    
    Demographics: ${JSON.stringify(demographics)}
    Methodology: ${methodology}
    
    Create diverse cohorts that represent different user segments with:
    - Unique names and descriptions
    - Specific demographic profiles
    - Appropriate sample sizes
    - Clear research objectives
    
    Format as JSON array of cohort objects.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX researcher. Generate diverse, realistic research cohorts that represent different user segments.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error('Error generating AI cohorts:', error);
    return generateMockCohorts(product, demographics);
  }
}

async function generateAIPersonas(product: string, cohorts: any[], methodology: string) {
  const prompt = `
    Generate 3-5 user personas for the product: "${product}"
    
    Cohorts: ${JSON.stringify(cohorts)}
    Methodology: ${methodology}
    
    Create detailed personas with:
    - Names and descriptions
    - Goals, pain points, and behaviors
    - Design preferences
    - Specific to the product context
    
    Format as JSON array of persona objects.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX researcher. Generate detailed, realistic user personas that represent different user types.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error('Error generating AI personas:', error);
    return generateMockPersonas(product, cohorts);
  }
}

async function generateResearchQuestions(product: string, personas: any[], methodology: string, customPrompts: string) {
  const prompt = `
    Generate 10-15 research questions for the product: "${product}"
    
    Personas: ${JSON.stringify(personas)}
    Methodology: ${methodology}
    Custom Prompts: ${customPrompts || 'None'}
    
    Create questions that:
    - Cover different aspects (usability, satisfaction, needs, preferences)
    - Are appropriate for the methodology
    - Target specific personas
    - Include follow-up questions
    
    Format as JSON array of question objects.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX researcher. Generate comprehensive, well-structured research questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error('Error generating research questions:', error);
    return generateMockQuestions(product, personas);
  }
}

async function generateDiscussionGuide(project: any, personas: any[], cohorts: any[], config: any) {
  const prompt = `
    Generate a comprehensive discussion guide for the project: "${project.name}"
    
    Project: ${JSON.stringify(project)}
    Personas: ${JSON.stringify(personas)}
    Cohorts: ${JSON.stringify(cohorts)}
    Config: ${JSON.stringify(config)}
    
    Create a structured discussion guide with:
    - Clear sections and timing
    - Persona-specific questions
    - Follow-up questions
    - Expected responses
    - Research objectives
    
    Format as JSON object with sections and questions.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX researcher. Generate comprehensive, well-structured discussion guides.'
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
    return JSON.parse(content || '{}');
  } catch (error) {
    console.error('Error generating discussion guide:', error);
    return generateMockDiscussionGuide(project, personas, cohorts, config);
  }
}

async function generateComprehensiveInsights(project: any, researchData: any, config: any) {
  const prompt = `
    Generate comprehensive insights for the project: "${project.name}"
    
    Project: ${JSON.stringify(project)}
    Research Data: ${JSON.stringify(researchData)}
    Config: ${JSON.stringify(config)}
    
    Create detailed insights with:
    - Multiple categories (usability, satisfaction, behavior, preference, pain-point, opportunity)
    - Evidence and quotes
    - Impact and priority levels
    - Recommendations
    - Confidence scores
    
    Format as JSON array of insight objects.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX researcher. Generate comprehensive, actionable insights from research data.'
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
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error('Error generating comprehensive insights:', error);
    return generateMockComprehensiveInsights(project, researchData);
  }
}

async function refreshInsights(project: any, researchData: any, existingInsights: any[], config: any) {
  const prompt = `
    Refresh and enhance existing insights for the project: "${project.name}"
    
    Project: ${JSON.stringify(project)}
    Research Data: ${JSON.stringify(researchData)}
    Existing Insights: ${JSON.stringify(existingInsights)}
    Config: ${JSON.stringify(config)}
    
    Enhance the existing insights by:
    - Adding new insights based on updated data
    - Improving existing insights with more evidence
    - Updating confidence scores
    - Adding new recommendations
    
    Format as JSON array of enhanced insight objects.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX researcher. Refresh and enhance existing insights with new data and analysis.'
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
    return JSON.parse(content || JSON.stringify(existingInsights));
  } catch (error) {
    console.error('Error refreshing insights:', error);
    return existingInsights;
  }
}

// Mock functions for when OpenAI is not available
function generateMockCohorts(product: string, demographics: any) {
  return [
    {
      id: 'cohort-1',
      name: 'Early Adopters',
      description: 'Tech-savvy users who embrace new products early',
      demographics: {
        ageRange: [25, 35],
        gender: ['All'],
        location: ['Global'],
        income: ['₹7.5L+'],
        education: ['Bachelor\'s Degree+']
      },
      size: 200
    },
    {
      id: 'cohort-2',
      name: 'Mainstream Users',
      description: 'Average users who adopt products after they become established',
      demographics: {
        ageRange: [30, 50],
        gender: ['All'],
        location: ['Global'],
        income: ['₹5L-₹10L'],
        education: ['High School+']
      },
      size: 500
    }
  ];
}

function generateMockPersonas(product: string, cohorts: any[]) {
  return [
    {
      id: 'persona-1',
      name: 'Sarah the Tech Professional',
      description: 'A 28-year-old software engineer who values efficiency and modern design',
      goals: ['Quick task completion', 'Seamless integration', 'Mobile-first experience'],
      painPoints: ['Complex interfaces', 'Slow performance', 'Poor mobile experience'],
      behaviors: ['Uses multiple devices', 'Prefers minimal design', 'Values security'],
      designPreferences: {
        complexity: 'MODERATE',
        interactionStyle: 'DASHBOARD',
        colorScheme: 'LIGHT',
        accessibility: 'STANDARD'
      }
    }
  ];
}

function generateMockQuestions(product: string, personas: any[]) {
  return [
    {
      id: 'q-1',
      text: 'How would you describe your first impression of this product?',
      type: 'open',
      category: 'warm-up',
      expectedResponse: 'Users should describe their initial thoughts and feelings',
      followUps: ['What specifically caught your attention?', 'How does this compare to similar products?']
    }
  ];
}

function generateMockDiscussionGuide(project: any, personas: any[], cohorts: any[], config: any) {
  return {
    id: `guide-${Date.now()}`,
    title: `${project.name} Research Discussion Guide`,
    description: 'Comprehensive discussion guide for user research',
    methodology: config.methodology || 'semi-structured',
    duration: config.duration || '60',
    sections: [
      {
        id: 'section-1',
        title: 'Introduction & Warm-up',
        duration: 10,
        questions: [
          {
            id: 'q-1',
            text: 'Tell me about yourself and your experience with similar products',
            type: 'open',
            category: 'warm-up',
            expectedResponse: 'Background information and context',
            followUps: []
          }
        ],
        objectives: ['Build rapport', 'Understand user background'],
        notes: 'Keep this section conversational and relaxed'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function generateMockComprehensiveInsights(project: any, researchData: any) {
  return [
    {
      id: 'insight-1',
      category: 'usability',
      title: 'Navigation Confusion',
      description: 'Users struggled to find key features, with 65% taking more than 3 clicks to locate primary functions.',
      confidence: 0.85,
      evidence: ['Task completion rate: 35%', 'Average clicks: 4.2', 'User feedback: "Hard to find things"'],
      impact: 'high',
      priority: 'high',
      participants: ['participant-1', 'participant-2'],
      quotes: ['"I couldn\'t find the settings anywhere"', '"The menu is confusing"'],
      trends: [
        { metric: 'Task completion', value: 35, change: -15, period: 'last 30 days' }
      ],
      recommendations: [
        {
          id: 'rec-1',
          type: 'DESIGN',
          title: 'Redesign Navigation',
          description: 'Implement a clearer navigation structure with prominent feature placement',
          priority: 'HIGH',
          effort: 'MEDIUM',
          impact: 'HIGH'
        }
      ],
      createdAt: new Date().toISOString()
    }
  ];
}

// PRD Generation Functions
async function generateComprehensivePRD(project: any, prd: any, strategicData: any, projectName: string, projectDescription: string, config: any, customPrompt: string) {
  const prompt = `
    Generate a comprehensive Product Requirements Document (PRD) for the project: "${projectName}"
    
    Project Details: ${JSON.stringify(project)}
    Project Name: ${projectName}
    Project Description: ${projectDescription}
    Existing PRD Data: ${JSON.stringify(prd)}
    Strategic Data: ${JSON.stringify(strategicData)}
    Configuration: ${JSON.stringify(config)}
    Custom Prompt: ${customPrompt || 'None'}
    
    Create a detailed PRD with the following sections:
    1. Executive Summary
    2. Problem Statement & Business Context
    3. Product Vision & Strategy
    4. Target Users and Personas
    5. User Stories and Use Cases
    6. Functional Requirements
    7. Non-Functional Requirements
    8. Success Metrics and KPIs
    9. Risk Assessment
    10. Timeline and Milestones
    11. Acceptance Criteria
    
    Use the strategic data to create a comprehensive and business-focused PRD.
    Focus on the problem statement, hypothesis, vision, and user personas provided.
    Each section should be comprehensive and actionable. Include subsections where appropriate.
    Format as JSON object with sections array containing title, content, and subsections.
  `;

  try {
    if (!openai) throw new Error('OpenAI not available');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Product Manager. Generate comprehensive, well-structured Product Requirements Documents that are actionable and detailed.'
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
    return JSON.parse(content || '{}');
  } catch (error) {
    console.error('Error generating comprehensive PRD:', error);
    return generateMockPRD(project, prd, strategicData, projectName, projectDescription, config);
  }
}

function generateMockPRD(project: any, prd: any, strategicData: any, projectName: string, projectDescription: string, config: any, customPrompt?: string) {
  return {
    id: `prd-${Date.now()}`,
    title: `${projectName} - Product Requirements Document`,
    version: '1.0',
    status: 'DRAFT',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        content: `This document outlines the product requirements for ${projectName}, a ${projectDescription || 'digital product'} designed to meet the needs of our target users. The product aims to ${prd.objectives?.join(', ') || 'achieve key business objectives'} while delivering exceptional user experience.`,
        editable: true,
        order: 1
      },
      {
        id: 'problem-statement',
        title: 'Problem Statement & Business Context',
        content: `## Problem Statement\n${strategicData?.problemStatement || 'The core problem that this product aims to solve.'}\n\n## Current Pain Points\n${strategicData?.currentPainPoints?.map((pain: any) => `- ${pain}`).join('\n') || '- Pain point 1\n- Pain point 2\n- Pain point 3'}\n\n## Business Impact\n${strategicData?.businessImpact || 'The business impact of not solving this problem.'}`,
        editable: true,
        order: 2
      },
      {
        id: 'hypothesis',
        title: 'Hypothesis & Strategy',
        content: `## Our Hypothesis\n${strategicData?.hypothesis || 'We believe that by [solution approach], we will [expected outcome] for [target users] because [reasoning].'}\n\n## Key Assumptions\n${strategicData?.assumptions?.map((assumption: any) => `- ${assumption}`).join('\n') || '- Assumption 1\n- Assumption 2\n- Assumption 3'}\n\n## Expected Outcomes\n${strategicData?.expectedOutcomes?.map((outcome: any) => `- ${outcome}`).join('\n') || '- Outcome 1\n- Outcome 2\n- Outcome 3'}`,
        editable: true,
        order: 3
      },
      {
        id: 'vision',
        title: 'Product Vision & What to Build',
        content: `## Product Vision\n${strategicData?.productVision || projectDescription || 'A comprehensive digital solution that addresses key user needs and business objectives.'}\n\n## Key Features\n${strategicData?.keyFeatures?.map((feature: any) => `- ${feature}`).join('\n') || '- Feature 1\n- Feature 2\n- Feature 3'}\n\n## Success Criteria\n${strategicData?.successCriteria?.map((criteria: any) => `- ${criteria}`).join('\n') || '- Success criteria 1\n- Success criteria 2\n- Success criteria 3'}`,
        editable: true,
        order: 4
      },
      {
        id: 'market',
        title: 'Market & Business Context',
        content: `## Market Size\n${strategicData?.marketSize || 'To be determined based on market research'}\n\n## Target Market\n${strategicData?.targetMarket || 'Primary market segments'}\n\n## Competitive Advantage\n${strategicData?.competitiveAdvantage || 'Key differentiators and unique value propositions'}\n\n## Business Model\n${strategicData?.businessModel || 'Revenue generation strategy'}\n\n## Revenue Streams\n${strategicData?.revenueStreams?.map((stream: any) => `- ${stream}`).join('\n') || '- Primary revenue source\n- Secondary revenue streams'}`,
        editable: true,
        order: 3
      },
      {
        id: 'users',
        title: 'Users & Personas',
        content: `## Target Users\n${strategicData?.targetUsers?.map((user: any) => `- ${user}`).join('\n') || prd.targetUsers?.map((user: any) => `- ${user}`).join('\n') || '- Primary target audience\n- Secondary users\n- Stakeholders'}\n\n## User Personas\n${strategicData?.userPersonas?.map((persona: any) => `### ${persona.name}\n- Demographics: ${persona.demographics}\n- Pain Points: ${persona.painPoints?.join(', ')}\n- Goals: ${persona.goals?.join(', ')}`).join('\n\n') || '### Persona 1: Primary User\n- Demographics: 25-35 years old, tech-savvy\n- Goals: Efficiency, convenience, value\n- Pain Points: Current solutions are complex\n- Behaviors: Mobile-first, time-conscious\n\n### Persona 2: Secondary User\n- Demographics: 35-45 years old, business-focused\n- Goals: Productivity, integration, reliability\n- Pain Points: Lack of integration options\n- Behaviors: Desktop-focused, feature-rich'}\n\n## User Stories\n${strategicData?.userStories?.map((story: any) => `- ${story}`).join('\n') || '- As a user, I want to easily access key features\n- As a user, I want to track my progress\n- As a user, I want to get help when needed'}`,
        editable: true,
        order: 5
      },
      {
        id: 'technical',
        title: 'Technical Requirements',
        content: `## Technical Requirements\n${strategicData?.technicalRequirements?.map((req: any) => `- ${req}`).join('\n') || '- Scalable architecture\n- Security compliance\n- Performance optimization'}\n\n## Performance Metrics\n${strategicData?.performanceMetrics?.map((metric: any) => `- ${metric}`).join('\n') || '- Page load time < 2 seconds\n- 99.9% uptime\n- Support for 10,000 concurrent users'}\n\n## Compliance Requirements\n${strategicData?.complianceRequirements?.map((req: any) => `- ${req}`).join('\n') || '- GDPR compliance\n- Security standards\n- Industry regulations'}\n\n## Risk Factors\n${strategicData?.riskFactors?.map((risk: any) => `- ${risk}`).join('\n') || '- Technical complexity\n- Market competition\n- Regulatory changes'}`,
        editable: true,
        order: 5
      },
      {
        id: 'execution',
        title: 'Execution Plan',
        content: `## Timeline\n${strategicData?.timeline || '6 months to MVP, 12 months to full launch'}\n\n## Budget\n${strategicData?.budget || 'To be determined based on requirements'}\n\n## Team Size\n${strategicData?.teamSize || '8 developers, 2 designers, 1 PM'}\n\n## Dependencies\n${strategicData?.dependencies?.map((dep: any) => `- ${dep}`).join('\n') || '- Third-party integrations\n- Legal approvals\n- Infrastructure setup'}`,
        editable: true,
        order: 6
      },
      {
        id: 'success',
        title: 'Success Metrics',
        content: `## Key Performance Indicators\n${prd.successMetrics?.map((metric: any) => `- ${metric}`).join('\n') || '- User adoption rate\n- User satisfaction score\n- Business KPIs'}\n\n## Success Criteria\n- User adoption rate > 80%\n- User satisfaction score > 4.5/5\n- Business objectives achieved\n- Technical performance targets met`,
        editable: true,
        order: 7
      },
      {
        id: 'functional-requirements',
        title: 'Functional Requirements',
        content: `## Core Features\n### Feature 1: User Authentication\n- Users can securely log in using email/password\n- Support for social login (Google, Facebook)\n- Two-factor authentication for enhanced security\n\n### Feature 2: Main Dashboard\n- Users can view key information at a glance\n- Customizable widgets and layouts\n- Real-time data updates\n\n### Feature 3: Data Management\n- Users can create, read, update, and delete data\n- Bulk operations support\n- Data export functionality\n\n## User Stories\n### As a user, I want to:\n- Quickly access my account information\n- Perform tasks efficiently\n- Receive timely notifications\n- Export my data when needed`,
        editable: true,
        order: 4,
        subsections: [
          {
            id: 'user-stories',
            title: 'User Stories',
            content: `### Epic 1: User Onboarding\n- As a new user, I want to easily create an account so that I can start using the product\n- As a new user, I want to complete a guided tour so that I understand the key features\n\n### Epic 2: Core Functionality\n- As a user, I want to perform primary tasks quickly so that I can be productive\n- As a user, I want to save my work automatically so that I don't lose progress`,
            editable: true,
            order: 1
          }
        ]
      },
      {
        id: 'non-functional-requirements',
        title: 'Non-Functional Requirements',
        content: `## Performance\n- Page load time: < 2 seconds\n- API response time: < 500ms\n- Support for 1000+ concurrent users\n\n## Security\n- Data encryption in transit and at rest\n- Regular security audits\n- Compliance with data protection regulations\n\n## Usability\n- Mobile-responsive design\n- Accessibility compliance (WCAG 2.1 AA)\n- Intuitive user interface\n\n## Reliability\n- 99.9% uptime\n- Automated backup systems\n- Disaster recovery procedures`,
        editable: true,
        order: 5
      },
      {
        id: 'technical-specifications',
        title: 'Technical Specifications',
        content: `## Technology Stack\n- Frontend: React.js with TypeScript\n- Backend: Node.js with Express\n- Database: PostgreSQL\n- Cloud: AWS/Azure\n\n## Architecture\n- Microservices architecture\n- RESTful API design\n- Event-driven communication\n\n## Integration Requirements\n- Third-party API integrations\n- Payment gateway integration\n- Analytics and monitoring tools`,
        editable: true,
        order: 6
      },
      {
        id: 'acceptance-criteria',
        title: 'Acceptance Criteria',
        content: `## Feature Acceptance Criteria\n### User Authentication\n- ✅ User can register with valid email\n- ✅ User can log in with correct credentials\n- ✅ User receives error for invalid credentials\n- ✅ Password reset functionality works\n\n### Dashboard\n- ✅ Dashboard loads within 2 seconds\n- ✅ All widgets display correctly\n- ✅ Data updates in real-time\n- ✅ Responsive design works on mobile\n\n### Data Management\n- ✅ CRUD operations work correctly\n- ✅ Data validation prevents invalid entries\n- ✅ Bulk operations complete successfully\n- ✅ Export generates correct file format`,
        editable: true,
        order: 7
      }
    ],
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: 'AI Assistant',
      prompt: customPrompt || 'Generate comprehensive PRD',
      confidence: 0.85
    }
  };
}

// Helper function to parse AI response into structured discussion guide
function parseDiscussionGuideResponse(content: string, researchPlan: any) {
  try {
    // Try to parse as JSON first
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // If JSON parsing fails, continue with markdown parsing
      }
    }

    // Parse markdown content into structured format
    const lines = content.split('\n');
    const discussionGuide: any = {
      title: 'Discussion Guide',
      projectName: researchPlan?.projectName || 'Product Research',
      objectives: [],
      methodology: 'Semi-structured interviews',
      introduction: '',
      moderatorNotes: [],
      sessionFlow: [],
      questions: [],
      activities: []
    };

    let currentSection = '';
    let questionId = 1;
    let activityId = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('# ')) {
        discussionGuide.title = line.replace('# ', '');
      } else if (line.startsWith('## ')) {
        currentSection = line.replace('## ', '');
      } else if (line.startsWith('### ')) {
        currentSection = line.replace('### ', '');
      } else if (line.startsWith('**') && line.includes('**')) {
        // Bold text - likely a question or important note
        if (currentSection.toLowerCase().includes('question') || 
            currentSection.toLowerCase().includes('interview')) {
          discussionGuide.questions.push({
            id: questionId.toString(),
            section: currentSection,
            question: line.replace(/\*\*/g, ''),
            followUp: '',
            category: 'General',
            objectives: ['Gather user insights']
          });
          questionId++;
        }
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.replace(/^[-*] /, '');
        
        if (currentSection.toLowerCase().includes('note') || 
            currentSection.toLowerCase().includes('moderator')) {
          discussionGuide.moderatorNotes.push(content);
        } else if (currentSection.toLowerCase().includes('flow') || 
                   currentSection.toLowerCase().includes('session')) {
          discussionGuide.sessionFlow.push(content);
        } else if (currentSection.toLowerCase().includes('objective')) {
          discussionGuide.objectives.push(content);
        } else if (currentSection.toLowerCase().includes('activity')) {
          discussionGuide.activities.push({
            id: activityId.toString(),
            name: content,
            description: content,
            duration: '15 minutes',
            materials: []
          });
          activityId++;
        }
      } else if (line.length > 0 && !line.startsWith('#')) {
        // Regular content
        if (currentSection.toLowerCase().includes('introduction')) {
          discussionGuide.introduction += line + ' ';
        }
      }
    }

    // Clean up introduction
    discussionGuide.introduction = discussionGuide.introduction.trim();

    // If no questions were found, add some default ones
    if (discussionGuide.questions.length === 0) {
      discussionGuide.questions = [
        {
          id: '1',
          section: 'Introduction',
          question: 'Can you tell me a little about yourself and your background?',
          followUp: 'What do you do for work? What are your main interests?',
          category: 'Demographics',
          objectives: ['Build rapport', 'Understand context']
        },
        {
          id: '2',
          section: 'Current Experience',
          question: 'How do you currently handle [relevant task]?',
          followUp: 'What tools or methods do you use? What works well? What\'s frustrating?',
          category: 'Current State',
          objectives: ['Understand current behavior', 'Identify pain points']
        },
        {
          id: '3',
          section: 'Needs & Goals',
          question: 'What would make this process easier or better for you?',
          followUp: 'What features or improvements would be most valuable?',
          category: 'Needs Assessment',
          objectives: ['Identify user needs', 'Prioritize features']
        }
      ];
    }

    return discussionGuide;

  } catch (error) {
    console.error('Error parsing discussion guide response:', error);
    
    // Return a basic fallback structure
    return {
      title: 'Discussion Guide',
      projectName: researchPlan?.projectName || 'Product Research',
      objectives: ['Understand user needs and behaviors'],
      methodology: 'Semi-structured interviews',
      introduction: 'This discussion guide is designed to gather insights about user needs, behaviors, and preferences.',
      moderatorNotes: [
        'Build rapport with participants',
        'Ask open-ended questions',
        'Probe for deeper insights',
        'Take detailed notes'
      ],
      sessionFlow: [
        'Introduction and warm-up (5-10 minutes)',
        'Background and current experience (15-20 minutes)',
        'Needs and goals exploration (15-20 minutes)',
        'Product concept evaluation (20-25 minutes)',
        'Wrap-up and next steps (5-10 minutes)'
      ],
      questions: [
        {
          id: '1',
          section: 'Introduction',
          question: 'Can you tell me a little about yourself?',
          followUp: 'What do you do for work? What are your main interests?',
          category: 'Demographics',
          objectives: ['Build rapport', 'Understand context']
        },
        {
          id: '2',
          section: 'Current Experience',
          question: 'How do you currently handle [relevant task]?',
          followUp: 'What works well? What\'s frustrating?',
          category: 'Current State',
          objectives: ['Understand current behavior', 'Identify pain points']
        },
        {
          id: '3',
          section: 'Needs & Goals',
          question: 'What would make this process better for you?',
          followUp: 'What features would be most valuable?',
          category: 'Needs Assessment',
          objectives: ['Identify user needs', 'Prioritize features']
        }
      ],
      activities: [
        {
          id: '1',
          name: 'Current Process Mapping',
          description: 'Have participants walk through their current process step-by-step',
          duration: '10 minutes',
          materials: ['Whiteboard', 'Sticky notes']
        },
        {
          id: '2',
          name: 'Feature Prioritization',
          description: 'Ask participants to rank potential features by importance',
          duration: '15 minutes',
          materials: ['Feature cards', 'Ranking sheet']
        }
      ]
    };
  }
}

export default router;
