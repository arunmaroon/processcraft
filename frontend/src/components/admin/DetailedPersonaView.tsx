import React from 'react';
import { X, User, Brain, MessageCircle, Star, Target, Heart, Shield } from 'lucide-react';

interface DetailedPersonaViewProps {
  persona: any;
  onClose: () => void;
}

const DetailedPersonaView: React.FC<DetailedPersonaViewProps> = ({ persona, onClose }) => {
  if (!persona) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{persona.name || 'Persona Details'}</h2>
              <p className="text-sm text-gray-500">Detailed persona information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{persona.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Age</label>
                  <p className="text-gray-900">{persona.age || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupation</label>
                  <p className="text-gray-900">{persona.occupation || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-gray-900">{persona.category || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Personality Traits */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Personality Traits
              </h3>
              <div className="flex flex-wrap gap-2">
                {(persona.personality_traits || []).map((trait: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Tech Comfort */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Tech Comfort Level
              </h3>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(persona.tech_comfort || 0) * 10}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {persona.tech_comfort || 0}/10
                </span>
              </div>
            </div>

            {/* Real Quotes */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Real Quotes
              </h3>
              <div className="space-y-2">
                {(persona.real_quotes || []).slice(0, 3).map((quote: string, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 italic">"{quote}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
              Start Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedPersonaView;



