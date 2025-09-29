import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface ClaudeResponse {
  content: Array<{
    text: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface PRDGenerationRequest {
  prompt: string;
  projectData: any;
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
    tokens?: number;
  };
  error?: string;
}

class AdvancedPRDService {
  private apiKey: string;
  private baseURL: string = 'https://api.anthropic.com/v1';

  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY || '';
    console.log('🔑 Advanced PRD Service initialized');
    console.log('API Key available:', this.apiKey ? 'YES' : 'NO');
  }

  async generatePRD(request: PRDGenerationRequest): Promise<PRDGenerationResponse> {
    try {
      console.log('🔍 Advanced PRD Service - generatePRD called');
      console.log('🔍 API Key check:', this.apiKey ? 'HAS KEY' : 'NO KEY');
      console.log('🔍 API Key length:', this.apiKey ? this.apiKey.length : 0);
      
      if (!this.apiKey || this.apiKey === 'dummy-key') {
        console.log('❌ No API key, using fallback');
        return this.generateFallbackPRD(request);
      }

      console.log('🚀 Generating detailed PRD with Claude...');
      const enhancedPrompt = this.buildDetailedPrompt(request);
      
      const response = await axios.post(`${this.baseURL}/messages`, {
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 8000,
        temperature: 0.2,
        messages: [
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        system: this.getAdvancedSystemPrompt()
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        timeout: 120000 // 2 minute timeout
      });

      const claudeResponse: ClaudeResponse = response.data;
      const generatedContent = claudeResponse.content[0]?.text || '';

      console.log('✅ Detailed PRD generated successfully');
      console.log('Content length:', generatedContent.length);
      console.log('Tokens used:', (claudeResponse.usage?.input_tokens || 0) + (claudeResponse.usage?.output_tokens || 0));

      return {
        success: true,
        content: generatedContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: 'Claude 3.5 Sonnet (Advanced)',
          confidence: 0.98,
          source: 'claude-advanced',
          model: 'claude-3-5-sonnet-20241022',
          tokens: claudeResponse.usage ? (claudeResponse.usage.input_tokens || 0) + (claudeResponse.usage.output_tokens || 0) : 0
        }
      };

    } catch (error) {
      console.error('❌ Claude API Error:', error);
      return this.generateFallbackPRD(request);
    }
  }

  private getAdvancedSystemPrompt(): string {
    return `You are a professional Product Manager. Generate a clear, well-structured Product Requirements Document (PRD) based on the provided information.

**INSTRUCTIONS:**
- Create a comprehensive PRD in markdown format
- Use clear headings and bullet points
- Be specific and actionable
- Include all necessary sections for a complete PRD
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

Generate a complete PRD that covers all essential aspects of the product.`;
  }

  private buildDetailedPrompt(request: PRDGenerationRequest): string {
    const { prompt, projectData, pmFormData } = request;
    
    return `Create a comprehensive, world-class Product Requirements Document for:

**PROJECT DETAILS:**
- Project Name: ${projectData?.name || 'New Product'}
- Description: ${projectData?.description || 'Product description'}
- Current Stage: ${projectData?.currentStage || 'PRODUCT_THINKING'}

**PM INPUT DATA:**
${pmFormData ? this.formatDetailedPMData(pmFormData) : 'No PM input data provided'}

**GENERATION REQUEST:**
${prompt}

**REQUIREMENTS - GENERATE EVERY DETAIL:**

## 1. EXECUTIVE SUMMARY
Create a compelling 2-3 paragraph executive summary that includes:
- Specific product vision and mission statement
- Key value propositions with quantified benefits
- Market opportunity size with real numbers
- Business impact projections with specific metrics
- Competitive differentiation with concrete examples

## 2. PROBLEM STATEMENT & MARKET OPPORTUNITY
Provide detailed analysis including:
- Specific problem definition with real user pain points and data
- Market opportunity size with actual TAM/SAM/SOM numbers
- Current market gaps with specific examples
- Why now? Market timing with real trends and data
- User frustration points with specific examples and metrics

## 3. TARGET USERS & DETAILED PERSONAS
Create comprehensive user research including:
- 3-4 detailed user personas with specific demographics, psychographics, and behaviors
- Real user journey mapping with specific touchpoints and pain points
- User needs, goals, and motivations with concrete examples
- Behavioral patterns and usage scenarios
- User research insights with specific data points

## 4. COMPETITIVE LANDSCAPE & MARKET ANALYSIS
Provide thorough competitive analysis:
- Market size and growth rate with real industry data
- Detailed competitive analysis of 5-7 key competitors
- Competitive positioning with specific differentiators
- Market gaps and opportunities with concrete examples
- SWOT analysis with specific strengths, weaknesses, opportunities, and threats

## 5. PRODUCT VISION & STRATEGIC POSITIONING
Define clear strategic direction:
- Product vision statement with specific goals
- Strategic positioning with concrete value propositions
- Differentiation strategy with specific competitive advantages
- Target market segments with specific characteristics
- Product roadmap with detailed phases and milestones

## 6. DETAILED SOLUTION DESIGN
Specify comprehensive product requirements:
- Core features with detailed functionality descriptions
- User experience requirements with specific design principles
- Technical architecture with specific technologies and frameworks
- Integration requirements with specific APIs and systems
- Performance requirements with specific metrics and SLAs

## 7. SUCCESS METRICS & KPIs
Define measurable outcomes:
- Business metrics with specific targets and timelines
- User engagement metrics with specific benchmarks
- Product performance metrics with specific thresholds
- Financial metrics with specific revenue and cost projections
- Measurement framework with specific tracking methods

## 8. IMPLEMENTATION PLAN
Create detailed execution strategy:
- Development phases with specific features and timelines
- Resource requirements with specific team roles and skills
- Technical milestones with specific deliverables
- Risk assessment with specific mitigation strategies
- Dependencies and blockers with specific resolution plans

## 9. GO-TO-MARKET STRATEGY
Develop comprehensive launch plan:
- Launch strategy with specific phases and timelines
- Marketing and positioning with specific channels and tactics
- Sales strategy with specific targets and methods
- Customer success with specific support and onboarding plans
- Partnership strategy with specific integration opportunities

## 10. TECHNICAL SPECIFICATIONS
Provide detailed technical requirements:
- System architecture with specific components and technologies
- Performance requirements with specific benchmarks
- Security and compliance with specific standards
- Scalability requirements with specific capacity planning
- Infrastructure needs with specific hosting and deployment requirements

**CRITICAL INSTRUCTIONS:**
- Generate specific, detailed content for every section
- Include real data, metrics, and evidence wherever possible
- Reference actual market research and industry benchmarks
- Provide concrete examples and specific use cases
- Create actionable recommendations with specific next steps
- Use professional language suitable for executives and stakeholders
- Ensure every section is comprehensive and immediately useful

Make this PRD exceptional - the kind that drives real product success and stakeholder alignment.`;
  }

  private formatDetailedPMData(pmFormData: any): string {
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
      if (pmFormData.step2.timeline) {
        formatted += `\n**Timeline:** ${pmFormData.step2.timeline}`;
      }
      if (pmFormData.step2.budget) {
        formatted += `\n**Budget:** ${pmFormData.step2.budget}`;
      }
    }
    
    // Handle legacy PM form structure for backward compatibility
    if (pmFormData.problemStatement && !pmFormData.step1) {
      formatted += `\n**Problem Statement:** ${pmFormData.problemStatement}`;
    }
    if (pmFormData.opportunityDescription) {
      formatted += `\n**Opportunity:** ${pmFormData.opportunityDescription}`;
    }
    if (pmFormData.targetUsers && !pmFormData.step1) {
      formatted += `\n**Target Users:** ${pmFormData.targetUsers}`;
    }
    if (pmFormData.primaryUseCases) {
      formatted += `\n**Primary Use Cases:** ${pmFormData.primaryUseCases}`;
    }
    if (pmFormData.elevatorPitch) {
      formatted += `\n**Elevator Pitch:** ${pmFormData.elevatorPitch}`;
    }
    if (pmFormData.goals && pmFormData.goals.length > 0) {
      formatted += `\n**Goals:**\n${pmFormData.goals.map((goal: string, index: number) => `${index + 1}. ${goal}`).join('\n')}`;
    }
    if (pmFormData.successMetrics && pmFormData.successMetrics.length > 0 && !pmFormData.step2) {
      formatted += `\n**Success Metrics:**\n${pmFormData.successMetrics.map((metric: string, index: number) => `${index + 1}. ${metric}`).join('\n')}`;
    }
    if (pmFormData.requirements && pmFormData.requirements.length > 0) {
      formatted += `\n**Requirements:**\n${pmFormData.requirements.map((req: any) => `[${req.priority}] ${req.description}`).join('\n')}`;
    }
    
    return formatted;
  }

  private generateFallbackPRD(request: PRDGenerationRequest): PRDGenerationResponse {
    const { projectData, pmFormData } = request;
    
    return {
      success: true,
      content: this.createDetailedFallbackPRD(projectData, pmFormData),
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Advanced Fallback Generator',
        confidence: 0.7,
        source: 'fallback',
        model: 'fallback-generator'
      }
    };
  }

  private createDetailedFallbackPRD(projectData: any, pmFormData: any): string {
    const projectName = pmFormData?.step1?.productName || pmFormData?.projectName || projectData?.name || 'Strategic Product';
    const projectDescription = pmFormData?.step1?.productDescription || pmFormData?.projectDescription || projectData?.description || 'innovative solution';

    return `# Product Requirements Document: ${projectName}

## Executive Summary

${projectName} represents a strategic initiative to address critical market needs through ${projectDescription}. This comprehensive PRD outlines our vision for creating a market-leading product that delivers exceptional value to users while achieving significant business impact.

**Key Value Propositions:**
- ${pmFormData?.step1?.businessGoals || pmFormData?.elevatorPitch || 'Revolutionary approach to solving critical user problems'}
- Market-leading user experience and performance
- Scalable architecture supporting future growth
- Strong competitive differentiation

## Problem Statement & Market Opportunity

### The Problem
${pmFormData?.step1?.problemStatement || pmFormData?.problemStatement || `Current solutions in the market fail to adequately address critical user needs, resulting in significant pain points and missed opportunities. Users struggle with [specific challenges] that impact their productivity and satisfaction.`}

### Market Opportunity
${pmFormData?.step1?.businessGoals || pmFormData?.opportunityDescription || `The market presents a significant opportunity with [market size] potential users and [growth rate] annual growth. Early market entry provides competitive advantages and first-mover benefits.`}

### Why Now?
- Market timing is optimal with emerging technologies
- User behavior shifts create new opportunities
- Competitive landscape is evolving rapidly
- Technology infrastructure is ready for innovation

## Target Users & Market Analysis

### Primary User Personas

**Persona 1: Primary Users**
- Demographics: ${pmFormData?.step1?.targetUsers || pmFormData?.targetUsers || 'Tech-savvy professionals, 25-45 years old'}
- Goals: ${pmFormData?.step1?.businessGoals || pmFormData?.primaryUseCases || 'Efficiency, productivity, and seamless experience'}
- Pain Points: Current solutions are complex, slow, or lack key features
- Behaviors: High digital engagement, values quality and performance

### Market Analysis
- **Total Addressable Market (TAM):** $X billion globally
- **Serviceable Addressable Market (SAM):** $Y million in target segments
- **Serviceable Obtainable Market (SOM):** $Z million achievable in 3 years

### Competitive Landscape
- **Direct Competitors:** [List key competitors and their strengths/weaknesses]
- **Indirect Competitors:** [Alternative solutions and substitutes]
- **Competitive Advantages:** [Our unique positioning and differentiators]

## Product Vision & Strategy

### Vision Statement
"To become the leading platform that [vision statement] by [timeframe], empowering [target users] to [key outcomes]."

### Strategic Positioning
- **Primary Value Prop:** ${pmFormData?.elevatorPitch || 'Revolutionary solution that transforms how users [key action]'}
- **Differentiation:** [Unique features and capabilities that set us apart]
- **Target Market:** [Specific market segments and use cases]

## Solution Design

### Core Features & Functionality
${pmFormData?.requirements && pmFormData.requirements.length > 0 ? 
  pmFormData.requirements.map((req: any) => `- **[${req.priority}] ${req.description}**\n  - Use Case: ${req.useCase}\n  - Category: ${req.category}`).join('\n') :
  `- **Core Feature 1:** [Description and value]
- **Core Feature 2:** [Description and value]
- **Core Feature 3:** [Description and value]`
}

### User Experience Requirements
- Intuitive, user-friendly interface
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1)
- Performance optimization for speed and reliability

### Technical Architecture
- **Frontend:** Modern web technologies with responsive design
- **Backend:** Scalable microservices architecture
- **Database:** High-performance data storage and retrieval
- **Integration:** API-first approach for third-party integrations

## Success Metrics & KPIs

### Business Metrics
${pmFormData?.successMetrics && pmFormData.successMetrics.length > 0 ?
  pmFormData.successMetrics.map((metric: string, index: number) => `${index + 1}. ${metric}`).join('\n') :
  `1. Revenue Growth: 150% YoY increase
2. Market Share: 15% within 2 years
3. Customer Acquisition: 10,000+ active users
4. Customer Lifetime Value: $X per user`
}

### User Metrics
- User Engagement: 80%+ monthly active users
- User Satisfaction: 4.5+ star rating
- User Retention: 70%+ after 6 months
- Net Promoter Score: 50+ NPS

### Product Metrics
- Performance: <2 second load times
- Uptime: 99.9% availability
- Feature Adoption: 60%+ for core features
- Support Tickets: <5% of user base

## Implementation Plan

### Phase 1: Foundation (Months 1-3)
- Core platform development
- Basic feature set implementation
- Initial user testing and feedback

### Phase 2: Enhancement (Months 4-6)
- Advanced features and integrations
- Performance optimization
- Beta user program

### Phase 3: Launch (Months 7-9)
- Full feature set completion
- Marketing and go-to-market execution
- Public launch and user acquisition

### Phase 4: Scale (Months 10-12)
- User growth and engagement optimization
- Advanced analytics and insights
- International expansion planning

## Go-to-Market Strategy

### Launch Strategy
- **Soft Launch:** Limited beta with key users
- **Public Launch:** Full marketing campaign and user acquisition
- **International:** Gradual expansion to key markets

### Marketing & Positioning
- Content marketing and thought leadership
- Digital marketing and social media
- Partnership and integration strategies
- User community building

## Risk Assessment & Mitigation

### Technical Risks
- **Risk:** Scalability challenges
- **Mitigation:** Cloud-native architecture and load testing

### Market Risks
- **Risk:** Competitive response
- **Mitigation:** Strong differentiation and rapid innovation

### Business Risks
- **Risk:** User adoption challenges
- **Mitigation:** User research and iterative improvement

## Technical Specifications

### System Requirements
- **Performance:** <2 second response times
- **Scalability:** Support 100,000+ concurrent users
- **Security:** Enterprise-grade security and compliance
- **Availability:** 99.9% uptime SLA

### Integration Requirements
- Third-party API integrations
- Data import/export capabilities
- Single sign-on (SSO) support
- Mobile app development

---

*This PRD was generated using ProcessCraft AI with advanced fallback generation*
*Generated on ${new Date().toLocaleDateString()}*
*Framework: Enhanced Carlin Yuen PRD methodology*`;
  }
}

export default new AdvancedPRDService();
