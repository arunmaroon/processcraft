import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Zap, 
  Edit, 
  CheckCircle, 
  ArrowRight, 
  Bot,
  Star,
  Target,
  BarChart3,
  Users,
  Shield,
  Clock,
  Plus,
  X,
  Download,
  Upload,
  Settings,
  Eye,
  Copy,
  Archive
} from 'lucide-react';
import { EnhancedPRD, PRDType, PRDPriority, PRDTemplate } from '../../types/prd-enhanced';
import { enhancedPRDService } from '../../services/enhancedPRDService';

const prdTemplates: PRDTemplate[] = [
  {
    id: 'template-product',
    name: 'New Product Launch',
    description: 'Complete product specification from concept to launch',
    type: 'Product',
    industry: 'General',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        description: 'High-level product description and vision',
        isRequired: true,
        order: 1,
        placeholder: 'Describe your product vision and key value propositions...',
        aiPrompt: 'Generate a comprehensive product overview',
        examples: ['Mobile banking app', 'E-commerce platform', 'AI-powered analytics tool'],
        guidelines: ['Include target market', 'Highlight unique value', 'Define success criteria']
      },
      {
        id: 'goals',
        title: 'Goals & Objectives',
        description: 'Clear, measurable goals and success metrics',
        isRequired: true,
        order: 2,
        placeholder: 'Define your primary and secondary objectives...',
        aiPrompt: 'Generate SMART goals for product launch',
        examples: ['User acquisition targets', 'Revenue goals', 'Market penetration'],
        guidelines: ['Use SMART criteria', 'Include timelines', 'Define success metrics']
      }
    ],
    complianceChecks: [],
    isPublic: true,
    createdBy: 'System',
    usageCount: 0,
    rating: 4.5,
    tags: ['product', 'launch', 'general']
  },
  {
    id: 'template-fintech-feature',
    name: 'Fintech Feature',
    description: 'Feature development with compliance focus',
    type: 'Feature',
    industry: 'Fintech',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        description: 'Feature description with regulatory considerations',
        isRequired: true,
        order: 1,
        placeholder: 'Describe the fintech feature and regulatory requirements...',
        aiPrompt: 'Generate a fintech feature overview with compliance focus',
        examples: ['AI Credit Scoring', 'Digital Wallet', 'Payment Gateway'],
        guidelines: ['Include regulatory considerations', 'Highlight security measures', 'Define user benefits']
      },
      {
        id: 'compliance',
        title: 'Compliance & Risk',
        description: 'Regulatory requirements and risk assessment',
        isRequired: true,
        order: 2,
        placeholder: 'Define compliance requirements and risk mitigation...',
        aiPrompt: 'Generate compliance requirements for fintech feature',
        examples: ['RBI guidelines', 'PCI DSS compliance', 'Data privacy'],
        guidelines: ['Include all relevant regulations', 'Define risk mitigation', 'Specify audit requirements']
      }
    ],
    complianceChecks: [],
    isPublic: true,
    createdBy: 'System',
    usageCount: 0,
    rating: 4.8,
    tags: ['fintech', 'feature', 'compliance']
  }
];

const fintechQuickStart = [
  {
    name: 'AI Credit Scoring for Money View',
    description: 'Machine learning-powered credit assessment system',
    type: 'Feature' as PRDType,
    priority: 'High' as PRDPriority,
    sections: [
      { title: 'Overview', required: true, content: 'Implement AI-powered credit scoring to improve loan approval rates and reduce risk for Money View\'s personal loan products.' },
      { title: 'Goals', required: true, content: '• Increase loan approval rate by 15%\n• Reduce default rate by 10%\n• Improve customer experience with faster decisions\n• Comply with RBI guidelines for fair lending' },
      { title: 'User Stories', required: true, content: 'As a borrower, I want to get instant loan approval so that I can access funds quickly.\n\nAs a loan officer, I want AI-powered risk assessment so that I can make better lending decisions.\n\nAs a compliance officer, I want transparent scoring criteria so that we meet regulatory requirements.' },
      { title: 'Success Metrics', required: true, content: '• Loan approval rate: Target 85% (current 70%)\n• Average processing time: < 5 minutes\n• Default rate: < 3% (current 5%)\n• Customer satisfaction: > 4.5/5\n• Compliance score: 100%' },
      { title: 'Compliance & Risk', required: true, content: '• RBI Fair Lending Guidelines compliance\n• Data privacy as per IT Act 2000\n• Algorithm transparency requirements\n• Regular audit trail maintenance\n• Bias detection and mitigation' }
    ]
  },
  {
    name: 'Digital Wallet Integration',
    description: 'Seamless payment integration with popular wallets',
    type: 'Feature' as PRDType,
    priority: 'Medium' as PRDPriority,
    sections: [
      { title: 'Overview', required: true, content: 'Integrate with popular digital wallets to provide seamless payment experience for loan repayments and other financial transactions.' },
      { title: 'Goals', required: true, content: '• Increase payment success rate by 25%\n• Reduce payment processing time by 50%\n• Improve user convenience\n• Expand payment options' },
      { title: 'User Stories', required: true, content: 'As a borrower, I want to pay my loan using my preferred digital wallet so that I can use my existing payment methods.\n\nAs a user, I want to see all my payment options in one place so that I can choose the most convenient one.' },
      { title: 'Success Metrics', required: true, content: '• Payment success rate: > 95%\n• Average payment time: < 30 seconds\n• User adoption: > 60% of active users\n• Customer satisfaction: > 4.5/5' },
      { title: 'Compliance & Risk', required: true, content: '• PCI DSS compliance for payment processing\n• RBI guidelines for digital payments\n• Data security and encryption\n• Fraud detection and prevention' }
    ]
  }
];

export default function EnhancedPRDCreate() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<PRDTemplate | null>(null);
  const [prdTitle, setPrdTitle] = useState('');
  const [prdDescription, setPrdDescription] = useState('');
  const [prdPriority, setPrdPriority] = useState<PRDPriority>('Medium');
  const [isCreating, setIsCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customSections, setCustomSections] = useState<string[]>([]);
  const [newSection, setNewSection] = useState('');

  const handleTemplateSelect = (template: PRDTemplate) => {
    setSelectedTemplate(template);
    setPrdTitle('');
    setPrdDescription('');
  };

  const handleFintechTemplateSelect = (template: typeof fintechQuickStart[0]) => {
    setPrdTitle(template.name);
    setPrdDescription(template.description);
    setPrdPriority(template.priority);
    // Find matching template
    const matchingTemplate = prdTemplates.find(t => t.type === template.type);
    if (matchingTemplate) {
      setSelectedTemplate(matchingTemplate);
    }
  };

  const handleAddCustomSection = () => {
    if (newSection.trim() && !customSections.includes(newSection.trim())) {
      setCustomSections([...customSections, newSection.trim()]);
      setNewSection('');
    }
  };

  const handleRemoveCustomSection = (section: string) => {
    setCustomSections(customSections.filter(s => s !== section));
  };

  const handleCreatePRD = async () => {
    if (!selectedTemplate || !prdTitle.trim()) return;

    setIsCreating(true);

    try {
      // Create sections from template
      const sections = selectedTemplate.sections.map((templateSection, index) => ({
        id: templateSection.id,
        title: templateSection.title,
        content: '',
        order: index + 1,
        isRequired: templateSection.isRequired,
        isLocked: false,
        isAIGenerated: false,
        confidence: 0,
        comments: [],
        attachments: [],
        lastModified: new Date().toISOString(),
        modifiedBy: 'Current User',
        wordCount: 0,
        readingTime: 0
      }));

      // Add custom sections
      customSections.forEach((sectionTitle, index) => {
        sections.push({
          id: sectionTitle.toLowerCase().replace(/\s+/g, '-'),
          title: sectionTitle,
          content: '',
          order: sections.length + index + 1,
          isRequired: false,
          isLocked: false,
          isAIGenerated: false,
          confidence: 0,
          comments: [],
          attachments: [],
          lastModified: new Date().toISOString(),
          modifiedBy: 'Current User',
          wordCount: 0,
          readingTime: 0
        });
      });

      // Create new PRD
      const newPRD: EnhancedPRD = {
        id: `prd-enhanced-${Date.now()}`,
        title: prdTitle.trim(),
        type: selectedTemplate.type,
        stage: 'Create',
        status: 'Draft',
        priority: prdPriority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Current User',
        lastModifiedBy: 'Current User',
        version: 1,
        projectId: '1',
        sections,
        versionHistory: [],
        comments: [],
        attachments: [],
        isLocked: false,
        complianceChecked: false,
        approvalRequired: true,
        stakeholders: [],
        notifications: [],
        aiSuggestions: [],
        analytics: {
          views: 0,
          edits: 0,
          comments: 0,
          timeSpent: 0,
          lastViewed: new Date().toISOString(),
          mostActiveSection: '',
          collaborationScore: 0,
          completionRate: 0
        },
        insights: [],
        complianceChecks: [],
        riskAssessment: [],
        regulatoryRequirements: []
      };

      // Save PRD
      enhancedPRDService.savePRD(newPRD);

      // Redirect to editor
      navigate(`/prd/${newPRD.id}`);
    } catch (error) {
      console.error('Failed to create PRD:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/prd')}
          className="btn-ghost mb-4"
        >
          ← Back to PRDs
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New PRD</h1>
        <p className="text-gray-600">Choose a template to get started with your Product Requirements Document</p>
      </div>

      {/* Fintech Quick Start */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          Fintech Quick Start
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {fintechQuickStart.map((template, index) => (
            <div
              key={index}
              className="card card-hover cursor-pointer"
              onClick={() => handleFintechTemplateSelect(template)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-gray-600 text-sm">{template.description}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    template.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    template.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {template.priority}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {template.type}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {template.sections.length} pre-filled sections
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Selection */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose PRD Template</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prdTemplates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;
            
            return (
              <div
                key={template.id}
                className={`card card-hover cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{template.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">{template.industry}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded">{template.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{template.rating}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mb-3">
                  {template.sections.length} sections • {template.usageCount} uses
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PRD Details */}
      {selectedTemplate && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">PRD Details</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PRD Title *
                </label>
                <input
                  type="text"
                  value={prdTitle}
                  onChange={(e) => setPrdTitle(e.target.value)}
                  placeholder="Enter PRD title..."
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={prdPriority}
                  onChange={(e) => setPrdPriority(e.target.value as PRDPriority)}
                  className="input-field"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={prdDescription}
                onChange={(e) => setPrdDescription(e.target.value)}
                placeholder="Brief description of the PRD..."
                className="textarea-field"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <div className="text-sm text-gray-600 capitalize">
                {selectedTemplate.name} ({selectedTemplate.type})
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="btn-ghost text-sm flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>
              
              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Sections
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSection}
                        onChange={(e) => setNewSection(e.target.value)}
                        placeholder="Add custom section..."
                        className="input-field flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSection()}
                      />
                      <button
                        onClick={handleAddCustomSection}
                        className="btn-primary"
                        disabled={!newSection.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {customSections.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {customSections.map((section, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                          >
                            {section}
                            <button
                              onClick={() => handleRemoveCustomSection(section)}
                              className="hover:bg-blue-200 rounded p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Template Sections Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sections ({selectedTemplate.sections.length + customSections.length})
              </label>
              <div className="space-y-2">
                {selectedTemplate.sections.map((section, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      section.isRequired ? 'bg-red-500' : 'bg-gray-400'
                    }`} />
                    <span className="text-gray-700">{section.title}</span>
                    {section.isRequired && (
                      <span className="text-xs text-red-600">Required</span>
                    )}
                  </div>
                ))}
                {customSections.map((section, index) => (
                  <div key={`custom-${index}`} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-gray-700">{section}</span>
                    <span className="text-xs text-blue-600">Custom</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Button */}
      {selectedTemplate && (
        <div className="flex justify-end">
          <button
            onClick={handleCreatePRD}
            disabled={!prdTitle.trim() || isCreating}
            className="btn-primary flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                Create PRD
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
