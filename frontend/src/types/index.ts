export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type UserRole = 
  | 'PM' 
  | 'RESEARCHER' 
  | 'UX_DESIGNER' 
  | 'UI_DESIGNER' 
  | 'VISUAL_DESIGNER' 
  | 'UX_WRITER' 
  | 'DEVELOPER'
  | 'ADMIN';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  currentStage: WorkflowStage;
  createdAt: string;
  updatedAt: string;
  assignedUsers: {
    [key in UserRole]?: string[];
  };
  prd?: PRD;
  research?: ResearchData;
  design?: DesignData;
  uiVariants?: UIVariant[];
  code?: CodeExport;
  approvals: Approval[];
  version: number;
}

export type ProjectStatus = 'DRAFT' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'APPROVED' | 'COMPLETED';

export type WorkflowStage = 
  | 'PRODUCT_THINKING'
  | 'USER_RESEARCH'
  | 'UX_DESIGN'
  | 'UI_DESIGN'
  | 'VISUAL_DESIGN'
  | 'UX_CONTENT'
  | 'CODE_EXPORT';

export type ResearchStep = 
  | 'research-plan'
  | 'cohort-setup'
  | 'persona-creation'
  | 'ai-research'
  | 'insights-generation'
  | 'report-creation'
  | 'plan'
  | 'discussion-guide'
  | 'research-execution'
  | 'report';

export interface PRD {
  id: string;
  objectives: string[];
  targetUsers: string[];
  successMetrics: string[];
  businessContext: string;
  constraints: string[];
  status: 'DRAFT' | 'COMPLETED';
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  generatedContent?: any;
  sections?: {
    strategy?: string;
    market?: string;
    users?: string;
    technical?: string;
    execution?: string;
    metrics?: string;
  };
  version?: string;
}

export interface ResearchData {
  id: string;
  projectId?: string;
  product: string;
  cohorts: Cohort[];
  personas: Persona[];
  demographics?: Demographics;
  insights: Insight[];
  recommendations?: Recommendation[];
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  report: ResearchReport;
  createdAt: string;
  updatedAt: string;
}

export interface Cohort {
  id: string;
  name: string;
  description: string;
  demographics: Demographics;
  size: number;
}

export interface Demographics {
  ageRange: [number, number];
  gender: string[];
  location: string[];
  income: string[];
  education: string[];
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  goals: string[];
  painPoints: string[];
  behaviors: string[];
  designPreferences: DesignPreferences;
}

export interface DesignPreferences {
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
  interactionStyle: 'CHAT' | 'FORM' | 'DASHBOARD' | 'MOBILE';
  colorScheme: 'LIGHT' | 'DARK' | 'AUTO';
  accessibility: 'STANDARD' | 'ENHANCED';
}

export interface Insight {
  id: string;
  category: 'PAIN_POINT' | 'OPPORTUNITY' | 'BEHAVIOR' | 'PREFERENCE' | 'USABILITY';
  title: string;
  description: string;
  confidence: number;
  source: string;
  quotes?: string[];
}

export interface Recommendation {
  id: string;
  type: 'DESIGN' | 'CONTENT' | 'INTERACTION' | 'ACCESSIBILITY';
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ResearchReport {
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  methodology: string;
  dataQuality: number;
  nextSteps: string[];
}

export interface DesignData {
  id: string;
  principles: string[];
  framework: string;
  wireframes: Wireframe[];
  userFlows: UserFlow[];
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
}

export interface Wireframe {
  id: string;
  name: string;
  description: string;
  screenType: string;
  content: string; // SVG or JSON representation
  annotations: Annotation[];
  version: number;
}

export interface Annotation {
  id: string;
  type: 'NOTE' | 'WARNING' | 'SUGGESTION';
  content: string;
  position: { x: number; y: number };
  createdBy: string;
  createdAt: string;
}

export interface UserFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  screens: string[]; // Wireframe IDs
}

export interface FlowStep {
  id: string;
  action: string;
  screen: string;
  conditions?: string[];
  nextSteps: string[];
}

export interface UIVariant {
  id: string;
  personaId: string;
  name: string;
  description: string;
  designSystem: DesignSystem;
  screens: UIScreen[];
  content: ContentData;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
}

export interface DesignSystem {
  id: string;
  name: string;
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  components: ComponentTokens;
}

export interface ColorTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
}

export interface TypographyTokens {
  fontFamily: string;
  heading1: FontToken;
  heading2: FontToken;
  heading3: FontToken;
  body: FontToken;
  caption: FontToken;
}

export interface FontToken {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
}

export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ComponentTokens {
  button: ComponentToken;
  input: ComponentToken;
  card: ComponentToken;
  modal: ComponentToken;
}

export interface ComponentToken {
  padding: string;
  borderRadius: string;
  borderWidth: string;
  shadow: string;
}

export interface UIScreen {
  id: string;
  name: string;
  wireframeId: string;
  content: string; // Rendered UI
  interactions: Interaction[];
}

export interface Interaction {
  id: string;
  type: 'CLICK' | 'HOVER' | 'FOCUS' | 'SCROLL';
  element: string;
  action: string;
  feedback: string;
}

export interface ContentData {
  copy: { [key: string]: string };
  images: { [key: string]: string };
  microcopy: { [key: string]: string };
  accessibility: AccessibilityData;
}

export interface AccessibilityData {
  altText: { [key: string]: string };
  ariaLabels: { [key: string]: string };
  focusOrder: string[];
  screenReaderNotes: { [key: string]: string };
}

export interface CodeExport {
  id: string;
  framework: 'REACT' | 'VUE' | 'ANGULAR' | 'VANILLA';
  language: 'TYPESCRIPT' | 'JAVASCRIPT';
  files: CodeFile[];
  dependencies: string[];
  buildInstructions: string[];
  deploymentConfig: DeploymentConfig;
  mcpSimulation: MCPSimulation;
  status: 'GENERATING' | 'READY' | 'DEPLOYED';
  createdAt: string;
  updatedAt: string;
}

export interface CodeFile {
  path: string;
  content: string;
  type: 'COMPONENT' | 'STYLE' | 'CONFIG' | 'ASSET';
  size: number;
}

export interface DeploymentConfig {
  platform: 'VERCEL' | 'NETLIFY' | 'AWS' | 'CUSTOM';
  environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  variables: { [key: string]: string };
  buildCommand: string;
  startCommand: string;
}

export interface MCPSimulation {
  endpoint: string;
  status: 'CONNECTING' | 'CONNECTED' | 'ERROR';
  responseTime: number;
  features: string[];
  previewUrl?: string;
}


export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  type: 'APPROVAL' | 'FEEDBACK' | 'QUESTION';
}

export interface Notification {
  id: string;
  type: 'APPROVAL_REQUEST' | 'APPROVAL_RESPONSE' | 'STAGE_COMPLETE' | 'ASSIGNMENT';
  title: string;
  message: string;
  projectId: string;
  userId: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface VersionHistory {
  id: string;
  projectId: string;
  version: number;
  changes: Change[];
  createdBy: string;
  createdAt: string;
  description: string;
}

export interface Change {
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  entityId: string;
  changes: { [key: string]: any };
  description: string;
}

// AI Integration Types
export interface AIPrompt {
  system: string;
  user: string;
  context?: any;
}

export interface AIResponse {
  content: string;
  metadata?: any;
  confidence?: number;
}

export interface AIFeedback {
  type: 'SUGGESTION' | 'WARNING' | 'ERROR';
  category: 'ACCESSIBILITY' | 'USABILITY' | 'DESIGN' | 'CONTENT';
  message: string;
  element?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  action?: string;
}

export interface PersonaDesignAdapter {
  personaId: string;
  originalDesignSystem: DesignSystem;
  adaptedDesignSystem: DesignSystem;
  changes: DesignChange[];
  reasoning: string;
}

export interface DesignChange {
  property: string;
  originalValue: any;
  adaptedValue: any;
  reason: string;
}

export interface ImpactAnalysis {
  stage: WorkflowStage;
  changes: string[];
  affectedComponents: string[];
  estimatedTime: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}

export interface Approval {
  id: string;
  projectId: string;
  stage: WorkflowStage;
  approverId: string;
  approverRole: UserRole;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  createdAt: string;
  updatedAt: string;
}
