import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, BarChart3, Target, TrendingUp, AlertCircle, CheckCircle, Filter, Download, Eye, RefreshCw } from 'lucide-react';
import { Project, ResearchData, Insight, Recommendation } from '../../types';
import Button from '../shared/Button';

interface InsightAnalysis {
  id: string;
  category: 'usability' | 'satisfaction' | 'behavior' | 'preference' | 'pain-point' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  evidence: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  participants: string[];
  quotes: string[];
  trends: TrendData[];
  recommendations: Recommendation[];
  createdAt: string;
}

interface TrendData {
  metric: string;
  value: number;
  change: number;
  period: string;
}

interface AIInsightsGeneratorProps {
  project: Project;
  researchData: ResearchData;
  onInsightsGenerated: (insights: InsightAnalysis[]) => void;
}

export default function AIInsightsGenerator({ 
  project, 
  researchData, 
  onInsightsGenerated 
}: AIInsightsGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<InsightAnalysis[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<InsightAnalysis[]>([]);
  const [filters, setFilters] = useState({
    category: 'all',
    impact: 'all',
    priority: 'all',
    confidence: 0
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [analysisConfig, setAnalysisConfig] = useState({
    depth: 'comprehensive',
    focus: 'all',
    includeTrends: true,
    includeRecommendations: true,
    sentimentAnalysis: true,
    patternRecognition: true,
    customPrompts: ''
  });

  useEffect(() => {
    setFilteredInsights(insights);
  }, [insights]);

  useEffect(() => {
    let filtered = insights;

    if (filters.category !== 'all') {
      filtered = filtered.filter(insight => insight.category === filters.category);
    }

    if (filters.impact !== 'all') {
      filtered = filtered.filter(insight => insight.impact === filters.impact);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(insight => insight.priority === filters.priority);
    }

    filtered = filtered.filter(insight => insight.confidence >= filters.confidence);

    setFilteredInsights(filtered);
  }, [filters, insights]);

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/research/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: project,
          researchData: researchData,
          config: analysisConfig
        })
      });

      if (response.ok) {
        const generatedInsights = await response.json();
        setInsights(generatedInsights);
        onInsightsGenerated(generatedInsights);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const refreshInsights = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/research/refresh-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: project,
          researchData: researchData,
          existingInsights: insights,
          config: analysisConfig
        })
      });

      if (response.ok) {
        const refreshedInsights = await response.json();
        setInsights(refreshedInsights);
        onInsightsGenerated(refreshedInsights);
      }
    } catch (error) {
      console.error('Error refreshing insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportInsights = () => {
    const content = generateInsightsReport(filteredInsights);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}-insights-report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateInsightsReport = (insights: InsightAnalysis[]): string => {
    let markdown = `# AI-Generated Insights Report\n\n`;
    markdown += `**Project:** ${project.name}\n`;
    markdown += `**Generated:** ${new Date().toLocaleString()}\n`;
    markdown += `**Total Insights:** ${insights.length}\n\n`;
    markdown += `---\n\n`;

    // Executive Summary
    markdown += `## Executive Summary\n\n`;
    const highImpactInsights = insights.filter(i => i.impact === 'high' || i.impact === 'critical');
    const urgentInsights = insights.filter(i => i.priority === 'urgent');
    
    markdown += `- **High Impact Insights:** ${highImpactInsights.length}\n`;
    markdown += `- **Urgent Priority:** ${urgentInsights.length}\n`;
    markdown += `- **Average Confidence:** ${Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length * 100)}%\n\n`;

    // Insights by Category
    const categories = [...new Set(insights.map(i => i.category))];
    categories.forEach(category => {
      const categoryInsights = insights.filter(i => i.category === category);
      markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} Insights\n\n`;
      
      categoryInsights.forEach((insight, index) => {
        markdown += `### ${index + 1}. ${insight.title}\n\n`;
        markdown += `**Impact:** ${insight.impact} | **Priority:** ${insight.priority} | **Confidence:** ${Math.round(insight.confidence * 100)}%\n\n`;
        markdown += `${insight.description}\n\n`;
        
        if (insight.evidence.length > 0) {
          markdown += `**Evidence:**\n`;
          insight.evidence.forEach(evidence => {
            markdown += `- ${evidence}\n`;
          });
          markdown += `\n`;
        }
        
        if (insight.quotes.length > 0) {
          markdown += `**Key Quotes:**\n`;
          insight.quotes.forEach(quote => {
            markdown += `> "${quote}"\n`;
          });
          markdown += `\n`;
        }
        
        if (insight.recommendations.length > 0) {
          markdown += `**Recommendations:**\n`;
          insight.recommendations.forEach(rec => {
            markdown += `- **${rec.title}:** ${rec.description}\n`;
          });
          markdown += `\n`;
        }
        
        markdown += `---\n\n`;
      });
    });

    return markdown;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-800 bg-red-100';
      case 'high': return 'text-orange-800 bg-orange-100';
      case 'medium': return 'text-yellow-800 bg-yellow-100';
      case 'low': return 'text-green-800 bg-green-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-800 bg-red-100';
      case 'high': return 'text-orange-800 bg-orange-100';
      case 'medium': return 'text-yellow-800 bg-yellow-100';
      case 'low': return 'text-green-800 bg-green-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'usability': return <Target className="w-4 h-4" />;
      case 'satisfaction': return <CheckCircle className="w-4 h-4" />;
      case 'behavior': return <TrendingUp className="w-4 h-4" />;
      case 'preference': return <BarChart3 className="w-4 h-4" />;
      case 'pain-point': return <AlertCircle className="w-4 h-4" />;
      case 'opportunity': return <Sparkles className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights Generator</h3>
        <p className="text-gray-600">Generate comprehensive insights from your research data using advanced AI analysis</p>
      </div>

      {/* Generation Controls */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Analysis Configuration</h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Analysis Depth</label>
              <select
                value={analysisConfig.depth}
                onChange={(e) => setAnalysisConfig(prev => ({ ...prev, depth: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="basic">Basic</option>
                <option value="comprehensive">Comprehensive</option>
                <option value="deep">Deep Analysis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Focus Area</label>
              <select
                value={analysisConfig.focus}
                onChange={(e) => setAnalysisConfig(prev => ({ ...prev, focus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Areas</option>
                <option value="usability">Usability</option>
                <option value="satisfaction">Satisfaction</option>
                <option value="behavior">Behavior</option>
                <option value="preference">Preferences</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={analysisConfig.includeTrends}
                  onChange={(e) => setAnalysisConfig(prev => ({ ...prev, includeTrends: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Include Trends</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={analysisConfig.includeRecommendations}
                  onChange={(e) => setAnalysisConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Include Recommendations</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={analysisConfig.sentimentAnalysis}
                  onChange={(e) => setAnalysisConfig(prev => ({ ...prev, sentimentAnalysis: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Sentiment Analysis</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={analysisConfig.patternRecognition}
                  onChange={(e) => setAnalysisConfig(prev => ({ ...prev, patternRecognition: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Pattern Recognition</span>
              </label>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={generateInsights}
            disabled={isGenerating}
            leftIcon={isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {isGenerating ? 'Generating...' : 'Generate Insights'}
          </Button>
          {insights.length > 0 && (
            <Button
              variant="outline"
              onClick={refreshInsights}
              disabled={isGenerating}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh Analysis
            </Button>
          )}
          {filteredInsights.length > 0 && (
            <Button
              variant="outline"
              onClick={exportInsights}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {insights.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Filter Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="usability">Usability</option>
                <option value="satisfaction">Satisfaction</option>
                <option value="behavior">Behavior</option>
                <option value="preference">Preference</option>
                <option value="pain-point">Pain Point</option>
                <option value="opportunity">Opportunity</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
              <select
                value={filters.impact}
                onChange={(e) => setFilters(prev => ({ ...prev, impact: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Impact Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Confidence</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={filters.confidence}
                onChange={(e) => setFilters(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{Math.round(filters.confidence * 100)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Display */}
      {filteredInsights.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">
              Generated Insights ({filteredInsights.length})
            </h4>
            <div className="text-sm text-gray-500">
              Showing {filteredInsights.length} of {insights.length} insights
            </div>
          </div>

          {filteredInsights.map((insight) => (
            <div key={insight.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getCategoryIcon(insight.category)}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-1">{insight.title}</h5>
                    <p className="text-gray-600">{insight.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                    {insight.impact}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                    {insight.priority}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round(insight.confidence * 100)}%
                  </span>
                </div>
              </div>

              {insight.evidence.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Evidence</h6>
                  <ul className="list-disc list-inside space-y-1">
                    {insight.evidence.map((evidence, index) => (
                      <li key={index} className="text-sm text-gray-600">{evidence}</li>
                    ))}
                  </ul>
                </div>
              )}

              {insight.quotes.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Key Quotes</h6>
                  <div className="space-y-2">
                    {insight.quotes.map((quote, index) => (
                      <blockquote key={index} className="text-sm text-gray-600 italic border-l-4 border-blue-200 pl-3">
                        "{quote}"
                      </blockquote>
                    ))}
                  </div>
                </div>
              )}

              {insight.recommendations.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h6>
                  <div className="space-y-2">
                    {insight.recommendations.map((rec, index) => (
                      <div key={index} className="bg-green-50 p-3 rounded-lg">
                        <div className="font-medium text-green-900">{rec.title}</div>
                        <div className="text-sm text-green-700">{rec.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span>{insight.participants.length} participants</span>
                <span>{new Date(insight.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {insights.length === 0 && !isGenerating && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Insights Generated Yet</h3>
          <p className="text-gray-600 mb-4">Generate AI-powered insights from your research data</p>
          <Button
            onClick={generateInsights}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate Insights
          </Button>
        </div>
      )}
    </div>
  );
}
