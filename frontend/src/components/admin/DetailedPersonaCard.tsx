import React, { useState } from 'react';
import { 
  User, MapPin, Briefcase, GraduationCap, Heart, 
  Smartphone, Laptop, Monitor, Clock, Target, 
  AlertTriangle, MessageCircle, Star, TrendingUp,
  ChevronDown, ChevronUp, Eye, Edit, Trash2, 
  Moon, Play, Zap, Shield, Brain
} from 'lucide-react';

interface DetailedPersona {
  id: string;
  name: string;
  age: number;
  gender: string;
  photo: string;
  tagline: string;
  status: 'ACTIVE' | 'SLEEPING' | 'DELETED';
  
  // Demographics
  demographics: {
    age: number;
    occupation: string;
    income_range: string;
    location: string;
    education: string;
    family_status: string;
    tech_savviness: string;
    english_literacy: string;
  };
  
  // Experience & Context
  experience: {
    level: string;
    context: string;
    device_preference: string;
    frequency: string;
  };
  
  // Goals & Motivations
  goals: string[];
  concerns: string[];
  behaviors: string[];
  communication_style: string;
  preferences: string[];
  pain_points: string[];
  quote: string;
  confidence: number;
  
  // Background Story
  background: {
    education: string;
    work_experience: string;
    family: string;
    lifestyle: string;
  };
  
  // Research Context
  research_context: {
    study_types: string[];
    availability: string;
    engagement_level: string;
    response_quality: string;
  };
  
  created_at: string;
}

interface DetailedPersonaCardProps {
  persona: DetailedPersona;
  onSleep?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function DetailedPersonaCard({ persona, onSleep, onDelete, onEdit }: DetailedPersonaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'SLEEPING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELETED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTechLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-orange-100 text-orange-800';
      case 'very low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {persona.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${getStatusColor(persona.status)}`}>
                {persona.status === 'ACTIVE' ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : persona.status === 'SLEEPING' ? (
                  <Moon className="w-3 h-3" />
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{persona.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(persona.status)}`}>
                  {persona.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTechLevelColor(persona.demographics.tech_savviness)}`}>
                  {persona.demographics.tech_savviness} Tech
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{persona.tagline}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{persona.age} years old</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{persona.demographics.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-3 h-3" />
                  <span>{persona.demographics.occupation}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onEdit?.(persona.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSleep?.(persona.id)}
              className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete?.(persona.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{persona.confidence * 100}%</div>
            <div className="text-xs text-gray-500">Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{persona.demographics.income_range}</div>
            <div className="text-xs text-gray-500">Income</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{persona.experience.level}</div>
            <div className="text-xs text-gray-500">Experience</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{persona.research_context?.engagement_level || 'High'}</div>
            <div className="text-xs text-gray-500">Engagement</div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Demographics Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Demographics
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{persona.age} years old</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{persona.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Education:</span>
                  <span className="font-medium">{persona.demographics.education}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Family Status:</span>
                  <span className="font-medium">{persona.demographics.family_status}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{persona.demographics.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupation:</span>
                  <span className="font-medium">{persona.demographics.occupation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Income:</span>
                  <span className="font-medium">{persona.demographics.income_range}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">English Literacy:</span>
                  <span className="font-medium">{persona.demographics.english_literacy}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Goals & Motivations */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Goals & Motivations
            </h4>
            <div className="space-y-3">
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Primary Goals</h5>
                <div className="flex flex-wrap gap-2">
                  {persona.goals.slice(0, 3).map((goal, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {goal}
                    </span>
                  ))}
                  {persona.goals.length > 3 && (
                    <span className="text-gray-500 text-xs">+{persona.goals.length - 3} more</span>
                  )}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Key Concerns</h5>
                <div className="flex flex-wrap gap-2">
                  {persona.concerns.slice(0, 2).map((concern, index) => (
                    <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                      {concern}
                    </span>
                  ))}
                  {persona.concerns.length > 2 && (
                    <span className="text-gray-500 text-xs">+{persona.concerns.length - 2} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Behaviors & Preferences */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Behaviors & Preferences
            </h4>
            <div className="space-y-3">
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Communication Style</h5>
                <p className="text-sm text-gray-600">{persona.communication_style}</p>
              </div>
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Key Behaviors</h5>
                <div className="flex flex-wrap gap-2">
                  {persona.behaviors.slice(0, 3).map((behavior, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {behavior}
                    </span>
                  ))}
                  {persona.behaviors.length > 3 && (
                    <span className="text-gray-500 text-xs">+{persona.behaviors.length - 3} more</span>
                  )}
                </div>
              </div>
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">Preferences</h5>
                <div className="flex flex-wrap gap-2">
                  {persona.preferences.slice(0, 3).map((pref, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      {pref}
                    </span>
                  ))}
                  {persona.preferences.length > 3 && (
                    <span className="text-gray-500 text-xs">+{persona.preferences.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pain Points */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Pain Points
            </h4>
            <div className="flex flex-wrap gap-2">
              {persona.pain_points.slice(0, 4).map((pain, index) => (
                <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                  {pain}
                </span>
              ))}
              {persona.pain_points.length > 4 && (
                <span className="text-gray-500 text-xs">+{persona.pain_points.length - 4} more</span>
              )}
            </div>
          </div>

          {/* Background Story */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Background Story
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Education:</strong> {persona.background.education}</p>
              <p><strong>Work Experience:</strong> {persona.background.work_experience}</p>
              <p><strong>Family:</strong> {persona.background.family}</p>
              <p><strong>Lifestyle:</strong> {persona.background.lifestyle}</p>
            </div>
          </div>

          {/* Quote */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              In Their Own Words
            </h4>
            <blockquote className="text-sm text-gray-700 italic">
              "{persona.quote}"
            </blockquote>
          </div>

          {/* Research Context */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Research Context
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Study Types:</span>
                  <span className="font-medium">{persona.research_context?.study_types?.join(', ') || 'Interviews, Surveys'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className="font-medium">{persona.research_context?.availability || 'Weekdays'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Engagement:</span>
                  <span className="font-medium">{persona.research_context?.engagement_level || 'High'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Quality:</span>
                  <span className="font-medium">{persona.research_context?.response_quality || 'Excellent'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Show More/Less Button */}
          <div className="text-center">
            <button
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showFullDetails ? 'Show Less Details' : 'Show More Details'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
