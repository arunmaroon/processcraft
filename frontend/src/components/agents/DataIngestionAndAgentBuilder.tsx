import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, FileText, Image, Music, Video, Users, Settings, Brain, Target, Zap } from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  backendId?: string;
}

interface GenerationCriteria {
  demographics: {
    age: { min: number; max: number };
    income: { min: number; max: number };
    education: string;
    occupation: string;
    location: string;
    family_status: string;
    tech_savviness: string;
    english_literacy: string;
  };
  behavioral: {
    personality_traits: string[];
    communication_style: string;
    risk_tolerance: string;
    tech_comfort: string;
    decision_making: string;
  };
  psychological: {
    motivations: string[];
    fears: string[];
    values: string[];
    aspirations: string[];
  };
  financial: {
    credit_profile: string;
    banking_behavior: string;
    investment_style: string;
    spending_patterns: string;
  };
  sample_size: number;
  quality_threshold: number;
}

interface DataIngestionAndAgentBuilderProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onProcessingComplete: (insights: any) => void;
  onGenerateAgents: (criteria: any) => void;
  isGenerating: boolean;
}

const DataIngestionAndAgentBuilder: React.FC<DataIngestionAndAgentBuilderProps> = ({ 
  onFilesUploaded, 
  onProcessingComplete, 
  onGenerateAgents, 
  isGenerating 
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingInsights, setProcessingInsights] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'build'>('upload');
  const [showAgentConfig, setShowAgentConfig] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug showAgentConfig state changes
  useEffect(() => {
    console.log('showAgentConfig state changed:', showAgentConfig);
  }, [showAgentConfig]);

  // Auto-advance to step 2 when processing completes
  useEffect(() => {
    if (processingComplete && processingInsights) {
      console.log('Processing complete detected, advancing to step 2...');
      setTimeout(() => {
        setShowAgentConfig(true);
      }, 500);
    }
  }, [processingComplete, processingInsights]);

  // Agent generation criteria
  const [criteria, setCriteria] = useState<GenerationCriteria>({
    demographics: {
      age: { min: 25, max: 45 },
      income: { min: 5, max: 50 },
      education: '',
      occupation: '',
      location: '',
      family_status: '',
      tech_savviness: '',
      english_literacy: ''
    },
    behavioral: {
      personality_traits: [],
      communication_style: '',
      risk_tolerance: '',
      tech_comfort: '',
      decision_making: ''
    },
    psychological: {
      motivations: [],
      fears: [],
      values: [],
      aspirations: []
    },
    financial: {
      credit_profile: '',
      banking_behavior: '',
      investment_style: '',
      spending_patterns: ''
    },
    sample_size: 5,
    quality_threshold: 0.8
  });

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
        console.log('Uploading file:', fileData.file.name, 'Type:', fileData.file.type, 'Size:', fileData.file.size);
        const formData = new FormData();
        formData.append('files', fileData.file);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileData.id 
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          ));
        }, 200);

        const response = await fetch('/api/admin-research/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (response.ok) {
          const result = await response.json();
          console.log('Upload successful:', result);
          
          // Update the file with the backend-generated ID
          if (result.files && result.files.length > 0) {
            const uploadedFile = result.files[0];
            console.log('Backend file ID:', uploadedFile.id);
            setUploadedFiles(prev => prev.map(f => 
              f.id === fileData.id 
                ? { ...f, status: 'completed', progress: 100, backendId: uploadedFile.id }
                : f
            ));
          } else {
            console.log('No files in upload response:', result);
            setUploadedFiles(prev => prev.map(f => 
              f.id === fileData.id 
                ? { ...f, status: 'completed', progress: 100 }
                : f
            ));
          }
        } else {
          const errorText = await response.text();
          console.error('Upload failed:', response.status, errorText);
          throw new Error(`Upload failed: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileData.id 
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
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

  const retryUpload = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'uploading', progress: 0, error: undefined }
          : f
      ));
      uploadFiles([file]);
    }
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  const processFiles = async () => {
    if (uploadedFiles.length === 0) return;

    console.log('Current uploaded files:', uploadedFiles);
    
    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const fileIds = (uploadedFiles || [])
        .filter(f => f.status === 'completed' && f.backendId)
        .map(f => f.backendId!);
      
      console.log('Filtered file IDs for processing:', fileIds);
      
      if (fileIds.length === 0) {
        throw new Error('No completed files with backend IDs found');
      }
      
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

      console.log('Processing files with IDs:', fileIds);
      
      // Prepare configuration for AI processing
      const configuration = {
        ageRange: [25, 45],
        incomeRange: ['₹3L-₹6L', '₹6L-₹12L', '₹12L-₹20L', '₹20L-₹35L'],
        locations: ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Chennai'],
        techLevels: ['Low', 'Medium', 'High'],
        occupations: ['Software Engineer', 'Business Owner', 'Manager', 'Analyst', 'Marketing Professional'],
        researchFocus: 'User Experience and Financial Services',
        personaCount: 5
      };

      const response = await fetch('/api/admin-research/process-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fileIds,
          action: 'generate_agents', // Automatically generate agents from documents
          configuration: configuration // Send configuration to AI
        }),
      });

      if (response.ok) {
        const insights = await response.json();
        console.log('Processing successful:', insights);
        setProcessingInsights(insights);
        onProcessingComplete(insights);
        
        // Show success message and advance to step 2
        console.log('Setting showAgentConfig to true...');
        alert(`✅ Processing complete! Generated ${insights.agents?.length || 0} AI agents. Moving to Step 2...`);
        
        // Use setTimeout to ensure state update happens after alert
        setTimeout(() => {
          console.log('Advancing to step 2...');
          setShowAgentConfig(true);
        }, 100);
      } else {
        const errorText = await response.text();
        console.error('Processing failed:', response.status, errorText);
        throw new Error(`Processing failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Processing error:', error);
      alert('Processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleGenerateAgents = () => {
    // Include uploaded file insights in criteria
    const enhancedCriteria = {
      ...criteria,
      researchData: processingInsights,
      uploadedFiles: (uploadedFiles || []).map(f => ({ id: f.id, filename: f.file.name }))
    };
    
    onGenerateAgents(enhancedCriteria);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatIncome = (value: number): string => {
    if (value === 0) return '0L';
    if (value >= 100) return '100L+';
    return `${value}L`;
  };

  // Custom dual range slider component
  const DualRangeSlider = ({ 
    min, 
    max, 
    values, 
    onChange, 
    step = 1 
  }: {
    min: number;
    max: number;
    values: [number, number];
    onChange: (values: [number, number]) => void;
    step?: number;
  }) => {
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent, thumb: 'min' | 'max') => {
      e.preventDefault();
      setIsDragging(thumb);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newValue = Math.round(min + percentage * (max - min));
      const steppedValue = Math.round(newValue / step) * step;

      if (isDragging === 'min') {
        const newMin = Math.min(steppedValue, values[1] - step);
        onChange([Math.max(min, newMin), values[1]]);
      } else {
        const newMax = Math.max(steppedValue, values[0] + step);
        onChange([values[0], Math.min(max, newMax)]);
      }
    }, [isDragging, min, max, step, values, onChange]);

    const handleMouseUp = useCallback(() => {
      setIsDragging(null);
    }, []);

    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const minPercentage = ((values[0] - min) / (max - min)) * 100;
    const maxPercentage = ((values[1] - min) / (max - min)) * 100;

    return (
      <div className="relative">
        <div
          ref={sliderRef}
          className="relative h-6 flex items-center cursor-pointer"
          onMouseDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percentage = (e.clientX - rect.left) / rect.width;
            const clickValue = Math.round(min + percentage * (max - min));
            const steppedValue = Math.round(clickValue / step) * step;
            
            if (Math.abs(steppedValue - values[0]) < Math.abs(steppedValue - values[1])) {
              const newMin = Math.min(steppedValue, values[1] - step);
              onChange([Math.max(min, newMin), values[1]]);
            } else {
              const newMax = Math.max(steppedValue, values[0] + step);
              onChange([values[0], Math.min(max, newMax)]);
            }
          }}
        >
          {/* Track */}
          <div className="absolute w-full h-2 bg-gray-200 rounded-full"></div>
          
          {/* Active range */}
          <div
            className="absolute h-2 bg-blue-500 rounded-full"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`
            }}
          ></div>
          
          {/* Min thumb */}
          <div
            className="absolute w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2"
            style={{ left: `${minPercentage}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'min')}
          ></div>
          
          {/* Max thumb */}
          <div
            className="absolute w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2"
            style={{ left: `${maxPercentage}%` }}
            onMouseDown={(e) => handleMouseDown(e, 'max')}
          ></div>
        </div>
      </div>
    );
  };

  // Income range configuration (in lakhs)
  const incomeRangeConfig = {
    min: 0,
    max: 100,
    step: 1
  };

  const educationLevels = [
    'School', 'Graduate', 'Post-Graduate', 'Professional', 'Technical'
  ];

  const occupations = [
    'Salaried',
    'Business'
  ];

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad',
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Tier-2 City', 'Tier-3 City', 'Rural'
  ];

  const familyStatuses = [
    'Single', 'Married', 'Divorced', 'Widowed', 'Joint Family', 'Nuclear Family'
  ];

  const techSavvinessLevels = [
    'Digital Native', 'Very High', 'High', 'Medium', 'Low', 'Very Low', 'Offline-first'
  ];

  const englishLiteracyLevels = [
    'Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic', 'Beginner', 'None'
  ];

  const personalityTraits = [
    'Open-minded', 'Conscientious', 'Extraverted', 'Agreeable', 'Neurotic',
    'Analytical', 'Creative', 'Practical', 'Optimistic', 'Cautious'
  ];

  const communicationStyles = [
    'Direct', 'Detailed', 'Emotional', 'Logical', 'Visual', 'Auditory'
  ];

  const riskTolerances = [
    'Very Low', 'Low', 'Medium', 'High', 'Very High'
  ];

  const techComforts = [
    'Digital Native', 'Comfortable', 'Basic', 'Assisted', 'Offline-first'
  ];

  const decisionMakings = [
    'Analytical', 'Intuitive', 'Collaborative', 'Independent', 'Risk-averse'
  ];

  const motivations = [
    'Financial Security', 'Career Growth', 'Family Well-being', 'Personal Growth',
    'Social Recognition', 'Work-Life Balance', 'Innovation', 'Stability'
  ];

  const fears = [
    'Financial Loss', 'Job Insecurity', 'Health Issues', 'Technology Change',
    'Social Isolation', 'Failure', 'Uncertainty', 'Privacy Breach'
  ];

  const values = [
    'Honesty', 'Integrity', 'Family', 'Success', 'Security', 'Freedom',
    'Innovation', 'Tradition', 'Community', 'Independence'
  ];

  const aspirations = [
    'Early Retirement', 'Home Ownership', 'Business Success', 'Travel',
    'Education', 'Health & Fitness', 'Creative Pursuits', 'Social Impact'
  ];

  const creditProfiles = [
    'First-time', 'Good History', 'Defaults', 'No Credit', 'Rebuilding'
  ];

  const bankingBehaviors = [
    'Conservative', 'Moderate', 'Aggressive', 'Impulsive', 'Analytical'
  ];

  const investmentStyles = [
    'Conservative', 'Balanced', 'Aggressive', 'Speculative', 'Passive'
  ];

  const spendingPatterns = [
    'Frugal', 'Moderate', 'Generous', 'Impulsive', 'Planned'
  ];

  const handleDemographicChange = (field: keyof typeof criteria.demographics, value: any) => {
    setCriteria(prev => ({
      ...prev,
      demographics: {
        ...prev.demographics,
        [field]: value
      }
    }));
  };

  const handleBehavioralChange = (field: keyof typeof criteria.behavioral, value: any) => {
    setCriteria(prev => ({
      ...prev,
      behavioral: {
        ...prev.behavioral,
        [field]: value
      }
    }));
  };

  const handlePsychologicalChange = (field: keyof typeof criteria.psychological, value: any) => {
    setCriteria(prev => ({
      ...prev,
      psychological: {
        ...prev.psychological,
        [field]: value
      }
    }));
  };

  const handleFinancialChange = (field: keyof typeof criteria.financial, value: any) => {
    setCriteria(prev => ({
      ...prev,
      financial: {
        ...prev.financial,
        [field]: value
      }
    }));
  };

  const handleArrayChange = (category: keyof typeof criteria, field: string, value: string, checked: boolean) => {
    setCriteria(prev => {
      const currentCategory = prev[category] || {};
      const currentArray = (currentCategory as any)?.[field] || [];
      
      return {
        ...prev,
        [category]: {
          ...currentCategory,
          [field]: checked
            ? [...currentArray, value]
            : currentArray.filter((item: string) => item !== value)
        }
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Ingestion & Agent Builder</h2>
        <p className="text-gray-600">Upload research documents and build AI agents in one seamless workflow</p>
      </div>

      {/* Step 1: Upload Documents */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            showAgentConfig 
              ? 'bg-green-100' 
              : 'bg-blue-100'
          }`}>
            {showAgentConfig ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <span className="text-blue-600 font-semibold">1</span>
            )}
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${
              showAgentConfig ? 'text-green-700' : 'text-gray-900'
            }`}>
              Upload Research Documents
              {showAgentConfig && <span className="ml-2 text-sm text-green-600">✓ Completed</span>}
            </h3>
            <p className="text-sm text-gray-600">Upload your research files to extract insights for agent generation</p>
          </div>
        </div>

        <div className="space-y-6">
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Uploaded Files</h3>
                <button
                  onClick={clearAllFiles}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2">
                {(uploadedFiles || []).map((file) => (
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
                        {file.error && (
                          <p className="text-sm text-red-600 mt-1">
                            {file.error}
                          </p>
                        )}
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
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <button
                            onClick={() => retryUpload(file.id)}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            Retry
                          </button>
                        </div>
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
                  {isProcessing ? 'Processing...' : 'Process Files & Continue to Build'}
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

          {/* Processing Insights */}
          {processingInsights && !showAgentConfig && (
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Complete!</h3>
              <p className="text-gray-600 mb-4">
                Files have been processed successfully. You can now proceed to build agents based on the extracted insights.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    console.log('Manual step 2 advancement...');
                    setShowAgentConfig(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue to Step 2: Configure AI Agents
                </button>
                <p className="text-xs text-gray-500">
                  If Step 2 doesn't appear automatically, click the button above.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Agent Configuration */}
      {showAgentConfig && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-green-600 font-semibold">2</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Configure AI Agents</h3>
              <p className="text-sm text-gray-600">Set demographics, behavioral traits, and generation parameters</p>
            </div>
          </div>

          {/* Quick Start Options */}
          {processingInsights && (
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Research Insights Available</h3>
              <p className="text-gray-600 mb-4">
                Based on your uploaded documents, we've extracted insights that will be used to generate more realistic agents.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{uploadedFiles.length}</div>
                  <div className="text-sm text-gray-600">Files Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">AI-Powered</div>
                  <div className="text-sm text-gray-600">Insight Extraction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">Enhanced</div>
                  <div className="text-sm text-gray-600">Agent Quality</div>
                </div>
              </div>
            </div>
          )}

          {/* Agent Configuration */}
          <div className="space-y-6">
            
            {/* Demographics */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-gray-900">Demographics</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={criteria.demographics.age.min}
                      onChange={(e) => handleDemographicChange('age', { ...criteria.demographics.age, min: parseInt(e.target.value) })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="18"
                      max="80"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      value={criteria.demographics.age.max}
                      onChange={(e) => handleDemographicChange('age', { ...criteria.demographics.age, max: parseInt(e.target.value) })}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="18"
                      max="80"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Income Range: {formatIncome(criteria.demographics.income.min)} - {formatIncome(criteria.demographics.income.max)}
                  </label>
                  <div className="px-4 py-6">
                    <DualRangeSlider
                      min={incomeRangeConfig.min}
                      max={incomeRangeConfig.max}
                      step={incomeRangeConfig.step}
                      values={[criteria.demographics.income.min, criteria.demographics.income.max]}
                      onChange={(values) => handleDemographicChange('income', { min: values[0], max: values[1] })}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{formatIncome(incomeRangeConfig.min)}</span>
                      <span>{formatIncome(incomeRangeConfig.max)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                  <select
                    value={criteria.demographics.education}
                    onChange={(e) => handleDemographicChange('education', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Education Level</option>
                    {educationLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                  <select
                    value={criteria.demographics.occupation}
                    onChange={(e) => handleDemographicChange('occupation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Occupation</option>
                    {occupations.map(occupation => (
                      <option key={occupation} value={occupation}>{occupation}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={criteria.demographics.location}
                    onChange={(e) => handleDemographicChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Location</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Family Status</label>
                  <select
                    value={criteria.demographics.family_status}
                    onChange={(e) => handleDemographicChange('family_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Family Status</option>
                    {familyStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tech Savviness</label>
                  <select
                    value={criteria.demographics.tech_savviness}
                    onChange={(e) => handleDemographicChange('tech_savviness', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Tech Savviness Level</option>
                    {techSavvinessLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">English Literacy</label>
                  <select
                    value={criteria.demographics.english_literacy}
                    onChange={(e) => handleDemographicChange('english_literacy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select English Literacy Level</option>
                    {englishLiteracyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Behavioral Traits */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-gray-900">Behavioral Traits</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personality Traits</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {personalityTraits.map(trait => (
                      <label key={trait} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={criteria.behavioral.personality_traits.includes(trait)}
                          onChange={(e) => handleArrayChange('behavioral', 'personality_traits', trait, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{trait}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Communication Style</label>
                    <select
                      value={criteria.behavioral.communication_style}
                      onChange={(e) => handleBehavioralChange('communication_style', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Communication Style</option>
                      {communicationStyles.map(style => (
                        <option key={style} value={style}>{style}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Risk Tolerance</label>
                    <select
                      value={criteria.behavioral.risk_tolerance}
                      onChange={(e) => handleBehavioralChange('risk_tolerance', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Risk Tolerance</option>
                      {riskTolerances.map(tolerance => (
                        <option key={tolerance} value={tolerance}>{tolerance}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Generation Settings */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Generation Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sample Size</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setCriteria(prev => ({ ...prev, sample_size: Math.max(1, prev.sample_size - 1) }))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="text-lg font-medium w-12 text-center">{criteria.sample_size}</span>
                    <button
                      onClick={() => setCriteria(prev => ({ ...prev, sample_size: Math.min(50, prev.sample_size + 1) }))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quality Threshold</label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.1"
                    value={criteria.quality_threshold}
                    onChange={(e) => setCriteria(prev => ({ ...prev, quality_threshold: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.5</span>
                    <span className="font-medium">{criteria.quality_threshold}</span>
                    <span>1.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleGenerateAgents}
                disabled={isGenerating}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating AI Agents...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    <span>Generate {criteria.sample_size} AI Agents</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
  );
};

export default DataIngestionAndAgentBuilder;
