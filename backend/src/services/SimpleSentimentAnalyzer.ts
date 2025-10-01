// Simplified sentiment analyzer without complex dependencies
export interface SentimentAnalysisResult {
  overall: {
    score: number;
    label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
    magnitude: number;
    polarity: number;
  };
  emotions: {
    primary: string;
    secondary: string[];
    intensity: number;
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
  };
  trends: {
    direction: 'improving' | 'declining' | 'stable';
    velocity: number;
    volatility: number;
    stability: number;
  };
  insights: string[];
  confidence: number;
}

export class SimpleSentimentAnalyzer {
  async analyzeSentiment(conversationHistory: any[]): Promise<SentimentAnalysisResult> {
    try {
      if (conversationHistory.length === 0) {
        return this.getDefaultSentimentResult();
      }

      // Extract text content
      const textContent = conversationHistory
        .map(conv => `${conv.message} ${conv.response}`)
        .join(' ');

      // Analyze sentiment
      const basicSentiment = this.analyzeBasicSentiment(textContent);
      const emotionAnalysis = this.analyzeEmotions(textContent);
      const trendAnalysis = this.analyzeSentimentTrends(conversationHistory);

      return {
        overall: basicSentiment,
        emotions: emotionAnalysis,
        trends: trendAnalysis,
        insights: this.generateSentimentInsights(basicSentiment, emotionAnalysis),
        confidence: this.calculateConfidence(basicSentiment, emotionAnalysis)
      };

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return this.getDefaultSentimentResult();
    }
  }

  private analyzeBasicSentiment(text: string): any {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'pleased'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'sad', 'disappointed', 'frustrated', 'annoyed'];
    
    const positiveCount = positiveWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    const negativeCount = negativeWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    const totalWords = text.split(/\s+/).length;
    const positiveRatio = positiveCount / totalWords;
    const negativeRatio = negativeCount / totalWords;
    
    const score = (positiveRatio - negativeRatio) * 2; // Scale to -1 to 1
    const normalizedScore = Math.max(-1, Math.min(1, score));
    
    let label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
    if (normalizedScore <= -0.6) label = 'very_negative';
    else if (normalizedScore <= -0.2) label = 'negative';
    else if (normalizedScore <= 0.2) label = 'neutral';
    else if (normalizedScore <= 0.6) label = 'positive';
    else label = 'very_positive';

    return {
      score: normalizedScore,
      label,
      magnitude: Math.abs(normalizedScore),
      polarity: normalizedScore
    };
  }

  private analyzeEmotions(text: string): any {
    // Simple emotion analysis
    const emotionKeywords = {
      joy: ['happy', 'excited', 'pleased', 'delighted', 'thrilled', 'joyful'],
      sadness: ['sad', 'depressed', 'disappointed', 'upset', 'melancholy', 'gloomy'],
      anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'rage'],
      fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'terrified'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'startled'],
      disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'appalled'],
      trust: ['trust', 'confident', 'secure', 'reliable', 'faithful'],
      anticipation: ['excited', 'eager', 'hopeful', 'optimistic', 'enthusiastic']
    };

    const words = text.toLowerCase().split(/\s+/);
    const emotionScores: { [key: string]: number } = {};
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = keywords.filter(keyword => words.includes(keyword)).length;
      emotionScores[emotion] = matches / words.length;
    }

    const sortedEmotions = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a);

    const primary = sortedEmotions[0]?.[0] || 'neutral';
    const secondary = sortedEmotions.slice(1, 4).map(([emotion]) => emotion);
    const intensity = Math.max(...Object.values(emotionScores));

    return {
      primary,
      secondary,
      intensity,
      emotions: {
        joy: emotionScores.joy || 0,
        sadness: emotionScores.sadness || 0,
        anger: emotionScores.anger || 0,
        fear: emotionScores.fear || 0,
        surprise: emotionScores.surprise || 0,
        disgust: emotionScores.disgust || 0,
        trust: emotionScores.trust || 0,
        anticipation: emotionScores.anticipation || 0
      }
    };
  }

  private analyzeSentimentTrends(conversationHistory: any[]): any {
    // Simple trend analysis
    if (conversationHistory.length < 3) {
      return { direction: 'stable', velocity: 0, volatility: 0, stability: 1 };
    }

    // Analyze sentiment over time
    const sentimentScores = conversationHistory.map(conv => {
      const text = `${conv.message} ${conv.response}`;
      return this.analyzeBasicSentiment(text).score;
    });

    const firstHalf = sentimentScores.slice(0, Math.floor(sentimentScores.length / 2));
    const secondHalf = sentimentScores.slice(Math.floor(sentimentScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    const direction = secondAvg > firstAvg ? 'improving' : secondAvg < firstAvg ? 'declining' : 'stable';
    const velocity = Math.abs(secondAvg - firstAvg);
    
    const mean = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
    const variance = sentimentScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / sentimentScores.length;
    const volatility = Math.sqrt(variance);
    const stability = 1 - volatility;

    return {
      direction,
      velocity,
      volatility,
      stability
    };
  }

  private generateSentimentInsights(sentiment: any, emotions: any): string[] {
    const insights = [];
    
    if (sentiment.score > 0.5) {
      insights.push('Overall positive sentiment detected');
    } else if (sentiment.score < -0.5) {
      insights.push('Overall negative sentiment detected');
    } else {
      insights.push('Neutral sentiment maintained');
    }
    
    if (emotions.intensity > 0.5) {
      insights.push('High emotional intensity in responses');
    }
    
    if (emotions.emotions.anger > 0.3) {
      insights.push('Anger indicators present - monitor closely');
    }
    
    if (emotions.emotions.fear > 0.3) {
      insights.push('Fear indicators present - provide reassurance');
    }
    
    return insights;
  }

  private calculateConfidence(sentiment: any, emotions: any): number {
    const sentimentMagnitude = Math.abs(sentiment.score);
    const emotionIntensity = emotions.intensity;
    
    const alignment = 1 - Math.abs(sentimentMagnitude - emotionIntensity);
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
}

export const sentimentAnalyzer = new SimpleSentimentAnalyzer();
export interface SentimentAnalysisResult {
  overall: {
    score: number;
    label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
    magnitude: number;
    polarity: number;
  };
  emotions: {
    primary: string;
    secondary: string[];
    intensity: number;
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
  };
  trends: {
    direction: 'improving' | 'declining' | 'stable';
    velocity: number;
    volatility: number;
    stability: number;
  };
  insights: string[];
  confidence: number;
}

export class SimpleSentimentAnalyzer {
  async analyzeSentiment(conversationHistory: any[]): Promise<SentimentAnalysisResult> {
    try {
      if (conversationHistory.length === 0) {
        return this.getDefaultSentimentResult();
      }

      // Extract text content
      const textContent = conversationHistory
        .map(conv => `${conv.message} ${conv.response}`)
        .join(' ');

      // Analyze sentiment
      const basicSentiment = this.analyzeBasicSentiment(textContent);
      const emotionAnalysis = this.analyzeEmotions(textContent);
      const trendAnalysis = this.analyzeSentimentTrends(conversationHistory);

      return {
        overall: basicSentiment,
        emotions: emotionAnalysis,
        trends: trendAnalysis,
        insights: this.generateSentimentInsights(basicSentiment, emotionAnalysis),
        confidence: this.calculateConfidence(basicSentiment, emotionAnalysis)
      };

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return this.getDefaultSentimentResult();
    }
  }

  private analyzeBasicSentiment(text: string): any {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'pleased'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'sad', 'disappointed', 'frustrated', 'annoyed'];
    
    const positiveCount = positiveWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    const negativeCount = negativeWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    const totalWords = text.split(/\s+/).length;
    const positiveRatio = positiveCount / totalWords;
    const negativeRatio = negativeCount / totalWords;
    
    const score = (positiveRatio - negativeRatio) * 2; // Scale to -1 to 1
    const normalizedScore = Math.max(-1, Math.min(1, score));
    
    let label: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
    if (normalizedScore <= -0.6) label = 'very_negative';
    else if (normalizedScore <= -0.2) label = 'negative';
    else if (normalizedScore <= 0.2) label = 'neutral';
    else if (normalizedScore <= 0.6) label = 'positive';
    else label = 'very_positive';

    return {
      score: normalizedScore,
      label,
      magnitude: Math.abs(normalizedScore),
      polarity: normalizedScore
    };
  }

  private analyzeEmotions(text: string): any {
    // Simple emotion analysis
    const emotionKeywords = {
      joy: ['happy', 'excited', 'pleased', 'delighted', 'thrilled', 'joyful'],
      sadness: ['sad', 'depressed', 'disappointed', 'upset', 'melancholy', 'gloomy'],
      anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'rage'],
      fear: ['afraid', 'scared', 'worried', 'anxious', 'nervous', 'terrified'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'startled'],
      disgust: ['disgusted', 'revolted', 'repulsed', 'sickened', 'appalled'],
      trust: ['trust', 'confident', 'secure', 'reliable', 'faithful'],
      anticipation: ['excited', 'eager', 'hopeful', 'optimistic', 'enthusiastic']
    };

    const words = text.toLowerCase().split(/\s+/);
    const emotionScores: { [key: string]: number } = {};
    
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const matches = keywords.filter(keyword => words.includes(keyword)).length;
      emotionScores[emotion] = matches / words.length;
    }

    const sortedEmotions = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a);

    const primary = sortedEmotions[0]?.[0] || 'neutral';
    const secondary = sortedEmotions.slice(1, 4).map(([emotion]) => emotion);
    const intensity = Math.max(...Object.values(emotionScores));

    return {
      primary,
      secondary,
      intensity,
      emotions: {
        joy: emotionScores.joy || 0,
        sadness: emotionScores.sadness || 0,
        anger: emotionScores.anger || 0,
        fear: emotionScores.fear || 0,
        surprise: emotionScores.surprise || 0,
        disgust: emotionScores.disgust || 0,
        trust: emotionScores.trust || 0,
        anticipation: emotionScores.anticipation || 0
      }
    };
  }

  private analyzeSentimentTrends(conversationHistory: any[]): any {
    // Simple trend analysis
    if (conversationHistory.length < 3) {
      return { direction: 'stable', velocity: 0, volatility: 0, stability: 1 };
    }

    // Analyze sentiment over time
    const sentimentScores = conversationHistory.map(conv => {
      const text = `${conv.message} ${conv.response}`;
      return this.analyzeBasicSentiment(text).score;
    });

    const firstHalf = sentimentScores.slice(0, Math.floor(sentimentScores.length / 2));
    const secondHalf = sentimentScores.slice(Math.floor(sentimentScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    const direction = secondAvg > firstAvg ? 'improving' : secondAvg < firstAvg ? 'declining' : 'stable';
    const velocity = Math.abs(secondAvg - firstAvg);
    
    const mean = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
    const variance = sentimentScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / sentimentScores.length;
    const volatility = Math.sqrt(variance);
    const stability = 1 - volatility;

    return {
      direction,
      velocity,
      volatility,
      stability
    };
  }

  private generateSentimentInsights(sentiment: any, emotions: any): string[] {
    const insights = [];
    
    if (sentiment.score > 0.5) {
      insights.push('Overall positive sentiment detected');
    } else if (sentiment.score < -0.5) {
      insights.push('Overall negative sentiment detected');
    } else {
      insights.push('Neutral sentiment maintained');
    }
    
    if (emotions.intensity > 0.5) {
      insights.push('High emotional intensity in responses');
    }
    
    if (emotions.emotions.anger > 0.3) {
      insights.push('Anger indicators present - monitor closely');
    }
    
    if (emotions.emotions.fear > 0.3) {
      insights.push('Fear indicators present - provide reassurance');
    }
    
    return insights;
  }

  private calculateConfidence(sentiment: any, emotions: any): number {
    const sentimentMagnitude = Math.abs(sentiment.score);
    const emotionIntensity = emotions.intensity;
    
    const alignment = 1 - Math.abs(sentimentMagnitude - emotionIntensity);
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
}

export const sentimentAnalyzer = new SimpleSentimentAnalyzer();
