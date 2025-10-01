import { ChatOpenAI } from '@langchain/openai';
import { ChatGrok } from '@langchain/community/chat_models/grok';
import * as Sentiment from 'sentiment';
import * as natural from 'natural';

export interface SentimentAnalysisResult {
  overall: SentimentScore;
  emotions: EmotionAnalysis;
  trends: SentimentTrend;
  insights: string[];
  confidence: number;
}

export interface SentimentScore {
  score: number; // -1 to 1
  label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  magnitude: number; // 0 to 1
  polarity: number; // -1 to 1
}

export interface EmotionAnalysis {
  primary: string;
  secondary: string[];
  intensity: number; // 0 to 1
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
}

export interface SentimentTrend {
  direction: 'improving' | 'declining' | 'stable';
  velocity: number; // rate of change
  volatility: number; // 0 to 1
  stability: number; // 0 to 1
}

export class SentimentAnalyzer {
  private llm: ChatOpenAI;
  private grok: ChatGrok;
  private sentiment: Sentiment.Sentiment;
  private tokenizer: natural.WordTokenizer;
  private stemmer: natural.PorterStemmer;

  // Emotion keywords mapping
  private emotionKeywords = {
    joy: ['happy', 'excited', 'pleased', 'delighted', 'thrilled', 'joyful', 'cheerful', 'elated'],
    sadness: ['sad', 'depressed', 'disappointed', 'upset', 'melancholy', 'gloomy', 'sorrowful', 'dejected'],
    anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'outraged', 'hostile'],
    fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'terrified', 'frightened', 'concerned'],
    surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'startled', 'bewildered', 'stunned'],
    disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'appalled', 'nauseated'],
    trust: ['trust', 'confident', 'secure', 'reliable', 'faithful', 'dependable', 'sure'],
    anticipation: ['excited', 'eager', 'hopeful', 'optimistic', 'expectant', 'enthusiastic']
  };

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
    this.stemmer = new natural.PorterStemmer();
  }

  async analyzeSentiment(conversationHistory: any[]): Promise<SentimentAnalysisResult> {
    try {
      if (conversationHistory.length === 0) {
        return this.getDefaultSentimentResult();
      }

      // Extract text content
      const textContent = conversationHistory
        .map(conv => `${conv.message} ${conv.response}`)
        .join(' ');

      // Run parallel sentiment analysis
      const [
        basicSentiment,
        emotionAnalysis,
        trendAnalysis
      ] = await Promise.all([
        this.analyzeBasicSentiment(textContent),
        this.analyzeEmotions(textContent),
        this.analyzeSentimentTrends(conversationHistory)
      ]);

      // Generate insights
      const insights = await this.generateSentimentInsights({
        sentiment: basicSentiment,
        emotions: emotionAnalysis,
        trends: trendAnalysis
      });

      return {
        overall: basicSentiment,
        emotions: emotionAnalysis,
        trends: trendAnalysis,
        insights,
        confidence: this.calculateConfidence(basicSentiment, emotionAnalysis)
      };

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return this.getDefaultSentimentResult();
    }
  }

  private async analyzeBasicSentiment(text: string): Promise<SentimentScore> {
    try {
      // Use the sentiment library for basic analysis
      const sentimentResult = this.sentiment.analyze(text);
      
      // Normalize score to -1 to 1 range
      const normalizedScore = Math.max(-1, Math.min(1, sentimentResult.score / 10));
      
      // Calculate magnitude (absolute value)
      const magnitude = Math.abs(normalizedScore);
      
      // Determine label
      let label: SentimentScore['label'];
      if (normalizedScore <= -0.6) label = 'very_negative';
      else if (normalizedScore <= -0.2) label = 'negative';
      else if (normalizedScore <= 0.2) label = 'neutral';
      else if (normalizedScore <= 0.6) label = 'positive';
      else label = 'very_positive';

      // Use LLM for more nuanced analysis
      const prompt = `Analyze the sentiment of this text more deeply:

      "${text}"

      Provide:
      1. Polarity score (-1 to 1)
      2. Magnitude (0 to 1)
      3. Overall sentiment label
      4. Confidence level

      Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const llmAnalysis = JSON.parse(response.content as string);

      return {
        score: llmAnalysis.polarity || normalizedScore,
        label: llmAnalysis.label || label,
        magnitude: llmAnalysis.magnitude || magnitude,
        polarity: llmAnalysis.polarity || normalizedScore
      };

    } catch (error) {
      console.error('Error analyzing basic sentiment:', error);
      return { score: 0, label: 'neutral', magnitude: 0, polarity: 0 };
    }
  }

  private async analyzeEmotions(text: string): Promise<EmotionAnalysis> {
    try {
      const words = this.tokenizer.tokenize(text.toLowerCase());
      const stemmedWords = words.map(word => this.stemmer.stem(word));

      // Calculate emotion scores
      const emotionScores: { [key: string]: number } = {};
      for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
        const matches = stemmedWords.filter(word => keywords.includes(word)).length;
        emotionScores[emotion] = matches / words.length; // Normalize by word count
      }

      // Find primary and secondary emotions
      const sortedEmotions = Object.entries(emotionScores)
        .sort(([,a], [,b]) => b - a);

      const primary = sortedEmotions[0]?.[0] || 'neutral';
      const secondary = sortedEmotions.slice(1, 4).map(([emotion]) => emotion);

      // Calculate intensity
      const intensity = Math.max(...Object.values(emotionScores));

      // Use LLM for more sophisticated emotion analysis
      const prompt = `Analyze the emotions in this text:

      "${text}"

      Provide detailed emotion scores (0-1) for:
      - Joy
      - Sadness
      - Anger
      - Fear
      - Surprise
      - Disgust
      - Trust
      - Anticipation

      Also identify the primary emotion and intensity level.
      Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const llmEmotions = JSON.parse(response.content as string);

      return {
        primary: llmEmotions.primary || primary,
        secondary: llmEmotions.secondary || secondary,
        intensity: llmEmotions.intensity || intensity,
        emotions: {
          joy: llmEmotions.joy || emotionScores.joy || 0,
          sadness: llmEmotions.sadness || emotionScores.sadness || 0,
          anger: llmEmotions.anger || emotionScores.anger || 0,
          fear: llmEmotions.fear || emotionScores.fear || 0,
          surprise: llmEmotions.surprise || emotionScores.surprise || 0,
          disgust: llmEmotions.disgust || emotionScores.disgust || 0,
          trust: llmEmotions.trust || emotionScores.trust || 0,
          anticipation: llmEmotions.anticipation || emotionScores.anticipation || 0
        }
      };

    } catch (error) {
      console.error('Error analyzing emotions:', error);
      return {
        primary: 'neutral',
        secondary: [],
        intensity: 0,
        emotions: {
          joy: 0, sadness: 0, anger: 0, fear: 0,
          surprise: 0, disgust: 0, trust: 0, anticipation: 0
        }
      };
    }
  }

  private async analyzeSentimentTrends(conversationHistory: any[]): Promise<SentimentTrend> {
    try {
      if (conversationHistory.length < 3) {
        return { direction: 'stable', velocity: 0, volatility: 0, stability: 1 };
      }

      // Analyze sentiment over time
      const timeWindows = this.createTimeWindows(conversationHistory, 2); // 2-minute windows
      const sentimentScores = [];

      for (const window of timeWindows) {
        const text = window.map(conv => `${conv.message} ${conv.response}`).join(' ');
        const sentiment = this.sentiment.analyze(text);
        sentimentScores.push(sentiment.score / 10); // Normalize
      }

      // Calculate trend metrics
      const direction = this.calculateTrendDirection(sentimentScores);
      const velocity = this.calculateVelocity(sentimentScores);
      const volatility = this.calculateVolatility(sentimentScores);
      const stability = 1 - volatility; // Inverse of volatility

      return {
        direction,
        velocity,
        volatility,
        stability
      };

    } catch (error) {
      console.error('Error analyzing sentiment trends:', error);
      return { direction: 'stable', velocity: 0, volatility: 0, stability: 1 };
    }
  }

  private createTimeWindows(conversations: any[], windowSizeMinutes: number): any[][] {
    const windows = [];
    const windowSizeMs = windowSizeMinutes * 60 * 1000;
    
    for (let i = 0; i < conversations.length; i += 3) { // Process in chunks of 3
      const window = conversations.slice(i, i + 3);
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
    
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  private calculateVelocity(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const changes = [];
    for (let i = 1; i < scores.length; i++) {
      changes.push(scores[i] - scores[i - 1]);
    }
    
    return changes.reduce((sum, change) => sum + Math.abs(change), 0) / changes.length;
  }

  private calculateVolatility(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    return Math.sqrt(variance);
  }

  private async generateSentimentInsights(analysis: any): Promise<string[]> {
    try {
      const prompt = `Based on this sentiment analysis, provide insights and recommendations:

      ${JSON.stringify(analysis, null, 2)}

      Provide 5-10 insights about the emotional state, trends, and recommendations for improvement.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      
      const insights = response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 10);

      return insights;

    } catch (error) {
      console.error('Error generating sentiment insights:', error);
      return [
        'Monitor emotional responses for consistency',
        'Address any negative sentiment patterns',
        'Encourage positive engagement',
        'Maintain emotional balance in conversations',
        'Track sentiment trends over time'
      ];
    }
  }

  private calculateConfidence(sentiment: SentimentScore, emotions: EmotionAnalysis): number {
    // Calculate confidence based on consistency between different analysis methods
    const sentimentMagnitude = Math.abs(sentiment.score);
    const emotionIntensity = emotions.intensity;
    
    // Higher confidence when sentiment and emotions align
    const alignment = 1 - Math.abs(sentimentMagnitude - emotionIntensity);
    
    // Base confidence on magnitude and intensity
    const baseConfidence = (sentimentMagnitude + emotionIntensity) / 2;
    
    return Math.min(alignment * baseConfidence, 1);
  }

  private getDefaultSentimentResult(): SentimentAnalysisResult {
    return {
      overall: { score: 0, label: 'neutral', magnitude: 0, polarity: 0 },
      emotions: {
        primary: 'neutral',
        secondary: [],
        intensity: 0,
        emotions: {
          joy: 0, sadness: 0, anger: 0, fear: 0,
          surprise: 0, disgust: 0, trust: 0, anticipation: 0
        }
      },
      trends: { direction: 'stable', velocity: 0, volatility: 0, stability: 1 },
      insights: ['Insufficient data for sentiment analysis'],
      confidence: 0
    };
  }

  // Real-time sentiment monitoring
  async monitorRealTimeSentiment(message: string): Promise<SentimentScore> {
    try {
      return await this.analyzeBasicSentiment(message);
    } catch (error) {
      console.error('Error in real-time sentiment monitoring:', error);
      return { score: 0, label: 'neutral', magnitude: 0, polarity: 0 };
    }
  }

  // Sentiment alert system
  async checkSentimentAlerts(conversationHistory: any[]): Promise<string[]> {
    try {
      const sentiment = await this.analyzeSentiment(conversationHistory);
      const alerts = [];

      // Check for negative sentiment
      if (sentiment.overall.score < -0.5) {
        alerts.push('High negative sentiment detected');
      }

      // Check for emotional distress
      if (sentiment.emotions.emotions.sadness > 0.7 || sentiment.emotions.emotions.anger > 0.7) {
        alerts.push('Emotional distress indicators detected');
      }

      // Check for declining trend
      if (sentiment.trends.direction === 'declining' && sentiment.trends.velocity > 0.3) {
        alerts.push('Rapidly declining sentiment trend');
      }

      // Check for high volatility
      if (sentiment.trends.volatility > 0.5) {
        alerts.push('High sentiment volatility detected');
      }

      return alerts;

    } catch (error) {
      console.error('Error checking sentiment alerts:', error);
      return [];
    }
  }
}

export const sentimentAnalyzer = new SentimentAnalyzer();
import { ChatGrok } from '@langchain/community/chat_models/grok';
import * as Sentiment from 'sentiment';
import * as natural from 'natural';

export interface SentimentAnalysisResult {
  overall: SentimentScore;
  emotions: EmotionAnalysis;
  trends: SentimentTrend;
  insights: string[];
  confidence: number;
}

export interface SentimentScore {
  score: number; // -1 to 1
  label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  magnitude: number; // 0 to 1
  polarity: number; // -1 to 1
}

export interface EmotionAnalysis {
  primary: string;
  secondary: string[];
  intensity: number; // 0 to 1
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
}

export interface SentimentTrend {
  direction: 'improving' | 'declining' | 'stable';
  velocity: number; // rate of change
  volatility: number; // 0 to 1
  stability: number; // 0 to 1
}

export class SentimentAnalyzer {
  private llm: ChatOpenAI;
  private grok: ChatGrok;
  private sentiment: Sentiment.Sentiment;
  private tokenizer: natural.WordTokenizer;
  private stemmer: natural.PorterStemmer;

  // Emotion keywords mapping
  private emotionKeywords = {
    joy: ['happy', 'excited', 'pleased', 'delighted', 'thrilled', 'joyful', 'cheerful', 'elated'],
    sadness: ['sad', 'depressed', 'disappointed', 'upset', 'melancholy', 'gloomy', 'sorrowful', 'dejected'],
    anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'outraged', 'hostile'],
    fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'terrified', 'frightened', 'concerned'],
    surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'startled', 'bewildered', 'stunned'],
    disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'appalled', 'nauseated'],
    trust: ['trust', 'confident', 'secure', 'reliable', 'faithful', 'dependable', 'sure'],
    anticipation: ['excited', 'eager', 'hopeful', 'optimistic', 'expectant', 'enthusiastic']
  };

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
    this.stemmer = new natural.PorterStemmer();
  }

  async analyzeSentiment(conversationHistory: any[]): Promise<SentimentAnalysisResult> {
    try {
      if (conversationHistory.length === 0) {
        return this.getDefaultSentimentResult();
      }

      // Extract text content
      const textContent = conversationHistory
        .map(conv => `${conv.message} ${conv.response}`)
        .join(' ');

      // Run parallel sentiment analysis
      const [
        basicSentiment,
        emotionAnalysis,
        trendAnalysis
      ] = await Promise.all([
        this.analyzeBasicSentiment(textContent),
        this.analyzeEmotions(textContent),
        this.analyzeSentimentTrends(conversationHistory)
      ]);

      // Generate insights
      const insights = await this.generateSentimentInsights({
        sentiment: basicSentiment,
        emotions: emotionAnalysis,
        trends: trendAnalysis
      });

      return {
        overall: basicSentiment,
        emotions: emotionAnalysis,
        trends: trendAnalysis,
        insights,
        confidence: this.calculateConfidence(basicSentiment, emotionAnalysis)
      };

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return this.getDefaultSentimentResult();
    }
  }

  private async analyzeBasicSentiment(text: string): Promise<SentimentScore> {
    try {
      // Use the sentiment library for basic analysis
      const sentimentResult = this.sentiment.analyze(text);
      
      // Normalize score to -1 to 1 range
      const normalizedScore = Math.max(-1, Math.min(1, sentimentResult.score / 10));
      
      // Calculate magnitude (absolute value)
      const magnitude = Math.abs(normalizedScore);
      
      // Determine label
      let label: SentimentScore['label'];
      if (normalizedScore <= -0.6) label = 'very_negative';
      else if (normalizedScore <= -0.2) label = 'negative';
      else if (normalizedScore <= 0.2) label = 'neutral';
      else if (normalizedScore <= 0.6) label = 'positive';
      else label = 'very_positive';

      // Use LLM for more nuanced analysis
      const prompt = `Analyze the sentiment of this text more deeply:

      "${text}"

      Provide:
      1. Polarity score (-1 to 1)
      2. Magnitude (0 to 1)
      3. Overall sentiment label
      4. Confidence level

      Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const llmAnalysis = JSON.parse(response.content as string);

      return {
        score: llmAnalysis.polarity || normalizedScore,
        label: llmAnalysis.label || label,
        magnitude: llmAnalysis.magnitude || magnitude,
        polarity: llmAnalysis.polarity || normalizedScore
      };

    } catch (error) {
      console.error('Error analyzing basic sentiment:', error);
      return { score: 0, label: 'neutral', magnitude: 0, polarity: 0 };
    }
  }

  private async analyzeEmotions(text: string): Promise<EmotionAnalysis> {
    try {
      const words = this.tokenizer.tokenize(text.toLowerCase());
      const stemmedWords = words.map(word => this.stemmer.stem(word));

      // Calculate emotion scores
      const emotionScores: { [key: string]: number } = {};
      for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
        const matches = stemmedWords.filter(word => keywords.includes(word)).length;
        emotionScores[emotion] = matches / words.length; // Normalize by word count
      }

      // Find primary and secondary emotions
      const sortedEmotions = Object.entries(emotionScores)
        .sort(([,a], [,b]) => b - a);

      const primary = sortedEmotions[0]?.[0] || 'neutral';
      const secondary = sortedEmotions.slice(1, 4).map(([emotion]) => emotion);

      // Calculate intensity
      const intensity = Math.max(...Object.values(emotionScores));

      // Use LLM for more sophisticated emotion analysis
      const prompt = `Analyze the emotions in this text:

      "${text}"

      Provide detailed emotion scores (0-1) for:
      - Joy
      - Sadness
      - Anger
      - Fear
      - Surprise
      - Disgust
      - Trust
      - Anticipation

      Also identify the primary emotion and intensity level.
      Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const llmEmotions = JSON.parse(response.content as string);

      return {
        primary: llmEmotions.primary || primary,
        secondary: llmEmotions.secondary || secondary,
        intensity: llmEmotions.intensity || intensity,
        emotions: {
          joy: llmEmotions.joy || emotionScores.joy || 0,
          sadness: llmEmotions.sadness || emotionScores.sadness || 0,
          anger: llmEmotions.anger || emotionScores.anger || 0,
          fear: llmEmotions.fear || emotionScores.fear || 0,
          surprise: llmEmotions.surprise || emotionScores.surprise || 0,
          disgust: llmEmotions.disgust || emotionScores.disgust || 0,
          trust: llmEmotions.trust || emotionScores.trust || 0,
          anticipation: llmEmotions.anticipation || emotionScores.anticipation || 0
        }
      };

    } catch (error) {
      console.error('Error analyzing emotions:', error);
      return {
        primary: 'neutral',
        secondary: [],
        intensity: 0,
        emotions: {
          joy: 0, sadness: 0, anger: 0, fear: 0,
          surprise: 0, disgust: 0, trust: 0, anticipation: 0
        }
      };
    }
  }

  private async analyzeSentimentTrends(conversationHistory: any[]): Promise<SentimentTrend> {
    try {
      if (conversationHistory.length < 3) {
        return { direction: 'stable', velocity: 0, volatility: 0, stability: 1 };
      }

      // Analyze sentiment over time
      const timeWindows = this.createTimeWindows(conversationHistory, 2); // 2-minute windows
      const sentimentScores = [];

      for (const window of timeWindows) {
        const text = window.map(conv => `${conv.message} ${conv.response}`).join(' ');
        const sentiment = this.sentiment.analyze(text);
        sentimentScores.push(sentiment.score / 10); // Normalize
      }

      // Calculate trend metrics
      const direction = this.calculateTrendDirection(sentimentScores);
      const velocity = this.calculateVelocity(sentimentScores);
      const volatility = this.calculateVolatility(sentimentScores);
      const stability = 1 - volatility; // Inverse of volatility

      return {
        direction,
        velocity,
        volatility,
        stability
      };

    } catch (error) {
      console.error('Error analyzing sentiment trends:', error);
      return { direction: 'stable', velocity: 0, volatility: 0, stability: 1 };
    }
  }

  private createTimeWindows(conversations: any[], windowSizeMinutes: number): any[][] {
    const windows = [];
    const windowSizeMs = windowSizeMinutes * 60 * 1000;
    
    for (let i = 0; i < conversations.length; i += 3) { // Process in chunks of 3
      const window = conversations.slice(i, i + 3);
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
    
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  private calculateVelocity(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const changes = [];
    for (let i = 1; i < scores.length; i++) {
      changes.push(scores[i] - scores[i - 1]);
    }
    
    return changes.reduce((sum, change) => sum + Math.abs(change), 0) / changes.length;
  }

  private calculateVolatility(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    return Math.sqrt(variance);
  }

  private async generateSentimentInsights(analysis: any): Promise<string[]> {
    try {
      const prompt = `Based on this sentiment analysis, provide insights and recommendations:

      ${JSON.stringify(analysis, null, 2)}

      Provide 5-10 insights about the emotional state, trends, and recommendations for improvement.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      
      const insights = response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 10);

      return insights;

    } catch (error) {
      console.error('Error generating sentiment insights:', error);
      return [
        'Monitor emotional responses for consistency',
        'Address any negative sentiment patterns',
        'Encourage positive engagement',
        'Maintain emotional balance in conversations',
        'Track sentiment trends over time'
      ];
    }
  }

  private calculateConfidence(sentiment: SentimentScore, emotions: EmotionAnalysis): number {
    // Calculate confidence based on consistency between different analysis methods
    const sentimentMagnitude = Math.abs(sentiment.score);
    const emotionIntensity = emotions.intensity;
    
    // Higher confidence when sentiment and emotions align
    const alignment = 1 - Math.abs(sentimentMagnitude - emotionIntensity);
    
    // Base confidence on magnitude and intensity
    const baseConfidence = (sentimentMagnitude + emotionIntensity) / 2;
    
    return Math.min(alignment * baseConfidence, 1);
  }

  private getDefaultSentimentResult(): SentimentAnalysisResult {
    return {
      overall: { score: 0, label: 'neutral', magnitude: 0, polarity: 0 },
      emotions: {
        primary: 'neutral',
        secondary: [],
        intensity: 0,
        emotions: {
          joy: 0, sadness: 0, anger: 0, fear: 0,
          surprise: 0, disgust: 0, trust: 0, anticipation: 0
        }
      },
      trends: { direction: 'stable', velocity: 0, volatility: 0, stability: 1 },
      insights: ['Insufficient data for sentiment analysis'],
      confidence: 0
    };
  }

  // Real-time sentiment monitoring
  async monitorRealTimeSentiment(message: string): Promise<SentimentScore> {
    try {
      return await this.analyzeBasicSentiment(message);
    } catch (error) {
      console.error('Error in real-time sentiment monitoring:', error);
      return { score: 0, label: 'neutral', magnitude: 0, polarity: 0 };
    }
  }

  // Sentiment alert system
  async checkSentimentAlerts(conversationHistory: any[]): Promise<string[]> {
    try {
      const sentiment = await this.analyzeSentiment(conversationHistory);
      const alerts = [];

      // Check for negative sentiment
      if (sentiment.overall.score < -0.5) {
        alerts.push('High negative sentiment detected');
      }

      // Check for emotional distress
      if (sentiment.emotions.emotions.sadness > 0.7 || sentiment.emotions.emotions.anger > 0.7) {
        alerts.push('Emotional distress indicators detected');
      }

      // Check for declining trend
      if (sentiment.trends.direction === 'declining' && sentiment.trends.velocity > 0.3) {
        alerts.push('Rapidly declining sentiment trend');
      }

      // Check for high volatility
      if (sentiment.trends.volatility > 0.5) {
        alerts.push('High sentiment volatility detected');
      }

      return alerts;

    } catch (error) {
      console.error('Error checking sentiment alerts:', error);
      return [];
    }
  }
}

export const sentimentAnalyzer = new SentimentAnalyzer();
