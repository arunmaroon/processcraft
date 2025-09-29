import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const router = express.Router();

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatRequest {
  messages: ChatMessage[];
  project: any;
  prd?: any;
}

// POST /api/chat-prd/chat - Chat with AI for PRD generation
router.post('/chat', async (req, res) => {
  try {
    const { messages, project, prd }: ChatRequest = req.body;
    
    console.log('🤖 Chat PRD request received');
    console.log('Project:', project?.name);
    console.log('Messages count:', messages.length);
    console.log('🔑 Claude API Key available:', process.env.CLAUDE_API_KEY ? 'YES' : 'NO');

    // Build conversation context
    const conversationContext = buildConversationContext(messages, project, prd);
    
    // Call Claude API
    const response = await callClaudeAPI(conversationContext);
    
    if (response.success) {
      // Check if PRD generation is complete
      const isPRDComplete = checkIfPRDComplete(response.content);
      
      res.json({
        success: true,
        content: response.content,
        prdGenerated: isPRDComplete,
        prdContent: isPRDComplete ? response.content : null,
        metadata: response.metadata
      });
    } else {
      // Fallback to basic response
      const fallbackResponse = generateFallbackResponse(messages, project);
      res.json({
        success: true,
        content: fallbackResponse,
        prdGenerated: false,
        prdContent: null
      });
    }

  } catch (error) {
    console.error('❌ Error in chat PRD:', error);
    res.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process chat request',
      content: 'I apologize, but I encountered an error. Please try again.',
      prdGenerated: false,
      prdContent: null
    });
  }
});

// POST /api/chat-prd/regenerate - Regenerate PRD based on conversation
router.post('/regenerate', async (req, res) => {
  try {
    const { messages, project, prd }: ChatRequest = req.body;
    
    console.log('🔄 Regenerating PRD based on conversation');
    
    // Build final PRD generation prompt
    const prdPrompt = buildPRDGenerationPrompt(messages, project);
    
    // Call Claude API for PRD generation
    const response = await callClaudeAPI(prdPrompt);
    
    if (response.success) {
      res.json({
        success: true,
        content: response.content,
        metadata: response.metadata
      });
    } else {
      // Fallback PRD
      const fallbackPRD = generateFallbackPRD(project, messages);
      res.json({
        success: true,
        content: fallbackPRD,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: 'Fallback Generator',
          confidence: 0.7,
          source: 'fallback'
        }
      });
    }

  } catch (error) {
    console.error('❌ Error regenerating PRD:', error);
        res.json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to regenerate PRD',
          content: generateFallbackPRD(req.body.project, req.body.messages)
        });
  }
});

async function callClaudeAPI(prompt: string) {
  try {
    if (!process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY === 'dummy-key') {
      throw new Error('Claude API key not configured');
    }

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    }, {
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      timeout: 120000
    });

    const content = response.data.content[0]?.text || '';
    const inputTokens = response.data.usage?.input_tokens || 0;
    const outputTokens = response.data.usage?.output_tokens || 0;

    return {
      success: true,
      content: content,
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Claude 3.5 Sonnet',
        confidence: 0.95,
        source: 'claude-api',
        model: 'claude-3-5-sonnet-20241022',
        tokens: inputTokens + outputTokens
      }
    };

  } catch (error: any) {
    console.error('Error calling Claude API:', error.response?.data || error.message);
    throw error;
  }
}

function buildConversationContext(messages: ChatMessage[], project: any, prd?: any): string {
  const conversationHistory = messages.map(msg => 
    `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
  ).join('\n\n');

  return `You are an expert Product Manager helping to create a comprehensive Product Requirements Document (PRD). 

Project: ${project.name}
Description: ${project.description || 'No description provided'}

Conversation so far:
${conversationHistory}

Based on this conversation, provide a helpful response. If the user has provided enough information about their product requirements, offer to generate a complete PRD. If not, ask follow-up questions to gather more details about:

1. Target users and their needs
2. Key features and functionality
3. Success metrics and goals
4. Technical requirements
5. Business objectives

Be conversational, helpful, and guide them through the PRD creation process step by step.`;
}

function buildPRDGenerationPrompt(messages: ChatMessage[], project: any): string {
  const conversationHistory = messages.map(msg => 
    `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
  ).join('\n\n');

  return `You are an expert Product Manager. Based on the following conversation, create a comprehensive Product Requirements Document (PRD) for the project.

Project: ${project.name}
Description: ${project.description || 'No description provided'}

Conversation:
${conversationHistory}

Please generate a detailed PRD following this structure:

# Product Requirements Document: [Project Name]

## Executive Summary
[Brief overview of the product and its purpose]

## Problem Statement
[What problem does this product solve?]

## Target Users
[Who are the primary users?]

## Product Goals & Objectives
[What are the main goals and objectives?]

## Key Features & Functionality
[What are the core features?]

## Success Metrics
[How will success be measured?]

## Technical Requirements
[What are the technical needs?]

## Business Context
[Why is this product important for the business?]

## Constraints & Assumptions
[What are the limitations and assumptions?]

## Implementation Timeline
[High-level timeline for development]

Make the PRD detailed, actionable, and professional. Use the information from the conversation to fill in specific details rather than using placeholders.`;
}

function checkIfPRDComplete(content: string): boolean {
  // Check if the response contains PRD sections
  const prdSections = [
    'Product Requirements Document',
    'Executive Summary',
    'Problem Statement',
    'Target Users',
    'Key Features',
    'Success Metrics'
  ];
  
  return prdSections.some(section => 
    content.toLowerCase().includes(section.toLowerCase())
  );
}

function generateFallbackResponse(messages: ChatMessage[], project: any): string {
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage?.type === 'user') {
    const userInput = lastMessage.content.toLowerCase();
    
    if (userInput.includes('problem') || userInput.includes('solve')) {
      return `Great! I understand the problem you're trying to solve. Can you tell me more about:

1. Who specifically faces this problem? (age group, profession, etc.)
2. How do they currently handle this problem?
3. What would make your solution better than existing alternatives?

This will help me create a more targeted PRD for your product.`;
    }
    
    if (userInput.includes('user') || userInput.includes('target')) {
      return `Excellent! Understanding your target users is crucial. Now I'd like to know:

1. What are the key features these users would need most?
2. What devices/platforms will they primarily use?
3. What would success look like for your product? (user engagement, revenue, etc.)

The more specific you can be, the better I can tailor the PRD to your needs.`;
    }
    
    if (userInput.includes('feature') || userInput.includes('functionality')) {
      return `Perfect! Those features sound important. To complete the PRD, I need to understand:

1. What are your business goals for this product?
2. Are there any technical constraints I should know about?
3. What's your target timeline for launch?

Once I have this information, I can generate a comprehensive PRD for you!`;
    }
  }
  
  return `Thank you for that information! To create the best PRD possible, could you tell me more about:

1. What specific problem does your product solve?
2. Who are your target users?
3. What are the most important features you want to include?

The more details you provide, the more comprehensive and useful your PRD will be.`;
}

function generateFallbackPRD(project: any, messages: ChatMessage[]): string {
  const conversationText = messages.map(m => m.content).join(' ');
  
  return `# Product Requirements Document: ${project.name}

## Executive Summary
${project.description || 'A product designed to address user needs and achieve business objectives.'}

## Problem Statement
Based on our conversation, this product aims to solve key challenges faced by target users.

## Target Users
Primary users identified through our discussion.

## Product Goals & Objectives
- Deliver value to target users
- Achieve business objectives
- Provide excellent user experience

## Key Features & Functionality
Core features discussed during our conversation.

## Success Metrics
- User engagement and satisfaction
- Business goal achievement
- Product adoption rates

## Technical Requirements
- Scalable architecture
- User-friendly interface
- Reliable performance

## Business Context
This product supports the overall business strategy and user needs.

## Constraints & Assumptions
- Resource limitations
- Timeline constraints
- Technical dependencies

## Implementation Timeline
- Phase 1: Core development
- Phase 2: Testing and refinement
- Phase 3: Launch and optimization

---

*This PRD was generated based on our conversation. Please review and provide additional details as needed.*`;
}

export default router;
