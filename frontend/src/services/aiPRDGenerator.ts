import OpenAI from 'openai';

interface PRDContext {
  title: string;
  description: string;
  type: string;
  priority: string;
  targetAudience: string;
  businessGoals: string;
  constraints: string;
  aiPrompt: string;
  projectName: string;
}

interface PRDSection {
  title: string;
  content: string;
  confidence: number;
}

type ProgressCallback = (step: string, message: string) => void;

class AIPRDGenerator {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    // Get API key from environment
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    
    if (this.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true // Note: In production, use a backend proxy
      });
    }
  }

  private async generateWithAI(prompt: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert Product Manager and technical writer. Create detailed, professional PRD content that is clear, actionable, and follows industry best practices. Be specific, use measurable metrics, and include real-world examples.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw error;
    }
  }

  async generateCompletePRD(
    context: PRDContext,
    onProgress: ProgressCallback
  ): Promise<PRDSection[]> {
    const sections: PRDSection[] = [];

    try {
      // 1. Executive Summary
      onProgress('analyzing', 'Analyzing your requirements and building context...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      onProgress('generating-overview', 'Creating executive summary...');
      const executiveSummary = await this.generateExecutiveSummary(context);
      sections.push(executiveSummary);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Product Objectives
      onProgress('generating-goals', 'Defining product objectives and success criteria...');
      const objectives = await this.generateObjectives(context);
      sections.push(objectives);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Target Users & Personas
      onProgress('generating-users', 'Identifying target users and creating personas...');
      const users = await this.generateUserPersonas(context);
      sections.push(users);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Features & Requirements
      onProgress('generating-features', 'Outlining key features and technical requirements...');
      const features = await this.generateFeatures(context);
      sections.push(features);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 5. Success Metrics
      onProgress('generating-metrics', 'Setting success metrics and KPIs...');
      const metrics = await this.generateMetrics(context);
      sections.push(metrics);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 6. Risks & Mitigation
      onProgress('generating-risks', 'Assessing risks and mitigation strategies...');
      const risks = await this.generateRisks(context);
      sections.push(risks);
      await new Promise(resolve => setTimeout(resolve, 1000));

      onProgress('finalizing', 'Finalizing your PRD...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      return sections;
    } catch (error) {
      console.error('Error generating PRD:', error);
      throw error;
    }
  }

  private async generateExecutiveSummary(context: PRDContext): Promise<PRDSection> {
    const prompt = `
Create an executive summary for a ${context.type} PRD titled "${context.title}" for project "${context.projectName}".

Brief Description: ${context.description}
Target Audience: ${context.targetAudience || 'General users'}
Business Goals: ${context.businessGoals || 'Not specified'}
Priority: ${context.priority}
Additional Context: ${context.aiPrompt || 'None'}

Write a compelling 2-3 paragraph executive summary that:
1. Clearly states the problem being solved
2. Explains the proposed solution and its value proposition
3. Highlights the expected business impact and key benefits
4. Mentions the target audience and strategic alignment

Make it concise, professional, and persuasive. Use specific metrics where possible.
`;

    const content = await this.generateWithAI(prompt);
    
    return {
      title: 'Executive Summary',
      content: content.trim(),
      confidence: 92
    };
  }

  private async generateObjectives(context: PRDContext): Promise<PRDSection> {
    const prompt = `
Define product objectives for "${context.title}".

Context:
- Description: ${context.description}
- Business Goals: ${context.businessGoals || 'Improve user experience and business metrics'}
- Target Users: ${context.targetAudience || 'General users'}
- Priority: ${context.priority}

Create a detailed objectives section with:
1. **Primary Goals** (3-5 main objectives with specific, measurable outcomes)
2. **Success Criteria** (How we'll know we've succeeded - include specific metrics)
3. **Business Impact** (Expected revenue, cost savings, or efficiency gains)
4. **User Impact** (How this improves user experience)

Format with markdown. Be specific with numbers and timeframes.
`;

    const content = await this.generateWithAI(prompt);
    
    return {
      title: 'Product Objectives',
      content: content.trim(),
      confidence: 90
    };
  }

  private async generateUserPersonas(context: PRDContext): Promise<PRDSection> {
    const prompt = `
Create detailed user personas for "${context.title}".

Target Audience: ${context.targetAudience || 'General users'}
Description: ${context.description}
Business Goals: ${context.businessGoals || 'Not specified'}

Create 2-3 detailed user personas, each including:
1. **Persona Name & Role** (e.g., "Sarah - The Busy Professional")
2. **Demographics** (Age, profession, tech-savviness)
3. **Needs & Goals** (What they're trying to accomplish)
4. **Pain Points** (Current frustrations and challenges)
5. **Expected Outcomes** (What success looks like for them)
6. **User Journey Touchpoints** (Key interactions)

Make them realistic and specific. Focus on their motivations and behaviors.
`;

    const content = await this.generateWithAI(prompt);
    
    return {
      title: 'Target Users & Personas',
      content: content.trim(),
      confidence: 88
    };
  }

  private async generateFeatures(context: PRDContext): Promise<PRDSection> {
    const prompt = `
Define key features and requirements for "${context.title}".

Description: ${context.description}
Type: ${context.type}
Constraints: ${context.constraints || 'None specified'}
Target Users: ${context.targetAudience || 'General users'}

Create a comprehensive features section with:

**Core Features** (Must-Have)
- List 4-6 essential features with brief descriptions
- Explain why each is critical
- Include user value for each

**Technical Requirements**
- Performance benchmarks (response time, uptime, etc.)
- Scalability requirements (concurrent users, data volume)
- Integration points (APIs, third-party services)
- Security requirements

**User Experience Requirements**
- Accessibility standards (WCAG 2.1)
- Responsive design needs
- Key user flows

**Phase 1 Scope** (What we're building first)
- Prioritized feature list for MVP

Format with markdown. Be specific and actionable.
`;

    const content = await this.generateWithAI(prompt);
    
    return {
      title: 'Key Features & Requirements',
      content: content.trim(),
      confidence: 91
    };
  }

  private async generateMetrics(context: PRDContext): Promise<PRDSection> {
    const prompt = `
Define success metrics and KPIs for "${context.title}".

Business Goals: ${context.businessGoals || 'Improve key business metrics'}
Priority: ${context.priority}
Type: ${context.type}

Create a metrics framework with:

**Key Performance Indicators (KPIs)**
1. User Engagement Metrics (DAU, session duration, retention)
2. Business Metrics (revenue impact, conversion rate, cost savings)
3. Quality Metrics (error rate, customer satisfaction, NPS)
4. Performance Metrics (load time, API response, uptime)

**Success Targets**
- 3-month targets (realistic early goals)
- 6-month targets (growth phase)
- 12-month targets (mature product)

**Measurement Strategy**
- How we'll track each metric
- Tools and dashboards needed
- Reporting cadence

Be specific with numbers. Use industry benchmarks where relevant.
`;

    const content = await this.generateWithAI(prompt);
    
    return {
      title: 'Success Metrics & KPIs',
      content: content.trim(),
      confidence: 89
    };
  }

  private async generateRisks(context: PRDContext): Promise<PRDSection> {
    const prompt = `
Identify risks and mitigation strategies for "${context.title}".

Type: ${context.type}
Priority: ${context.priority}
Constraints: ${context.constraints || 'None specified'}
Business Goals: ${context.businessGoals || 'Not specified'}

Create a comprehensive risk assessment with:

**Technical Risks**
- Potential technical challenges
- Integration complexities
- Scalability concerns
For each: Impact (High/Medium/Low), Likelihood, Mitigation strategy

**Business Risks**
- Market competition
- User adoption challenges
- Resource constraints
For each: Impact, Likelihood, Mitigation strategy

**Compliance & Security Risks**
- Data privacy concerns
- Regulatory requirements
- Security vulnerabilities
For each: Impact, Likelihood, Mitigation strategy

**Dependencies & Assumptions**
- External dependencies
- Key assumptions we're making
- What could invalidate our approach

Be realistic and actionable with mitigation strategies.
`;

    const content = await this.generateWithAI(prompt);
    
    return {
      title: 'Risks & Mitigation',
      content: content.trim(),
      confidence: 87
    };
  }

  isAvailable(): boolean {
    return this.openai !== null;
  }
}

export const aiPRDGenerator = new AIPRDGenerator();

