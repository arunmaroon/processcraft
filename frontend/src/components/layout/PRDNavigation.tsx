import React, { useState } from 'react';
import { 
  FileText, 
  ChevronDown, 
  Plus, 
  Search, 
  Filter,
  Home,
  Users,
  Palette,
  Code,
  CheckCircle,
  Clock,
  Star,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { EnhancedPRD, PRDStage } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';

interface PRDNavigationProps {
  currentPRD?: EnhancedPRD;
  onPRDSelect: (prd: EnhancedPRD) => void;
  onCreatePRD: () => void;
  onStageChange: (stage: string) => void;
  currentStage?: string;
}

export default function PRDNavigation({ 
  currentPRD, 
  onPRDSelect, 
  onCreatePRD, 
  onStageChange,
  currentStage 
}: PRDNavigationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<PRDStage | 'all'>('all');
  const [isExpanded, setIsExpanded] = useState(true);
  
  const allPRDs = enhancedPRDService.getAllPRDs();
  const filteredPRDs = allPRDs.filter(prd => {
    const matchesSearch = prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prd.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'all' || prd.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'Research': return <Users className="w-4 h-4" />;
      case 'Design': return <Palette className="w-4 h-4" />;
      case 'Code': return <Code className="w-4 h-4" />;
      case 'Complete': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Research': return 'text-blue-600 bg-blue-50';
      case 'Design': return 'text-purple-600 bg-purple-50';
      case 'Code': return 'text-green-600 bg-green-50';
      case 'Complete': return 'text-gray-600 bg-gray-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const workflowStages = [
    { id: 'overview', name: 'Overview', icon: Home },
    { id: 'research', name: 'Research', icon: Users },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'code', name: 'Code', icon: Code },
    { id: 'complete', name: 'Complete', icon: CheckCircle }
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">PRD Workspace</h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search PRDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as PRDStage | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Stages</option>
            <option value="Create">Create</option>
            <option value="Generate">Generate</option>
            <option value="Edit">Edit</option>
            <option value="Finalise">Finalise</option>
            <option value="Approval">Approval</option>
            <option value="Update">Update</option>
          </select>
        </div>
      </div>

      {/* PRD List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">PRDs ({filteredPRDs.length})</h3>
            <button
              onClick={onCreatePRD}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              New PRD
            </button>
          </div>
          
          <div className="space-y-2">
            {filteredPRDs.map((prd) => (
              <div
                key={prd.id}
                onClick={() => onPRDSelect(prd)}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                  currentPRD?.id === prd.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{prd.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{prd.description}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(prd.stage)}`}>
                        {prd.stage}
                      </span>
                      <span className="text-xs text-gray-500">v{prd.version}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {prd.isStarred && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                    <MoreHorizontal className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
            
            {filteredPRDs.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">No PRDs found</p>
                <button
                  onClick={onCreatePRD}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Create your first PRD
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Navigation */}
      {currentPRD && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Workflow Stages</h3>
          <div className="space-y-1">
            {workflowStages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => onStageChange(stage.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentStage === stage.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <stage.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{stage.name}</span>
                {currentStage === stage.id && (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
