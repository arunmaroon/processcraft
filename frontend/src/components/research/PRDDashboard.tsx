import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Users, 
  Palette, 
  Code, 
  CheckCircle, 
  Clock, 
  Star,
  MoreHorizontal,
  ArrowRight,
  Bot,
  MessageCircle,
  Archive,
  Share,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { EnhancedPRD, PRDStage, PRDPriority } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';

interface PRDDashboardProps {
  onPRDSelect: (prd: EnhancedPRD) => void;
  onCreatePRD: () => void;
}

export default function PRDDashboard({ onPRDSelect, onCreatePRD }: PRDDashboardProps) {
  const [prds, setPrds] = useState<EnhancedPRD[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<PRDStage | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<PRDPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'stage'>('updated');

  useEffect(() => {
    loadPRDs();
  }, []);

  const loadPRDs = () => {
    const allPRDs = enhancedPRDService.getAllPRDs();
    setPrds(allPRDs);
  };

  const getStageColor = (stage: PRDStage) => {
    switch (stage) {
      case 'Create': return 'text-blue-600 bg-blue-50';
      case 'Generate': return 'text-yellow-600 bg-yellow-50';
      case 'Edit': return 'text-green-600 bg-green-50';
      case 'Finalise': return 'text-purple-600 bg-purple-50';
      case 'Approval': return 'text-green-600 bg-green-50';
      case 'Update': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: PRDPriority) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getWorkflowStage = (prd: EnhancedPRD) => {
    // Determine current workflow stage based on PRD stage and progress
    if (prd.stage === 'Create' || prd.stage === 'Generate') return 'Research';
    if (prd.stage === 'Edit') return 'Design';
    if (prd.stage === 'Finalise' || prd.stage === 'Approval') return 'Code';
    if (prd.stage === 'Update') return 'Complete';
    return 'Research';
  };

  const getWorkflowIcon = (stage: string) => {
    switch (stage) {
      case 'Research': return <Users className="w-4 h-4" />;
      case 'Design': return <Palette className="w-4 h-4" />;
      case 'Code': return <Code className="w-4 h-4" />;
      case 'Complete': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredPRDs = prds
    .filter(prd => {
      const matchesSearch = prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prd.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = filterStage === 'all' || prd.stage === filterStage;
      const matchesPriority = filterPriority === 'all' || prd.priority === filterPriority;
      return matchesSearch && matchesStage && matchesPriority;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'stage':
          return a.stage.localeCompare(b.stage);
        default:
          return 0;
      }
    });

  const stats = {
    total: prds.length,
    inProgress: prds.filter(p => p.stage === 'Edit' || p.stage === 'Generate').length,
    completed: prds.filter(p => p.stage === 'Approval' || p.stage === 'Update').length,
    aiSuggestions: prds.reduce((acc, prd) => acc + prd.aiSuggestions.length, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PRD Workspace</h1>
          <p className="text-gray-600">Manage your Product Requirements Documents</p>
        </div>
        <button
          onClick={onCreatePRD}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New PRD
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total PRDs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <Edit className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Suggestions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.aiSuggestions}</p>
            </div>
            <Bot className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
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
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value as PRDStage | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Stages</option>
              <option value="Create">Create</option>
              <option value="Generate">Generate</option>
              <option value="Edit">Edit</option>
              <option value="Finalise">Finalise</option>
              <option value="Approval">Approval</option>
              <option value="Update">Update</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as PRDPriority | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="updated">Sort by Updated</option>
              <option value="created">Sort by Created</option>
              <option value="title">Sort by Title</option>
              <option value="stage">Sort by Stage</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRD Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPRDs.map((prd) => {
          const workflowStage = getWorkflowStage(prd);
          return (
            <div
              key={prd.id}
              onClick={() => onPRDSelect(prd)}
              className="card card-hover group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {prd.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{prd.description}</p>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  {prd.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle more options
                    }}
                    className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(prd.stage)}`}>
                    {prd.stage}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(prd.priority)}`}>
                    {prd.priority}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    {getWorkflowIcon(workflowStage)}
                    <span>{workflowStage}</span>
                  </div>
                  <span>•</span>
                  <span>v{prd.version}</span>
                  <span>•</span>
                  <span>{prd.sections.length} sections</span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Updated {new Date(prd.updatedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{prd.comments.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bot className="w-4 h-4" />
                      <span>{prd.aiSuggestions.length}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredPRDs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No PRDs found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterStage !== 'all' || filterPriority !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first PRD to get started'
            }
          </p>
          <button
            onClick={onCreatePRD}
            className="btn-primary"
          >
            Create First PRD
          </button>
        </div>
      )}
    </div>
  );
}
