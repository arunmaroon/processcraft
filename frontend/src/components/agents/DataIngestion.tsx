import React, { useState, useCallback, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, FileText, Image, Music, Video } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface DataIngestionProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onProcessingComplete: (insights: any) => void;
}

const DataIngestion: React.FC<DataIngestionProps> = ({ onFilesUploaded, onProcessingComplete }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = {
    'application/pdf': { icon: FileText, color: 'text-red-500' },
    'application/msword': { icon: FileText, color: 'text-blue-500' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-500' },
    'text/plain': { icon: FileText, color: 'text-gray-500' },
    'text/csv': { icon: FileText, color: 'text-green-500' },
    'application/json': { icon: FileText, color: 'text-yellow-500' },
    'audio/mpeg': { icon: Music, color: 'text-purple-500' },
    'audio/wav': { icon: Music, color: 'text-purple-500' },
    'video/mp4': { icon: Video, color: 'text-pink-500' },
    'image/jpeg': { icon: Image, color: 'text-green-500' },
    'image/png': { icon: Image, color: 'text-green-500' },
  };

  const getFileIcon = (fileType: string) => {
    const typeInfo = acceptedFileTypes[fileType as keyof typeof acceptedFileTypes];
    if (typeInfo) {
      const IconComponent = typeInfo.icon;
      return <IconComponent className={`w-6 h-6 ${typeInfo.color}`} />;
    }
    return <File className="w-6 h-6 text-gray-500" />;
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = Object.keys(acceptedFileTypes);

    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported';
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList) => {
    const newFiles: UploadedFile[] = [];
    
    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        status: 'uploading',
        progress: 0
      };

      newFiles.push(uploadedFile);
    });

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      uploadFiles(newFiles);
    }
  }, []);

  const uploadFiles = async (files: UploadedFile[]) => {
    for (const fileData of files) {
      try {
        const formData = new FormData();
        formData.append('file', fileData.file);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 200);

        const response = await fetch('/api/upload/research', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (response.ok) {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, status: 'completed', progress: 100 }
              : f
          ));
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        ));
      }
    }

    onFilesUploaded(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const processFiles = async () => {
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const fileIds = uploadedFiles.map(f => f.id);
      
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      const response = await fetch('/api/processing/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileIds }),
      });

      if (response.ok) {
        const insights = await response.json();
        onProcessingComplete(insights);
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert('Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Ingestion</h2>
        <p className="text-gray-600">Upload research documents for AI agent generation</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to browse
        </h3>
        <p className="text-gray-500 mb-4">
          Support for PDF, DOC, TXT, CSV, JSON, MP3, MP4, and image files
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.csv,.json,.mp3,.wav,.mp4,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.file.type)}
                  <div>
                    <p className="font-medium text-gray-900">{file.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {file.status === 'uploading' && (
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}

                  {file.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}

                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}

                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Process Files Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={processFiles}
              disabled={isProcessing || uploadedFiles.some(f => f.status !== 'completed')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Process Files'}
            </button>
          </div>
        </div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Files</h3>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            {processingProgress}% complete
          </p>
        </div>
      )}
    </div>
  );
};

export default DataIngestion;
















