import { useState } from 'react';
import { Bell, Menu, Search, User, LogOut, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface HeaderProps {
  onMenuClick: () => void;
}

const roleOptions: { value: UserRole; label: string; passcode: string }[] = [
  { value: 'PM', label: 'Product Manager', passcode: '01234' },
  { value: 'RESEARCHER', label: 'User Researcher', passcode: '01234' },
  { value: 'UX_DESIGNER', label: 'UX Designer', passcode: '01234' },
  { value: 'UI_DESIGNER', label: 'UI Designer', passcode: '01234' },
  { value: 'VISUAL_DESIGNER', label: 'Visual Designer', passcode: '01234' },
  { value: 'UX_WRITER', label: 'UX Writer', passcode: '01234' },
  { value: 'DEVELOPER', label: 'Developer', passcode: '01234' },
  { value: 'ADMIN', label: 'Admin', passcode: '01234' },
];

export default function Header({ onMenuClick }: HeaderProps) {
  const { state, getUnreadNotifications, dispatch } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const [switchPasscode, setSwitchPasscode] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [passcodeError, setPasscodeError] = useState('');
  
  const unreadNotifications = getUnreadNotifications();

  const handleRoleSwitch = (role: UserRole) => {
    setSelectedRole(role);
    setSwitchPasscode('');
    setPasscodeError('');
  };

  const handleRoleSwitchSubmit = () => {
    if (!selectedRole) return;
    
    const roleOption = roleOptions.find(r => r.value === selectedRole);
    if (switchPasscode === roleOption?.passcode) {
      const updatedUser = {
        ...state.user!,
        role: selectedRole,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(state.user!.name)}&background=3b82f6&color=fff`,
      };
      
      dispatch({ type: 'SET_USER', payload: updatedUser });
      localStorage.setItem('processcraft_user', JSON.stringify(updatedUser));
      setShowRoleSwitch(false);
      setSelectedRole(null);
      setSwitchPasscode('');
    } else {
      setPasscodeError('Invalid passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('processcraft_user');
  };

  if (!state.user) return null;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">ProcessCraft</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-3 w-64 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                  {unreadNotifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {unreadNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    unreadNotifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{state.user.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {state.user.role?.replace('_', ' ').toLowerCase() || 'user'}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitch(!showRoleSwitch)}
                className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  {state.user.avatar ? (
                    <img
                      src={state.user.avatar}
                      alt={state.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>

              {/* Role Switch Dropdown */}
              {showRoleSwitch && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Switch Role</h3>
                    <p className="text-sm text-gray-600">Select a new role and enter passcode</p>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select New Role
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {roleOptions.map((role) => (
                          <button
                            key={role.value}
                            onClick={() => handleRoleSwitch(role.value)}
                            className={`p-3 text-left rounded-xl border transition-all duration-200 ${
                              selectedRole === role.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <div className="font-medium text-sm">{role.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Passcode Input */}
                    {selectedRole && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enter Passcode
                        </label>
                        <input
                          type="password"
                          value={switchPasscode}
                          onChange={(e) => setSwitchPasscode(e.target.value)}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200 ${
                            passcodeError ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter passcode"
                        />
                        {passcodeError && (
                          <p className="text-sm text-red-600 mt-1">{passcodeError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Passcode: <span className="font-mono font-bold">01234</span>
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-2">
                      <button
                        onClick={() => setShowRoleSwitch(false)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRoleSwitchSubmit}
                        disabled={!selectedRole || !switchPasscode}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                      >
                        Switch Role
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full text-left text-sm text-red-600 hover:text-red-700"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
