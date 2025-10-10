import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface TranscriptAnalysis {
  speech_patterns: {
    sentence_length: 'short' | 'medium' | 'long';
    formality: number; // 1-10
    filler_words: string[];
    common_phrases: string[];
    self_corrections_frequency: 'never' | 'rare' | 'occasional' | 'frequent';
    question_asking_style: 'direct' | 'indirect' | 'clarifying';
  };
  vocabulary_analysis: {
    complexity_level: number; // 1-10
    technical_terms_used: string[];
    common_vocabulary: string[];
    avoided_words: string[];
  };
  emotional_markers: {
    excitement_triggers: string[];
    frustration_points: string[];
    cautious_about: string[];
    confident_about: string[];
  };
  cognitive_patterns: {
    understanding_speed: 'slow' | 'medium' | 'fast';
    need_for_examples: boolean;
    question_before_action: boolean;
    processes_info_style: 'visual' | 'logical' | 'emotional' | 'practical';
  };
  tech_behavior: {
    actual_tech_comfort: number; // 1-10
    struggles_with: string[];
    navigates_well: string[];
    asks_for_help_on: string[];
  };
  real_quotes: string[];
  personality_inference: {
    decision_style: 'impulsive' | 'cautious' | 'analytical' | 'social';
    risk_tolerance: number; // 1-10
    patience_level: number; // 1-10
    trust_in_tech: number; // 1-10
  };
}

export class TranscriptAnalyzer {
  
  async analyzeTranscript(transcript: string, demographics: {
    name: string;
    age: number;
    occupation: string;
  }): Promise<TranscriptAnalysis | null> {
    try {
      console.log(`Analyzing transcript for ${demographics.name}...`);
      
      const analysisPrompt = this.buildAnalysisPrompt(transcript, demographics);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing human communication patterns from transcripts. Extract behavioral data with high precision.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3, // Low temperature for precision
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(response) as TranscriptAnalysis;
      
      // Validate required fields
      this.validateAnalysis(analysis);
      
      console.log(`Analysis complete for ${demographics.name}`);
      return analysis;
      
    } catch (error) {
      console.error('Error analyzing transcript:', error);
      return null;
    }
  }

  private buildAnalysisPrompt(transcript: string, demographics: {
    name: string;
    age: number;
    occupation: string;
  }): string {
    return `You are analyzing a real user research transcript to create a hyper-realistic AI agent.

USER DETAILS:
Name: ${demographics.name}
Age: ${demographics.age}
Occupation: ${demographics.occupation}

FULL TRANSCRIPT:
${transcript}

YOUR TASK: Deeply analyze how this person ACTUALLY communicates, thinks, and behaves.

OUTPUT VALID JSON:
{
  "speech_patterns": {
    "sentence_length": "short|medium|long",
    "formality": 1-10,
    "filler_words": ["um", "like", "you know"],
    "common_phrases": ["I think...", "The thing is..."],
    "self_corrections_frequency": "never|rare|occasional|frequent",
    "question_asking_style": "direct|indirect|clarifying"
  },
  
  "vocabulary_analysis": {
    "complexity_level": 1-10,
    "technical_terms_used": ["array of actual terms from transcript"],
    "common_vocabulary": ["everyday words they use often"],
    "avoided_words": ["complex terms they never used"]
  },
  
  "emotional_markers": {
    "excitement_triggers": ["topics that made them enthusiastic"],
    "frustration_points": ["what confused or annoyed them"],
    "cautious_about": ["topics they were hesitant about"],
    "confident_about": ["topics they spoke fluently about"]
  },
  
  "cognitive_patterns": {
    "understanding_speed": "slow|medium|fast",
    "need_for_examples": true|false,
    "question_before_action": true|false,
    "processes_info_style": "visual|logical|emotional|practical"
  },
  
  "tech_behavior": {
    "actual_tech_comfort": 1-10,
    "struggles_with": ["specific tech issues mentioned"],
    "navigates_well": ["tech things they handled easily"],
    "asks_for_help_on": ["what they needed guidance for"]
  },
  
  "real_quotes": [
    "5-10 exact quotes that capture their speaking style",
    "Include their grammar, pauses, and natural speech"
  ],
  
  "personality_inference": {
    "decision_style": "impulsive|cautious|analytical|social",
    "risk_tolerance": 1-10,
    "patience_level": 1-10,
    "trust_in_tech": 1-10
  }
}

CRITICAL: Base this ONLY on actual evidence from the transcript. Don't assume or stereotype.`;
  }

  private validateAnalysis(analysis: any): void {
    const requiredFields = [
      'speech_patterns',
      'vocabulary_analysis', 
      'emotional_markers',
      'cognitive_patterns',
      'tech_behavior',
      'real_quotes',
      'personality_inference'
    ];

    for (const field of requiredFields) {
      if (!analysis[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate speech_patterns
    if (!analysis.speech_patterns.sentence_length || 
        !['short', 'medium', 'long'].includes(analysis.speech_patterns.sentence_length)) {
      analysis.speech_patterns.sentence_length = 'medium';
    }

    // Validate arrays
    if (!Array.isArray(analysis.real_quotes)) {
      analysis.real_quotes = [];
    }
    if (!Array.isArray(analysis.speech_patterns.filler_words)) {
      analysis.speech_patterns.filler_words = [];
    }
  }
}



