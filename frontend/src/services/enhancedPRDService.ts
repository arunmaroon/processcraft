import { 
  EnhancedPRD, 
  AISuggestion, 
  Comment, 
  Attachment, 
  Stakeholder, 
  Notification,
  PRDVersion,
  PRDTemplate,
  ExportOptions,
  ImportOptions
} from '../types/prd-enhanced';

// Enhanced PRD Storage Service for World-Class PM Experience
export class EnhancedPRDService {
  private static instance: EnhancedPRDService;
  
  static getInstance(): EnhancedPRDService {
    if (!EnhancedPRDService.instance) {
      EnhancedPRDService.instance = new EnhancedPRDService();
    }
    return EnhancedPRDService.instance;
  }

  // PRD Management
  getPRDs(): EnhancedPRD[] {
    if (typeof window === 'undefined') return [];
    const prds = localStorage.getItem('enhanced_prds');
    return prds ? JSON.parse(prds) : [];
  }

  getAllPRDs(): EnhancedPRD[] {
    return this.getPRDs();
  }

  savePRD(prd: EnhancedPRD): void {
    if (typeof window === 'undefined') return;
    const prds = this.getPRDs();
    const existingIndex = prds.findIndex(p => p.id === prd.id);
    
    if (existingIndex >= 0) {
      prds[existingIndex] = { ...prd, updatedAt: new Date().toISOString() };
    } else {
      prds.push(prd);
    }
    
    localStorage.setItem('enhanced_prds', JSON.stringify(prds));
  }

  getPRD(id: string): EnhancedPRD | null {
    const prds = this.getPRDs();
    return prds.find(p => p.id === id) || null;
  }

  deletePRD(id: string): void {
    if (typeof window === 'undefined') return;
    const prds = this.getPRDs().filter(p => p.id !== id);
    localStorage.setItem('enhanced_prds', JSON.stringify(prds));
  }

  getPRDsByProject(projectId: string): EnhancedPRD[] {
    const prds = this.getPRDs();
    return prds.filter(prd => prd.projectId === projectId);
  }

  getPRDsByStage(stage: string): EnhancedPRD[] {
    const prds = this.getPRDs();
    return prds.filter(prd => prd.stage === stage);
  }

  getPRDsByStatus(status: string): EnhancedPRD[] {
    const prds = this.getPRDs();
    return prds.filter(prd => prd.status === status);
  }

  // AI Suggestions Management
  getAISuggestions(prdId?: string): AISuggestion[] {
    if (typeof window === 'undefined') return [];
    const suggestions = localStorage.getItem('enhanced_ai_suggestions');
    const allSuggestions = suggestions ? JSON.parse(suggestions) : [];
    return prdId ? allSuggestions.filter(s => s.prdId === prdId) : allSuggestions;
  }

  saveAISuggestion(suggestion: AISuggestion & { prdId?: string }): void {
    if (typeof window === 'undefined') return;
    const suggestions = this.getAISuggestions();
    suggestions.push(suggestion);
    localStorage.setItem('enhanced_ai_suggestions', JSON.stringify(suggestions));
  }

  updateAISuggestion(id: string, status: 'accepted' | 'rejected' | 'modified'): void {
    if (typeof window === 'undefined') return;
    const suggestions = this.getAISuggestions();
    const suggestion = suggestions.find(s => s.id === id);
    if (suggestion) {
      suggestion.status = status;
      localStorage.setItem('enhanced_ai_suggestions', JSON.stringify(suggestions));
    }
  }

  // Comments Management
  getComments(prdId: string, sectionId?: string): Comment[] {
    if (typeof window === 'undefined') return [];
    const comments = localStorage.getItem('enhanced_comments');
    const allComments = comments ? JSON.parse(comments) : [];
    return allComments.filter(c => c.prdId === prdId && (!sectionId || c.sectionId === sectionId));
  }

  saveComment(comment: Comment & { prdId: string }): void {
    if (typeof window === 'undefined') return;
    const comments = this.getComments(comment.prdId);
    comments.push(comment);
    localStorage.setItem('enhanced_comments', JSON.stringify(comments));
  }

  updateComment(id: string, updates: Partial<Comment>): void {
    if (typeof window === 'undefined') return;
    const comments = this.getComments('');
    const comment = comments.find(c => c.id === id);
    if (comment) {
      Object.assign(comment, updates);
      localStorage.setItem('enhanced_comments', JSON.stringify(comments));
    }
  }

  // Attachments Management
  getAttachments(prdId: string): Attachment[] {
    if (typeof window === 'undefined') return [];
    const attachments = localStorage.getItem('enhanced_attachments');
    const allAttachments = attachments ? JSON.parse(attachments) : [];
    return allAttachments.filter(a => a.prdId === prdId);
  }

  saveAttachment(attachment: Attachment & { prdId: string }): void {
    if (typeof window === 'undefined') return;
    const attachments = this.getAttachments(attachment.prdId);
    attachments.push(attachment);
    localStorage.setItem('enhanced_attachments', JSON.stringify(attachments));
  }

  deleteAttachment(id: string): void {
    if (typeof window === 'undefined') return;
    const attachments = this.getAttachments('');
    const filtered = attachments.filter(a => a.id !== id);
    localStorage.setItem('enhanced_attachments', JSON.stringify(filtered));
  }

  // Stakeholders Management
  getStakeholders(prdId: string): Stakeholder[] {
    if (typeof window === 'undefined') return [];
    const stakeholders = localStorage.getItem('enhanced_stakeholders');
    const allStakeholders = stakeholders ? JSON.parse(stakeholders) : [];
    return allStakeholders.filter(s => s.prdId === prdId);
  }

  saveStakeholder(stakeholder: Stakeholder & { prdId: string }): void {
    if (typeof window === 'undefined') return;
    const stakeholders = this.getStakeholders(stakeholder.prdId);
    const existingIndex = stakeholders.findIndex(s => s.id === stakeholder.id);
    
    if (existingIndex >= 0) {
      stakeholders[existingIndex] = stakeholder;
    } else {
      stakeholders.push(stakeholder);
    }
    
    localStorage.setItem('enhanced_stakeholders', JSON.stringify(stakeholders));
  }

  // Notifications Management
  getNotifications(userId: string): Notification[] {
    if (typeof window === 'undefined') return [];
    const notifications = localStorage.getItem('enhanced_notifications');
    const allNotifications = notifications ? JSON.parse(notifications) : [];
    return allNotifications.filter(n => n.userId === userId);
  }

  saveNotification(notification: Notification): void {
    if (typeof window === 'undefined') return;
    const notifications = this.getNotifications(notification.userId);
    notifications.push(notification);
    localStorage.setItem('enhanced_notifications', JSON.stringify(notifications));
  }

  markNotificationAsRead(id: string): void {
    if (typeof window === 'undefined') return;
    const notifications = this.getNotifications('');
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      localStorage.setItem('enhanced_notifications', JSON.stringify(notifications));
    }
  }

  // Version Control
  createVersion(prdId: string, version: PRDVersion): void {
    if (typeof window === 'undefined') return;
    const versions = this.getVersions(prdId);
    versions.push(version);
    localStorage.setItem('enhanced_versions', JSON.stringify(versions));
  }

  getVersions(prdId: string): PRDVersion[] {
    if (typeof window === 'undefined') return [];
    const versions = localStorage.getItem('enhanced_versions');
    const allVersions = versions ? JSON.parse(versions) : [];
    return allVersions.filter(v => v.prdId === prdId);
  }

  // Templates Management
  getTemplates(): PRDTemplate[] {
    if (typeof window === 'undefined') return [];
    const templates = localStorage.getItem('enhanced_templates');
    return templates ? JSON.parse(templates) : this.getDefaultTemplates();
  }

  saveTemplate(template: PRDTemplate): void {
    if (typeof window === 'undefined') return;
    const templates = this.getTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem('enhanced_templates', JSON.stringify(templates));
  }

  // Export/Import
  exportPRD(prdId: string, options: ExportOptions): string {
    const prd = this.getPRD(prdId);
    if (!prd) throw new Error('PRD not found');

    const exportData = {
      prd: options.includeVersionHistory ? prd : { ...prd, versionHistory: [] },
      comments: options.includeComments ? this.getComments(prdId) : [],
      attachments: options.includeAttachments ? this.getAttachments(prdId) : [],
      exportedAt: new Date().toISOString(),
      exportedBy: 'Current User'
    };

    return JSON.stringify(exportData, null, 2);
  }

  importPRD(data: string, options: ImportOptions): EnhancedPRD {
    const importData = JSON.parse(data);
    const prd = importData.prd as EnhancedPRD;
    
    // Generate new ID to avoid conflicts
    prd.id = `prd-${Date.now()}`;
    prd.createdAt = new Date().toISOString();
    prd.updatedAt = new Date().toISOString();
    
    this.savePRD(prd);
    
    if (options.mergeStrategy === 'merge' || options.mergeStrategy === 'append') {
      // Handle comments and attachments if needed
    }
    
    return prd;
  }

  // Initialize with sample data
  initializeSampleData(): void {
    if (typeof window === 'undefined') return;
    
    // Initialize sample PRDs if none exist
    if (this.getPRDs().length === 0) {
      const samplePRD: EnhancedPRD = {
        id: 'prd-enhanced-1',
        title: 'AI Credit Scoring for Money View Loans',
        type: 'Feature',
        stage: 'Edit',
        status: 'In Review',
        priority: 'High',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'Arun',
        lastModifiedBy: 'Arun',
        version: 1,
        projectId: '1',
        sections: [
          {
            id: 'overview',
            title: 'Overview',
            content: 'Implement AI-powered credit scoring to improve loan approval rates and reduce risk for Money View\'s personal loan products. This feature will leverage machine learning algorithms to assess borrower creditworthiness while maintaining strict compliance with RBI guidelines.',
            order: 1,
            isRequired: true,
            isLocked: false,
            isAIGenerated: false,
            confidence: 0,
            comments: [],
            attachments: [],
            lastModified: new Date().toISOString(),
            modifiedBy: 'Arun',
            wordCount: 45,
            readingTime: 1
          },
          {
            id: 'goals',
            title: 'Goals',
            content: '• Increase loan approval rate by 15%\n• Reduce default rate by 10%\n• Improve customer experience with faster decisions\n• Comply with RBI guidelines for fair lending\n• Achieve 99.9% system uptime\n• Maintain transparent and explainable AI decisions',
            order: 2,
            isRequired: true,
            isLocked: false,
            isAIGenerated: false,
            confidence: 0,
            comments: [],
            attachments: [],
            lastModified: new Date().toISOString(),
            modifiedBy: 'Arun',
            wordCount: 35,
            readingTime: 1
          }
        ],
        versionHistory: [],
        comments: [],
        attachments: [],
        isLocked: false,
        complianceChecked: false,
        approvalRequired: true,
        stakeholders: [
          {
            id: 'stakeholder-1',
            name: 'Sarah Johnson',
            role: 'Head of Risk',
            email: 'sarah.johnson@moneyview.com',
            department: 'Risk Management',
            influence: 'High',
            interest: 'High',
            approvalRequired: true,
            hasApproved: false
          }
        ],
        notifications: [],
        aiSuggestions: [],
        analytics: {
          views: 15,
          edits: 8,
          comments: 3,
          timeSpent: 120,
          lastViewed: new Date().toISOString(),
          mostActiveSection: 'overview',
          collaborationScore: 85,
          completionRate: 75
        },
        insights: [],
        complianceChecks: [],
        riskAssessment: [],
        regulatoryRequirements: []
      };

      this.savePRD(samplePRD);
    }
  }

  private getDefaultTemplates(): PRDTemplate[] {
    return [
      {
        id: 'template-fintech-feature',
        name: 'Fintech Feature PRD',
        description: 'Comprehensive template for fintech feature development',
        type: 'Feature',
        industry: 'Fintech',
        sections: [
          {
            id: 'overview',
            title: 'Overview',
            description: 'High-level description of the feature',
            isRequired: true,
            order: 1,
            placeholder: 'Describe the feature and its purpose...',
            aiPrompt: 'Generate a comprehensive overview for a fintech feature',
            examples: ['AI Credit Scoring', 'Digital Wallet Integration'],
            guidelines: ['Include regulatory considerations', 'Highlight user benefits']
          }
        ],
        complianceChecks: [],
        isPublic: true,
        createdBy: 'System',
        usageCount: 0,
        rating: 4.5,
        tags: ['fintech', 'feature', 'compliance']
      }
    ];
  }
}

export const enhancedPRDService = EnhancedPRDService.getInstance();
