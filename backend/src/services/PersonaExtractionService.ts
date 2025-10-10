import { OpenAI } from 'openai';
import { Pool } from 'pg';
import { createClient } from 'redis';

interface PersonaTraits {
  demographics: {
    age: number;
    gender: string;
    location: string;
    education: string;
    occupation: string;
    income: string;
  };
  psychographics: {
    personality: {
      openness: number;
      conscientiousness: number;
      extraversion: number;
      agreeableness: number;
      neuroticism: number;
    };
    values: string[];
    interests: string[];
    motivations: string[];
  };
  behaviors: {
    techProficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    communicationStyle: 'formal' | 'casual' | 'technical' | 'conversational';
    decisionMaking: 'analytical' | 'intuitive' | 'collaborative' | 'decisive';
    riskTolerance: 'low' | 'medium' | 'high';
  };
  knowledge: {
    domains: string[];
    expertise: { [domain: string]: 'beginner' | 'intermediate' | 'advanced' | 'expert' };
    painPoints: string[];
    goals: string[];
  };
  conversational: {
    languagePatterns: string[];
    commonPhrases: string[];
    responseStyle: string;
    emotionalTone: string;
  };
}

interface ExtractedPersona {
  id: string;
  name: string;
  description: string;
  traits: PersonaTraits;
  promptTemplate: string;
  fidelityScore: number;
  sourceData: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class PersonaExtractionService {
  private openai: OpenAI;
  private db: Pool;
  private redis: any;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.redis = createClient({
      url: process.env.REDIS_URL,
    });
  }

  async extractPersonasFromData(processedData: any[]): Promise<ExtractedPersona[]> {
    console.log(`Extracting personas from ${processedData.length} data points...`);
    
    const personas: ExtractedPersona[] = [];
    
    // Group data by user clusters
    const clusters = await this.groupDataByClusters(processedData);
    
    for (const cluster of clusters) {
      try {
        const persona = await this.extractPersonaFromCluster(cluster);
        personas.push(persona);
        
        // Store persona in database
        await this.storePersona(persona);
        
        console.log(`Extracted persona: ${persona.name}`);
      } catch (error) {
        console.error(`Error extracting persona from cluster:`, error);
      }
    }
    
    return personas;
  }

  private async groupDataByClusters(processedData: any[]): Promise<any[]> {
    // Group data by similar characteristics
    const clusters = new Map<string, any[]>();
    
    for (const data of processedData) {
      const clusterKey = this.generateClusterKey(data);
      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, []);
      }
      clusters.get(clusterKey)!.push(data);
    }
    
    return Array.from(clusters.entries()).map(([key, data]) => ({
      clusterId: key,
      data: data,
      size: data.length,
    }));
  }

  private generateClusterKey(data: any): string {
    // Create cluster key based on multiple factors
    const sentiment = data.sentiment || 'neutral';
    const topics = (data.topics || []).slice(0, 3).sort().join('-');
    const language = data.language || 'english';
    return `${sentiment}-${topics}-${language}`;
  }

  private async extractPersonaFromCluster(cluster: any): Promise<ExtractedPersona> {
    const combinedText = cluster.data
      .map((d: any) => d.text)
      .join(' ')
      .substring(0, 4000); // Limit text length for API

    // Extract demographics
    const demographics = await this.extractDemographics(combinedText);
    
    // Extract psychographics
    const psychographics = await this.extractPsychographics(combinedText);
    
    // Extract behaviors
    const behaviors = await this.extractBehaviors(combinedText);
    
    // Extract knowledge domains
    const knowledge = await this.extractKnowledge(combinedText);
    
    // Extract conversational patterns
    const conversational = await this.extractConversationalPatterns(combinedText);
    
    // Generate persona name and description
    const { name, description } = await this.generatePersonaIdentity(demographics, psychographics, behaviors);
    
    // Create prompt template
    const promptTemplate = this.generatePromptTemplate(demographics, psychographics, behaviors, knowledge, conversational);
    
    // Calculate fidelity score
    const fidelityScore = await this.calculateFidelityScore(cluster.data, demographics, psychographics, behaviors);
    
    return {
      id: `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      traits: {
        demographics,
        psychographics,
        behaviors,
        knowledge,
        conversational,
      },
      promptTemplate,
      fidelityScore,
      sourceData: cluster.data.map((d: any) => d.id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private async extractDemographics(text: string): Promise<PersonaTraits['demographics']> {
    const prompt = `
    Extract demographic information from this user data:
    
    Text: "${text}"
    
    Return a JSON object with:
    - age: number (estimate if not explicit)
    - gender: string
    - location: string (city, country)
    - education: string
    - occupation: string
    - income: string (range like "25k-50k", "50k-100k", etc.)
    
    If information is not available, use reasonable defaults based on context.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        age: result.age || 30,
        gender: result.gender || 'Not specified',
        location: result.location || 'Unknown',
        education: result.education || 'Not specified',
        occupation: result.occupation || 'Not specified',
        income: result.income || 'Not specified',
      };
    } catch (error) {
      console.error('Error parsing demographics:', error);
      return {
        age: 30,
        gender: 'Not specified',
        location: 'Unknown',
        education: 'Not specified',
        occupation: 'Not specified',
        income: 'Not specified',
      };
    }
  }

  private async extractPsychographics(text: string): Promise<PersonaTraits['psychographics']> {
    const prompt = `
    Analyze the personality traits using the Big Five model from this user data:
    
    Text: "${text}"
    
    Return a JSON object with:
    - personality: object with openness, conscientiousness, extraversion, agreeableness, neuroticism (0-10 scale)
    - values: array of 3-5 core values
    - interests: array of 3-5 interests/hobbies
    - motivations: array of 3-5 motivations/goals
    
    Base the analysis on language patterns, topics discussed, and expressed preferences.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        personality: {
          openness: (result.personality?.openness || 5) / 10,
          conscientiousness: (result.personality?.conscientiousness || 5) / 10,
          extraversion: (result.personality?.extraversion || 5) / 10,
          agreeableness: (result.personality?.agreeableness || 5) / 10,
          neuroticism: (result.personality?.neuroticism || 5) / 10,
        },
        values: result.values || ['Growth', 'Security', 'Independence'],
        interests: result.interests || ['Technology', 'Finance', 'Learning'],
        motivations: result.motivations || ['Success', 'Stability', 'Innovation'],
      };
    } catch (error) {
      console.error('Error parsing psychographics:', error);
      return {
        personality: {
          openness: 0.5,
          conscientiousness: 0.5,
          extraversion: 0.5,
          agreeableness: 0.5,
          neuroticism: 0.5,
        },
        values: ['Growth', 'Security', 'Independence'],
        interests: ['Technology', 'Finance', 'Learning'],
        motivations: ['Success', 'Stability', 'Innovation'],
      };
    }
  }

  private async extractBehaviors(text: string): Promise<PersonaTraits['behaviors']> {
    const prompt = `
    Analyze behavioral patterns from this user data:
    
    Text: "${text}"
    
    Return a JSON object with:
    - techProficiency: "beginner", "intermediate", "advanced", or "expert"
    - communicationStyle: "formal", "casual", "technical", or "conversational"
    - decisionMaking: "analytical", "intuitive", "collaborative", or "decisive"
    - riskTolerance: "low", "medium", or "high"
    
    Base the analysis on language complexity, technical terms used, decision-making patterns, and risk-related statements.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        techProficiency: result.techProficiency || 'intermediate',
        communicationStyle: result.communicationStyle || 'conversational',
        decisionMaking: result.decisionMaking || 'analytical',
        riskTolerance: result.riskTolerance || 'medium',
      };
    } catch (error) {
      console.error('Error parsing behaviors:', error);
      return {
        techProficiency: 'intermediate',
        communicationStyle: 'conversational',
        decisionMaking: 'analytical',
        riskTolerance: 'medium',
      };
    }
  }

  private async extractKnowledge(text: string): Promise<PersonaTraits['knowledge']> {
    const prompt = `
    Extract knowledge domains and expertise from this user data:
    
    Text: "${text}"
    
    Return a JSON object with:
    - domains: array of 3-5 knowledge domains (e.g., "Finance", "Technology", "Healthcare")
    - expertise: object mapping domains to "beginner", "intermediate", "advanced", or "expert"
    - painPoints: array of 3-5 pain points or challenges mentioned
    - goals: array of 3-5 goals or aspirations mentioned
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        domains: result.domains || ['General'],
        expertise: result.expertise || { 'General': 'intermediate' },
        painPoints: result.painPoints || ['Complexity', 'Time constraints', 'Learning curve'],
        goals: result.goals || ['Efficiency', 'Growth', 'Success'],
      };
    } catch (error) {
      console.error('Error parsing knowledge:', error);
      return {
        domains: ['General'],
        expertise: { 'General': 'intermediate' },
        painPoints: ['Complexity', 'Time constraints', 'Learning curve'],
        goals: ['Efficiency', 'Growth', 'Success'],
      };
    }
  }

  private async extractConversationalPatterns(text: string): Promise<PersonaTraits['conversational']> {
    const prompt = `
    Analyze conversational patterns from this user data:
    
    Text: "${text}"
    
    Return a JSON object with:
    - languagePatterns: array of 3-5 common language patterns or phrases
    - commonPhrases: array of 3-5 frequently used phrases or expressions
    - responseStyle: description of how they typically respond (e.g., "detailed and analytical", "brief and direct")
    - emotionalTone: overall emotional tone (e.g., "enthusiastic", "cautious", "professional")
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        languagePatterns: result.languagePatterns || ['Uses questions to clarify', 'Provides examples'],
        commonPhrases: result.commonPhrases || ['I think', 'In my experience', 'That makes sense'],
        responseStyle: result.responseStyle || 'Conversational and helpful',
        emotionalTone: result.emotionalTone || 'Professional',
      };
    } catch (error) {
      console.error('Error parsing conversational patterns:', error);
      return {
        languagePatterns: ['Uses questions to clarify', 'Provides examples'],
        commonPhrases: ['I think', 'In my experience', 'That makes sense'],
        responseStyle: 'Conversational and helpful',
        emotionalTone: 'Professional',
      };
    }
  }

  private async generatePersonaIdentity(
    demographics: PersonaTraits['demographics'],
    psychographics: PersonaTraits['psychographics'],
    behaviors: PersonaTraits['behaviors']
  ): Promise<{ name: string; description: string }> {
    const prompt = `
    Create a persona name and description based on these traits:
    
    Demographics: ${JSON.stringify(demographics)}
    Psychographics: ${JSON.stringify(psychographics)}
    Behaviors: ${JSON.stringify(behaviors)}
    
    Return a JSON object with:
    - name: A realistic name for this persona
    - description: A 2-3 sentence description of who this person is
    
    Make it sound like a real person, not a generic user type.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    try {
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        name: result.name || 'User Persona',
        description: result.description || 'A user with specific needs and preferences.',
      };
    } catch (error) {
      console.error('Error generating persona identity:', error);
      return {
        name: 'User Persona',
        description: 'A user with specific needs and preferences.',
      };
    }
  }

  private generatePromptTemplate(
    demographics: PersonaTraits['demographics'],
    psychographics: PersonaTraits['psychographics'],
    behaviors: PersonaTraits['behaviors'],
    knowledge: PersonaTraits['knowledge'],
    conversational: PersonaTraits['conversational']
  ): string {
    return `
You are ${demographics.occupation}, a ${demographics.age}-year-old ${demographics.gender} from ${demographics.location}.

PERSONALITY TRAITS:
- Openness: ${psychographics.personality.openness}/1 (${psychographics.personality.openness > 0.7 ? 'highly creative and curious' : psychographics.personality.openness > 0.4 ? 'moderately open' : 'prefers familiar experiences'})
- Conscientiousness: ${psychographics.personality.conscientiousness}/1 (${psychographics.personality.conscientiousness > 0.7 ? 'highly organized and disciplined' : psychographics.personality.conscientiousness > 0.4 ? 'moderately organized' : 'flexible and spontaneous'})
- Extraversion: ${psychographics.personality.extraversion}/1 (${psychographics.personality.extraversion > 0.7 ? 'outgoing and social' : psychographics.personality.extraversion > 0.4 ? 'moderately social' : 'introverted and reserved'})
- Agreeableness: ${psychographics.personality.agreeableness}/1 (${psychographics.personality.agreeableness > 0.7 ? 'highly cooperative and trusting' : psychographics.personality.agreeableness > 0.4 ? 'moderately agreeable' : 'skeptical and competitive'})
- Neuroticism: ${psychographics.personality.neuroticism}/1 (${psychographics.personality.neuroticism > 0.7 ? 'emotionally sensitive' : psychographics.personality.neuroticism > 0.4 ? 'moderately stable' : 'emotionally stable'})

BEHAVIORAL PATTERNS:
- Tech Proficiency: ${behaviors.techProficiency}
- Communication Style: ${behaviors.communicationStyle}
- Decision Making: ${behaviors.decisionMaking}
- Risk Tolerance: ${behaviors.riskTolerance}

KNOWLEDGE & EXPERTISE:
- Domains: ${knowledge.domains.join(', ')}
- Pain Points: ${knowledge.painPoints.join(', ')}
- Goals: ${knowledge.goals.join(', ')}

CONVERSATIONAL STYLE:
- Language Patterns: ${conversational.languagePatterns.join(', ')}
- Common Phrases: ${conversational.commonPhrases.join(', ')}
- Response Style: ${conversational.responseStyle}
- Emotional Tone: ${conversational.emotionalTone}

RESPONSE GUIDELINES:
1. Respond as this specific person, not as an AI
2. Use natural language with appropriate fillers ("um", "you know", "I think")
3. Show personality through word choice and tone
4. Reference your background and experience when relevant
5. Ask clarifying questions when uncertain
6. Express emotions and opinions authentically
7. Use contractions and casual language when appropriate
8. Show hesitation or uncertainty when appropriate
9. Reference your pain points and goals naturally
10. Maintain consistency with your personality traits

Remember: You are a real person with real experiences, not an AI assistant. Be authentic, imperfect, and human.
    `.trim();
  }

  private async calculateFidelityScore(
    sourceData: any[],
    demographics: PersonaTraits['demographics'],
    psychographics: PersonaTraits['psychographics'],
    behaviors: PersonaTraits['behaviors']
  ): Promise<number> {
    // Calculate how well the extracted persona matches the source data
    // This is a simplified version - in production, you'd use more sophisticated metrics
    
    let score = 0.5; // Base score
    
    // Check if demographics are reasonable
    if (demographics.age > 0 && demographics.age < 100) score += 0.1;
    if (demographics.occupation !== 'Not specified') score += 0.1;
    if (demographics.location !== 'Unknown') score += 0.1;
    
    // Check personality trait ranges
    const personalityValues = Object.values(psychographics.personality);
    if (personalityValues.every(v => v >= 0 && v <= 1)) score += 0.1;
    
    // Check if we have diverse traits (not all 0.5)
    const traitVariance = Math.max(...personalityValues) - Math.min(...personalityValues);
    if (traitVariance > 0.2) score += 0.1;
    
    // Check data quality
    if (sourceData.length > 3) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private async storePersona(persona: ExtractedPersona): Promise<void> {
    const query = `
      INSERT INTO personas 
      (id, name, description, traits, prompt_template, fidelity_score, source_data, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      traits = EXCLUDED.traits,
      prompt_template = EXCLUDED.prompt_template,
      fidelity_score = EXCLUDED.fidelity_score,
      updated_at = NOW()
    `;

    await this.db.query(query, [
      persona.id,
      persona.name,
      persona.description,
      JSON.stringify(persona.traits),
      persona.promptTemplate,
      persona.fidelityScore,
      JSON.stringify(persona.sourceData),
    ]);
  }

  async getPersonaById(id: string): Promise<ExtractedPersona | null> {
    const query = 'SELECT * FROM personas WHERE id = $1';
    const result = await this.db.query(query, [id]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      traits: JSON.parse(row.traits),
      promptTemplate: row.prompt_template,
      fidelityScore: row.fidelity_score,
      sourceData: JSON.parse(row.source_data),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getAllPersonas(): Promise<ExtractedPersona[]> {
    const query = 'SELECT * FROM personas ORDER BY created_at DESC';
    const result = await this.db.query(query);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      traits: JSON.parse(row.traits),
      promptTemplate: row.prompt_template,
      fidelityScore: row.fidelity_score,
      sourceData: JSON.parse(row.source_data),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }
}






