import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { createClient } from 'redis';
import { OpenAI } from 'openai';

interface UserData {
  id: string;
  source: 'interview' | 'survey' | 'session' | 'feedback' | 'analytics';
  rawData: any;
  timestamp: Date;
  metadata: {
    duration?: number;
    device?: string;
    location?: string;
    userAgent?: string;
  };
}

interface ProcessedData {
  id: string;
  userId: string;
  text: string;
  audioTranscription?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  language: string;
  confidence: number;
  anonymized: boolean;
}

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

export class DataPreprocessingService {
  private db: Pool;
  private redis: any;
  private openai: OpenAI;

  constructor() {
    this.db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.redis = createClient({
      url: process.env.REDIS_URL,
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async preprocessUserData(data: UserData[]): Promise<ProcessedData[]> {
    console.log(`Processing ${data.length} user data entries...`);
    
    const processedData: ProcessedData[] = [];
    
    for (const entry of data) {
      try {
        const processed = await this.processSingleEntry(entry);
        processedData.push(processed);
        
        // Store in database
        await this.storeProcessedData(processed);
        
        console.log(`Processed entry ${entry.id}`);
      } catch (error) {
        console.error(`Error processing entry ${entry.id}:`, error);
      }
    }
    
    return processedData;
  }

  private async processSingleEntry(entry: UserData): Promise<ProcessedData> {
    let text = '';
    let audioTranscription = '';

    // Extract text based on source
    switch (entry.source) {
      case 'interview':
        if (entry.rawData.audioFile) {
          audioTranscription = await this.transcribeAudio(entry.rawData.audioFile);
          text = audioTranscription;
        } else if (entry.rawData.transcript) {
          text = entry.rawData.transcript;
        }
        break;
      
      case 'survey':
        text = this.extractSurveyText(entry.rawData);
        break;
      
      case 'session':
        text = this.extractSessionText(entry.rawData);
        break;
      
      case 'feedback':
        text = entry.rawData.comment || entry.rawData.feedback;
        break;
      
      case 'analytics':
        text = this.extractAnalyticsText(entry.rawData);
        break;
    }

    // Clean and normalize text
    const cleanedText = this.cleanText(text);
    
    // Anonymize PII
    const anonymizedText = await this.anonymizeText(cleanedText);
    
    // Analyze sentiment and topics
    const sentiment = await this.analyzeSentiment(anonymizedText);
    const topics = await this.extractTopics(anonymizedText);
    const language = await this.detectLanguage(anonymizedText);
    
    return {
      id: `processed_${entry.id}`,
      userId: entry.id,
      text: anonymizedText,
      audioTranscription,
      sentiment,
      topics,
      language,
      confidence: 0.85, // Placeholder - would be calculated based on analysis quality
      anonymized: true,
    };
  }

  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private async anonymizeText(text: string): Promise<string> {
    // Use OpenAI to anonymize PII
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'Anonymize this text by replacing names, emails, phone numbers, and addresses with generic placeholders. Keep the meaning and context intact.'
      }, {
        role: 'user',
        content: text
      }],
      temperature: 0.1,
    });

    return response.choices[0].message.content || text;
  }

  private async transcribeAudio(audioFile: string): Promise<string> {
    // In a real implementation, you'd use Whisper or similar
    // For now, return a placeholder
    return 'Transcribed audio content would go here';
  }

  private extractSurveyText(data: any): string {
    const responses = Object.values(data).filter(value => 
      typeof value === 'string' && value.length > 10
    );
    return responses.join(' ');
  }

  private extractSessionText(data: any): string {
    // Extract meaningful interactions from session data
    const interactions = data.interactions || [];
    return interactions
      .map((i: any) => i.text || i.action)
      .filter(Boolean)
      .join(' ');
  }

  private extractAnalyticsText(data: any): string {
    // Extract behavioral patterns from analytics
    const events = data.events || [];
    return events
      .map((e: any) => `${e.action} on ${e.page}`)
      .join(' ');
  }

  private async analyzeSentiment(text: string): Promise<'positive' | 'negative' | 'neutral'> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'Analyze the sentiment of this text. Respond with only: positive, negative, or neutral'
      }, {
        role: 'user',
        content: text
      }],
      temperature: 0.1,
    });

    const sentiment = response.choices[0].message.content?.toLowerCase();
    return (sentiment === 'positive' || sentiment === 'negative') ? sentiment : 'neutral';
  }

  private async extractTopics(text: string): Promise<string[]> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'Extract the main topics from this text. Return as a comma-separated list of 3-5 topics.'
      }, {
        role: 'user',
        content: text
      }],
      temperature: 0.1,
    });

    const topics = response.choices[0].message.content || '';
    return topics.split(',').map(t => t.trim()).filter(Boolean);
  }

  private async detectLanguage(text: string): Promise<string> {
    // Simple language detection - in production, use a proper library
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'Detect the language of this text. Respond with only the language name (e.g., English, Spanish, Hindi).'
      }, {
        role: 'user',
        content: text
      }],
      temperature: 0.1,
    });

    return response.choices[0].message.content || 'English';
  }

  private async storeProcessedData(data: ProcessedData): Promise<void> {
    const query = `
      INSERT INTO processed_user_data 
      (id, user_id, text, audio_transcription, sentiment, topics, language, confidence, anonymized, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (id) DO UPDATE SET
      text = EXCLUDED.text,
      sentiment = EXCLUDED.sentiment,
      topics = EXCLUDED.topics,
      updated_at = NOW()
    `;

    await this.db.query(query, [
      data.id,
      data.userId,
      data.text,
      data.audioTranscription,
      data.sentiment,
      JSON.stringify(data.topics),
      data.language,
      data.confidence,
      data.anonymized,
    ]);
  }

  async clusterUsersByTraits(processedData: ProcessedData[]): Promise<any[]> {
    console.log('Clustering users by traits...');
    
    // Group by similar characteristics
    const clusters = new Map<string, ProcessedData[]>();
    
    for (const data of processedData) {
      const clusterKey = this.generateClusterKey(data);
      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, []);
      }
      clusters.get(clusterKey)!.push(data);
    }
    
    // Convert to array format
    const clusterArray = Array.from(clusters.entries()).map(([key, users]) => ({
      clusterId: key,
      users: users,
      size: users.length,
      traits: this.extractClusterTraits(users),
    }));
    
    return clusterArray;
  }

  private generateClusterKey(data: ProcessedData): string {
    // Simple clustering based on sentiment and topics
    const sentiment = data.sentiment;
    const topTopics = data.topics.slice(0, 2).sort().join('-');
    return `${sentiment}-${topTopics}`;
  }

  private extractClusterTraits(users: ProcessedData[]): any {
    const allTopics = users.flatMap(u => u.topics);
    const topicCounts = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    return {
      commonTopics,
      averageConfidence: users.reduce((sum, u) => sum + u.confidence, 0) / users.length,
      dominantSentiment: this.getDominantSentiment(users),
    };
  }

  private getDominantSentiment(users: ProcessedData[]): string {
    const sentiments = users.map(u => u.sentiment);
    const counts = sentiments.reduce((acc, sentiment) => {
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0][0];
  }
}






