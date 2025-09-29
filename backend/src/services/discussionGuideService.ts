import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface DiscussionGuideRequest {
  project: any;
  personas: any[];
  cohorts: any[];
  config: any;
  userPrompt?: string;
}

interface DiscussionGuideResponse {
  success: boolean;
  guide: any;
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

class DiscussionGuideService {
  private claudeApiKey: string;
  private openaiApiKey: string;
  private claudeBaseURL: string = 'https://api.anthropic.com/v1';
  private openaiBaseURL: string = 'https://api.openai.com/v1';

  constructor() {
    this.claudeApiKey = process.env.CLAUDE_API_KEY || '';
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
    console.log('🔑 Discussion Guide Service initialized');
    console.log('Claude API Key available:', this.claudeApiKey ? 'YES' : 'NO');
    console.log('OpenAI API Key available:', this.openaiApiKey ? 'YES' : 'NO');
  }

  async generateDiscussionGuide(request: DiscussionGuideRequest): Promise<DiscussionGuideResponse> {
    const { project, personas, cohorts, config, userPrompt } = request;

    // Try Claude first for superior discussion guide generation
    if (this.claudeApiKey && this.claudeApiKey !== 'dummy-key') {
      try {
        console.log('🚀 Generating Discussion Guide with Claude 3.5 Sonnet...');
        const claudePrompt = this.buildClaudePrompt(project, personas, cohorts, config, userPrompt);
        
        const response = await axios.post(`${this.claudeBaseURL}/messages`, {
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 6000,
          temperature: 0.3,
          messages: [
            { role: "user", content: claudePrompt }
          ],
          system: this.getClaudeSystemPrompt()
        }, {
          headers: {
            'x-api-key': this.claudeApiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          timeout: 120000
        });

        const claudeResponse = response.data;
        const generatedContent = claudeResponse.content[0]?.text || '';

        if (generatedContent) {
          console.log('✅ Claude 3.5 Sonnet generated Discussion Guide successfully');
          const parsedGuide = this.parseDiscussionGuide(generatedContent);
          
          return {
            success: true,
            guide: parsedGuide,
            metadata: {
              generatedAt: new Date().toISOString(),
              generatedBy: 'Claude 3.5 Sonnet',
              confidence: 0.98,
              source: 'claude-api',
              model: 'claude-3-5-sonnet-20241022',
              tokens: (claudeResponse.usage?.input_tokens || 0) + (claudeResponse.usage?.output_tokens || 0)
            }
          };
        }
      } catch (error: any) {
        console.error('❌ Claude 3.5 Sonnet Discussion Guide generation failed:', error.response?.data || error.message);
      }
    }

    // Fallback to OpenAI if Claude fails or not configured
    if (this.openaiApiKey && this.openaiApiKey !== 'dummy-key') {
      try {
        console.log('🔄 Attempting Discussion Guide generation with OpenAI GPT-4o...');
        const openaiPrompt = this.buildOpenAIPrompt(project, personas, cohorts, config, userPrompt);
        
        const response = await axios.post(`${this.openaiBaseURL}/chat/completions`, {
          model: "gpt-4o",
          messages: [
            { role: "system", content: this.getOpenAISystemPrompt() },
            { role: "user", content: openaiPrompt }
          ],
          max_tokens: 6000,
          temperature: 0.3,
        }, {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        });

        const generatedContent = response.data.choices[0]?.message?.content || '';
        if (generatedContent) {
          console.log('✅ OpenAI GPT-4o generated Discussion Guide successfully');
          const parsedGuide = this.parseDiscussionGuide(generatedContent);
          
          return {
            success: true,
            guide: parsedGuide,
            metadata: {
              generatedAt: new Date().toISOString(),
              generatedBy: 'OpenAI GPT-4o',
              confidence: 0.95,
              source: 'openai-api',
              model: 'gpt-4o',
              tokens: response.data.usage?.total_tokens || 0
            }
          };
        }
      } catch (error: any) {
        console.error('❌ OpenAI GPT-4o Discussion Guide generation failed:', error.response?.data || error.message);
      }
    }

    // Final fallback to advanced internal generator
    console.log('🔄 Falling back to advanced internal Discussion Guide generator...');
    return {
      success: false,
      guide: this.generateAdvancedFallbackGuide(project, personas, cohorts, config, userPrompt),
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Advanced Fallback Generator',
        confidence: 0.8,
        source: 'internal-fallback',
        model: 'internal-generator'
      },
      error: 'All external AI models failed or not configured'
    };
  }

  private getClaudeSystemPrompt(): string {
    return `You are a world-class UX researcher and discussion guide expert with 15+ years of experience conducting user interviews at top tech companies like Google, Apple, and Microsoft. You specialize in creating comprehensive, actionable discussion guides that extract deep insights from users.

Your discussion guides are known for:
- Strategic questioning that reveals underlying motivations and behaviors
- Persona-specific questions that resonate with different user types
- Follow-up questions that dig deeper into responses
- Clear structure with timing and flow considerations
- Practical tips for moderators
- Expected responses and red flags to watch for

Generate discussion guides that are:
- Professional and comprehensive
- Easy to follow for moderators
- Designed to extract maximum insights
- Tailored to specific personas and use cases
- Include practical moderation tips
- Have clear objectives and success metrics

Always structure your response as a JSON object with the following format:
{
  "title": "Discussion Guide Title",
  "introduction": "Comprehensive introduction for moderators",
  "objectives": ["Primary objective 1", "Primary objective 2", "Primary objective 3"],
  "methodology": "Research methodology and approach",
  "duration": "Estimated duration",
  "sections": [
    {
      "id": "section-1",
      "title": "Section Title",
      "duration": "X minutes",
      "description": "What this section covers",
      "questions": [
        {
          "id": "q1",
          "question": "Main question text",
          "followUp": "Follow-up question",
          "category": "Question category",
          "persona": "Target persona (if specific)",
          "objective": "What this question aims to discover",
          "expectedResponse": "What kind of response to expect",
          "redFlags": "Warning signs to watch for",
          "moderatorTips": "Tips for the moderator"
        }
      ]
    }
  ],
  "moderatorGuidelines": {
    "preInterview": ["Preparation tip 1", "Preparation tip 2"],
    "duringInterview": ["Moderation tip 1", "Moderation tip 2"],
    "postInterview": ["Follow-up tip 1", "Follow-up tip 2"]
  },
  "successMetrics": ["Metric 1", "Metric 2", "Metric 3"]
}`;
  }

  private getOpenAISystemPrompt(): string {
    return `You are a world-class UX researcher and discussion guide expert with 15+ years of experience conducting user interviews at top tech companies. You specialize in creating comprehensive, actionable discussion guides that extract deep insights from users.

Generate discussion guides that are:
- Professional and comprehensive
- Easy to follow for moderators
- Designed to extract maximum insights
- Tailored to specific personas and use cases
- Include practical moderation tips
- Have clear objectives and success metrics

Always structure your response as a JSON object with sections, questions, and detailed guidance for moderators.`;
  }

  private buildClaudePrompt(project: any, personas: any[], cohorts: any[], config: any, userPrompt?: string): string {
    const personaDetails = personas.map(p => 
      `**${p.name}**: ${p.description}\n- Goals: ${p.goals?.join(', ') || 'Not specified'}\n- Pain Points: ${p.painPoints?.join(', ') || 'Not specified'}\n- Behaviors: ${p.behaviors?.join(', ') || 'Not specified'}\n- Demographics: ${JSON.stringify(p.demographics || {})}`
    ).join('\n\n');

    const cohortDetails = cohorts.map(c => 
      `**${c.name}**: ${c.description}\n- Demographics: ${JSON.stringify(c.demographics || {})}\n- Size: ${c.size || 'Not specified'}\n- Objectives: ${c.objectives?.join(', ') || 'Not specified'}`
    ).join('\n\n');

    return `Create a comprehensive, world-class discussion guide for the following research project:

**PROJECT DETAILS:**
- Project Name: ${project.name}
- Description: ${project.description}
- Current Stage: ${project.currentStage}
- Objectives: ${project.prd?.objectives?.join(', ') || 'Not specified'}

**USER PERSONAS:**
${personaDetails}

**RESEARCH COHORTS:**
${cohortDetails}

**RESEARCH CONFIGURATION:**
- Methodology: ${config.methodology || 'Semi-structured interviews'}
- Duration: ${config.duration || '60'} minutes
- Focus Areas: ${config.focusAreas?.join(', ') || 'General user research'}
- Custom Prompts: ${config.customPrompts || 'None'}
- Include Persona Questions: ${config.includePersonaQuestions ? 'Yes' : 'No'}
- Include Follow-ups: ${config.includeFollowUps ? 'Yes' : 'No'}

**SPECIFIC RESEARCH FOCUS:**
${userPrompt || 'General user research and feedback collection'}

**REQUIREMENTS:**
1. Create a comprehensive discussion guide that will extract deep insights about user needs, behaviors, and pain points
2. Include persona-specific questions that resonate with each user type
3. Design questions that reveal underlying motivations and decision-making processes
4. Include strategic follow-up questions that dig deeper into responses
5. Provide clear guidance for moderators on how to conduct effective interviews
6. Include timing recommendations for each section
7. Specify what responses to expect and what red flags to watch for
8. Make the guide practical and actionable for UX researchers

Focus on creating questions that will help the team understand:
- User needs and motivations
- Current pain points and frustrations
- Desired improvements and features
- Behavioral patterns and decision-making processes
- Emotional responses and attitudes
- Context of use and environmental factors

Generate a professional, comprehensive discussion guide that will enable the research team to conduct highly effective user interviews and extract maximum value from each session.`;
  }

  private buildOpenAIPrompt(project: any, personas: any[], cohorts: any[], config: any, userPrompt?: string): string {
    return this.buildClaudePrompt(project, personas, cohorts, config, userPrompt);
  }

  private parseDiscussionGuide(content: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, create a structured guide from the text
      return this.createStructuredGuideFromText(content);
    } catch (error) {
      console.error('Error parsing discussion guide:', error);
      return this.createStructuredGuideFromText(content);
    }
  }

  private createStructuredGuideFromText(content: string): any {
    // This is a fallback parser that creates a structured guide from text
    return {
      title: "AI-Generated Discussion Guide",
      introduction: "This discussion guide was generated by AI to help conduct effective user interviews.",
      objectives: ["Understand user needs", "Identify pain points", "Gather feedback"],
      methodology: "Semi-structured interviews",
      duration: "60 minutes",
      sections: [
        {
          id: "introduction",
          title: "Introduction & Warm-up",
          duration: "5 minutes",
          description: "Build rapport and set expectations",
          questions: [
            {
              id: "intro-1",
              question: "Tell me about yourself and your role",
              followUp: "How long have you been in this role?",
              category: "Introduction",
              objective: "Build rapport and understand context",
              expectedResponse: "Personal and professional background",
              moderatorTips: "Be warm and encouraging"
            }
          ]
        }
      ],
      moderatorGuidelines: {
        preInterview: ["Review participant background", "Prepare questions"],
        duringInterview: ["Listen actively", "Ask follow-up questions"],
        postInterview: ["Thank participant", "Document key insights"]
      },
      successMetrics: ["Key insights gathered", "Participant engagement", "Actionable feedback"]
    };
  }

  private generateAdvancedFallbackGuide(project: any, personas: any[], cohorts: any[], config: any, userPrompt?: string): any {
    const projectName = project.name || 'Research Project';
    const projectDescription = project.description || 'User research project';
    
    return {
      title: `${projectName} - Comprehensive Discussion Guide`,
      introduction: `This discussion guide is designed to extract deep insights about user needs, behaviors, and pain points related to ${projectDescription}. Use this as a framework for conducting effective user interviews that will inform your product decisions.`,
      objectives: [
        "Understand user needs and motivations",
        "Identify current pain points and frustrations", 
        "Discover desired improvements and features",
        "Understand behavioral patterns and decision-making",
        "Gather context about user environment and constraints"
      ],
      methodology: config.methodology || "Semi-structured interviews",
      duration: `${config.duration || 60} minutes`,
      sections: [
        {
          id: "introduction",
          title: "Introduction & Context Setting",
          duration: "5-7 minutes",
          description: "Build rapport, explain purpose, and gather basic context",
          questions: [
            {
              id: "intro-1",
              question: "Tell me about yourself and your current role",
              followUp: "How long have you been in this role? What does a typical day look like?",
              category: "Introduction",
              persona: "All",
              objective: "Build rapport and understand participant context",
              expectedResponse: "Personal background, role description, daily activities",
              redFlags: "Vague responses, unwillingness to share",
              moderatorTips: "Be warm and encouraging, show genuine interest"
            },
            {
              id: "intro-2", 
              question: "What does success look like in your role?",
              followUp: "What metrics or outcomes do you measure?",
              category: "Context",
              persona: "All",
              objective: "Understand success criteria and priorities",
              expectedResponse: "Specific goals, KPIs, success indicators",
              redFlags: "Generic responses, unclear priorities",
              moderatorTips: "Probe for specific examples and metrics"
            }
          ]
        },
        {
          id: "current-state",
          title: "Current State & Experience",
          duration: "15-20 minutes", 
          description: "Understand current experience with the problem area",
          questions: [
            {
              id: "current-1",
              question: `How do you currently handle ${userPrompt?.toLowerCase() || 'this type of task'}?`,
              followUp: "Walk me through your typical process step by step",
              category: "Current Process",
              persona: "All",
              objective: "Map current workflow and processes",
              expectedResponse: "Detailed step-by-step process description",
              redFlags: "Overly simplified responses, missing steps",
              moderatorTips: "Ask for specific examples, use 'tell me more' frequently"
            },
            {
              id: "current-2",
              question: "What tools or systems do you use for this?",
              followUp: "How well do these tools work for you?",
              category: "Tools & Systems",
              persona: "All", 
              objective: "Identify current tools and their effectiveness",
              expectedResponse: "List of tools, pros/cons, usage patterns",
              redFlags: "Can't name specific tools, vague about usage",
              moderatorTips: "Ask for specific tool names and examples"
            },
            {
              id: "current-3",
              question: "What's working well in your current approach?",
              followUp: "What specific benefits do you get?",
              category: "Positive Aspects",
              persona: "All",
              objective: "Identify what to preserve or build upon",
              expectedResponse: "Specific benefits and positive aspects",
              redFlags: "Can't identify anything positive",
              moderatorTips: "Help them think of specific examples"
            }
          ]
        },
        {
          id: "pain-points",
          title: "Pain Points & Challenges",
          duration: "15-20 minutes",
          description: "Deep dive into problems and frustrations",
          questions: [
            {
              id: "pain-1",
              question: "What's the most frustrating part of your current process?",
              followUp: "Can you give me a specific example of when this happened?",
              category: "Frustrations",
              persona: "All",
              objective: "Identify primary pain points and their impact",
              expectedResponse: "Specific frustrations with examples and impact",
              redFlags: "Generic complaints, no specific examples",
              moderatorTips: "Ask for specific stories and emotional impact"
            },
            {
              id: "pain-2",
              question: "What takes up the most time in this process?",
              followUp: "How much time does this typically take?",
              category: "Time Wasters",
              persona: "All",
              objective: "Identify inefficiencies and time drains",
              expectedResponse: "Specific time-consuming activities with estimates",
              redFlags: "Vague time estimates, can't identify bottlenecks",
              moderatorTips: "Ask for specific time estimates and examples"
            },
            {
              id: "pain-3",
              question: "What happens when things go wrong?",
              followUp: "How often does this happen? What's the impact?",
              category: "Failure Modes",
              persona: "All",
              objective: "Understand failure scenarios and their consequences",
              expectedResponse: "Specific failure scenarios with frequency and impact",
              redFlags: "Claims nothing ever goes wrong",
              moderatorTips: "Probe gently for real examples"
            }
          ]
        },
        {
          id: "needs-wants",
          title: "Needs & Desired Improvements",
          duration: "15-20 minutes",
          description: "Explore desired solutions and improvements",
          questions: [
            {
              id: "needs-1",
              question: "If you could wave a magic wand, what would you change?",
              followUp: "Why is this change important to you?",
              category: "Desired Changes",
              persona: "All",
              objective: "Identify ideal solutions and their importance",
              expectedResponse: "Specific desired changes with rationale",
              redFlags: "Can't think of any improvements needed",
              moderatorTips: "Encourage creative thinking, no wrong answers"
            },
            {
              id: "needs-2",
              question: "What would make your life easier in this area?",
              followUp: "How would this help you?",
              category: "Ease of Use",
              persona: "All",
              objective: "Understand ease-of-use requirements",
              expectedResponse: "Specific usability improvements",
              redFlags: "Generic responses about making things easier",
              moderatorTips: "Ask for specific examples and scenarios"
            },
            {
              id: "needs-3",
              question: "What information do you need to make decisions?",
              followUp: "How do you currently get this information?",
              category: "Information Needs",
              persona: "All",
              objective: "Identify information requirements and sources",
              expectedResponse: "Specific information needs and current sources",
              redFlags: "Unclear about information needs",
              moderatorTips: "Probe for specific data points and sources"
            }
          ]
        },
        {
          id: "context-environment",
          title: "Context & Environment",
          duration: "10-15 minutes",
          description: "Understand usage context and constraints",
          questions: [
            {
              id: "context-1",
              question: "Where and when do you typically do this?",
              followUp: "What's your environment like?",
              category: "Context of Use",
              persona: "All",
              objective: "Understand physical and temporal context",
              expectedResponse: "Specific location, time, and environmental details",
              redFlags: "Vague about context and timing",
              moderatorTips: "Ask for specific examples and details"
            },
            {
              id: "context-2",
              question: "Who else is involved in this process?",
              followUp: "How do you collaborate with them?",
              category: "Collaboration",
              persona: "All",
              objective: "Map stakeholder relationships and collaboration",
              expectedResponse: "Specific people, roles, and collaboration methods",
              redFlags: "Claims to work in complete isolation",
              moderatorTips: "Probe for all stakeholders and touchpoints"
            },
            {
              id: "context-3",
              question: "What constraints do you work within?",
              followUp: "How do these constraints affect your process?",
              category: "Constraints",
              persona: "All",
              objective: "Identify limitations and their impact",
              expectedResponse: "Specific constraints and their effects",
              redFlags: "Claims no constraints exist",
              moderatorTips: "Help them think of budget, time, policy constraints"
            }
          ]
        },
        {
          id: "future-vision",
          title: "Future Vision & Priorities",
          duration: "10-15 minutes",
          description: "Explore future needs and priorities",
          questions: [
            {
              id: "future-1",
              question: "How do you see this changing in the next year?",
              followUp: "What's driving these changes?",
              category: "Future Trends",
              persona: "All",
              objective: "Understand future direction and drivers",
              expectedResponse: "Specific predictions about future changes",
              redFlags: "Claims nothing will change",
              moderatorTips: "Encourage thinking about trends and drivers"
            },
            {
              id: "future-2",
              question: "What would success look like for you?",
              followUp: "How would you measure this success?",
              category: "Success Vision",
              persona: "All",
              objective: "Define success criteria and metrics",
              expectedResponse: "Specific success criteria and measurement methods",
              redFlags: "Vague or generic success criteria",
              moderatorTips: "Help them think of specific, measurable outcomes"
            }
          ]
        },
        {
          id: "wrap-up",
          title: "Wrap-up & Next Steps",
          duration: "5 minutes",
          description: "Close the interview and gather final thoughts",
          questions: [
            {
              id: "wrap-1",
              question: "Is there anything else you'd like to share?",
              followUp: "Any questions for me?",
              category: "Final Thoughts",
              persona: "All",
              objective: "Capture any remaining insights",
              expectedResponse: "Additional thoughts, questions, or concerns",
              redFlags: "None",
              moderatorTips: "Give them time to think, be open to new topics"
            },
            {
              id: "wrap-2",
              question: "Would you be interested in participating in future research?",
              followUp: "What's the best way to contact you?",
              category: "Follow-up",
              persona: "All",
              objective: "Establish ongoing relationship",
              expectedResponse: "Interest level and contact preferences",
              redFlags: "None",
              moderatorTips: "Respect their decision, make it easy to opt out"
            }
          ]
        }
      ],
      moderatorGuidelines: {
        preInterview: [
          "Review participant background and persona details",
          "Prepare questions and familiarize yourself with the guide",
          "Set up recording equipment and test it",
          "Prepare a comfortable, quiet environment",
          "Have backup questions ready for each section"
        ],
        duringInterview: [
          "Listen actively and show genuine interest",
          "Ask follow-up questions to dig deeper",
          "Use 'tell me more' and 'can you give me an example' frequently",
          "Pay attention to body language and emotional responses",
          "Take notes on key insights and quotes",
          "Don't rush - let participants tell their full story",
          "Be comfortable with silence - let them think"
        ],
        postInterview: [
          "Thank the participant sincerely",
          "Document key insights immediately after",
          "Note any patterns or themes that emerged",
          "Identify any follow-up questions for future sessions",
          "Update the discussion guide based on learnings"
        ]
      },
      successMetrics: [
        "Key insights gathered per participant",
        "Participant engagement and openness",
        "Actionable feedback for product development",
        "New questions or hypotheses generated",
        "Participant satisfaction with the session"
      ]
    };
  }
}

export default new DiscussionGuideService();




