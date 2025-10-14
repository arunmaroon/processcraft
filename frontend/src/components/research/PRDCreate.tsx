import React, { useState } from 'react';
import { Plus, ArrowLeft, FileText, Bot, Sparkles } from 'lucide-react';
import { EnhancedPRD, PRDType, PRDPriority } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';

interface PRDCreateProps {
  projectId?: string;
  onPRDCreated: (prd: EnhancedPRD) => void;
  onCancel: () => void;
}

export default function PRDCreate({ projectId = 'default', onPRDCreated, onCancel }: PRDCreateProps) {
  const [step, setStep] = useState<'type' | 'details' | 'template'>('type');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Feature' as PRDType,
    priority: 'Medium' as PRDPriority,
    template: ''
  });

  const handleCreate = () => {
    const newPRD: EnhancedPRD = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      priority: formData.priority,
      stage: 'Create',
      status: 'Draft',
      version: '1.0',
      projectId: projectId,
      owner: 'Current User',
      isStarred: false,
      isLocked: false,
      createdBy: 'Current User',
      lastModifiedBy: 'Current User',
      sections: [],
      versionHistory: [],
      comments: [],
      attachments: [],
      complianceChecked: false,
      approvalRequired: false,
      stakeholders: [],
      notifications: [],
      aiSuggestions: [],
      analytics: {
        views: 0,
        edits: 0,
        comments: 0,
        shares: 0,
        lastViewed: new Date().toISOString()
      },
      insights: [],
      complianceChecks: [],
      riskAssessment: {
        level: 'Low',
        factors: [],
        mitigation: []
      },
      regulatoryRequirements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    enhancedPRDService.savePRD(newPRD);
    onPRDCreated(newPRD);
  };

  if (step === 'type') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New PRD</h1>
            <p className="text-gray-600">Choose the type of PRD you want to create</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { type: 'Product', icon: FileText, description: 'Complete product specification' },
            { type: 'Feature', icon: Plus, description: 'New feature or enhancement' },
            { type: 'Tweak', icon: Bot, description: 'Minor improvement or fix' },
            { type: 'A/B Test', icon: Sparkles, description: 'Experimental feature test' }
          ].map(({ type, icon: Icon, description }) => (
            <button
              key={type}
              onClick={() => {
                setFormData(prev => ({ ...prev, type: type as PRDType }));
                setStep('details');
              }}
              className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
            >
              <Icon className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">{type}</h3>
              <p className="text-sm text-gray-600 mt-2">{description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'details') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('type')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PRD Details</h1>
            <p className="text-gray-600">Provide basic information for your {formData.type}</p>
          </div>
        </div>

        <div className="card max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="Enter PRD title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="textarea-field"
                rows={3}
                placeholder="Brief description of the PRD..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as PRDPriority }))}
                  className="input-field"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setStep('type')} className="btn-outline">
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!formData.title.trim()}
                className="btn-primary"
              >
                Create PRD
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
