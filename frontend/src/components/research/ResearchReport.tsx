import React, { useState, useEffect } from 'react';
import { FileText, Download, RefreshCw, CheckCircle, AlertCircle, Users, Target, Lightbulb, TrendingUp } from 'lucide-react';
import Button from '../shared/Button';

interface ResearchReportProps {
  researchPlan: any;
  prdData: any;
  onReportGenerated?: (report: any) => void;
}

interface ResearchReportData {
  executiveSummary: string;
  researchObjectives: string[];
  methodology: string;
  keyFindings: Array<{
    finding: string;
    evidence: string;
    impact: string;
  }>;
  userPersonas: Array<{
    name: string;
    demographics: string;
    painPoints: string[];
    goals: string;
    income: string;
    age: string;
  }>;
  themes: Array<{
    theme: string;
    impact: string;
    evidence: string;
    findings: string[];
  }>;
  criticalRecommendations: Array<{
    recommendation: string;
    priority: string;
  }>;
  uxDesignRecommendations: Array<{
    recommendation: string;
    priority: string;
  }>;
  nextSteps: string[];
  researchLimitations: string[];
  personalizedLoanRecommendations: Array<{
    recommendation: string;
    priority: string;
  }>;
}

const ResearchReport: React.FC<ResearchReportProps> = ({ researchPlan, prdData, onReportGenerated }) => {
  const [report, setReport] = useState<ResearchReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    if (!researchPlan || !prdData) {
      setError('Research plan and PRD data are required to generate the report');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/research/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          researchPlan,
          prdData,
          userPrompt: 'Generate a comprehensive research report analyzing both the PRD and research plan data'
        }),
      });

      const data = await response.json();

      if (data.success && data.report) {
        setReport(data.report);
        if (onReportGenerated) {
          onReportGenerated(data.report);
        }
      } else {
        setError(data.error || 'Failed to generate research report');
      }
    } catch (err) {
      console.error('Error generating research report:', err);
      setError('Failed to generate research report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const exportReport = () => {
    if (!report) return;

    const reportText = `
# Research Report

## Executive Summary
${report.executiveSummary}

## Research Objectives
${report.researchObjectives.map(obj => `- ${obj}`).join('\n')}

## Methodology
${report.methodology}

## Key Findings
${report.keyFindings.map(finding => `
### ${finding.finding}
- **Evidence**: ${finding.evidence}
- **Impact**: ${finding.impact}
`).join('\n')}

## User Personas
${report.userPersonas.map(persona => `
### ${persona.name}
- **Demographics**: ${persona.demographics}
- **Income**: ${persona.income}
- **Age**: ${persona.age}
- **Goals**: ${persona.goals}
- **Pain Points**: ${persona.painPoints.map(point => `  - ${point}`).join('\n')}
`).join('\n')}

## Themes & Findings
${report.themes.map(theme => `
### ${theme.theme}
- **Impact**: ${theme.impact}
- **Evidence**: ${theme.evidence}
- **Findings**: ${theme.findings.map(f => `  - ${f}`).join('\n')}
`).join('\n')}

## Critical Recommendations
${report.criticalRecommendations.map(rec => `- [${rec.priority}] ${rec.recommendation}`).join('\n')}

## UX Design Recommendations
${report.uxDesignRecommendations.map(rec => `- [${rec.priority}] ${rec.recommendation}`).join('\n')}

## Next Steps
${report.nextSteps.map(step => `- ${step}`).join('\n')}

## Research Limitations
${report.researchLimitations.map(limitation => `- ${limitation}`).join('\n')}

## Personalized Loan Recommendations
${report.personalizedLoanRecommendations.map(rec => `- [${rec.priority}] ${rec.recommendation}`).join('\n')}
    `;

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generate Research Report</h2>
          <p className="text-gray-500 text-sm mb-6">
            Generate a comprehensive research report by analyzing the PRD and Research Plan data using AI.
          </p>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          <Button
            onClick={generateReport}
            disabled={isGenerating || !researchPlan || !prdData}
            leftIcon={isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            className="px-6 py-3"
          >
            {isGenerating ? 'Generating Report...' : 'Generate Research Report'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Report</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={generateReport}
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            disabled={isGenerating}
          >
            Regenerate
          </Button>
          <Button
            onClick={exportReport}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Executive Summary
        </h2>
        <p className="text-blue-800 leading-relaxed">{report.executiveSummary}</p>
      </div>

      {/* Research Objectives */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
          Research Objectives
        </h2>
        <ul className="space-y-2">
          {report.researchObjectives?.map((objective, index) => (
            <li key={index} className="flex items-start">
              <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                {index + 1}
              </span>
              <span className="text-gray-700">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Methodology */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Methodology</h2>
        <p className="text-gray-700 leading-relaxed">{report.methodology}</p>
      </div>

      {/* Key Findings */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-orange-600" />
          Key Findings
        </h2>
        <div className="space-y-4">
          {report.keyFindings?.map((finding, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{finding.finding}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Evidence:</span>
                  <p className="text-gray-700">{finding.evidence}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Impact:</span>
                  <p className="text-gray-700">{finding.impact}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Personas */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-purple-600" />
          User Personas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.userPersonas?.map((persona, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{persona.name}</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Demographics:</span>
                  <p className="text-gray-700">{persona.demographics}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Income:</span>
                  <p className="text-gray-700">{persona.income}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Age:</span>
                  <p className="text-gray-700">{persona.age}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Goals:</span>
                  <p className="text-gray-700">{persona.goals}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Pain Points:</span>
                  <ul className="list-disc list-inside text-gray-700 mt-1">
                    {persona.painPoints.map((point, pointIndex) => (
                      <li key={pointIndex}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Themes */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Themes & Findings</h2>
        <div className="space-y-6">
          {report.themes?.map((theme, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{theme.theme}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="font-medium text-gray-600">Impact:</span>
                  <p className="text-gray-700">{theme.impact}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Evidence:</span>
                  <p className="text-gray-700">{theme.evidence}</p>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Findings:</span>
                <ul className="list-disc list-inside text-gray-700 mt-1">
                  {theme.findings.map((finding, findingIndex) => (
                    <li key={findingIndex}>{finding}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Recommendations */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="w-6 h-6 mr-2 text-yellow-600" />
          Critical Recommendations
        </h2>
        <div className="space-y-3">
          {report.criticalRecommendations?.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                {rec.priority}
              </span>
              <span className="text-gray-700 flex-1">{rec.recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* UX Design Recommendations */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">UX Design Recommendations</h2>
        <div className="space-y-3">
          {report.uxDesignRecommendations?.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                {rec.priority}
              </span>
              <span className="text-gray-700 flex-1">{rec.recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Next Steps</h2>
        <ul className="space-y-2">
          {report.nextSteps?.map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                {index + 1}
              </span>
              <span className="text-gray-700">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Research Limitations */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Research Limitations</h2>
        <ul className="space-y-2">
          {report.researchLimitations?.map((limitation, index) => (
            <li key={index} className="flex items-start">
              <span className="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                {index + 1}
              </span>
              <span className="text-gray-700">{limitation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Personalized Loan Recommendations */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Personalized Loan Recommendations</h2>
        <div className="space-y-3">
          {report.personalizedLoanRecommendations?.map((rec, index) => (
            <div key={index} className="flex items-start space-x-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(rec.priority)}`}>
                {rec.priority}
              </span>
              <span className="text-gray-700 flex-1">{rec.recommendation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResearchReport;
