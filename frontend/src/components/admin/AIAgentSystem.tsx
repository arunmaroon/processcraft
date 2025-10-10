import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Brain, 
  Upload, 
  Play, 
  RotateCcw, 
  Download,
  User,
  Zap,
  TestTube,
  FileText,
  Trash2
} from 'lucide-react';

interface PersonaProfile {
  name: string;
  demographics: {
    age: number;
    occupation: string;
    location: string;
    income: string;
    education: string;
  };
  character_behavior: {
    speech_style: string;
    personality_traits: string[];
    communication_preferences: string;
  };
  financial_attitudes: {
    risk_tolerance: 'LOW' | 'MEDIUM' | 'HIGH';
    investment_style: string;
    payment_preferences: string[];
    trust_factors: string[];
  };
  key_experiences: string[];
  pain_points: string[];
  goals: string[];
  transcript_snippets: string[];
}

interface AgentResponse {
  content: string;
  agentName: string;
  timestamp: string;
  confidence: number;
  emotions?: string[];
}

interface ChatMessage {
  role: 'human' | 'assistant';
  content: string;
  timestamp: string;
  agentName?: string;
}

export default function AIAgentSystem() {
  const [activeTab, setActiveTab] = useState<'personas' | 'chat' | 'test'>('personas');
  const [personas, setPersonas] = useState<PersonaProfile[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [selectedAgent1, setSelectedAgent1] = useState<string>('');
  const [selectedAgent2, setSelectedAgent2] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptInput, setTranscriptInput] = useState('');
  const [testQuestions, setTestQuestions] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/ai-agent-system/agents');
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const generatePersonasFromTranscript = async () => {
    if (!transcriptInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-agent-system/personas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcripts: [transcriptInput],
          filename: 'research_personas'
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setPersonas(data.personas);
        // Create agents for each persona
        for (const persona of data.personas) {
          await createAgent(persona);
        }
        loadAgents();
      }
    } catch (error) {
      console.error('Error generating personas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAgent = async (persona: PersonaProfile) => {
    try {
      const response = await fetch('/api/ai-agent-system/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona }),
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`Agent ${data.agentName} created successfully`);
      }
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  const startDualAgentChat = async () => {
    if (!selectedAgent1 || !selectedAgent2 || !inputMessage.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-agent-system/agents/dual-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent1Name: selectedAgent1,
          agent2Name: selectedAgent2,
          message: inputMessage,
          threadId: `chat_${Date.now()}`
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setChatMessages(data.messages);
        setInputMessage('');
      }
    } catch (error) {
      console.error('Error starting dual agent chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testAgent = async () => {
    if (!transcriptInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-agent-system/agents/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptInput,
          testQuestions: testQuestions.filter(q => q.trim())
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setTestResults(data.testResults);
        setPersonas([data.persona]);
      }
    } catch (error) {
      console.error('Error testing agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTestQuestion = () => {
    setTestQuestions([...testQuestions, '']);
  };

  const updateTestQuestion = (index: number, value: string) => {
    const updated = [...testQuestions];
    updated[index] = value;
    setTestQuestions(updated);
  };

  const removeTestQuestion = (index: number) => {
    const updated = testQuestions.filter((_, i) => i !== index);
    setTestQuestions(updated);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Agent System for User Persona Simulation
          </h1>
          <p className="text-gray-600">
            Create AI agents that mimic real users based on research transcripts
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'personas', label: 'Persona Generation', icon: Users },
                { id: 'chat', label: 'Dual Agent Chat', icon: MessageSquare },
                { id: 'test', label: 'Agent Testing', icon: TestTube },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Persona Generation Tab */}
        {activeTab === 'personas' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Generate Personas from Transcripts</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Research Transcript
                  </label>
                  <textarea
                    value={transcriptInput}
                    onChange={(e) => setTranscriptInput(e.target.value)}
                    placeholder="Paste your research transcript here..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <button
                  onClick={generatePersonasFromTranscript}
                  disabled={isLoading || !transcriptInput.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Brain className="w-4 h-4" />
                  <span>{isLoading ? 'Generating...' : 'Generate Personas'}</span>
                </button>
              </div>
            </div>

            {/* Generated Personas */}
            {personas.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Generated Personas</h3>
                <div className="space-y-4">
                  {personas.map((persona, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium">{persona.name}</h4>
                        <span className="text-sm text-gray-500">
                          {persona.demographics.age} years old, {persona.demographics.occupation}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Speech Style:</strong> {persona.character_behavior.speech_style}
                        </div>
                        <div>
                          <strong>Risk Tolerance:</strong> {persona.financial_attitudes.risk_tolerance}
                        </div>
                        <div>
                          <strong>Key Experiences:</strong>
                          <ul className="list-disc list-inside ml-2">
                            {persona.key_experiences.slice(0, 3).map((exp, i) => (
                              <li key={i}>{exp}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Pain Points:</strong>
                          <ul className="list-disc list-inside ml-2">
                            {persona.pain_points.slice(0, 3).map((pain, i) => (
                              <li key={i}>{pain}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dual Agent Chat Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Dual Agent Chat Simulation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent 1
                  </label>
                  <select
                    value={selectedAgent1}
                    onChange={(e) => setSelectedAgent1(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Agent 1</option>
                    {agents.map((agent) => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent 2
                  </label>
                  <select
                    value={selectedAgent2}
                    onChange={(e) => setSelectedAgent2(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Agent 2</option>
                    {agents.map((agent) => (
                      <option key={agent} value={agent}>{agent}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Enter a question or topic for the agents to discuss..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && startDualAgentChat()}
                />
                <button
                  onClick={startDualAgentChat}
                  disabled={isLoading || !selectedAgent1 || !selectedAgent2 || !inputMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={clearChat}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            {chatMessages.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Agent Conversation</h3>
                <div className="space-y-4">
                  {chatMessages.map((message, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {message.agentName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Agent Testing Tab */}
        {activeTab === 'test' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Agent with Sample Questions</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Research Transcript
                  </label>
                  <textarea
                    value={transcriptInput}
                    onChange={(e) => setTranscriptInput(e.target.value)}
                    placeholder="Paste your research transcript here..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Questions
                  </label>
                  <div className="space-y-2">
                    {testQuestions.map((question, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          value={question}
                          onChange={(e) => updateTestQuestion(index, e.target.value)}
                          placeholder={`Test question ${index + 1}...`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeTestQuestion(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addTestQuestion}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      + Add Test Question
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={testAgent}
                  disabled={isLoading || !transcriptInput.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <TestTube className="w-4 h-4" />
                  <span>{isLoading ? 'Testing...' : 'Test Agent'}</span>
                </button>
              </div>
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Test Results</h3>
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-2">
                        <strong>Question:</strong> {result.question}
                      </div>
                      {result.error ? (
                        <div className="text-red-600">
                          <strong>Error:</strong> {result.error}
                        </div>
                      ) : (
                        <div>
                          <div className="mb-2">
                            <strong>Response:</strong> {result.response}
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}




