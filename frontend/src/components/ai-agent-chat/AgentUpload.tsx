import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  X,
  Loader2
} from 'lucide-react';
import { UploadStatus } from './AIAgentChatTab';

interface AgentUploadProps {
  onUploadComplete: (status: UploadStatus) => void;
  uploadStatus: UploadStatus | null;
}

const AgentUpload: React.FC<AgentUploadProps> = ({ onUploadComplete, uploadStatus }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
      setError('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/agent-upload/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (result.success) {
        // Start polling for status
        pollUploadStatus(result.uploadId);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const pollUploadStatus = async (uploadId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/agent-upload/status/${uploadId}`);
        const status = await response.json();
        
        if (status.status === 'completed') {
          clearInterval(pollInterval);
          onUploadComplete(status);
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          setError('Processing failed. Please try again.');
        }
      } catch (error) {
        console.error('Error polling status:', error);
        clearInterval(pollInterval);
        setError('Error checking upload status');
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const downloadTemplate = () => {
    // Create a sample Excel template
    const templateData = [
      {
        Participant: 'John Smith',
        Category: 'Tech-Savvy',
        Age: 28,
        Occupation: 'Software Engineer',
        Full_Transcript: 'I really love using this app. The interface is clean and intuitive. I can find everything I need quickly. The search function works great and I like how it remembers my preferences. Overall, it\'s a solid product that I use daily.'
      },
      {
        Participant: 'Sarah Johnson',
        Category: 'Novice',
        Age: 45,
        Occupation: 'Teacher',
        Full_Transcript: 'I\'m not very good with technology, but this app seems okay. I had some trouble finding the settings menu at first. The buttons are a bit small for me. I wish there was more help text or tutorials. It\'s confusing when things change without warning.'
      },
      {
        Participant: 'Mike Chen',
        Category: 'Frustrated',
        Age: 52,
        Occupation: 'Small Business Owner',
        Full_Transcript: 'This is way too complicated for what I need. I just want to do simple tasks but everything is buried in menus. The app keeps crashing on me and I lose my work. I\'m about to give up on this thing. It needs to be much simpler.'
      }
    ];

    // Convert to CSV for download
    const headers = Object.keys(templateData[0]);
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => 
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agent-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Instructions */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 mt-0.5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Upload User Research Transcripts</h3>
            <p className="text-sm text-blue-700 mt-1">
              Upload Excel or CSV files with user research transcripts. Each row should contain: Participant name, Category, Age, Occupation, and Full_Transcript.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Processing Transcripts...</h3>
                  <p className="text-sm text-gray-500">Analyzing speech patterns and creating AI agents</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Upload className="w-12 h-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {dragActive ? 'Drop files here' : 'Upload Transcript File'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Drag and drop your Excel/CSV file here, or click to browse
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  Supports .xlsx, .xls, .csv files up to 10MB
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
          />

          {/* Template Download */}
          <div className="mt-6 text-center">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Sample Template
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">Upload Status</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  uploadStatus.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : uploadStatus.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {uploadStatus.status}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>File: {uploadStatus.filename}</span>
                  <span>{uploadStatus.processedCount}/{uploadStatus.participantCount} processed</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadStatus.progress}%` }}
                  ></div>
                </div>
                
                {uploadStatus.status === 'processing' && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Creating AI agents from transcripts...</span>
                  </div>
                )}
                
                {uploadStatus.status === 'completed' && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Successfully created {uploadStatus.processedCount} AI agents!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Features List */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Speech Pattern Analysis</h4>
              <p className="text-sm text-gray-600">
                AI analyzes each transcript to extract natural speech patterns, filler words, and communication style.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Personality Synthesis</h4>
              <p className="text-sm text-gray-600">
                Creates detailed personality profiles including emotional triggers and behavioral patterns.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Realistic Responses</h4>
              <p className="text-sm text-gray-600">
                Agents respond using their actual vocabulary and speaking style from the original transcripts.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Human-like Behavior</h4>
              <p className="text-sm text-gray-600">
                Includes realistic delays, emotions, and natural conversation flow based on real user behavior.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentUpload;



