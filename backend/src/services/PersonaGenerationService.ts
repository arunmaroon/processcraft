import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

export interface PersonaProfile {
  name: string;
  demographics: {
    age: number;
    occupation: string;
    location: string;
    income: string;
    education: string;
  };
  character_behavior: {
    speech_style: string;
    personality_traits: string[];
    communication_preferences: string;
  };
  financial_attitudes: {
    risk_tolerance: 'LOW' | 'MEDIUM' | 'HIGH';
    investment_style: string;
    payment_preferences: string[];
    trust_factors: string[];
  };
  key_experiences: string[];
  pain_points: string[];
  goals: string[];
  transcript_snippets: string[];
}

export class PersonaGenerationService {
  private model: ChatOpenAI;
  private personaPrompt: PromptTemplate;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.personaPrompt = new PromptTemplate({
      template: `Extract a detailed user persona from this research transcript. Create a comprehensive profile that captures the user's demographics, behavior patterns, financial attitudes, and communication style.

Transcript: {transcript}

Please return a JSON object with the following structure:
{{
  "name": "User's name from transcript",
  "demographics": {{
    "age": number,
    "occupation": "string",
    "location": "string", 
    "income": "string",
    "education": "string"
  }},
  "character_behavior": {{
    "speech_style": "string describing how they speak (casual, formal, etc.)",
    "personality_traits": ["trait1", "trait2", "trait3"],
    "communication_preferences": "string describing communication style"
  }},
  "financial_attitudes": {{
    "risk_tolerance": "LOW|MEDIUM|HIGH",
    "investment_style": "string describing their approach to money",
    "payment_preferences": ["UPI", "cards", "cash", etc.],
    "trust_factors": ["what makes them trust financial services"]
  }},
  "key_experiences": ["experience1", "experience2", "experience3"],
  "pain_points": ["pain1", "pain2", "pain3"],
  "goals": ["goal1", "goal2", "goal3"],
  "transcript_snippets": ["quote1", "quote2", "quote3"]
}}

Focus on capturing authentic details that would help an AI agent mimic this person's responses and behavior patterns.`,
      inputVariables: ['transcript'],
    });
  }

  async generatePersonaFromTranscript(transcript: string): Promise<PersonaProfile> {
    try {
      const chain = this.personaPrompt.pipe(this.model);
      const response = await chain.invoke({ transcript });
      
      // Parse the JSON response
      const content = typeof response.content === 'string' 
        ? response.content 
        : response.content[0].type === 'text' 
          ? response.content[0].text 
          : JSON.stringify(response.content);
      const personaData = JSON.parse(content);
      
      // Validate the structure
      if (!this.validatePersonaStructure(personaData)) {
        throw new Error('Invalid persona structure generated');
      }
      
      return personaData as PersonaProfile;
    } catch (error) {
      console.error('Error generating persona:', error);
      throw new Error('Failed to generate persona from transcript');
    }
  }

  async generateMultiplePersonas(transcripts: string[]): Promise<PersonaProfile[]> {
    const personas: PersonaProfile[] = [];
    
    for (const transcript of transcripts) {
      try {
        const persona = await this.generatePersonaFromTranscript(transcript);
        personas.push(persona);
      } catch (error) {
        console.error(`Failed to generate persona for transcript: ${transcript.substring(0, 100)}...`);
      }
    }
    
    return personas;
  }

  private validatePersonaStructure(data: any): boolean {
    const requiredFields = [
      'name', 'demographics', 'character_behavior', 
      'financial_attitudes', 'key_experiences', 'pain_points', 'goals'
    ];
    
    return requiredFields.every(field => data.hasOwnProperty(field));
  }

  async savePersonasToFile(personas: PersonaProfile[], filename: string): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');
    
    const filePath = path.join(process.cwd(), 'data', 'personas', `${filename}.json`);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    await fs.writeFile(filePath, JSON.stringify(personas, null, 2));
    console.log(`Personas saved to ${filePath}`);
  }

  async loadPersonasFromFile(filename: string): Promise<PersonaProfile[]> {
    const fs = require('fs').promises;
    const path = require('path');
    
    const filePath = path.join(process.cwd(), 'data', 'personas', `${filename}.json`);
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading personas from ${filePath}:`, error);
      return [];
    }
  }
}




