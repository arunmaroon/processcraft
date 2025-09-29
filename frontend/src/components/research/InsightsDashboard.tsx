import { useState } from 'react';
import { Download, AlertCircle, TrendingUp, Users, Target, Lightbulb, CheckCircle, FileText } from 'lucide-react';
import { ResearchData, Project, Insight } from '../../types';
import Button from '../shared/Button';
import ResearchReportGenerator from './ResearchReportGenerator';
import { DesignerOnly } from '../shared/RoleGuard';

interface InsightsDashboardProps {
  researchData: ResearchData;
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export default function InsightsDashboard({ researchData, project, onProjectUpdate }: InsightsDashboardProps) {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleCompleteResearch = async () => {
    setIsSubmitting(true);
    try {
      // Update research data status to COMPLETED
      const completedResearchData = {
        ...researchData,
        status: 'COMPLETED' as const,
        updatedAt: new Date().toISOString()
      };
      
      // Update project with completed research data and move to next stage
      const updatedProject = {
        ...project,
        research: completedResearchData,
        currentStage: 'UX_DESIGN' as const,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updating project:', updatedProject);
      onProjectUpdate(updatedProject);
      console.log('Research completed successfully - moved to UX Design stage');
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error completing research:', error);
      alert('Failed to complete research. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'PAIN_POINT':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'OPPORTUNITY':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'BEHAVIOR':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'PREFERENCE':
        return <Target className="w-5 h-5 text-green-500" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightColor = (category: string) => {
    switch (category) {
      case 'PAIN_POINT':
        return 'bg-red-50 border-red-200';
      case 'OPPORTUNITY':
        return 'bg-yellow-50 border-yellow-200';
      case 'BEHAVIOR':
        return 'bg-blue-50 border-blue-200';
      case 'PREFERENCE':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Research Insights</h3>
          <p className="text-gray-600">AI-generated insights from virtual user research</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowReport(!showReport)}
            leftIcon={<FileText className="w-4 h-4" />}
          >
            {showReport ? 'Hide Report' : 'View Full Report'}
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Report
          </Button>
          <DesignerOnly>
            <Button
              onClick={handleCompleteResearch}
              loading={isSubmitting}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Complete Research
            </Button>
          </DesignerOnly>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <h4 className="font-medium text-green-800">Research Completed Successfully!</h4>
              <p className="text-green-700 text-sm">Project has been moved to UX Design stage.</p>
            </div>
          </div>
        </div>
      )}

      {/* Research Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Research Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">{researchData.insights.length}</div>
            <div className="text-sm text-gray-600">Total Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{researchData.cohorts.length}</div>
            <div className="text-sm text-gray-600">Cohorts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{researchData.personas.length}</div>
            <div className="text-sm text-gray-600">Personas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(researchData.report.dataQuality * 100)}%
            </div>
            <div className="text-sm text-gray-600">Data Quality</div>
          </div>
        </div>
      </div>

      {/* Key Findings */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Key Findings</h4>
        <div className="space-y-3">
          {researchData.report.keyFindings.map((finding, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700">{finding}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Grid */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Detailed Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {researchData.insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getInsightColor(insight.category)}`}
              onClick={() => setSelectedInsight(insight)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getInsightIcon(insight.category)}
                  <span className="text-sm font-medium text-gray-900">
                    {insight.category.replace('_', ' ')}
                  </span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                  {Math.round(insight.confidence * 100)}%
                </div>
              </div>
              
              <h5 className="font-medium text-gray-900 mb-2">{insight.title}</h5>
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Source: {insight.source}</span>
                {insight.quotes && insight.quotes.length > 0 && (
                  <span>{insight.quotes.length} quotes</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Recommendations</h4>
        <div className="space-y-3">
          {researchData.report.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Next Steps</h4>
        <div className="space-y-2">
          {researchData.report.nextSteps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
              <span className="text-sm text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getInsightIcon(selectedInsight.category)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedInsight.title}</h3>
                    <p className="text-sm text-gray-600">{selectedInsight.category.replace('_', ' ')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedInsight.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Confidence</h4>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getConfidenceColor(selectedInsight.confidence)}`}>
                      {Math.round(selectedInsight.confidence * 100)}%
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Source</h4>
                    <p className="text-sm text-gray-600">{selectedInsight.source}</p>
                  </div>
                </div>

                {selectedInsight.quotes && selectedInsight.quotes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">User Quotes</h4>
                    <div className="space-y-2">
                      {selectedInsight.quotes.map((quote, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 italic">"{quote}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Report View */}
      {showReport && (
        <div className="mt-6">
          <ResearchReportGenerator 
            researchData={researchData} 
            projectName={project.name} 
          />
        </div>
      )}
    </div>
  );
}
