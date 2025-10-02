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
  ChevronDown,
  ChevronRight,
  Settings,
  Download,
  Upload,
  GitBranch,
  History
} from 'lucide-react';
import { Project, PRD } from '../../types';
import PRDGenerator from './PRDGenerator';
import PRDViewer from './PRDViewer';

interface PRDManagerProps {
  project: Project;
  onProjectUpdate: (project: Project) => void;
}

export default function PRDManager({ project, onProjectUpdate }: PRDManagerProps) {
  const [prds, setPrds] = useState<PRD[]>(project.prds || []);
  const [activePRD, setActivePRD] = useState<PRD | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'dashboard' | 'generator' | 'viewer'>('list');
  const [selectedPRD, setSelectedPRD] = useState<PRD | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load PRDs from project
  useEffect(() => {
    setPrds(project.prds || []);
    if (project.activePRDId) {
      const active = (project.prds || []).find(p => p.id === project.activePRDId);
      setActivePRD(active || null);
    }
  }, [project]);

  // API calls
  const fetchPRDs = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/multi-prd/${project.id}`);
      const data = await response.json();
      
      if (data.success) {
        setPrds(data.prds);
        if (data.activePRDId) {
          const active = data.prds.find((p: PRD) => p.id === data.activePRDId);
          setActivePRD(active || null);
        }
      }
    } catch (error) {
      console.error('Error fetching PRDs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPRD = async (prdData: Partial<PRD>) => {
    try {
      const response = await fetch(`/api/multi-prd/${project.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prdData)
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchPRDs();
        setViewMode('generator');
        setSelectedPRD(data.prd);
      }
    } catch (error) {
      console.error('Error creating PRD:', error);
    }
  };

  const updatePRD = async (prdId: string, updates: Partial<PRD>) => {
    try {
      const response = await fetch(`/api/multi-prd/${project.id}/${prdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchPRDs();
        if (updates.isActive) {
          setActivePRD(data.prd);
        }
      }
    } catch (error) {
      console.error('Error updating PRD:', error);
    }
  };

  const deletePRD = async (prdId: string) => {
    try {
      const response = await fetch(`/api/multi-prd/${project.id}/${prdId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchPRDs();
        if (activePRD?.id === prdId) {
          setActivePRD(null);
        }
      }
    } catch (error) {
      console.error('Error deleting PRD:', error);
    }
  };

  const copyPRD = async (prd: PRD) => {
    try {
      const response = await fetch(`/api/multi-prd/${project.id}/${prd.id}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newTitle: `${prd.title} (Copy)` })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchPRDs();
      }
    } catch (error) {
      console.error('Error copying PRD:', error);
    }
  };

  const setActivePRD = async (prdId: string) => {
    try {
      const response = await fetch(`/api/multi-prd/${project.id}/${prdId}/set-active`, {
        method: 'PUT'
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchPRDs();
        const active = prds.find(p => p.id === prdId);
        setActivePRD(active || null);
      }
    } catch (error) {
      console.error('Error setting active PRD:', error);
    }
  };

  const handlePRDGenerated = (generatedPRD: any) => {
    if (selectedPRD) {
      updatePRD(selectedPRD.id, {
        generatedContent: generatedPRD,
        status: 'DRAFT',
        lastModifiedBy: 'current-user'
      });
    }
  };

  const handlePRDFinalized = (finalizedPRD: any) => {
    if (selectedPRD) {
      updatePRD(selectedPRD.id, {
        generatedContent: finalizedPRD,
        status: 'IN_REVIEW',
        lastModifiedBy: 'current-user'
      });
    }
  };

  const handlePRDView = (prd: PRD) => {
    setSelectedPRD(prd);
    setViewMode('viewer');
  };

  const filteredPRDs = prds.filter(prd => {
    const matchesSearch = prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prd.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prd.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  // Render different views
  if (viewMode === 'generator' && selectedPRD) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to PRDs</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900">Generate PRD: {selectedPRD.title}</h2>
          </div>
        </div>
        
        <PRDGenerator
          project={project}
          onPRDGenerated={handlePRDGenerated}
          onPRDFinalized={handlePRDFinalized}
          isEditMode={true}
          existingPRD={selectedPRD}
        />
      </div>
    );
  }

  if (viewMode === 'viewer' && selectedPRD) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to PRDs</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900">{selectedPRD.title}</h2>
          </div>
        </div>
        
        <PRDViewer
          project={project}
          prd={selectedPRD}
          onPRDUpdate={(updatedPRD) => updatePRD(selectedPRD.id, updatedPRD)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PRD Management</h2>
          <p className="text-gray-600">Manage multiple PRDs for {project.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setViewMode('dashboard')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'dashboard' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create PRD</span>
          </button>
        </div>
      </div>

      {/* Active PRD Banner */}
      {activePRD && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Star className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Active PRD</h3>
                <p className="text-sm text-blue-700">{activePRD.title}</p>
              </div>
            </div>
            <button
              onClick={() => handlePRDView(activePRD)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View →
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
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
      </div>

      {/* PRD List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading PRDs...</p>
          </div>
        ) : filteredPRDs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No PRDs found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first PRD.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
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
              className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow ${
                prd.isActive ? 'ring-1 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
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
                        <span>{prd.status.replace('_', ' ')}</span>
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
                    onClick={() => handlePRDView(prd)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View PRD"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPRD(prd);
                      setViewMode('generator');
                    }}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit PRD"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyPRD(prd)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Copy PRD"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {!prd.isActive && (
                    <button
                      onClick={() => setActivePRD(prd.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Set as Active"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deletePRD(prd.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete PRD"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
          onCreate={createPRD}
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
      title: formData.title,
      description: formData.description,
      objectives: [],
      targetUsers: [],
      successMetrics: [],
      businessContext: '',
      constraints: [],
      status: 'DRAFT',
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

