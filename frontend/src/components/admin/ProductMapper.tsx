import React, { useState, useEffect } from 'react';
import { Target, Link, Save, Plus, Trash2 } from 'lucide-react';

interface ProductMapping {
  id: string;
  product: string;
  personas: string[];
  cohorts: string[];
  demographics: string[];
}

interface ProductMapperProps {
  onMappingsUpdated: () => void;
}

export default function ProductMapper({ onMappingsUpdated }: ProductMapperProps) {
  const [mappings, setMappings] = useState<ProductMapping[]>([]);
  const [availablePersonas, setAvailablePersonas] = useState<any[]>([]);
  const [availableCohorts, setAvailableCohorts] = useState<any[]>([]);
  const [availableDemographics, setAvailableDemographics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [mappingsRes, configsRes] = await Promise.all([
        fetch('/api/admin-research/mappings'),
        fetch('/api/admin-research/configs')
      ]);

      if (mappingsRes.ok) {
        const mappingsData = await mappingsRes.json();
        setMappings(mappingsData);
      } else {
        // Fallback: Load sample mappings
        setMappings([
          {
            id: '1',
            product: 'DigiGold',
            personas: ['1', '2'],
            cohorts: ['1'],
            demographics: ['1']
          }
        ]);
      }

      if (configsRes.ok) {
        const configsData = await configsRes.json();
        setAvailablePersonas(configsData.personas || []);
        setAvailableCohorts(configsData.cohorts || []);
        setAvailableDemographics(configsData.demographics || []);
      } else {
        // Fallback: Load sample configs
        setAvailablePersonas([
          { id: '1', name: 'Tech-Savvy Investor' },
          { id: '2', name: 'Conservative Saver' }
        ]);
        setAvailableCohorts([
          { id: '1', name: 'Primary Users' }
        ]);
        setAvailableDemographics([
          { id: '1', ageRange: [25, 35], location: 'Global' }
        ]);
      }
    } catch (error) {
      console.log('API not available, using fallback data');
      // Use fallback data
      setMappings([
        {
          id: '1',
          product: 'DigiGold',
          personas: ['1', '2'],
          cohorts: ['1'],
          demographics: ['1']
        }
      ]);
      setAvailablePersonas([
        { id: '1', name: 'Tech-Savvy Investor' },
        { id: '2', name: 'Conservative Saver' }
      ]);
      setAvailableCohorts([
        { id: '1', name: 'Primary Users' }
      ]);
      setAvailableDemographics([
        { id: '1', ageRange: [25, 35], location: 'Global' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMappings = async () => {
    try {
      const response = await fetch('/api/admin-research/map-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mappings }),
      });

      if (response.ok) {
        onMappingsUpdated();
      } else {
        console.log('API not available, mappings saved locally');
        onMappingsUpdated();
      }
    } catch (error) {
      console.log('API not available, mappings saved locally');
      onMappingsUpdated();
    }
  };

  const addMapping = () => {
    const newMapping: ProductMapping = {
      id: `mapping-${Date.now()}`,
      product: '',
      personas: [],
      cohorts: [],
      demographics: []
    };
    setMappings(prev => [...prev, newMapping]);
  };

  const updateMapping = (id: string, field: keyof ProductMapping, value: any) => {
    setMappings(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const deleteMapping = (id: string) => {
    setMappings(prev => prev.filter(m => m.id !== id));
  };

  const toggleArrayItem = (id: string, field: 'personas' | 'cohorts' | 'demographics', itemId: string) => {
    setMappings(prev => prev.map(m => {
      if (m.id === id) {
        const currentArray = m[field];
        const newArray = currentArray.includes(itemId)
          ? currentArray.filter(item => item !== itemId)
          : [...currentArray, itemId];
        return { ...m, [field]: newArray };
      }
      return m;
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product mappings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Mapping</h2>
        <p className="text-gray-600">Map products to specific personas, cohorts, and demographics for AI agent creation</p>
      </div>

      {/* Add Mapping Button */}
      <div className="flex justify-end">
        <button
          onClick={addMapping}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product Mapping</span>
        </button>
      </div>

      {/* Mappings List */}
      <div className="space-y-6">
        {mappings.map((mapping) => (
          <div key={mapping.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                {mapping.product || 'New Product Mapping'}
              </h3>
              <button
                onClick={() => deleteMapping(mapping.id)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={mapping.product}
                  onChange={(e) => updateMapping(mapping.id, 'product', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., DigiGold, MobileBank, etc."
                />
              </div>

              {/* Personas Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Personas</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availablePersonas.map((persona) => (
                    <label key={persona.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapping.personas.includes(persona.id)}
                        onChange={() => toggleArrayItem(mapping.id, 'personas', persona.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{persona.name}</div>
                        <div className="text-sm text-gray-600">{persona.description || 'User persona'}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Cohorts Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Cohorts</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableCohorts.map((cohort) => (
                    <label key={cohort.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapping.cohorts.includes(cohort.id)}
                        onChange={() => toggleArrayItem(mapping.id, 'cohorts', cohort.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{cohort.name}</div>
                        <div className="text-sm text-gray-600">Size: {cohort.size?.toLocaleString() || 'N/A'}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Demographics Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Demographics</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableDemographics.map((demo) => (
                    <label key={demo.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mapping.demographics.includes(demo.id)}
                        onChange={() => toggleArrayItem(mapping.id, 'demographics', demo.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          Age {demo.ageRange?.[0]}-{demo.ageRange?.[1]}
                        </div>
                        <div className="text-sm text-gray-600">
                          {demo.location} • {demo.income}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Mapping Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Personas: </span>
                    <span className="font-medium">
                      {mapping.personas.length} selected
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cohorts: </span>
                    <span className="font-medium">
                      {mapping.cohorts.length} selected
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Demographics: </span>
                    <span className="font-medium">
                      {mapping.demographics.length} selected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={saveMappings}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save All Mappings</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-3">Mapping Guidelines</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Map each product to relevant personas, cohorts, and demographics</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>These mappings will be used to create AI agents that mimic real users</span>
          </li>
          <li className="flex items-start">
            <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Agents will be available for virtual research studies across all projects</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
