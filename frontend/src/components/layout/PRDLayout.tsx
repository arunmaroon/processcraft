import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  Clock, 
  CheckCircle,
  Home,
  Palette,
  Code,
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  Archive,
  Share,
  Download
} from 'lucide-react';
import { EnhancedPRD, PRDStage } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';
import PRDNavigation from './PRDNavigation';
import Header from './Header';

interface PRDLayoutProps {
  children: React.ReactNode;
  currentPRD?: EnhancedPRD;
  onPRDSelect: (prd: EnhancedPRD) => void;
  onCreatePRD: () => void;
  onStageChange: (stage: string) => void;
  currentStage?: string;
}

export default function PRDLayout({ 
  children, 
  currentPRD, 
  onPRDSelect, 
  onCreatePRD, 
  onStageChange,
  currentStage 
}: PRDLayoutProps) {
  const [isNavigationCollapsed, setIsNavigationCollapsed] = useState(false);

  const getStageInfo = (stage: string) => {
    switch (stage) {
      case 'overview':
        return { name: 'Overview', icon: Home, color: 'text-gray-600' };
      case 'research':
        return { name: 'Research', icon: Users, color: 'text-blue-600' };
      case 'design':
        return { name: 'Design', icon: Palette, color: 'text-purple-600' };
      case 'code':
        return { name: 'Code', icon: Code, color: 'text-green-600' };
      case 'complete':
        return { name: 'Complete', icon: CheckCircle, color: 'text-gray-600' };
      default:
        return { name: 'Overview', icon: Home, color: 'text-gray-600' };
    }
  };

  const stageInfo = getStageInfo(currentStage || 'overview');

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        {/* PRD Navigation Sidebar */}
        {!isNavigationCollapsed && (
          <PRDNavigation
            currentPRD={currentPRD}
            onPRDSelect={onPRDSelect}
            onCreatePRD={onCreatePRD}
            onStageChange={onStageChange}
            currentStage={currentStage}
          />
        )}
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* PRD Header */}
          {currentPRD && (
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsNavigationCollapsed(!isNavigationCollapsed)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <h1 className="text-xl font-semibold text-gray-900">{currentPRD.title}</h1>
                        <p className="text-sm text-gray-500">{currentPRD.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700`}>
                        {currentPRD.stage}
                      </span>
                      <span className="text-xs text-gray-500">v{currentPRD.version}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <stageInfo.icon className={`w-4 h-4 ${stageInfo.color}`} />
                    <span className={stageInfo.color}>{stageInfo.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Star">
                      <Star className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
                      <Share className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
                      <Settings className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Stage Progress Bar */}
          {currentPRD && (
            <div className="bg-white border-b border-gray-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {[
                    { id: 'overview', name: 'Overview', icon: Home },
                    { id: 'research', name: 'Research', icon: Users },
                    { id: 'design', name: 'Design', icon: Palette },
                    { id: 'code', name: 'Code', icon: Code },
                    { id: 'complete', name: 'Complete', icon: CheckCircle }
                  ].map((stage, index) => {
                    const isActive = currentStage === stage.id;
                    const isCompleted = false; // TODO: Implement completion logic
                    
                    return (
                      <div key={stage.id} className="flex items-center gap-2">
                        <button
                          onClick={() => onStageChange(stage.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : isCompleted
                              ? 'bg-green-50 text-green-700'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          <stage.icon className="w-4 h-4" />
                          <span>{stage.name}</span>
                          {isCompleted && <CheckCircle className="w-4 h-4" />}
                        </button>
                        
                        {index < 4 && (
                          <div className={`w-8 h-0.5 ${
                            isCompleted ? 'bg-green-300' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(currentPRD.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
