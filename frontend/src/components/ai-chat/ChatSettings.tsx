import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Brain,
  MessageSquare,
  Clock,
  Zap,
  Shield,
  Palette,
  Volume2,
  VolumeX
} from 'lucide-react';

interface ChatSettingsProps {
  onClose: () => void;
}

const ChatSettings: React.FC<ChatSettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState({
    responseSpeed: 'normal', // slow, normal, fast
    personalityIntensity: 'medium', // low, medium, high
    languageMixing: true, // Enable Hindi/English mixing
    emotionalResponses: true, // Enable emotional expressions
    technicalDepth: 'medium', // low, medium, high
    conversationStyle: 'balanced', // formal, casual, balanced
    autoTyping: true, // Show typing indicators
    soundEffects: false, // Play sound effects
    theme: 'light', // light, dark
    fontSize: 'medium', // small, medium, large
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-900">Chat Settings</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-6">
            {/* Response Speed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Clock className="w-4 h-4 inline mr-2" />
                Response Speed
              </label>
              <div className="flex space-x-4">
                {['slow', 'normal', 'fast'].map((speed) => (
                  <label key={speed} className="flex items-center">
                    <input
                      type="radio"
                      name="responseSpeed"
                      value={speed}
                      checked={settings.responseSpeed === speed}
                      onChange={(e) => handleSettingChange('responseSpeed', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">{speed}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Personality Intensity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Brain className="w-4 h-4 inline mr-2" />
                Personality Intensity
              </label>
              <div className="flex space-x-4">
                {['low', 'medium', 'high'].map((intensity) => (
                  <label key={intensity} className="flex items-center">
                    <input
                      type="radio"
                      name="personalityIntensity"
                      value={intensity}
                      checked={settings.personalityIntensity === intensity}
                      onChange={(e) => handleSettingChange('personalityIntensity', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">{intensity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Technical Depth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Zap className="w-4 h-4 inline mr-2" />
                Technical Depth
              </label>
              <div className="flex space-x-4">
                {['low', 'medium', 'high'].map((depth) => (
                  <label key={depth} className="flex items-center">
                    <input
                      type="radio"
                      name="technicalDepth"
                      value={depth}
                      checked={settings.technicalDepth === depth}
                      onChange={(e) => handleSettingChange('technicalDepth', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">{depth}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Conversation Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Conversation Style
              </label>
              <div className="flex space-x-4">
                {['formal', 'casual', 'balanced'].map((style) => (
                  <label key={style} className="flex items-center">
                    <input
                      type="radio"
                      name="conversationStyle"
                      value={style}
                      checked={settings.conversationStyle === style}
                      onChange={(e) => handleSettingChange('conversationStyle', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">{style}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Language Mixing */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Language Mixing
                </label>
                <p className="text-sm text-gray-500">Enable Hindi/English mixing for Indian context</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.languageMixing}
                  onChange={(e) => handleSettingChange('languageMixing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Emotional Responses */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Emotional Responses
                </label>
                <p className="text-sm text-gray-500">Enable emotional expressions and reactions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emotionalResponses}
                  onChange={(e) => handleSettingChange('emotionalResponses', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Auto Typing */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Auto Typing
                </label>
                <p className="text-sm text-gray-500">Show typing indicators during response generation</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoTyping}
                  onChange={(e) => handleSettingChange('autoTyping', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {settings.soundEffects ? <Volume2 className="w-4 h-4 inline mr-2" /> : <VolumeX className="w-4 h-4 inline mr-2" />}
                  Sound Effects
                </label>
                <p className="text-sm text-gray-500">Play sound effects for messages and notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEffects}
                  onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Font Size
              </label>
              <div className="flex space-x-4">
                {['small', 'medium', 'large'].map((size) => (
                  <label key={size} className="flex items-center">
                    <input
                      type="radio"
                      name="fontSize"
                      value={size}
                      checked={settings.fontSize === size}
                      onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Save settings logic here
                console.log('Settings saved:', settings);
                onClose();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;



