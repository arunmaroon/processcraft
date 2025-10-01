import React, { useState } from 'react';
import { User, MapPin, Briefcase, DollarSign, GraduationCap, Heart, Smartphone, Globe, Quote, Target, AlertTriangle, CheckCircle, Star, Clock, Zap, Shield, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

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
  status?: 'ACTIVE' | 'SLEEPING' | 'DELETED';
}

interface PersonaCardProps {
  persona: Persona;
  onSelect?: (persona: Persona) => void;
  isSelected?: boolean;
  showDetails?: boolean;
}

export default function EnhancedPersonaCard({ persona, onSelect, isSelected, showDetails = true }: PersonaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Generate a photo URL based on persona characteristics
  const generatePhotoUrl = () => {
    if (persona.photo) return persona.photo;
    
    // Generate a placeholder photo based on persona characteristics
    const age = persona.age || persona.demographics?.age || (persona.demographics?.ageRange ? (persona.demographics.ageRange[0] + persona.demographics.ageRange[1]) / 2 : 30);
    const gender = persona.gender || 'neutral';
    const occupation = persona.demographics?.occupation?.toLowerCase() || 'professional';
    
    // Use a service like UI Avatars or similar for consistent placeholder images
    const baseUrl = 'https://ui-avatars.com/api/';
    const name = persona.name.replace(/\s+/g, '+');
    const background = getBackgroundColor(occupation);
    const color = getTextColor(background);
    
    return `${baseUrl}?name=${name}&background=${background}&color=${color}&size=200&bold=true`;
  };

  const getBackgroundColor = (occupation: string) => {
    const colors = {
      'software': '3B82F6', // Blue
      'engineer': '10B981', // Green
      'designer': 'F59E0B', // Yellow
      'manager': '8B5CF6', // Purple
      'analyst': 'EF4444', // Red
      'consultant': '06B6D4', // Cyan
      'teacher': 'EC4899', // Pink
      'doctor': '14B8A6', // Teal
      'default': '6B7280' // Gray
    };
    
    for (const [key, color] of Object.entries(colors)) {
      if (occupation.toLowerCase().includes(key)) return color;
    }
    return colors.default;
  };

  const getTextColor = (bgColor: string) => {
    return 'FFFFFF'; // White text for all backgrounds
  };

  const getAgeDisplay = () => {
    if (persona.demographics?.ageRange) {
      return `${persona.demographics.ageRange[0]}-${persona.demographics.ageRange[1]} years old`;
    }
    if (persona.demographics?.age) {
      return `${persona.demographics.age} years old`;
    }
    if (persona.age) {
      return `${persona.age} years old`;
    }
    return 'Age not specified';
  };

  const getIncomeDisplay = () => {
    return persona.demographics?.income_range || persona.demographics?.income || 'Not specified';
  };

  const getLocationDisplay = () => {
    return persona.demographics?.location || 'Not specified';
  };

  const getOccupationDisplay = () => {
    return persona.demographics?.occupation || 'Not specified';
  };

  const getEducationDisplay = () => {
    return persona.demographics?.education || 'Not specified';
  };

  const getFamilyStatusDisplay = () => {
    return persona.demographics?.family_status || 'Not specified';
  };

  const getTechSavvinessDisplay = () => {
    return persona.demographics?.tech_savviness || persona.demographics?.techSavviness || 'Not specified';
  };

  const getEnglishLiteracyDisplay = () => {
    return persona.demographics?.english_literacy || 'Not specified';
  };

  const getPainPoints = () => {
    return persona.pain_points || persona.painPoints || [];
  };

  const getCommunicationStyle = () => {
    return persona.communication_style || persona.personality?.communicationStyle || 'Not specified';
  };

  const getTechSavvinessColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'digital native':
      case 'very high':
      case 'high': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-600';
    if (confidence >= 0.6) return 'text-amber-600';
    return 'text-red-600';
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-emerald-500';
    if (confidence >= 0.6) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div 
      className={`group relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border-2 transition-all duration-500 hover:shadow-2xl cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02] ${
        isSelected 
          ? 'border-blue-500 ring-4 ring-blue-100 scale-105 shadow-2xl' 
          : 'border-white/40 hover:border-blue-300'
      }`}
      onClick={() => onSelect?.(persona)}
    >
      {/* Status Indicator */}
      {persona.status && (
        <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-semibold ${
          persona.status === 'ACTIVE' 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : persona.status === 'SLEEPING'
            ? 'bg-amber-100 text-amber-700 border border-amber-200'
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {persona.status === 'ACTIVE' ? 'Active' : persona.status === 'SLEEPING' ? 'Sleeping' : 'Deleted'}
        </div>
      )}

      {/* Header with Photo and Basic Info */}
      <div className="relative p-8 border-b border-gray-100 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-t-3xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, #3B82F6 0%, transparent 50%), 
                             radial-gradient(circle at 80% 80%, #8B5CF6 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="relative flex items-start space-x-6">
          {/* Photo with Confidence Badge */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-sm opacity-30"></div>
            <img 
              src={generatePhotoUrl()} 
              alt={persona.name}
              className="relative w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl"
            />
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${getConfidenceBadge(persona.confidence)}`}>
              <Star className="w-4 h-4 text-white fill-current" />
            </div>
          </div>

          {/* Name and Basic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{persona.name}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {persona.tagline || persona.persona || 'AI-Generated Persona'}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className={`text-lg font-bold ${getConfidenceColor(persona.confidence)}`}>
                  {Math.round(persona.confidence * 100)}%
                </div>
                <div className="text-xs text-gray-500 font-medium">Match</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center bg-white/70 px-3 py-2 rounded-xl border border-white/50">
                <User className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">{getAgeDisplay()}</span>
              </div>
              <div className="flex items-center bg-white/70 px-3 py-2 rounded-xl border border-white/50">
                <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                <span className="text-sm font-semibold text-gray-700">{getLocationDisplay()}</span>
              </div>
              <div className="flex items-center bg-white/70 px-3 py-2 rounded-xl border border-white/50">
                <Briefcase className="w-4 h-4 mr-2 text-purple-500" />
                <span className="text-sm font-semibold text-gray-700">{getOccupationDisplay()}</span>
              </div>
            </div>

            {/* Expand/Collapse Button */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-white/80 hover:bg-white text-gray-700 rounded-xl border border-white/60 transition-all duration-200 hover:shadow-md"
              >
                <span className="text-sm font-semibold">
                  {isExpanded ? 'Show Less' : 'Show Details'}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Summary View */}
      {showDetails && !isExpanded && (
        <div className="p-6 bg-gray-50/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Income:</span>
              <span className="ml-2 text-gray-800">{getIncomeDisplay()}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Tech Level:</span>
              <span className="ml-2 text-gray-800">{getTechSavvinessDisplay()}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 font-medium">Key Goals:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {persona.goals.slice(0, 2).map((goal, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {goal}
                  </span>
                ))}
                {persona.goals.length > 2 && (
                  <span className="text-gray-500 text-xs">+{persona.goals.length - 2} more</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed View */}
      {showDetails && isExpanded && (
        <div className="p-8 space-y-8">
          {/* Demographics Grid */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="bg-blue-500 p-2 rounded-lg mr-3">
                <User className="w-4 h-4 text-white" />
              </div>
              Demographics
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center bg-white/80 p-4 rounded-xl border border-white/60">
                <DollarSign className="w-5 h-5 mr-3 text-emerald-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-600">Income</div>
                  <div className="text-gray-800 font-medium">{getIncomeDisplay()}</div>
                </div>
              </div>
              <div className="flex items-center bg-white/80 p-4 rounded-xl border border-white/60">
                <GraduationCap className="w-5 h-5 mr-3 text-blue-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-600">Education</div>
                  <div className="text-gray-800 font-medium">{getEducationDisplay()}</div>
                </div>
              </div>
              <div className="flex items-center bg-white/80 p-4 rounded-xl border border-white/60">
                <Heart className="w-5 h-5 mr-3 text-pink-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-600">Family</div>
                  <div className="text-gray-800 font-medium">{getFamilyStatusDisplay()}</div>
                </div>
              </div>
              <div className="flex items-center bg-white/80 p-4 rounded-xl border border-white/60">
                <Smartphone className="w-5 h-5 mr-3 text-purple-500" />
                <div>
                  <div className="text-sm font-semibold text-gray-600">Tech Level</div>
                  <div className={`mt-1 px-3 py-1 rounded-full text-xs font-bold border ${getTechSavvinessColor(getTechSavvinessDisplay())}`}>
                    {getTechSavvinessDisplay()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-emerald-500" />
              Goals & Objectives
            </h4>
            <div className="flex flex-wrap gap-2">
              {persona.goals.map((goal, index) => (
                <span key={index} className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-200">
                  {goal}
                </span>
              ))}
            </div>
          </div>

          {/* Behaviors Section */}
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
              Behavioral Patterns
            </h4>
            <div className="flex flex-wrap gap-2">
              {persona.behaviors.map((behavior, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200">
                  {behavior}
                </span>
              ))}
            </div>
          </div>

          {/* Pain Points Section */}
          {getPainPoints().length > 0 && (
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                Pain Points & Challenges
              </h4>
              <div className="flex flex-wrap gap-2">
                {getPainPoints().map((painPoint, index) => (
                  <span key={index} className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold border border-red-200">
                    {painPoint}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Preferences Section */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-purple-500" />
              Preferences & Values
            </h4>
            <div className="flex flex-wrap gap-2">
              {persona.preferences.map((preference, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200">
                  {preference}
                </span>
              ))}
            </div>
          </div>

          {/* Communication Style */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <Quote className="w-5 h-5 mr-2 text-indigo-500" />
              Communication Style
            </h4>
            <p className="text-gray-700 leading-relaxed font-medium">
              {getCommunicationStyle()}
            </p>
          </div>

          {/* Quote Section */}
          {persona.quote && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-400">
              <div className="flex items-start">
                <Quote className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                <p className="text-gray-700 italic text-lg leading-relaxed font-medium">
                  "{persona.quote}"
                </p>
              </div>
            </div>
          )}

          {/* Footer with Timestamp */}
          {persona.created_at && (
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Created {new Date(persona.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                AI Generated
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}