import React, { useState, useEffect, useMemo } from 'react';
import {
    UserGroupIcon,
    MagnifyingGlassIcon,
    DocumentTextIcon,
    SparklesIcon,
    PlusIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import EnhancedAgentCreator from '../components/EnhancedAgentCreator';
import AgentGrid from '../components/AgentGrid';

const formatTitleCase = (value = '') => {
    if (!value) return '';
    const clean = value.toString().replace(/_/g, ' ').toLowerCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const complexityToEnglishLevel = (complexity) => {
    if (complexity >= 8) return 'Advanced';
    if (complexity >= 6) return 'Intermediate';
    if (complexity >= 4) return 'Basic';
    if (complexity > 0) return 'Beginner';
    return 'Unknown';
};

const deriveEnglishLevel = (agent) => {
    if (agent?.vocabulary_profile?.complexity) {
        return complexityToEnglishLevel(agent.vocabulary_profile.complexity);
    }
    const gauge = agent?.gauges?.english_literacy;
    if (!gauge) return 'Unknown';
    const normalized = gauge.toLowerCase();
    switch (normalized) {
        case 'high':
            return 'Advanced';
        case 'medium':
            return 'Intermediate';
        case 'low':
            return 'Basic';
        case 'basic':
            return 'Beginner';
        default:
            return formatTitleCase(gauge);
    }
};

const normalizeStatus = (status) => {
    if (typeof status === 'boolean') {
        return status ? 'active' : 'archived';
    }
    if (typeof status === 'string') {
        return status.toLowerCase();
    }
    return 'active';
};

const normalizeLevel = (value, fallback = 'medium') => {
    if (!value) return fallback;
    return value.toString().toLowerCase();
};

const StatCard = ({ label, value, accentClass = 'text-gray-900' }) => (
    <div className="rounded-lg border border-gray-100 bg-white px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className={`mt-1 text-xl font-semibold ${accentClass}`}>{value}</p>
    </div>
);

const AgentLibrary = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ageFilter, setAgeFilter] = useState('all');
    const [techFilter, setTechFilter] = useState('all');
    const [englishFilter, setEnglishFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [showEnhancedCreator, setShowEnhancedCreator] = useState(false);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/agents/v5?view=short');
            const normalized = (response.data || []).map(agent => {
                const status = normalizeStatus(agent.status);
                const techLevel = normalizeLevel(agent.tech_savviness || agent.gauges?.tech);
                const domainLevel = normalizeLevel(agent.domain_literacy?.level || agent.gauges?.domain);
                const englishLevel = deriveEnglishLevel(agent);
                const locationLabel = agent.location || 'Unknown';

                return {
                    ...agent,
                    status,
                    statusLabel: formatTitleCase(status),
                    tech_savviness: techLevel,
                    techLabel: formatTitleCase(techLevel),
                    domainLevel: formatTitleCase(domainLevel),
                    englishLevel,
                    locationLabel
                };
            });
            setAgents(normalized);
        } catch (error) {
            console.error('Error fetching agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => ({
        total: agents.length,
        active: agents.filter(agent => agent.status === 'active').length,
        sleeping: agents.filter(agent => agent.status === 'sleeping').length,
        archived: agents.filter(agent => agent.status === 'archived').length
    }), [agents]);

    const locationOptions = useMemo(() => {
        const set = new Set();
        agents.forEach(agent => {
            if (agent.locationLabel && agent.locationLabel !== 'Unknown') {
                set.add(agent.locationLabel);
            }
        });
        return Array.from(set).sort();
    }, [agents]);

    const filteredAgents = useMemo(() => {
        return agents.filter(agent => {
            const searchValue = searchTerm.trim().toLowerCase();
            const matchesSearch = !searchValue ||
                agent.name?.toLowerCase().includes(searchValue) ||
                agent.occupation?.toLowerCase().includes(searchValue) ||
                agent.role_title?.toLowerCase().includes(searchValue) ||
                agent.quote?.toLowerCase().includes(searchValue);

            const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;

            const age = agent.demographics?.age ?? agent.age;
            const matchesAge =
                ageFilter === 'all' ||
                (ageFilter === 'young' && age && age < 30) ||
                (ageFilter === 'adult' && age && age >= 30 && age < 50) ||
                (ageFilter === 'mature' && age && age >= 50);

            const matchesTech = techFilter === 'all' || agent.tech_savviness === techFilter;
            const matchesEnglish = englishFilter === 'all' || agent.englishLevel === englishFilter;
            const matchesLocation = locationFilter === 'all' || agent.locationLabel === locationFilter;

            return matchesSearch && matchesStatus && matchesAge && matchesTech && matchesEnglish && matchesLocation;
        });
    }, [agents, searchTerm, statusFilter, ageFilter, techFilter, englishFilter, locationFilter]);

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setAgeFilter('all');
        setTechFilter('all');
        setEnglishFilter('all');
        setLocationFilter('all');
    };

    const handleAddTestAgent = async () => {
        try {
            await api.post('/agents/v5', {
                transcript: {
                    raw_text: 'This is a test transcript for creating a demo agent. The person is friendly and helpful, always willing to assist with questions and provide guidance. They love using mobile apps for banking and are eager to learn new features. They sometimes get confused by technical terms and are apprehensive about making mistakes. They prefer simple language and step-by-step instructions.',
                    file_name: 'test_transcript.txt'
                },
                demographics: {}
            });
            fetchAgents();
        } catch (error) {
            console.error('Error creating test agent:', error);
        }
    };

    const handleAgentCreated = () => {
        fetchAgents();
        setShowEnhancedCreator(false);
    };

    const handleStartChat = (agent) => {
        window.location.href = `/enhanced-chat/${agent.id}`;
    };

    const handleDeleteAgent = async (agentId) => {
        try {
            await api.delete(`/agents/v5/${agentId}`);
            fetchAgents();
        } catch (error) {
            console.error('Error deleting agent:', error);
        }
    };

    const handleAgentStatusChange = (agentId, newStatus) => {
        setAgents(prevAgents =>
            prevAgents.map(agent =>
                agent.id === agentId
                    ? { ...agent, status: newStatus, statusLabel: formatTitleCase(newStatus) }
                    : agent
            )
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                            <UserGroupIcon className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Agent Library</h1>
                            <p className="text-sm text-gray-500">
                                Curate, explore, and chat with your research personas.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => window.location.href = '/group-chat'}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                        >
                            <ChatBubbleLeftRightIcon className="h-5 w-5" />
                            Group Chat
                        </button>
                        <button
                            onClick={handleAddTestAgent}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add Test Agent
                        </button>
                        <button
                            onClick={() => setShowEnhancedCreator(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                        >
                            <SparklesIcon className="h-5 w-5" />
                            Generate New Agent
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <StatCard label="Total Agents" value={stats.total} />
                    <StatCard label="Active" value={stats.active} accentClass="text-emerald-600" />
                    <StatCard label="Sleeping" value={stats.sleeping} accentClass="text-amber-600" />
                    <StatCard label="Archived" value={stats.archived} accentClass="text-rose-600" />
                </div>

                <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="relative">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search agents by name, occupation, or quote..."
                            className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm text-gray-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="sleeping">Sleeping</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Age</label>
                            <select
                                value={ageFilter}
                                onChange={(e) => setAgeFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="all">All Ages</option>
                                <option value="young">Younger than 30</option>
                                <option value="adult">30 to 49</option>
                                <option value="mature">50 and above</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Tech Comfort</label>
                            <select
                                value={techFilter}
                                onChange={(e) => setTechFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="all">All</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">English</label>
                            <select
                                value={englishFilter}
                                onChange={(e) => setEnglishFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="all">All</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Basic">Basic</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Unknown">Unknown</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-500">Location</label>
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="all">All Locations</option>
                                {locationOptions.map(location => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end justify-end">
                            <button
                                onClick={resetFilters}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                        <svg className="h-8 w-8 animate-spin text-emerald-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-sm text-gray-500">Loading agents...</p>
                    </div>
                ) : filteredAgents.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No agents match your filters</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            {searchTerm ? 'Try a different search term or clear the filters.' : 'Generate a new persona to get started.'}
                        </p>
                        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <button
                                onClick={() => setShowEnhancedCreator(true)}
                                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                                <DocumentTextIcon className="h-5 w-5" />
                                Generate Agent
                            </button>
                            <button
                                onClick={handleAddTestAgent}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
                            >
                                <PlusIcon className="h-5 w-5" />
                                Add Test Agent
                            </button>
                        </div>
                    </div>
                ) : (
                    <AgentGrid
                        agents={filteredAgents}
                        onSelectAgent={handleStartChat}
                        onDeleteAgent={handleDeleteAgent}
                        onAgentStatusChange={handleAgentStatusChange}
                    />
                )}
            </div>

            {showEnhancedCreator && (
                <EnhancedAgentCreator
                    onClose={() => setShowEnhancedCreator(false)}
                    onAgentCreated={handleAgentCreated}
                />
            )}
        </div>
    );
};

export default AgentLibrary;
