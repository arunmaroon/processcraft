import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, MessageCircle, BarChart3, Trash2, Edit, Eye, Shield } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  demographics: {
    age?: number;
    gender?: string;
    location?: any;
    education?: string;
    occupation?: string;
    income_range?: string;
    family_status?: string;
  };
  personality?: any;
  communication_style?: any;
  psychological_profile?: {
    motivations?: string[];
    fears?: string[];
    values?: string[];
    aspirations?: string[];
  };
  financial_profile?: any;
  consistency_score?: number;
  realism_score?: number;
  engagement_score?: number;
  usage_count?: number;
  tags?: string[];
  created_at?: string;
}

interface AgentLibraryProps {
  onSelectAgent: (agent: Agent) => void;
  onEditAgent: (agent: Agent) => void;
  onDeleteAgent: (agentId: string) => void;
}

const AgentLibrary: React.FC<AgentLibraryProps> = ({ onSelectAgent, onEditAgent, onDeleteAgent }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    age_min: '',
    age_max: '',
    income_range: '',
    occupation: '',
    tags: [] as string[],
    sort_by: 'created_at',
    sort_order: 'DESC'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchAgents();
  }, [filters, pagination.page]);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm, filters]);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/agents?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      } else {
        console.error('Failed to fetch agents');
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = [...agents];

    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.demographics?.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.demographics?.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAgents(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAgents.length === filteredAgents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(filteredAgents.map(agent => agent.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAgents.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedAgents.length} agents?`)) {
      try {
        await Promise.all(
          selectedAgents.map(agentId =>
            fetch(`/api/agents/${agentId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
              }
            })
          )
        );
        setSelectedAgents([]);
        fetchAgents();
      } catch (error) {
        console.error('Error deleting agents:', error);
      }
    }
  };

  const handleBiasCheck = async (agent: Agent) => {
    try {
      const response = await fetch('/api/agents/bias-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          agent: agent
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Bias Check Results for ${agent.name}:\n\n${result.analysis}`);
      } else {
        alert('Error running bias check. Please try again.');
      }
    } catch (error) {
      console.error('Error running bias check:', error);
      alert('Error running bias check. Please try again.');
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderAgentCard = (agent: Agent) => (
    <div
      key={agent.id}
      className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow ${
        selectedAgents.includes(agent.id) ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedAgents.includes(agent.id)}
            onChange={() => handleSelectAgent(agent.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {agent.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-500">
              {agent.demographics?.age} years • {agent.demographics?.occupation}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onSelectAgent(agent)}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEditAgent(agent)}
            className="p-1 text-gray-400 hover:text-green-600"
            title="Edit Agent"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleBiasCheck(agent)}
            className="p-1 text-gray-400 hover:text-purple-600"
            title="Bias Check"
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteAgent(agent.id)}
            className="p-1 text-gray-400 hover:text-red-600"
            title="Delete Agent"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Consistency</span>
          <span className={getScoreColor(agent.consistency_score)}>
            {agent.consistency_score ? (agent.consistency_score * 100).toFixed(0) + '%' : 'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Realism</span>
          <span className={getScoreColor(agent.realism_score)}>
            {agent.realism_score ? (agent.realism_score * 100).toFixed(0) + '%' : 'N/A'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Engagement</span>
          <span className={getScoreColor(agent.engagement_score)}>
            {agent.engagement_score ? (agent.engagement_score * 100).toFixed(0) + '%' : 'N/A'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Used {agent.usage_count || 0} times</span>
        <span>{new Date(agent.created_at || '').toLocaleDateString()}</span>
      </div>

      {agent.tags && agent.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {agent.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{agent.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );

  const renderAgentList = (agent: Agent) => (
    <div
      key={agent.id}
      className={`bg-white border border-gray-200 p-4 hover:bg-gray-50 ${
        selectedAgents.includes(agent.id) ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="checkbox"
            checked={selectedAgents.includes(agent.id)}
            onChange={() => handleSelectAgent(agent.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {agent.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-500">
              {agent.demographics?.age} years • {agent.demographics?.occupation} • {agent.demographics?.location?.city}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-center">
              <div className={getScoreColor(agent.consistency_score)}>
                {agent.consistency_score ? (agent.consistency_score * 100).toFixed(0) + '%' : 'N/A'}
              </div>
              <div className="text-gray-500 text-xs">Consistency</div>
            </div>
            <div className="text-center">
              <div className={getScoreColor(agent.realism_score)}>
                {agent.realism_score ? (agent.realism_score * 100).toFixed(0) + '%' : 'N/A'}
              </div>
              <div className="text-gray-500 text-xs">Realism</div>
            </div>
            <div className="text-center">
              <div className={getScoreColor(agent.engagement_score)}>
                {agent.engagement_score ? (agent.engagement_score * 100).toFixed(0) + '%' : 'N/A'}
              </div>
              <div className="text-gray-500 text-xs">Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-gray-900">{agent.usage_count || 0}</div>
              <div className="text-gray-500 text-xs">Usage</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelectAgent(agent)}
              className="p-1 text-gray-400 hover:text-blue-600"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEditAgent(agent)}
              className="p-1 text-gray-400 hover:text-green-600"
              title="Edit Agent"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteAgent(agent.id)}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Delete Agent"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Agent Library</h2>
          <p className="text-gray-600">Manage and explore your AI agents</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents by name, occupation, or location..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.age_min}
                  onChange={(e) => handleFilterChange('age_min', e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.age_max}
                  onChange={(e) => handleFilterChange('age_max', e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Income Range</label>
              <select
                value={filters.income_range}
                onChange={(e) => handleFilterChange('income_range', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="">All Income Ranges</option>
                <option value="under-5L">under-5L</option>
                <option value="5L-10L">5L-10L</option>
                <option value="10L-15L">10L-15L</option>
                <option value="15L-20L">15L-20L</option>
                <option value="20L+">20L+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <input
                type="text"
                placeholder="Filter by occupation"
                value={filters.occupation}
                onChange={(e) => handleFilterChange('occupation', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="created_at">Created Date</option>
                <option value="name">Name</option>
                <option value="usage_count">Usage Count</option>
                <option value="consistency_score">Consistency Score</option>
                <option value="realism_score">Realism Score</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedAgents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">
              {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {selectedAgents.length === filteredAgents.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agents Display */}
      {filteredAgents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map(renderAgentCard)}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAgents.map(renderAgentList)}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} agents
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AgentLibrary;
