import React, { useState } from 'react';
import { Save, ArrowLeft, Bot, MessageCircle, Eye, MoreHorizontal } from 'lucide-react';
import { EnhancedPRD } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';

interface PRDEditorProps {
  prd: EnhancedPRD;
  onSave: (prd: EnhancedPRD) => void;
  onCancel: () => void;
}

export default function PRDEditor({ prd, onSave, onCancel }: PRDEditorProps) {
  const [editedPRD, setEditedPRD] = useState<EnhancedPRD>(prd);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);

  const handleSave = () => {
    enhancedPRDService.savePRD(editedPRD);
    onSave(editedPRD);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
            </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit PRD</h1>
            <p className="text-gray-600">Editing {editedPRD.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAISidebarOpen(!isAISidebarOpen)}
            className="btn-outline flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            AI Assistant
          </button>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {editedPRD.sections.map((section) => (
            <div key={section.id} className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>
              <textarea
                value={section.content}
                onChange={(e) => {
                  const updatedSections = editedPRD.sections.map(s =>
                    s.id === section.id 
                      ? { 
                          ...s, 
                          content: e.target.value,
                          lastModified: new Date().toISOString(),
                          wordCount: e.target.value.split(' ').length,
                          readingTime: Math.ceil(e.target.value.split(' ').length / 200)
                        } 
                      : s
                  );
                  setEditedPRD({ ...editedPRD, sections: updatedSections });
                }}
                className="textarea-field"
                rows={6}
                placeholder={`Enter ${section.title.toLowerCase()}...`}
              />
            </div>
          ))}
        </div>
        
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">PRD Info</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editedPRD.title}
                  onChange={(e) => setEditedPRD({ ...editedPRD, title: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editedPRD.description}
                  onChange={(e) => setEditedPRD({ ...editedPRD, description: e.target.value })}
                  className="textarea-field"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          {isAISidebarOpen && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h3>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">AI Suggestions</span>
                  </div>
                  <p className="text-sm text-purple-700">Ask me to help improve your PRD content.</p>
                </div>
                <button className="w-full btn-outline text-sm">
                  Generate AI Suggestions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}