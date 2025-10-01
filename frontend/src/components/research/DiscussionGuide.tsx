import React, { useState, useEffect } from 'react';
import { MessageSquare, Brain, CheckCircle, Loader2, Edit3, Save, X } from 'lucide-react';

interface DiscussionGuideProps {
  researchPlan: any;
  prdData?: any;
  onGuideGenerated: (guide: any) => void;
  onGuideCompleted: (guide?: any) => void;
  initialGuide?: any;
}

interface DiscussionGuideData {
  title: string;
  projectName: string;
  objectives: string[];
  methodology: string;
  introduction: string;
  moderatorNotes: string[];
  sessionFlow: string[];
  questions: Array<{
    id: string;
    section: string;
    question: string;
    followUp: string;
    category: string;
    objectives: string[];
  }>;
  activities: Array<{
    id: string;
    name: string;
    description: string;
    duration: string;
    materials: string[];
  }>;
  generatedAt: string;
}

const DiscussionGuide: React.FC<DiscussionGuideProps> = ({ 
  researchPlan, 
  prdData,
  onGuideGenerated,
  onGuideCompleted,
  initialGuide
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [guideData, setGuideData] = useState<DiscussionGuideData | null>(initialGuide || null);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editPromptText, setEditPromptText] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const generateGuide = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/research/discussion-guide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          researchPlan,
          prdData,
          userPrompt: userPrompt || 'Generate a comprehensive discussion guide based on PRD and Research Plan'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate discussion guide');
      }

      const data = await response.json();
      setGuideData(data);
      onGuideGenerated(data);
      setIsEditing(true); // Allow editing after generation
    } catch (error) {
      console.error('Error generating discussion guide:', error);
      // Generate fallback guide if API fails
      const fallbackGuide = generateFallbackGuide();
      setGuideData(fallbackGuide);
      onGuideGenerated(fallbackGuide);
      setIsEditing(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditField = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(Array.isArray(currentValue) ? currentValue.join('\n') : currentValue || '');
  };

  const handleSaveField = () => {
    if (!guideData || !editingField) return;

    const updatedGuide = { ...guideData };
    const value = editingField.includes('[]') ? editValue.split('\n').filter(line => line.trim()) : editValue;

    if (editingField.includes('.')) {
      const [parent, child] = editingField.split('.');
      updatedGuide[parent as keyof DiscussionGuideData] = {
        ...(updatedGuide[parent as keyof DiscussionGuideData] as any),
        [child]: value
      };
    } else {
      (updatedGuide as any)[editingField] = value;
    }

    setGuideData(updatedGuide);
    setEditingField(null);
    setEditValue('');
  };

  const handleFinalize = () => {
    setIsFinalized(true);
    setIsEditing(false);
    onGuideCompleted(guideData);
  };

  const handleAddQuestion = () => {
    if (!guideData) return;

    const newQuestion = {
      id: (guideData.questions.length + 1).toString(),
      section: 'Custom',
      question: 'New question',
      followUp: 'Follow-up question',
      category: 'Custom',
      objectives: ['Custom objective']
    };

    setGuideData({
      ...guideData,
      questions: [...guideData.questions, newQuestion]
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!guideData) return;

    setGuideData({
      ...guideData,
      questions: guideData.questions.filter(q => q.id !== questionId)
    });
  };

  const generateFallbackGuide = (): DiscussionGuideData => {
    const projectName = prdData?.name || researchPlan?.projectName || 'Product Research';
    const objectives = prdData?.objectives || researchPlan?.objectives || ['Understand user needs', 'Validate product concept'];
    
    return {
      title: `Discussion Guide - ${projectName}`,
      projectName,
      objectives,
      methodology: 'Semi-structured interviews with target users',
      introduction: `This discussion guide is designed to understand user needs, behaviors, and preferences related to ${projectName}. The session will last approximately 60-90 minutes and will cover various aspects of the product concept.`,
      moderatorNotes: [
        'Ensure all participants are comfortable and understand the purpose',
        'Maintain a neutral stance and avoid leading questions',
        'Encourage all participants to share their thoughts',
        'Take detailed notes on both verbal and non-verbal responses',
        'Follow up on interesting insights with probing questions'
      ],
      sessionFlow: [
        'Introduction and warm-up (10 minutes)',
        'Background and context gathering (15 minutes)',
        'Product concept exploration (30 minutes)',
        'Feature evaluation and feedback (20 minutes)',
        'Closing and next steps (10 minutes)'
      ],
      questions: [
        {
          id: '1',
          section: 'Introduction',
          question: 'Could you please introduce yourself and tell us a bit about your background?',
          followUp: 'What do you do for work? What are your main interests and hobbies?',
          category: 'Demographics',
          objectives: ['Build rapport', 'Understand participant background']
        },
        {
          id: '2',
          section: 'Background',
          question: 'Tell us about your current experience with [product category]?',
          followUp: 'What tools or services do you currently use? What do you like or dislike about them?',
          category: 'Current State',
          objectives: ['Understand current behavior', 'Identify pain points']
        },
        {
          id: '3',
          section: 'Needs & Goals',
          question: 'What are your main goals when using [product category]?',
          followUp: 'What challenges do you face in achieving these goals?',
          category: 'User Needs',
          objectives: ['Identify user needs', 'Understand motivations']
        },
        {
          id: '4',
          section: 'Concept Introduction',
          question: 'I\'d like to show you a concept for a new [product type]. What are your first thoughts?',
          followUp: 'What do you like about this concept? What concerns do you have?',
          category: 'Concept Evaluation',
          objectives: ['Gather initial reactions', 'Understand appeal']
        },
        {
          id: '5',
          section: 'Feature Evaluation',
          question: 'Let\'s look at the key features. Which ones are most important to you?',
          followUp: 'How would you use this feature in your daily life?',
          category: 'Feature Assessment',
          objectives: ['Prioritize features', 'Understand usage scenarios']
        },
        {
          id: '6',
          section: 'Comparison',
          question: 'How does this compare to what you currently use?',
          followUp: 'What would make you switch to this product?',
          category: 'Competitive Analysis',
          objectives: ['Understand competitive landscape', 'Identify switching factors']
        },
        {
          id: '7',
          section: 'Closing',
          question: 'If this product were available today, would you use it? Why or why not?',
          followUp: 'What would need to change for you to definitely use it?',
          category: 'Purchase Intent',
          objectives: ['Assess purchase intent', 'Identify barriers']
        }
      ],
      activities: [
        {
          id: '1',
          name: 'Concept Walkthrough',
          description: 'Present the product concept and gather initial reactions',
          duration: '15 minutes',
          materials: ['Product mockups', 'Feature descriptions']
        },
        {
          id: '2',
          name: 'Feature Prioritization',
          description: 'Ask participants to rank features by importance',
          duration: '10 minutes',
          materials: ['Feature cards', 'Sticky notes']
        },
        {
          id: '3',
          name: 'Scenario Mapping',
          description: 'Map out how participants would use the product in real scenarios',
          duration: '15 minutes',
          materials: ['Scenario templates', 'Whiteboard']
        }
      ],
      generatedAt: new Date().toISOString()
    };
  };

  const handleQuestionEdit = (questionId: string, currentText: string) => {
    setEditingQuestion(questionId);
    setEditQuestionText(currentText);
  };

  const handleQuestionSave = (questionId: string) => {
    if (guideData) {
      const updatedGuide = {
        ...guideData,
        questions: guideData.questions.map(q =>
          q.id === questionId ? { ...q, question: editQuestionText } : q
        )
      };
      setGuideData(updatedGuide);
      onGuideGenerated(updatedGuide);
    }
    setEditingQuestion(null);
  };

  const handlePromptEdit = (promptId: string, currentText: string) => {
    setEditingPrompt(promptId);
    setEditPromptText(currentText);
  };

  const handlePromptSave = (promptId: string) => {
    if (guideData) {
      const updatedGuide = {
        ...guideData,
        prompts: guideData.prompts.map(p =>
          p.id === promptId ? { ...p, prompt: editPromptText } : p
        )
      };
      setGuideData(updatedGuide);
      onGuideGenerated(updatedGuide);
    }
    setEditingPrompt(null);
  };

  const handleCompleted = () => {
    console.log('DiscussionGuide handleCompleted clicked');
    const guideToUse = guideData || {
      title: 'Discussion Guide',
      introduction: 'Generated discussion guide',
      questions: [{ id: '1', question: 'What are your main challenges?', followUp: 'Can you elaborate?', category: 'Challenges' }],
      prompts: [{ id: '1', prompt: 'Tell me about your experience', context: 'Understanding user experience' }],
      generatedAt: new Date().toISOString()
    };
    
    console.log('Calling onGuideGenerated and onGuideCompleted');
    onGuideGenerated(guideToUse);
    onGuideCompleted(guideToUse);
  };

    return (
    <div className="space-y-6" style={{ maxWidth: '100vw' }}>
      {/* Generate Guide Button */}
      {!guideData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Generate Discussion Guide</h3>
                <p className="text-sm text-gray-500">Create a comprehensive guide for conducting interviews and focus groups</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* User Prompt Input */}
            <div className="space-y-4">
              <div>
                <label htmlFor="userPrompt" className="block text-sm font-medium text-gray-700 mb-2">
                  What specific aspects would you like to explore in your research? *
                </label>
                <textarea
                  id="userPrompt"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="e.g., User pain points with current workflow, feature preferences, usability issues, satisfaction levels, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                  rows={3}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Provide specific details about what you want to learn from your research participants.
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={generateGuide}
                  disabled={isGenerating || !userPrompt.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors shadow-sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Guide with AI...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      <span>Generate Discussion Guide</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Always show completion button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 text-center">
          <button
            onClick={handleCompleted}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 mx-auto transition-colors shadow-sm"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Complete Discussion Guide & Continue</span>
          </button>
        </div>
      </div>

      {/* Generated Guide Display */}
      {guideData && (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isFinalized ? 'bg-green-100' : isEditing ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  <MessageSquare className={`w-6 h-6 ${
                    isFinalized ? 'text-green-600' : isEditing ? 'text-blue-600' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{guideData.title}</h3>
                  <p className="text-sm text-gray-500">
                    Generated on {new Date(guideData.generatedAt).toLocaleDateString()}
                    {isFinalized && ' • Finalized'}
                    {isEditing && ' • Editing Mode'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {!isFinalized && (
                  <>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                        isEditing 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{isEditing ? 'View Mode' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={generateGuide}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2 transition-colors"
                    >
                      <Brain className="w-4 h-4" />
                      <span>Regenerate</span>
                    </button>
                    <button
                      onClick={handleFinalize}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Finalize</span>
                    </button>
                  </>
                )}
                <button
                  onClick={handleCompleted}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Completed - Move to Setup</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">

          {/* Project Overview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">Project Overview</h4>
              {isEditing && (
                <button
                  onClick={() => handleEditField('title', guideData.title)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-blue-900">
                  {editingField === 'projectName' ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveField}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveField()}
                      className="bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    guideData.projectName
                  )}
                </h5>
                {isEditing && editingField !== 'projectName' && (
                  <button
                    onClick={() => handleEditField('projectName', guideData.projectName)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-blue-800">Objectives:</span>
                  {editingField === 'objectives[]' ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveField}
                      className="w-full mt-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:border-blue-500"
                      rows={3}
                    />
                  ) : (
                    <ul className="list-disc list-inside text-blue-700 ml-2">
                      {guideData.objectives?.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      )) || []}
                    </ul>
                  )}
                  {isEditing && editingField !== 'objectives[]' && (
                    <button
                      onClick={() => handleEditField('objectives[]', guideData.objectives)}
                      className="text-blue-600 hover:text-blue-800 ml-2"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <span className="font-medium text-blue-800">Methodology:</span>
                  {editingField === 'methodology' ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveField}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveField()}
                      className="ml-2 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-blue-700 ml-2">{guideData.methodology}</span>
                  )}
                  {isEditing && editingField !== 'methodology' && (
                    <button
                      onClick={() => handleEditField('methodology', guideData.methodology)}
                      className="text-blue-600 hover:text-blue-800 ml-2"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-start justify-between">
              {editingField === 'introduction' ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleSaveField}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{guideData.introduction}</p>
              )}
              {isEditing && editingField !== 'introduction' && (
                <button
                  onClick={() => handleEditField('introduction', guideData.introduction)}
                  className="text-blue-600 hover:text-blue-800 ml-2 mt-1"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Moderator Notes */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Notes to the Moderator</h4>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="space-y-2">
                {guideData.moderatorNotes?.map((note, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-600 mr-2">•</span>
                    <span className="text-yellow-800">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Session Flow */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Session Flow</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ol className="space-y-2">
                {guideData.sessionFlow?.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2 font-medium">{index + 1}.</span>
                    <span className="text-green-800">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Questions */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Discussion Questions</h4>
              {isEditing && (
                <button
                  onClick={handleAddQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm"
                >
                  <span>+</span>
                  <span>Add Question</span>
                </button>
              )}
            </div>
            <div className="space-y-6">
              {guideData.questions?.map((question, index) => (
                <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium w-fit">
                          {question.section}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs w-fit">
                          {question.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {isEditing && (
                        <>
                          <button
                            onClick={() => handleQuestionEdit(question.id, question.question)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit question"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete question"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                
                  {editingQuestion === question.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editQuestionText}
                        onChange={(e) => setEditQuestionText(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleQuestionSave(question.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center space-x-2 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingQuestion(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 flex items-center space-x-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-900 font-medium mb-2">Main Question:</p>
                        <p className="text-gray-700">{question.question}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm font-medium mb-1">Follow-up:</p>
                        <p className="text-gray-600 text-sm">{question.followUp}</p>
                      </div>
                      {question.objectives && question.objectives.length > 0 && (
                        <div>
                          <p className="text-gray-600 text-sm font-medium mb-1">Objectives:</p>
                          <ul className="text-gray-600 text-sm space-y-1">
                            {question.objectives?.map((objective, objIndex) => (
                              <li key={objIndex} className="flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>

          {/* Activities */}
          {guideData.activities && guideData.activities.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Activities</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {guideData.activities?.map((activity, index) => (
                  <div key={activity.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-purple-900">{activity.name}</h5>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {activity.duration}
                      </span>
                    </div>
                    <p className="text-purple-800 text-sm mb-3">{activity.description}</p>
                    {activity.materials && activity.materials.length > 0 && (
                      <div>
                        <p className="text-purple-700 text-xs font-medium mb-1">Materials needed:</p>
                        <ul className="text-purple-700 text-xs space-y-1">
                          {activity.materials?.map((material, matIndex) => (
                            <li key={matIndex} className="flex items-start">
                              <span className="text-purple-400 mr-1">•</span>
                              <span>{material}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prompts */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Follow-up Prompts</h4>
            <div className="space-y-4">
              {guideData.prompts?.map((prompt, index) => (
                <div key={prompt.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700">Prompt {index + 1}</span>
                    </div>
                    <button
                      onClick={() => handlePromptEdit(prompt.id, prompt.prompt)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {editingPrompt === prompt.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editPromptText}
                        onChange={(e) => setEditPromptText(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows={2}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePromptSave(prompt.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center space-x-2 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </button>
                        <button
                          onClick={() => setEditingPrompt(null)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 flex items-center space-x-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900 mb-2 font-medium">{prompt.prompt}</p>
                      <p className="text-gray-600 text-sm italic">{prompt.context}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionGuide;
