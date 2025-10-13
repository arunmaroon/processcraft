import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge } from './design-system';
import EnhancedDetailedPersonaCard from './EnhancedDetailedPersonaCard';
import PasswordConfirmation from './PasswordConfirmation';
import { ChatBubbleLeftIcon, EyeIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import { getAvatarSrc, handleAvatarError } from '../utils/avatar';

const formatTitleCase = (value, fallback = 'N/A') => {
  if (!value) return fallback;
  const str = value.toString().replace(/_/g, ' ').trim();
  if (!str) return fallback;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getLevelBadgeVariant = (level) => {
  const normalized = (level || '').toLowerCase();
  if (['high', 'advanced'].includes(normalized)) return 'success';
  if (['medium', 'intermediate'].includes(normalized)) return 'primary';
  if (['basic', 'low', 'beginner'].includes(normalized)) return 'warning';
  if (['unknown', 'n/a'].includes(normalized)) return 'gray';
  return 'gray';
};

const statusDotClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return 'bg-emerald-500';
    case 'sleeping':
      return 'bg-amber-500';
    case 'archived':
      return 'bg-gray-400';
    default:
      return 'bg-gray-300';
  }
};

const AgentGrid = ({ agents, onSelectAgent, onDeleteAgent, onAgentStatusChange }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [detailedPersona, setDetailedPersona] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingAgent, setPendingAgent] = useState(null);
  const [loadingPersona, setLoadingPersona] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const handleClickAway = (event) => {
      if (!event.target.closest('.agent-card-menu')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickAway);
    return () => document.removeEventListener('click', handleClickAway);
  }, []);

  const handleViewDetails = async (agent) => {
    setSelectedAgent(agent);
    setLoadingPersona(true);
    setShowDetailView(true);

    try {
      const response = await api.get(`/personas/${agent.id}`);
      setDetailedPersona(response.data.agent);
    } catch (error) {
      console.error('Error fetching detailed persona:', error);
      setDetailedPersona(agent);
    } finally {
      setLoadingPersona(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetailView(false);
    setSelectedAgent(null);
    setDetailedPersona(null);
  };

  const handleChat = (agent) => {
    if (onSelectAgent) {
      onSelectAgent(agent);
    } else {
      window.location.href = `/enhanced-chat/${agent.id}`;
    }
  };

  const requestPasswordAction = (action, agent) => {
    setOpenMenuId(null);
    setPendingAction(action);
    setPendingAgent(agent);
    setShowPasswordConfirm(true);
  };

  const handlePasswordConfirm = async () => {
    if (!pendingAgent || !pendingAction) return;

    try {
      if (pendingAction === 'Sleep') {
        const currentStatus = (pendingAgent.status || '').toLowerCase();
        const newStatus = currentStatus === 'sleeping' ? 'active' : 'sleeping';
        await api.patch(`/agents/v5/${pendingAgent.id}/status`, { status: newStatus });
        onAgentStatusChange && onAgentStatusChange(pendingAgent.id, newStatus);
        window.alert(`Agent ${newStatus === 'active' ? 'woken up' : 'put to sleep'} successfully!`);
      } else if (pendingAction === 'Delete') {
        await api.delete(`/agents/v5/${pendingAgent.id}`);
        onDeleteAgent && onDeleteAgent(pendingAgent.id);
        window.alert('Agent deleted successfully!');
      }
    } catch (error) {
      console.error(`Error ${pendingAction.toLowerCase()}ing agent:`, error);
      window.alert(`Failed to ${pendingAction.toLowerCase()} agent: ${error.response?.data?.error || error.message}`);
    } finally {
      setShowPasswordConfirm(false);
      setPendingAction(null);
      setPendingAgent(null);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordConfirm(false);
    setPendingAction(null);
    setPendingAgent(null);
  };

  const toggleMenu = (agentId) => {
    setOpenMenuId(prev => (prev === agentId ? null : agentId));
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {agents.map((agent, index) => {
          const techLabel = agent.techLabel || formatTitleCase(agent.tech_savviness, 'Medium');
          const domainLabel = agent.domainLevel || formatTitleCase(agent.domain_literacy?.level, 'Medium');
          const englishLabel = agent.englishLevel || 'Unknown';
          const statusLabel = agent.statusLabel || formatTitleCase(agent.status, 'Active');
          const location = agent.locationLabel || agent.location || 'Unknown';
          const age = agent.demographics?.age ?? agent.age;

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                onClick={() => handleViewDetails(agent)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img
                      src={getAvatarSrc(agent.avatar_url, agent.name, { size: 200 })}
                      alt={agent.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => handleAvatarError(e, agent.name, { size: 200 })}
                    />
                    <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${statusDotClass(agent.status)}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-base font-semibold text-gray-900">
                        {agent.name || 'Unnamed Agent'}
                      </h3>
                      <span className="text-xs font-medium text-gray-400">
                        {statusLabel}
                      </span>
                    </div>
                    <p className="truncate text-sm text-gray-500">
                      {agent.occupation || agent.role_title || 'AI Persona'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  {age ? `${age} yrs` : 'Age N/A'}
                  <span className="text-gray-300">•</span>
                  <span>{location}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant={getLevelBadgeVariant(techLabel)} size="sm">
                    Tech: {techLabel}
                  </Badge>
                  <Badge variant={getLevelBadgeVariant(domainLabel)} size="sm">
                    Domain: {domainLabel}
                  </Badge>
                  <Badge variant={getLevelBadgeVariant(englishLabel)} size="sm">
                    English: {englishLabel}
                  </Badge>
                </div>

                {agent.quote && (
                  <div className="mt-4 rounded-lg bg-gray-50 p-3">
                    <p className="text-sm leading-5 text-gray-700 line-clamp-2">
                      &ldquo;{agent.quote}&rdquo;
                    </p>
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(agent);
                      }}
                      className="rounded-full p-2 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                      title="View details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChat(agent);
                      }}
                      className="rounded-full p-2 text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                      title="Start chat"
                    >
                      <ChatBubbleLeftIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="relative agent-card-menu">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(agent.id);
                      }}
                      className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                      title="More actions"
                    >
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>

                    {openMenuId === agent.id && (
                      <div className="absolute right-0 top-10 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            requestPasswordAction('Sleep', agent);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                          {agent.status === 'sleeping' ? 'Wake Agent' : 'Sleep Agent'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            requestPasswordAction('Delete', agent);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Agent
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {showDetailView && selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Detailed Persona</h2>
              <button
                type="button"
                onClick={handleCloseDetails}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {loadingPersona ? (
                <div className="flex items-center justify-center gap-3 py-12 text-gray-500">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  <span>Loading detailed persona…</span>
                </div>
              ) : detailedPersona ? (
                <EnhancedDetailedPersonaCard persona={detailedPersona} />
              ) : (
                <div className="py-12 text-center text-gray-500">
                  Failed to load detailed persona data.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PasswordConfirmation
        isOpen={showPasswordConfirm}
        onClose={handlePasswordCancel}
        onConfirm={handlePasswordConfirm}
        action={pendingAction}
        agentName={pendingAgent?.name}
      />
    </>
  );
};

export default AgentGrid;
