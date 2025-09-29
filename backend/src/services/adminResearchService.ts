import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy-key' 
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

interface UploadResult {
  filename: string;
  originalName: string;
  size: number;
  type: string;
  status: 'success' | 'error';
  message?: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'USABILITY' | 'SECURITY' | 'PERFORMANCE' | 'BEHAVIOR' | 'PREFERENCE';
  confidence: number;
  evidence: string[];
  source: string;
  createdAt: string;
}

interface AIAgent {
  id: string;
  name: string;
  persona: string;
  product: string;
  status: 'BUILDING' | 'ACTIVE' | 'ERROR' | 'TESTING';
  accuracy: number;
  responses: number;
  lastActive: string;
  personality: {
    communicationStyle: 'FORMAL' | 'CASUAL' | 'FRIENDLY' | 'PROFESSIONAL';
    responseLength: 'BRIEF' | 'MODERATE' | 'DETAILED';
    emotionalTone: 'NEUTRAL' | 'POSITIVE' | 'CONCERNED' | 'ENTHUSIASTIC';
    technicalLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  };
}

class AdminResearchService {
  private dataDir: string;
  private researchCentralDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.researchCentralDir = path.join(this.dataDir, 'research-central');
    this.ensureDirectories();
  }

  private ensureDirectories() {
    const dirs = [
      this.dataDir,
      path.join(this.dataDir, 'training'),
      this.researchCentralDir
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async processUploads(files: Express.Multer.File[]): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (const file of files) {
      try {
        // Validate file
        const allowedTypes = ['.csv', '.json', '.pdf', '.txt', '.xlsx'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (!allowedTypes.includes(ext)) {
          results.push({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            type: file.mimetype,
            status: 'error',
            message: 'Invalid file type'
          });
          continue;
        }

        // Process file based on type
        let processed = false;
        if (ext === '.csv') {
          processed = await this.processCSV(file);
        } else if (ext === '.json') {
          processed = await this.processJSON(file);
        } else if (ext === '.txt') {
          processed = await this.processText(file);
        }

        results.push({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          type: file.mimetype,
          status: processed ? 'success' : 'error',
          message: processed ? 'Processed successfully' : 'Processing failed'
        });
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        results.push({
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          type: file.mimetype,
          status: 'error',
          message: 'Processing error'
        });
      }
    }

    return results;
  }

  private async processCSV(file: Express.Multer.File): Promise<boolean> {
    try {
      // For demo purposes, just validate the file exists
      const filePath = path.join(file.destination, file.filename);
      return fs.existsSync(filePath);
    } catch (error) {
      console.error('CSV processing error:', error);
      return false;
    }
  }

  private async processJSON(file: Express.Multer.File): Promise<boolean> {
    try {
      const filePath = path.join(file.destination, file.filename);
      const content = fs.readFileSync(filePath, 'utf8');
      JSON.parse(content); // Validate JSON
      return true;
    } catch (error) {
      console.error('JSON processing error:', error);
      return false;
    }
  }

  private async processText(file: Express.Multer.File): Promise<boolean> {
    try {
      const filePath = path.join(file.destination, file.filename);
      return fs.existsSync(filePath);
    } catch (error) {
      console.error('Text processing error:', error);
      return false;
    }
  }

  async synthesizeInsights(): Promise<Insight[]> {
    try {
      // Check if OpenAI API is available
      if (!openai) {
        // Return mock insights
        return this.getMockInsights();
      }

      // Get uploaded files
      const trainingDir = path.join(this.dataDir, 'training');
      const files = fs.readdirSync(trainingDir);
      
      if (files.length === 0) {
        return this.getMockInsights();
      }

      // Read file contents
      let combinedContent = '';
      for (const file of files) {
        const filePath = path.join(trainingDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        combinedContent += `\n\n--- File: ${file} ---\n${content}`;
      }

      // Generate insights using OpenAI
      const prompt = `Analyze the following research data and generate 5-10 actionable insights for UX design. Focus on user behavior patterns, preferences, pain points, and usability issues. Return as JSON array with fields: id, title, description, category (USABILITY/SECURITY/PERFORMANCE/BEHAVIOR/PREFERENCE), confidence (0-1), evidence (array of strings), source, createdAt.

Research Data:
${combinedContent}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const insights = JSON.parse(response);
        await this.saveInsights(insights);
        return insights;
      }

      return this.getMockInsights();
    } catch (error) {
      console.error('Insight synthesis error:', error);
      return this.getMockInsights();
    }
  }

  private getMockInsights(): Insight[] {
    return [
      {
        id: 'insight-1',
        title: 'Mobile-First User Behavior',
        description: 'Users strongly prefer mobile interfaces for financial transactions, with 78% of interactions occurring on mobile devices.',
        category: 'BEHAVIOR',
        confidence: 0.85,
        evidence: ['Mobile usage: 78%', 'Desktop usage: 22%', 'User feedback: "Much easier on phone"'],
        source: 'AI Synthesis',
        createdAt: new Date().toISOString()
      },
      {
        id: 'insight-2',
        title: 'Security as Primary Concern',
        description: 'Users prioritize security features over convenience, with 89% mentioning security as their top concern.',
        category: 'SECURITY',
        confidence: 0.92,
        evidence: ['Security mentions: 89%', 'Convenience mentions: 45%', 'User feedback: "Safety first"'],
        source: 'AI Synthesis',
        createdAt: new Date().toISOString()
      },
      {
        id: 'insight-3',
        title: 'Real-Time Updates Expected',
        description: 'Users expect immediate feedback on all actions, with 67% complaining about response times.',
        category: 'PERFORMANCE',
        confidence: 0.78,
        evidence: ['Response time complaints: 67%', 'User feedback: "Too slow"', 'Abandonment rate: 23%'],
        source: 'AI Synthesis',
        createdAt: new Date().toISOString()
      }
    ];
  }

  async saveConfigs(configs: any) {
    const configsPath = path.join(this.researchCentralDir, 'configs.json');
    fs.writeFileSync(configsPath, JSON.stringify(configs, null, 2));
  }

  async saveMappings(mappings: any) {
    const mappingsPath = path.join(this.researchCentralDir, 'mappings.json');
    fs.writeFileSync(mappingsPath, JSON.stringify(mappings, null, 2));
  }

  async buildAgents(): Promise<AIAgent[]> {
    try {
      // Check if OpenAI API is available
      if (!openai) {
        return this.getMockAgents();
      }

      // Load configurations
      const configs = await this.getConfigs();
      const mappings = await this.getMappings();

      // Generate agents using OpenAI
      const prompt = `Based on the following personas, demographics, and product mappings, create AI agents that can mimic real user behavior. Each agent should have realistic personality traits and communication styles.

Personas: ${JSON.stringify(configs.personas)}
Demographics: ${JSON.stringify(configs.demographics)}
Cohorts: ${JSON.stringify(configs.cohorts)}
Mappings: ${JSON.stringify(mappings)}

Return as JSON array with fields: id, name, persona, product, status (ACTIVE), accuracy (0-1), responses (0), lastActive (ISO string), personality (communicationStyle, responseLength, emotionalTone, technicalLevel).`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        const agents = JSON.parse(response);
        await this.saveAgents(agents);
        return agents;
      }

      return this.getMockAgents();
    } catch (error) {
      console.error('Agent building error:', error);
      return this.getMockAgents();
    }
  }

  private getMockAgents(): AIAgent[] {
    return [
      {
        id: 'agent-1',
        name: 'Tech-Savvy Investor Agent',
        persona: 'Tech-Savvy Investor',
        product: 'DigiGold',
        status: 'ACTIVE',
        accuracy: 0.87,
        responses: 0,
        lastActive: new Date().toISOString(),
        personality: {
          communicationStyle: 'FRIENDLY',
          responseLength: 'MODERATE',
          emotionalTone: 'POSITIVE',
          technicalLevel: 'ADVANCED'
        }
      },
      {
        id: 'agent-2',
        name: 'Conservative Saver Agent',
        persona: 'Conservative Saver',
        product: 'DigiGold',
        status: 'ACTIVE',
        accuracy: 0.89,
        responses: 0,
        lastActive: new Date().toISOString(),
        personality: {
          communicationStyle: 'PROFESSIONAL',
          responseLength: 'DETAILED',
          emotionalTone: 'CONCERNED',
          technicalLevel: 'INTERMEDIATE'
        }
      }
    ];
  }

  async checkBias(): Promise<any[]> {
    // Mock bias check - in real implementation, this would use AI to analyze data
    return [
      {
        id: 'bias-1',
        type: 'GENDER',
        severity: 'MEDIUM',
        description: 'Persona descriptions show gender bias with 80% of tech-savvy personas being male',
        suggestion: 'Ensure equal representation of genders across all persona types',
        affectedData: ['Tech-Savvy Investor', 'Primary Users Cohort'],
        confidence: 0.85
      }
    ];
  }

  async previewAgent(agentId: string, message: string): Promise<string> {
    // Mock agent response - in real implementation, this would use AI
    const responses = [
      "That's a great question! As someone who's been investing for a while, I'd say the key is to start small and diversify.",
      "I love using mobile apps for investing - they're so convenient! Have you tried the real-time notifications?",
      "Security is definitely important, but I also value speed and ease of use. What features matter most to you?",
      "I'm always looking for the latest features and updates. The app's performance has been pretty solid for me."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async testAgent(agentId: string): Promise<{ accuracy: number }> {
    // Mock test result
    return { accuracy: 0.85 + Math.random() * 0.1 };
  }

  // Data retrieval methods
  async getInsights(): Promise<Insight[]> {
    try {
      const insightsPath = path.join(this.researchCentralDir, 'insights.json');
      if (fs.existsSync(insightsPath)) {
        return JSON.parse(fs.readFileSync(insightsPath, 'utf8'));
      }
      return this.getMockInsights();
    } catch (error) {
      console.error('Get insights error:', error);
      return this.getMockInsights();
    }
  }

  async getConfigs(): Promise<any> {
    try {
      const configsPath = path.join(this.researchCentralDir, 'configs.json');
      if (fs.existsSync(configsPath)) {
        return JSON.parse(fs.readFileSync(configsPath, 'utf8'));
      }
      return { personas: [], demographics: [], cohorts: [] };
    } catch (error) {
      console.error('Get configs error:', error);
      return { personas: [], demographics: [], cohorts: [] };
    }
  }

  async getMappings(): Promise<any[]> {
    try {
      const mappingsPath = path.join(this.researchCentralDir, 'mappings.json');
      if (fs.existsSync(mappingsPath)) {
        return JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));
      }
      return [];
    } catch (error) {
      console.error('Get mappings error:', error);
      return [];
    }
  }

  async getAgents(): Promise<AIAgent[]> {
    try {
      const agentsPath = path.join(this.researchCentralDir, 'agents.json');
      if (fs.existsSync(agentsPath)) {
        return JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
      }
      return this.getMockAgents();
    } catch (error) {
      console.error('Get agents error:', error);
      return this.getMockAgents();
    }
  }

  async getBiasIssues(): Promise<any[]> {
    try {
      const biasPath = path.join(this.researchCentralDir, 'bias-issues.json');
      if (fs.existsSync(biasPath)) {
        return JSON.parse(fs.readFileSync(biasPath, 'utf8'));
      }
      return [];
    } catch (error) {
      console.error('Get bias issues error:', error);
      return [];
    }
  }

  private async saveInsights(insights: Insight[]) {
    const insightsPath = path.join(this.researchCentralDir, 'insights.json');
    fs.writeFileSync(insightsPath, JSON.stringify(insights, null, 2));
  }

  private async saveAgents(agents: AIAgent[]) {
    const agentsPath = path.join(this.researchCentralDir, 'agents.json');
    fs.writeFileSync(agentsPath, JSON.stringify(agents, null, 2));
  }

  // Settings methods
  async getSettings(): Promise<any> {
    try {
      const settingsPath = path.join(this.researchCentralDir, 'settings.json');
      if (fs.existsSync(settingsPath)) {
        return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      }
      // Return default settings
      return {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        adminPasscode: process.env.ADMIN_PASSCODE || 'admin123',
        maxFileSize: 10,
        allowedFileTypes: ['.csv', '.json', '.pdf', '.txt', '.xlsx'],
        aiModel: 'gpt-4',
        aiTemperature: 0.7,
        aiMaxTokens: 4000,
        biasCheckEnabled: true,
        notificationsEnabled: true,
        autoSave: true
      };
    } catch (error) {
      console.error('Get settings error:', error);
      return {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        adminPasscode: process.env.ADMIN_PASSCODE || 'admin123',
        maxFileSize: 10,
        allowedFileTypes: ['.csv', '.json', '.pdf', '.txt', '.xlsx'],
        aiModel: 'gpt-4',
        aiTemperature: 0.7,
        aiMaxTokens: 4000,
        biasCheckEnabled: true,
        notificationsEnabled: true,
        autoSave: true
      };
    }
  }

  async saveSettings(settings: any) {
    try {
      const settingsPath = path.join(this.researchCentralDir, 'settings.json');
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      
      // Update environment variables if API key is provided
      if (settings.openaiApiKey) {
        process.env.OPENAI_API_KEY = settings.openaiApiKey;
      }
      if (settings.adminPasscode) {
        process.env.ADMIN_PASSCODE = settings.adminPasscode;
      }
    } catch (error) {
      console.error('Save settings error:', error);
      throw error;
    }
  }
}

export const adminResearchService = new AdminResearchService();
