import React, { useState } from 'react';
import { Upload, X, Users } from 'lucide-react';

interface DocumentUploadProps {
  onGenerateAgents?: (data: {
    numberOfAgents: number;
    files: File[];
    uploadResults?: any[];
  }) => void;
}

interface FileType {
  icon: string;
  color: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onGenerateAgents }) => {
  const [numberOfAgents, setNumberOfAgents] = useState(5);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const supportedTypes: Record<string, FileType> = {
    pdf: { icon: '📄', color: 'text-red-500' },
    doc: { icon: '📝', color: 'text-blue-500' },
    docx: { icon: '📝', color: 'text-blue-500' },
    txt: { icon: '📄', color: 'text-gray-500' },
    rtf: { icon: '📄', color: 'text-gray-500' },
    odt: { icon: '📄', color: 'text-orange-500' },
    xls: { icon: '📊', color: 'text-green-500' },
    xlsx: { icon: '📊', color: 'text-green-500' },
    ppt: { icon: '📊', color: 'text-orange-500' },
    pptx: { icon: '📊', color: 'text-orange-500' },
    csv: { icon: '📊', color: 'text-green-500' },
    json: { icon: '🔧', color: 'text-yellow-500' },
    xml: { icon: '🔧', color: 'text-yellow-500' },
    md: { icon: '📝', color: 'text-gray-500' },
    html: { icon: '🌐', color: 'text-orange-500' },
    htm: { icon: '🌐', color: 'text-orange-500' },
  };

  const getFileIcon = (filename: string): FileType => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    return supportedTypes[extension] || { icon: '📄', color: 'text-gray-500' };
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!supportedTypes[extension]) {
      return { valid: false, error: `Unsupported file type: .${extension}` };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    return { valid: true };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      console.error('File validation errors:', errors);
      // You can add toast notifications here if needed
    }

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      console.error('File validation errors:', errors);
    }

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (uploadedFiles.length === 0) {
      console.error('Upload at least one document before generating agents.');
      return;
    }

    try {
      // For now, we'll simulate the upload process
      // In a real implementation, you would upload to your backend
      console.log('Generating agents with files:', uploadedFiles);
      
      if (onGenerateAgents) {
        onGenerateAgents({
          numberOfAgents,
          files: uploadedFiles,
          uploadResults: [], // This would come from actual API calls
        });
      }
    } catch (error) {
      console.error('Error generating agents:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-6">
      {/* Upload Area */}
      <div>
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xl font-semibold text-gray-900 mb-2">Drop files here or click to upload</p>
          <p className="text-sm text-gray-500">PDF, DOCX, TXT, CSV and more (Max 10MB each)</p>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.ppt,.pptx,.csv,.json,.xml,.md,.html,.htm"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">
                {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} ready
              </h4>
              <button
                onClick={() => setUploadedFiles([])}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => {
                const fileInfo = getFileIcon(file.name);
                return (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className={`text-xl ${fileInfo.color}`}>{fileInfo.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                      title="Remove"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Number of Agents */}
      <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Number of Agents to Generate: <span className="text-blue-600">{numberOfAgents}</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={numberOfAgents}
          onChange={(e) => setNumberOfAgents(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>10</span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={uploadedFiles.length === 0}
        className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg"
      >
        <Users className="w-6 h-6" />
        <span>Generate {numberOfAgents} AI Agent{numberOfAgents > 1 ? 's' : ''}</span>
      </button>
    </div>
  );
};

export default DocumentUpload;
