import OpenAI from 'openai';
import { ChatGrok } from '@langchain/community/chat_models/grok';
import { Whisper } from '@langchain/community/llms/whisper';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

export interface VisualAnalysisResult {
  description: string;
  elements: VisualElement[];
  emotions: string[];
  accessibility: AccessibilityAnalysis;
  usability: UsabilityAnalysis;
  recommendations: string[];
  confidence: number;
}

export interface VisualElement {
  type: 'text' | 'button' | 'image' | 'form' | 'navigation' | 'other';
  content: string;
  position: { x: number; y: number; width: number; height: number };
  color: string;
  size: number;
  accessibility: {
    altText?: string;
    contrast: number;
    readable: boolean;
  };
}

export interface AccessibilityAnalysis {
  overallScore: number;
  issues: string[];
  recommendations: string[];
  wcagCompliance: {
    level: 'A' | 'AA' | 'AAA' | 'non-compliant';
    issues: string[];
  };
}

export interface UsabilityAnalysis {
  clarity: number;
  navigation: number;
  visualHierarchy: number;
  consistency: number;
  overallScore: number;
  issues: string[];
  recommendations: string[];
}

export interface AudioAnalysisResult {
  transcription: string;
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    emotions: string[];
  };
  speaker: {
    gender: string;
    age: string;
    confidence: number;
  };
  quality: {
    clarity: number;
    backgroundNoise: number;
    overall: number;
  };
  insights: string[];
}

export interface GeneratedContent {
  type: 'image' | 'prototype' | 'wireframe';
  content: string; // Base64 or URL
  description: string;
  metadata: any;
  quality: number;
}

export class MultimodalService {
  private openai: OpenAI;
  private grok: ChatGrok;
  private whisper: Whisper;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.grok = new ChatGrok({
      modelName: 'grok-3',
      temperature: 0.7,
      maxTokens: 1000
    });

    this.whisper = new Whisper({
      modelName: 'whisper-1',
      temperature: 0.0
    });
  }

  // Visual Analysis with GPT-4V
  async analyzeVisualContent(imagePath: string): Promise<VisualAnalysisResult> {
    try {
      // Process image for analysis
      const processedImage = await this.preprocessImage(imagePath);
      
      // Analyze with GPT-4V
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this UI/UX design image and provide:
                1. Detailed description of all visual elements
                2. Emotional response analysis
                3. Accessibility assessment (WCAG compliance)
                4. Usability analysis
                5. Specific recommendations for improvement
                
                Focus on user research insights and how this design would perform with different user personas.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${processedImage}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        description: analysis.description || '',
        elements: analysis.elements || [],
        emotions: analysis.emotions || [],
        accessibility: analysis.accessibility || { overallScore: 0, issues: [], recommendations: [], wcagCompliance: { level: 'non-compliant', issues: [] } },
        usability: analysis.usability || { clarity: 0, navigation: 0, visualHierarchy: 0, consistency: 0, overallScore: 0, issues: [], recommendations: [] },
        recommendations: analysis.recommendations || [],
        confidence: analysis.confidence || 0.8
      };

    } catch (error) {
      console.error('Error analyzing visual content:', error);
      throw error;
    }
  }

  // Audio Analysis with Whisper
  async analyzeAudioContent(audioPath: string): Promise<AudioAnalysisResult> {
    try {
      // Transcribe audio
      const transcription = await this.whisper.call(audioPath);
      
      // Analyze sentiment and speaker characteristics
      const sentimentResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: `Analyze the sentiment and speaker characteristics of this transcribed interview:
            
            "${transcription}"
            
            Provide:
            1. Sentiment analysis (score, label, emotions)
            2. Speaker characteristics (gender, age range, confidence)
            3. Audio quality assessment
            4. Key insights and themes
            5. User research implications
            `
          }
        ],
        max_tokens: 1000
      });

      const analysis = JSON.parse(sentimentResponse.choices[0].message.content || '{}');
      
      return {
        transcription,
        sentiment: analysis.sentiment || { score: 0, label: 'neutral', emotions: [] },
        speaker: analysis.speaker || { gender: 'unknown', age: 'unknown', confidence: 0 },
        quality: analysis.quality || { clarity: 0, backgroundNoise: 0, overall: 0 },
        insights: analysis.insights || []
      };

    } catch (error) {
      console.error('Error analyzing audio content:', error);
      throw error;
    }
  }

  // Generate Visual Content with DALL-E 3
  async generateVisualContent(prompt: string, type: 'image' | 'prototype' | 'wireframe'): Promise<GeneratedContent> {
    try {
      let enhancedPrompt = prompt;
      
      // Enhance prompt based on type
      switch (type) {
        case 'prototype':
          enhancedPrompt = `Create a high-fidelity UI prototype: ${prompt}. Include realistic content, proper spacing, modern design principles, and accessibility considerations.`;
          break;
        case 'wireframe':
          enhancedPrompt = `Create a clean wireframe: ${prompt}. Focus on layout, structure, and user flow. Use simple lines and placeholders.`;
          break;
        case 'image':
          enhancedPrompt = `Create a professional UI/UX image: ${prompt}. High quality, modern design, suitable for user research.`;
          break;
      }

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'natural'
      });

      const imageUrl = response.data[0].url;
      const base64Image = await this.convertUrlToBase64(imageUrl);

      return {
        type,
        content: base64Image,
        description: enhancedPrompt,
        metadata: {
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'hd',
          generatedAt: new Date().toISOString()
        },
        quality: 0.9
      };

    } catch (error) {
      console.error('Error generating visual content:', error);
      throw error;
    }
  }

  // Document Analysis with Claude Vision
  async analyzeDocument(documentPath: string): Promise<any> {
    try {
      const fileExtension = path.extname(documentPath).toLowerCase();
      
      if (['.png', '.jpg', '.jpeg', '.gif', '.bmp'].includes(fileExtension)) {
        // Image document analysis
        return await this.analyzeVisualContent(documentPath);
      } else if (['.mp3', '.wav', '.m4a', '.aac'].includes(fileExtension)) {
        // Audio document analysis
        return await this.analyzeAudioContent(documentPath);
      } else {
        throw new Error(`Unsupported document type: ${fileExtension}`);
      }

    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  }

  // Batch Processing
  async processMultipleFiles(filePaths: string[]): Promise<any[]> {
    const results = [];
    
    for (const filePath of filePaths) {
      try {
        const result = await this.analyzeDocument(filePath);
        results.push({
          filePath,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          filePath,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Helper Methods
  private async preprocessImage(imagePath: string): Promise<string> {
    try {
      // Resize and optimize image for analysis
      const buffer = await sharp(imagePath)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();
      
      return buffer.toString('base64');
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw error;
    }
  }

  private async convertUrlToBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } catch (error) {
      console.error('Error converting URL to base64:', error);
      throw error;
    }
  }

  // Audio Processing
  async processAudioFile(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .format('wav')
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  // Quality Assessment
  async assessContentQuality(content: any, type: 'visual' | 'audio' | 'text'): Promise<number> {
    try {
      let qualityScore = 0.5; // Base score
      
      switch (type) {
        case 'visual':
          qualityScore = this.assessVisualQuality(content);
          break;
        case 'audio':
          qualityScore = this.assessAudioQuality(content);
          break;
        case 'text':
          qualityScore = this.assessTextQuality(content);
          break;
      }
      
      return Math.min(Math.max(qualityScore, 0), 1);
    } catch (error) {
      console.error('Error assessing content quality:', error);
      return 0.5;
    }
  }

  private assessVisualQuality(content: any): number {
    // Simple visual quality assessment
    let score = 0.5;
    
    if (content.resolution && content.resolution > 1024) score += 0.2;
    if (content.clarity && content.clarity > 0.8) score += 0.2;
    if (content.composition && content.composition > 0.7) score += 0.1;
    
    return score;
  }

  private assessAudioQuality(content: any): number {
    // Simple audio quality assessment
    let score = 0.5;
    
    if (content.clarity && content.clarity > 0.8) score += 0.3;
    if (content.backgroundNoise && content.backgroundNoise < 0.3) score += 0.2;
    
    return score;
  }

  private assessTextQuality(content: any): number {
    // Simple text quality assessment
    let score = 0.5;
    
    if (content.length > 100) score += 0.2;
    if (content.readability && content.readability > 0.7) score += 0.2;
    if (content.coherence && content.coherence > 0.8) score += 0.1;
    
    return score;
  }
}

export const multimodalService = new MultimodalService();
import { ChatGrok } from '@langchain/community/chat_models/grok';
import { Whisper } from '@langchain/community/llms/whisper';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

export interface VisualAnalysisResult {
  description: string;
  elements: VisualElement[];
  emotions: string[];
  accessibility: AccessibilityAnalysis;
  usability: UsabilityAnalysis;
  recommendations: string[];
  confidence: number;
}

export interface VisualElement {
  type: 'text' | 'button' | 'image' | 'form' | 'navigation' | 'other';
  content: string;
  position: { x: number; y: number; width: number; height: number };
  color: string;
  size: number;
  accessibility: {
    altText?: string;
    contrast: number;
    readable: boolean;
  };
}

export interface AccessibilityAnalysis {
  overallScore: number;
  issues: string[];
  recommendations: string[];
  wcagCompliance: {
    level: 'A' | 'AA' | 'AAA' | 'non-compliant';
    issues: string[];
  };
}

export interface UsabilityAnalysis {
  clarity: number;
  navigation: number;
  visualHierarchy: number;
  consistency: number;
  overallScore: number;
  issues: string[];
  recommendations: string[];
}

export interface AudioAnalysisResult {
  transcription: string;
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    emotions: string[];
  };
  speaker: {
    gender: string;
    age: string;
    confidence: number;
  };
  quality: {
    clarity: number;
    backgroundNoise: number;
    overall: number;
  };
  insights: string[];
}

export interface GeneratedContent {
  type: 'image' | 'prototype' | 'wireframe';
  content: string; // Base64 or URL
  description: string;
  metadata: any;
  quality: number;
}

export class MultimodalService {
  private openai: OpenAI;
  private grok: ChatGrok;
  private whisper: Whisper;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.grok = new ChatGrok({
      modelName: 'grok-3',
      temperature: 0.7,
      maxTokens: 1000
    });

    this.whisper = new Whisper({
      modelName: 'whisper-1',
      temperature: 0.0
    });
  }

  // Visual Analysis with GPT-4V
  async analyzeVisualContent(imagePath: string): Promise<VisualAnalysisResult> {
    try {
      // Process image for analysis
      const processedImage = await this.preprocessImage(imagePath);
      
      // Analyze with GPT-4V
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this UI/UX design image and provide:
                1. Detailed description of all visual elements
                2. Emotional response analysis
                3. Accessibility assessment (WCAG compliance)
                4. Usability analysis
                5. Specific recommendations for improvement
                
                Focus on user research insights and how this design would perform with different user personas.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${processedImage}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        description: analysis.description || '',
        elements: analysis.elements || [],
        emotions: analysis.emotions || [],
        accessibility: analysis.accessibility || { overallScore: 0, issues: [], recommendations: [], wcagCompliance: { level: 'non-compliant', issues: [] } },
        usability: analysis.usability || { clarity: 0, navigation: 0, visualHierarchy: 0, consistency: 0, overallScore: 0, issues: [], recommendations: [] },
        recommendations: analysis.recommendations || [],
        confidence: analysis.confidence || 0.8
      };

    } catch (error) {
      console.error('Error analyzing visual content:', error);
      throw error;
    }
  }

  // Audio Analysis with Whisper
  async analyzeAudioContent(audioPath: string): Promise<AudioAnalysisResult> {
    try {
      // Transcribe audio
      const transcription = await this.whisper.call(audioPath);
      
      // Analyze sentiment and speaker characteristics
      const sentimentResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: `Analyze the sentiment and speaker characteristics of this transcribed interview:
            
            "${transcription}"
            
            Provide:
            1. Sentiment analysis (score, label, emotions)
            2. Speaker characteristics (gender, age range, confidence)
            3. Audio quality assessment
            4. Key insights and themes
            5. User research implications
            `
          }
        ],
        max_tokens: 1000
      });

      const analysis = JSON.parse(sentimentResponse.choices[0].message.content || '{}');
      
      return {
        transcription,
        sentiment: analysis.sentiment || { score: 0, label: 'neutral', emotions: [] },
        speaker: analysis.speaker || { gender: 'unknown', age: 'unknown', confidence: 0 },
        quality: analysis.quality || { clarity: 0, backgroundNoise: 0, overall: 0 },
        insights: analysis.insights || []
      };

    } catch (error) {
      console.error('Error analyzing audio content:', error);
      throw error;
    }
  }

  // Generate Visual Content with DALL-E 3
  async generateVisualContent(prompt: string, type: 'image' | 'prototype' | 'wireframe'): Promise<GeneratedContent> {
    try {
      let enhancedPrompt = prompt;
      
      // Enhance prompt based on type
      switch (type) {
        case 'prototype':
          enhancedPrompt = `Create a high-fidelity UI prototype: ${prompt}. Include realistic content, proper spacing, modern design principles, and accessibility considerations.`;
          break;
        case 'wireframe':
          enhancedPrompt = `Create a clean wireframe: ${prompt}. Focus on layout, structure, and user flow. Use simple lines and placeholders.`;
          break;
        case 'image':
          enhancedPrompt = `Create a professional UI/UX image: ${prompt}. High quality, modern design, suitable for user research.`;
          break;
      }

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'natural'
      });

      const imageUrl = response.data[0].url;
      const base64Image = await this.convertUrlToBase64(imageUrl);

      return {
        type,
        content: base64Image,
        description: enhancedPrompt,
        metadata: {
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'hd',
          generatedAt: new Date().toISOString()
        },
        quality: 0.9
      };

    } catch (error) {
      console.error('Error generating visual content:', error);
      throw error;
    }
  }

  // Document Analysis with Claude Vision
  async analyzeDocument(documentPath: string): Promise<any> {
    try {
      const fileExtension = path.extname(documentPath).toLowerCase();
      
      if (['.png', '.jpg', '.jpeg', '.gif', '.bmp'].includes(fileExtension)) {
        // Image document analysis
        return await this.analyzeVisualContent(documentPath);
      } else if (['.mp3', '.wav', '.m4a', '.aac'].includes(fileExtension)) {
        // Audio document analysis
        return await this.analyzeAudioContent(documentPath);
      } else {
        throw new Error(`Unsupported document type: ${fileExtension}`);
      }

    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  }

  // Batch Processing
  async processMultipleFiles(filePaths: string[]): Promise<any[]> {
    const results = [];
    
    for (const filePath of filePaths) {
      try {
        const result = await this.analyzeDocument(filePath);
        results.push({
          filePath,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          filePath,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Helper Methods
  private async preprocessImage(imagePath: string): Promise<string> {
    try {
      // Resize and optimize image for analysis
      const buffer = await sharp(imagePath)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer();
      
      return buffer.toString('base64');
    } catch (error) {
      console.error('Error preprocessing image:', error);
      throw error;
    }
  }

  private async convertUrlToBase64(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } catch (error) {
      console.error('Error converting URL to base64:', error);
      throw error;
    }
  }

  // Audio Processing
  async processAudioFile(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .format('wav')
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  // Quality Assessment
  async assessContentQuality(content: any, type: 'visual' | 'audio' | 'text'): Promise<number> {
    try {
      let qualityScore = 0.5; // Base score
      
      switch (type) {
        case 'visual':
          qualityScore = this.assessVisualQuality(content);
          break;
        case 'audio':
          qualityScore = this.assessAudioQuality(content);
          break;
        case 'text':
          qualityScore = this.assessTextQuality(content);
          break;
      }
      
      return Math.min(Math.max(qualityScore, 0), 1);
    } catch (error) {
      console.error('Error assessing content quality:', error);
      return 0.5;
    }
  }

  private assessVisualQuality(content: any): number {
    // Simple visual quality assessment
    let score = 0.5;
    
    if (content.resolution && content.resolution > 1024) score += 0.2;
    if (content.clarity && content.clarity > 0.8) score += 0.2;
    if (content.composition && content.composition > 0.7) score += 0.1;
    
    return score;
  }

  private assessAudioQuality(content: any): number {
    // Simple audio quality assessment
    let score = 0.5;
    
    if (content.clarity && content.clarity > 0.8) score += 0.3;
    if (content.backgroundNoise && content.backgroundNoise < 0.3) score += 0.2;
    
    return score;
  }

  private assessTextQuality(content: any): number {
    // Simple text quality assessment
    let score = 0.5;
    
    if (content.length > 100) score += 0.2;
    if (content.readability && content.readability > 0.7) score += 0.2;
    if (content.coherence && content.coherence > 0.8) score += 0.1;
    
    return score;
  }
}

export const multimodalService = new MultimodalService();
