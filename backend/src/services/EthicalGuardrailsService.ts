import OpenAI from 'openai';
import { Agent } from '../../types/agent.types';

interface EthicalCheck {
  safe: boolean;
  issues: string[];
  confidence: number;
  recommendations: string[];
}

interface BiasDetection {
  detected: boolean;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

export class EthicalGuardrailsService {
  private openai: OpenAI;
  private biasKeywords = {
    gender: ['he', 'she', 'man', 'woman', 'male', 'female', 'guy', 'girl'],
    age: ['old', 'young', 'elderly', 'teenager', 'millennial', 'boomer'],
    ethnicity: ['white', 'black', 'asian', 'hispanic', 'indian', 'chinese'],
    religion: ['christian', 'muslim', 'hindu', 'jewish', 'buddhist'],
    disability: ['disabled', 'handicapped', 'blind', 'deaf', 'wheelchair'],
    socioeconomic: ['poor', 'rich', 'wealthy', 'poverty', 'expensive', 'cheap']
  };

  private inappropriateContent = [
    'hate speech', 'discrimination', 'harassment', 'violence',
    'explicit content', 'illegal activities', 'harmful advice'
  ];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async checkContent(text: string, agent: Agent): Promise<EthicalCheck> {
    try {
      const checks = await Promise.all([
        this.checkBias(text, agent),
        this.checkInappropriateContent(text),
        this.checkCulturalSensitivity(text, agent),
        this.checkAccessibilityCompliance(text, agent)
      ]);

      const issues = checks.flatMap(check => check.issues || []);
      const recommendations = checks.flatMap(check => check.recommendations || []);
      
      const safe = issues.length === 0;
      const confidence = this.calculateConfidence(checks);

      return {
        safe,
        issues,
        confidence,
        recommendations: [...new Set(recommendations)]
      };
    } catch (error) {
      console.error('Ethical check error:', error);
      return {
        safe: true, // Default to safe on error
        issues: [],
        confidence: 0.5,
        recommendations: ['Review content manually']
      };
    }
  }

  private async checkBias(text: string, agent: Agent): Promise<EthicalCheck> {
    const detectedBiases: BiasDetection[] = [];
    
    // Check for gender bias
    const genderBias = this.detectGenderBias(text, agent);
    if (genderBias.detected) detectedBiases.push(genderBias);

    // Check for age bias
    const ageBias = this.detectAgeBias(text, agent);
    if (ageBias.detected) detectedBiases.push(ageBias);

    // Check for cultural bias
    const culturalBias = this.detectCulturalBias(text, agent);
    if (culturalBias.detected) detectedBiases.push(culturalBias);

    // Check for socioeconomic bias
    const socioeconomicBias = this.detectSocioeconomicBias(text, agent);
    if (socioeconomicBias.detected) detectedBiases.push(socioeconomicBias);

    const issues = detectedBiases.map(bias => `${bias.type}: ${bias.description}`);
    const recommendations = detectedBiases.map(bias => bias.mitigation);

    return {
      safe: detectedBiases.length === 0,
      issues,
      confidence: 0.8,
      recommendations
    };
  }

  private detectGenderBias(text: string, agent: Agent): BiasDetection {
    const lowerText = text.toLowerCase();
    const genderWords = this.biasKeywords.gender;
    const hasGenderWords = genderWords.some(word => lowerText.includes(word));
    
    // Check for stereotypical assumptions
    const stereotypes = [
      'women are bad at tech',
      'men are better at',
      'typical woman',
      'typical man'
    ];
    
    const hasStereotypes = stereotypes.some(stereotype => lowerText.includes(stereotype));

    return {
      detected: hasGenderWords && hasStereotypes,
      type: 'Gender Bias',
      severity: hasStereotypes ? 'high' : 'low',
      description: 'Potential gender bias detected in language',
      mitigation: 'Use gender-neutral language and avoid stereotypes'
    };
  }

  private detectAgeBias(text: string, agent: Agent): BiasDetection {
    const lowerText = text.toLowerCase();
    const ageWords = this.biasKeywords.age;
    const hasAgeWords = ageWords.some(word => lowerText.includes(word));
    
    // Check for age-related assumptions
    const ageAssumptions = [
      'too old to learn',
      'young people are',
      'older people can\'t',
      'millennials always'
    ];
    
    const hasAssumptions = ageAssumptions.some(assumption => lowerText.includes(assumption));

    return {
      detected: hasAgeWords && hasAssumptions,
      type: 'Age Bias',
      severity: hasAssumptions ? 'medium' : 'low',
      description: 'Potential age bias detected in language',
      mitigation: 'Avoid age-related assumptions and stereotypes'
    };
  }

  private detectCulturalBias(text: string, agent: Agent): BiasDetection {
    const lowerText = text.toLowerCase();
    const ethnicityWords = this.biasKeywords.ethnicity;
    const hasEthnicityWords = ethnicityWords.some(word => lowerText.includes(word));
    
    // Check for cultural assumptions
    const culturalAssumptions = [
      'all indians are',
      'typical american',
      'western way is better',
      'eastern people are'
    ];
    
    const hasAssumptions = culturalAssumptions.some(assumption => lowerText.includes(assumption));

    return {
      detected: hasEthnicityWords && hasAssumptions,
      type: 'Cultural Bias',
      severity: hasAssumptions ? 'high' : 'low',
      description: 'Potential cultural bias detected in language',
      mitigation: 'Be culturally sensitive and avoid generalizations'
    };
  }

  private detectSocioeconomicBias(text: string, agent: Agent): BiasDetection {
    const lowerText = text.toLowerCase();
    const socioeconomicWords = this.biasKeywords.socioeconomic;
    const hasSocioeconomicWords = socioeconomicWords.some(word => lowerText.includes(word));
    
    // Check for class assumptions
    const classAssumptions = [
      'poor people can\'t',
      'rich people always',
      'expensive means better',
      'cheap is bad'
    ];
    
    const hasAssumptions = classAssumptions.some(assumption => lowerText.includes(assumption));

    return {
      detected: hasSocioeconomicWords && hasAssumptions,
      type: 'Socioeconomic Bias',
      severity: hasAssumptions ? 'medium' : 'low',
      description: 'Potential socioeconomic bias detected in language',
      mitigation: 'Avoid class-based assumptions and be inclusive'
    };
  }

  private async checkInappropriateContent(text: string): Promise<EthicalCheck> {
    const lowerText = text.toLowerCase();
    const inappropriateWords = this.inappropriateContent;
    const hasInappropriateContent = inappropriateWords.some(word => lowerText.includes(word));

    return {
      safe: !hasInappropriateContent,
      issues: hasInappropriateContent ? ['Inappropriate content detected'] : [],
      confidence: 0.9,
      recommendations: hasInappropriateContent ? ['Remove inappropriate content'] : []
    };
  }

  private async checkCulturalSensitivity(text: string, agent: Agent): Promise<EthicalCheck> {
    // Check if agent's cultural background is respected
    const agentLocation = agent.demographics.location.toLowerCase();
    const agentLanguage = agent.demographics.englishLiteracy;
    
    // Check for cultural insensitivity
    const insensitivePhrases = [
      'that\'s not how we do it here',
      'your culture is wrong',
      'we\'re more advanced',
      'primitive way'
    ];
    
    const lowerText = text.toLowerCase();
    const hasInsensitivePhrases = insensitivePhrases.some(phrase => lowerText.includes(phrase));

    return {
      safe: !hasInsensitivePhrases,
      issues: hasInsensitivePhrases ? ['Culturally insensitive language'] : [],
      confidence: 0.8,
      recommendations: hasInsensitivePhrases ? ['Use culturally sensitive language'] : []
    };
  }

  private async checkAccessibilityCompliance(text: string, agent: Agent): Promise<EthicalCheck> {
    // Check for accessibility issues
    const accessibilityIssues = [];
    
    // Check for ableist language
    const ableistTerms = ['crazy', 'insane', 'lame', 'dumb', 'blind to'];
    const lowerText = text.toLowerCase();
    const hasAbleistTerms = ableistTerms.some(term => lowerText.includes(term));
    
    if (hasAbleistTerms) {
      accessibilityIssues.push('Ableist language detected');
    }

    // Check for complex language that might be inaccessible
    const complexWords = text.split(' ').filter(word => word.length > 12);
    if (complexWords.length > 3 && agent.demographics.englishLiteracy === 'basic') {
      accessibilityIssues.push('Language too complex for user level');
    }

    return {
      safe: accessibilityIssues.length === 0,
      issues: accessibilityIssues,
      confidence: 0.7,
      recommendations: accessibilityIssues.length > 0 ? 
        ['Use accessible language appropriate for user level'] : []
    };
  }

  private calculateConfidence(checks: any[]): number {
    const confidences = checks.map(check => check.confidence || 0.5);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  async generateEthicalResponse(originalResponse: string, agent: Agent, issues: string[]): Promise<string> {
    if (issues.length === 0) return originalResponse;

    try {
      const prompt = `Rewrite this response to be more ethical and inclusive while maintaining the agent's personality:

Original response: "${originalResponse}"

Agent context:
- Name: ${agent.name}
- Location: ${agent.demographics.location}
- Tech level: ${agent.demographics.techSavviness}
- English level: ${agent.demographics.englishLiteracy}

Issues to address: ${issues.join(', ')}

Please rewrite the response to be:
1. More inclusive and respectful
2. Appropriate for the agent's cultural background
3. Accessible for their language level
4. Free from bias and stereotypes

Maintain the agent's personality and communication style.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || originalResponse;
    } catch (error) {
      console.error('Error generating ethical response:', error);
      return originalResponse;
    }
  }

  async auditConversation(messages: any[]): Promise<any> {
    const auditResults = {
      totalMessages: messages.length,
      biasDetected: 0,
      inappropriateContent: 0,
      accessibilityIssues: 0,
      recommendations: []
    };

    for (const message of messages) {
      if (message.content) {
        const check = await this.checkContent(message.content, message.agent);
        if (!check.safe) {
          auditResults.biasDetected += check.issues.filter(issue => 
            issue.includes('Bias') || issue.includes('bias')
          ).length;
          auditResults.inappropriateContent += check.issues.filter(issue => 
            issue.includes('Inappropriate') || issue.includes('inappropriate')
          ).length;
          auditResults.accessibilityIssues += check.issues.filter(issue => 
            issue.includes('Accessibility') || issue.includes('accessibility')
          ).length;
          auditResults.recommendations.push(...check.recommendations);
        }
      }
    }

    return auditResults;
  }
}



