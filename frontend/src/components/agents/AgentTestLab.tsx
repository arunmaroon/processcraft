import React, { useState, useEffect } from 'react';
import { Send, RotateCcw, Play, Pause, BarChart3, MessageCircle, Brain, Target, Zap } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  demographics: any;
  personality?: any;
  communication_style?: any;
  psychological_profile?: any;
  financial_profile?: any;
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  responseTime?: number;
  qualityScore?: number;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  initialMessage: string;
  expectedBehaviors: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface AgentTestLabProps {
  selectedAgent: Agent | null;
  onTestComplete: (results: any) => void;
}

const AgentTestLab: React.FC<AgentTestLabProps> = ({ selectedAgent, onTestComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`test_${Date.now()}`);
  const [testMode, setTestMode] = useState<'chat' | 'scenario' | 'consistency'>('chat');
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null);
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [consistencyQuestions, setConsistencyQuestions] = useState<string[]>([]);
  const [consistencyAnswers, setConsistencyAnswers] = useState<Record<string, string[]>>({});

  const testScenarios: TestScenario[] = [
    {
      id: 'loan_application',
      name: 'Loan Application',
      description: 'Test agent response to loan application scenario',
      initialMessage: 'I need to apply for a personal loan of 5 lakhs. Can you help me understand the process?',
      expectedBehaviors: ['Asks about income', 'Discusses credit history', 'Explains requirements'],
      difficulty: 'medium'
    },
    {
      id: 'investment_advice',
      name: 'Investment Advice',
      description: 'Test agent response to investment queries',
      initialMessage: 'I have 2 lakhs to invest. What would you recommend for someone like me?',
      expectedBehaviors: ['Assesses risk tolerance', 'Asks about goals', 'Provides options'],
      difficulty: 'hard'
    },
    {
      id: 'financial_stress',
      name: 'Financial Stress',
      description: 'Test agent response to financial difficulties',
      initialMessage: 'I\'m struggling with my finances and don\'t know what to do. I feel overwhelmed.',
      expectedBehaviors: ['Shows empathy', 'Offers practical advice', 'Suggests resources'],
      difficulty: 'hard'
    },
    {
      id: 'technology_question',
      name: 'Technology Question',
      description: 'Test agent response to technology-related queries',
      initialMessage: 'I\'m not very tech-savvy. How do I use mobile banking safely?',
      expectedBehaviors: ['Explains simply', 'Provides step-by-step guidance', 'Addresses security concerns'],
      difficulty: 'easy'
    },
    {
      id: 'family_decision',
      name: 'Family Decision',
      description: 'Test agent response to family financial decisions',
      initialMessage: 'My family is considering buying a house. What factors should we consider?',
      expectedBehaviors: ['Considers family needs', 'Discusses affordability', 'Mentions long-term planning'],
      difficulty: 'medium'
    }
  ];

  const consistencyTestQuestions = [
    'What is your current occupation?',
    'How would you describe your risk tolerance?',
    'What are your main financial goals?',
    'How comfortable are you with technology?',
    'What is your preferred communication style?',
    'How do you typically make financial decisions?',
    'What are your biggest financial concerns?',
    'How do you prefer to receive financial advice?'
  ];

  useEffect(() => {
    if (testMode === 'consistency') {
      setConsistencyQuestions(consistencyTestQuestions);
      setConsistencyAnswers({});
    }
  }, [testMode]);

  const sendMessage = async (message: string) => {
    if (!selectedAgent || !message.trim()) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const startTime = Date.now();
      const response = await fetch(`/api/agents/${selectedAgent.id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          message,
          sessionId
        })
      });

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      if (data.success) {
        const agentMessage: Message = {
          id: `agent_${Date.now()}`,
          role: 'agent',
          content: data.response,
          timestamp: new Date(),
          responseTime,
          qualityScore: data.qualityScore
        };

        setMessages(prev => [...prev, agentMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const runScenario = async (scenario: TestScenario) => {
    setSelectedScenario(scenario);
    setIsRunningScenario(true);
    setMessages([]);
    setTestResults(null);

    // Send initial message
    await sendMessage(scenario.initialMessage);

    // Analyze response
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'agent') {
      const analysis = analyzeResponse(lastMessage.content, scenario.expectedBehaviors);
      setTestResults(analysis);
      onTestComplete(analysis);
    }

    setIsRunningScenario(false);
  };

  const analyzeResponse = (response: string, expectedBehaviors: string[]): any => {
    const foundBehaviors = expectedBehaviors.filter(behavior =>
      response.toLowerCase().includes(behavior.toLowerCase())
    );

    return {
      scenario: selectedScenario?.name,
      response,
      expectedBehaviors,
      foundBehaviors,
      behaviorScore: foundBehaviors.length / expectedBehaviors.length,
      responseLength: response.length,
      timestamp: new Date()
    };
  };

  const runConsistencyTest = async () => {
    const answers: Record<string, string[]> = {};
    
    for (const question of consistencyQuestions) {
      const responses: string[] = [];
      
      // Ask the same question 3 times with slight variations
      const variations = [
        question,
        question.replace('?', '? Please be specific.'),
        `To clarify: ${question}`
      ];

      for (const variation of variations) {
        await sendMessage(variation);
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'agent') {
          responses.push(lastMessage.content);
        }
        // Add delay between questions
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      answers[question] = responses;
    }

    setConsistencyAnswers(answers);
    
    // Analyze consistency
    const consistencyAnalysis = analyzeConsistency(answers);
    setTestResults(consistencyAnalysis);
    onTestComplete(consistencyAnalysis);
  };

  const analyzeConsistency = (answers: Record<string, string[]>): any => {
    const consistencyScores: Record<string, number> = {};
    
    Object.entries(answers).forEach(([question, responses]) => {
      if (responses.length < 2) {
        consistencyScores[question] = 0;
        return;
      }

      // Simple similarity check (in production, use more sophisticated NLP)
      const firstResponse = responses[0].toLowerCase();
      let similarity = 0;
      
      for (let i = 1; i < responses.length; i++) {
        const currentResponse = responses[i].toLowerCase();
        const commonWords = firstResponse.split(' ').filter(word => 
          currentResponse.includes(word) && word.length > 3
        );
        similarity += commonWords.length / Math.max(firstResponse.split(' ').length, 1);
      }
      
      consistencyScores[question] = similarity / (responses.length - 1);
    });

    const overallConsistency = Object.values(consistencyScores).reduce((sum, score) => sum + score, 0) / Object.keys(consistencyScores).length;

    return {
      type: 'consistency',
      consistencyScores,
      overallConsistency,
      answers,
      timestamp: new Date()
    };
  };

  const resetTest = () => {
    setMessages([]);
    setTestResults(null);
    setConsistencyAnswers({});
    setIsRunningScenario(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!selectedAgent) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Agent Selected</h3>
          <p className="text-gray-500">Select an agent from the library to start testing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Agent Test Lab</h2>
          <p className="text-gray-600">Testing agent: {selectedAgent.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetTest}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Test Mode Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Test Mode</h3>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'chat', label: 'Free Chat', icon: MessageCircle },
            { id: 'scenario', label: 'Scenarios', icon: Play },
            { id: 'consistency', label: 'Consistency', icon: Target }
          ].map((mode) => {
            const IconComponent = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setTestMode(mode.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  testMode === mode.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Selection */}
      {testMode === 'scenario' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Scenarios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                    {scenario.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                <button
                  onClick={() => runScenario(scenario)}
                  disabled={isRunningScenario}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isRunningScenario ? 'Running...' : 'Run Test'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consistency Test */}
      {testMode === 'consistency' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Consistency Test</h3>
          <p className="text-gray-600 mb-4">
            This test will ask the agent the same questions multiple times to check for consistency in responses.
          </p>
          <button
            onClick={runConsistencyTest}
            disabled={isRunningScenario}
            className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunningScenario ? 'Running Test...' : 'Start Consistency Test'}
          </button>
        </div>
      )}

      {/* Chat Interface */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Conversation</h3>
        </div>
        
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {testMode === 'chat' && 'Start a conversation with the agent'}
              {testMode === 'scenario' && 'Select a scenario to test'}
              {testMode === 'consistency' && 'Run the consistency test'}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    {message.responseTime && (
                      <span className="text-xs opacity-70">
                        {message.responseTime}ms
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span className="text-sm">Agent is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {testMode === 'chat' && (
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Results</h3>
          
          {testResults.type === 'consistency' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Consistency Score</span>
                <span className={`text-lg font-bold ${
                  testResults.overallConsistency > 0.7 ? 'text-green-600' : 
                  testResults.overallConsistency > 0.5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(testResults.overallConsistency * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="space-y-2">
                {Object.entries(testResults.consistencyScores).map(([question, score]) => (
                  <div key={question} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{question}</span>
                    <span className={`text-sm font-medium ${
                      score > 0.7 ? 'text-green-600' : 
                      score > 0.5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {(score * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Behavior Score</span>
                <span className={`text-lg font-bold ${
                  testResults.behaviorScore > 0.7 ? 'text-green-600' : 
                  testResults.behaviorScore > 0.5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {(testResults.behaviorScore * 100).toFixed(1)}%
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Expected Behaviors</h4>
                <div className="space-y-1">
                  {testResults.expectedBehaviors.map((behavior: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        testResults.foundBehaviors.includes(behavior) ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className="text-sm text-gray-600">{behavior}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentTestLab;
