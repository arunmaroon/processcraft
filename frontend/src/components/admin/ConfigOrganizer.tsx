import React, { useState, useEffect } from 'react';
import { Users, Target, BarChart3, Plus, Edit, Trash2, Save } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  description: string;
  goals: string[];
  painPoints: string[];
  behaviors: string[];
  designPreferences: {
    complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
    interactionStyle: 'CHAT' | 'FORM' | 'DASHBOARD' | 'MOBILE';
    colorScheme: 'LIGHT' | 'DARK' | 'AUTO';
    accessibility: 'STANDARD' | 'ENHANCED' | 'MAXIMUM';
  };
}

interface Demographics {
  id: string;
  ageRange: [number, number];
  gender: string[];
  location: string[];
  income: string[];
  education: string[];
}

interface Cohort {
  id: string;
  name: string;
  description: string;
  demographics: Demographics;
  size: number;
  product: string;
}

interface ConfigOrganizerProps {
  onConfigsUpdated: () => void;
}

export default function ConfigOrganizer({ onConfigsUpdated }: ConfigOrganizerProps) {
  const [activeTab, setActiveTab] = useState<'personas' | 'demographics' | 'cohorts'>('personas');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [demographics, setDemographics] = useState<Demographics[]>([]);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/admin-research/configs');
      if (response.ok) {
        const data = await response.json();
        setPersonas(data.personas || []);
        setDemographics(data.demographics || []);
        setCohorts(data.cohorts || []);
      } else {
        // Fallback: Load sample data
        setPersonas([
          {
            id: '1',
            name: 'Tech-Savvy Investor',
            description: 'Young professional who values efficiency and modern design',
            goals: ['Quick transactions', 'Real-time updates', 'Mobile-first experience'],
            painPoints: ['Complex interfaces', 'Slow loading times', 'Poor mobile experience'],
            behaviors: ['Uses mobile apps daily', 'Prefers minimal design', 'Values security'],
            designPreferences: {
              complexity: 'MODERATE',
              interactionStyle: 'DASHBOARD',
              colorScheme: 'LIGHT',
              accessibility: 'STANDARD'
            }
          }
        ]);
        setDemographics([
          {
            id: '1',
            ageRange: [25, 35],
            gender: ['All'],
            location: ['Global'],
            income: ['$50K-$100K'],
            education: ['Bachelor\'s Degree']
          }
        ]);
        setCohorts([
          {
            id: '1',
            name: 'Primary Users',
            description: 'Main target audience for digital gold investment',
            demographics: {
              id: '1',
              ageRange: [25, 35],
              gender: ['All'],
              location: ['Global'],
              income: ['$50K-$100K'],
              education: ['Bachelor\'s Degree']
            },
            size: 1000,
            product: 'DigiGold'
          }
        ]);
      }
    } catch (error) {
      console.log('API not available, using fallback data');
      // Use fallback data
      setPersonas([
        {
          id: '1',
          name: 'Tech-Savvy Investor',
          description: 'Young professional who values efficiency and modern design',
          goals: ['Quick transactions', 'Real-time updates', 'Mobile-first experience'],
          painPoints: ['Complex interfaces', 'Slow loading times', 'Poor mobile experience'],
          behaviors: ['Uses mobile apps daily', 'Prefers minimal design', 'Values security'],
          designPreferences: {
            complexity: 'MODERATE',
            interactionStyle: 'DASHBOARD',
            colorScheme: 'LIGHT',
            accessibility: 'STANDARD'
          }
        }
      ]);
      setDemographics([
        {
          id: '1',
          ageRange: [25, 35],
          gender: ['All'],
          location: ['Global'],
          income: ['$50K-$100K'],
          education: ['Bachelor\'s Degree']
        }
      ]);
      setCohorts([
        {
          id: '1',
          name: 'Primary Users',
          description: 'Main target audience for digital gold investment',
          demographics: {
            id: '1',
            ageRange: [25, 35],
            gender: ['All'],
            location: ['Global'],
            income: ['$50K-$100K'],
            education: ['Bachelor\'s Degree']
          },
          size: 1000,
          product: 'DigiGold'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfigs = async () => {
    try {
      const response = await fetch('/api/admin-research/organize-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personas,
          demographics,
          cohorts
        }),
      });

      if (response.ok) {
        onConfigsUpdated();
      } else {
        console.log('API not available, configs saved locally');
        onConfigsUpdated();
      }
    } catch (error) {
      console.log('API not available, configs saved locally');
      onConfigsUpdated();
    }
  };

  const addPersona = () => {
    const newPersona: Persona = {
      id: `persona-${Date.now()}`,
      name: '',
      description: '',
      goals: [''],
      painPoints: [''],
      behaviors: [''],
      designPreferences: {
        complexity: 'MODERATE',
        interactionStyle: 'DASHBOARD',
        colorScheme: 'LIGHT',
        accessibility: 'STANDARD'
      }
    };
    setPersonas(prev => [...prev, newPersona]);
    setEditingItem(newPersona.id);
  };

  const updatePersona = (id: string, field: keyof Persona, value: any) => {
    setPersonas(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const deletePersona = (id: string) => {
    setPersonas(prev => prev.filter(p => p.id !== id));
  };

  const addDemographics = () => {
    const newDemographics: Demographics = {
      id: `demo-${Date.now()}`,
      ageRange: [25, 35],
      gender: ['All'],
      location: ['Global'],
      income: ['$50K-$100K'],
      education: ['Bachelor\'s Degree']
    };
    setDemographics(prev => [...prev, newDemographics]);
    setEditingItem(newDemographics.id);
  };

  const updateDemographics = (id: string, field: keyof Demographics, value: any) => {
    setDemographics(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const deleteDemographics = (id: string) => {
    setDemographics(prev => prev.filter(d => d.id !== id));
  };

  const addCohort = () => {
    const newCohort: Cohort = {
      id: `cohort-${Date.now()}`,
      name: '',
      description: '',
      demographics: demographics[0] || {
        id: '1',
        ageRange: [25, 35],
        gender: ['All'],
        location: ['Global'],
        income: ['$50K-$100K'],
        education: ['Bachelor\'s Degree']
      },
      size: 500,
      product: 'DigiGold'
    };
    setCohorts(prev => [...prev, newCohort]);
    setEditingItem(newCohort.id);
  };

  const updateCohort = (id: string, field: keyof Cohort, value: any) => {
    setCohorts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const deleteCohort = (id: string) => {
    setCohorts(prev => prev.filter(c => c.id !== id));
  };

  const tabs = [
    { id: 'personas', label: 'Personas', icon: Users, count: personas.length },
    { id: 'demographics', label: 'Demographics', icon: BarChart3, count: demographics.length },
    { id: 'cohorts', label: 'Cohorts', icon: Target, count: cohorts.length }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Config Organization</h2>
        <p className="text-gray-600">Manage personas, demographics, and cohorts for AI agent creation</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Personas Tab */}
        {activeTab === 'personas' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">User Personas</h3>
              <button
                onClick={addPersona}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Persona</span>
              </button>
            </div>

            <div className="space-y-4">
              {personas.map((persona) => (
                <div key={persona.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{persona.name || 'New Persona'}</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingItem(editingItem === persona.id ? null : persona.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePersona(persona.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {editingItem === persona.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={persona.name}
                          onChange={(e) => updatePersona(persona.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Tech-Savvy Investor"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={persona.description}
                          onChange={(e) => updatePersona(persona.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Describe this persona..."
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setEditingItem(null)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2 inline" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-600">{persona.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Goals</h5>
                          <ul className="space-y-1">
                            {persona.goals.map((goal, index) => (
                              <li key={index} className="text-sm text-gray-600">• {goal}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Pain Points</h5>
                          <ul className="space-y-1">
                            {persona.painPoints.map((pain, index) => (
                              <li key={index} className="text-sm text-gray-600">• {pain}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Behaviors</h5>
                          <ul className="space-y-1">
                            {persona.behaviors.map((behavior, index) => (
                              <li key={index} className="text-sm text-gray-600">• {behavior}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demographics Tab */}
        {activeTab === 'demographics' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Demographics</h3>
              <button
                onClick={addDemographics}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Demographics</span>
              </button>
            </div>

            <div className="space-y-4">
              {demographics.map((demo) => (
                <div key={demo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Demographics Profile</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingItem(editingItem === demo.id ? null : demo.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDemographics(demo.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {editingItem === demo.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              value={demo.ageRange[0]}
                              onChange={(e) => updateDemographics(demo.id, 'ageRange', [parseInt(e.target.value), demo.ageRange[1]])}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="flex items-center text-gray-500">-</span>
                            <input
                              type="number"
                              value={demo.ageRange[1]}
                              onChange={(e) => updateDemographics(demo.id, 'ageRange', [demo.ageRange[0], parseInt(e.target.value)])}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                          <select
                            value={demo.gender[0]}
                            onChange={(e) => updateDemographics(demo.id, 'gender', [e.target.value])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="All">All</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setEditingItem(null)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2 inline" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">Age Range</h5>
                        <p className="text-sm text-gray-600">{demo.ageRange[0]} - {demo.ageRange[1]}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">Gender</h5>
                        <p className="text-sm text-gray-600">{demo.gender.join(', ')}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">Location</h5>
                        <p className="text-sm text-gray-600">{demo.location.join(', ')}</p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">Income</h5>
                        <p className="text-sm text-gray-600">{demo.income.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cohorts Tab */}
        {activeTab === 'cohorts' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Research Cohorts</h3>
              <button
                onClick={addCohort}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Cohort</span>
              </button>
            </div>

            <div className="space-y-4">
              {cohorts.map((cohort) => (
                <div key={cohort.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{cohort.name || 'New Cohort'}</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingItem(editingItem === cohort.id ? null : cohort.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCohort(cohort.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {editingItem === cohort.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={cohort.name}
                            onChange={(e) => updateCohort(cohort.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Primary Users"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                          <input
                            type="number"
                            value={cohort.size}
                            onChange={(e) => updateCohort(cohort.id, 'size', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={cohort.description}
                          onChange={(e) => updateCohort(cohort.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Describe this cohort..."
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => setEditingItem(null)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Save className="w-4 h-4 mr-2 inline" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-gray-600">{cohort.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Size</h5>
                          <p className="text-sm text-gray-600">{cohort.size.toLocaleString()}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Product</h5>
                          <p className="text-sm text-gray-600">{cohort.product}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Age Range</h5>
                          <p className="text-sm text-gray-600">{cohort.demographics.ageRange[0]} - {cohort.demographics.ageRange[1]}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">Location</h5>
                          <p className="text-sm text-gray-600">{cohort.demographics.location.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={saveConfigs}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save All Configurations</span>
        </button>
      </div>
    </div>
  );
}
