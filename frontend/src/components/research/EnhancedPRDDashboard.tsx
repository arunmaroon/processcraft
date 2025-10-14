import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle, 
  Edit, 
  Bot,
  ChevronRight,
  MoreVertical,
  Star,
  Users,
  TrendingUp,
  AlertCircle,
  Zap,
  Target,
  BarChart3,
  MessageSquare,
  Download,
  Upload,
  Settings,
  Bell,
  Eye,
  Copy,
  Archive
} from 'lucide-react';
import { EnhancedPRD, PRDStage, PRDStatus, PRDPriority } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';

export default function EnhancedPRDDashboard() {
  const navigate = useNavigate();
  const [prds, setPrds] = useState<EnhancedPRD[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<PRDStage | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<PRDStatus | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<PRDPriority | 'All'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPRD, setSelectedPRD] = useState<EnhancedPRD | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPRDs();
  }, []);

  const loadPRDs = () => {
    setIsLoading(true);
    const allPRDs = enhancedPRDService.getPRDs();
    setPrds(allPRDs);
    setIsLoading(false);
  };

  const filteredPRDs = prds.filter(prd => {
    const matchesSearch = prd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prd.sections.some(s => s.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStage = stageFilter === 'All' || prd.stage === stageFilter;
    const matchesStatus = statusFilter === 'All' || prd.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || prd.priority === priorityFilter;
    
    return matchesSearch && matchesStage && matchesStatus && matchesPriority;
  });

  const getStageCounts = () => {
    const counts = {
      Create: 0,
      Generate: 0,
      Edit: 0,
      Finalise: 0,
      Approval: 0,
      Update: 0
    };
    
    prds.forEach(prd => {
      counts[prd.stage]++;
    });
    
    return counts;
  };

  const getStatusCounts = () => {
    const counts = {
      Draft: 0,
      'In Review': 0,
      Approved: 0,
      'In Development': 0,
      Completed: 0,
      Archived: 0
    };
    
    prds.forEach(prd => {
      counts[prd.status]++;
    });
    
    return counts;
  };

  const stageCounts = getStageCounts();
  const statusCounts = getStatusCounts();

  const getStageIcon = (stage: PRDStage) => {
    switch (stage) {
      case 'Create': return <Plus className="w-4 h-4" />;
      case 'Generate': return <Bot className="w-4 h-4" />;
      case 'Edit': return <Edit className="w-4 h-4" />;
      case 'Finalise': return <CheckCircle className="w-4 h-4" />;
      case 'Approval': return <CheckCircle className="w-4 h-4" />;
      case 'Update': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
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

  const getStatusColor = (status: PRDStatus) => {
    switch (status) {
      case 'Draft': return 'text-gray-600 bg-gray-50';
      case 'In Review': return 'text-blue-600 bg-blue-50';
      case 'Approved': return 'text-green-600 bg-green-50';
      case 'In Development': return 'text-purple-600 bg-purple-50';
      case 'Completed': return 'text-green-600 bg-green-50';
      case 'Archived': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PRDs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PRD Management</h1>
          <p className="text-gray-600 mt-1">Powerful PRD creation and management for Product Managers</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </button>
          <button className="btn-outline flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => navigate('/prd/create')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New PRD
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total PRDs</p>
              <p className="text-2xl font-bold text-gray-900">{prds.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Review</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts['In Review']}</p>
            </div>
            <Eye className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.Approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Suggestions</p>
              <p className="text-2xl font-bold text-gray-900">
                {prds.reduce((acc, prd) => acc + prd.aiSuggestions.length, 0)}
              </p>
            </div>
            <Bot className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search PRDs, sections, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value as PRDStage | 'All')}
                className="input-field"
              >
                <option value="All">All Stages</option>
                <option value="Create">Create</option>
                <option value="Generate">Generate</option>
                <option value="Edit">Edit</option>
                <option value="Finalise">Finalise</option>
                <option value="Approval">Approval</option>
                <option value="Update">Update</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PRDStatus | 'All')}
                className="input-field"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="In Review">In Review</option>
                <option value="Approved">Approved</option>
                <option value="In Development">In Development</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as PRDPriority | 'All')}
                className="input-field"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Stage Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Stages</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(stageCounts).map(([stage, count]) => (
            <div key={stage} className="text-center">
              <div className={`w-12 h-12 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                stage === 'Edit' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {getStageIcon(stage as PRDStage)}
              </div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600">{stage}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PRD List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {searchQuery ? 'Search Results' : 'All PRDs'} ({filteredPRDs.length})
          </h2>
          <div className="flex items-center gap-2">
            <button className="btn-ghost text-sm">Sort by Date</button>
            <button className="btn-ghost text-sm">Sort by Priority</button>
          </div>
        </div>

        {filteredPRDs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {searchQuery ? 'No PRDs found' : 'No PRDs yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first PRD to get started'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigate('/prd/create')}
                className="btn-primary"
              >
                Create First PRD
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPRDs.map((prd) => (
              <div
                key={prd.id}
                className="card card-hover"
                onClick={() => navigate(`/prd/${prd.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{prd.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(prd.priority)}`}>
                        {prd.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(prd.status)}`}>
                        {prd.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="capitalize">{prd.type}</span>
                      <span>•</span>
                      <span>v{prd.version}</span>
                      <span>•</span>
                      <span>Updated {new Date(prd.updatedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>{prd.sections.length} sections</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{prd.comments.length} comments</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{prd.stakeholders.length} stakeholders</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bot className="w-4 h-4" />
                        <span>{prd.aiSuggestions.length} AI suggestions</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStageColor(prd.stage)}`}>
                      {getStageIcon(prd.stage)}
                      <span>{prd.stage}</span>
                    </div>
                    
                    {prd.isLocked && (
                      <div className="text-yellow-500" title="Locked">
                        🔒
                      </div>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPRD(prd);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
