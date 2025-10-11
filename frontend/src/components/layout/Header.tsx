import { useState } from 'react';
import { Bell, Menu, User, LogOut, RefreshCw } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">ProcessCraft.</h1>
        </div>

        {/* Center: Welcome Message */}
        <div className="flex-1 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Welcome, {state.user.name}!</h2>
        </div>

        {/* Right: Notifications and User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
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
                      <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
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
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitch(!showRoleSwitch)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {state.user.avatar ? (
                  <img
                    src={state.user.avatar}
                    alt={state.user.name}
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-600" />
                )}
              </div>
            </button>

            {/* Role Switch Dropdown */}
            {showRoleSwitch && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
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
                          className={`p-3 text-left rounded-lg border transition-colors ${
                            selectedRole === role.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
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
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRoleSwitchSubmit}
                      disabled={!selectedRole || !switchPasscode}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Switch Role
                    </button>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full text-left text-sm text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
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
    </header>
  );
}
