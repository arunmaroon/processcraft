import React, { useState, useEffect, useRef } from 'react';
import { 
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    PlusIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    PhotoIcon,
    MicrophoneIcon,
    EllipsisVerticalIcon,
    DocumentTextIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import RealTimeChat from '../components/RealTimeChat';

const ChatInterface = () => {
    const [agents, setAgents] = useState([]);
    const [selectedAgents, setSelectedAgents] = useState([]);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showAgentSelector, setShowAgentSelector] = useState(false);
    const [attachedImage, setAttachedImage] = useState(null);
    const [chatMode, setChatMode] = useState('single'); // 'single' or 'group'
    const [selectedAgentForSingleChat, setSelectedAgentForSingleChat] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchAgents();
        // Check URL params for pre-selected agents
        const urlParams = new URLSearchParams(window.location.search);
        const agentIds = urlParams.get('agents');
        if (agentIds) {
            const ids = agentIds.split(',');
            setSelectedAgents(ids);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchAgents = async () => {
        try {
            const response = await api.get('/agents/v4?view=short');
            setAgents(response.data);
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleAgentSelect = (agentId) => {
        if (chatMode === 'single') {
            setSelectedAgentForSingleChat(agents.find(a => a.id === agentId));
            setSelectedAgents([agentId]);
        } else {
            setSelectedAgents(prev => 
                prev.includes(agentId) 
                    ? prev.filter(id => id !== agentId)
                    : [...prev, agentId]
            );
        }
    };

    const handleStartSingleChat = (agent) => {
        setSelectedAgentForSingleChat(agent);
        setSelectedAgents([agent.id]);
        setChatMode('single');
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() && !attachedImage) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue,
            image: attachedImage ? URL.createObjectURL(attachedImage) : null,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setAttachedImage(null);
        setIsTyping(true);

        try {
            // Send message to selected agents
            for (const agentId of selectedAgents) {
                const agent = agents.find(a => a.id === agentId);
                if (agent) {
                    // Simulate agent response (replace with actual API call)
                    setTimeout(() => {
                        const agentMessage = {
                            id: Date.now() + Math.random(),
                            type: 'agent',
                            agentId: agentId,
                            agentName: agent.name,
                            content: `This is a simulated response from ${agent.name}. In a real implementation, this would call the chat API.`,
                            timestamp: new Date().toISOString()
                        };
                        setMessages(prev => [...prev, agentMessage]);
                    }, 1000 + Math.random() * 2000);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setTimeout(() => setIsTyping(false), 3000);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachedImage(file);
        }
    };

    const getAgentColor = (agentId) => {
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-yellow-500',
            'bg-indigo-500',
            'bg-red-500',
            'bg-teal-500'
        ];
        const index = selectedAgents.indexOf(agentId) % colors.length;
        return colors[index];
    };

    const getAgentInitials = (agentName) => {
        return agentName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'A';
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#144835' }}>
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">Chat Interface</h1>
                            <p className="text-sm text-gray-600">
                                {selectedAgents.length > 0 
                                    ? `Chatting with ${selectedAgents.length} agent${selectedAgents.length > 1 ? 's' : ''}`
                                    : 'Select agents to start chatting'
                                }
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        {/* Chat Mode Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setChatMode('single')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    chatMode === 'single' 
                                        ? 'text-white' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                style={chatMode === 'single' ? { backgroundColor: '#144835' } : {}}
                            >
                                Single Chat
                            </button>
                            <button
                                onClick={() => setChatMode('group')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    chatMode === 'group' 
                                        ? 'text-white' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                style={chatMode === 'group' ? { backgroundColor: '#144835' } : {}}
                            >
                                Group Chat
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowAgentSelector(!showAgentSelector)}
                            className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors"
                            style={{ backgroundColor: '#144835' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#0f3a2a'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#144835'}
                        >
                            <UserGroupIcon className="w-5 h-5" />
                            <span>Select Agents</span>
                        </button>
                    </div>
                </div>

                {/* Selected Agents */}
                {selectedAgents.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {selectedAgents.map(agentId => {
                            const agent = agents.find(a => a.id === agentId);
                            return (
                                <div
                                    key={agentId}
                                    className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
                                >
                                    <div className={`w-6 h-6 ${getAgentColor(agentId)} rounded-full flex items-center justify-center`}>
                                        <span className="text-white text-xs font-semibold">
                                            {getAgentInitials(agent?.name)}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-700">{agent?.name}</span>
                                    <button
                                        onClick={() => handleAgentSelect(agentId)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Agent Selector Modal */}
            {showAgentSelector && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Select Agents</h3>
                                <button
                                    onClick={() => setShowAgentSelector(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-1 gap-3">
                                {agents.map(agent => (
                                    <div
                                        key={agent.id}
                                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                            selectedAgents.includes(agent.id)
                                                ? 'border-rose-500 bg-rose-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => handleAgentSelect(agent.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedAgents.includes(agent.id)}
                                            onChange={() => handleAgentSelect(agent.id)}
                                            className="w-5 h-5 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                                        />
                                        <div className={`w-10 h-10 ${getAgentColor(agent.id)} rounded-full flex items-center justify-center`}>
                                            <span className="text-white font-semibold">
                                                {getAgentInitials(agent.name)}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{agent.name}</h4>
                                            <p className="text-sm text-gray-600">{agent.role_title || 'AI Persona'}</p>
                                        </div>
                                        {chatMode === 'single' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartSingleChat(agent);
                                                    setShowAgentSelector(false);
                                                }}
                                                className="px-3 py-1 text-sm text-white rounded-lg transition-colors"
                                                style={{ backgroundColor: '#144835' }}
                                                onMouseOver={(e) => e.target.style.backgroundColor = '#0f3a2a'}
                                                onMouseOut={(e) => e.target.style.backgroundColor = '#144835'}
                                            >
                                                Start Chat
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200">
                        <button
                            onClick={() => setShowAgentSelector(false)}
                            className="w-full text-white py-2 rounded-lg transition-colors"
                            style={{ backgroundColor: '#144835' }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#0f3a2a'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#144835'}
                        >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Content */}
            <div className="flex-1 overflow-hidden">
                {chatMode === 'single' && selectedAgentForSingleChat ? (
                    <RealTimeChat 
                        agentId={selectedAgentForSingleChat.id} 
                        agentName={selectedAgentForSingleChat.name}
                    />
                ) : (
                    <div className="h-full overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center py-12">
                                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                                <p className="text-gray-500 mb-6">
                                    {chatMode === 'single' 
                                        ? 'Select an agent to start a one-on-one chat'
                                        : 'Select agents and send your first message to begin group chatting'
                                    }
                                </p>
                                {selectedAgents.length === 0 && (
                                    <button
                                        onClick={() => setShowAgentSelector(true)}
                                        className="text-white px-6 py-3 rounded-lg transition-colors"
                                        style={{ backgroundColor: '#144835' }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#0f3a2a'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#144835'}
                                    >
                                        Select Agents
                                    </button>
                                )}
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        message.type === 'user'
                                            ? 'text-white'
                                            : 'bg-white border border-gray-200'
                                    }`}
                                    style={message.type === 'user' ? { backgroundColor: '#144835' } : {}}>
                                        {message.type === 'agent' && (
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className={`w-6 h-6 ${getAgentColor(message.agentId)} rounded-full flex items-center justify-center`}>
                                                    <span className="text-white text-xs font-semibold">
                                                        {getAgentInitials(message.agentName)}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{message.agentName}</span>
                                            </div>
                                        )}
                                        {message.image && (
                                            <div className="mb-2">
                                                <img
                                                    src={message.image}
                                                    alt="Attached"
                                                    className="w-full h-32 object-cover rounded"
                                                />
                                            </div>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        <p className={`text-xs mt-1 ${
                                            message.type === 'user' ? 'text-rose-100' : 'text-gray-500'
                                        }`}>
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg">
                                    <div className="flex items-center space-x-1">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                        <span className="text-xs text-gray-500 ml-2">Agents are typing...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input - Only for Group Chat */}
            {chatMode === 'group' && (
                <div className="bg-white border-t border-gray-200 px-6 py-4">
                    <div className="flex items-end space-x-3">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="Upload image"
                        >
                            <PhotoIcon className="w-5 h-5" />
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />

                        {attachedImage && (
                            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                                <img
                                    src={URL.createObjectURL(attachedImage)}
                                    alt="Attached"
                                    className="w-8 h-8 object-cover rounded"
                                />
                                <span className="text-sm text-gray-600">{attachedImage.name}</span>
                                <button
                                    onClick={() => setAttachedImage(null)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="flex-1">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
                                style={{ '--tw-ring-color': '#144835' }}
                                rows={2}
                            />
                        </div>

                        <button
                            onClick={handleSendMessage}
                            disabled={(!inputValue.trim() && !attachedImage) || selectedAgents.length === 0}
                            className="p-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            style={{ backgroundColor: '#144835' }}
                            onMouseOver={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#0f3a2a')}
                            onMouseOut={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#144835')}
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
