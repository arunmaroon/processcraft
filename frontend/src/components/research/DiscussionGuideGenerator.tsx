import React, { useState, useEffect } from 'react';
import { FileText, Play, Pause, RotateCcw, Sparkles, Brain, Settings, Download, Eye, Edit3, Plus, Trash2 } from 'lucide-react';
import { Project, Persona, Cohort } from '../../types';
import Button from '../shared/Button';

interface DiscussionGuide {
  id: string;
  title: string;
  description: string;
  methodology: string;
  duration: string;
  sections: GuideSection[];
  createdAt: string;
  updatedAt: string;
}

interface GuideSection {
  id: string;
  title: string;
  duration: number; // minutes
  questions: Question[];
  objectives: string[];
  notes: string;
}

interface Question {
  id: string;
  text: string;
  type: 'open' | 'closed' | 'follow-up' | 'probe';
  category: 'warm-up' | 'main' | 'wrap-up';
  personaTarget?: string;
  expectedResponse: string;
  followUps: string[];
}

interface DiscussionGuideGeneratorProps {
  project: Project;
  personas: Persona[];
  cohorts: Cohort[];
  onGuideGenerated: (guide: DiscussionGuide) => void;
}

export default function DiscussionGuideGenerator({ 
  project, 
  personas, 
  cohorts, 
  onGuideGenerated 
}: DiscussionGuideGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [guide, setGuide] = useState<DiscussionGuide | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [generationConfig, setGenerationConfig] = useState({
    methodology: 'semi-structured',
    duration: '60',
    focusAreas: ['usability', 'satisfaction', 'needs'],
    customPrompts: '',
    includePersonaQuestions: true,
    includeFollowUps: true
  });

  const generateDiscussionGuide = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/research/generate-discussion-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: project,
          personas: personas,
          cohorts: cohorts,
          config: generationConfig
        })
      });

      if (response.ok) {
        const generatedGuide = await response.json();
        setGuide(generatedGuide);
        onGuideGenerated(generatedGuide);
      }
    } catch (error) {
      console.error('Error generating discussion guide:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSection = (sectionId: string, updates: Partial<GuideSection>) => {
    if (!guide) return;
    
    setGuide(prev => ({
      ...prev!,
      sections: prev!.sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  };

  const addQuestion = (sectionId: string) => {
    if (!guide) return;
    
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      type: 'open',
      category: 'main',
      expectedResponse: '',
      followUps: []
    };

    updateSection(sectionId, {
      questions: [...guide.sections.find(s => s.id === sectionId)!.questions, newQuestion]
    });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    if (!guide) return;
    
    const section = guide.sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedQuestions = section.questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    );

    updateSection(sectionId, { questions: updatedQuestions });
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    if (!guide) return;
    
    const section = guide.sections.find(s => s.id === sectionId);
    if (!section) return;

    const updatedQuestions = section.questions.filter(q => q.id !== questionId);
    updateSection(sectionId, { questions: updatedQuestions });
  };

  const exportGuide = () => {
    if (!guide) return;
    
    const content = generateMarkdownGuide(guide);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMarkdownGuide = (guide: DiscussionGuide): string => {
    let markdown = `# ${guide.title}\n\n`;
    markdown += `**Description:** ${guide.description}\n\n`;
    markdown += `**Methodology:** ${guide.methodology}\n`;
    markdown += `**Duration:** ${guide.duration} minutes\n\n`;
    markdown += `---\n\n`;

    guide.sections.forEach((section, index) => {
      markdown += `## ${index + 1}. ${section.title}\n\n`;
      markdown += `**Duration:** ${section.duration} minutes\n`;
      markdown += `**Objectives:** ${section.objectives.join(', ')}\n\n`;
      
      if (section.notes) {
        markdown += `**Notes:** ${section.notes}\n\n`;
      }

      section.questions.forEach((question, qIndex) => {
        markdown += `### ${qIndex + 1}. ${question.text}\n`;
        markdown += `**Type:** ${question.type} | **Category:** ${question.category}\n`;
        
        if (question.personaTarget) {
          markdown += `**Target Persona:** ${question.personaTarget}\n`;
        }
        
        if (question.expectedResponse) {
          markdown += `**Expected Response:** ${question.expectedResponse}\n`;
        }
        
        if (question.followUps.length > 0) {
          markdown += `**Follow-up Questions:**\n`;
          question.followUps.forEach(followUp => {
            markdown += `- ${followUp}\n`;
          });
        }
        
        markdown += `\n`;
      });
      
      markdown += `---\n\n`;
    });

    return markdown;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Discussion Guide Generator</h3>
        <p className="text-gray-600">Generate comprehensive discussion guides tailored to your personas and research objectives</p>
      </div>

      {/* Generation Configuration */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">Guide Configuration</h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Methodology</label>
            <select
              value={generationConfig.methodology}
              onChange={(e) => setGenerationConfig(prev => ({ ...prev, methodology: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="semi-structured">Semi-structured</option>
              <option value="structured">Structured</option>
              <option value="unstructured">Unstructured</option>
              <option value="mixed">Mixed Methods</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <select
              value={generationConfig.duration}
              onChange={(e) => setGenerationConfig(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Focus Areas</label>
            <div className="space-y-1">
              {['usability', 'satisfaction', 'needs', 'pain-points', 'preferences'].map(area => (
                <label key={area} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={generationConfig.focusAreas.includes(area)}
                    onChange={(e) => {
                      const areas = e.target.checked
                        ? [...generationConfig.focusAreas, area]
                        : generationConfig.focusAreas.filter(a => a !== area);
                      setGenerationConfig(prev => ({ ...prev, focusAreas: areas }));
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 capitalize">{area.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
            <div className="space-y-1">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={generationConfig.includePersonaQuestions}
                  onChange={(e) => setGenerationConfig(prev => ({ ...prev, includePersonaQuestions: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Persona-specific questions</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={generationConfig.includeFollowUps}
                  onChange={(e) => setGenerationConfig(prev => ({ ...prev, includeFollowUps: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Follow-up questions</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={generateDiscussionGuide}
            disabled={isGenerating}
            leftIcon={isGenerating ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          >
            {isGenerating ? 'Generating...' : 'Generate Discussion Guide'}
          </Button>
          {guide && (
            <Button
              variant="outline"
              onClick={exportGuide}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Guide
            </Button>
          )}
        </div>
      </div>

      {/* Generated Guide */}
      {guide && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">{guide.title}</h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                leftIcon={<Eye className="w-4 h-4" />}
              >
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportGuide}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Export
              </Button>
            </div>
          </div>

          <p className="text-gray-600 mb-4">{guide.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Methodology</div>
              <div className="text-sm text-gray-600 capitalize">{guide.methodology}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Duration</div>
              <div className="text-sm text-gray-600">{guide.duration} minutes</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Sections</div>
              <div className="text-sm text-gray-600">{guide.sections.length} sections</div>
            </div>
          </div>

          {/* Guide Sections */}
          <div className="space-y-6">
            {guide.sections.map((section, sectionIndex) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-900">
                    {sectionIndex + 1}. {section.title}
                  </h5>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">{section.duration} min</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                      leftIcon={<Edit3 className="w-3 h-3" />}
                    >
                      {editingSection === section.id ? 'Done' : 'Edit'}
                    </Button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">Objectives:</div>
                  <div className="text-sm text-gray-600">{section.objectives.join(', ')}</div>
                </div>

                {section.notes && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Notes:</div>
                    <div className="text-sm text-gray-600">{section.notes}</div>
                  </div>
                )}

                {/* Questions */}
                <div className="space-y-3">
                  {section.questions.map((question, questionIndex) => (
                    <div key={question.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">
                            {questionIndex + 1}. {question.text}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="capitalize">{question.type}</span>
                            <span className="capitalize">{question.category}</span>
                            {question.personaTarget && (
                              <span>Target: {question.personaTarget}</span>
                            )}
                          </div>
                        </div>
                        {editingSection === section.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(section.id, question.id)}
                            leftIcon={<Trash2 className="w-3 h-3" />}
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      {question.expectedResponse && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Expected:</strong> {question.expectedResponse}
                        </div>
                      )}

                      {question.followUps.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <strong>Follow-ups:</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {question.followUps.map((followUp, index) => (
                              <li key={index}>{followUp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}

                  {editingSection === section.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addQuestion(section.id)}
                      leftIcon={<Plus className="w-3 h-3" />}
                    >
                      Add Question
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && guide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Guide Preview</h3>
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Close
              </Button>
            </div>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm">
                {generateMarkdownGuide(guide)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
