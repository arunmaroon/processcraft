import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  Home, 
  FolderOpen, 
  Users, 
  X,
  Plus,
  BarChart3,
  Palette,
  Code,
  FileText,
  Database,
  ChevronDown,
  Layout,
  Type,
  ChevronRight,
  Menu,
  ChevronLeft,
  MessageSquare,
  Brain,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'All Projects', href: '/projects', icon: FolderOpen },
  { name: 'AI Chat', href: '/ai-chat', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const workflowStages = [
  { name: 'Product Thinking', stage: 'PRODUCT_THINKING', icon: FileText, color: 'text-blue-600' },
  { name: 'User Research', stage: 'USER_RESEARCH', icon: BarChart3, color: 'text-green-600' },
  { name: 'UX Design', stage: 'UX_DESIGN', icon: Palette, color: 'text-purple-600' },
  { name: 'UI Design', stage: 'UI_DESIGN', icon: Layout, color: 'text-pink-600' },
  { name: 'Visual Design', stage: 'VISUAL_DESIGN', icon: Palette, color: 'text-indigo-600' },
  { name: 'UX Content', stage: 'UX_CONTENT', icon: Type, color: 'text-teal-600' },
  { name: 'Code Export', stage: 'CODE_EXPORT', icon: Code, color: 'text-orange-600' },
];

// Expandable section component
interface ExpandableSectionProps {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  isCollapsed: boolean;
  defaultExpanded?: boolean;
}

function ExpandableSection({ title, icon: Icon, children, isCollapsed, defaultExpanded = false }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (isCollapsed) {
    return (
      <div className="group relative">
        <button
          className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
          title={title}
        >
          <Icon className="w-5 h-5 text-gray-600" />
        </button>
        {/* Tooltip for collapsed state */}
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {title}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-4 h-4" />
          <span>{title}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      {isExpanded && (
        <div className="ml-7 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { state, getProjectsByRole } = useApp();
  const location = useLocation();

  console.log('Sidebar render - user:', state.user, 'role:', state.user?.role);
  
  if (!state.user) return null;

  const userProjects = getProjectsByRole(state.user.role) || [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            {!isCollapsed && (
              <h2 className="text-sm font-semibold text-gray-900">Navigation</h2>
            )}
            <div className="flex items-center space-x-2">
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              if (isCollapsed) {
                return (
                  <div key={item.name} className="group relative">
                    <Link
                      to={item.href}
                      className={`
                        flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      onClick={onClose}
                      title={item.name}
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                    {/* Tooltip for collapsed state */}
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={onClose}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Workflow Stages */}
          <div className="p-4 border-t border-gray-200">
            <ExpandableSection
              title="Workflow Stages"
              icon={Menu}
              isCollapsed={isCollapsed}
              defaultExpanded={true}
            >
              <div className="space-y-1">
                {workflowStages.map((stage) => {
                  const Icon = stage.icon;
                  const projectCount = userProjects.filter(p => p.currentStage === stage.stage).length;
                  
                  if (isCollapsed) {
                    return (
                      <div key={stage.stage} className="group relative">
                        <div className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-50">
                          <Icon className={`w-4 h-4 ${stage.color}`} />
                          {projectCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                              {projectCount}
                            </span>
                          )}
                        </div>
                        {/* Tooltip for collapsed state */}
                        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {stage.name} ({projectCount})
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={stage.stage}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${stage.color}`} />
                        <span>{stage.name}</span>
                      </div>
                      {projectCount > 0 && (
                        <span className="w-5 h-5 bg-primary-100 text-primary-600 text-xs rounded-full flex items-center justify-center">
                          {projectCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </ExpandableSection>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t border-gray-200">
            {isCollapsed ? (
              <div className="group relative">
                <button className="w-full flex items-center justify-center p-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                {/* Tooltip for collapsed state */}
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  New Project
                </div>
              </div>
            ) : (
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">New Project</span>
              </button>
            )}
          </div>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            {isCollapsed ? (
              <div className="group relative">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                  {state.user.avatar ? (
                    <img
                      src={state.user.avatar}
                      alt={state.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-4 h-4 bg-gray-600 rounded-full" />
                  )}
                </div>
                {/* Tooltip for collapsed state */}
                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {state.user.name} ({state.user.role})
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {state.user.avatar ? (
                      <img
                        src={state.user.avatar}
                        alt={state.user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-4 h-4 bg-gray-600 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {state.user.name}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 capitalize">
                        {state.user.role?.replace('_', ' ').toLowerCase() || 'user'}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">Role Switch:</span> Click your avatar in the header to switch roles
                  </p>
                </div>
                
                {/* Admin Access - Now integrated into Settings */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    <Database className="w-4 h-4 inline mr-2" />
                    Research Central available in Settings
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
