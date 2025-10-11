import React from 'react';
import { 
    MapPinIcon, 
    CalendarIcon, 
    BriefcaseIcon,
    AcademicCapIcon,
    CurrencyRupeeIcon,
    HeartIcon,
    LightBulbIcon,
    ExclamationTriangleIcon,
    CogIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ClockIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const DetailedPersonaCard = ({ persona }) => {
    if (!persona) return null;

    const {
        name,
        title,
        location,
        age,
        gender,
        avatar_url,
        quote,
        demographics,
        goals,
        pain_points,
        behaviors,
        skills,
        personality,
        technology,
        daily_life,
        voice
    } = persona;

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0">
                        <img 
                            src={avatar_url || persona.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Persona')}&background=random&color=fff&size=200`} 
                            alt={name}
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Persona')}&background=random&color=fff&size=200`;
                            }}
                        />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">{name}</h1>
                        <p className="text-xl opacity-90 mb-4">{title}</p>
                        <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                                <MapPinIcon className="w-4 h-4" />
                                <span>{location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{age} years old</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <UserGroupIcon className="w-4 h-4" />
                                <span>{gender}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quote Section */}
            {quote && (
                <div className="bg-gray-50 p-6 border-l-4 border-blue-500">
                    <div className="flex items-start space-x-3">
                        <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                        <blockquote className="text-lg italic text-gray-700">
                            "{quote}"
                        </blockquote>
                    </div>
                </div>
            )}

            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Demographics */}
                        <div className="bg-blue-50 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <UserGroupIcon className="w-5 h-5 mr-2 text-blue-600" />
                                Demographics
                            </h3>
                            <div className="space-y-3">
                                <div className="text-sm text-gray-700">
                                    <span className="font-medium">{demographics?.education || 'Education not specified'}</span>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {demographics?.income_range && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                            {demographics.income_range}
                                        </span>
                                    )}
                                    {demographics?.family_status && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                            {demographics.family_status}
                                        </span>
                                    )}
                                    {demographics?.tech_savviness && (
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                            Tech: {demographics.tech_savviness}
                                        </span>
                                    )}
                                    {demographics?.english_proficiency && (
                                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                                            English: {demographics.english_proficiency}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Goals & Motivations */}
                        <div className="bg-green-50 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <LightBulbIcon className="w-5 h-5 mr-2 text-green-600" />
                                Goals & Motivations
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Primary Goals:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                        {Array.isArray(goals?.primary) ? goals.primary.map((goal, index) => (
                                            <li key={index}>{goal}</li>
                                        )) : (
                                            <li className="text-gray-500">No primary goals available</li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Motivations:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                        {Array.isArray(goals?.motivations) ? goals.motivations.map((motivation, index) => (
                                            <li key={index}>{motivation}</li>
                                        )) : (
                                            <li className="text-gray-500">No motivations available</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Pain Points */}
                        <div className="bg-red-50 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-600" />
                                Pain Points & Challenges
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Primary Concerns:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                        {Array.isArray(pain_points?.primary) ? pain_points.primary.map((point, index) => (
                                            <li key={index}>{point}</li>
                                        )) : (
                                            <li className="text-gray-500">No primary pain points available</li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Frustrations:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                        {Array.isArray(pain_points?.frustrations) ? pain_points.frustrations.map((frustration, index) => (
                                            <li key={index}>{frustration}</li>
                                        )) : (
                                            <li className="text-gray-500">No frustrations available</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Skills & Knowledge */}
                        <div className="bg-purple-50 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <CogIcon className="w-5 h-5 mr-2 text-purple-600" />
                                Skills & Knowledge
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Technical Skills:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(skills?.technical) ? skills.technical.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                                {skill}
                                            </span>
                                        )) : (
                                            <span className="text-gray-500 text-sm">No technical skills available</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Soft Skills:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(skills?.soft_skills) ? skills.soft_skills.map((skill, index) => (
                                            <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                                {skill}
                                            </span>
                                        )) : (
                                            <span className="text-gray-500 text-sm">No soft skills available</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Technology Usage */}
                        <div className="bg-indigo-50 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <DevicePhoneMobileIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                Technology Usage
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Devices:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(technology?.devices) ? technology.devices.map((device, index) => (
                                            <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                                {device}
                                            </span>
                                        )) : (
                                            <span className="text-gray-500 text-sm">No devices available</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Platforms:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(technology?.platforms) ? technology.platforms.map((platform, index) => (
                                            <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                                {platform}
                                            </span>
                                        )) : (
                                            <span className="text-gray-500 text-sm">No platforms available</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Comfort Level:</h4>
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                                        {technology?.comfort_level}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Daily Life */}
                        <div className="bg-orange-50 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <ClockIcon className="w-5 h-5 mr-2 text-orange-600" />
                                Daily Life
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Morning Routine:</h4>
                                    <p className="text-sm text-gray-600">{daily_life?.morning_routine}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Work Environment:</h4>
                                    <p className="text-sm text-gray-600">{daily_life?.work_environment}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Leisure Activities:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(daily_life?.leisure_activities) ? daily_life.leisure_activities.map((activity, index) => (
                                            <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                                {activity}
                                            </span>
                                        )) : (
                                            <span className="text-gray-500 text-sm">No leisure activities available</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personality Traits */}
                        <div className="bg-pink-50 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <HeartIcon className="w-5 h-5 mr-2 text-pink-600" />
                                Personality
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Traits:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(personality?.traits) ? personality.traits.map((trait, index) => (
                                            <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                                                {trait}
                                            </span>
                                        )) : (
                                            <span className="text-gray-500 text-sm">No traits available</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-2">Values:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(personality?.values) ? personality.values.map((value, index) => (
                                            <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
                                                {value}
                                            </span>
                                        )) : (
                                            <span className="text-gray-500 text-sm">No values available</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedPersonaCard;
