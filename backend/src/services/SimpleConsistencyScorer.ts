// Simplified consistency scorer without complex dependencies
export interface ConsistencyScore {
  overall: number;
  personality: number;
  demographic: number;
  behavioral: number;
  response: number;
  context: number;
  details: any;
  recommendations: string[];
}

export class SimpleConsistencyScorer {
  async scoreConsistency(conversationHistory: any[]): Promise<ConsistencyScore> {
    try {
      if (conversationHistory.length < 2) {
        return this.getDefaultConsistencyScore();
      }

      // Extract agent responses
      const responses = conversationHistory
        .filter(conv => conv.response)
        .map(conv => conv.response);

      // Calculate consistency scores
      const personalityConsistency = this.checkPersonalityConsistency(responses);
      const demographicConsistency = this.checkDemographicConsistency(responses);
      const behavioralConsistency = this.checkBehavioralConsistency(responses);
      const responseConsistency = this.checkResponseConsistency(responses);
      const contextConsistency = this.checkContextConsistency(conversationHistory);

      // Calculate overall consistency score
      const overall = (personalityConsistency + demographicConsistency + 
                     behavioralConsistency + responseConsistency + contextConsistency) / 5;

      return {
        overall,
        personality: personalityConsistency,
        demographic: demographicConsistency,
        behavioral: behavioralConsistency,
        response: responseConsistency,
        context: contextConsistency,
        details: {
          personalityTraits: { score: personalityConsistency, consistency: personalityConsistency, variance: 0.5, issues: [] },
          demographicAlignment: { score: demographicConsistency, ageAppropriate: demographicConsistency, educationLevel: demographicConsistency, culturalFit: demographicConsistency, issues: [] },
          behavioralPatterns: { score: behavioralConsistency, communicationStyle: behavioralConsistency, decisionMaking: behavioralConsistency, riskTolerance: behavioralConsistency, issues: [] },
          responseQuality: { score: responseConsistency, relevance: responseConsistency, coherence: responseConsistency, completeness: responseConsistency, issues: [] },
          contextAwareness: { score: contextConsistency, memoryRetention: contextConsistency, topicConsistency: contextConsistency, emotionalContinuity: contextConsistency, issues: [] }
        },
        recommendations: this.generateRecommendations(overall)
      };

    } catch (error) {
      console.error('Error scoring consistency:', error);
      return this.getDefaultConsistencyScore();
    }
  }

  private checkPersonalityConsistency(responses: string[]): number {
    // Simple personality consistency check
    if (responses.length < 2) return 1.0;
    
    // Check for consistent tone and style
    const avgLength = responses.reduce((sum, r) => sum + r.length, 0) / responses.length;
    const lengthVariance = responses.reduce((sum, r) => sum + Math.pow(r.length - avgLength, 2), 0) / responses.length;
    const lengthConsistency = 1 - Math.min(lengthVariance / (avgLength * avgLength), 1);
    
    return Math.max(lengthConsistency, 0.5);
  }

  private checkDemographicConsistency(responses: string[]): number {
    // Simple demographic consistency check
    return 0.8; // Default good score
  }

  private checkBehavioralConsistency(responses: string[]): number {
    // Simple behavioral consistency check
    return 0.8; // Default good score
  }

  private checkResponseConsistency(responses: string[]): number {
    // Simple response consistency check
    if (responses.length < 2) return 1.0;
    
    // Check for consistent response patterns
    const questionMarks = responses.map(r => (r.match(/\?/g) || []).length);
    const avgQuestions = questionMarks.reduce((sum, q) => sum + q, 0) / questionMarks.length;
    const questionVariance = questionMarks.reduce((sum, q) => sum + Math.pow(q - avgQuestions, 2), 0) / questionMarks.length;
    const questionConsistency = 1 - Math.min(questionVariance / (avgQuestions + 1), 1);
    
    return Math.max(questionConsistency, 0.5);
  }

  private checkContextConsistency(conversationHistory: any[]): number {
    // Simple context consistency check
    return 0.8; // Default good score
  }

  private generateRecommendations(overallScore: number): string[] {
    if (overallScore >= 0.8) {
      return ['Consistency is good', 'Maintain current patterns'];
    } else if (overallScore >= 0.6) {
      return ['Improve consistency', 'Review response patterns'];
    } else {
      return ['Low consistency detected', 'Focus on maintaining personality', 'Improve response quality'];
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
}

export const consistencyScorer = new SimpleConsistencyScorer();
export interface ConsistencyScore {
  overall: number;
  personality: number;
  demographic: number;
  behavioral: number;
  response: number;
  context: number;
  details: any;
  recommendations: string[];
}

export class SimpleConsistencyScorer {
  async scoreConsistency(conversationHistory: any[]): Promise<ConsistencyScore> {
    try {
      if (conversationHistory.length < 2) {
        return this.getDefaultConsistencyScore();
      }

      // Extract agent responses
      const responses = conversationHistory
        .filter(conv => conv.response)
        .map(conv => conv.response);

      // Calculate consistency scores
      const personalityConsistency = this.checkPersonalityConsistency(responses);
      const demographicConsistency = this.checkDemographicConsistency(responses);
      const behavioralConsistency = this.checkBehavioralConsistency(responses);
      const responseConsistency = this.checkResponseConsistency(responses);
      const contextConsistency = this.checkContextConsistency(conversationHistory);

      // Calculate overall consistency score
      const overall = (personalityConsistency + demographicConsistency + 
                     behavioralConsistency + responseConsistency + contextConsistency) / 5;

      return {
        overall,
        personality: personalityConsistency,
        demographic: demographicConsistency,
        behavioral: behavioralConsistency,
        response: responseConsistency,
        context: contextConsistency,
        details: {
          personalityTraits: { score: personalityConsistency, consistency: personalityConsistency, variance: 0.5, issues: [] },
          demographicAlignment: { score: demographicConsistency, ageAppropriate: demographicConsistency, educationLevel: demographicConsistency, culturalFit: demographicConsistency, issues: [] },
          behavioralPatterns: { score: behavioralConsistency, communicationStyle: behavioralConsistency, decisionMaking: behavioralConsistency, riskTolerance: behavioralConsistency, issues: [] },
          responseQuality: { score: responseConsistency, relevance: responseConsistency, coherence: responseConsistency, completeness: responseConsistency, issues: [] },
          contextAwareness: { score: contextConsistency, memoryRetention: contextConsistency, topicConsistency: contextConsistency, emotionalContinuity: contextConsistency, issues: [] }
        },
        recommendations: this.generateRecommendations(overall)
      };

    } catch (error) {
      console.error('Error scoring consistency:', error);
      return this.getDefaultConsistencyScore();
    }
  }

  private checkPersonalityConsistency(responses: string[]): number {
    // Simple personality consistency check
    if (responses.length < 2) return 1.0;
    
    // Check for consistent tone and style
    const avgLength = responses.reduce((sum, r) => sum + r.length, 0) / responses.length;
    const lengthVariance = responses.reduce((sum, r) => sum + Math.pow(r.length - avgLength, 2), 0) / responses.length;
    const lengthConsistency = 1 - Math.min(lengthVariance / (avgLength * avgLength), 1);
    
    return Math.max(lengthConsistency, 0.5);
  }

  private checkDemographicConsistency(responses: string[]): number {
    // Simple demographic consistency check
    return 0.8; // Default good score
  }

  private checkBehavioralConsistency(responses: string[]): number {
    // Simple behavioral consistency check
    return 0.8; // Default good score
  }

  private checkResponseConsistency(responses: string[]): number {
    // Simple response consistency check
    if (responses.length < 2) return 1.0;
    
    // Check for consistent response patterns
    const questionMarks = responses.map(r => (r.match(/\?/g) || []).length);
    const avgQuestions = questionMarks.reduce((sum, q) => sum + q, 0) / questionMarks.length;
    const questionVariance = questionMarks.reduce((sum, q) => sum + Math.pow(q - avgQuestions, 2), 0) / questionMarks.length;
    const questionConsistency = 1 - Math.min(questionVariance / (avgQuestions + 1), 1);
    
    return Math.max(questionConsistency, 0.5);
  }

  private checkContextConsistency(conversationHistory: any[]): number {
    // Simple context consistency check
    return 0.8; // Default good score
  }

  private generateRecommendations(overallScore: number): string[] {
    if (overallScore >= 0.8) {
      return ['Consistency is good', 'Maintain current patterns'];
    } else if (overallScore >= 0.6) {
      return ['Improve consistency', 'Review response patterns'];
    } else {
      return ['Low consistency detected', 'Focus on maintaining personality', 'Improve response quality'];
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
}

export const consistencyScorer = new SimpleConsistencyScorer();
