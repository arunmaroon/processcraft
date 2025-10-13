import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import GroupChat from '../components/GroupChat';
import { Card, Button } from '../design-system';
import { 
    UserGroupIcon, 
    PlusIcon, 
    XMarkIcon,
    CheckIcon,
    ArrowLeftIcon,
    DocumentTextIcon,
    FunnelIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import useChatStore from '../stores/chatStore';
import { getAvatarSrc, handleAvatarError } from '../utils/avatar';

const GroupChatPage = () => {
    const navigate = useNavigate();
    const [allAgents, setAllAgents] = useState([]);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [showAgentSelector, setShowAgentSelector] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOccupation, setFilterOccupation] = useState('');
    const [filterTechSavvy, setFilterTechSavvy] = useState('');
    const [filterEnglishSavvy, setFilterEnglishSavvy] = useState('');
    const [chatPurpose, setChatPurpose] = useState('');
    const [isChatActive, setIsChatActive] = useState(false);

    // Only subscribe to needed methods to prevent unnecessary re-renders
    const generateSummary = useChatStore((state) => state.generateSummary);
    const getAllSessions = useChatStore((state) => state.getAllSessions);
    const startGroupChatSession = useChatStore((state) => state.startGroupChatSession);
    const loadGroupChatHistory = useChatStore((state) => state.loadGroupChatHistory);
    const loadLastActiveGroupChat = useChatStore((state) => state.loadLastActiveGroupChat);
    const activeGroupId = useChatStore((state) => state.activeGroupId);
    const activeGroupAgents = useChatStore((state) => state.activeGroupAgents);
    const groupPurpose = useChatStore((state) => state.groupPurpose);

    useEffect(() => {
        fetchAllAgents();
        // Load last active group chat on mount
        const loadedGroupId = loadLastActiveGroupChat();
        if (loadedGroupId) {
            setIsChatActive(true);
            toast.success('Restored previous group chat session');
        }
    }, [loadLastActiveGroupChat]);

    // Sync local state with store state when store changes
    useEffect(() => {
        if (activeGroupId && activeGroupAgents.length > 0) {
            setSelectedAgents(activeGroupAgents);
            setChatPurpose(groupPurpose);
        }
    }, [activeGroupId, activeGroupAgents, groupPurpose]);

    const fetchAllAgents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/enhanced-chat/personas');
            setAllAgents(response.data.personas);
        } catch (err) {
            console.error('Error fetching agents:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleAgentSelection = (agent) => {
        setSelectedAgents((prev) => {
            const isSelected = prev.find((a) => a.id === agent.id);
            if (isSelected) {
                return prev.filter((a) => a.id !== agent.id);
            }
            return [...prev, agent];
        });
    };

    const startGroupChat = () => {
        if (selectedAgents.length < 2) {
            toast.error('Please select at least 2 agents for group chat');
            return;
        }
        if (!chatPurpose.trim()) {
            toast.error('Please enter the purpose of the chat');
            return;
        }

        const groupId = startGroupChatSession(selectedAgents, chatPurpose);
        loadGroupChatHistory(groupId);
        setShowAgentSelector(false);
        setIsChatActive(true);
        toast.success(`Starting group chat with ${selectedAgents.length} agents`);
    };

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const result = await generateSummary();
            if (result.error) {
                toast.error(result.error);
            } else {
                setSummary(result);
                setShowSummary(true);
                toast.success('Summary generated successfully');
            }
        } catch (error) {
            console.error('Error generating summary:', error);
            toast.error('Failed to generate summary');
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const sessions = getAllSessions();

    const getTechSavvyLevel = (agent) => agent.tech_savviness || 'Unknown';
    const getDomainSavvyLevel = (agent) => agent.domain_savvy || 'Medium';
    const getEnglishSavvyLevel = (agent) => {
        // Check multiple possible locations for English proficiency
        if (agent.english_savvy) return agent.english_savvy;
        if (agent.communication_style?.english_proficiency) return agent.communication_style.english_proficiency;
        if (agent.communication_style?.english_level) return agent.communication_style.english_level;
        return 'Medium'; // Default fallback
    };

    const filteredAgents = allAgents.filter((agent) => {
        const matchesSearch =
            agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesOccupation = !filterOccupation || agent.occupation === filterOccupation;
        const matchesTechSavvy = !filterTechSavvy || getTechSavvyLevel(agent) === filterTechSavvy;
        const matchesEnglishSavvy = !filterEnglishSavvy || getEnglishSavvyLevel(agent) === filterEnglishSavvy;
        return matchesSearch && matchesOccupation && matchesTechSavvy && matchesEnglishSavvy;
    });

    const occupations = [...new Set(allAgents.map((agent) => agent.occupation))];
    const techSavvyLevels = [...new Set(allAgents.map((agent) => getTechSavvyLevel(agent)))];
    const englishSavvyLevels = [...new Set(allAgents.map((agent) => getEnglishSavvyLevel(agent)))];
    
    // Sort English levels for better UX
    const sortedEnglishLevels = englishSavvyLevels.sort((a, b) => {
        const order = ['Advanced', 'High', 'Medium', 'Low'];
        return order.indexOf(a) - order.indexOf(b);
    });

    const clearFilters = () => {
        setSearchTerm('');
        setFilterOccupation('');
        setFilterTechSavvy('');
        setFilterEnglishSavvy('');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading agents...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 flex flex-col">
                <Toaster position="top-right" />
                
                {/* Compact Toolbar */}
                <div className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/agents')}
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700"
                            >
                                <ArrowLeftIcon className="h-5 w-5" />
                            </button>
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
                                    <UserGroupIcon className="h-4 w-4" />
                                    Multi-Agent Workshop
                                </div>
                                <h1 className="mt-2 text-2xl font-semibold leading-tight text-slate-900 lg:text-[28px]">
                                    Group Strategy Conversation
                                </h1>
                                {selectedAgents.length > 0 && (
                                    <p className="text-sm text-slate-500">
                                        {selectedAgents.length} persona{selectedAgents.length === 1 ? '' : 's'} ready to collaborate
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {selectedAgents.length > 0 && (
                                <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    Ready • {selectedAgents.length} participants
                                </div>
                            )}

                            {sessions.length > 0 && (
                                <Button
                                    onClick={handleGenerateSummary}
                                    disabled={isGeneratingSummary}
                                    className="flex items-center space-x-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-600"
                                >
                                    <DocumentTextIcon className="h-4 w-4" />
                                    <span>{isGeneratingSummary ? 'Generating…' : 'Summary'}</span>
                                </Button>
                            )}

                            <Button
                                onClick={() => setShowAgentSelector(true)}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
                            >
                                <PlusIcon className="h-4 w-4" />
                                Manage Participants
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Purpose Overview */}
                <div className="border-b border-slate-200/70 bg-white/90">
                    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Conversation Focus</p>
                            <p className="mt-1 text-base font-medium leading-6 text-slate-900">
                                {chatPurpose?.trim()
                                    ? chatPurpose
                                    : 'Open the participant selector to outline the research prompt or design scenario.'}
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {selectedAgents.length > 0 && (
                                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                                    {selectedAgents.length} persona{selectedAgents.length === 1 ? '' : 's'} selected
                                </div>
                            )}
                            <Button
                                onClick={() => setShowAgentSelector(true)}
                                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-600"
                            >
                                Select / Start Chat
                            </Button>
                            {isChatActive && (
                                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                                    ● Live
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Full Height Chat Area */}
                <div className="flex-1">
                    {selectedAgents.length === 0 ? (
                        <div className="h-full flex items-center justify-center p-12">
                            <Card className="p-12 text-center max-w-md">
                                <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">No Agents Selected</h2>
                                <p className="text-gray-600 mb-6">
                                    Select at least 2 agents to start a group chat and get diverse perspectives.
                                </p>
                                <Button
                                    onClick={() => setShowAgentSelector(true)}
                                    className="flex items-center space-x-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    <span>Select Agents</span>
                                </Button>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-full p-4">
                            <GroupChat
                                agents={selectedAgents}
                                onAddAgents={() => setShowAgentSelector(true)}
                                chatPurpose={chatPurpose}
                                isChatActive={isChatActive}
                                onChatReset={() => {
                                    setIsChatActive(false);
                                    setSelectedAgents([]);
                                    setChatPurpose('');
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Agent Selector Modal */}
            {showAgentSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        {/* Header - Fixed */}
                        <div className="p-6 border-b border-gray-200 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-manrope-bold text-gray-900">Select Agents for Group Chat</h2>
                                <button
                                    onClick={() => setShowAgentSelector(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="text-gray-600 mt-2">
                                Choose 2 or more agents to participate in the group chat
                            </p>
                        </div>

                        {/* Purpose Input - Fixed */}
                        <div className="border-b border-gray-100 bg-blue-50/60 px-6 py-5 flex-shrink-0">
                            <label htmlFor="modalChatPurpose" className="block text-sm font-semibold text-blue-900">
                                Purpose of Chat <span className="font-normal text-xs text-blue-600">(required)</span>
                            </label>
                            <textarea
                                id="modalChatPurpose"
                                value={chatPurpose}
                                onChange={(e) => setChatPurpose(e.target.value)}
                                placeholder="Describe what you want the agents to discuss or evaluate..."
                                className="mt-2 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                            <p className="mt-1 text-xs text-blue-700">
                                Setting a clear purpose helps the selected agents give focused, high-quality feedback.
                            </p>
                        </div>
                        
                        {/* Scrollable Content Area - Filters + Agent Grid */}
                        <div className="flex-1 overflow-y-auto">
                            {/* Filters */}
                            <div className="p-6 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <FunnelIcon className="h-5 w-5 mr-2" />
                                        Filters
                                    </h3>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Search */}
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search agents..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    {/* Occupation Filter */}
                                    <select
                                        value={filterOccupation}
                                        onChange={(e) => setFilterOccupation(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Occupations</option>
                                        {occupations.map(occ => (
                                            <option key={occ} value={occ}>{occ}</option>
                                        ))}
                                    </select>
                                    
                                    {/* Tech Savvy Filter */}
                                    <select
                                        value={filterTechSavvy}
                                        onChange={(e) => setFilterTechSavvy(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Tech Levels</option>
                                        {techSavvyLevels.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                    
                                    {/* English Savvy Filter */}
                                    <select
                                        value={filterEnglishSavvy}
                                        onChange={(e) => setFilterEnglishSavvy(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All English Levels</option>
                                        {sortedEnglishLevels.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Agent Grid */}
                            <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredAgents.map((agent) => {
                                    const isSelected = selectedAgents.find(a => a.id === agent.id);
                                    const techSavvy = getTechSavvyLevel(agent);
                                    const domainSavvy = getDomainSavvyLevel(agent);
                                    const englishSavvy = getEnglishSavvyLevel(agent);
                                    
                                    return (
                                        <button
                                            key={agent.id}
                                            onClick={() => toggleAgentSelection(agent)}
                                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="space-y-3">
                                                {/* Header with Avatar and Name */}
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={getAvatarSrc(agent.avatar_url, agent.name, { size: 200 })}
                                                        alt={agent.name}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                        onError={(e) => handleAvatarError(e, agent.name, { size: 200 })}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-manrope-semibold text-gray-900 truncate">{agent.name}</div>
                                                        <div className="text-sm text-gray-500 truncate">
                                                            {agent.occupation || agent.role_title}
                                                        </div>
                                                        <div className="text-xs text-gray-400 truncate">
                                                            {agent.location}
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <CheckIcon className="h-4 w-4 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Vital Information - Clean Layout */}
                                                <div className="space-y-3">
                                                        {/* Age and Location */}
                                                        <div className="text-sm text-gray-600">
                                                            {agent.demographics?.age ? `${agent.demographics.age} years old` : agent.age ? `${agent.age} years old` : 'Age not specified'} • {agent.location}
                                                        </div>
                                                    
                                                    {/* Skill Badges */}
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            techSavvy === 'High' ? 'bg-green-100 text-green-800' :
                                                            techSavvy === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            techSavvy === 'Low' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            Tech: {techSavvy}
                                                        </span>
                                                        
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            domainSavvy === 'High' ? 'bg-green-100 text-green-800' :
                                                            domainSavvy === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            Domain: {domainSavvy}
                                                        </span>
                                                        
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            englishSavvy === 'Advanced' ? 'bg-green-100 text-green-800' :
                                                            englishSavvy === 'High' ? 'bg-blue-100 text-blue-800' :
                                                            englishSavvy === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            English: {englishSavvy}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            
                            {filteredAgents.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-gray-500 text-lg mb-2">No agents found</div>
                                    <div className="text-gray-400 text-sm">Try adjusting your filters</div>
                                </div>
                            )}
                            </div>
                        </div>
                        
                        {/* Footer - Fixed */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                            <div className="flex flex-col gap-3">
                                {/* Status and Validation Messages */}
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-sm font-medium text-gray-900">
                                            {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
                                        </div>
                                        {selectedAgents.length < 2 && (
                                            <div className="text-xs text-amber-600">
                                                ⚠️ Select at least 2 agents to continue
                                            </div>
                                        )}
                                        {selectedAgents.length >= 2 && !chatPurpose.trim() && (
                                            <div className="text-xs text-amber-600">
                                                ⚠️ Please enter the chat purpose above
                                            </div>
                                        )}
                                        {selectedAgents.length >= 2 && chatPurpose.trim() && (
                                            <div className="text-xs text-green-600">
                                                ✓ Ready to start group chat
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end space-x-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowAgentSelector(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={startGroupChat}
                                        disabled={selectedAgents.length < 2 || !chatPurpose.trim()}
                                        className={`${
                                            selectedAgents.length >= 2 && chatPurpose.trim()
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        Start Group Chat
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Modal */}
            {showSummary && summary && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Design Feedback Summary</h2>
                                <button
                                    onClick={() => setShowSummary(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <p className="text-gray-600 mt-2">
                                Based on {summary.sessionCount} chat sessions with {summary.messageCount} total messages
                            </p>
                        </div>
                        
                        <div className="p-6 max-h-96 overflow-y-auto">
                            <div className="prose max-w-none">
                                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                                    {summary.summary}
                                </pre>
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Generated on {new Date(summary.timestamp).toLocaleString()}
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setShowSummary(false)}
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            navigator.clipboard.writeText(summary.summary);
                                            toast.success('Summary copied to clipboard');
                                        }}
                                    >
                                        Copy Summary
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GroupChatPage;
