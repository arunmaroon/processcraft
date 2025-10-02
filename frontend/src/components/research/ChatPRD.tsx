import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RefreshCw, CheckCircle, Edit3, Download } from 'lucide-react';
import { Project, PRD } from '../../types';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

interface ChatPRDProps {
  project: Project;
  prd?: PRD;
  onPRDGenerated: (prd: PRD) => void;
  onPRDFinalized: (prd: PRD) => void;
}

export default function ChatPRD({ project, prd, onPRDGenerated, onPRDFinalized }: ChatPRDProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPRD, setGeneratedPRD] = useState<string>('');
  const [showPRDPreview, setShowPRDPreview] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'assistant',
        content: `Hello! I'm here to help you create a comprehensive Product Requirements Document (PRD) for "${project.name}". 

Let me ask you a few questions to understand your requirements better:

1. **What is the main problem your product solves?** (e.g., "Users struggle with managing their finances on mobile")

2. **Who are your target users?** (e.g., "Young professionals aged 25-35 who want to invest")

3. **What are the key features you want to include?** (e.g., "Account management, investment tracking, notifications")

4. **What platforms will this support?** (e.g., "Mobile app for iOS and Android")

5. **What are your success metrics?** (e.g., "10,000 active users in 6 months")

Please provide as much detail as you can, and I'll create a detailed PRD for you!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [project.name]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    try {
      // Call the chat API
      const response = await fetch('/api/prd-generation/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          project: project,
          prd: prd
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.content,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        // If PRD is generated, show preview
        if (data.prdGenerated) {
          setGeneratedPRD(data.prdContent);
          setShowPRDPreview(true);
          setConversationComplete(true);
        }
      } else {
        throw new Error(data.error || 'Failed to generate response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const regeneratePRD = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/prd-generation/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages,
          project: project,
          prd: prd
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedPRD(data.content);
      } else {
        throw new Error(data.error || 'Failed to regenerate PRD');
      }
    } catch (error) {
      console.error('Error regenerating PRD:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const finalizePRD = () => {
    if (!generatedPRD) return;

    const finalPRD: PRD = {
      id: `prd-${Date.now()}`,
      objectives: extractObjectives(generatedPRD),
      targetUsers: extractTargetUsers(generatedPRD),
      successMetrics: extractSuccessMetrics(generatedPRD),
      businessContext: extractBusinessContext(generatedPRD),
      constraints: extractConstraints(generatedPRD),
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generatedContent: {
        content: generatedPRD,
        messages: messages
      }
    };

    onPRDFinalized(finalPRD);
  };

  const extractObjectives = (content: string): string[] => {
    // Extract objectives from PRD content
    const objectivesMatch = content.match(/## Objectives?\s*\n(.*?)(?=\n##|\n###|$)/s);
    if (objectivesMatch) {
      return objectivesMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(line => line.length > 0);
    }
    return [];
  };

  const extractTargetUsers = (content: string): string[] => {
    // Extract target users from PRD content
    const usersMatch = content.match(/## Target Users?\s*\n(.*?)(?=\n##|\n###|$)/s);
    if (usersMatch) {
      return usersMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(line => line.length > 0);
    }
    return [];
  };

  const extractSuccessMetrics = (content: string): string[] => {
    // Extract success metrics from PRD content
    const metricsMatch = content.match(/## Success Metrics?\s*\n(.*?)(?=\n##|\n###|$)/s);
    if (metricsMatch) {
      return metricsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(line => line.length > 0);
    }
    return [];
  };

  const extractBusinessContext = (content: string): string => {
    // Extract business context from PRD content
    const contextMatch = content.match(/## Business Context\s*\n(.*?)(?=\n##|\n###|$)/s);
    return contextMatch ? contextMatch[1].trim() : '';
  };

  const extractConstraints = (content: string): string[] => {
    // Extract constraints from PRD content
    const constraintsMatch = content.match(/## Constraints?\s*\n(.*?)(?=\n##|\n###|$)/s);
    if (constraintsMatch) {
      return constraintsMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(line => line.length > 0);
    }
    return [];
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">PRD Chat Assistant</h2>
            <p className="text-sm text-gray-500">Creating PRD for {project.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {showPRDPreview && (
            <>
              <button
                onClick={regeneratePRD}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
              <button
                onClick={finalizePRD}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finalize PRD</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-gray-600 ml-3' 
                  : 'bg-blue-600 mr-3'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div className={`flex-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-4 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-blue-50 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.isGenerating && (
                    <div className="flex items-center space-x-1 mt-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
                <div className={`text-xs text-gray-500 mt-1 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="flex max-w-3xl flex-row">
              <div className="w-8 h-8 rounded-full bg-blue-600 mr-3 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="inline-block p-4 rounded-lg bg-blue-50">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="ml-2 text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* PRD Preview */}
      {showPRDPreview && generatedPRD && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Generated PRD Preview</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPRDPreview(!showPRDPreview)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                {showPRDPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
              {generatedPRD}
            </pre>
          </div>
        </div>
      )}

      {/* Input */}
      {!conversationComplete && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isGenerating}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isGenerating}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}








