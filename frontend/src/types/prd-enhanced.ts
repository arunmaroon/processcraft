// Enhanced PRD Types for World-Class PM Experience
export type PRDType = 'Product' | 'Feature' | 'Tweak' | 'A/B Test' | 'Strategic' | 'Tactical';

export type PRDStage = 'Create' | 'Generate' | 'Edit' | 'Finalise' | 'Approval' | 'Update';

export type PRDPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type PRDStatus = 'Draft' | 'In Review' | 'Approved' | 'In Development' | 'Completed' | 'Archived';

export interface EnhancedPRD {
  id: string;
  title: string;
  description: string;
  type: PRDType;
  stage: PRDStage;
  status: PRDStatus;
  priority: PRDPriority;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  owner: string;
  version: string;
  projectId?: string;
  isStarred: boolean;
  
  // Core Content
  sections: PRDSection[];
  versionHistory: PRDVersion[];
  comments: Comment[];
  attachments: Attachment[];
  
  // Workflow & Collaboration
  isLocked: boolean;
  complianceChecked: boolean;
  approvalRequired: boolean;
  stakeholders: Stakeholder[];
  notifications: Notification[];
  
  // AI & Analytics
  aiSuggestions: AISuggestion[];
  analytics: PRDAnalytics;
  insights: Insight[];
  
  // Fintech Specific
  complianceChecks: ComplianceCheck[];
  riskAssessment: RiskAssessment;
  regulatoryRequirements: RegulatoryRequirement[];
}

export interface PRDSection {
  id: string;
  title: string;
  content: string;
  order: number;
  isRequired: boolean;
  isLocked: boolean;
  isAIGenerated: boolean;
  confidence: number; // 0-100, AI confidence in this section
  comments: Comment[];
  attachments: Attachment[];
  lastModified: string;
  modifiedBy: string;
  wordCount: number;
  readingTime: number; // in minutes
}

export interface PRDVersion {
  id: string;
  version: number;
  stage: PRDStage;
  createdAt: string;
  changes: string;
  createdBy: string;
  diff: SectionDiff[];
  isMajor: boolean;
  reason: string;
}

export interface SectionDiff {
  sectionId: string;
  sectionTitle: string;
  changes: {
    added: string[];
    removed: string[];
    modified: string[];
  };
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  authorRole: string;
  createdAt: string;
  sectionId?: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  mentions: string[]; // User IDs mentioned in comment
  reactions: Reaction[];
}

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'spreadsheet' | 'presentation' | 'other';
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  influence: 'High' | 'Medium' | 'Low';
  interest: 'High' | 'Medium' | 'Low';
  approvalRequired: boolean;
  hasApproved: boolean;
  approvedAt?: string;
  feedback?: string;
}

export interface Notification {
  id: string;
  type: 'comment' | 'mention' | 'approval' | 'stage_change' | 'deadline' | 'reminder';
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface AISuggestion {
  id: string;
  prompt: string;
  content: string;
  stage: PRDStage;
  sectionId?: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'modified';
  confidence: number;
  reasoning: string;
  alternatives: string[];
  category: 'content' | 'structure' | 'compliance' | 'optimization';
}

export interface PRDAnalytics {
  views: number;
  edits: number;
  comments: number;
  timeSpent: number; // in minutes
  lastViewed: string;
  mostActiveSection: string;
  collaborationScore: number; // 0-100
  completionRate: number; // 0-100
}

export interface Insight {
  id: string;
  type: 'trend' | 'pattern' | 'recommendation' | 'warning';
  title: string;
  description: string;
  confidence: number;
  source: 'ai' | 'analytics' | 'user' | 'system';
  createdAt: string;
  actionable: boolean;
  actionItems?: string[];
}

// Fintech Specific Types
export interface ComplianceCheck {
  id: string;
  section: string;
  requirement: string;
  status: 'pending' | 'passed' | 'failed' | 'not_applicable';
  notes: string;
  checkedBy: string;
  checkedAt: string;
  evidence: string[];
  nextReview: string;
}

export interface RiskAssessment {
  id: string;
  riskType: 'regulatory' | 'technical' | 'business' | 'operational' | 'security';
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  probability: 'High' | 'Medium' | 'Low';
  mitigation: string;
  owner: string;
  status: 'open' | 'mitigated' | 'accepted';
  lastReviewed: string;
}

export interface RegulatoryRequirement {
  id: string;
  regulation: string; // e.g., "RBI Fair Lending Guidelines"
  section: string;
  requirement: string;
  complianceStatus: 'compliant' | 'non_compliant' | 'under_review';
  evidence: string[];
  lastChecked: string;
  nextReview: string;
}

export interface PRDAnalytics {
  views: number;
  edits: number;
  comments: number;
  shares: number;
  lastViewed: string;
}

export interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'warning';
  title: string;
  description: string;
  confidence: number;
  source: string;
  createdAt: string;
  isRead: boolean;
}

// Template Types
export interface PRDTemplate {
  id: string;
  name: string;
  description: string;
  type: PRDType;
  industry: string;
  sections: TemplateSection[];
  complianceChecks: ComplianceCheck[];
  isPublic: boolean;
  createdBy: string;
  usageCount: number;
  rating: number;
  tags: string[];
}

export interface TemplateSection {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  order: number;
  placeholder: string;
  aiPrompt: string;
  examples: string[];
  guidelines: string[];
}

// AI Service Types
export interface AIGenerationRequest {
  prompt: string;
  context: string;
  sectionType: string;
  prdType: PRDType;
  stage: PRDStage;
  previousContent?: string;
  requirements?: string[];
}

export interface AIGenerationResponse {
  content: string;
  confidence: number;
  reasoning: string;
  alternatives: string[];
  suggestions: string[];
  complianceNotes?: string[];
}

// Export/Import Types
export interface ExportOptions {
  format: 'markdown' | 'pdf' | 'docx' | 'json';
  includeComments: boolean;
  includeVersionHistory: boolean;
  includeAttachments: boolean;
  sections: string[];
}

export interface ImportOptions {
  source: 'file' | 'url' | 'template';
  file?: File;
  url?: string;
  templateId?: string;
  mergeStrategy: 'replace' | 'merge' | 'append';
}
