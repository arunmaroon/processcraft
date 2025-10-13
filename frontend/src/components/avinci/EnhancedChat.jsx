import React, { useState, useRef, useEffect } from 'react';
import { Button, Card } from '../design-system';
import useChatStore from '../stores/chatStore';
import { toast } from 'react-hot-toast';
import { 
    PaperAirplaneIcon, 
    PhotoIcon, 
    PlayIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const EnhancedChat = ({ agentId, agentName }) => {
    const {
        chatHistory,
        isLoading,
        error,
        uiContext,
        usabilityResults,
        setCurrentAgent,
        sendMessage,
        uploadUI,
        runUsabilityTest,
        clearHistory,
        clearError
    } = useChatStore();

    const [message, setMessage] = useState('');
    const [selectedTask, setSelectedTask] = useState('Navigation');
    const [showUsabilityTest, setShowUsabilityTest] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const tasks = [
        'Navigation',
        'Form Usability',
        'Button Accessibility',
        'Content Readability',
        'Mobile Responsiveness'
    ];

    useEffect(() => {
        if (agentId) {
            setCurrentAgent(agentId);
        }
    }, [agentId, setCurrentAgent]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    useEffect(() => {
        if (error) {
            toast.error(error, {
                style: {
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '9999px',
                    padding: '12px 16px'
                }
            });
            clearError();
        }
    }, [error, clearError]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const messageText = message.trim();
        setMessage('');
        
        await sendMessage(messageText, uiContext);
        
        toast.success('Message sent!', {
            style: {
                background: '#10b981',
                color: 'white',
                borderRadius: '9999px',
                padding: '12px 16px'
            }
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type. Please use PNG, JPG, or PDF.', {
                style: {
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '9999px',
                    padding: '12px 16px'
                }
            });
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large. Maximum size is 5MB.', {
                style: {
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '9999px',
                    padding: '12px 16px'
                }
            });
            return;
        }

        await uploadUI(file);
        
        toast.success('UI uploaded successfully!', {
            style: {
                background: '#10b981',
                color: 'white',
                borderRadius: '9999px',
                padding: '12px 16px'
            }
        });
    };

    const handleUsabilityTest = async () => {
        if (!selectedTask) return;
        
        await runUsabilityTest(selectedTask, uiContext);
        setShowUsabilityTest(true);
        
        toast.success('Usability test completed!', {
            style: {
                background: '#10b981',
                color: 'white',
                borderRadius: '9999px',
                padding: '12px 16px'
            }
        });
    };

    const formatMessage = (msg) => {
        if (msg.role === 'user') {
            return (
                <div className="flex justify-end mb-4">
                    <div className="bg-blue-500 text-white rounded-full px-6 py-3 max-w-xs lg:max-w-md">
                        <p className="text-sm">{msg.content}</p>
                        {msg.ui_path && (
                            <p className="text-xs opacity-75 mt-1">📎 UI attached</p>
                        )}
                    </div>
                </div>
            );
        } else if (msg.role === 'agent') {
            return (
                <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 text-gray-900 rounded-lg px-6 py-3 max-w-xs lg:max-w-md">
                        <p className="text-sm">{msg.content}</p>
                        {msg.ui_path && (
                            <p className="text-xs text-gray-500 mt-1">📎 Referencing UI</p>
                        )}
                    </div>
                </div>
            );
        } else if (msg.role === 'system') {
            return (
                <div className="flex justify-center mb-4">
                    <div className="bg-yellow-100 text-yellow-800 rounded-lg px-4 py-2 text-sm">
                        <p>{msg.content}</p>
                    </div>
                </div>
            );
        } else if (msg.role === 'error') {
            return (
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2 text-sm flex items-center">
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        <p>{msg.content}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Chat with {agentName}
                        </h2>
                        {uiContext && (
                            <p className="text-sm text-blue-600 flex items-center">
                                <PhotoIcon className="h-4 w-4 mr-1" />
                                UI context loaded
                            </p>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <PhotoIcon className="h-4 w-4 mr-1" />
                            Upload UI
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUsabilityTest(!showUsabilityTest)}
                        >
                            <PlayIcon className="h-4 w-4 mr-1" />
                            Test
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearHistory}
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            </div>

            {/* Usability Test Panel */}
            {showUsabilityTest && (
                <Card className="m-4 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Usability Testing</h3>
                        <button
                            onClick={() => setShowUsabilityTest(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <select
                            value={selectedTask}
                            onChange={(e) => setSelectedTask(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {tasks.map(task => (
                                <option key={task} value={task}>{task}</option>
                            ))}
                        </select>
                        <Button
                            onClick={handleUsabilityTest}
                            disabled={isLoading}
                            loading={isLoading}
                        >
                            Run Test
                        </Button>
                    </div>

                    {usabilityResults && (
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Test Results</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium text-gray-700">Steps</p>
                                    <p className="text-gray-600">{usabilityResults.steps?.length || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium text-gray-700">Pain Points</p>
                                    <p className="text-gray-600">{usabilityResults.pains?.length || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium text-gray-700">Rating</p>
                                    <p className="text-gray-600">{usabilityResults.rating || 'N/A'}/10</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="font-medium text-gray-700">Fixes</p>
                                    <p className="text-gray-600">{usabilityResults.fixes?.length || 0}</p>
                                </div>
                            </div>
                            
                            {usabilityResults.steps && usabilityResults.steps.length > 0 && (
                                <div className="mt-4">
                                    <h5 className="font-medium mb-2">Test Steps:</h5>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                        {usabilityResults.steps.map((step, index) => (
                                            <li key={index}>{step}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {usabilityResults.pains && usabilityResults.pains.length > 0 && (
                                <div className="mt-4">
                                    <h5 className="font-medium mb-2">Pain Points:</h5>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                                        {usabilityResults.pains.map((pain, index) => (
                                            <li key={index}>{pain}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {usabilityResults.fixes && usabilityResults.fixes.length > 0 && (
                                <div className="mt-4">
                                    <h5 className="font-medium mb-2">Suggested Fixes:</h5>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-green-600">
                                        {usabilityResults.fixes.map((fix, index) => (
                                            <li key={index}>{fix}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>Start a conversation with {agentName}</p>
                        <p className="text-sm mt-2">Upload a UI image to get detailed feedback</p>
                    </div>
                ) : (
                    chatHistory.map((msg) => (
                        <div key={msg.id}>
                            {formatMessage(msg)}
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-gray-100 text-gray-900 rounded-lg px-6 py-3">
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                <p className="text-sm">Thinking...</p>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4 rounded-b-xl">
                <form onSubmit={handleSendMessage} className="flex space-x-4">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Ask ${agentName} anything...`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                        aria-label="Chat input"
                    />
                    <Button
                        type="submit"
                        disabled={!message.trim() || isLoading}
                        loading={isLoading}
                    >
                        <PaperAirplaneIcon className="h-4 w-4" />
                    </Button>
                </form>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default EnhancedChat;
