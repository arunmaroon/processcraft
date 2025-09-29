import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, MoreVertical, Clock, CheckCircle, Trash2, Edit3, Layout as LayoutIcon, Palette, Type } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project, ProjectStatus, WorkflowStage } from '../../types';

const statusColors: { [key in ProjectStatus]: string } = {
  DRAFT: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
};

const stageIcons: { [key in WorkflowStage]: React.ComponentType<any> } = {
  PRODUCT_THINKING: Clock,
  USER_RESEARCH: Search,
  UX_DESIGN: CheckCircle,
  UI_DESIGN: LayoutIcon,
  VISUAL_DESIGN: Palette,
  UX_CONTENT: Type,
  CODE_EXPORT: CheckCircle,
};

export default function ProjectManager() {
  const { state, createProject, deleteProject } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredProjects = state.projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleCreateProject = async (projectData: {
    name: string;
    description: string;
    objectives: string[];
    targetUsers: string[];
    successMetrics: string[];
  }) => {
    try {
      const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
        name: projectData.name,
        description: projectData.description,
        status: 'DRAFT',
        currentStage: 'PRODUCT_THINKING',
        assignedUsers: {
          PM: [state.user?.id || '1'],
        },
        prd: {
          id: `prd-${Date.now()}`,
          objectives: projectData.objectives,
          targetUsers: projectData.targetUsers,
          successMetrics: projectData.successMetrics,
          businessContext: '',
          constraints: [],
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      await createProject(newProject);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };


  const handleClickOutside = (event: MouseEvent) => {
    if (activeDropdown && !(event.target as Element).closest('.dropdown-container')) {
      setActiveDropdown(null);
    }
  };

  useEffect(() => {
    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            {state.user?.role?.replace('_', ' ').toLowerCase() || 'Unknown'}
          </span>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>


      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterStatus !== 'ALL' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by creating your first project.'
            }
          </p>
          {!searchQuery && filterStatus === 'ALL' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const StageIcon = stageIcons[project.currentStage] || Clock;
            
            return (
              <div
                key={project.id}
                className="card hover:shadow-md transition-shadow duration-200 group relative"
              >
                {/* Dropdown Menu - Outside Link */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === project.id ? null : project.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    {activeDropdown === project.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveDropdown(null);
                            // Handle edit
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit Project</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveDropdown(null);
                            setDeleteConfirm(project.id);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete Project</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Content - Inside Link */}
                <Link
                  to={`/project/${project.id}`}
                  className="block pr-8"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <StageIcon className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">
                      {project.currentStage.replace('_', ' ')}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[project.status]}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs">v{project.version}</span>
                </div>
              </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Project</h3>
                <p className="text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    objectives: string[];
    targetUsers: string[];
    successMetrics: string[];
  }) => void;
}

function CreateProjectModal({ onClose, onSubmit }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objectives: [''],
    targetUsers: [''],
    successMetrics: ['']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredData = {
      ...formData,
      objectives: formData.objectives.filter(obj => obj.trim() !== ''),
      targetUsers: formData.targetUsers.filter(user => user.trim() !== ''),
      successMetrics: formData.successMetrics.filter(metric => metric.trim() !== '')
    };
    onSubmit(filteredData);
  };

  const addArrayItem = (field: 'objectives' | 'targetUsers' | 'successMetrics') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateArrayItem = (field: 'objectives' | 'targetUsers' | 'successMetrics', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeArrayItem = (field: 'objectives' | 'targetUsers' | 'successMetrics', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
          <p className="text-gray-600 mt-1">Start a new AI-powered UX design workflow</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Describe your project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectives
            </label>
            {formData.objectives.map((objective, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => updateArrayItem('objectives', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter objective"
                />
                {formData.objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('objectives', index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('objectives')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add Objective
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Users
            </label>
            {formData.targetUsers.map((user, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={user}
                  onChange={(e) => updateArrayItem('targetUsers', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter target user"
                />
                {formData.targetUsers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('targetUsers', index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('targetUsers')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add Target User
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Success Metrics
            </label>
            {formData.successMetrics.map((metric, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={metric}
                  onChange={(e) => updateArrayItem('successMetrics', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter success metric"
                />
                {formData.successMetrics.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('successMetrics', index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('successMetrics')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              + Add Success Metric
            </button>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}