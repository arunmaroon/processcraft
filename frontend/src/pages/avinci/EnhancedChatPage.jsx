import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import EnhancedChat from '../components/EnhancedChat';
import { Card, Button } from '../design-system';
import { ChevronDownIcon, UserGroupIcon, XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import useChatStore from '../stores/chatStore';

const EnhancedChatPage = () => {
    const { agentId } = useParams();
    const navigate = useNavigate();
    const [agent, setAgent] = useState(null);
    const [allAgents, setAllAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAgentDropdown, setShowAgentDropdown] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [summary, setSummary] = useState(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const dropdownRef = useRef(null);
    const { endCurrentChat, generateSummary, getAllSessions } = useChatStore();

    useEffect(() => {
        if (agentId) {
            fetchAgent();
            fetchAllAgents();
        }
    }, [agentId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showAgentDropdown && !event.target.closest('.relative')) {
                setShowAgentDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAgentDropdown]);

    const fetchAgent = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/enhanced-chat/personas/${agentId}`);
            setAgent(response.data.agent);
        } catch (err) {
            console.error('Error fetching agent:', err);
            setError('Failed to load agent');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllAgents = async () => {
        try {
            const response = await api.get('/enhanced-chat/personas');
            setAllAgents(response.data.personas);
        } catch (err) {
            console.error('Error fetching all agents:', err);
        }
    };

    const handleAgentSwitch = (newAgentId) => {
        setShowAgentDropdown(false);
        navigate(`/enhanced-chat/${newAgentId}`);
    };

    const handleEndChat = () => {
        if (window.confirm('Are you sure you want to end this chat session? This will save the current conversation.')) {
            endCurrentChat();
            toast.success('Chat session ended and saved');
            navigate('/agents');
        }
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading agent...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="p-8 text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </Card>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">Agent Not Found</h2>
                    <p className="text-gray-500">The requested agent could not be found.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster position="top-right" />
            
            {/* Compact Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Chat with {agent.name}
                        </h1>
                        <p className="text-sm text-gray-600">
                            {agent.occupation || agent.role_title} • {agent.location}
                        </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                        {/* Summary Button */}
                        {sessions.length > 0 && (
                            <Button
                                onClick={handleGenerateSummary}
                                disabled={isGeneratingSummary}
                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                <DocumentTextIcon className="h-4 w-4" />
                                <span>{isGeneratingSummary ? 'Generating...' : 'Summary'}</span>
                            </Button>
                        )}

                        {/* End Chat Button */}
                        <Button
                            onClick={handleEndChat}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                            <XMarkIcon className="h-4 w-4" />
                            <span>End Chat</span>
                        </Button>

                        {/* Agent Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                            onClick={() => setShowAgentDropdown(!showAgentDropdown)}
                            className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <UserGroupIcon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Switch Agent</span>
                            <ChevronDownIcon className="h-3 w-3 text-gray-500" />
                        </button>
                        
                        {showAgentDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                                <div className="p-2">
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                                        Available Agents
                                    </div>
                                    {allAgents.map((agentOption) => (
                                        <button
                                            key={agentOption.id}
                                            onClick={() => handleAgentSwitch(agentOption.id)}
                                            className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                                                agentOption.id === agentId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                            }`}
                                        >
                                            <img
                                                src={agentOption.avatar_url || `https://i.pravatar.cc/150?img=${agentOption.id % 70}`}
                                                alt={agentOption.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(agentOption.name)}&background=random&color=fff&size=200`;
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{agentOption.name}</div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {agentOption.occupation || agentOption.role_title} • {agentOption.location}
                                                </div>
                                            </div>
                                            {agentOption.id === agentId && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Full Height Chat Area */}
            <div className="flex-1 p-6">
                <div className="h-full max-w-none">
                    <Card className="h-full">
                        <EnhancedChat 
                            agentId={agentId} 
                            agentName={agent.name}
                        />
                    </Card>
                </div>
            </div>

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
        </div>
    );
};

export default EnhancedChatPage;
