import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  Edit3, 
  Download, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight,
  Play,
  Pause,
  Share2,
  Copy,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Target,
  Users,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';
import Button from '../shared/Button';

interface WireframeVariant {
  id: string;
  name: string;
  personaId: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  layout: any;
  description: string;
  uxPatterns: string[];
  navigationFlow: any[];
  accessibilityScore: number;
  userSatisfactionScore: number;
  generatedAt: string;
  status: 'draft' | 'reviewed' | 'approved' | 'rejected';
}

interface WireframeViewerProps {
  wireframes: WireframeVariant[];
  selectedWireframe: WireframeVariant | null;
  onSelectWireframe: (wireframe: WireframeVariant) => void;
  onClose: () => void;
  onEdit?: (wireframe: WireframeVariant) => void;
  onExport?: (wireframe: WireframeVariant) => void;
  onDelete?: (wireframeId: string) => void;
}

export default function WireframeViewer({ 
  wireframes, 
  selectedWireframe, 
  onSelectWireframe, 
  onClose,
  onEdit,
  onExport,
  onDelete
}: WireframeViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [annotations, setAnnotations] = useState<Array<{id: string, x: number, y: number, text: string, type: 'note' | 'issue' | 'suggestion'}>>([]);
  const [newAnnotation, setNewAnnotation] = useState<{x: number, y: number, text: string, type: 'note' | 'issue' | 'suggestion'} | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedWireframe) {
      const index = wireframes.findIndex(w => w.id === selectedWireframe.id);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    }
  }, [selectedWireframe, wireframes]);

  const currentWireframe = wireframes[currentIndex];

  const nextWireframe = () => {
    if (currentIndex < wireframes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      onSelectWireframe(wireframes[currentIndex + 1]);
    }
  };

  const prevWireframe = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onSelectWireframe(wireframes[currentIndex - 1]);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (newAnnotation) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        setNewAnnotation({ ...newAnnotation, x, y });
      }
    }
  };

  const addAnnotation = () => {
    if (newAnnotation) {
      const annotation = {
        ...newAnnotation,
        id: `annotation-${Date.now()}`
      };
      setAnnotations([...annotations, annotation]);
      setNewAnnotation(null);
    }
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      case 'desktop': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'reviewed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!currentWireframe) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wireframe Selected</h3>
          <p className="text-gray-600 mb-4">Please select a wireframe to view.</p>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white rounded-lg shadow-xl flex flex-col ${isFullscreen ? 'w-full h-full rounded-none' : 'w-11/12 h-5/6'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getDeviceIcon(currentWireframe.deviceType)}
              <h2 className="text-lg font-semibold text-gray-900">{currentWireframe.name}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(currentWireframe.status)}`}>
                {currentWireframe.status}
              </span>
              <span className="text-xs text-gray-500">
                {currentIndex + 1} of {wireframes.length}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={prevWireframe}
              disabled={currentIndex === 0}
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <Button
              onClick={nextWireframe}
              disabled={currentIndex === wireframes.length - 1}
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next
            </Button>
            <div className="w-px h-6 bg-gray-300"></div>
            <Button
              onClick={handleZoomOut}
              variant="outline"
              size="sm"
              leftIcon={<ZoomOut className="w-4 h-4" />}
            >
              Zoom Out
            </Button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">{zoom}%</span>
            <Button
              onClick={handleZoomIn}
              variant="outline"
              size="sm"
              leftIcon={<ZoomIn className="w-4 h-4" />}
            >
              Zoom In
            </Button>
            <Button
              onClick={resetZoom}
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>
            <div className="w-px h-6 bg-gray-300"></div>
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              leftIcon={isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            >
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              leftIcon={<X className="w-4 h-4" />}
            >
              Close
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Wireframe Area */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    Accessibility: {currentWireframe.accessibilityScore}/100
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    User Satisfaction: {currentWireframe.userSatisfactionScore}/100
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setShowAnnotations(!showAnnotations)}
                  variant="outline"
                  size="sm"
                  leftIcon={<Info className="w-4 h-4" />}
                >
                  {showAnnotations ? 'Hide' : 'Show'} Annotations
                </Button>
                <Button
                  onClick={togglePlay}
                  variant="outline"
                  size="sm"
                  leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                >
                  {isPlaying ? 'Pause' : 'Play'} Flow
                </Button>
              </div>
            </div>

            {/* Wireframe Canvas */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              <div className="flex justify-center items-center min-h-full">
                <div
                  ref={canvasRef}
                  className="bg-white border border-gray-300 shadow-lg relative"
                  style={{
                    width: currentWireframe.deviceType === 'mobile' ? '375px' : 
                           currentWireframe.deviceType === 'tablet' ? '768px' : '1200px',
                    height: currentWireframe.deviceType === 'mobile' ? '667px' : 
                            currentWireframe.deviceType === 'tablet' ? '1024px' : '800px',
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center',
                    cursor: newAnnotation ? 'crosshair' : 'default'
                  }}
                  onClick={handleCanvasClick}
                >
                  {/* Wireframe Content */}
                  <div className="w-full h-full relative">
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gray-200 border-b border-gray-300 flex items-center justify-center">
                      <div className="text-gray-600 font-medium">Header</div>
                    </div>

                    {/* Navigation */}
                    {currentWireframe.deviceType === 'mobile' ? (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-200 border-t border-gray-300 flex items-center justify-around">
                        <div className="text-gray-600 text-xs">Home</div>
                        <div className="text-gray-600 text-xs">Search</div>
                        <div className="text-gray-600 text-xs">Profile</div>
                      </div>
                    ) : (
                      <div className="absolute top-16 left-0 w-48 h-full bg-gray-100 border-r border-gray-300 p-4">
                        <div className="space-y-2">
                          <div className="text-gray-600 text-sm">Dashboard</div>
                          <div className="text-gray-600 text-sm">Analytics</div>
                          <div className="text-gray-600 text-sm">Settings</div>
                        </div>
                      </div>
                    )}

                    {/* Main Content */}
                    <div className={`absolute ${currentWireframe.deviceType === 'mobile' ? 'top-16 bottom-16 left-0 right-0' : 'top-16 left-48 right-0 bottom-0'} p-4`}>
                      <div className="space-y-4">
                        <div className="h-8 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="h-24 bg-gray-200 rounded"></div>
                          <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-12 bg-blue-200 rounded mt-6 flex items-center justify-center">
                          <span className="text-blue-800 font-medium">Call to Action</span>
                        </div>
                      </div>
                    </div>

                    {/* Annotations */}
                    {showAnnotations && annotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          annotation.type === 'issue' ? 'border-red-500 bg-red-100' :
                          annotation.type === 'suggestion' ? 'border-yellow-500 bg-yellow-100' :
                          'border-blue-500 bg-blue-100'
                        } flex items-center justify-center cursor-pointer`}>
                          {annotation.type === 'issue' ? <AlertCircle className="w-3 h-3 text-red-600" /> :
                           annotation.type === 'suggestion' ? <Target className="w-3 h-3 text-yellow-600" /> :
                           <Info className="w-3 h-3 text-blue-600" />}
                        </div>
                        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg p-2 shadow-lg min-w-[200px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-900 capitalize">{annotation.type}</span>
                            <button
                              onClick={() => removeAnnotation(annotation.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-700">{annotation.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Wireframe Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Wireframe Details</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Description</label>
                    <p className="text-sm text-gray-900">{currentWireframe.description}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">UX Patterns</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentWireframe.uxPatterns.map((pattern, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Flow */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Navigation Flow</h3>
                <div className="space-y-2">
                  {currentWireframe.navigationFlow.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-semibold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{step.action}</div>
                        <div className="text-xs text-gray-600">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
                <div className="space-y-2">
                  {onEdit && (
                    <Button
                      onClick={() => onEdit(currentWireframe)}
                      leftIcon={<Edit3 className="w-4 h-4" />}
                      className="w-full"
                    >
                      Edit Wireframe
                    </Button>
                  )}
                  {onExport && (
                    <Button
                      onClick={() => onExport(currentWireframe)}
                      leftIcon={<Download className="w-4 h-4" />}
                      variant="outline"
                      className="w-full"
                    >
                      Export
                    </Button>
                  )}
                  <Button
                    leftIcon={<Share2 className="w-4 h-4" />}
                    variant="outline"
                    className="w-full"
                  >
                    Share
                  </Button>
                  <Button
                    leftIcon={<Copy className="w-4 h-4" />}
                    variant="outline"
                    className="w-full"
                  >
                    Duplicate
                  </Button>
                  {onDelete && (
                    <Button
                      onClick={() => onDelete(currentWireframe.id)}
                      leftIcon={<Trash2 className="w-4 h-4" />}
                      variant="outline"
                      className="w-full text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              {/* Add Annotation */}
              {newAnnotation && (
                <div className="border border-gray-300 rounded-lg p-3 bg-white">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Add Annotation</h4>
                  <div className="space-y-2">
                    <select
                      value={newAnnotation.type}
                      onChange={(e) => setNewAnnotation({ ...newAnnotation, type: e.target.value as 'note' | 'issue' | 'suggestion' })}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="note">Note</option>
                      <option value="issue">Issue</option>
                      <option value="suggestion">Suggestion</option>
                    </select>
                    <textarea
                      value={newAnnotation.text}
                      onChange={(e) => setNewAnnotation({ ...newAnnotation, text: e.target.value })}
                      placeholder="Enter annotation text..."
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                      rows={2}
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={addAnnotation}
                        size="sm"
                        className="flex-1"
                      >
                        Add
                      </Button>
                      <Button
                        onClick={() => setNewAnnotation(null)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!newAnnotation && (
                <Button
                  onClick={() => setNewAnnotation({ x: 0, y: 0, text: '', type: 'note' })}
                  leftIcon={<Plus className="w-4 h-4" />}
                  variant="outline"
                  className="w-full"
                >
                  Add Annotation
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
