import React, { useState } from 'react';
import { Upload, FileText, Users, Settings, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentBasedAgentCreatorProps {
  onAgentsGenerated: (agents: any[]) => void;
}

const DocumentBasedAgentCreator: React.FC<DocumentBasedAgentCreatorProps> = ({ onAgentsGenerated }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [generationSteps] = useState([
    { step: 1, title: 'Document Analysis', description: 'Analyzing uploaded documents with Grok-3', icon: '📄' },
    { step: 2, title: 'Cultural Context', description: 'Extracting Indian cultural context and patterns', icon: '🏛️' },
    { step: 3, title: 'Base Generation', description: 'Generating base personas with GPT-4o', icon: '🤖' },
    { step: 4, title: 'Ethical Alignment', description: 'Enhancing with Claude-3 for ethical alignment', icon: '🧠' },
    { step: 5, title: 'Dynamic Behaviors', description: 'Adding cultural adaptations and behaviors', icon: '🎭' },
    { step: 6, title: 'Validation', description: 'Validating and optimizing with Gemini', icon: '✨' }
  ]);
  const [agentCount, setAgentCount] = useState(5);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [demographicDiversity, setDemographicDiversity] = useState('balanced');
  const [techSavviness, setTechSavviness] = useState('medium');
  const [englishLevel, setEnglishLevel] = useState('fluent');
  const [fintechSavviness, setFintechSavviness] = useState('medium');

  const focusAreaOptions = [
    'Tech Savviness',
    'English Level',
    'Fintech Savviness'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFocusAreaToggle = (area: string) => {
    setFocusAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const generateAgentsFromDocuments = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one document');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setCurrentStep(0);
    setStatusMessage('Starting AI agent generation...');

    try {
      // Upload files first
      setStatusMessage('Uploading documents...');
      const formData = new FormData();
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      setProcessingProgress(10);
      
      const uploadResponse = await fetch('/api/admin-research/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files');
      }

      const uploadResult = await uploadResponse.json();
      const fileIds = uploadResult.fileIds;

      setProcessingProgress(15);
      setStatusMessage('Documents uploaded successfully');

      // Process documents with AI
      setStatusMessage('Initializing AI processing...');
      const processResponse = await fetch('/api/admin-research/process-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileIds,
          action: 'generate_agents',
          configuration: {
            agentCount,
            focusAreas: {
              techSavviness,
              englishLevel,
              fintechSavviness
            },
            demographicDiversity,
            source: 'document_upload',
            personaFormat: 'detailed_professional'
          }
        })
      });

      if (!processResponse.ok) {
        throw new Error('Failed to process documents');
      }

      // Quick progress simulation
      console.log('🔄 Starting quick progress simulation...');
      setCurrentStep(1);
      setStatusMessage('Processing with AI...');
      setProcessingProgress(50);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep(6);
      setStatusMessage('Finalizing agents...');
      setProcessingProgress(95);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Progress simulation completed');
      
      console.log('📥 Parsing response...');
      const result = await processResponse.json();
      console.log('📥 Process response received:', result);
      console.log('📥 Response success:', result.success);
      console.log('📥 Response agents:', result.agents);
      console.log('📥 Agents length:', result.agents?.length);
      
      if (result.success && result.agents && result.agents.length > 0) {
        console.log('✅ Agents generated successfully:', result.agents);
        setProcessingProgress(100);
        setStatusMessage(`Successfully generated ${result.agents.length} AI agents!`);
        console.log('📤 Calling onAgentsGenerated with:', result.agents);
        onAgentsGenerated(result.agents);
        
        // Clear uploaded files and reset form
        setUploadedFiles([]);
        setAgentCount(5);
        setTechSavviness('medium');
        setEnglishLevel('fluent');
        setFintechSavviness('medium');
        setDemographicDiversity('balanced');
        
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingProgress(0);
          setCurrentStep(0);
          setStatusMessage('');
        }, 2000);
      } else {
        console.error('No agents generated or invalid response:', result);
        throw new Error(result.message || 'No agents generated');
      }
    } catch (error) {
      console.error('❌ Error generating agents:', error);
      setStatusMessage('❌ Error: ' + error.message);
      setIsProcessing(false);
      setProcessingProgress(0);
      setCurrentStep(0);
      
      // Show error for 5 seconds before clearing
      setTimeout(() => {
        setStatusMessage('');
      }, 5000);
    }
  };

  return (
    <div className="space-y-6">
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Document-Based Agent Creation</h3>
            <p className="text-sm text-gray-600">Upload documents containing real user data to generate authentic AI agents</p>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload Documents
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500">
                PDF, DOC, DOCX, TXT files (Max 10MB each)
              </span>
            </label>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuration Section */}
        <div className="space-y-6 mb-6">
          {/* Agent Count Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Number of Agents: {agentCount}
            </label>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={agentCount}
                onChange={(e) => setAgentCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((agentCount - 1) / 9) * 100}%, #E5E7EB ${((agentCount - 1) / 9) * 100}%, #E5E7EB 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
              </div>
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Focus Areas
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tech Savviness */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Tech Savviness</h4>
                <select
                  value={techSavviness}
                  onChange={(e) => setTechSavviness(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="low">Low (Basic mobile usage)</option>
                  <option value="medium">Medium (Apps & digital payments)</option>
                  <option value="high">High (Advanced tech adoption)</option>
                </select>
              </div>

              {/* English Level */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">English Level</h4>
                <select
                  value={englishLevel}
                  onChange={(e) => setEnglishLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="basic">Basic (Limited English)</option>
                  <option value="intermediate">Intermediate (Conversational)</option>
                  <option value="fluent">Fluent (Professional level)</option>
                </select>
              </div>

              {/* Fintech Savviness */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Fintech Savviness</h4>
                <select
                  value={fintechSavviness}
                  onChange={(e) => setFintechSavviness(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="low">Low (Traditional banking only)</option>
                  <option value="medium">Medium (UPI & digital payments)</option>
                  <option value="high">High (Investment apps & crypto)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Demographic Diversity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demographic Diversity
            </label>
            <select
              value={demographicDiversity}
              onChange={(e) => setDemographicDiversity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="balanced">Balanced Mix</option>
              <option value="diverse">Highly Diverse</option>
              <option value="focused">Focused Demographics</option>
            </select>
          </div>
        </div>


        {/* Enhanced Processing Status */}
        {isProcessing && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Agent Generation in Progress</h3>
                <p className="text-sm text-gray-600">{statusMessage}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {generationSteps.map((step, index) => (
                <div
                  key={step.step}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-300 ${
                    currentStep >= step.step
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                >
                  <span className="text-lg">{step.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{step.title}</p>
                    <p className="text-xs text-gray-500 truncate">{step.description}</p>
                  </div>
                  {currentStep > step.step && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {currentStep === step.step && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Current Status Details */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Current Step: {currentStep}/6</span>
                </div>
                <span className="text-sm font-bold text-blue-600">{processingProgress}%</span>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {currentStep === 1 && 'Using Grok-3 to analyze document content and extract user patterns...'}
                {currentStep === 2 && 'Extracting Indian cultural context, regional preferences, and demographic insights...'}
                {currentStep === 3 && 'Generating diverse base personas with GPT-4o based on document analysis...'}
                {currentStep === 4 && 'Enhancing personas with Claude-3 for ethical alignment and cultural sensitivity...'}
                {currentStep === 5 && 'Adding dynamic behaviors, cultural adaptations, and personality traits...'}
                {currentStep === 6 && 'Final validation and optimization with Gemini for quality assurance...'}
                {currentStep === 0 && 'Initializing AI processing pipeline...'}
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={generateAgentsFromDocuments}
          disabled={isProcessing || uploadedFiles.length === 0}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium transition-colors ${
            isProcessing || uploadedFiles.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isProcessing ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Generating Agents...</span>
            </>
          ) : (
            <>
              <Users className="w-5 h-5" />
              <span>Generate {agentCount} AI Agents from Documents</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentBasedAgentCreator;
