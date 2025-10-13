import React, { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import DocumentUpload from '../components/DocumentUpload';
import GenerationStatus from '../components/GenerationStatus';

const AIAgents = () => {
  const [showGenerationStatus, setShowGenerationStatus] = useState(false);
  const [generationData, setGenerationData] = useState(null);

  const handleGenerateAgents = (data = null) => {
    if (data) {
      setGenerationData(data);
    }
    setShowGenerationStatus(true);
  };

  const handleGenerationComplete = () => {
    setShowGenerationStatus(false);
    setGenerationData(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Generation Status Modal */}
      <GenerationStatus
        isVisible={showGenerationStatus}
        onComplete={handleGenerationComplete}
        onClose={() => setShowGenerationStatus(false)}
        generationType="documents"
        documents={generationData?.files}
        config={generationData}
      />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate AI Agents</h1>
        <p className="text-gray-600">
          Upload transcripts to create realistic AI personas with detailed backgrounds
        </p>
      </div>

      {/* Upload Component */}
      <DocumentUpload onGenerateAgents={handleGenerateAgents} />
    </div>
  );
};

export default AIAgents;