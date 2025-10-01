import { ChatOpenAI } from '@langchain/openai';
import { ChatGrok } from '@langchain/community/chat_models/grok';
import { AgentMemoryManager } from './AgentMemoryManager';
import { BiasDetectionEngine } from './BiasDetectionEngine';
import { ConsistencyScorer } from './ConsistencyScorer';
import { SentimentAnalyzer } from './SentimentAnalyzer';

export interface PerformanceMetrics {
  agentId: string;
  sessionId: string;
  timestamp: string;
  overallScore: number;
  quality: QualityMetrics;
  engagement: EngagementMetrics;
  effectiveness: EffectivenessMetrics;
  bias: BiasMetrics;
  consistency: ConsistencyMetrics;
  sentiment: SentimentMetrics;
  recommendations: string[];
}

export interface QualityMetrics {
  responseRelevance: number;
  responseClarity: number;
  responseCompleteness: number;
  responseAccuracy: number;
  overall: number;
}

export interface EngagementMetrics {
  responseTime: number; // milliseconds
  conversationLength: number;
  userSatisfaction: number;
  interactionFrequency: number;
  overall: number;
}

export interface EffectivenessMetrics {
  goalAchievement: number;
  informationGathering: number;
  userInsightGeneration: number;
  researchValue: number;
  overall: number;
}

export interface BiasMetrics {
  overallBias: number;
  demographicBias: number;
  languageBias: number;
  culturalBias: number;
  cognitiveBias: number;
  recommendations: string[];
}

export interface ConsistencyMetrics {
  overallConsistency: number;
  personalityConsistency: number;
  demographicConsistency: number;
  behavioralConsistency: number;
  responseConsistency: number;
  contextConsistency: number;
  recommendations: string[];
}

export interface SentimentMetrics {
  overallSentiment: number;
  emotionalStability: number;
  positiveEngagement: number;
  stressIndicators: number;
  recommendations: string[];
}

export interface AnalyticsDashboard {
  overview: DashboardOverview;
  trends: TrendAnalysis;
  alerts: Alert[];
  recommendations: string[];
  lastUpdated: string;
}

export interface DashboardOverview {
  totalAgents: number;
  activeSessions: number;
  averagePerformance: number;
  topPerformers: AgentPerformance[];
  recentActivity: ActivityItem[];
}

export interface AgentPerformance {
  agentId: string;
  name: string;
  performanceScore: number;
  trend: 'improving' | 'declining' | 'stable';
  lastActive: string;
}

export interface ActivityItem {
  timestamp: string;
  type: 'session_start' | 'session_end' | 'alert' | 'performance_change';
  description: string;
  agentId?: string;
  sessionId?: string;
}

export interface TrendAnalysis {
  performance: TrendData;
  engagement: TrendData;
  bias: TrendData;
  consistency: TrendData;
  sentiment: TrendData;
}

export interface TrendData {
  direction: 'increasing' | 'decreasing' | 'stable';
  velocity: number;
  volatility: number;
  prediction: number; // Predicted value for next period
}

export interface Alert {
  id: string;
  type: 'performance' | 'bias' | 'consistency' | 'sentiment' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  agentId?: string;
  sessionId?: string;
  resolved: boolean;
}

export class PerformanceAnalytics {
  private llm: ChatOpenAI;
  private grok: ChatGrok;
  private memoryManager: AgentMemoryManager;
  private biasEngine: BiasDetectionEngine;
  private consistencyScorer: ConsistencyScorer;
  private sentimentAnalyzer: SentimentAnalyzer;
  private metrics: Map<string, PerformanceMetrics[]>;
  private alerts: Alert[];

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

    this.memoryManager = new AgentMemoryManager();
    this.biasEngine = new BiasDetectionEngine();
    this.consistencyScorer = new ConsistencyScorer();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.metrics = new Map();
    this.alerts = [];
  }

  async analyzeAgentPerformance(agentId: string, sessionId: string, conversationHistory: any[]): Promise<PerformanceMetrics> {
    try {
      // Run parallel analysis
      const [
        qualityMetrics,
        engagementMetrics,
        effectivenessMetrics,
        biasMetrics,
        consistencyMetrics,
        sentimentMetrics
      ] = await Promise.all([
        this.analyzeQuality(conversationHistory),
        this.analyzeEngagement(conversationHistory),
        this.analyzeEffectiveness(conversationHistory),
        this.analyzeBias(conversationHistory),
        this.analyzeConsistency(conversationHistory),
        this.analyzeSentiment(conversationHistory)
      ]);

      // Calculate overall score
      const overallScore = this.calculateOverallScore({
        quality: qualityMetrics.overall,
        engagement: engagementMetrics.overall,
        effectiveness: effectivenessMetrics.overall,
        bias: 1 - biasMetrics.overallBias, // Invert bias (lower is better)
        consistency: consistencyMetrics.overallConsistency,
        sentiment: sentimentMetrics.overallSentiment
      });

      // Generate recommendations
      const recommendations = await this.generateRecommendations({
        quality: qualityMetrics,
        engagement: engagementMetrics,
        effectiveness: effectivenessMetrics,
        bias: biasMetrics,
        consistency: consistencyMetrics,
        sentiment: sentimentMetrics
      });

      const performanceMetrics: PerformanceMetrics = {
        agentId,
        sessionId,
        timestamp: new Date().toISOString(),
        overallScore,
        quality: qualityMetrics,
        engagement: engagementMetrics,
        effectiveness: effectivenessMetrics,
        bias: biasMetrics,
        consistency: consistencyMetrics,
        sentiment: sentimentMetrics,
        recommendations
      };

      // Store metrics
      this.storeMetrics(agentId, performanceMetrics);

      // Check for alerts
      await this.checkAlerts(performanceMetrics);

      return performanceMetrics;

    } catch (error) {
      console.error('Error analyzing agent performance:', error);
      throw error;
    }
  }

  private async analyzeQuality(conversationHistory: any[]): Promise<QualityMetrics> {
    try {
      const responses = conversationHistory
        .filter(conv => conv.response)
        .map(conv => conv.response);

      if (responses.length === 0) {
        return { responseRelevance: 0, responseClarity: 0, responseCompleteness: 0, responseAccuracy: 0, overall: 0 };
      }

      const prompt = `Analyze the quality of these agent responses:

      ${responses.map((r, i) => `Response ${i + 1}: ${r}`).join('\n\n')}

      Rate each aspect from 0-1:
      1. Response relevance to questions
      2. Response clarity and understandability
      3. Response completeness
      4. Response accuracy and correctness

      Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      const overall = (analysis.relevance + analysis.clarity + analysis.completeness + analysis.accuracy) / 4;

      return {
        responseRelevance: analysis.relevance || 0,
        responseClarity: analysis.clarity || 0,
        responseCompleteness: analysis.completeness || 0,
        responseAccuracy: analysis.accuracy || 0,
        overall
      };

    } catch (error) {
      console.error('Error analyzing quality:', error);
      return { responseRelevance: 0, responseClarity: 0, responseCompleteness: 0, responseAccuracy: 0, overall: 0 };
    }
  }

  private async analyzeEngagement(conversationHistory: any[]): Promise<EngagementMetrics> {
    try {
      // Calculate response time (simplified)
      const responseTimes = conversationHistory
        .filter(conv => conv.responseTime)
        .map(conv => conv.responseTime);

      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 5000; // Default 5 seconds

      const conversationLength = conversationHistory.length;
      const interactionFrequency = conversationLength / 10; // Interactions per 10 minutes

      // Use LLM for user satisfaction analysis
      const prompt = `Analyze user engagement in this conversation:

      ${conversationHistory.map((conv, i) => `Turn ${i + 1}: Q: ${conv.message} A: ${conv.response}`).join('\n\n')}

      Rate user satisfaction from 0-1 based on:
      - Question complexity and depth
      - Response engagement
      - Conversation flow
      - User interest indicators

      Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      const userSatisfaction = analysis.satisfaction || 0.5;
      const overall = (userSatisfaction + Math.min(interactionFrequency, 1)) / 2;

      return {
        responseTime: avgResponseTime,
        conversationLength,
        userSatisfaction,
        interactionFrequency,
        overall
      };

    } catch (error) {
      console.error('Error analyzing engagement:', error);
      return { responseTime: 5000, conversationLength: 0, userSatisfaction: 0, interactionFrequency: 0, overall: 0 };
    }
  }

  private async analyzeEffectiveness(conversationHistory: any[]): Promise<EffectivenessMetrics> {
    try {
      const prompt = `Analyze the effectiveness of this research conversation:

      ${conversationHistory.map((conv, i) => `Turn ${i + 1}: Q: ${conv.message} A: ${conv.response}`).join('\n\n')}

      Rate effectiveness from 0-1 for:
      1. Goal achievement (did it meet research objectives?)
      2. Information gathering (how much useful data was collected?)
      3. User insight generation (what insights were gained?)
      4. Research value (overall value for research purposes)

      Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      const overall = (analysis.goalAchievement + analysis.informationGathering + 
                     analysis.userInsightGeneration + analysis.researchValue) / 4;

      return {
        goalAchievement: analysis.goalAchievement || 0,
        informationGathering: analysis.informationGathering || 0,
        userInsightGeneration: analysis.userInsightGeneration || 0,
        researchValue: analysis.researchValue || 0,
        overall
      };

    } catch (error) {
      console.error('Error analyzing effectiveness:', error);
      return { goalAchievement: 0, informationGathering: 0, userInsightGeneration: 0, researchValue: 0, overall: 0 };
    }
  }

  private async analyzeBias(conversationHistory: any[]): Promise<BiasMetrics> {
    try {
      const biasResult = await this.biasEngine.detectBias(conversationHistory);
      
      return {
        overallBias: biasResult.overallBiasScore,
        demographicBias: biasResult.demographicBias.overall,
        languageBias: biasResult.languageBias.overall,
        culturalBias: biasResult.culturalBias.overall,
        cognitiveBias: biasResult.cognitiveBias.overall,
        recommendations: biasResult.recommendations
      };

    } catch (error) {
      console.error('Error analyzing bias:', error);
      return {
        overallBias: 0,
        demographicBias: 0,
        languageBias: 0,
        culturalBias: 0,
        cognitiveBias: 0,
        recommendations: []
      };
    }
  }

  private async analyzeConsistency(conversationHistory: any[]): Promise<ConsistencyMetrics> {
    try {
      const consistencyResult = await this.consistencyScorer.scoreConsistency(conversationHistory);
      
      return {
        overallConsistency: consistencyResult.overall,
        personalityConsistency: consistencyResult.personality,
        demographicConsistency: consistencyResult.demographic,
        behavioralConsistency: consistencyResult.behavioral,
        responseConsistency: consistencyResult.response,
        contextConsistency: consistencyResult.context,
        recommendations: consistencyResult.recommendations
      };

    } catch (error) {
      console.error('Error analyzing consistency:', error);
      return {
        overallConsistency: 0,
        personalityConsistency: 0,
        demographicConsistency: 0,
        behavioralConsistency: 0,
        responseConsistency: 0,
        contextConsistency: 0,
        recommendations: []
      };
    }
  }

  private async analyzeSentiment(conversationHistory: any[]): Promise<SentimentMetrics> {
    try {
      const sentimentResult = await this.sentimentAnalyzer.analyzeSentiment(conversationHistory);
      
      return {
        overallSentiment: sentimentResult.overall.score,
        emotionalStability: 1 - sentimentResult.trends.volatility,
        positiveEngagement: Math.max(0, sentimentResult.overall.score),
        stressIndicators: sentimentResult.emotions.emotions.fear + sentimentResult.emotions.emotions.anger,
        recommendations: sentimentResult.insights
      };

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        overallSentiment: 0,
        emotionalStability: 0,
        positiveEngagement: 0,
        stressIndicators: 0,
        recommendations: []
      };
    }
  }

  private calculateOverallScore(metrics: {
    quality: number;
    engagement: number;
    effectiveness: number;
    bias: number;
    consistency: number;
    sentiment: number;
  }): number {
    const weights = {
      quality: 0.25,
      engagement: 0.2,
      effectiveness: 0.25,
      bias: 0.15,
      consistency: 0.1,
      sentiment: 0.05
    };

    return (
      metrics.quality * weights.quality +
      metrics.engagement * weights.engagement +
      metrics.effectiveness * weights.effectiveness +
      metrics.bias * weights.bias +
      metrics.consistency * weights.consistency +
      metrics.sentiment * weights.sentiment
    );
  }

  private async generateRecommendations(metrics: any): Promise<string[]> {
    try {
      const prompt = `Based on these performance metrics, provide specific recommendations:

      ${JSON.stringify(metrics, null, 2)}

      Provide 5-10 actionable recommendations to improve agent performance.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      
      const recommendations = response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 10);

      return recommendations;

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return ['Monitor performance metrics regularly', 'Address any identified issues promptly'];
    }
  }

  private storeMetrics(agentId: string, metrics: PerformanceMetrics): void {
    if (!this.metrics.has(agentId)) {
      this.metrics.set(agentId, []);
    }
    
    const agentMetrics = this.metrics.get(agentId)!;
    agentMetrics.push(metrics);
    
    // Keep only last 100 metrics per agent
    if (agentMetrics.length > 100) {
      agentMetrics.splice(0, agentMetrics.length - 100);
    }
  }

  private async checkAlerts(metrics: PerformanceMetrics): Promise<void> {
    const alerts: Alert[] = [];

    // Performance alerts
    if (metrics.overallScore < 0.5) {
      alerts.push({
        id: `perf_${Date.now()}`,
        type: 'performance',
        severity: 'high',
        message: `Low performance score: ${metrics.overallScore.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        agentId: metrics.agentId,
        sessionId: metrics.sessionId,
        resolved: false
      });
    }

    // Bias alerts
    if (metrics.bias.overallBias > 0.7) {
      alerts.push({
        id: `bias_${Date.now()}`,
        type: 'bias',
        severity: 'critical',
        message: `High bias detected: ${metrics.bias.overallBias.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        agentId: metrics.agentId,
        sessionId: metrics.sessionId,
        resolved: false
      });
    }

    // Consistency alerts
    if (metrics.consistency.overallConsistency < 0.4) {
      alerts.push({
        id: `cons_${Date.now()}`,
        type: 'consistency',
        severity: 'medium',
        message: `Low consistency score: ${metrics.consistency.overallConsistency.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        agentId: metrics.agentId,
        sessionId: metrics.sessionId,
        resolved: false
      });
    }

    // Sentiment alerts
    if (metrics.sentiment.stressIndicators > 0.7) {
      alerts.push({
        id: `sent_${Date.now()}`,
        type: 'sentiment',
        severity: 'high',
        message: `High stress indicators detected: ${metrics.sentiment.stressIndicators.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        agentId: metrics.agentId,
        sessionId: metrics.sessionId,
        resolved: false
      });
    }

    this.alerts.push(...alerts);
  }

  // Dashboard methods
  async getDashboard(): Promise<AnalyticsDashboard> {
    try {
      const overview = await this.getDashboardOverview();
      const trends = await this.getTrendAnalysis();
      const recommendations = await this.getGlobalRecommendations();

      return {
        overview,
        trends,
        alerts: this.alerts.filter(alert => !alert.resolved),
        recommendations,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting dashboard:', error);
      throw error;
    }
  }

  private async getDashboardOverview(): Promise<DashboardOverview> {
    const totalAgents = this.metrics.size;
    const activeSessions = Array.from(this.metrics.values())
      .flat()
      .filter(metric => {
        const timeDiff = Date.now() - new Date(metric.timestamp).getTime();
        return timeDiff < 3600000; // Last hour
      }).length;

    const allMetrics = Array.from(this.metrics.values()).flat();
    const averagePerformance = allMetrics.length > 0
      ? allMetrics.reduce((sum, metric) => sum + metric.overallScore, 0) / allMetrics.length
      : 0;

    const topPerformers = Array.from(this.metrics.entries())
      .map(([agentId, metrics]) => ({
        agentId,
        name: `Agent ${agentId}`,
        performanceScore: metrics[metrics.length - 1]?.overallScore || 0,
        trend: this.calculateTrend(metrics),
        lastActive: metrics[metrics.length - 1]?.timestamp || new Date().toISOString()
      }))
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5);

    const recentActivity = this.getRecentActivity();

    return {
      totalAgents,
      activeSessions,
      averagePerformance,
      topPerformers,
      recentActivity
    };
  }

  private calculateTrend(metrics: PerformanceMetrics[]): 'improving' | 'declining' | 'stable' {
    if (metrics.length < 2) return 'stable';
    
    const recent = metrics.slice(-5);
    const older = metrics.slice(-10, -5);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, m) => sum + m.overallScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.overallScore, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (Math.abs(difference) < 0.05) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  private getRecentActivity(): ActivityItem[] {
    const activities: ActivityItem[] = [];
    
    // Add recent metrics as activity
    const recentMetrics = Array.from(this.metrics.values())
      .flat()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    
    for (const metric of recentMetrics) {
      activities.push({
        timestamp: metric.timestamp,
        type: 'performance_change',
        description: `Performance score: ${metric.overallScore.toFixed(2)}`,
        agentId: metric.agentId,
        sessionId: metric.sessionId
      });
    }
    
    return activities;
  }

  private async getTrendAnalysis(): Promise<TrendAnalysis> {
    const allMetrics = Array.from(this.metrics.values()).flat();
    
    return {
      performance: this.calculateTrendData(allMetrics.map(m => m.overallScore)),
      engagement: this.calculateTrendData(allMetrics.map(m => m.engagement.overall)),
      bias: this.calculateTrendData(allMetrics.map(m => m.bias.overallBias)),
      consistency: this.calculateTrendData(allMetrics.map(m => m.consistency.overallConsistency)),
      sentiment: this.calculateTrendData(allMetrics.map(m => m.sentiment.overallSentiment))
    };
  }

  private calculateTrendData(values: number[]): TrendData {
    if (values.length < 2) {
      return { direction: 'stable', velocity: 0, volatility: 0, prediction: 0 };
    }
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const direction = secondAvg > firstAvg ? 'increasing' : secondAvg < firstAvg ? 'decreasing' : 'stable';
    const velocity = Math.abs(secondAvg - firstAvg);
    const volatility = this.calculateVolatility(values);
    const prediction = secondAvg + (secondAvg - firstAvg); // Simple linear prediction
    
    return { direction, velocity, volatility, prediction };
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private async getGlobalRecommendations(): Promise<string[]> {
    try {
      const allMetrics = Array.from(this.metrics.values()).flat();
      
      if (allMetrics.length === 0) {
        return ['Start collecting performance data to generate recommendations'];
      }
      
      const avgPerformance = allMetrics.reduce((sum, m) => sum + m.overallScore, 0) / allMetrics.length;
      const avgBias = allMetrics.reduce((sum, m) => sum + m.bias.overallBias, 0) / allMetrics.length;
      const avgConsistency = allMetrics.reduce((sum, m) => sum + m.consistency.overallConsistency, 0) / allMetrics.length;
      
      const recommendations = [];
      
      if (avgPerformance < 0.6) {
        recommendations.push('Overall performance is below target - review agent training and configuration');
      }
      
      if (avgBias > 0.5) {
        recommendations.push('Bias levels are elevated - implement bias reduction strategies');
      }
      
      if (avgConsistency < 0.5) {
        recommendations.push('Consistency scores are low - improve agent memory and personality stability');
      }
      
      if (recommendations.length === 0) {
        recommendations.push('Performance metrics are within acceptable ranges');
        recommendations.push('Continue monitoring and fine-tuning agent behavior');
      }
      
      return recommendations;
      
    } catch (error) {
      console.error('Error getting global recommendations:', error);
      return ['Monitor system performance regularly'];
    }
  }

  // Utility methods
  async getAgentMetrics(agentId: string, limit: number = 50): Promise<PerformanceMetrics[]> {
    const metrics = this.metrics.get(agentId) || [];
    return metrics.slice(-limit);
  }

  async getAlerts(severity?: string, resolved?: boolean): Promise<Alert[]> {
    let filteredAlerts = this.alerts;
    
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    if (resolved !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.resolved === resolved);
    }
    
    return filteredAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }
}

export const performanceAnalytics = new PerformanceAnalytics();
import { ChatGrok } from '@langchain/community/chat_models/grok';
import { AgentMemoryManager } from './AgentMemoryManager';
import { BiasDetectionEngine } from './BiasDetectionEngine';
import { ConsistencyScorer } from './ConsistencyScorer';
import { SentimentAnalyzer } from './SentimentAnalyzer';

export interface PerformanceMetrics {
  agentId: string;
  sessionId: string;
  timestamp: string;
  overallScore: number;
  quality: QualityMetrics;
  engagement: EngagementMetrics;
  effectiveness: EffectivenessMetrics;
  bias: BiasMetrics;
  consistency: ConsistencyMetrics;
  sentiment: SentimentMetrics;
  recommendations: string[];
}

export interface QualityMetrics {
  responseRelevance: number;
  responseClarity: number;
  responseCompleteness: number;
  responseAccuracy: number;
  overall: number;
}

export interface EngagementMetrics {
  responseTime: number; // milliseconds
  conversationLength: number;
  userSatisfaction: number;
  interactionFrequency: number;
  overall: number;
}

export interface EffectivenessMetrics {
  goalAchievement: number;
  informationGathering: number;
  userInsightGeneration: number;
  researchValue: number;
  overall: number;
}

export interface BiasMetrics {
  overallBias: number;
  demographicBias: number;
  languageBias: number;
  culturalBias: number;
  cognitiveBias: number;
  recommendations: string[];
}

export interface ConsistencyMetrics {
  overallConsistency: number;
  personalityConsistency: number;
  demographicConsistency: number;
  behavioralConsistency: number;
  responseConsistency: number;
  contextConsistency: number;
  recommendations: string[];
}

export interface SentimentMetrics {
  overallSentiment: number;
  emotionalStability: number;
  positiveEngagement: number;
  stressIndicators: number;
  recommendations: string[];
}

export interface AnalyticsDashboard {
  overview: DashboardOverview;
  trends: TrendAnalysis;
  alerts: Alert[];
  recommendations: string[];
  lastUpdated: string;
}

export interface DashboardOverview {
  totalAgents: number;
  activeSessions: number;
  averagePerformance: number;
  topPerformers: AgentPerformance[];
  recentActivity: ActivityItem[];
}

export interface AgentPerformance {
  agentId: string;
  name: string;
  performanceScore: number;
  trend: 'improving' | 'declining' | 'stable';
  lastActive: string;
}

export interface ActivityItem {
  timestamp: string;
  type: 'session_start' | 'session_end' | 'alert' | 'performance_change';
  description: string;
  agentId?: string;
  sessionId?: string;
}

export interface TrendAnalysis {
  performance: TrendData;
  engagement: TrendData;
  bias: TrendData;
  consistency: TrendData;
  sentiment: TrendData;
}

export interface TrendData {
  direction: 'increasing' | 'decreasing' | 'stable';
  velocity: number;
  volatility: number;
  prediction: number; // Predicted value for next period
}

export interface Alert {
  id: string;
  type: 'performance' | 'bias' | 'consistency' | 'sentiment' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  agentId?: string;
  sessionId?: string;
  resolved: boolean;
}

export class PerformanceAnalytics {
  private llm: ChatOpenAI;
  private grok: ChatGrok;
  private memoryManager: AgentMemoryManager;
  private biasEngine: BiasDetectionEngine;
  private consistencyScorer: ConsistencyScorer;
  private sentimentAnalyzer: SentimentAnalyzer;
  private metrics: Map<string, PerformanceMetrics[]>;
  private alerts: Alert[];

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

    this.memoryManager = new AgentMemoryManager();
    this.biasEngine = new BiasDetectionEngine();
    this.consistencyScorer = new ConsistencyScorer();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.metrics = new Map();
    this.alerts = [];
  }

  async analyzeAgentPerformance(agentId: string, sessionId: string, conversationHistory: any[]): Promise<PerformanceMetrics> {
    try {
      // Run parallel analysis
      const [
        qualityMetrics,
        engagementMetrics,
        effectivenessMetrics,
        biasMetrics,
        consistencyMetrics,
        sentimentMetrics
      ] = await Promise.all([
        this.analyzeQuality(conversationHistory),
        this.analyzeEngagement(conversationHistory),
        this.analyzeEffectiveness(conversationHistory),
        this.analyzeBias(conversationHistory),
        this.analyzeConsistency(conversationHistory),
        this.analyzeSentiment(conversationHistory)
      ]);

      // Calculate overall score
      const overallScore = this.calculateOverallScore({
        quality: qualityMetrics.overall,
        engagement: engagementMetrics.overall,
        effectiveness: effectivenessMetrics.overall,
        bias: 1 - biasMetrics.overallBias, // Invert bias (lower is better)
        consistency: consistencyMetrics.overallConsistency,
        sentiment: sentimentMetrics.overallSentiment
      });

      // Generate recommendations
      const recommendations = await this.generateRecommendations({
        quality: qualityMetrics,
        engagement: engagementMetrics,
        effectiveness: effectivenessMetrics,
        bias: biasMetrics,
        consistency: consistencyMetrics,
        sentiment: sentimentMetrics
      });

      const performanceMetrics: PerformanceMetrics = {
        agentId,
        sessionId,
        timestamp: new Date().toISOString(),
        overallScore,
        quality: qualityMetrics,
        engagement: engagementMetrics,
        effectiveness: effectivenessMetrics,
        bias: biasMetrics,
        consistency: consistencyMetrics,
        sentiment: sentimentMetrics,
        recommendations
      };

      // Store metrics
      this.storeMetrics(agentId, performanceMetrics);

      // Check for alerts
      await this.checkAlerts(performanceMetrics);

      return performanceMetrics;

    } catch (error) {
      console.error('Error analyzing agent performance:', error);
      throw error;
    }
  }

  private async analyzeQuality(conversationHistory: any[]): Promise<QualityMetrics> {
    try {
      const responses = conversationHistory
        .filter(conv => conv.response)
        .map(conv => conv.response);

      if (responses.length === 0) {
        return { responseRelevance: 0, responseClarity: 0, responseCompleteness: 0, responseAccuracy: 0, overall: 0 };
      }

      const prompt = `Analyze the quality of these agent responses:

      ${responses.map((r, i) => `Response ${i + 1}: ${r}`).join('\n\n')}

      Rate each aspect from 0-1:
      1. Response relevance to questions
      2. Response clarity and understandability
      3. Response completeness
      4. Response accuracy and correctness

      Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      const overall = (analysis.relevance + analysis.clarity + analysis.completeness + analysis.accuracy) / 4;

      return {
        responseRelevance: analysis.relevance || 0,
        responseClarity: analysis.clarity || 0,
        responseCompleteness: analysis.completeness || 0,
        responseAccuracy: analysis.accuracy || 0,
        overall
      };

    } catch (error) {
      console.error('Error analyzing quality:', error);
      return { responseRelevance: 0, responseClarity: 0, responseCompleteness: 0, responseAccuracy: 0, overall: 0 };
    }
  }

  private async analyzeEngagement(conversationHistory: any[]): Promise<EngagementMetrics> {
    try {
      // Calculate response time (simplified)
      const responseTimes = conversationHistory
        .filter(conv => conv.responseTime)
        .map(conv => conv.responseTime);

      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 5000; // Default 5 seconds

      const conversationLength = conversationHistory.length;
      const interactionFrequency = conversationLength / 10; // Interactions per 10 minutes

      // Use LLM for user satisfaction analysis
      const prompt = `Analyze user engagement in this conversation:

      ${conversationHistory.map((conv, i) => `Turn ${i + 1}: Q: ${conv.message} A: ${conv.response}`).join('\n\n')}

      Rate user satisfaction from 0-1 based on:
      - Question complexity and depth
      - Response engagement
      - Conversation flow
      - User interest indicators

      Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      const userSatisfaction = analysis.satisfaction || 0.5;
      const overall = (userSatisfaction + Math.min(interactionFrequency, 1)) / 2;

      return {
        responseTime: avgResponseTime,
        conversationLength,
        userSatisfaction,
        interactionFrequency,
        overall
      };

    } catch (error) {
      console.error('Error analyzing engagement:', error);
      return { responseTime: 5000, conversationLength: 0, userSatisfaction: 0, interactionFrequency: 0, overall: 0 };
    }
  }

  private async analyzeEffectiveness(conversationHistory: any[]): Promise<EffectivenessMetrics> {
    try {
      const prompt = `Analyze the effectiveness of this research conversation:

      ${conversationHistory.map((conv, i) => `Turn ${i + 1}: Q: ${conv.message} A: ${conv.response}`).join('\n\n')}

      Rate effectiveness from 0-1 for:
      1. Goal achievement (did it meet research objectives?)
      2. Information gathering (how much useful data was collected?)
      3. User insight generation (what insights were gained?)
      4. Research value (overall value for research purposes)

      Return as JSON.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      const analysis = JSON.parse(response.content as string);

      const overall = (analysis.goalAchievement + analysis.informationGathering + 
                     analysis.userInsightGeneration + analysis.researchValue) / 4;

      return {
        goalAchievement: analysis.goalAchievement || 0,
        informationGathering: analysis.informationGathering || 0,
        userInsightGeneration: analysis.userInsightGeneration || 0,
        researchValue: analysis.researchValue || 0,
        overall
      };

    } catch (error) {
      console.error('Error analyzing effectiveness:', error);
      return { goalAchievement: 0, informationGathering: 0, userInsightGeneration: 0, researchValue: 0, overall: 0 };
    }
  }

  private async analyzeBias(conversationHistory: any[]): Promise<BiasMetrics> {
    try {
      const biasResult = await this.biasEngine.detectBias(conversationHistory);
      
      return {
        overallBias: biasResult.overallBiasScore,
        demographicBias: biasResult.demographicBias.overall,
        languageBias: biasResult.languageBias.overall,
        culturalBias: biasResult.culturalBias.overall,
        cognitiveBias: biasResult.cognitiveBias.overall,
        recommendations: biasResult.recommendations
      };

    } catch (error) {
      console.error('Error analyzing bias:', error);
      return {
        overallBias: 0,
        demographicBias: 0,
        languageBias: 0,
        culturalBias: 0,
        cognitiveBias: 0,
        recommendations: []
      };
    }
  }

  private async analyzeConsistency(conversationHistory: any[]): Promise<ConsistencyMetrics> {
    try {
      const consistencyResult = await this.consistencyScorer.scoreConsistency(conversationHistory);
      
      return {
        overallConsistency: consistencyResult.overall,
        personalityConsistency: consistencyResult.personality,
        demographicConsistency: consistencyResult.demographic,
        behavioralConsistency: consistencyResult.behavioral,
        responseConsistency: consistencyResult.response,
        contextConsistency: consistencyResult.context,
        recommendations: consistencyResult.recommendations
      };

    } catch (error) {
      console.error('Error analyzing consistency:', error);
      return {
        overallConsistency: 0,
        personalityConsistency: 0,
        demographicConsistency: 0,
        behavioralConsistency: 0,
        responseConsistency: 0,
        contextConsistency: 0,
        recommendations: []
      };
    }
  }

  private async analyzeSentiment(conversationHistory: any[]): Promise<SentimentMetrics> {
    try {
      const sentimentResult = await this.sentimentAnalyzer.analyzeSentiment(conversationHistory);
      
      return {
        overallSentiment: sentimentResult.overall.score,
        emotionalStability: 1 - sentimentResult.trends.volatility,
        positiveEngagement: Math.max(0, sentimentResult.overall.score),
        stressIndicators: sentimentResult.emotions.emotions.fear + sentimentResult.emotions.emotions.anger,
        recommendations: sentimentResult.insights
      };

    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return {
        overallSentiment: 0,
        emotionalStability: 0,
        positiveEngagement: 0,
        stressIndicators: 0,
        recommendations: []
      };
    }
  }

  private calculateOverallScore(metrics: {
    quality: number;
    engagement: number;
    effectiveness: number;
    bias: number;
    consistency: number;
    sentiment: number;
  }): number {
    const weights = {
      quality: 0.25,
      engagement: 0.2,
      effectiveness: 0.25,
      bias: 0.15,
      consistency: 0.1,
      sentiment: 0.05
    };

    return (
      metrics.quality * weights.quality +
      metrics.engagement * weights.engagement +
      metrics.effectiveness * weights.effectiveness +
      metrics.bias * weights.bias +
      metrics.consistency * weights.consistency +
      metrics.sentiment * weights.sentiment
    );
  }

  private async generateRecommendations(metrics: any): Promise<string[]> {
    try {
      const prompt = `Based on these performance metrics, provide specific recommendations:

      ${JSON.stringify(metrics, null, 2)}

      Provide 5-10 actionable recommendations to improve agent performance.`;

      const response = await this.llm.invoke([{ role: 'user', content: prompt }]);
      
      const recommendations = response.content
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, 10);

      return recommendations;

    } catch (error) {
      console.error('Error generating recommendations:', error);
      return ['Monitor performance metrics regularly', 'Address any identified issues promptly'];
    }
  }

  private storeMetrics(agentId: string, metrics: PerformanceMetrics): void {
    if (!this.metrics.has(agentId)) {
      this.metrics.set(agentId, []);
    }
    
    const agentMetrics = this.metrics.get(agentId)!;
    agentMetrics.push(metrics);
    
    // Keep only last 100 metrics per agent
    if (agentMetrics.length > 100) {
      agentMetrics.splice(0, agentMetrics.length - 100);
    }
  }

  private async checkAlerts(metrics: PerformanceMetrics): Promise<void> {
    const alerts: Alert[] = [];

    // Performance alerts
    if (metrics.overallScore < 0.5) {
      alerts.push({
        id: `perf_${Date.now()}`,
        type: 'performance',
        severity: 'high',
        message: `Low performance score: ${metrics.overallScore.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        agentId: metrics.agentId,
        sessionId: metrics.sessionId,
        resolved: false
      });
    }

    // Bias alerts
    if (metrics.bias.overallBias > 0.7) {
      alerts.push({
        id: `bias_${Date.now()}`,
        type: 'bias',
        severity: 'critical',
        message: `High bias detected: ${metrics.bias.overallBias.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        agentId: metrics.agentId,
        sessionId: metrics.sessionId,
        resolved: false
      });
    }

    // Consistency alerts
    if (metrics.consistency.overallConsistency < 0.4) {
      alerts.push({
        id: `cons_${Date.now()}`,
        type: 'consistency',
        severity: 'medium',
        message: `Low consistency score: ${metrics.consistency.overallConsistency.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        agentId: metrics.agentId,
        sessionId: metrics.sessionId,
        resolved: false
      });
    }

    // Sentiment alerts
    if (metrics.sentiment.stressIndicators > 0.7) {
      alerts.push({
        id: `sent_${Date.now()}`,
        type: 'sentiment',
        severity: 'high',
        message: `High stress indicators detected: ${metrics.sentiment.stressIndicators.toFixed(2)}`,
        timestamp: new Date().toISOString(),
        agentId: metrics.agentId,
        sessionId: metrics.sessionId,
        resolved: false
      });
    }

    this.alerts.push(...alerts);
  }

  // Dashboard methods
  async getDashboard(): Promise<AnalyticsDashboard> {
    try {
      const overview = await this.getDashboardOverview();
      const trends = await this.getTrendAnalysis();
      const recommendations = await this.getGlobalRecommendations();

      return {
        overview,
        trends,
        alerts: this.alerts.filter(alert => !alert.resolved),
        recommendations,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting dashboard:', error);
      throw error;
    }
  }

  private async getDashboardOverview(): Promise<DashboardOverview> {
    const totalAgents = this.metrics.size;
    const activeSessions = Array.from(this.metrics.values())
      .flat()
      .filter(metric => {
        const timeDiff = Date.now() - new Date(metric.timestamp).getTime();
        return timeDiff < 3600000; // Last hour
      }).length;

    const allMetrics = Array.from(this.metrics.values()).flat();
    const averagePerformance = allMetrics.length > 0
      ? allMetrics.reduce((sum, metric) => sum + metric.overallScore, 0) / allMetrics.length
      : 0;

    const topPerformers = Array.from(this.metrics.entries())
      .map(([agentId, metrics]) => ({
        agentId,
        name: `Agent ${agentId}`,
        performanceScore: metrics[metrics.length - 1]?.overallScore || 0,
        trend: this.calculateTrend(metrics),
        lastActive: metrics[metrics.length - 1]?.timestamp || new Date().toISOString()
      }))
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5);

    const recentActivity = this.getRecentActivity();

    return {
      totalAgents,
      activeSessions,
      averagePerformance,
      topPerformers,
      recentActivity
    };
  }

  private calculateTrend(metrics: PerformanceMetrics[]): 'improving' | 'declining' | 'stable' {
    if (metrics.length < 2) return 'stable';
    
    const recent = metrics.slice(-5);
    const older = metrics.slice(-10, -5);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, m) => sum + m.overallScore, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.overallScore, 0) / older.length;
    
    const difference = recentAvg - olderAvg;
    
    if (Math.abs(difference) < 0.05) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  private getRecentActivity(): ActivityItem[] {
    const activities: ActivityItem[] = [];
    
    // Add recent metrics as activity
    const recentMetrics = Array.from(this.metrics.values())
      .flat()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    
    for (const metric of recentMetrics) {
      activities.push({
        timestamp: metric.timestamp,
        type: 'performance_change',
        description: `Performance score: ${metric.overallScore.toFixed(2)}`,
        agentId: metric.agentId,
        sessionId: metric.sessionId
      });
    }
    
    return activities;
  }

  private async getTrendAnalysis(): Promise<TrendAnalysis> {
    const allMetrics = Array.from(this.metrics.values()).flat();
    
    return {
      performance: this.calculateTrendData(allMetrics.map(m => m.overallScore)),
      engagement: this.calculateTrendData(allMetrics.map(m => m.engagement.overall)),
      bias: this.calculateTrendData(allMetrics.map(m => m.bias.overallBias)),
      consistency: this.calculateTrendData(allMetrics.map(m => m.consistency.overallConsistency)),
      sentiment: this.calculateTrendData(allMetrics.map(m => m.sentiment.overallSentiment))
    };
  }

  private calculateTrendData(values: number[]): TrendData {
    if (values.length < 2) {
      return { direction: 'stable', velocity: 0, volatility: 0, prediction: 0 };
    }
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const direction = secondAvg > firstAvg ? 'increasing' : secondAvg < firstAvg ? 'decreasing' : 'stable';
    const velocity = Math.abs(secondAvg - firstAvg);
    const volatility = this.calculateVolatility(values);
    const prediction = secondAvg + (secondAvg - firstAvg); // Simple linear prediction
    
    return { direction, velocity, volatility, prediction };
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  private async getGlobalRecommendations(): Promise<string[]> {
    try {
      const allMetrics = Array.from(this.metrics.values()).flat();
      
      if (allMetrics.length === 0) {
        return ['Start collecting performance data to generate recommendations'];
      }
      
      const avgPerformance = allMetrics.reduce((sum, m) => sum + m.overallScore, 0) / allMetrics.length;
      const avgBias = allMetrics.reduce((sum, m) => sum + m.bias.overallBias, 0) / allMetrics.length;
      const avgConsistency = allMetrics.reduce((sum, m) => sum + m.consistency.overallConsistency, 0) / allMetrics.length;
      
      const recommendations = [];
      
      if (avgPerformance < 0.6) {
        recommendations.push('Overall performance is below target - review agent training and configuration');
      }
      
      if (avgBias > 0.5) {
        recommendations.push('Bias levels are elevated - implement bias reduction strategies');
      }
      
      if (avgConsistency < 0.5) {
        recommendations.push('Consistency scores are low - improve agent memory and personality stability');
      }
      
      if (recommendations.length === 0) {
        recommendations.push('Performance metrics are within acceptable ranges');
        recommendations.push('Continue monitoring and fine-tuning agent behavior');
      }
      
      return recommendations;
      
    } catch (error) {
      console.error('Error getting global recommendations:', error);
      return ['Monitor system performance regularly'];
    }
  }

  // Utility methods
  async getAgentMetrics(agentId: string, limit: number = 50): Promise<PerformanceMetrics[]> {
    const metrics = this.metrics.get(agentId) || [];
    return metrics.slice(-limit);
  }

  async getAlerts(severity?: string, resolved?: boolean): Promise<Alert[]> {
    let filteredAlerts = this.alerts;
    
    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    
    if (resolved !== undefined) {
      filteredAlerts = filteredAlerts.filter(alert => alert.resolved === resolved);
    }
    
    return filteredAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }
}

export const performanceAnalytics = new PerformanceAnalytics();
