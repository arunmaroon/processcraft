import React, { useState, useEffect } from 'react';
import { FileText, Brain, Download, RefreshCw, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface ReportSection {
  id: string;
  title: string;
  content: string;
  confidence: number;
  keyInsights: string[];
}

interface LLMReportGeneratorProps {
  researchFindings: any[];
  discussionGuide: any;
  onReportGenerated: (report: any) => void;
}

const LLMReportGenerator: React.FC<LLMReportGeneratorProps> = ({
  researchFindings,
  discussionGuide,
  onReportGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState('');

  const generateReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate LLM report generation with progress updates
      const sections = [
        'Executive Summary',
        'Research Methodology',
        'Key Findings',
        'User Insights',
        'Pain Points Analysis',
        'Opportunities & Recommendations',
        'Next Steps'
      ];

      const generatedReport = {
        id: `report-${Date.now()}`,
        title: `${discussionGuide?.title || 'Research'} Report`,
        generatedAt: new Date().toISOString(),
        sections: [],
        summary: '',
        keyMetrics: {},
        recommendations: []
      };

      // Generate each section with progress updates
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        setCurrentSection(section);
        setGenerationProgress((i / sections.length) * 100);
        
        // Simulate section generation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const sectionData = await generateSection(section, researchFindings);
        generatedReport.sections.push(sectionData);
      }

      // Generate summary
      generatedReport.summary = await generateSummary(researchFindings);
      
      // Generate key metrics
      generatedReport.keyMetrics = await generateKeyMetrics(researchFindings);
      
      // Generate recommendations
      generatedReport.recommendations = await generateRecommendations(researchFindings, generatedReport.sections);
      
      setReport(generatedReport);
      onReportGenerated(generatedReport);
      setGenerationProgress(100);
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSection = async (sectionTitle: string, findings: any[]) => {
    // Simulate LLM section generation
    const sectionContent = {
      'Executive Summary': 'This research study provides comprehensive insights into user needs and behaviors. The findings reveal key opportunities for product improvement and user experience enhancement.',
      'Research Methodology': 'We conducted a mixed-methods research approach combining qualitative interviews and quantitative surveys. The study included 50 participants across different user segments.',
      'Key Findings': 'The research uncovered three primary themes: user pain points around navigation, strong demand for mobile optimization, and opportunities for personalization features.',
      'User Insights': 'Users value simplicity and efficiency in their workflows. They prefer intuitive interfaces and quick access to frequently used features.',
      'Pain Points Analysis': 'The main pain points identified include complex navigation, slow loading times, and lack of customization options.',
      'Opportunities & Recommendations': 'Key opportunities include implementing a simplified navigation system, optimizing performance, and adding personalization features.',
      'Next Steps': 'Immediate next steps include prioritizing high-impact improvements, conducting follow-up research, and implementing iterative design changes.'
    };

    return {
      id: sectionTitle.toLowerCase().replace(/\s+/g, '-'),
      title: sectionTitle,
      content: sectionContent[sectionTitle as keyof typeof sectionContent] || 'Content generated based on research findings.',
      confidence: Math.random() * 0.2 + 0.8, // 80-100% confidence
      keyInsights: [
        'Insight 1: Users prefer intuitive interfaces',
        'Insight 2: Performance is a key concern',
        'Insight 3: Personalization drives engagement'
      ]
    };
  };

  const generateSummary = async (findings: any[]) => {
    return 'This comprehensive research report synthesizes findings from user interviews and surveys to provide actionable insights for product development. The study reveals significant opportunities for improving user experience and addressing key pain points.';
  };

  const generateKeyMetrics = async (findings: any[]) => {
    return {
      totalParticipants: findings.length,
      averageConfidence: 0.85,
      keyThemes: 5,
      recommendations: 8
    };
  };

  const generateRecommendations = async (findings: any[], sections: ReportSection[]) => {
    return [
      'Implement a simplified navigation system based on user feedback',
      'Optimize application performance to reduce loading times',
      'Add personalization features to improve user engagement',
      'Conduct follow-up research to validate design changes',
      'Prioritize mobile experience improvements',
      'Develop user onboarding improvements',
      'Create user feedback collection mechanisms',
      'Establish regular user research cadence'
    ];
  };

  if (!report && !isGenerating) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Research Report</h3>
        <p className="text-gray-600 mb-6">
          Generate a comprehensive research report using AI to synthesize findings and provide actionable insights.
        </p>
        <button
          onClick={generateReport}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
        >
          <Brain className="w-5 h-5" />
          <span>Generate Report</span>
        </button>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Report with AI</h3>
          <p className="text-gray-600 mb-4">Currently generating: {currentSection}</p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500">{Math.round(generationProgress)}% complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{report.title}</h3>
            <p className="text-sm text-gray-500">Generated on {new Date(report.generatedAt).toLocaleDateString()}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={generateReport}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate</span>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{report.keyMetrics.totalParticipants}</div>
            <div className="text-sm text-blue-800">Participants</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{Math.round(report.keyMetrics.averageConfidence * 100)}%</div>
            <div className="text-sm text-green-800">Confidence</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{report.keyMetrics.keyThemes}</div>
            <div className="text-sm text-purple-800">Key Themes</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">{report.keyMetrics.recommendations}</div>
            <div className="text-sm text-orange-800">Recommendations</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Executive Summary</h4>
          <p className="text-gray-700">{report.summary}</p>
        </div>
      </div>

      {/* Report Sections */}
      <div className="space-y-4">
        {report.sections.map((section: ReportSection) => (
          <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">{section.title}</h4>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                {Math.round(section.confidence * 100)}% confidence
              </span>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">{section.content}</p>
              {section.keyInsights.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Key Insights:</h5>
                  <ul className="space-y-1">
                    {section.keyInsights.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Recommendations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h4>
          <div className="space-y-3">
            {report.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
          
          {/* Completion Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onReportGenerated(report)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Complete Report & Finish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMReportGenerator;
