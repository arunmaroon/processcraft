import axios from 'axios';

interface PRDGenerationRequest {
  prompt: string;
  projectData: {
    name?: string;
    description?: string;
  };
  pmFormData: any;
}

interface PRDGenerationResponse {
  success: boolean;
  content: string;
  metadata: {
    generatedAt: string;
    generatedBy: string;
    confidence: number;
    source: string;
    model: string;
  };
}

interface ClaudeResponse {
  content: Array<{
    text: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

class SimplePRDService {
  private apiKey: string;
  private baseURL = 'https://api.anthropic.com/v1';

  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY || '';
  }

  async generatePRD(request: PRDGenerationRequest): Promise<PRDGenerationResponse> {
    try {
      console.log('🚀 Simple PRD Service - generatePRD called');
      
      if (!this.apiKey || this.apiKey === 'dummy-key') {
        console.log('❌ No API key, using fallback');
        return this.generateFallbackPRD(request);
      }

      console.log('🚀 Generating PRD with Claude...');
      const prompt = this.buildSimplePrompt(request);
      
      const response = await axios.post(`${this.baseURL}/messages`, {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        system: this.getSimpleSystemPrompt()
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 60000, // 1 minute timeout
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      });

      const claudeResponse: ClaudeResponse = response.data;
      const generatedContent = claudeResponse.content[0]?.text || '';

      console.log('✅ PRD generated successfully');
      console.log('Content length:', generatedContent.length);

      // Validate the response
      if (!generatedContent || generatedContent.trim().length === 0) {
        console.error('❌ Empty content from Claude API');
        return this.generateFallbackPRD(request);
      }

      return {
        success: true,
        content: generatedContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: 'Claude 3.5 Sonnet (Simple)',
          confidence: 0.9,
          source: 'claude-simple',
          model: 'claude-3-5-sonnet-20241022'
        }
      };

    } catch (error) {
      console.error('❌ Claude API Error:', error);
      return this.generateFallbackPRD(request);
    }
  }

  private getSimpleSystemPrompt(): string {
    return `You are a professional Product Manager. Generate a clear, well-structured Product Requirements Document (PRD) based on the provided information.

**CRITICAL INSTRUCTIONS:**
- Use ALL the specific information provided in the Product Manager input data
- Include EVERY feature, success metric, constraint, and persona detail provided
- Do NOT add generic content - use the exact details from the form
- Create a comprehensive PRD in markdown format
- Use clear headings and bullet points
- Be specific and actionable
- Write in a professional, clear tone
- Focus on the product requirements and specifications

**OUTPUT FORMAT:**
Use standard markdown formatting with:
- # for main title
- ## for major sections
- ### for subsections
- **bold** for emphasis
- - for bullet points
- 1. for numbered lists

**IMPORTANT:** Make sure to include all the specific features, metrics, constraints, and user personas provided in the input data. Do not generate generic content.`;
  }

  private buildSimplePrompt(request: PRDGenerationRequest): string {
    const { prompt, projectData, pmFormData } = request;
    
    return `Generate a Product Requirements Document (PRD) based on the following information:

**PROJECT DETAILS:**
- Project Name: ${projectData?.name || 'New Product'}
- Description: ${projectData?.description || 'Product description'}

**PRODUCT MANAGER INPUT (USE THIS EXACT DATA):**
${pmFormData ? this.formatPMData(pmFormData) : 'No PM input data provided'}

**REQUEST:**
${prompt}

**CRITICAL REQUIREMENTS:**
- Use ALL the specific features, success metrics, constraints, and user personas provided above
- Include the exact competitive advantage mentioned
- Use the specific problem statement and business goals provided
- Do NOT add generic content - use only what's provided in the PM input data
- Make sure every feature, metric, and constraint from the form appears in the PRD

**PRD STRUCTURE:**
Please create a comprehensive PRD with the following sections:

# Product Requirements Document: [Product Name]

## 1. Executive Summary
- Product overview and purpose (use the product description provided)
- Key objectives and goals (use the business goals provided)
- Target audience (use the target users provided)
- Success metrics (use the exact success metrics provided)

## 2. Problem Statement
- What problem does this solve? (use the problem statement provided)
- Why is this important?
- Current pain points

## 3. Solution Overview
- Product description (use the product description provided)
- Key features and functionality (use ALL the key features provided)
- How it solves the problem

## 4. Target Users
- Primary user personas (use the user personas provided)
- User needs and goals (use the persona details provided)
- User journey mapping

## 5. Functional Requirements
- Core features (use ALL the key features provided)
- User stories
- Acceptance criteria

## 6. Non-Functional Requirements
- Performance requirements
- Security requirements
- Scalability requirements

## 7. Success Metrics
- Key performance indicators (use ALL the success metrics provided)
- Success criteria
- Measurement methods

## 8. Constraints
- Technical constraints (use ALL the constraints provided)
- Business constraints
- Resource constraints

## 9. Competitive Advantage
- What makes this product unique (use the competitive advantage provided)

## 10. Implementation Plan
- Development phases
- Resource requirements

Please generate a detailed PRD using the EXACT information provided in the PM input data.`;
  }

  private formatPMData(pmFormData: any): string {
    let formatted = '';
    
    // Handle new PM form structure
    if (pmFormData.step1) {
      if (pmFormData.step1.productName) {
        formatted += `\n**Product Name:** ${pmFormData.step1.productName}`;
      }
      if (pmFormData.step1.productDescription) {
        formatted += `\n**Product Description:** ${pmFormData.step1.productDescription}`;
      }
      if (pmFormData.step1.targetUsers) {
        formatted += `\n**Target Users:** ${pmFormData.step1.targetUsers}`;
      }
      if (pmFormData.step1.problemStatement) {
        formatted += `\n**Problem Statement:** ${pmFormData.step1.problemStatement}`;
      }
      if (pmFormData.step1.businessGoals) {
        formatted += `\n**Business Goals:** ${pmFormData.step1.businessGoals}`;
      }
    }
    
    if (pmFormData.step2) {
      if (pmFormData.step2.keyFeatures && pmFormData.step2.keyFeatures.length > 0) {
        formatted += `\n**Key Features:**\n${pmFormData.step2.keyFeatures.filter((f: string) => f.trim()).map((feature: string, index: number) => `${index + 1}. ${feature}`).join('\n')}`;
      }
      if (pmFormData.step2.successMetrics && pmFormData.step2.successMetrics.length > 0) {
        formatted += `\n**Success Metrics:**\n${pmFormData.step2.successMetrics.filter((m: string) => m.trim()).map((metric: string, index: number) => `${index + 1}. ${metric}`).join('\n')}`;
      }
      if (pmFormData.step2.constraints && pmFormData.step2.constraints.length > 0) {
        formatted += `\n**Constraints:**\n${pmFormData.step2.constraints.filter((c: string) => c.trim()).map((constraint: string, index: number) => `${index + 1}. ${constraint}`).join('\n')}`;
      }
    }
    
    if (pmFormData.competitiveAdvantage) {
      formatted += `\n**Competitive Advantage:** ${pmFormData.competitiveAdvantage}`;
    }
    
    if (pmFormData.userPersonas && pmFormData.userPersonas.length > 0) {
      const validPersonas = pmFormData.userPersonas.filter((p: any) => p.name && p.name.trim());
      if (validPersonas.length > 0) {
        formatted += `\n**User Personas:**\n`;
        validPersonas.forEach((persona: any, index: number) => {
          formatted += `\n### Persona ${index + 1}: ${persona.name}`;
          if (persona.demographics) {
            formatted += `\n- Demographics: ${persona.demographics}`;
          }
          if (persona.painPoints && persona.painPoints.length > 0) {
            const painPoints = persona.painPoints.filter((pp: string) => pp.trim());
            if (painPoints.length > 0) {
              formatted += `\n- Pain Points: ${painPoints.join(', ')}`;
            }
          }
          if (persona.goals && persona.goals.length > 0) {
            const goals = persona.goals.filter((g: string) => g.trim());
            if (goals.length > 0) {
              formatted += `\n- Goals: ${goals.join(', ')}`;
            }
          }
        });
      }
    }
    
    return formatted;
  }

  private generateFallbackPRD(request: PRDGenerationRequest): PRDGenerationResponse {
    const { projectData, pmFormData } = request;
    
    return {
      success: true,
      content: this.createSimpleFallbackPRD(projectData, pmFormData),
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Simple Fallback Generator',
        confidence: 0.7,
        source: 'fallback',
        model: 'fallback-generator'
      }
    };
  }

  private createSimpleFallbackPRD(projectData: any, pmFormData: any): string {
    const productName = projectData?.name || 'New Product';
    const productDescription = projectData?.description || 'Product description';
    
    return `# Product Requirements Document: ${productName}

## 1. Executive Summary

${productName} is a product designed to address specific market needs and deliver value to target users. This PRD outlines the key requirements, features, and implementation plan for the product.

**Key Objectives:**
- Deliver a solution that meets user needs
- Achieve business goals and success metrics
- Provide a competitive advantage in the market

## 2. Problem Statement

${pmFormData?.step1?.problemStatement || 'The problem this product aims to solve needs to be clearly defined based on user research and market analysis.'}

## 3. Solution Overview

**Product Description:** ${productDescription}

**Key Features:**
${pmFormData?.step2?.keyFeatures?.filter((f: string) => f.trim()).map((feature: string, index: number) => `${index + 1}. ${feature}`).join('\n') || '- Feature requirements to be defined'}

## 4. Target Users

**Primary Users:** ${pmFormData?.step1?.targetUsers || 'Target user segments to be defined'}

**User Personas:**
${pmFormData?.userPersonas?.map((persona: any, index: number) => 
  `${index + 1}. ${persona.name || 'Persona ' + (index + 1)}: ${persona.demographics || 'Demographics not specified'}`
).join('\n') || '- User personas to be developed'}

## 5. Functional Requirements

**Core Features:**
${pmFormData?.step2?.keyFeatures?.filter((f: string) => f.trim()).map((feature: string, index: number) => `${index + 1}. ${feature}`).join('\n') || '- Core functionality to be defined'}

## 6. Non-Functional Requirements

- Performance: Product should meet performance benchmarks
- Security: Implement appropriate security measures
- Scalability: Design for expected user growth
- Usability: Ensure intuitive user experience

## 7. Success Metrics

${pmFormData?.step2?.successMetrics?.filter((m: string) => m.trim()).map((metric: string, index: number) => `${index + 1}. ${metric}`).join('\n') || '- Success metrics to be defined'}

## 8. Implementation Plan

**Development Phases:**
1. Planning and Design
2. Core Development
3. Testing and Quality Assurance
4. Launch and Deployment

## 9. Risks and Assumptions

**Potential Risks:**
- Technical challenges
- Market competition
- Resource constraints

**Key Assumptions:**
- User needs are accurately identified
- Technical feasibility is confirmed
- Market conditions remain stable

## 10. Next Steps

1. Validate requirements with stakeholders
2. Create detailed technical specifications
3. Develop project timeline and resource plan
4. Begin development phase

---

*This PRD serves as a foundation for product development and should be updated as requirements evolve.*`;
  }
}

export default new SimplePRDService();
