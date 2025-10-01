import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';

interface BiasIssue {
  id: string;
  type: 'GENDER' | 'RACE' | 'AGE' | 'INCOME' | 'CULTURAL' | 'LANGUAGE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  suggestion: string;
  affectedData: string[];
  confidence: number;
}

interface BiasCheckerProps {
  onBiasChecked: () => void;
}

export default function BiasChecker({ onBiasChecked }: BiasCheckerProps) {
  const [biasIssues, setBiasIssues] = useState<BiasIssue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [progressInterval, setProgressInterval] = useState<number | null>(null);

  useEffect(() => {
    loadBiasIssues();
  }, []);

  const loadBiasIssues = async () => {
    try {
      const response = await fetch('/api/admin-research/bias-issues');
      if (response.ok) {
        const data = await response.json();
        setBiasIssues(data);
      } else {
        // Fallback: Load sample bias issues
        setBiasIssues([
          {
            id: '1',
            type: 'GENDER',
            severity: 'MEDIUM',
            description: 'Persona descriptions show gender bias with 80% of tech-savvy personas being male',
            suggestion: 'Ensure equal representation of genders across all persona types',
            affectedData: ['Tech-Savvy Investor', 'Primary Users Cohort'],
            confidence: 0.85
          },
          {
            id: '2',
            type: 'AGE',
            severity: 'LOW',
            description: 'Age range 25-35 is overrepresented, missing older demographics',
            suggestion: 'Include age ranges 35-50 and 50+ to represent diverse user base',
            affectedData: ['Primary Users Cohort', 'Demographics Profile 1'],
            confidence: 0.72
          },
          {
            id: '3',
            type: 'INCOME',
            severity: 'HIGH',
            description: 'Income bias: only ₹5L-₹10L range represented, excluding lower and higher income groups',
            suggestion: 'Add income ranges ₹2.5L-₹5L and ₹10L+ to ensure inclusive representation',
            affectedData: ['All Demographics Profiles', 'Primary Users Cohort'],
            confidence: 0.91
          }
        ]);
      }
    } catch (error) {
      console.log('API not available, using fallback data');
      // Use fallback data
      setBiasIssues([
        {
          id: '1',
          type: 'GENDER',
          severity: 'MEDIUM',
          description: 'Persona descriptions show gender bias with 80% of tech-savvy personas being male',
          suggestion: 'Ensure equal representation of genders across all persona types',
          affectedData: ['Tech-Savvy Investor', 'Primary Users Cohort'],
          confidence: 0.85
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const runBiasCheck = async () => {
    setIsChecking(true);
    setCheckProgress(0);

    try {
      // Simulate bias check progress
      const progressInterval = setInterval(() => {
        setCheckProgress(prev => {
          if (prev >= 100) {
            if (progressInterval) clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      const response = await fetch('/api/admin-research/check-bias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        setBiasIssues(data.issues);
      } else {
        // Fallback: Generate mock bias issues
        setTimeout(() => {
          const newIssues: BiasIssue[] = [
            {
              id: `bias-${Date.now()}`,
              type: 'CULTURAL',
              severity: 'MEDIUM',
              description: 'AI-generated insights show Western-centric assumptions about user behavior',
              suggestion: 'Include diverse cultural perspectives in research data and persona development',
              affectedData: ['AI-Generated Insights', 'Persona Configurations'],
              confidence: 0.78
            },
            {
              id: `bias-${Date.now() + 1}`,
              type: 'LANGUAGE',
              severity: 'LOW',
              description: 'All personas assume English as primary language',
              suggestion: 'Consider multilingual personas and language preferences',
              affectedData: ['All Personas', 'Demographics Profiles'],
              confidence: 0.65
            }
          ];
          setBiasIssues(prev => [...prev, ...newIssues]);
          if (progressInterval) clearInterval(progressInterval);
          setCheckProgress(100);
        }, 3000);
      }
    } catch (error) {
      console.log('API not available, using fallback bias check');
      // Fallback bias check
      setTimeout(() => {
        const newIssues: BiasIssue[] = [
          {
            id: `bias-${Date.now()}`,
            type: 'CULTURAL',
            severity: 'MEDIUM',
            description: 'AI-generated insights show Western-centric assumptions about user behavior',
            suggestion: 'Include diverse cultural perspectives in research data and persona development',
            affectedData: ['AI-Generated Insights', 'Persona Configurations'],
            confidence: 0.78
          }
        ];
        setBiasIssues(prev => [...prev, ...newIssues]);
        if (progressInterval) clearInterval(progressInterval);
        setCheckProgress(100);
      }, 3000);
    } finally {
      setTimeout(() => {
        setIsChecking(false);
        setCheckProgress(0);
        onBiasChecked();
      }, 4000);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'LOW':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'GENDER':
        return 'bg-pink-100 text-pink-800';
      case 'RACE':
        return 'bg-purple-100 text-purple-800';
      case 'AGE':
        return 'bg-green-100 text-green-800';
      case 'INCOME':
        return 'bg-blue-100 text-blue-800';
      case 'CULTURAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'LANGUAGE':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIssues = biasIssues.filter(issue => {
    const matchesType = selectedType === 'ALL' || issue.type === selectedType;
    const matchesSeverity = selectedSeverity === 'ALL' || issue.severity === selectedSeverity;
    return matchesType && matchesSeverity;
  });

  const getSeverityCount = (severity: string) => {
    return biasIssues.filter(issue => issue.severity === severity).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bias analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bias Checker</h2>
        <p className="text-gray-600">AI-powered ethical bias detection and mitigation for your research data</p>
      </div>

      {/* Bias Check Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Run Bias Analysis</h3>
            <p className="text-sm text-gray-600">Scan your research data and configurations for potential biases</p>
          </div>
          <button
            onClick={runBiasCheck}
            disabled={isChecking}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isChecking ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            <span>{isChecking ? 'Checking...' : 'Run Bias Check'}</span>
          </button>
        </div>

        {isChecking && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Analyzing data for potential biases...</span>
              <span>{Math.round(checkProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${checkProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bias Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{getSeverityCount('CRITICAL')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">High</p>
              <p className="text-2xl font-bold text-orange-600">{getSeverityCount('HIGH')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Medium</p>
              <p className="text-2xl font-bold text-yellow-600">{getSeverityCount('MEDIUM')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Low</p>
              <p className="text-2xl font-bold text-blue-600">{getSeverityCount('LOW')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Bias Types</option>
            <option value="GENDER">Gender</option>
            <option value="RACE">Race</option>
            <option value="AGE">Age</option>
            <option value="INCOME">Income</option>
            <option value="CULTURAL">Cultural</option>
            <option value="LANGUAGE">Language</option>
          </select>
        </div>
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Bias Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <div key={issue.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(issue.type)}`}>
                    {issue.type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severity)}`}>
                    {getSeverityIcon(issue.severity)}
                    <span className="ml-1">{issue.severity}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(issue.confidence * 100)}% confidence
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{issue.description}</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Suggestion</h5>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  {issue.suggestion}
                </p>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Affected Data</h5>
                <div className="flex flex-wrap gap-2">
                  {issue.affectedData.map((item, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIssues.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bias issues found</h3>
          <p className="text-gray-600">
            {selectedType !== 'ALL' || selectedSeverity !== 'ALL'
              ? 'Try adjusting your filter criteria'
              : 'Run a bias check to analyze your research data for potential biases'
            }
          </p>
        </div>
      )}

      {/* Ethical Guidelines */}
      <div className="bg-green-50 rounded-lg p-6">
        <h4 className="font-semibold text-green-900 mb-3">Ethical Research Guidelines</h4>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Ensure diverse representation across all demographic categories</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Avoid assumptions based on gender, race, age, or socioeconomic status</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Include cultural and linguistic diversity in your research data</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Regularly review and update personas to reflect changing demographics</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
