import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../design-system';
import { toast } from 'react-hot-toast';
import { 
    PaperAirplaneIcon, 
    PhotoIcon, 
    UserGroupIcon
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import useChatStore from '../stores/chatStore';
import { getAvatarSrc, handleAvatarError } from '../utils/avatar';

const GroupChat = ({ agents, onAddAgents, chatPurpose, isChatActive, onChatReset }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentRespondingAgent, setCurrentRespondingAgent] = useState(null);
    const [uploadedImagePath, setUploadedImagePath] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const hasInitialized = useRef(false);

    // Split selectors to prevent unnecessary re-renders (objects returned from selectors cause infinite loops)
    const activeGroupId = useChatStore((state) => state.activeGroupId);
    const groupChatHistory = useChatStore((state) => state.groupChatHistory);
    const startGroupChatSession = useChatStore((state) => state.startGroupChatSession);
    const appendGroupMessage = useChatStore((state) => state.appendGroupMessage);
    const saveGroupChatHistory = useChatStore((state) => state.saveGroupChatHistory);
    const loadGroupChatHistory = useChatStore((state) => state.loadGroupChatHistory);
    const endGroupChatSession = useChatStore((state) => state.endGroupChatSession);
    const loadSavedGroupSession = useChatStore((state) => state.loadSavedGroupSession);
    const getGroupSessions = useChatStore((state) => state.getGroupSessions);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [groupChatHistory]);

    // Load chat history on mount if there's an active session
    useEffect(() => {
        if (activeGroupId) {
            loadGroupChatHistory(activeGroupId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isChatActive && !activeGroupId && !hasInitialized.current) {
            hasInitialized.current = true;
            const newGroupId = startGroupChatSession(agents, chatPurpose);
            loadGroupChatHistory(newGroupId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChatActive]);

    const chatReady = isChatActive && agents.length >= 2;
    const hasMessages = groupChatHistory.length > 0;

    const sendMessage = async () => {
        if (!message.trim() || isLoading || !chatReady) {
            if (!chatReady) toast.error('Set the chat purpose and press Start Chat to begin.');
            return;
        }

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            timestamp: new Date().toISOString(),
        };

        appendGroupMessage(userMessage);
        setMessage('');
        setIsLoading(true);

        try {
            for (let i = 0; i < agents.length; i++) {
                const agent = agents[i];
                setCurrentRespondingAgent(agent);

                const agentHistory = groupChatHistory.filter(
                    (msg) => msg.type === 'user' || (msg.type === 'agent' && msg.agent?.id === agent.id)
                );

                try {
                    const response = await api.post('/ai/generate', {
                        agentId: agent.id,
                        query: message,
                        chat_history: agentHistory,
                        chat_purpose: chatPurpose,
                        ui_path: uploadedImagePath, // Pass image context to agents
                    });

                    appendGroupMessage({
                        id: Date.now() + i,
                        type: 'agent',
                        agent,
                        content: response.data?.response || '…',
                        timestamp: new Date().toISOString(),
                    });
                } catch (error) {
                    console.error(`Error getting response from ${agent.name}:`, error);
                    appendGroupMessage({
                        id: Date.now() + i,
                        type: 'agent',
                        agent,
                        content: 'Sorry, I encountered an error. Please try again.',
                        timestamp: new Date().toISOString(),
                        isError: true,
                    });
                }

                if (i < agents.length - 1) await new Promise((resolve) => setTimeout(resolve, 600));
            }

            setCurrentRespondingAgent(null);
            setIsLoading(false);
            saveGroupChatHistory();
        } catch (error) {
            console.error('Error in group chat:', error);
            setCurrentRespondingAgent(null);
            setIsLoading(false);
        }
    };

    const handleUpload = () => {
        if (!chatReady) {
            toast.error('Set the chat purpose and press Start Chat to begin.');
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (PNG, JPG, etc.)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('agentId', agents[0]?.id || 'group'); // Use first agent ID or 'group'

            const response = await api.post('/ai/upload-ui', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const imagePath = response.data.ui_path;
            setUploadedImagePath(imagePath);

            appendGroupMessage({
                id: Date.now(),
                type: 'system',
                content: `Uploaded reference: ${file.name}`,
                imagePath: imagePath,
                timestamp: new Date().toISOString(),
            });
            saveGroupChatHistory();
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleEndChat = async () => {
        if (groupChatHistory.length === 0) {
            endGroupChatSession();
            onChatReset?.();
            toast.info('Chat session ended');
            return;
        }

        // Show generating toast
        const generatingToast = toast.loading('Generating chat summary...');
        setIsLoading(true);

        try {
            console.log('Ending chat with:', {
                historyLength: groupChatHistory.length,
                purpose: chatPurpose,
                agentCount: agents.length
            });

            // Generate summary
            const response = await api.post('/ai/generate-summary', {
                chatHistory: groupChatHistory,
                chatPurpose: chatPurpose,
                agents: agents.map(a => ({ id: a.id, name: a.name, occupation: a.occupation }))
            });

            console.log('Summary response:', response.data);

            const summary = response.data?.summary || 'No summary available';

            // Save summary to localStorage BEFORE ending session
            if (activeGroupId) {
                const summaryData = {
                    sessionId: activeGroupId,
                    summary: summary,
                    timestamp: new Date().toISOString(),
                    messageCount: groupChatHistory.length
                };
                localStorage.setItem(`group_summary_${activeGroupId}`, JSON.stringify(summaryData));
                console.log('Summary saved to localStorage:', summaryData);
            }

            // End session (this moves it to groupSessions)
            endGroupChatSession();
            
            // Dismiss loading toast
            toast.dismiss(generatingToast);
            
            // Show summary in a toast
            toast.success(
                <div className="max-w-md">
                    <p className="font-semibold mb-2">✅ Chat Ended - Summary Generated</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{summary.substring(0, 180)}...</p>
                    <p className="mt-2 text-xs text-slate-500">View full summary in Chat Archive</p>
                </div>,
                { duration: 10000 }
            );

            // Reset chat UI
            onChatReset?.();
        } catch (error) {
            console.error('Error generating summary:', error);
            toast.dismiss(generatingToast);
            toast.error(`Failed to generate summary: ${error.message || 'Unknown error'}`);
            
            // Still end the session even if summary fails
            endGroupChatSession();
            onChatReset?.();
        } finally {
            setIsLoading(false);
        }
    };

    const savedSessions = getGroupSessions();

    return (
        <div className="flex h-full flex-col rounded-3xl border border-white/70 bg-white/90 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/60 px-6 py-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Collaborative Panel</p>
                    <h2 className="text-lg font-semibold text-slate-900">Persona Discussion Stream</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500">
                        <UserGroupIcon className="h-4 w-4 text-slate-400" />
                        {agents.length} persona{agents.length === 1 ? '' : 's'} active
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            const latest = savedSessions[savedSessions.length - 1];
                            if (latest) {
                                loadSavedGroupSession(latest.id);
                                toast.success('Previous group chat session restored.');
                            } else {
                                toast.error('No saved group sessions found.');
                            }
                        }}
                    >
                        Load Last Session
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 bg-gradient-to-b from-slate-50/30 to-white">
                {groupChatHistory.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 shadow-sm">
                            <UserGroupIcon className="h-10 w-10" />
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-slate-800">Start the conversation</h3>
                        <p className="mt-3 text-base text-slate-600 max-w-md leading-relaxed">
                            Ask a question or upload a reference to hear perspectives from each persona.
                        </p>
                    </div>
                ) : (
                    <div className="mx-auto max-w-4xl space-y-8">
                        {groupChatHistory.map((msg) => (
                            <div key={msg.id} className="flex gap-5 group">
                                {msg.type === 'agent' ? (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={getAvatarSrc(msg.agent?.avatar_url, msg.agent?.name, { size: 160 })}
                                            alt={msg.agent?.name}
                                            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white shadow-md"
                                            onError={(e) => handleAvatarError(e, msg.agent?.name, { size: 160 })}
                                        />
                                    </div>
                                ) : msg.type === 'system' ? (
                                    <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                                        <PhotoIcon className="h-6 w-6 text-white" />
                                    </div>
                                ) : (
                                    <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md">
                                        <span className="text-sm font-bold text-white">You</span>
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-3 mb-2">
                                        <p className="text-base font-bold text-slate-800">
                                            {msg.type === 'agent' ? msg.agent?.name : msg.type === 'system' ? 'System' : 'You'}
                                        </p>
                                        {msg.type === 'agent' && msg.agent?.occupation && (
                                            <span className="text-xs text-slate-500 font-medium">
                                                {msg.agent.occupation}
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400 ml-auto">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div
                                        className={`rounded-2xl px-6 py-5 shadow-sm transition-all group-hover:shadow-md ${
                                            msg.type === 'agent'
                                                ? 'bg-white border border-slate-200/80'
                                                : msg.type === 'system'
                                                ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80'
                                                : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                        } ${msg.isError ? 'border-red-300 bg-red-50' : ''}`}
                                    >
                                        <div className={`text-[15px] leading-[1.8] ${
                                            msg.type === 'agent' ? 'text-slate-700' :
                                            msg.type === 'system' ? 'text-amber-900 font-medium' : 
                                            'text-white'
                                        }`}>
                                            {msg.content.split('\n').map((paragraph, idx) => (
                                                <p key={idx} className={idx > 0 ? 'mt-4' : ''}>
                                                    {paragraph}
                                                </p>
                                            ))}
                                        </div>
                                        {msg.imagePath && (
                                            <div className="mt-5 pt-5 border-t border-slate-200">
                                                <img
                                                    src={`http://localhost:9001${msg.imagePath}`}
                                                    alt="Uploaded reference"
                                                    className="rounded-xl max-w-md border border-slate-200 shadow-lg hover:shadow-xl transition-shadow"
                                                    onError={(e) => {
                                                        console.error('Failed to load image:', msg.imagePath);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            <div className="border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 backdrop-blur-sm">
                <div className="mx-auto max-w-4xl px-6 py-5">
                    {/* Status & Upload Bar */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <button
                                onClick={handleUpload}
                                disabled={!chatReady || isUploading}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium shadow-sm hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PhotoIcon className="h-4 w-4" />
                                <span>{isUploading ? 'Uploading...' : uploadedImagePath ? '✓ Image loaded' : 'Add image'}</span>
                            </button>
                        </div>
                        {currentRespondingAgent && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-medium text-emerald-700">
                                    {currentRespondingAgent.name} is typing...
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <textarea
                                rows={2}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && chatReady && !isLoading) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder={chatReady ? 'Type your message... (Shift+Enter for new line)' : 'Set the chat purpose and start chat to begin.'}
                                className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-white px-5 py-3.5 text-[15px] leading-relaxed text-slate-700 placeholder:text-slate-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                                disabled={!chatReady}
                            />
                        </div>
                        <button
                            onClick={sendMessage}
                            disabled={!chatReady || isLoading || !message.trim()}
                            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500">
                            💾 Chat saves automatically • Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">⏎</kbd> to send
                        </span>
                        {hasMessages && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleEndChat}
                                    disabled={isLoading}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Ending...' : 'End session'}
                                </button>
                                <button
                                    onClick={() => {
                                        saveGroupChatHistory();
                                        toast.success('Group chat saved.');
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-50 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                                >
                                    Save progress
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupChat;
