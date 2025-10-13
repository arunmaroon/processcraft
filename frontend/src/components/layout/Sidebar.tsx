import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  FolderOpen, 
  Users, 
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Settings,
  Bot,
  Calendar,
  BookOpen,
  FileText,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const generalNavigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Research', href: '/research', icon: BookOpen },
  { name: 'Reports', href: '/reports', icon: FileText },
];

const toolsNavigation = [
  { name: 'AI Chat', href: '/ai-chat', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { state } = useApp();
  const location = useLocation();

  console.log('Sidebar render - user:', state.user, 'role:', state.user?.role);
  
  if (!state.user) return null;

  const renderNavigationItem = (item: any, isActive: boolean) => {
    const Icon = item.icon;
    
    if (isCollapsed) {
      return (
        <div key={item.name} className="group relative">
          <Link
            to={item.href}
            className={`
              flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50'
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
          flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
          ${isActive 
            ? 'bg-blue-50 text-blue-700' 
            : 'text-gray-600 hover:bg-gray-50'
          }
        `}
        onClick={onClose}
      >
        <Icon className="w-5 h-5" />
        <span>{item.name}</span>
      </Link>
    );
  };

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
        fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 shadow-sm transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
            {!isCollapsed && (
              <h2 className="text-sm font-semibold text-gray-900">ProcessCraft</h2>
            )}
            <div className="flex items-center space-x-2">
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {/* General Section */}
            <div className="mb-6">
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  General
                </h3>
              )}
              <div className="space-y-1">
                {generalNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return renderNavigationItem(item, isActive);
                })}
              </div>
            </div>

            {/* Tools Section */}
            <div>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Tools
                </h3>
              )}
              <div className="space-y-1">
                {toolsNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return renderNavigationItem(item, isActive);
                })}
              </div>
            </div>
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-gray-200">
            <button className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span>Log out</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
