import React, { useState } from 'react';
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
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Project, PRD } from '../../types';

interface PRDListProps {
  project: Project;
  onPRDCreate: (prdData: Partial<PRD>) => void;
  onPRDUpdate: (prdId: string, updates: Partial<PRD>) => void;
  onPRDDelete: (prdId: string) => void;
  onPRDView: (prd: PRD) => void;
  onPRDCopy: (prd: PRD) => void;
  onSetActivePRD: (prdId: string) => void;
  compact?: boolean;
}

export default function PRDList({
  project,
  onPRDCreate,
  onPRDUpdate,
  onPRDDelete,
  onPRDView,
  onPRDCopy,
  onSetActivePRD,
  compact = false
}: PRDListProps) {
  const [prds, setPrds] = useState<PRD[]>(project.prds || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedPRDs, setExpandedPRDs] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredPRDs = prds
    .filter(prd => {
      const matchesSearch = prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prd.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || prd.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

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
      case 'DRAFT': return <Edit className="w-3 h-3" />;
      case 'IN_REVIEW': return <Clock className="w-3 h-3" />;
      case 'APPROVED': return <CheckCircle className="w-3 h-3" />;
      case 'REJECTED': return <Trash2 className="w-3 h-3" />;
      case 'ARCHIVED': return <Archive className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const toggleExpanded = (prdId: string) => {
    const newExpanded = new Set(expandedPRDs);
    if (newExpanded.has(prdId)) {
      newExpanded.delete(prdId);
    } else {
      newExpanded.add(prdId);
    }
    setExpandedPRDs(newExpanded);
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

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">PRDs ({prds.length})</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
        </div>

        {/* Compact List */}
        <div className="space-y-1">
          {filteredPRDs.map(prd => (
            <div
              key={prd.id}
              className={`flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
                prd.isActive ? 'ring-1 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <button
                  onClick={() => toggleExpanded(prd.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {expandedPRDs.has(prd.id) ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                  }
                </button>
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{prd.title}</h4>
                    {prd.isActive && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                    <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-xs ${getStatusColor(prd.status)}`}>
                      {getStatusIcon(prd.status)}
                      <span>{prd.status?.replace('_', ' ') || 'Unknown'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">v{prd.version} • {new Date(prd.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePRDAction('view', prd)}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  title="View"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handlePRDAction('edit', prd)}
                  className="p-1 text-gray-400 hover:text-green-600 rounded"
                  title="Edit"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handlePRDAction('copy', prd)}
                  className="p-1 text-gray-400 hover:text-purple-600 rounded"
                  title="Copy"
                >
                  <Copy className="w-3 h-3" />
                </button>
                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <MoreVertical className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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
        <div className="flex gap-2">
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
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create PRD</span>
          </button>
        </div>
      </div>

      {/* PRD List */}
      <div className="space-y-3">
        {filteredPRDs.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No PRDs found</h3>
            <p className="text-xs text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first PRD.'}
            </p>
          </div>
        ) : (
          filteredPRDs.map(prd => (
            <div
              key={prd.id}
              className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow ${
                prd.isActive ? 'ring-1 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleExpanded(prd.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedPRDs.has(prd.id) ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </button>
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{prd.title}</h4>
                      {prd.isActive && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(prd.status)}`}>
                        {getStatusIcon(prd.status)}
                        <span>{prd.status?.replace('_', ' ') || 'Unknown'}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>v{prd.version}</span>
                      <span>Updated {new Date(prd.updatedAt).toLocaleDateString()}</span>
                      {prd.tags.length > 0 && (
                        <span className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>{prd.tags.slice(0, 2).join(', ')}</span>
                          {prd.tags.length > 2 && <span>+{prd.tags.length - 2}</span>}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
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
                </div>
              </div>
              
              {/* Expanded Content */}
              {expandedPRDs.has(prd.id) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {prd.description && (
                    <p className="text-sm text-gray-600 mb-3">{prd.description}</p>
                  )}
                  
                  {prd.objectives.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">Objectives:</h5>
                      <div className="flex flex-wrap gap-1">
                        {prd.objectives.slice(0, 3).map((objective, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {objective.length > 40 ? `${objective.substring(0, 40)}...` : objective}
                          </span>
                        ))}
                        {prd.objectives.length > 3 && (
                          <span className="text-gray-500 text-xs">
                            +{prd.objectives.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created by {prd.createdBy}</span>
                      <span>Last modified by {prd.lastModifiedBy}</span>
                    </div>
                    <button
                      onClick={() => handlePRDAction('view', prd)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
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

// Create PRD Form Component (reused from PRDManagementDashboard)
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
      createdBy: 'current-user',
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


