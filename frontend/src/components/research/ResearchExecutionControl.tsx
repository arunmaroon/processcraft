import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, BarChart3, Users, Clock, Target, Brain, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { Project, ResearchData, Persona, Cohort } from '../../types';
import Button from '../shared/Button';

interface ResearchExecution {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  progress: number;
  currentPhase: string;
  startTime?: string;
  endTime?: string;
  participants: Participant[];
  sessions: ResearchSession[];
  realTimeInsights: Insight[];
  controls: ExecutionControls;
}

interface Participant {
  id: string;
  personaId: string;
  cohortId: string;
  status: 'waiting' | 'active' | 'completed' | 'dropped';
  responses: Response[];
  engagement: number;
  startTime?: string;
  endTime?: string;
}

interface ResearchSession {
  id: string;
  participantId: string;
  phase: string;
  startTime: string;
  endTime?: string;
  duration: number;
  responses: Response[];
  insights: string[];
  quality: number;
}

interface Response {
  id: string;
  questionId: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  timestamp: string;
  followUpNeeded: boolean;
}

interface Insight {
  id: string;
  type: 'pattern' | 'anomaly' | 'trend' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  participants: string[];
  timestamp: string;
  actionable: boolean;
}

interface ExecutionControls {
  autoPause: boolean;
  qualityThreshold: number;
  maxParticipants: number;
  sessionDuration: number;
  realTimeAnalysis: boolean;
  adaptiveQuestions: boolean;
  sentimentAnalysis: boolean;
  engagementTracking: boolean;
}

interface ResearchExecutionControlProps {
  project: Project;
  researchData: ResearchData;
  onExecutionUpdate: (execution: ResearchExecution) => void;
}

export default function ResearchExecutionControl({ 
  project, 
  researchData, 
  onExecutionUpdate 
}: ResearchExecutionControlProps) {
  const [execution, setExecution] = useState<ResearchExecution>({
    id: `exec-${Date.now()}`,
    status: 'idle',
    progress: 0,
    currentPhase: 'Setup',
    participants: [],
    sessions: [],
    realTimeInsights: [],
    controls: {
      autoPause: false,
      qualityThreshold: 0.7,
      maxParticipants: 50,
      sessionDuration: 60,
      realTimeAnalysis: true,
      adaptiveQuestions: true,
      sentimentAnalysis: true,
      engagementTracking: true
    }
  });

  const [showControls, setShowControls] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  // Simulate research execution
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (execution.status === 'running') {
      interval = setInterval(() => {
        setExecution(prev => {
          const newProgress = Math.min(prev.progress + Math.random() * 5, 100);
          const newStatus: 'idle' | 'running' | 'paused' | 'completed' | 'error' = newProgress >= 100 ? 'completed' : 'running';
          
          // Simulate participant responses
          const updatedParticipants = prev.participants.map(participant => {
            if (participant.status === 'active' && Math.random() > 0.7) {
              const newResponse: Response = {
                id: `resp-${Date.now()}-${Math.random()}`,
                questionId: `q-${Math.floor(Math.random() * 10)}`,
                text: generateMockResponse(),
                sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any,
                confidence: Math.random(),
                timestamp: new Date().toISOString(),
                followUpNeeded: Math.random() > 0.8
              };
              
              return {
                ...participant,
                responses: [...participant.responses, newResponse],
                engagement: Math.min(participant.engagement + Math.random() * 0.1, 1)
              };
            }
            return participant;
          });

          // Generate real-time insights
          const newInsights = [...prev.realTimeInsights];
          if (Math.random() > 0.9) {
            const insight: Insight = {
              id: `insight-${Date.now()}`,
              type: ['pattern', 'anomaly', 'trend', 'recommendation'][Math.floor(Math.random() * 4)] as any,
              title: generateInsightTitle(),
              description: generateInsightDescription(),
              confidence: Math.random(),
              participants: prev.participants.slice(0, Math.floor(Math.random() * 3)).map(p => p.id),
              timestamp: new Date().toISOString(),
              actionable: Math.random() > 0.5
            };
            newInsights.push(insight);
          }

          const updated = {
            ...prev,
            progress: newProgress,
            status: newStatus,
            participants: updatedParticipants,
            realTimeInsights: newInsights.slice(-10), // Keep only last 10 insights
            currentPhase: getCurrentPhase(newProgress)
          };

          onExecutionUpdate(updated);
          return updated;
        });
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [execution.status, onExecutionUpdate]);

  const startExecution = () => {
    // Initialize participants based on cohorts
    const participants: Participant[] = researchData.cohorts.flatMap(cohort => 
      Array.from({ length: Math.min(cohort.size, execution.controls.maxParticipants) }, (_, i) => ({
        id: `participant-${cohort.id}-${i}`,
        personaId: researchData.personas[Math.floor(Math.random() * researchData.personas.length)].id,
        cohortId: cohort.id,
        status: 'waiting' as const,
        responses: [],
        engagement: 0
      }))
    );

    setExecution(prev => ({
      ...prev,
      status: 'running',
      progress: 0,
      participants,
      startTime: new Date().toISOString(),
      currentPhase: 'Initialization'
    }));
  };

  const pauseExecution = () => {
    setExecution(prev => ({
      ...prev,
      status: 'paused',
      currentPhase: 'Paused'
    }));
  };

  const resumeExecution = () => {
    setExecution(prev => ({
      ...prev,
      status: 'running',
      currentPhase: getCurrentPhase(prev.progress)
    }));
  };

  const stopExecution = () => {
    setExecution(prev => ({
      ...prev,
      status: 'completed',
      progress: 100,
      endTime: new Date().toISOString(),
      currentPhase: 'Completed'
    }));
  };

  const resetExecution = () => {
    setExecution(prev => ({
      ...prev,
      status: 'idle',
      progress: 0,
      participants: [],
      sessions: [],
      realTimeInsights: [],
      startTime: undefined,
      endTime: undefined,
      currentPhase: 'Setup'
    }));
  };

  const updateControls = (updates: Partial<ExecutionControls>) => {
    setExecution(prev => ({
      ...prev,
      controls: { ...prev.controls, ...updates }
    }));
  };

  const getCurrentPhase = (progress: number): string => {
    if (progress < 20) return 'Initialization';
    if (progress < 40) return 'Warm-up Questions';
    if (progress < 60) return 'Main Research';
    if (progress < 80) return 'Deep Dive';
    if (progress < 100) return 'Wrap-up';
    return 'Completed';
  };

  const generateMockResponse = (): string => {
    const responses = [
      "I find this interface quite intuitive and easy to navigate.",
      "The design is clean but I'm having trouble finding the main features.",
      "This is exactly what I was looking for - very user-friendly.",
      "I'm confused about the pricing structure, it's not clear to me.",
      "The mobile version works great, much better than the desktop.",
      "I would definitely recommend this to my colleagues.",
      "The onboarding process was too long and complicated.",
      "I love the visual design and color scheme.",
      "I'm not sure if this meets my specific needs.",
      "The customer support seems responsive and helpful."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateInsightTitle = (): string => {
    const titles = [
      "High Engagement in Mobile Users",
      "Pricing Confusion Pattern Detected",
      "Positive Sentiment Trend",
      "Navigation Issues Identified",
      "Feature Request Pattern",
      "Onboarding Drop-off Point",
      "Satisfaction Score Improvement",
      "Accessibility Concern Raised"
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const generateInsightDescription = (): string => {
    const descriptions = [
      "Users show 85% higher engagement when using mobile interface compared to desktop.",
      "Multiple participants expressed confusion about pricing tiers and value proposition.",
      "Sentiment analysis shows positive trend with 78% positive responses in last 10 minutes.",
      "Navigation issues identified in 3 out of 5 participants, particularly with secondary features.",
      "Consistent request for advanced filtering options across different user segments.",
      "Significant drop-off rate at step 3 of onboarding process (45% abandonment).",
      "Overall satisfaction scores increased by 23% compared to baseline measurements.",
      "Accessibility concerns raised regarding color contrast and screen reader compatibility."
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Execution Control</h3>
        <p className="text-gray-600">Monitor and control your AI-powered research execution in real-time</p>
      </div>

      {/* Execution Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(execution.status)}`}>
              <div className="flex items-center space-x-2">
                {getStatusIcon(execution.status)}
                <span className="capitalize">{execution.status}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Phase: {execution.currentPhase}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Controls
            </Button>
            {execution.status === 'idle' && (
              <Button
                onClick={startExecution}
                leftIcon={<Play className="w-4 h-4" />}
              >
                Start Research
              </Button>
            )}
            {execution.status === 'running' && (
              <Button
                variant="outline"
                onClick={pauseExecution}
                leftIcon={<Pause className="w-4 h-4" />}
              >
                Pause
              </Button>
            )}
            {execution.status === 'paused' && (
              <Button
                onClick={resumeExecution}
                leftIcon={<Play className="w-4 h-4" />}
              >
                Resume
              </Button>
            )}
            {(execution.status === 'running' || execution.status === 'paused') && (
              <Button
                variant="outline"
                onClick={stopExecution}
                leftIcon={<CheckCircle className="w-4 h-4" />}
              >
                Complete
              </Button>
            )}
            {execution.status === 'completed' && (
              <Button
                variant="outline"
                onClick={resetExecution}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{Math.round(execution.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${execution.progress}%` }}
            />
          </div>
        </div>

        {/* Execution Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Participants</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{execution.participants.length}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Sessions</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{execution.sessions.length}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Insights</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{execution.realTimeInsights.length}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Duration</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {execution.startTime ? 
                Math.round((Date.now() - new Date(execution.startTime).getTime()) / 60000) : 0}m
            </div>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      {showControls && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Execution Controls</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
              <input
                type="number"
                value={execution.controls.maxParticipants}
                onChange={(e) => updateControls({ maxParticipants: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Duration (min)</label>
              <input
                type="number"
                value={execution.controls.sessionDuration}
                onChange={(e) => updateControls({ sessionDuration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="5"
                max="180"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality Threshold</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={execution.controls.qualityThreshold}
                onChange={(e) => updateControls({ qualityThreshold: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{Math.round(execution.controls.qualityThreshold * 100)}%</div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={execution.controls.realTimeAnalysis}
                  onChange={(e) => updateControls({ realTimeAnalysis: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Real-time Analysis</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={execution.controls.adaptiveQuestions}
                  onChange={(e) => updateControls({ adaptiveQuestions: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Adaptive Questions</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={execution.controls.sentimentAnalysis}
                  onChange={(e) => updateControls({ sentimentAnalysis: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Sentiment Analysis</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Insights */}
      {execution.realTimeInsights.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Real-time Insights
          </h4>
          <div className="space-y-3">
            {execution.realTimeInsights.slice(-5).reverse().map((insight) => (
              <div key={insight.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{insight.title}</h5>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.type === 'pattern' ? 'bg-blue-100 text-blue-800' :
                      insight.type === 'anomaly' ? 'bg-red-100 text-red-800' :
                      insight.type === 'trend' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {insight.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(insight.confidence * 100)}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{insight.participants.length} participants</span>
                  <span>{new Date(insight.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants Overview */}
      {execution.participants.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Participants</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {execution.participants.slice(0, 6).map((participant) => (
              <div key={participant.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Participant {participant.id.split('-')[2]}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    participant.status === 'active' ? 'bg-green-100 text-green-800' :
                    participant.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    participant.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {participant.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Responses: {participant.responses.length}
                </div>
                <div className="text-sm text-gray-600">
                  Engagement: {Math.round(participant.engagement * 100)}%
                </div>
              </div>
            ))}
            {execution.participants.length > 6 && (
              <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-center">
                <span className="text-sm text-gray-500">
                  +{execution.participants.length - 6} more participants
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
