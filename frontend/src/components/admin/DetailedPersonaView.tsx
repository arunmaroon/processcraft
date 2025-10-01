import React from 'react';
import { 
  X, 
  MessageCircle, 
  Power, 
  Trash2, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  Heart, 
  CreditCard, 
  Target, 
  AlertTriangle, 
  Activity, 
  Smartphone, 
  Quote,
  User,
  Calendar,
  Star
} from 'lucide-react';

interface DetailedPersona {
  id: string;
  name: string;
  photoDescription: string;
  age: number;
  gender: string;
  occupation: string;
  education: string;
  location: string;
  income: string;
  maritalStatus: string;
  creditScore: number;
  category: string;
  bio: string;
  goals: string[];
  painPoints: string[];
  behaviors: string[];
  technologyUse: string;
  quote: string;
  status?: 'ACTIVE' | 'SLEEPING';
  personality?: string;
  uniqueTraits?: string[];
  specificNeeds?: string[];
}

interface DetailedPersonaViewProps {
  persona: DetailedPersona;
  onClose: () => void;
  onSleep: (agentId: string) => void;
  onDelete: (agentId: string) => void;
  onChat: (agentId: string) => void;
}

const DetailedPersonaView: React.FC<DetailedPersonaViewProps> = ({
  persona,
  onClose,
  onSleep,
  onDelete,
  onChat
}) => {
  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600 bg-green-50';
    if (score >= 700) return 'text-blue-600 bg-blue-50';
    if (score >= 650) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('CAT A')) return 'text-blue-600 bg-blue-50';
    if (category.includes('CAT B')) return 'text-purple-600 bg-purple-50';
    if (category.includes('CAT C')) return 'text-orange-600 bg-orange-50';
    if (category.includes('Starter')) return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {persona.name.split(' ').map(n => n[0]).join('')}
              </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{persona.name}</h2>
              <div className="flex items-center space-x-6 text-xl font-semibold text-gray-700 mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-6 h-6" />
                  <span>{persona.age} years old</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-6 h-6" />
                  <span>{persona.gender}</span>
                </div>
              </div>
              <p className="text-lg text-gray-600 mb-3">{persona.occupation}</p>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(persona.category)}`}>
                  {persona.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  persona.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {persona.status}
                </span>
              </div>
            </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Photo Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Photo Description
            </h3>
            <p className="text-sm text-gray-600 italic">"{persona.photoDescription}"</p>
          </div>

          {/* Basic Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Demographics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Age & Gender</p>
                    <p className="text-sm text-gray-600">{persona.age} years old, {persona.gender}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Occupation</p>
                    <p className="text-sm text-gray-600">{persona.occupation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Education</p>
                    <p className="text-sm text-gray-600">{persona.education}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-sm text-gray-600">{persona.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Income</p>
                    <p className="text-sm text-gray-600">{persona.income}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Heart className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Marital Status</p>
                    <p className="text-sm text-gray-600">{persona.maritalStatus}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Credit Score</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCreditScoreColor(persona.creditScore)}`}>
                      {persona.creditScore} ({persona.creditScore >= 750 ? 'Excellent' : persona.creditScore >= 700 ? 'Good' : persona.creditScore >= 650 ? 'Fair' : 'Poor'})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Goals & Motivations
              </h3>
              <div className="space-y-2">
                {persona.goals.map((goal, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">{goal}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 flex items-center mt-6">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Pain Points
              </h3>
              <div className="space-y-2">
                {persona.painPoints.map((pain, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">{pain}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <User className="w-5 h-5 mr-2" />
              About {persona.name}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">{persona.bio}</p>
          </div>

          {/* Behaviors & Technology Use */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Behaviors
              </h3>
              <div className="space-y-2">
                {persona.behaviors.map((behavior, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">{behavior}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Technology Use
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{persona.technologyUse}</p>
            </div>
          </div>

          {/* Personality & Unique Traits */}
          {(persona.personality || persona.uniqueTraits) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {persona.personality && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Personality
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{persona.personality}</p>
                </div>
              )}

              {persona.uniqueTraits && persona.uniqueTraits.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Star className="w-5 h-5 mr-2" />
                    Unique Traits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {persona.uniqueTraits.map((trait, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quote */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <Quote className="w-5 h-5 mr-2" />
              Quote
            </h3>
            <blockquote className="text-lg text-gray-700 italic font-medium">
              "{persona.quote}"
            </blockquote>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onChat(persona.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with {persona.name}</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSleep(persona.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  persona.status === 'SLEEPING'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{persona.status === 'SLEEPING' ? 'Wake' : 'Sleep'}</span>
              </button>
              <button
                onClick={() => onDelete(persona.id)}
                className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedPersonaView;
