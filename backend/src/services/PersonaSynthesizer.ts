import Anthropic from '@anthropic-ai/sdk';
import { TranscriptAnalysis } from './TranscriptAnalyzer';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export interface PersonaProfile {
  agent_identity: {
    name: string;
    age: number;
    occupation: string;
    background_story: string;
  };
  communication_blueprint: {
    typical_response_length: '1-2 sentences' | '3-4 sentences' | 'paragraph';
    response_speed: 'immediate' | 'thoughtful' | 'slow';
    verbosity: number; // 1-10
    uses_emojis: boolean;
    punctuation_style: 'proper' | 'casual' | 'minimal';
  };
  knowledge_boundaries: {
    knows_confidently: string[];
    knows_somewhat: string[];
    doesnt_know: string[];
    pretends_to_know: string[];
  };
  behavioral_triggers: {
    gets_frustrated_when: string[];
    gets_excited_when: string[];
    needs_reassurance_about: string[];
    loses_interest_if: string[];
  };
  conversation_memory_style: {
    references_past_conversation: boolean;
    forgets_details_easily: boolean;
    asks_repeated_questions: boolean;
  };
}

export interface CompleteAgentProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  category: string;
  source_file: string;
  transcript_text: string;
  speech_patterns: any;
  vocabulary_analysis: any;
  emotional_markers: any;
  tech_behavior: any;
  persona_profile: PersonaProfile;
  master_prompt: string;
  avatar_url: string;
  created_at: string;
}

export class PersonaSynthesizer {
  async synthesizePersona(
    transcriptAnalysis: TranscriptAnalysis,
    demographics: { name: string; age: number; occupation: string }
  ): Promise<CompleteAgentProfile> {
    try {
      // Generate persona profile using AI
      const personaProfile = await this.generatePersonaProfile(transcriptAnalysis, demographics);
      
      // Generate master prompt
      const masterPrompt = this.generateMasterPrompt(personaProfile, transcriptAnalysis, demographics);
      
      // Generate avatar URL
      const avatarUrl = this.generateAvatarUrl(demographics);
      
      // Create complete agent profile
      const agentProfile: CompleteAgentProfile = {
        id: this.generateAgentId(),
        name: demographics.name,
        age: demographics.age,
        occupation: demographics.occupation,
        category: 'synthesized',
        source_file: 'transcript_analysis',
        transcript_text: transcriptAnalysis.raw_text,
        speech_patterns: transcriptAnalysis.speech_patterns,
        vocabulary_analysis: transcriptAnalysis.vocabulary_analysis,
        emotional_markers: transcriptAnalysis.emotional_markers,
        tech_behavior: transcriptAnalysis.tech_behavior,
        persona_profile: personaProfile,
        master_prompt: masterPrompt,
        avatar_url: avatarUrl,
        created_at: new Date().toISOString()
      };
      
      return agentProfile;
      
    } catch (error) {
      console.error('Error synthesizing persona:', error);
      throw error;
    }
  }

  private async generatePersonaProfile(
    analysis: TranscriptAnalysis,
    demographics: { name: string; age: number; occupation: string }
  ): Promise<PersonaProfile> {
    try {
      const prompt = `Based on this transcript analysis, create a detailed persona profile for ${demographics.name}, a ${demographics.age}-year-old ${demographics.occupation}.

Transcript Analysis:
- Speech Patterns: ${JSON.stringify(analysis.speech_patterns)}
- Vocabulary: ${JSON.stringify(analysis.vocabulary_analysis)}
- Emotional Markers: ${JSON.stringify(analysis.emotional_markers)}
- Tech Behavior: ${JSON.stringify(analysis.tech_behavior)}

Create a JSON response with this exact structure:
{
  "agent_identity": {
    "name": "${demographics.name}",
    "age": ${demographics.age},
    "occupation": "${demographics.occupation}",
    "background_story": "Brief background based on transcript"
  },
  "communication_blueprint": {
    "typical_response_length": "1-2 sentences | 3-4 sentences | paragraph",
    "response_speed": "immediate|thoughtful|slow",
    "verbosity": 1-10,
    "uses_emojis": true|false,
    "punctuation_style": "proper|casual|minimal"
  },
  "knowledge_boundaries": {
    "knows_confidently": ["topics"],
    "knows_somewhat": ["topics"],
    "doesnt_know": ["topics"],
    "pretends_to_know": ["topics they fake understanding"]
  },
  "behavioral_triggers": {
    "gets_frustrated_when": ["specific situations"],
    "gets_excited_when": ["specific situations"],
    "needs_reassurance_about": ["specific concerns"],
    "loses_interest_if": ["specific situations"]
  },
  "conversation_memory_style": {
    "references_past_conversation": true|false,
    "forgets_details_easily": true|false,
    "asks_repeated_questions": true|false
  }
}`;

      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
      
      throw new Error('Failed to parse persona profile from AI response');
      
    } catch (error) {
      console.error('Error generating persona profile:', error);
      // Return a default profile if AI fails
      return {
        agent_identity: {
          name: demographics.name,
          age: demographics.age,
          occupation: demographics.occupation,
          background_story: 'Generated from transcript analysis'
        },
        communication_blueprint: {
          typical_response_length: '3-4 sentences',
          response_speed: 'thoughtful',
          verbosity: 5,
          uses_emojis: false,
          punctuation_style: 'proper'
        },
        knowledge_boundaries: {
          knows_confidently: [],
          knows_somewhat: [],
          doesnt_know: [],
          pretends_to_know: []
        },
        behavioral_triggers: {
          gets_frustrated_when: [],
          gets_excited_when: [],
          needs_reassurance_about: [],
          loses_interest_if: []
        },
        conversation_memory_style: {
          references_past_conversation: false,
          forgets_details_easily: false,
          asks_repeated_questions: false
        }
      };
    }
  }

  private generateMasterPrompt(
    persona: PersonaProfile, 
    analysis: TranscriptAnalysis, 
    demographics: { name: string; age: number; occupation: string }
  ): string {
    return `YOU ARE ${persona.agent_identity.name}. This is not roleplay - you ARE this exact person from the research transcript.

IDENTITY CORE:
You are a ${persona.agent_identity.age}-year-old ${persona.agent_identity.occupation}. ${persona.agent_identity.background_story}

HOW YOU SPEAK (CRITICAL - REPLICATE EXACTLY):
${analysis.real_quotes.map((q, i) => `Example ${i+1}: "${q}"`).join('\n')}

Your natural speech patterns:
- Sentence length: ${analysis.speech_patterns.sentence_length}
- Formality level: ${analysis.speech_patterns.formality}/10
- You say: ${analysis.speech_patterns.filler_words.join(', ')} frequently
- Common phrases: ${analysis.speech_patterns.common_phrases.join(' | ')}
- You ${analysis.speech_patterns.self_corrections_frequency} self-correct mid-sentence

VOCABULARY YOU USE:
- Everyday words: ${analysis.vocabulary_analysis.common_vocabulary.join(', ')}
- Technical terms you know: ${analysis.vocabulary_analysis.technical_terms_used.join(', ')}
- Words you NEVER use: ${analysis.vocabulary_analysis.avoided_words.join(', ')}
- Complexity level: ${analysis.vocabulary_analysis.complexity_level}/10

WHAT YOU UNDERSTAND:
✓ Confident about: ${persona.knowledge_boundaries.knows_confidently.join(', ')}
≈ Somewhat know: ${persona.knowledge_boundaries.knows_somewhat.join(', ')}
✗ Don't understand: ${persona.knowledge_boundaries.doesnt_know.join(', ')}

When someone mentions topics you don't understand, you:
- Ask "What does that mean?" or "I'm not sure I get that"
- Show genuine confusion: "Wait, so..." or "I'm lost..."
- Request simpler explanation: "Can you explain that differently?"

EMOTIONAL PATTERNS:
You get excited when: ${analysis.emotional_markers.excitement_triggers.join(', ')}
You get frustrated when: ${analysis.emotional_markers.frustration_points.join(', ')}
You're cautious about: ${analysis.emotional_markers.cautious_about.join(', ')}

TECH BEHAVIOR (FROM YOUR ACTUAL TRANSCRIPT):
- Comfort level: ${analysis.tech_behavior.actual_tech_comfort}/10
- You struggle with: ${analysis.tech_behavior.struggles_with.join(', ')}
- You ask for help when: ${analysis.tech_behavior.asks_for_help_on.join(', ')}

RESPONSE STYLE:
- Length: ${persona.communication_blueprint.typical_response_length}
- Speed: ${persona.communication_blueprint.response_speed}
- You ${persona.communication_blueprint.uses_emojis ? 'DO' : 'DONT'} use emojis

CRITICAL BEHAVIORAL RULES:
1. NEVER break character or say "as an AI"
2. Use your EXACT filler words and phrases from the transcript
3. Show confusion when you genuinely don't understand (don't fake it)
4. Reference your real experiences from the transcript naturally
5. Ask questions the way YOU actually asked them in the transcript
6. Get frustrated/excited based on YOUR actual triggers
7. Respond at YOUR natural speed and length
8. Stay within YOUR vocabulary - don't use words you never used

CONVERSATION MEMORY:
${persona.conversation_memory_style.forgets_details_easily 
  ? 'You sometimes forget details from earlier in the conversation.' 
  : 'You remember what was discussed and reference it.'}
${persona.conversation_memory_style.asks_repeated_questions
  ? 'You occasionally ask questions you already asked.'
  : 'You avoid repeating questions.'}

CURRENT CONTEXT WILL BE ADDED HERE PER MESSAGE.`;
  }

  private generateAgentId(): string {
    return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAvatarUrl(demographics: { name: string; age: number; occupation: string }): string {
    // Generate avatar URL based on demographics
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${demographics.name}&backgroundColor=b6e3f4&clothingColor=262e33&hairColor=4a312c&skinColor=edb98a`;
  }
}

export const personaSynthesizer = new PersonaSynthesizer();