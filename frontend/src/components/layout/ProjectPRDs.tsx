import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, FileText, Search, Filter, MoreHorizontal, Star, Edit, Eye } from 'lucide-react';
import { Project } from '../../types';
import { EnhancedPRD, PRDStage, PRDPriority } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';

interface ProjectPRDsProps {
  project: Project;
  onBack: () => void;
  onPRDSelect: (prd: EnhancedPRD) => void;
  onCreatePRD: () => void;
}

export default function ProjectPRDs({ project, onBack, onPRDSelect, onCreatePRD }: ProjectPRDsProps) {
  const [prds, setPrds] = useState<EnhancedPRD[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<PRDStage | 'all'>('all');

  useEffect(() => {
    loadPRDs();
  }, [project.id]);

  const loadPRDs = () => {
    const projectPRDs = enhancedPRDService.getPRDsByProject(project.id);
    setPrds(projectPRDs);
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

  const filteredPRDs = prds.filter(prd => {
    const matchesSearch = prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prd.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'all' || prd.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
        </div>
        <button
          onClick={onCreatePRD}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New PRD
        </button>
      </div>

      {/* Stats */}
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
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {prds.filter(p => p.stage === 'Edit' || p.stage === 'Generate').length}
              </p>
            </div>
            <Edit className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {prds.filter(p => p.stage === 'Approval' || p.stage === 'Update').length}
              </p>
            </div>
            <Star className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-gray-900">
                {prds.filter(p => p.stage === 'Create').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
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
        </div>
      </div>

      {/* PRD List */}
      <div className="space-y-4">
        {filteredPRDs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No PRDs found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStage !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first PRD for this project'
              }
            </p>
            <button
              onClick={onCreatePRD}
              className="btn-primary"
            >
              Create First PRD
            </button>
          </div>
        ) : (
          filteredPRDs.map((prd) => (
            <div
              key={prd.id}
              onClick={() => onPRDSelect(prd)}
              className="card card-hover group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {prd.title}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(prd.priority)}`}>
                      {prd.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(prd.stage)}`}>
                      {prd.stage}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{prd.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="capitalize">{prd.type}</span>
                    <span>•</span>
                    <span>v{prd.version}</span>
                    <span>•</span>
                    <span>Updated {new Date(prd.updatedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{prd.sections.length} sections</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {prd.isStarred && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}
