import { ChatOpenAI } from '@langchain/openai';
import { ChatGrok } from '@langchain/community/chat_models/grok';
import * as natural from 'natural';
import * as Sentiment from 'sentiment';
import { MLMatrix } from 'ml-matrix';

export interface BiasDetectionResult {
  overallBiasScore: number;
  demographicBias: DemographicBias;
  languageBias: LanguageBias;
  culturalBias: CulturalBias;
  cognitiveBias: CognitiveBias;
  recommendations: string[];
  confidence: number;
}

export interface DemographicBias {
  gender: number;
  age: number;
  ethnicity: number;
  socioeconomic: number;
  education: number;
  location: number;
  overall: number;
  issues: string[];
}

export interface LanguageBias {
  formality: number;
  complexity: number;
  culturalReferences: number;
  technicalJargon: number;
  overall: number;
  issues: string[];
}

export interface CulturalBias {
  westernCentric: number;
  religious: number;
  political: number;
  regional: number;
  overall: number;
  issues: string[];
}

export interface CognitiveBias {
  confirmation: number;
  availability: number;
  anchoring: number;
  framing: number;
  overall: number;
  issues: string[];
}

export class BiasDetectionEngine {
  private llm: ChatOpenAI;
  private grok: ChatGrok;
  private sentiment: Sentiment.Sentiment;
  private tokenizer: natural.WordTokenizer;

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

    this.sentiment = new Sentiment.Sentiment();
    this.tokenizer = new natural.WordTokenizer();
  }

  async detectBias(conversationHistory: any[]): Promise<BiasDetectionResult> {
    try {
      // Extract text content from conversations
      const textContent = conversationHistory
        .map(conv => `${conv.message} ${conv.response}`)
        .join(' ');

      // Run parallel bias detection
      const [
        demographicBias,
        languageBias,
        culturalBias,
        cognitiveBias
      ] = await Promise.all([
        this.detectDemographicBias(textContent),
        this.detectLanguageBias(textContent),
        this.detectCulturalBias(textContent),
        this.detectCognitiveBias(textContent)
      ]);

      // Calculate overall bias score
      const overallBiasScore = this.calculateOverallBiasScore({
        demographicBias,
        languageBias,
        culturalBias,
        cognitiveBias
      });

      // Generate recommendations
      const recommendations = await this.generateBiasRecommendations({
        demographicBias,
        languageBias,
        culturalBias,
        cognitiveBias
      });

      return {
        overallBiasScore,
        demographicBias,
        languageBias,
        culturalBias,
        cognitiveBias,
        recommendations,
        confidence: 0.85
      };

    } catch (error) {
      console.error('Error detecting bias:', error);
      throw error;
    }
  }

  private async detectDemographicBias(text: string): Promise<DemographicBias> {
    try {
      const prompt = `Analyze the following text for demographic bias. Rate each category from 0 (no bias) to 1 (high bias):

      Text: "${text}"

      Provide scores for:
      1. Gender bias (0-1)
      2. Age bias (0-1)
      3. Ethnicity bias (0-1)
      4. Socioeconomic bias (0-1)
      5. Education bias (0-1)
      6. Location bias (0-1)

      Also list specific issues found. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        gender: analysis.gender || 0,
        age: analysis.age || 0,
        ethnicity: analysis.ethnicity || 0,
        socioeconomic: analysis.socioeconomic || 0,
        education: analysis.education || 0,
        location: analysis.location || 0,
        overall: (analysis.gender + analysis.age + analysis.ethnicity + 
                 analysis.socioeconomic + analysis.education + analysis.location) / 6,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error detecting demographic bias:', error);
      return {
        gender: 0,
        age: 0,
        ethnicity: 0,
        socioeconomic: 0,
        education: 0,
        location: 0,
        overall: 0,
        issues: []
      };
    }
  }

  private async detectLanguageBias(text: string): Promise<LanguageBias> {
    try {
      // Analyze language characteristics
      const words = this.tokenizer.tokenize(text.toLowerCase());
      const wordCount = words.length;
      
      // Check formality
      const formalWords = ['therefore', 'however', 'furthermore', 'consequently', 'moreover'];
      const formalCount = words.filter(word => formalWords.includes(word)).length;
      const formality = formalCount / wordCount;

      // Check complexity (average word length)
      const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
      const complexity = Math.min(avgWordLength / 10, 1); // Normalize to 0-1

      // Check for technical jargon
      const technicalWords = ['algorithm', 'methodology', 'framework', 'paradigm', 'infrastructure'];
      const technicalCount = words.filter(word => technicalWords.includes(word)).length;
      const technicalJargon = technicalCount / wordCount;

      // Use LLM for cultural references
      const prompt = `Analyze this text for cultural references and language bias:

      "${text}"

      Rate cultural references from 0-1 (0 = no bias, 1 = high bias).
      List specific cultural references found. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        formality: Math.min(formality * 2, 1), // Scale up
        complexity: Math.min(complexity, 1),
        culturalReferences: analysis.culturalReferences || 0,
        technicalJargon: Math.min(technicalJargon * 5, 1), // Scale up
        overall: (formality + complexity + (analysis.culturalReferences || 0) + technicalJargon) / 4,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error detecting language bias:', error);
      return {
        formality: 0,
        complexity: 0,
        culturalReferences: 0,
        technicalJargon: 0,
        overall: 0,
        issues: []
      };
    }
  }

  private async detectCulturalBias(text: string): Promise<CulturalBias> {
    try {
      const prompt = `Analyze this text for cultural bias:

      "${text}"

      Rate each category from 0-1 (0 = no bias, 1 = high bias):
      1. Western-centric bias
      2. Religious bias
      3. Political bias
      4. Regional bias

      List specific issues found. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        westernCentric: analysis.westernCentric || 0,
        religious: analysis.religious || 0,
        political: analysis.political || 0,
        regional: analysis.regional || 0,
        overall: (analysis.westernCentric + analysis.religious + 
                 analysis.political + analysis.regional) / 4,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error detecting cultural bias:', error);
      return {
        westernCentric: 0,
        religious: 0,
        political: 0,
        regional: 0,
        overall: 0,
        issues: []
      };
    }
  }

  private async detectCognitiveBias(text: string): Promise<CognitiveBias> {
    try {
      const prompt = `Analyze this text for cognitive biases:

      "${text}"

      Rate each bias from 0-1 (0 = no bias, 1 = high bias):
      1. Confirmation bias (seeking confirming evidence)
      2. Availability bias (relying on easily available information)
      3. Anchoring bias (over-relying on first information)
      4. Framing bias (influenced by how information is presented)

      List specific issues found. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        confirmation: analysis.confirmation || 0,
        availability: analysis.availability || 0,
        anchoring: analysis.anchoring || 0,
        framing: analysis.framing || 0,
        overall: (analysis.confirmation + analysis.availability + 
                 analysis.anchoring + analysis.framing) / 4,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error detecting cognitive bias:', error);
      return {
        confirmation: 0,
        availability: 0,
        anchoring: 0,
        framing: 0,
        overall: 0,
        issues: []
      };
    }
  }

  private calculateOverallBiasScore(biasResults: {
    demographicBias: DemographicBias;
    languageBias: LanguageBias;
    culturalBias: CulturalBias;
    cognitiveBias: CognitiveBias;
  }): number {
    const weights = {
      demographic: 0.3,
      language: 0.2,
      cultural: 0.25,
      cognitive: 0.25
    };

    return (
      biasResults.demographicBias.overall * weights.demographic +
      biasResults.languageBias.overall * weights.language +
      biasResults.culturalBias.overall * weights.cultural +
      biasResults.cognitiveBias.overall * weights.cognitive
    );
  }

  private async generateBiasRecommendations(biasResults: any): Promise<string[]> {
    try {
      const prompt = `Based on these bias detection results, provide specific, actionable recommendations:

      ${JSON.stringify(biasResults, null, 2)}

      Provide 5-10 specific recommendations to reduce bias. Focus on practical steps that can be implemented immediately.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      
      // Parse recommendations (assuming they're in a list format)
      const recommendations = response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 10);

      return recommendations;

    } catch (error) {
      console.error('Error generating bias recommendations:', error);
      return [
        'Review demographic representation in your research sample',
        'Use inclusive language and avoid assumptions',
        'Consider cultural context in your questions',
        'Be aware of your own biases and assumptions',
        'Seek diverse perspectives and feedback'
      ];
    }
  }

  // Real-time bias monitoring
  async monitorRealTimeBias(message: string, context: any): Promise<number> {
    try {
      const quickAnalysis = await this.detectDemographicBias(message);
      return quickAnalysis.overall;
    } catch (error) {
      console.error('Error in real-time bias monitoring:', error);
      return 0;
    }
  }

  // Bias trend analysis
  async analyzeBiasTrends(conversationHistory: any[]): Promise<any> {
    try {
      const timeWindows = this.createTimeWindows(conversationHistory, 5); // 5-minute windows
      const biasTrends = [];

      for (const window of timeWindows) {
        const biasResult = await this.detectBias(window);
        biasTrends.push({
          timestamp: window[0]?.timestamp || new Date().toISOString(),
          biasScore: biasResult.overallBiasScore,
          demographicBias: biasResult.demographicBias.overall,
          languageBias: biasResult.languageBias.overall
        });
      }

      return {
        trends: biasTrends,
        averageBias: biasTrends.reduce((sum, trend) => sum + trend.biasScore, 0) / biasTrends.length,
        trendDirection: this.calculateTrendDirection(biasTrends.map(t => t.biasScore))
      };

    } catch (error) {
      console.error('Error analyzing bias trends:', error);
      return { trends: [], averageBias: 0, trendDirection: 'stable' };
    }
  }

  private createTimeWindows(conversations: any[], windowSizeMinutes: number): any[][] {
    const windows = [];
    const windowSizeMs = windowSizeMinutes * 60 * 1000;
    
    for (let i = 0; i < conversations.length; i += 10) { // Process in chunks of 10
      const window = conversations.slice(i, i + 10);
      if (window.length > 0) {
        windows.push(window);
      }
    }
    
    return windows;
  }

  private calculateTrendDirection(scores: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (scores.length < 2) return 'stable';
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) < 0.05) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }
}

export const biasDetectionEngine = new BiasDetectionEngine();
import { ChatGrok } from '@langchain/community/chat_models/grok';
import * as natural from 'natural';
import * as Sentiment from 'sentiment';
import { MLMatrix } from 'ml-matrix';

export interface BiasDetectionResult {
  overallBiasScore: number;
  demographicBias: DemographicBias;
  languageBias: LanguageBias;
  culturalBias: CulturalBias;
  cognitiveBias: CognitiveBias;
  recommendations: string[];
  confidence: number;
}

export interface DemographicBias {
  gender: number;
  age: number;
  ethnicity: number;
  socioeconomic: number;
  education: number;
  location: number;
  overall: number;
  issues: string[];
}

export interface LanguageBias {
  formality: number;
  complexity: number;
  culturalReferences: number;
  technicalJargon: number;
  overall: number;
  issues: string[];
}

export interface CulturalBias {
  westernCentric: number;
  religious: number;
  political: number;
  regional: number;
  overall: number;
  issues: string[];
}

export interface CognitiveBias {
  confirmation: number;
  availability: number;
  anchoring: number;
  framing: number;
  overall: number;
  issues: string[];
}

export class BiasDetectionEngine {
  private llm: ChatOpenAI;
  private grok: ChatGrok;
  private sentiment: Sentiment.Sentiment;
  private tokenizer: natural.WordTokenizer;

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

    this.sentiment = new Sentiment.Sentiment();
    this.tokenizer = new natural.WordTokenizer();
  }

  async detectBias(conversationHistory: any[]): Promise<BiasDetectionResult> {
    try {
      // Extract text content from conversations
      const textContent = conversationHistory
        .map(conv => `${conv.message} ${conv.response}`)
        .join(' ');

      // Run parallel bias detection
      const [
        demographicBias,
        languageBias,
        culturalBias,
        cognitiveBias
      ] = await Promise.all([
        this.detectDemographicBias(textContent),
        this.detectLanguageBias(textContent),
        this.detectCulturalBias(textContent),
        this.detectCognitiveBias(textContent)
      ]);

      // Calculate overall bias score
      const overallBiasScore = this.calculateOverallBiasScore({
        demographicBias,
        languageBias,
        culturalBias,
        cognitiveBias
      });

      // Generate recommendations
      const recommendations = await this.generateBiasRecommendations({
        demographicBias,
        languageBias,
        culturalBias,
        cognitiveBias
      });

      return {
        overallBiasScore,
        demographicBias,
        languageBias,
        culturalBias,
        cognitiveBias,
        recommendations,
        confidence: 0.85
      };

    } catch (error) {
      console.error('Error detecting bias:', error);
      throw error;
    }
  }

  private async detectDemographicBias(text: string): Promise<DemographicBias> {
    try {
      const prompt = `Analyze the following text for demographic bias. Rate each category from 0 (no bias) to 1 (high bias):

      Text: "${text}"

      Provide scores for:
      1. Gender bias (0-1)
      2. Age bias (0-1)
      3. Ethnicity bias (0-1)
      4. Socioeconomic bias (0-1)
      5. Education bias (0-1)
      6. Location bias (0-1)

      Also list specific issues found. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        gender: analysis.gender || 0,
        age: analysis.age || 0,
        ethnicity: analysis.ethnicity || 0,
        socioeconomic: analysis.socioeconomic || 0,
        education: analysis.education || 0,
        location: analysis.location || 0,
        overall: (analysis.gender + analysis.age + analysis.ethnicity + 
                 analysis.socioeconomic + analysis.education + analysis.location) / 6,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error detecting demographic bias:', error);
      return {
        gender: 0,
        age: 0,
        ethnicity: 0,
        socioeconomic: 0,
        education: 0,
        location: 0,
        overall: 0,
        issues: []
      };
    }
  }

  private async detectLanguageBias(text: string): Promise<LanguageBias> {
    try {
      // Analyze language characteristics
      const words = this.tokenizer.tokenize(text.toLowerCase());
      const wordCount = words.length;
      
      // Check formality
      const formalWords = ['therefore', 'however', 'furthermore', 'consequently', 'moreover'];
      const formalCount = words.filter(word => formalWords.includes(word)).length;
      const formality = formalCount / wordCount;

      // Check complexity (average word length)
      const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
      const complexity = Math.min(avgWordLength / 10, 1); // Normalize to 0-1

      // Check for technical jargon
      const technicalWords = ['algorithm', 'methodology', 'framework', 'paradigm', 'infrastructure'];
      const technicalCount = words.filter(word => technicalWords.includes(word)).length;
      const technicalJargon = technicalCount / wordCount;

      // Use LLM for cultural references
      const prompt = `Analyze this text for cultural references and language bias:

      "${text}"

      Rate cultural references from 0-1 (0 = no bias, 1 = high bias).
      List specific cultural references found. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        formality: Math.min(formality * 2, 1), // Scale up
        complexity: Math.min(complexity, 1),
        culturalReferences: analysis.culturalReferences || 0,
        technicalJargon: Math.min(technicalJargon * 5, 1), // Scale up
        overall: (formality + complexity + (analysis.culturalReferences || 0) + technicalJargon) / 4,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error detecting language bias:', error);
      return {
        formality: 0,
        complexity: 0,
        culturalReferences: 0,
        technicalJargon: 0,
        overall: 0,
        issues: []
      };
    }
  }

  private async detectCulturalBias(text: string): Promise<CulturalBias> {
    try {
      const prompt = `Analyze this text for cultural bias:

      "${text}"

      Rate each category from 0-1 (0 = no bias, 1 = high bias):
      1. Western-centric bias
      2. Religious bias
      3. Political bias
      4. Regional bias

      List specific issues found. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        westernCentric: analysis.westernCentric || 0,
        religious: analysis.religious || 0,
        political: analysis.political || 0,
        regional: analysis.regional || 0,
        overall: (analysis.westernCentric + analysis.religious + 
                 analysis.political + analysis.regional) / 4,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error detecting cultural bias:', error);
      return {
        westernCentric: 0,
        religious: 0,
        political: 0,
        regional: 0,
        overall: 0,
        issues: []
      };
    }
  }

  private async detectCognitiveBias(text: string): Promise<CognitiveBias> {
    try {
      const prompt = `Analyze this text for cognitive biases:

      "${text}"

      Rate each bias from 0-1 (0 = no bias, 1 = high bias):
      1. Confirmation bias (seeking confirming evidence)
      2. Availability bias (relying on easily available information)
      3. Anchoring bias (over-relying on first information)
      4. Framing bias (influenced by how information is presented)

      List specific issues found. Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      return {
        confirmation: analysis.confirmation || 0,
        availability: analysis.availability || 0,
        anchoring: analysis.anchoring || 0,
        framing: analysis.framing || 0,
        overall: (analysis.confirmation + analysis.availability + 
                 analysis.anchoring + analysis.framing) / 4,
        issues: analysis.issues || []
      };

    } catch (error) {
      console.error('Error detecting cognitive bias:', error);
      return {
        confirmation: 0,
        availability: 0,
        anchoring: 0,
        framing: 0,
        overall: 0,
        issues: []
      };
    }
  }

  private calculateOverallBiasScore(biasResults: {
    demographicBias: DemographicBias;
    languageBias: LanguageBias;
    culturalBias: CulturalBias;
    cognitiveBias: CognitiveBias;
  }): number {
    const weights = {
      demographic: 0.3,
      language: 0.2,
      cultural: 0.25,
      cognitive: 0.25
    };

    return (
      biasResults.demographicBias.overall * weights.demographic +
      biasResults.languageBias.overall * weights.language +
      biasResults.culturalBias.overall * weights.cultural +
      biasResults.cognitiveBias.overall * weights.cognitive
    );
  }

  private async generateBiasRecommendations(biasResults: any): Promise<string[]> {
    try {
      const prompt = `Based on these bias detection results, provide specific, actionable recommendations:

      ${JSON.stringify(biasResults, null, 2)}

      Provide 5-10 specific recommendations to reduce bias. Focus on practical steps that can be implemented immediately.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      
      // Parse recommendations (assuming they're in a list format)
      const recommendations = response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 10);

      return recommendations;

    } catch (error) {
      console.error('Error generating bias recommendations:', error);
      return [
        'Review demographic representation in your research sample',
        'Use inclusive language and avoid assumptions',
        'Consider cultural context in your questions',
        'Be aware of your own biases and assumptions',
        'Seek diverse perspectives and feedback'
      ];
    }
  }

  // Real-time bias monitoring
  async monitorRealTimeBias(message: string, context: any): Promise<number> {
    try {
      const quickAnalysis = await this.detectDemographicBias(message);
      return quickAnalysis.overall;
    } catch (error) {
      console.error('Error in real-time bias monitoring:', error);
      return 0;
    }
  }

  // Bias trend analysis
  async analyzeBiasTrends(conversationHistory: any[]): Promise<any> {
    try {
      const timeWindows = this.createTimeWindows(conversationHistory, 5); // 5-minute windows
      const biasTrends = [];

      for (const window of timeWindows) {
        const biasResult = await this.detectBias(window);
        biasTrends.push({
          timestamp: window[0]?.timestamp || new Date().toISOString(),
          biasScore: biasResult.overallBiasScore,
          demographicBias: biasResult.demographicBias.overall,
          languageBias: biasResult.languageBias.overall
        });
      }

      return {
        trends: biasTrends,
        averageBias: biasTrends.reduce((sum, trend) => sum + trend.biasScore, 0) / biasTrends.length,
        trendDirection: this.calculateTrendDirection(biasTrends.map(t => t.biasScore))
      };

    } catch (error) {
      console.error('Error analyzing bias trends:', error);
      return { trends: [], averageBias: 0, trendDirection: 'stable' };
    }
  }

  private createTimeWindows(conversations: any[], windowSizeMinutes: number): any[][] {
    const windows = [];
    const windowSizeMs = windowSizeMinutes * 60 * 1000;
    
    for (let i = 0; i < conversations.length; i += 10) { // Process in chunks of 10
      const window = conversations.slice(i, i + 10);
      if (window.length > 0) {
        windows.push(window);
      }
    }
    
    return windows;
  }

  private calculateTrendDirection(scores: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (scores.length < 2) return 'stable';
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    const difference = secondAvg - firstAvg;
    
    if (Math.abs(difference) < 0.05) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }
}

export const biasDetectionEngine = new BiasDetectionEngine();
