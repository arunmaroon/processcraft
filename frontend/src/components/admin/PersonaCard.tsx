import React from 'react';
import { User, MapPin, Briefcase, DollarSign, GraduationCap, Heart, Smartphone, Globe, Quote } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  age?: number;
  ageRange?: [number, number];
  gender?: string;
  photo?: string;
  tagline?: string;
  persona?: string; // For document-generated agents
  demographics: {
    age?: number;
    ageRange?: [number, number];
    occupation: string;
    income_range?: string;
    income?: string;
    location: string;
    education?: string;
    family_status?: string;
    tech_savviness?: string;
    techSavviness?: string;
    english_literacy?: string;
  };
  experience?: {
    level: string;
    context: string;
    device_preference: string;
    frequency: string;
  };
  goals: string[];
  concerns?: string[];
  behaviors: string[];
  communication_style: string;
  preferences: string[];
  pain_points: string[];
  painPoints?: string[];
  quote?: string;
  confidence: number;
  background?: {
    education: string;
    work_experience: string;
    family: string;
    lifestyle: string;
  };
  created_at?: string;
  // Additional fields for document-generated agents
  personality?: {
    traits?: string[];
    communicationStyle?: string;
    emotionalTone?: string;
    responseLength?: string;
  };
}

interface PersonaCardProps {
  persona: Persona;
  onSelect?: (persona: Persona) => void;
  isSelected?: boolean;
}

export default function PersonaCard({ persona, onSelect, isSelected }: PersonaCardProps) {
  const getTechSavvinessColor = (level: string) => {
    switch (level) {
      case 'Digital Native': return 'bg-purple-100 text-purple-800';
      case 'Very High': return 'bg-blue-100 text-blue-800';
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEnglishLiteracyColor = (level: string) => {
    switch (level) {
      case 'Native': return 'bg-green-100 text-green-800';
      case 'Fluent': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-indigo-100 text-indigo-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Basic': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect?.(persona)}
    >
      {/* Header with Photo and Basic Info */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start space-x-4">
          <img 
            src={persona.photo} 
            alt={persona.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{persona.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{persona.tagline}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {persona.age} years, {persona.gender}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {persona.demographics?.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <Briefcase className="w-4 h-4 mr-2" />
          Demographics
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-gray-600">{persona.demographics?.income_range || persona.demographics?.income}</span>
          </div>
          <div className="flex items-center">
            <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-gray-600">{persona.demographics?.education}</span>
          </div>
          <div className="flex items-center">
            <Heart className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-gray-600">{persona.demographics?.family_status}</span>
          </div>
          <div className="flex items-center">
            <Smartphone className="w-4 h-4 mr-2 text-gray-400" />
            <span className="text-gray-600">{persona.demographics?.tech_savviness}</span>
          </div>
        </div>
      </div>

      {/* Experience & Context */}
      <div className="p-6 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Experience & Context</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tech Level:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTechSavvinessColor(persona.demographics?.tech_savviness || 'Medium')}`}>
              {persona.experience?.level || 'Medium'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">English:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEnglishLiteracyColor(persona.demographics?.english_literacy || 'Medium')}`}>
              {persona.demographics?.english_literacy || 'Medium'}
            </span>
          </div>
          <p className="text-gray-600 text-xs mt-2">{persona.experience?.context || 'No context available'}</p>
        </div>
      </div>

      {/* Goals & Concerns */}
      <div className="p-6 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Goals</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {(persona.goals || []).slice(0, 3).map((goal, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  {goal}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Concerns</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {(persona.concerns || []).slice(0, 3).map((concern, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="p-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start">
            <Quote className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 italic">{persona.quote}</p>
          </div>
        </div>
      </div>

      {/* Confidence Indicator */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Confidence Level</span>
          <span>{Math.round(persona.confidence * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${persona.confidence * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}


interface Persona {
  id: string;
  name: string;
  age?: number;
  ageRange?: [number, number];
  gender?: string;
  photo?: string;
  tagline?: string;
  persona?: string; // For document-generated agents
  demographics: {
    age?: number;
    ageRange?: [number, number];
    occupation: string;
    income_range?: string;
    income?: string;
    location: string;
    education?: string;
    family_status?: string;
    tech_savviness?: string;
    techSavviness?: string;
    english_literacy?: string;
  };
  experience?: {
    level: string;
    context: string;
    device_preference: string;
    frequency: string;
  };
  goals: string[];
  concerns?: string[];
  behaviors: string[];
  communication_style: string;
  preferences: string[];
  pain_points: string[];
  painPoints?: string[];
  quote?: string;
  confidence: number;
  background?: {
    education: string;
    work_experience: string;
    family: string;
    lifestyle: string;
  };
  created_at?: string;
  // Additional fields for document-generated agents
  personality?: {
    traits?: string[];
    communicationStyle?: string;
    emotionalTone?: string;
    responseLength?: string;
  };
}

interface PersonaCardProps {
  persona: Persona;
  onSelect?: (persona: Persona) => void;
  isSelected?: boolean;
}

