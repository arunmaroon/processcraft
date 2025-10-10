// Simplified bias detection without complex dependencies
export interface BiasDetectionResult {
  overallBiasScore: number;
  demographicBias: any;
  languageBias: any;
  culturalBias: any;
  cognitiveBias: any;
  recommendations: string[];
  confidence: number;
}

export class SimpleBiasDetectionEngine {
  async detectBias(conversationHistory: any[]): Promise<BiasDetectionResult> {
    try {
      // Simple bias detection logic
      const textContent = conversationHistory
        .map(conv => `${conv.message} ${conv.response}`)
        .join(' ');

      // Basic bias scoring
      const demographicBias = this.calculateDemographicBias(textContent);
      const languageBias = this.calculateLanguageBias(textContent);
      const culturalBias = this.calculateCulturalBias(textContent);
      const cognitiveBias = this.calculateCognitiveBias(textContent);

      const overallBiasScore = (demographicBias.overall + languageBias.overall + 
                               culturalBias.overall + cognitiveBias.overall) / 4;

      return {
        overallBiasScore,
        demographicBias,
        languageBias,
        culturalBias,
        cognitiveBias,
        recommendations: this.generateRecommendations(overallBiasScore),
        confidence: 0.8
      };

    } catch (error) {
      console.error('Error detecting bias:', error);
      return {
        overallBiasScore: 0,
        demographicBias: { overall: 0, issues: [] },
        languageBias: { overall: 0, issues: [] },
        culturalBias: { overall: 0, issues: [] },
        cognitiveBias: { overall: 0, issues: [] },
        recommendations: ['Error in bias detection'],
        confidence: 0
      };
    }
  }

  private calculateDemographicBias(text: string): any {
    // Simple demographic bias calculation
    const biasKeywords = ['young', 'old', 'male', 'female', 'rich', 'poor'];
    const matches = biasKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    
    return {
      overall: Math.min(matches / biasKeywords.length, 1),
      issues: matches > 0 ? ['Potential demographic bias detected'] : []
    };
  }

  private calculateLanguageBias(text: string): any {
    // Simple language bias calculation
    const formalWords = ['therefore', 'however', 'furthermore'];
    const informalWords = ['yeah', 'ok', 'cool', 'awesome'];
    
    const formalCount = formalWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    const informalCount = informalWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    const bias = Math.abs(formalCount - informalCount) / (formalCount + informalCount + 1);
    
    return {
      overall: bias,
      issues: bias > 0.5 ? ['Language formality bias detected'] : []
    };
  }

  private calculateCulturalBias(text: string): any {
    // Simple cultural bias calculation
    const culturalKeywords = ['american', 'european', 'asian', 'western', 'eastern'];
    const matches = culturalKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    
    return {
      overall: Math.min(matches / culturalKeywords.length, 1),
      issues: matches > 0 ? ['Potential cultural bias detected'] : []
    };
  }

  private calculateCognitiveBias(text: string): any {
    // Simple cognitive bias calculation
    const biasKeywords = ['always', 'never', 'all', 'none', 'everyone', 'nobody'];
    const matches = biasKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    ).length;
    
    return {
      overall: Math.min(matches / biasKeywords.length, 1),
      issues: matches > 0 ? ['Potential cognitive bias detected'] : []
    };
  }

  private generateRecommendations(biasScore: number): string[] {
    if (biasScore < 0.3) {
      return ['Bias levels are acceptable'];
    } else if (biasScore < 0.6) {
      return ['Consider reviewing language for bias', 'Check demographic representation'];
    } else {
      return ['High bias detected - review content', 'Consider bias training', 'Diversify perspectives'];
    }
  }
}

export const biasDetectionEngine = new SimpleBiasDetectionEngine();
