import { ChatOpenAI } from '@langchain/openai';
import { ChatGrok } from '@langchain/community/chat_models/grok';
import * as natural from 'natural';
import { MLMatrix } from 'ml-matrix';

export interface ConsistencyScore {
  overall: number;
  personality: number;
  demographic: number;
  behavioral: number;
  response: number;
  context: number;
  details: ConsistencyDetails;
  recommendations: string[];
}

export interface ConsistencyDetails {
  personalityTraits: {
    score: number;
    consistency: number;
    variance: number;
    issues: string[];
  };
  demographicAlignment: {
    score: number;
    ageAppropriate: number;
    educationLevel: number;
    culturalFit: number;
    issues: string[];
  };
  behavioralPatterns: {
    score: number;
    communicationStyle: number;
    decisionMaking: number;
    riskTolerance: number;
    issues: string[];
  };
  responseQuality: {
    score: number;
    relevance: number;
    coherence: number;
    completeness: number;
    issues: string[];
  };
  contextAwareness: {
    score: number;
    memoryRetention: number;
    topicConsistency: number;
    emotionalContinuity: number;
    issues: string[];
  };
}

export class ConsistencyScorer {
  private llm: ChatOpenAI;
  private grok: ChatGrok;
  private tokenizer: natural.WordTokenizer;
  private stemmer: natural.PorterStemmer;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.1,
      maxTokens: 1000
    });

    this.grok = new ChatGrok({
      modelName: 'grok-3',
      temperature: 0.3,
      maxTokens: 1000
    });

    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = new natural.PorterStemmer();
  }

  async scoreConsistency(conversationHistory: any[]): Promise<ConsistencyScore> {
    try {
      if (conversationHistory.length < 2) {
        return this.getDefaultConsistencyScore();
      }

      // Extract agent responses
      const responses = conversationHistory
        .filter(conv => conv.response)
        .map(conv => conv.response);

      // Run parallel consistency checks
      const [
        personalityConsistency,
        demographicConsistency,
        behavioralConsistency,
        responseConsistency,
        contextConsistency
      ] = await Promise.all([
        this.checkPersonalityConsistency(responses),
        this.checkDemographicConsistency(responses, conversationHistory),
        this.checkBehavioralConsistency(responses),
        this.checkResponseConsistency(responses),
        this.checkContextConsistency(conversationHistory)
      ]);

      // Calculate overall consistency score
      const overall = this.calculateOverallConsistency({
        personality: personalityConsistency.score,
        demographic: demographicConsistency.score,
        behavioral: behavioralConsistency.score,
        response: responseConsistency.score,
        context: contextConsistency.score
      });

      // Generate recommendations
      const recommendations = await this.generateConsistencyRecommendations({
        personality: personalityConsistency,
        demographic: demographicConsistency,
        behavioral: behavioralConsistency,
        response: responseConsistency,
        context: contextConsistency
      });

      return {
        overall,
        personality: personalityConsistency.score,
        demographic: demographicConsistency.score,
        behavioral: behavioralConsistency.score,
        response: responseConsistency.score,
        context: contextConsistency.score,
        details: {
          personalityTraits: personalityConsistency,
          demographicAlignment: demographicConsistency,
          behavioralPatterns: behavioralConsistency,
          responseQuality: responseConsistency,
          contextAwareness: contextConsistency
        },
        recommendations
      };

    } catch (error) {
      console.error('Error scoring consistency:', error);
      return this.getDefaultConsistencyScore();
    }
  }

  private async checkPersonalityConsistency(responses: string[]): Promise<any> {
    try {
      const prompt = `Analyze the personality consistency across these responses:

      ${responses.map((r, i) => `Response ${i + 1}: ${r}`).join('\n\n')}

      Rate consistency from 0-1 for:
      1. Personality traits consistency
      2. Communication style consistency
      3. Emotional tone consistency
      4. Response length consistency

      Identify specific inconsistencies. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        score: analysis.overall || 0.5,
        consistency: analysis.traits || 0.5,
        variance: analysis.variance || 0.5,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error checking personality consistency:', error);
      return { score: 0.5, consistency: 0.5, variance: 0.5, issues: [] };
    }
  }

  private async checkDemographicConsistency(responses: string[], conversations: any[]): Promise<any> {
    try {
      // Extract demographic information from conversations
      const demographics = conversations
        .filter(conv => conv.demographics)
        .map(conv => conv.demographics);

      if (demographics.length === 0) {
        return { score: 0.5, ageAppropriate: 0.5, educationLevel: 0.5, culturalFit: 0.5, issues: [] };
      }

      const prompt = `Analyze demographic consistency between these responses and the agent's demographics:

      Demographics: ${JSON.stringify(demographics[0], null, 2)}

      Responses:
      ${responses.map((r, i) => `Response ${i + 1}: ${r}`).join('\n\n')}

      Rate consistency from 0-1 for:
      1. Age-appropriate language and references
      2. Education level appropriate responses
      3. Cultural fit and references
      4. Socioeconomic alignment

      Identify specific misalignments. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        score: analysis.overall || 0.5,
        ageAppropriate: analysis.ageAppropriate || 0.5,
        educationLevel: analysis.educationLevel || 0.5,
        culturalFit: analysis.culturalFit || 0.5,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error checking demographic consistency:', error);
      return { score: 0.5, ageAppropriate: 0.5, educationLevel: 0.5, culturalFit: 0.5, issues: [] };
    }
  }

  private async checkBehavioralConsistency(responses: string[]): Promise<any> {
    try {
      const prompt = `Analyze behavioral consistency across these responses:

      ${responses.map((r, i) => `Response ${i + 1}: ${r}`).join('\n\n')}

      Rate consistency from 0-1 for:
      1. Communication style consistency
      2. Decision-making pattern consistency
      3. Risk tolerance consistency
      4. Problem-solving approach consistency

      Identify specific behavioral inconsistencies. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        score: analysis.overall || 0.5,
        communicationStyle: analysis.communicationStyle || 0.5,
        decisionMaking: analysis.decisionMaking || 0.5,
        riskTolerance: analysis.riskTolerance || 0.5,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error checking behavioral consistency:', error);
      return { score: 0.5, communicationStyle: 0.5, decisionMaking: 0.5, riskTolerance: 0.5, issues: [] };
    }
  }

  private async checkResponseConsistency(responses: string[]): Promise<any> {
    try {
      // Analyze response quality metrics
      const metrics = responses.map(response => ({
        length: response.length,
        wordCount: this.tokenizer.tokenize(response).length,
        sentenceCount: response.split(/[.!?]+/).length,
        questionCount: (response.match(/\?/g) || []).length,
        exclamationCount: (response.match(/!/g) || []).length
      }));

      // Calculate variance in metrics
      const lengthVariance = this.calculateVariance(metrics.map(m => m.length));
      const wordCountVariance = this.calculateVariance(metrics.map(m => m.wordCount));
      const sentenceCountVariance = this.calculateVariance(metrics.map(m => m.sentenceCount));

      const prompt = `Analyze response quality consistency:

      ${responses.map((r, i) => `Response ${i + 1}: ${r}`).join('\n\n')}

      Rate consistency from 0-1 for:
      1. Response relevance to questions
      2. Response coherence and clarity
      3. Response completeness
      4. Response depth and detail

      Identify specific quality issues. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        score: analysis.overall || 0.5,
        relevance: analysis.relevance || 0.5,
        coherence: analysis.coherence || 0.5,
        completeness: analysis.completeness || 0.5,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error checking response consistency:', error);
      return { score: 0.5, relevance: 0.5, coherence: 0.5, completeness: 0.5, issues: [] };
    }
  }

  private async checkContextConsistency(conversationHistory: any[]): Promise<any> {
    try {
      const prompt = `Analyze context awareness and memory consistency across this conversation:

      ${conversationHistory.map((conv, i) => 
        `Turn ${i + 1}: Q: ${conv.message} A: ${conv.response}`
      ).join('\n\n')}

      Rate consistency from 0-1 for:
      1. Memory retention of previous topics
      2. Topic consistency and flow
      3. Emotional continuity
      4. Reference consistency

      Identify specific context issues. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        score: analysis.overall || 0.5,
        memoryRetention: analysis.memoryRetention || 0.5,
        topicConsistency: analysis.topicConsistency || 0.5,
        emotionalContinuity: analysis.emotionalContinuity || 0.5,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error checking context consistency:', error);
      return { score: 0.5, memoryRetention: 0.5, topicConsistency: 0.5, emotionalContinuity: 0.5, issues: [] };
    }
  }

  private calculateOverallConsistency(scores: {
    personality: number;
    demographic: number;
    behavioral: number;
    response: number;
    context: number;
  }): number {
    const weights = {
      personality: 0.25,
      demographic: 0.2,
      behavioral: 0.2,
      response: 0.2,
      context: 0.15
    };

    return (
      scores.personality * weights.personality +
      scores.demographic * weights.demographic +
      scores.behavioral * weights.behavioral +
      scores.response * weights.response +
      scores.context * weights.context
    );
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    
    return variance;
  }

  private async generateConsistencyRecommendations(details: any): Promise<string[]> {
    try {
      const prompt = `Based on these consistency analysis results, provide specific recommendations:

      ${JSON.stringify(details, null, 2)}

      Provide 5-10 specific, actionable recommendations to improve consistency. Focus on practical steps.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      
      const recommendations = response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 10);

      return recommendations;

    } catch (error) {
      console.error('Error generating consistency recommendations:', error);
      return [
        'Maintain consistent personality traits across all responses',
        'Ensure demographic alignment in language and references',
        'Keep behavioral patterns consistent with agent profile',
        'Maintain response quality and relevance',
        'Improve context awareness and memory retention'
      ];
    }
  }

  private getDefaultConsistencyScore(): ConsistencyScore {
    return {
      overall: 0.5,
      personality: 0.5,
      demographic: 0.5,
      behavioral: 0.5,
      response: 0.5,
      context: 0.5,
      details: {
        personalityTraits: { score: 0.5, consistency: 0.5, variance: 0.5, issues: [] },
        demographicAlignment: { score: 0.5, ageAppropriate: 0.5, educationLevel: 0.5, culturalFit: 0.5, issues: [] },
        behavioralPatterns: { score: 0.5, communicationStyle: 0.5, decisionMaking: 0.5, riskTolerance: 0.5, issues: [] },
        responseQuality: { score: 0.5, relevance: 0.5, coherence: 0.5, completeness: 0.5, issues: [] },
        contextAwareness: { score: 0.5, memoryRetention: 0.5, topicConsistency: 0.5, emotionalContinuity: 0.5, issues: [] }
      },
      recommendations: ['Insufficient data for consistency analysis']
    };
  }

  // Real-time consistency monitoring
  async monitorRealTimeConsistency(newResponse: string, previousResponses: string[]): Promise<number> {
    try {
      if (previousResponses.length === 0) return 1.0; // First response is always consistent

      const allResponses = [...previousResponses, newResponse];
      const consistency = await this.checkPersonalityConsistency(allResponses);
      
      return consistency.score;
    } catch (error) {
      console.error('Error in real-time consistency monitoring:', error);
      return 0.5;
    }
  }

  // Consistency trend analysis
  async analyzeConsistencyTrends(conversationHistory: any[]): Promise<any> {
    try {
      const timeWindows = this.createTimeWindows(conversationHistory, 3); // 3-minute windows
      const consistencyTrends = [];

      for (const window of timeWindows) {
        const consistency = await this.scoreConsistency(window);
        consistencyTrends.push({
          timestamp: window[0]?.timestamp || new Date().toISOString(),
          overallConsistency: consistency.overall,
          personalityConsistency: consistency.personality,
          responseConsistency: consistency.response
        });
      }

      return {
        trends: consistencyTrends,
        averageConsistency: consistencyTrends.reduce((sum, trend) => sum + trend.overallConsistency, 0) / consistencyTrends.length,
        trendDirection: this.calculateTrendDirection(consistencyTrends.map(t => t.overallConsistency))
      };

    } catch (error) {
      console.error('Error analyzing consistency trends:', error);
      return { trends: [], averageConsistency: 0.5, trendDirection: 'stable' };
    }
  }

  private createTimeWindows(conversations: any[], windowSizeMinutes: number): any[][] {
    const windows = [];
    const windowSizeMs = windowSizeMinutes * 60 * 1000;
    
    for (let i = 0; i < conversations.length; i += 5) { // Process in chunks of 5
      const window = conversations.slice(i, i + 5);
      if (window.length > 0) {
        windows.push(window);
      }
    }
    
    return windows;
  }

  private calculateTrendDirection(scores: number[]): 'improving' | 'declining' | 'stable' {
    if (scores.length < 2) return 'stable';
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) < 0.05) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }
}

export const consistencyScorer = new ConsistencyScorer();
import { ChatGrok } from '@langchain/community/chat_models/grok';
import * as natural from 'natural';
import { MLMatrix } from 'ml-matrix';

export interface ConsistencyScore {
  overall: number;
  personality: number;
  demographic: number;
  behavioral: number;
  response: number;
  context: number;
  details: ConsistencyDetails;
  recommendations: string[];
}

export interface ConsistencyDetails {
  personalityTraits: {
    score: number;
    consistency: number;
    variance: number;
    issues: string[];
  };
  demographicAlignment: {
    score: number;
    ageAppropriate: number;
    educationLevel: number;
    culturalFit: number;
    issues: string[];
  };
  behavioralPatterns: {
    score: number;
    communicationStyle: number;
    decisionMaking: number;
    riskTolerance: number;
    issues: string[];
  };
  responseQuality: {
    score: number;
    relevance: number;
    coherence: number;
    completeness: number;
    issues: string[];
  };
  contextAwareness: {
    score: number;
    memoryRetention: number;
    topicConsistency: number;
    emotionalContinuity: number;
    issues: string[];
  };
}

export class ConsistencyScorer {
  private llm: ChatOpenAI;
  private grok: ChatGrok;
  private tokenizer: natural.WordTokenizer;
  private stemmer: natural.PorterStemmer;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.1,
      maxTokens: 1000
    });

    this.grok = new ChatGrok({
      modelName: 'grok-3',
      temperature: 0.3,
      maxTokens: 1000
    });

    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = new natural.PorterStemmer();
  }

  async scoreConsistency(conversationHistory: any[]): Promise<ConsistencyScore> {
    try {
      if (conversationHistory.length < 2) {
        return this.getDefaultConsistencyScore();
      }

      // Extract agent responses
      const responses = conversationHistory
        .filter(conv => conv.response)
        .map(conv => conv.response);

      // Run parallel consistency checks
      const [
        personalityConsistency,
        demographicConsistency,
        behavioralConsistency,
        responseConsistency,
        contextConsistency
      ] = await Promise.all([
        this.checkPersonalityConsistency(responses),
        this.checkDemographicConsistency(responses, conversationHistory),
        this.checkBehavioralConsistency(responses),
        this.checkResponseConsistency(responses),
        this.checkContextConsistency(conversationHistory)
      ]);

      // Calculate overall consistency score
      const overall = this.calculateOverallConsistency({
        personality: personalityConsistency.score,
        demographic: demographicConsistency.score,
        behavioral: behavioralConsistency.score,
        response: responseConsistency.score,
        context: contextConsistency.score
      });

      // Generate recommendations
      const recommendations = await this.generateConsistencyRecommendations({
        personality: personalityConsistency,
        demographic: demographicConsistency,
        behavioral: behavioralConsistency,
        response: responseConsistency,
        context: contextConsistency
      });

      return {
        overall,
        personality: personalityConsistency.score,
        demographic: demographicConsistency.score,
        behavioral: behavioralConsistency.score,
        response: responseConsistency.score,
        context: contextConsistency.score,
        details: {
          personalityTraits: personalityConsistency,
          demographicAlignment: demographicConsistency,
          behavioralPatterns: behavioralConsistency,
          responseQuality: responseConsistency,
          contextAwareness: contextConsistency
        },
        recommendations
      };

    } catch (error) {
      console.error('Error scoring consistency:', error);
      return this.getDefaultConsistencyScore();
    }
  }

  private async checkPersonalityConsistency(responses: string[]): Promise<any> {
    try {
      const prompt = `Analyze the personality consistency across these responses:

      ${responses.map((r, i) => `Response ${i + 1}: ${r}`).join('\n\n')}

      Rate consistency from 0-1 for:
      1. Personality traits consistency
      2. Communication style consistency
      3. Emotional tone consistency
      4. Response length consistency

      Identify specific inconsistencies. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        score: analysis.overall || 0.5,
        consistency: analysis.traits || 0.5,
        variance: analysis.variance || 0.5,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error checking personality consistency:', error);
      return { score: 0.5, consistency: 0.5, variance: 0.5, issues: [] };
    }
  }

  private async checkDemographicConsistency(responses: string[], conversations: any[]): Promise<any> {
    try {
      // Extract demographic information from conversations
      const demographics = conversations
        .filter(conv => conv.demographics)
        .map(conv => conv.demographics);

      if (demographics.length === 0) {
        return { score: 0.5, ageAppropriate: 0.5, educationLevel: 0.5, culturalFit: 0.5, issues: [] };
      }

      const prompt = `Analyze demographic consistency between these responses and the agent's demographics:

      Demographics: ${JSON.stringify(demographics[0], null, 2)}

      Responses:
      ${responses.map((r, i) => `Response ${i + 1}: ${r}`).join('\n\n')}

      Rate consistency from 0-1 for:
      1. Age-appropriate language and references
      2. Education level appropriate responses
      3. Cultural fit and references
      4. Socioeconomic alignment

      Identify specific misalignments. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        score: analysis.overall || 0.5,
        ageAppropriate: analysis.ageAppropriate || 0.5,
        educationLevel: analysis.educationLevel || 0.5,
        culturalFit: analysis.culturalFit || 0.5,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error checking demographic consistency:', error);
      return { score: 0.5, ageAppropriate: 0.5, educationLevel: 0.5, culturalFit: 0.5, issues: [] };
    }
  }

  private async checkBehavioralConsistency(responses: string[]): Promise<any> {
    try {
      const prompt = `Analyze behavioral consistency across these responses:

      ${responses.map((r, i) => `Response ${i + 1}: ${r}`).join('\n\n')}

      Rate consistency from 0-1 for:
      1. Communication style consistency
      2. Decision-making pattern consistency
      3. Risk tolerance consistency
      4. Problem-solving approach consistency

      Identify specific behavioral inconsistencies. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        score: analysis.overall || 0.5,
        communicationStyle: analysis.communicationStyle || 0.5,
        decisionMaking: analysis.decisionMaking || 0.5,
        riskTolerance: analysis.riskTolerance || 0.5,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error checking behavioral consistency:', error);
      return { score: 0.5, communicationStyle: 0.5, decisionMaking: 0.5, riskTolerance: 0.5, issues: [] };
    }
  }

  private async checkResponseConsistency(responses: string[]): Promise<any> {
    try {
      // Analyze response quality metrics
      const metrics = responses.map(response => ({
        length: response.length,
        wordCount: this.tokenizer.tokenize(response).length,
        sentenceCount: response.split(/[.!?]+/).length,
        questionCount: (response.match(/\?/g) || []).length,
        exclamationCount: (response.match(/!/g) || []).length
      }));

      // Calculate variance in metrics
      const lengthVariance = this.calculateVariance(metrics.map(m => m.length));
      const wordCountVariance = this.calculateVariance(metrics.map(m => m.wordCount));
      const sentenceCountVariance = this.calculateVariance(metrics.map(m => m.sentenceCount));

      const prompt = `Analyze response quality consistency:

      ${responses.map((r, i) => `Response ${i + 1}: ${r}`).join('\n\n')}

      Rate consistency from 0-1 for:
      1. Response relevance to questions
      2. Response coherence and clarity
      3. Response completeness
      4. Response depth and detail

      Identify specific quality issues. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        score: analysis.overall || 0.5,
        relevance: analysis.relevance || 0.5,
        coherence: analysis.coherence || 0.5,
        completeness: analysis.completeness || 0.5,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error checking response consistency:', error);
      return { score: 0.5, relevance: 0.5, coherence: 0.5, completeness: 0.5, issues: [] };
    }
  }

  private async checkContextConsistency(conversationHistory: any[]): Promise<any> {
    try {
      const prompt = `Analyze context awareness and memory consistency across this conversation:

      ${conversationHistory.map((conv, i) => 
        `Turn ${i + 1}: Q: ${conv.message} A: ${conv.response}`
      ).join('\n\n')}

      Rate consistency from 0-1 for:
      1. Memory retention of previous topics
      2. Topic consistency and flow
      3. Emotional continuity
      4. Reference consistency

      Identify specific context issues. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        score: analysis.overall || 0.5,
        memoryRetention: analysis.memoryRetention || 0.5,
        topicConsistency: analysis.topicConsistency || 0.5,
        emotionalContinuity: analysis.emotionalContinuity || 0.5,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error checking context consistency:', error);
      return { score: 0.5, memoryRetention: 0.5, topicConsistency: 0.5, emotionalContinuity: 0.5, issues: [] };
    }
  }

  private calculateOverallConsistency(scores: {
    personality: number;
    demographic: number;
    behavioral: number;
    response: number;
    context: number;
  }): number {
    const weights = {
      personality: 0.25,
      demographic: 0.2,
      behavioral: 0.2,
      response: 0.2,
      context: 0.15
    };

    return (
      scores.personality * weights.personality +
      scores.demographic * weights.demographic +
      scores.behavioral * weights.behavioral +
      scores.response * weights.response +
      scores.context * weights.context
    );
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    
    return variance;
  }

  private async generateConsistencyRecommendations(details: any): Promise<string[]> {
    try {
      const prompt = `Based on these consistency analysis results, provide specific recommendations:

      ${JSON.stringify(details, null, 2)}

      Provide 5-10 specific, actionable recommendations to improve consistency. Focus on practical steps.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      
      const recommendations = response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 10);

      return recommendations;

    } catch (error) {
      console.error('Error generating consistency recommendations:', error);
      return [
        'Maintain consistent personality traits across all responses',
        'Ensure demographic alignment in language and references',
        'Keep behavioral patterns consistent with agent profile',
        'Maintain response quality and relevance',
        'Improve context awareness and memory retention'
      ];
    }
  }

  private getDefaultConsistencyScore(): ConsistencyScore {
    return {
      overall: 0.5,
      personality: 0.5,
      demographic: 0.5,
      behavioral: 0.5,
      response: 0.5,
      context: 0.5,
      details: {
        personalityTraits: { score: 0.5, consistency: 0.5, variance: 0.5, issues: [] },
        demographicAlignment: { score: 0.5, ageAppropriate: 0.5, educationLevel: 0.5, culturalFit: 0.5, issues: [] },
        behavioralPatterns: { score: 0.5, communicationStyle: 0.5, decisionMaking: 0.5, riskTolerance: 0.5, issues: [] },
        responseQuality: { score: 0.5, relevance: 0.5, coherence: 0.5, completeness: 0.5, issues: [] },
        contextAwareness: { score: 0.5, memoryRetention: 0.5, topicConsistency: 0.5, emotionalContinuity: 0.5, issues: [] }
      },
      recommendations: ['Insufficient data for consistency analysis']
    };
  }

  // Real-time consistency monitoring
  async monitorRealTimeConsistency(newResponse: string, previousResponses: string[]): Promise<number> {
    try {
      if (previousResponses.length === 0) return 1.0; // First response is always consistent

      const allResponses = [...previousResponses, newResponse];
      const consistency = await this.checkPersonalityConsistency(allResponses);
      
      return consistency.score;
    } catch (error) {
      console.error('Error in real-time consistency monitoring:', error);
      return 0.5;
    }
  }

  // Consistency trend analysis
  async analyzeConsistencyTrends(conversationHistory: any[]): Promise<any> {
    try {
      const timeWindows = this.createTimeWindows(conversationHistory, 3); // 3-minute windows
      const consistencyTrends = [];

      for (const window of timeWindows) {
        const consistency = await this.scoreConsistency(window);
        consistencyTrends.push({
          timestamp: window[0]?.timestamp || new Date().toISOString(),
          overallConsistency: consistency.overall,
          personalityConsistency: consistency.personality,
          responseConsistency: consistency.response
        });
      }

      return {
        trends: consistencyTrends,
        averageConsistency: consistencyTrends.reduce((sum, trend) => sum + trend.overallConsistency, 0) / consistencyTrends.length,
        trendDirection: this.calculateTrendDirection(consistencyTrends.map(t => t.overallConsistency))
      };

    } catch (error) {
      console.error('Error analyzing consistency trends:', error);
      return { trends: [], averageConsistency: 0.5, trendDirection: 'stable' };
    }
  }

  private createTimeWindows(conversations: any[], windowSizeMinutes: number): any[][] {
    const windows = [];
    const windowSizeMs = windowSizeMinutes * 60 * 1000;
    
    for (let i = 0; i < conversations.length; i += 5) { // Process in chunks of 5
      const window = conversations.slice(i, i + 5);
      if (window.length > 0) {
        windows.push(window);
      }
    }
    
    return windows;
  }

  private calculateTrendDirection(scores: number[]): 'improving' | 'declining' | 'stable' {
    if (scores.length < 2) return 'stable';
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) < 0.05) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }
}

export const consistencyScorer = new ConsistencyScorer();
