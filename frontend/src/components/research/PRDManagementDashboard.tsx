import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  CheckCircle, 
  Clock, 
  Archive,
  Tag,
  User,
  Calendar,
  Star,
  ArrowRight,
  Download,
  Upload
} from 'lucide-react';
import { Project, PRD, PRDChange } from '../../types';

interface PRDManagementDashboardProps {
  project: Project;
  onPRDCreate: (prdData: Partial<PRD>) => void;
  onPRDUpdate: (prdId: string, updates: Partial<PRD>) => void;
  onPRDDelete: (prdId: string) => void;
  onPRDView: (prd: PRD) => void;
  onPRDCopy: (prd: PRD) => void;
  onSetActivePRD: (prdId: string) => void;
}

export default function PRDManagementDashboard({
  project,
  onPRDCreate,
  onPRDUpdate,
  onPRDDelete,
  onPRDView,
  onPRDCopy,
  onSetActivePRD
}: PRDManagementDashboardProps) {
  const [prds, setPrds] = useState<PRD[]>(project.prds || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'title' | 'status'>('updated');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPRD, setSelectedPRD] = useState<PRD | null>(null);
  const [showPRDDetails, setShowPRDDetails] = useState(false);

  // Update PRDs when project changes
  useEffect(() => {
    setPrds(project.prds || []);
  }, [project.prds]);

  // Filter and sort PRDs
  const filteredPRDs = prds
    .filter(prd => {
      const matchesSearch = prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prd.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prd.objectives.some(obj => obj.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || prd.status === statusFilter;
      const matchesTag = tagFilter === 'all' || prd.tags.includes(tagFilter);
      
      return matchesSearch && matchesStatus && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'IN_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <Edit className="w-4 h-4" />;
      case 'IN_REVIEW': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <Trash2 className="w-4 h-4" />;
      case 'ARCHIVED': return <Archive className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const handleCreatePRD = () => {
    setShowCreateForm(true);
  };

  const handlePRDAction = (action: string, prd: PRD) => {
    switch (action) {
      case 'view':
        onPRDView(prd);
        break;
      case 'edit':
        // Navigate to PRD editor
        break;
      case 'copy':
        onPRDCopy(prd);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete "${prd.title}"?`)) {
          onPRDDelete(prd.id);
        }
        break;
      case 'setActive':
        onSetActivePRD(prd.id);
        break;
      case 'archive':
        onPRDUpdate(prd.id, { status: 'ARCHIVED' });
        break;
    }
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    prds.forEach(prd => {
      prd.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  };

  const getPRDStats = () => {
    const total = prds.length;
    const draft = prds.filter(p => p.status === 'DRAFT').length;
    const inReview = prds.filter(p => p.status === 'IN_REVIEW').length;
    const approved = prds.filter(p => p.status === 'APPROVED').length;
    const active = prds.filter(p => p.isActive).length;
    
    return { total, draft, inReview, approved, active };
  };

  const stats = getPRDStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PRD Management</h2>
          <p className="text-gray-600">Manage multiple PRDs for {project.name}</p>
        </div>
        <button
          onClick={handleCreatePRD}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create New PRD</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total PRDs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Edit className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Draft</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">In Review</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.inReview}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Approved</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Active</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
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
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tags</option>
              {getAllTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRD List */}
      <div className="space-y-4">
        {filteredPRDs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No PRDs found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || tagFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first PRD.'}
            </p>
            {!searchTerm && statusFilter === 'all' && tagFilter === 'all' && (
              <button
                onClick={handleCreatePRD}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First PRD
              </button>
            )}
          </div>
        ) : (
          filteredPRDs.map(prd => (
            <div
              key={prd.id}
              className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                prd.isActive ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{prd.title}</h3>
                    {prd.isActive && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prd.status)}`}>
                      {getStatusIcon(prd.status)}
                      <span>{prd.status?.replace('_', ' ') || 'Unknown'}</span>
                    </span>
                  </div>
                  
                  {prd.description && (
                    <p className="text-gray-600 mb-3">{prd.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>v{prd.version}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Updated {new Date(prd.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {prd.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Tag className="w-4 h-4" />
                        <span>{prd.tags.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {prd.objectives.slice(0, 3).map((objective, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {objective.length > 50 ? `${objective.substring(0, 50)}...` : objective}
                      </span>
                    ))}
                    {prd.objectives.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{prd.objectives.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handlePRDAction('view', prd)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View PRD"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePRDAction('edit', prd)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit PRD"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePRDAction('copy', prd)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Copy PRD"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {!prd.isActive && (
                    <button
                      onClick={() => handlePRDAction('setActive', prd)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Set as Active"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <div className="relative">
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {/* Dropdown menu would go here */}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create PRD Form Modal */}
      {showCreateForm && (
        <CreatePRDForm
          project={project}
          onClose={() => setShowCreateForm(false)}
          onCreate={(prdData) => {
            onPRDCreate(prdData);
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
}

// Create PRD Form Component
interface CreatePRDFormProps {
  project: Project;
  onClose: () => void;
  onCreate: (prdData: Partial<PRD>) => void;
}

function CreatePRDForm({ project, onClose, onCreate }: CreatePRDFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    tagInput: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPRD: Partial<PRD> = {
      id: `prd_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      objectives: [],
      targetUsers: [],
      successMetrics: [],
      businessContext: '',
      constraints: [],
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current-user', // This should come from auth context
      lastModifiedBy: 'current-user',
      version: '1.0',
      isActive: false,
      tags: formData.tags,
      changeLog: []
    };

    onCreate(newPRD);
  };

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New PRD</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PRD Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Mobile App MVP PRD"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Brief description of what this PRD covers..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.tagInput}
                onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add tags (press Enter)"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create PRD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


