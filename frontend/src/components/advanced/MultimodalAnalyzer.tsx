import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image, 
  Mic, 
  FileText, 
  Eye, 
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  Brain,
  BarChart3,
  Palette
} from 'lucide-react';

interface VisualAnalysisResult {
  description: string;
  elements: Array<{
    type: string;
    content: string;
    position: { x: number; y: number; width: number; height: number };
    color: string;
    size: number;
    accessibility: {
      altText?: string;
      contrast: number;
      readable: boolean;
    };
  }>;
  emotions: string[];
  accessibility: {
    overallScore: number;
    issues: string[];
    recommendations: string[];
    wcagCompliance: {
      level: 'A' | 'AA' | 'AAA' | 'non-compliant';
      issues: string[];
    };
  };
  usability: {
    clarity: number;
    navigation: number;
    visualHierarchy: number;
    consistency: number;
    overallScore: number;
    issues: string[];
    recommendations: string[];
  };
  recommendations: string[];
  confidence: number;
}

interface AudioAnalysisResult {
  transcription: string;
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    emotions: string[];
  };
  speaker: {
    gender: string;
    age: string;
    confidence: number;
  };
  quality: {
    clarity: number;
    backgroundNoise: number;
    overall: number;
  };
  insights: string[];
}

interface GeneratedContent {
  type: 'image' | 'prototype' | 'wireframe';
  content: string;
  description: string;
  metadata: any;
  quality: number;
}

const MultimodalAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'generate'>('visual');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VisualAnalysisResult | AudioAnalysisResult | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<'image' | 'prototype' | 'wireframe'>('image');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const analyzeFile = async () => {
    if (!uploadedFile) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/advanced-research/analyze/multimodal', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data.analysis);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/advanced-research/generate/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: contentType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
      } else {
        throw new Error('Content generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Content generation failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadContent = () => {
    if (!generatedContent) return;

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedContent.content}`;
    link.download = `generated_${contentType}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext || '')) return 'image';
    if (['mp3', 'wav', 'm4a', 'aac'].includes(ext || '')) return 'audio';
    return 'unknown';
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100';
    if (score >= 0.6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Multimodal Analysis</h1>
        <p className="text-gray-600">Analyze visual and audio content with AI-powered insights</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'visual', label: 'Visual Analysis', icon: Image },
            { id: 'audio', label: 'Audio Analysis', icon: Mic },
            { id: 'generate', label: 'Content Generation', icon: Palette }
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

      {/* Visual Analysis Tab */}
      {activeTab === 'visual' && (
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Image for Analysis</h3>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {uploadedFile ? uploadedFile.name : 'Click to upload an image'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports PNG, JPG, JPEG, GIF, BMP
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedFile && (
                <button
                  onClick={analyzeFile}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Analyzing...' : 'Analyze Image'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && 'elements' in analysisResult && (
            <div className="space-y-6">
              {/* Overview */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full ${getScoreBgColor(analysisResult.accessibility.overallScore)} flex items-center justify-center mx-auto mb-2`}>
                      <span className={`text-2xl font-bold ${getScoreColor(analysisResult.accessibility.overallScore)}`}>
                        {(analysisResult.accessibility.overallScore * 100).toFixed(0)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Accessibility Score</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full ${getScoreBgColor(analysisResult.usability.overallScore)} flex items-center justify-center mx-auto mb-2`}>
                      <span className={`text-2xl font-bold ${getScoreColor(analysisResult.usability.overallScore)}`}>
                        {(analysisResult.usability.overallScore * 100).toFixed(0)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Usability Score</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full ${getScoreBgColor(analysisResult.confidence)} flex items-center justify-center mx-auto mb-2`}>
                      <span className={`text-2xl font-bold ${getScoreColor(analysisResult.confidence)}`}>
                        {(analysisResult.confidence * 100).toFixed(0)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Confidence</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700">{analysisResult.description}</p>
              </div>

              {/* Emotions */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emotional Analysis</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.emotions.map((emotion, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>

              {/* Accessibility Issues */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">WCAG Compliance</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      analysisResult.accessibility.wcagCompliance.level === 'AAA' ? 'bg-green-100 text-green-800' :
                      analysisResult.accessibility.wcagCompliance.level === 'AA' ? 'bg-yellow-100 text-yellow-800' :
                      analysisResult.accessibility.wcagCompliance.level === 'A' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysisResult.accessibility.wcagCompliance.level}
                    </span>
                  </div>
                  {analysisResult.accessibility.issues.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Issues Found:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {analysisResult.accessibility.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-gray-600">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysisResult.accessibility.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {analysisResult.accessibility.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Usability Analysis */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Usability Analysis</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Clarity', value: analysisResult.usability.clarity },
                    { label: 'Navigation', value: analysisResult.usability.navigation },
                    { label: 'Visual Hierarchy', value: analysisResult.usability.visualHierarchy },
                    { label: 'Consistency', value: analysisResult.usability.consistency }
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <div className={`w-12 h-12 rounded-full ${getScoreBgColor(metric.value)} flex items-center justify-center mx-auto mb-2`}>
                        <span className={`text-lg font-bold ${getScoreColor(metric.value)}`}>
                          {(metric.value * 100).toFixed(0)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Audio Analysis Results */}
          {analysisResult && 'transcription' in analysisResult && (
            <div className="space-y-6">
              {/* Transcription */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Transcription</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{analysisResult.transcription}</p>
              </div>

              {/* Sentiment Analysis */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full ${getScoreBgColor((analysisResult.sentiment.score + 1) / 2)} flex items-center justify-center mx-auto mb-2`}>
                      <span className={`text-2xl font-bold ${getScoreColor((analysisResult.sentiment.score + 1) / 2)}`}>
                        {analysisResult.sentiment.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Sentiment</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {analysisResult.speaker.gender}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Speaker Gender</p>
                  </div>
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full ${getScoreBgColor(analysisResult.quality.overall)} flex items-center justify-center mx-auto mb-2`}>
                      <span className={`text-2xl font-bold ${getScoreColor(analysisResult.quality.overall)}`}>
                        {(analysisResult.quality.overall * 100).toFixed(0)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Audio Quality</p>
                  </div>
                </div>
              </div>

              {/* Emotions */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Emotions Detected</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.sentiment.emotions.map((emotion, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {emotion}
                    </span>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Insights</h3>
                <ul className="space-y-2">
                  {analysisResult.insights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Brain className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audio Analysis Tab */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Audio for Analysis</h3>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {uploadedFile ? uploadedFile.name : 'Click to upload an audio file'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports MP3, WAV, M4A, AAC
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedFile && (
                <button
                  onClick={analyzeFile}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Analyzing...' : 'Analyze Audio'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Generation Tab */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          {/* Generation Form */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Content</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="image">Image</option>
                  <option value="prototype">Prototype</option>
                  <option value="wireframe">Wireframe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to generate..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <button
                onClick={generateContent}
                disabled={loading || !prompt.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Palette className="w-4 h-4" />
                )}
                <span>{loading ? 'Generating...' : 'Generate Content'}</span>
              </button>
            </div>
          </div>

          {/* Generated Content */}
          {generatedContent && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Generated Content</h3>
                <button
                  onClick={downloadContent}
                  className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <img
                    src={`data:image/png;base64,${generatedContent.content}`}
                    alt="Generated content"
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Description:</p>
                  <p className="text-gray-700">{generatedContent.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quality Score:</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreBgColor(generatedContent.quality)} ${getScoreColor(generatedContent.quality)}`}>
                    {(generatedContent.quality * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultimodalAnalyzer;
