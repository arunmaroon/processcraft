import React from 'react';
import { BarChart3, PieChart, Users, Target, Quote, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { ResearchData, Insight, Recommendation } from '../../types';

interface ResearchReportGeneratorProps {
  researchData: ResearchData;
  projectName: string;
}

interface ChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface UserQuote {
  text: string;
  author: string;
  category: string;
}

const ResearchReportGenerator: React.FC<ResearchReportGeneratorProps> = ({ researchData, projectName }) => {
  // Generate mock quantitative data based on research insights
  const generateQuantitativeData = (): ChartData[] => {
    const mockData: ChartData[] = [
      { label: 'Mobile-First Users', value: 78, percentage: 78, color: '#10B981' },
      { label: 'Desktop Users', value: 22, percentage: 22, color: '#F59E0B' }
    ];
    return mockData;
  };

  // Generate user quotes based on insights
  const generateUserQuotes = (): UserQuote[] => {
    return [
      {
        text: "The mobile interface is much easier to use for quick transactions. I prefer using my phone over desktop for this type of application.",
        author: "Sarah Chen",
        category: "Mobile Preference"
      },
      {
        text: "I was concerned about security when entering my personal details. I need to trust that my information is safe.",
        author: "Michael Rodriguez",
        category: "Security Concerns"
      },
      {
        text: "The application process was confusing. I didn't understand some of the fields and had to call customer support.",
        author: "Priya Sharma",
        category: "Process Complexity"
      },
      {
        text: "I wanted to know about the credit limit before completing the application. It would help me decide if it's worth applying.",
        author: "David Kim",
        category: "Transparency Issues"
      }
    ];
  };

  // Generate action plan items
  const generateActionPlan = () => {
    return [
      {
        id: '1',
        title: 'Implement Mobile-First Design',
        description: 'Optimize the application flow for mobile users with simplified navigation',
        priority: 'HIGH',
        status: 'in_progress',
        progress: 60
      },
      {
        id: '2',
        title: 'Add Security Indicators',
        description: 'Display security badges and encryption information to build user trust',
        priority: 'HIGH',
        status: 'pending',
        progress: 0
      },
      {
        id: '3',
        title: 'Simplify Application Form',
        description: 'Reduce form fields and add helpful tooltips for complex sections',
        priority: 'MEDIUM',
        status: 'completed',
        progress: 100
      },
      {
        id: '4',
        title: 'Add Credit Limit Preview',
        description: 'Show estimated credit limit range before application completion',
        priority: 'MEDIUM',
        status: 'pending',
        progress: 0
      }
    ];
  };

  const quantitativeData = generateQuantitativeData();
  const userQuotes = generateUserQuotes();
  const actionPlan = generateActionPlan();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ProcessCraft</h1>
            <p className="text-gray-600">AI-Powered UX Research Platform</p>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">{projectName} Research Report</h2>
        <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Executive Summary */}
      <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Executive Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">85%</div>
            <div className="text-sm text-gray-600">User Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">78%</div>
            <div className="text-sm text-gray-600">Mobile Preference</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">92%</div>
            <div className="text-sm text-gray-600">Security Priority</div>
          </div>
        </div>
      </div>

      {/* Research Methodology */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Research Methodology
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Target Groups</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Primary Users: Tech-savvy millennials (25-35)</li>
              <li>• Secondary Users: Investment enthusiasts (30-45)</li>
              <li>• Sample Size: 500+ virtual participants</li>
            </ul>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Research Methods</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• AI-Powered User Interviews</li>
              <li>• Virtual Usability Testing</li>
              <li>• Behavioral Analytics Simulation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Key Findings - Quantitative */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2" />
          Key Findings - Quantitative
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">User Device Preference</h4>
            <div className="space-y-3">
              {quantitativeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${item.percentage}%`, 
                          backgroundColor: item.color 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">User Concerns</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Security Concerns</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="w-5/6 bg-red-500 h-2 rounded-full"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">92%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Process Complexity</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="w-3/5 bg-yellow-500 h-2 rounded-full"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Transparency Issues</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="w-2/5 bg-orange-500 h-2 rounded-full"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">48%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Quotes - Qualitative */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Quote className="w-5 h-5 mr-2" />
          User Feedback - Qualitative Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userQuotes.map((quote, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-700 italic mb-2">"{quote.text}"</p>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">- {quote.author}</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {quote.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {researchData.insights.map((insight, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {Math.round(insight.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Source: {insight.source}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  insight.category === 'PREFERENCE' ? 'bg-green-100 text-green-800' :
                  insight.category === 'USABILITY' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {insight.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Action Plan & Implementation Status
        </h3>
        <div className="space-y-4">
          {actionPlan.map((item) => (
            <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{item.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Strategic Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {researchData.recommendations?.map((rec, index) => (
            <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-blue-900">{rec.title}</h4>
                <div className="flex items-center space-x-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.impact === 'HIGH' ? 'bg-purple-100 text-purple-800' :
                    rec.impact === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {rec.impact} Impact
                  </span>
                </div>
              </div>
              <p className="text-sm text-blue-800">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Generated by ProcessCraft AI Research Platform • {new Date().toLocaleDateString()}</p>
        <p className="mt-1">All data points are based on AI-simulated user research and behavioral analysis</p>
      </div>
    </div>
  );
};

export default ResearchReportGenerator;
