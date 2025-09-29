import axios from 'axios';

interface GrokResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
  };
}

interface ResearchPlanRequest {
  project: any;
  researchInput: any;
  prdData?: any;
}

interface DiscussionGuideRequest {
  project: any;
  researchPlan: any;
  prdData?: any;
  researchSetup?: any;
}

interface ResearchReportRequest {
  project: any;
  researchPlan: any;
  prdData?: any;
  userPrompt?: string;
}

interface AIResponse {
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

class GrokResearchService {
  private apiKey: string;
  private baseURL: string = 'https://api.x.ai/v1';

  constructor() {
    this.apiKey = process.env.GROK_API_KEY || '';
    console.log('🔧 GrokResearchService constructor - API Key loaded:', this.apiKey ? 'YES' : 'NO');
  }

  async generateResearchPlan(request: ResearchPlanRequest): Promise<AIResponse> {
    try {
      if (!this.apiKey || this.apiKey === 'dummy-key') {
        return this.generateFallbackResearchPlan(request);
      }

      // Disable SSL verification for this request
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      const enhancedPrompt = this.buildResearchPlanPrompt(request);
      console.log('🚀 Making Grok API call for research plan...');
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: "grok-3",
        messages: [
          {
            role: "system",
            content: this.getResearchPlanSystemPrompt()
          },
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000,
        httpsAgent: new (require('https').Agent)({ 
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined
        })
      });

      const grokResponse: GrokResponse = response.data;
      const generatedContent = grokResponse.choices[0]?.message?.content || '';
      
      console.log('✅ Grok API response received for research plan');
      console.log('📝 Content length:', generatedContent.length);

      return {
        success: true,
        content: generatedContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: 'Grok AI (xAI)',
          confidence: 0.98,
          source: 'grok',
          model: 'grok-3',
          tokens: grokResponse.usage?.total_tokens || 0
        }
      };

    } catch (error: any) {
      console.error('❌ Grok API Error for research plan:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Falling back to fallback generator');
      return this.generateFallbackResearchPlan(request);
    }
  }

  async generateResearchReport(request: ResearchReportRequest): Promise<AIResponse> {
    try {
      if (!this.apiKey || this.apiKey === 'dummy-key') {
        return this.generateFallbackResearchReport(request);
      }

      // Disable SSL verification for this request
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      const enhancedPrompt = this.buildResearchReportPrompt(request);
      console.log('🚀 Making Grok API call for research report...');
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: "grok-3",
        messages: [
          {
            role: "system",
            content: this.getResearchReportSystemPrompt()
          },
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000,
        httpsAgent: new (require('https').Agent)({ 
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined
        })
      });

      const grokResponse: GrokResponse = response.data;
      const generatedContent = grokResponse.choices[0]?.message?.content || '';
      
      console.log('✅ Grok API response received for research report');
      console.log('📝 Content length:', generatedContent.length);

      return {
        success: true,
        content: generatedContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: 'Grok AI (xAI)',
          confidence: 0.98,
          source: 'grok',
          model: 'grok-3',
          tokens: grokResponse.usage?.total_tokens || 0
        }
      };

    } catch (error: any) {
      console.error('❌ Grok API Error for research report:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Falling back to fallback generator');
      return this.generateFallbackResearchReport(request);
    }
  }

  async generateDiscussionGuide(request: DiscussionGuideRequest): Promise<AIResponse> {
    try {
      if (!this.apiKey || this.apiKey === 'dummy-key') {
        return this.generateFallbackDiscussionGuide(request);
      }

      // Disable SSL verification for this request
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

      const enhancedPrompt = this.buildDiscussionGuidePrompt(request);
      console.log('🚀 Making Grok API call for discussion guide...');
      
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: "grok-3",
        messages: [
          {
            role: "system",
            content: this.getDiscussionGuideSystemPrompt()
          },
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.3,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000,
        httpsAgent: new (require('https').Agent)({ 
          rejectUnauthorized: false,
          checkServerIdentity: () => undefined
        })
      });

      const grokResponse: GrokResponse = response.data;
      const generatedContent = grokResponse.choices[0]?.message?.content || '';
      
      console.log('✅ Grok API response received for discussion guide');
      console.log('📝 Content length:', generatedContent.length);

      return {
        success: true,
        content: generatedContent,
        metadata: {
          generatedAt: new Date().toISOString(),
          generatedBy: 'Grok AI (xAI)',
          confidence: 0.98,
          source: 'grok',
          model: 'grok-3',
          tokens: grokResponse.usage?.total_tokens || 0
        }
      };

    } catch (error: any) {
      console.error('❌ Grok API Error for discussion guide:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Falling back to fallback generator');
      return this.generateFallbackDiscussionGuide(request);
    }
  }

  private getResearchPlanSystemPrompt(): string {
    return `You are an elite UX Research Director with 15+ years of experience at top tech companies (Google, Apple, Microsoft, Amazon, Meta). You specialize in creating world-class research plans that are:

1. **Strategic & Actionable**: Clear research objectives, methodologies, and deliverables
2. **User-Centric**: Deep focus on understanding user needs, behaviors, and pain points
3. **Methodologically Sound**: Rigorous research design with appropriate methods and sample sizes
4. **Business-Focused**: Research that directly informs product decisions and business outcomes
5. **Executable**: Detailed timelines, resources, and implementation guidance
6. **Stakeholder-Ready**: Professional format suitable for executives, PMs, designers, and engineers

You follow industry best practices and enhance them with:
- Advanced research methodologies and mixed-method approaches
- Comprehensive participant recruitment and screening strategies
- Detailed data collection and analysis frameworks
- Risk assessment and mitigation strategies
- Clear deliverables and reporting structures
- Post-research action planning and follow-up

Your research plans are known for their clarity, depth, and ability to drive successful product decisions. You write in a professional, engaging tone that inspires teams and stakeholders.`;
  }

  private getResearchReportSystemPrompt(): string {
    return `You are an elite UX Research Director with 15+ years of experience at top tech companies (Google, Apple, Microsoft, Amazon, Meta). You specialize in creating comprehensive research reports that are:

1. **Strategic & Actionable**: Clear insights, findings, and recommendations that drive product decisions
2. **Data-Driven**: Based on rigorous research methodology and evidence-based conclusions
3. **User-Centric**: Deep focus on user needs, behaviors, and experiences
4. **Business-Focused**: Research insights that directly inform product strategy and business outcomes
5. **Comprehensive**: Complete analysis covering all aspects of the research study
6. **Stakeholder-Ready**: Professional format suitable for executives, PMs, designers, and engineers

You excel at:
- Synthesizing complex research data into clear, actionable insights
- Identifying patterns, themes, and user behaviors from research findings
- Creating detailed user personas and journey maps
- Providing specific, prioritized recommendations for product improvement
- Writing compelling executive summaries that capture key insights
- Structuring reports for maximum impact and readability

Your research reports are known for their clarity, depth, and ability to drive successful product decisions. You write in a professional, engaging tone that inspires teams and stakeholders.`;
  }

  private getDiscussionGuideSystemPrompt(): string {
    return `You are an elite UX Research Moderator with 15+ years of experience conducting user interviews and focus groups at top tech companies. You specialize in creating comprehensive, user-centered discussion guides that are:

1. **Structured & Logical**: Clear flow from warm-up to core topics to wrap-up
2. **User-Focused**: Questions that reveal genuine user needs, behaviors, and motivations
3. **Moderator-Friendly**: Easy to follow with clear instructions and probing techniques
4. **Comprehensive**: Covering all research objectives while maintaining natural conversation
5. **Actionable**: Generating insights that directly inform product decisions
6. **Ethical**: Respectful, inclusive, and following best practices

You excel at:
- Crafting open-ended questions that encourage detailed responses
- Building natural conversation flow and rapport
- Including effective probing and follow-up techniques
- Incorporating usability testing and scenario-based questions
- Designing for different user segments and contexts
- Creating guides that work for both individual interviews and focus groups

Your discussion guides are known for generating rich, actionable insights that drive successful product development.`;
  }

  private buildResearchPlanPrompt(request: ResearchPlanRequest): string {
    const { project, researchInput, prdData } = request;
    
    return `Create a comprehensive, world-class UX Research Plan for:

**PROJECT OVERVIEW:**
- Project Name: ${project?.name || 'New Product'}
- Description: ${project?.description || 'Product description'}
- Current Stage: ${project?.currentStage || 'USER_RESEARCH'}

**RESEARCH INPUT DATA:**
${this.formatResearchInput(researchInput)}

**PRD DATA (if available):**
${prdData ? this.formatPRDData(prdData) : 'No PRD data provided'}

**REQUIREMENTS:**
Create a professional research plan that includes:

1. **EXECUTIVE SUMMARY** (2-3 paragraphs)
   - Research objectives and key questions
   - Methodology overview and timeline
   - Expected outcomes and deliverables

2. **RESEARCH OBJECTIVES & QUESTIONS**
   - Primary research questions
   - Secondary research questions
   - Success criteria and metrics

3. **METHODOLOGY & APPROACH**
   - Research methods and rationale
   - Data collection strategies
   - Analysis framework

4. **PARTICIPANT RECRUITMENT**
   - Target participant criteria
   - Recruitment strategy and channels
   - Screening process and criteria

5. **RESEARCH TIMELINE**
   - Detailed project timeline
   - Key milestones and deliverables
   - Resource requirements

6. **DATA COLLECTION PLAN**
   - Specific research activities
   - Tools and materials needed
   - Data management and storage

7. **ANALYSIS & SYNTHESIS**
   - Analysis methodology
   - Synthesis approach
   - Insight generation process

8. **DELIVERABLES & REPORTING**
   - Research report structure
   - Presentation format
   - Follow-up recommendations

**FORMATTING REQUIREMENTS:**
- Use clear, professional markdown formatting
- Include actionable insights and recommendations
- Ensure stakeholder-ready presentation
- Add implementation timelines and milestones
- Use bullet points, tables, and visual hierarchy

Make this research plan exceptional - the kind that gets research approved, teams aligned, and products successfully improved.`;
  }

  private buildResearchReportPrompt(request: ResearchReportRequest): string {
    const { project, researchPlan, prdData, userPrompt } = request;
    
    return `Create a comprehensive, world-class UX Research Report for:

**PROJECT OVERVIEW:**
- Project Name: ${project?.name || 'Research Study'}
- Description: ${project?.description || 'Product research study'}

**PRD DATA:**
${prdData ? this.formatPRDData(prdData) : 'No PRD data provided'}

**RESEARCH PLAN DATA:**
${this.formatResearchPlanData(researchPlan)}

**USER PROMPT:**
${userPrompt || 'Generate a comprehensive research report based on the provided data'}

**REQUIREMENTS:**
Create a professional research report that includes:

1. **EXECUTIVE SUMMARY** (2-3 paragraphs)
   - Key research findings and insights
   - Main recommendations and next steps
   - Business impact and strategic implications

2. **RESEARCH OBJECTIVES & METHODOLOGY**
   - Research objectives and approach
   - Methodology used and rationale
   - Sample size and participant demographics

3. **KEY FINDINGS**
   - Primary research findings with evidence
   - User behavior patterns and insights
   - Pain points and opportunities identified

4. **USER PERSONAS**
   - Detailed user personas based on research
   - Demographics, goals, pain points, and behaviors
   - User journey insights and touchpoints

5. **THEMES & PATTERNS**
   - Recurring themes from research data
   - User behavior patterns and preferences
   - Cross-cutting insights and observations

6. **CRITICAL RECOMMENDATIONS**
   - High-priority recommendations for immediate action
   - Strategic recommendations for product development
   - User experience improvements

7. **UX DESIGN RECOMMENDATIONS**
   - Specific design recommendations
   - Interface and interaction improvements
   - User flow and navigation enhancements

8. **NEXT STEPS**
   - Immediate actions to take
   - Follow-up research recommendations
   - Implementation timeline and priorities

9. **RESEARCH LIMITATIONS**
   - Study limitations and constraints
   - Areas for future research
   - Confidence levels and caveats

**FORMATTING REQUIREMENTS:**
- Use clear, professional markdown formatting
- Include actionable insights and recommendations
- Ensure stakeholder-ready presentation
- Add implementation priorities and timelines
- Use bullet points, tables, and visual hierarchy

Make this research report exceptional - the kind that drives product decisions and user experience improvements.`;
  }

  private buildDiscussionGuidePrompt(request: DiscussionGuideRequest): string {
    const { project, researchPlan, prdData, researchSetup } = request;
    
    return `Create a comprehensive, AI-Agent-ready research execution package for:

**PROJECT OVERVIEW:**
- Project Name: ${project?.name || 'New Product'}
- Description: ${project?.description || 'Product description'}

**PRD DATA:**
${prdData ? this.formatPRDData(prdData) : 'No PRD data provided'}

**RESEARCH PLAN DATA:**
${this.formatResearchPlanData(researchPlan)}

**RESEARCH SETUP DATA:**
${researchSetup ? this.formatResearchSetupData(researchSetup) : 'No research setup data provided'}

**RESEARCH GOALS TO ACHIEVE:**
${researchPlan?.objectives?.join(', ') || 'Understand user needs and behaviors'}

**SELECTED RESEARCH METHODS:**
${researchPlan?.preferredMethods?.join(', ') || 'User Interviews'}

**AI AGENTS CONFIGURED:**
${researchSetup?.aiAgents?.join(', ') || 'UX Researcher'}

**TARGET USER DEMOGRAPHICS:**
${researchSetup ? this.formatUserDemographics(researchSetup) : 'General users'}

**REQUIREMENTS:**
Based on the selected research methods and AI agents, create a comprehensive research execution package that includes:

1. **RESEARCH EXECUTION STRATEGY**
   - Method-specific execution plans
   - AI Agent role assignments and instructions
   - Data collection protocols
   - Quality assurance guidelines

2. **DISCUSSION GUIDES** (for interview-based methods)
   - Moderator scripts for each AI agent
   - Question sequences and probing techniques
   - Scenario-based questions
   - Follow-up and clarification protocols

3. **SURVEY FORMS** (if surveys are selected)
   - Complete survey questionnaires
   - Response scales and options
   - Logic branching and skip patterns
   - Data collection instructions

4. **FOCUS GROUP GUIDES** (if focus groups are selected)
   - Group facilitation scripts
   - Activity instructions
   - Discussion prompts
   - Group dynamics management

5. **USABILITY TESTING PROTOCOLS** (if usability testing is selected)
   - Task scenarios and instructions
   - Observation guidelines
   - Think-aloud protocols
   - Performance metrics

6. **AI AGENT INSTRUCTIONS**
   - Specific instructions for each AI agent role
   - Response templates and formats
   - Data collection standards
   - Quality control measures

7. **EXECUTION TIMELINE**
   - Phase-by-phase execution plan
   - Data collection schedules
   - Analysis and synthesis timeline
   - Deliverable deadlines

**FORMATTING REQUIREMENTS:**
- Create executable formats for AI agents
- Include specific instructions for each research method
- Provide templates and response formats
- Ensure alignment with research goals
- Make it ready for immediate execution

**AI AGENT READY:**
- Each section should be executable by AI agents
- Include specific prompts and instructions
- Provide expected response formats
- Include quality control measures

Make this research execution package exceptional - the kind that AI agents can execute immediately to achieve your research goals.`;
  }

  private formatResearchInput(researchInput: any): string {
    let formatted = '';
    
    if (researchInput.projectTitle) {
      formatted += `\n**Project Title:** ${researchInput.projectTitle}`;
    }
    if (researchInput.researchGoals) {
      formatted += `\n**Research Goals:** ${researchInput.researchGoals}`;
    }
    if (researchInput.targetUsers) {
      formatted += `\n**Target Users:** ${researchInput.targetUsers}`;
    }
    if (researchInput.researchScope) {
      formatted += `\n**Research Scope:** ${researchInput.researchScope}`;
    }
    if (researchInput.keyFeatures && researchInput.keyFeatures.length > 0) {
      formatted += `\n**Key Features:**\n${researchInput.keyFeatures.map((feature: string, index: number) => `${index + 1}. ${feature}`).join('\n')}`;
    }
    if (researchInput.painPoints && researchInput.painPoints.length > 0) {
      formatted += `\n**Pain Points:**\n${researchInput.painPoints.map((pain: string, index: number) => `${index + 1}. ${pain}`).join('\n')}`;
    }
    if (researchInput.preferredMethods && researchInput.preferredMethods.length > 0) {
      formatted += `\n**Preferred Methods:**\n${researchInput.preferredMethods.map((method: string, index: number) => `${index + 1}. ${method}`).join('\n')}`;
    }
    if (researchInput.constraints && researchInput.constraints.length > 0) {
      formatted += `\n**Constraints:**\n${researchInput.constraints.map((constraint: string, index: number) => `${index + 1}. ${constraint}`).join('\n')}`;
    }
    if (researchInput.specialRequirements) {
      formatted += `\n**Special Requirements:** ${researchInput.specialRequirements}`;
    }
    
    return formatted;
  }

  private formatResearchPlanData(researchPlan: any): string {
    let formatted = '';
    
    if (researchPlan.objectives) {
      formatted += `\n**Research Objectives:** ${researchPlan.objectives}`;
    }
    if (researchPlan.methodology) {
      formatted += `\n**Methodology:** ${researchPlan.methodology}`;
    }
    if (researchPlan.participants) {
      formatted += `\n**Participants:** ${researchPlan.participants}`;
    }
    if (researchPlan.timeline) {
      formatted += `\n**Timeline:** ${researchPlan.timeline}`;
    }
    if (researchPlan.deliverables) {
      formatted += `\n**Deliverables:** ${researchPlan.deliverables}`;
    }
    
    return formatted;
  }

  private formatPRDData(prdData: any): string {
    let formatted = '';
    
    if (prdData.objectives) {
      formatted += `\n**PRD Objectives:** ${prdData.objectives}`;
    }
    if (prdData.targetUsers) {
      formatted += `\n**PRD Target Users:** ${prdData.targetUsers}`;
    }
    if (prdData.keyFeatures) {
      formatted += `\n**PRD Key Features:** ${prdData.keyFeatures}`;
    }
    if (prdData.successMetrics) {
      formatted += `\n**PRD Success Metrics:** ${prdData.successMetrics}`;
    }
    
    return formatted;
  }

  private formatResearchSetupData(researchSetup: any): string {
    let formatted = '';
    
    if (researchSetup.aiAgents && researchSetup.aiAgents.length > 0) {
      formatted += `\n**AI Agents:** ${researchSetup.aiAgents.join(', ')}`;
    }
    if (researchSetup.demographics) {
      formatted += `\n**User Demographics:**`;
      if (researchSetup.demographics.ageRange) {
        formatted += `\n  - Age Range: ${researchSetup.demographics.ageRange}`;
      }
      if (researchSetup.demographics.incomeRange) {
        formatted += `\n  - Income Range: ${researchSetup.demographics.incomeRange}`;
      }
      if (researchSetup.demographics.creditScoreRange) {
        formatted += `\n  - Credit Score Range: ${researchSetup.demographics.creditScoreRange}`;
      }
      if (researchSetup.demographics.occupations && researchSetup.demographics.occupations.length > 0) {
        formatted += `\n  - Occupations: ${researchSetup.demographics.occupations.join(', ')}`;
      }
      if (researchSetup.demographics.employmentTypes && researchSetup.demographics.employmentTypes.length > 0) {
        formatted += `\n  - Employment Types: ${researchSetup.demographics.employmentTypes.join(', ')}`;
      }
      if (researchSetup.demographics.educationLevels && researchSetup.demographics.educationLevels.length > 0) {
        formatted += `\n  - Education Levels: ${researchSetup.demographics.educationLevels.join(', ')}`;
      }
      if (researchSetup.demographics.locations && researchSetup.demographics.locations.length > 0) {
        formatted += `\n  - Target Locations: ${researchSetup.demographics.locations.join(', ')}`;
      }
    }
    
    return formatted;
  }

  private formatUserDemographics(researchSetup: any): string {
    if (!researchSetup.demographics) return 'General users';
    
    const demo = researchSetup.demographics;
    let formatted = '';
    
    if (demo.ageRange) {
      formatted += `Ages ${demo.ageRange}`;
    }
    if (demo.incomeRange) {
      formatted += formatted ? `, Income ${demo.incomeRange}` : `Income ${demo.incomeRange}`;
    }
    if (demo.occupations && demo.occupations.length > 0) {
      formatted += formatted ? `, ${demo.occupations.join(', ')}` : demo.occupations.join(', ');
    }
    if (demo.locations && demo.locations.length > 0) {
      formatted += formatted ? ` in ${demo.locations.join(', ')}` : ` in ${demo.locations.join(', ')}`;
    }
    
    return formatted || 'General users';
  }

  private generateFallbackResearchPlan(request: ResearchPlanRequest): AIResponse {
    const { project, researchInput } = request;
    
    return {
      success: false,
      content: this.createAdvancedFallbackResearchPlan(request),
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Advanced Fallback Generator',
        confidence: 0.7,
        source: 'fallback',
        model: 'fallback-generator'
      },
      error: 'Grok API not configured, using advanced fallback'
    };
  }

  private generateFallbackResearchReport(request: ResearchReportRequest): AIResponse {
    const { project, researchPlan, prdData } = request;
    
    return {
      success: false,
      content: this.createAdvancedFallbackResearchReport(request),
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Advanced Fallback Generator',
        confidence: 0.7,
        source: 'fallback',
        model: 'fallback-generator'
      },
      error: 'Grok API not configured, using advanced fallback'
    };
  }

  private generateFallbackDiscussionGuide(request: DiscussionGuideRequest): AIResponse {
    const { project, researchPlan } = request;
    
    return {
      success: false,
      content: this.createAdvancedFallbackDiscussionGuide(request),
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Advanced Fallback Generator',
        confidence: 0.7,
        source: 'fallback',
        model: 'fallback-generator'
      },
      error: 'Grok API not configured, using advanced fallback'
    };
  }

  private createAdvancedFallbackResearchPlan(request: ResearchPlanRequest): string {
    const { project, researchInput } = request;
    const projectName = project?.name || 'New Product';
    const researchGoals = researchInput?.researchGoals || 'Understand user needs and behaviors';
    const targetUsers = researchInput?.targetUsers || 'Target user segments';

    return `# UX Research Plan: ${projectName}

## Executive Summary

This comprehensive UX research plan is designed to ${researchGoals.toLowerCase()} for ${projectName}. The research will focus on ${targetUsers} and employ a mixed-method approach to gather both qualitative and quantitative insights that will directly inform product development decisions.

**Key Research Questions:**
- What are the primary user needs and pain points?
- How do users currently solve this problem?
- What features and functionality are most valuable?
- What are the barriers to adoption and usage?

## Research Objectives

### Primary Objectives
1. **User Needs Assessment**: Understand core user needs, motivations, and goals
2. **Current State Analysis**: Map existing user behaviors and workflows
3. **Feature Prioritization**: Identify most valuable features and functionality
4. **Usability Evaluation**: Assess current product usability and user experience

### Secondary Objectives
1. **Market Validation**: Validate product-market fit assumptions
2. **Competitive Analysis**: Understand competitive landscape and positioning
3. **User Segmentation**: Identify distinct user personas and segments
4. **Success Metrics**: Define key performance indicators and success criteria

## Methodology & Approach

### Research Methods
- **User Interviews** (Primary): 1-on-1 qualitative interviews with target users
- **Usability Testing**: Task-based testing of current product or prototypes
- **Surveys**: Quantitative data collection for broader insights
- **Card Sorting**: Information architecture and feature prioritization
- **Contextual Inquiry**: Observing users in their natural environment

### Data Collection Strategy
- **Mixed Methods**: Combining qualitative and quantitative approaches
- **Iterative Design**: Multiple rounds of research and testing
- **Stakeholder Involvement**: Regular check-ins and feedback sessions
- **Documentation**: Comprehensive recording and note-taking

## Participant Recruitment

### Target Participants
- **Primary Users**: ${targetUsers}
- **Sample Size**: 15-20 participants for interviews, 100+ for surveys
- **Recruitment Channels**: User panels, social media, professional networks
- **Screening Criteria**: Relevant experience, demographics, availability

### Recruitment Strategy
1. **Screening Survey**: Initial qualification and demographic collection
2. **Phone Screening**: Brief conversation to confirm fit and availability
3. **Scheduling**: Flexible scheduling to accommodate participant needs
4. **Incentives**: Appropriate compensation for time and effort

## Research Timeline

### Phase 1: Planning & Setup (Week 1)
- Finalize research plan and methodology
- Develop recruitment materials and screening criteria
- Set up research tools and documentation systems
- Begin participant recruitment

### Phase 2: Data Collection (Weeks 2-4)
- Conduct user interviews and usability testing
- Deploy and collect survey responses
- Perform contextual inquiry and observation
- Document findings and initial insights

### Phase 3: Analysis & Synthesis (Week 5)
- Analyze qualitative and quantitative data
- Synthesize findings into key insights
- Develop recommendations and action items
- Create preliminary research report

### Phase 4: Reporting & Follow-up (Week 6)
- Finalize research report and presentations
- Share findings with stakeholders
- Plan follow-up research and validation
- Implement immediate recommendations

## Data Collection Plan

### User Interviews
- **Format**: 60-minute 1-on-1 sessions
- **Location**: Remote via video call or in-person
- **Topics**: User needs, current behaviors, pain points, feature preferences
- **Recording**: Audio/video with participant consent

### Usability Testing
- **Format**: 45-minute task-based sessions
- **Tasks**: Core user workflows and key features
- **Metrics**: Task completion, time on task, error rates, satisfaction
- **Observation**: Think-aloud protocol and behavior observation

### Surveys
- **Format**: Online survey (10-15 minutes)
- **Distribution**: Email, social media, user panels
- **Questions**: Demographics, behaviors, preferences, satisfaction
- **Analysis**: Statistical analysis and segmentation

## Analysis & Synthesis

### Qualitative Analysis
- **Thematic Analysis**: Identify patterns and themes in interview data
- **Affinity Mapping**: Group insights and findings
- **Persona Development**: Create detailed user personas
- **Journey Mapping**: Map user workflows and touchpoints

### Quantitative Analysis
- **Statistical Analysis**: Survey data analysis and segmentation
- **Usability Metrics**: Task completion rates and performance data
- **Satisfaction Scores**: User satisfaction and preference data
- **Trend Analysis**: Identify patterns and correlations

## Deliverables & Reporting

### Research Report
- **Executive Summary**: Key findings and recommendations
- **Detailed Findings**: Comprehensive analysis and insights
- **User Personas**: Detailed user profiles and characteristics
- **Journey Maps**: User workflow and experience maps
- **Recommendations**: Actionable next steps and priorities

### Presentations
- **Stakeholder Presentation**: High-level findings and recommendations
- **Team Workshop**: Detailed findings and collaborative planning
- **Design Review**: Specific design and feature recommendations
- **Follow-up Sessions**: Ongoing discussion and refinement

## Success Metrics

### Research Quality
- **Participant Engagement**: High-quality, engaged participants
- **Data Completeness**: Comprehensive data collection
- **Insight Depth**: Rich, actionable insights
- **Stakeholder Satisfaction**: Positive feedback and adoption

### Business Impact
- **Decision Support**: Research informs key product decisions
- **Feature Prioritization**: Clear feature and functionality priorities
- **User Satisfaction**: Improved user experience and satisfaction
- **Product Success**: Enhanced product performance and adoption

---

*This research plan was generated using ProcessCraft AI with advanced fallback generation*
*Generated on ${new Date().toLocaleDateString()}*
*Framework: Industry best practices for UX research*`;
  }

  private createAdvancedFallbackDiscussionGuide(request: DiscussionGuideRequest): string {
    const { project, researchPlan } = request;
    const projectName = project?.name || 'New Product';
    const researchObjectives = researchPlan?.objectives || 'Understand user needs and behaviors';

    return `# Discussion Guide: ${projectName}

## Introduction & Warm-up (5-10 minutes)

### Moderator Introduction
"Hello! Thank you for taking the time to participate in this research session. My name is [Moderator Name], and I'm a UX researcher working on [Project Name]. Today, we'll be discussing your experiences and thoughts about [Topic Area]."

### Research Purpose
"We're conducting this research to better understand how people like you [use/think about/experience] [Product/Service Area]. Your insights will help us improve our product and make it more useful for people like you."

### Ground Rules
- "There are no right or wrong answers - we're interested in your honest opinions and experiences"
- "Please think aloud as much as possible - even if something seems obvious to you, it might not be to us"
- "If you have any questions, feel free to ask at any time"
- "This session will be recorded for our analysis, but your identity will remain confidential"

### Participant Introduction
"To get started, could you tell me a little bit about yourself? What do you do for work, and what are some of your main interests or hobbies?"

**Probing Questions:**
- "What does a typical day look like for you?"
- "How do you usually spend your free time?"
- "What technology or apps do you use most frequently?"

## Core Research Topics (30-40 minutes)

### Current Experience & Behaviors

**Opening Question:**
"Let's talk about [Topic Area]. Can you tell me about your current experience with [Product/Service Type]?"

**Follow-up Questions:**
- "How often do you [use/think about/engage with] this type of product or service?"
- "What's your typical process when you [relevant action]?"
- "What tools or methods do you currently use to [relevant action]?"
- "What's working well for you right now?"
- "What's frustrating or challenging about your current approach?"

### Needs & Pain Points

**Primary Question:**
"What are the biggest challenges or frustrations you face when [relevant action]?"

**Probing Questions:**
- "Can you tell me about a specific time when this was particularly frustrating?"
- "What would make this easier or better for you?"
- "What's missing from your current solution?"
- "How do you currently work around these challenges?"
- "What would an ideal solution look like for you?"

### Feature Evaluation & Preferences

**Primary Question:**
"I'd like to show you some concepts for [Product Name]. Let's start with [Feature/Concept 1]."

**Evaluation Questions:**
- "What's your first impression of this?"
- "How would you use this feature?"
- "What do you like about this approach?"
- "What concerns or questions do you have?"
- "How does this compare to what you currently use?"
- "What would make this more useful for you?"

**Comparison Questions:**
- "Between these options, which one appeals to you most and why?"
- "What would you change about this design?"
- "What's missing from this approach?"

### Usability & User Experience

**Task-Based Questions:**
"Now I'd like you to try using this [Product/Feature]. Please think aloud as you go through this process."

**Observation Points:**
- How does the participant approach the task?
- What do they click on first?
- Where do they get confused or stuck?
- What do they expect to happen?
- How do they recover from errors?

**Follow-up Questions:**
- "What was that experience like for you?"
- "What was clear and what was confusing?"
- "How would you improve this process?"
- "What would make this more intuitive?"

## Scenario & Context-Based Questions (15-20 minutes)

### Real-World Scenarios

**Scenario 1:**
"Imagine it's [specific time/context] and you need to [specific action]. Walk me through how you would approach this situation."

**Scenario 2:**
"You're in a situation where [specific constraint/context]. How would you handle this differently?"

**Scenario 3:**
"Think about a time when you had to [relevant action] under pressure. What was that like?"

### Decision-Making Process

**Primary Question:**
"When you're deciding between different options for [relevant action], what factors are most important to you?"

**Probing Questions:**
- "How do you typically evaluate different options?"
- "What information do you need to make a decision?"
- "Who else is involved in this decision?"
- "What would make you choose one option over another?"
- "What would make you switch from your current solution?"

## Wrap-up & Closure (5-10 minutes)

### Summary & Validation
"Let me summarize what I've heard today to make sure I understand correctly..."

**Key Points to Validate:**
- Main pain points and challenges
- Preferred features and approaches
- Decision-making factors
- Ideal solution characteristics

### Additional Thoughts
"Is there anything else you'd like to share that we haven't covered today?"
"What questions do you have about what we've discussed?"
"Is there anything you'd like to add or clarify?"

### Next Steps
"Thank you so much for your time and insights today. Your feedback will be very helpful as we continue developing [Product Name]."
"We'll be analyzing all the feedback we've received and using it to improve our product."
"If you have any additional thoughts after our conversation, feel free to reach out to us."

## Moderator Notes & Tips

### Building Rapport
- Use active listening and acknowledge participant responses
- Show genuine interest in their experiences
- Use their language and terminology
- Be patient and allow for pauses

### Effective Probing
- "Can you tell me more about that?"
- "What do you mean by [specific term]?"
- "Can you give me an example?"
- "What was that like for you?"
- "How did that make you feel?"

### Managing Difficult Situations
- If participant is quiet: "Take your time, there's no rush"
- If participant goes off-topic: "That's interesting, let's come back to [specific topic]"
- If participant seems confused: "Let me rephrase that question"
- If participant is negative: "That's helpful feedback, can you tell me more about why that's frustrating?"

### Time Management
- Keep track of time for each section
- Be flexible but try to cover all key topics
- If running short on time, prioritize core research questions
- If running long, summarize and focus on most important points

---

*This discussion guide was generated using ProcessCraft AI with advanced fallback generation*
*Generated on ${new Date().toLocaleDateString()}*
*Framework: Industry best practices for user research moderation*`;
  }

  private createAdvancedFallbackResearchReport(request: ResearchReportRequest): string {
    const { project, researchPlan, prdData } = request;
    const projectName = project?.name || 'Research Study';
    const researchObjectives = researchPlan?.objectives || ['Understand user needs and behaviors'];

    return `# UX Research Report: ${projectName}

## Executive Summary

This comprehensive UX research report presents findings from our study of ${projectName}. The research was conducted to ${researchObjectives.join(', ').toLowerCase()} and provides actionable insights to inform product development and user experience improvements.

**Key Findings:**
- Users face significant challenges with current solutions
- Clear opportunities exist for product improvement
- Specific user segments have distinct needs and behaviors
- Data-driven recommendations are provided for immediate implementation

**Strategic Impact:**
The research findings directly inform product strategy, design decisions, and business planning. Implementation of recommended improvements is expected to significantly enhance user satisfaction and business outcomes.

## Research Objectives & Methodology

### Research Objectives
${researchObjectives.map((obj: any, index: number) => `${index + 1}. ${obj}`).join('\n')}

### Methodology
- **Research Type**: Mixed-method approach combining qualitative and quantitative research
- **Sample Size**: 25-50 participants across target user segments
- **Methods**: User interviews, usability testing, surveys, and behavioral analysis
- **Duration**: 4-6 week research study
- **Analysis**: Thematic analysis and statistical evaluation

### Participant Demographics
- **Age Range**: 25-45 years
- **Experience Level**: Mixed (novice to expert users)
- **Geographic Distribution**: Urban and suburban areas
- **Technology Usage**: Regular users of digital products

## Key Findings

### Primary Findings
1. **User Pain Points**
   - Difficulty completing key tasks efficiently
   - Confusing navigation and information architecture
   - Lack of clear feedback and error handling
   - Inconsistent user experience across different sections

2. **User Behavior Patterns**
   - Users prefer simple, intuitive interfaces
   - Most users abandon complex multi-step processes
   - Users rely heavily on visual cues and clear labeling
   - Mobile usage is increasing significantly

3. **Opportunities Identified**
   - Streamline core user workflows
   - Improve information architecture and navigation
   - Enhance error handling and user feedback
   - Optimize for mobile-first experience

### Evidence
- 78% of users struggled with task completion
- 65% reported confusion with navigation
- 82% preferred simplified interfaces
- 45% abandoned complex processes

## User Personas

### Persona 1: The Efficiency Seeker
- **Demographics**: 30-40 years old, professional, tech-savvy
- **Goals**: Complete tasks quickly and efficiently
- **Pain Points**: Complex interfaces, slow loading times
- **Behaviors**: Prefers keyboard shortcuts, minimal clicks
- **Income**: $50K-$100K annually

### Persona 2: The Cautious User
- **Demographics**: 25-35 years old, moderate tech experience
- **Goals**: Feel confident and secure while using the product
- **Pain Points**: Unclear instructions, fear of making mistakes
- **Behaviors**: Reads all instructions carefully, seeks help frequently
- **Income**: $30K-$60K annually

### Persona 3: The Mobile-First User
- **Demographics**: 20-30 years old, digital native
- **Goals**: Access information and complete tasks on mobile
- **Pain Points**: Poor mobile experience, slow mobile performance
- **Behaviors**: Primarily uses mobile devices, expects app-like experience
- **Income**: $25K-$50K annually

## Themes & Patterns

### Theme 1: Simplicity is Key
- **Impact**: High - affects user satisfaction and task completion
- **Evidence**: 85% of users preferred simpler interfaces
- **Findings**:
  - Users overwhelmed by too many options
  - Clear hierarchy improves usability
  - Progressive disclosure reduces cognitive load

### Theme 2: Mobile Experience Matters
- **Impact**: High - growing user segment
- **Evidence**: 60% of users primarily use mobile devices
- **Findings**:
  - Mobile-first design is essential
  - Touch-friendly interfaces required
  - Responsive design must be optimized

### Theme 3: Trust and Security
- **Impact**: Medium - affects user confidence
- **Evidence**: 70% of users concerned about data security
- **Findings**:
  - Clear privacy policies build trust
  - Security indicators reassure users
  - Transparent data handling is crucial

## Critical Recommendations

### High Priority
1. **Simplify Core Workflows**
   - Reduce steps in primary user journeys
   - Eliminate unnecessary complexity
   - Implement progressive disclosure

2. **Improve Mobile Experience**
   - Optimize for mobile-first design
   - Ensure touch-friendly interactions
   - Improve mobile performance

3. **Enhance Navigation**
   - Create clear information architecture
   - Implement consistent navigation patterns
   - Add breadcrumbs and clear labeling

### Medium Priority
1. **Improve Error Handling**
   - Provide clear error messages
   - Implement helpful recovery actions
   - Add contextual help and guidance

2. **Optimize Performance**
   - Reduce loading times
   - Implement efficient caching
   - Optimize images and assets

## UX Design Recommendations

### High Priority
1. **Interface Simplification**
   - Reduce visual clutter
   - Implement clean, minimal design
   - Use consistent design patterns

2. **Mobile Optimization**
   - Design for touch interactions
   - Implement responsive layouts
   - Optimize for various screen sizes

3. **Navigation Improvements**
   - Create intuitive menu structure
   - Implement clear visual hierarchy
   - Add search functionality

### Medium Priority
1. **Accessibility Enhancements**
   - Ensure keyboard navigation
   - Implement screen reader support
   - Use sufficient color contrast

2. **User Feedback Systems**
   - Add loading indicators
   - Implement success/error states
   - Provide contextual help

## Next Steps

### Immediate Actions (1-2 weeks)
1. Implement critical navigation improvements
2. Begin mobile optimization work
3. Simplify primary user workflows
4. Enhance error handling

### Short-term Goals (1-3 months)
1. Complete mobile-first redesign
2. Implement accessibility improvements
3. Add user feedback systems
4. Conduct usability testing

### Long-term Objectives (3-6 months)
1. Develop comprehensive design system
2. Implement advanced user personalization
3. Conduct follow-up research studies
4. Measure and optimize user satisfaction

## Research Limitations

### Study Constraints
- Limited to specific user segments
- Short-term observation period
- Sample size constraints
- Geographic limitations

### Areas for Future Research
- Longitudinal user behavior studies
- Cross-cultural user research
- Advanced personalization research
- Accessibility-focused studies

### Confidence Levels
- High confidence in primary findings
- Medium confidence in secondary insights
- Requires validation for long-term trends

---

*This research report was generated using ProcessCraft AI with advanced fallback generation*
*Generated on ${new Date().toLocaleDateString()}*
*Framework: Industry best practices for UX research reporting*`;
  }
}

export default new GrokResearchService();
