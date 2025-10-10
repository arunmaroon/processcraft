import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

const roleOptions: { value: UserRole; label: string; description: string; passcode: string }[] = [
  { value: 'PM', label: 'Product Manager', description: 'Define product requirements and strategy', passcode: '01234' },
  { value: 'RESEARCHER', label: 'User Researcher', description: 'Conduct user research and gather insights', passcode: '01234' },
  { value: 'UX_DESIGNER', label: 'UX Designer', description: 'Design user experience flows and interactions', passcode: '01234' },
  { value: 'UI_DESIGNER', label: 'UI Designer', description: 'Design user interface components and layouts', passcode: '01234' },
  { value: 'VISUAL_DESIGNER', label: 'Visual Designer', description: 'Create visual design systems and branding', passcode: '01234' },
  { value: 'UX_WRITER', label: 'UX Writer', description: 'Create UX content and microcopy', passcode: '01234' },
  { value: 'DEVELOPER', label: 'Developer', description: 'Review prototypes and generate code', passcode: '01234' },
  { value: 'ADMIN', label: 'Admin', description: 'Access all admin tasks and manage the platform', passcode: '01234' },
];

export default function Login() {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    role: 'PM' as UserRole,
    passcode: '',
  });
  const [passcodeError, setPasscodeError] = useState('');

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role, passcode: '' }));
    setPasscodeError('');
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRole = roleOptions.find(r => r.value === formData.role);
    
    if (formData.passcode === selectedRole?.passcode) {
      // Use consistent IDs based on role to match existing projects
      const roleIdMap: { [key in UserRole]: string } = {
        'PM': '1',
        'RESEARCHER': '2',
        'UX_DESIGNER': '3',
        'UI_DESIGNER': '4',
        'VISUAL_DESIGNER': '5',
        'UX_WRITER': '6',
        'DEVELOPER': '7',
        'ADMIN': '8'
      };
      
      const user = {
        id: roleIdMap[formData.role],
        name: formData.name,
        email: `${formData.name?.toLowerCase().replace(' ', '.') || 'user'}@processcraft.com`,
        role: formData.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=3b82f6&color=fff`,
      };
      
      dispatch({ type: 'SET_USER', payload: user });
      localStorage.setItem('processcraft_user', JSON.stringify(user));
    } else {
      setPasscodeError('Invalid passcode. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePasscodeSubmit(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ProcessCraft</h1>
            <p className="text-gray-600">AI-Powered UX Design Workflow Platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Enter your full name"
                required
              />
            </div>


            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                className="input-field"
                required
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Passcode for {roleOptions.find(r => r.value === formData.role)?.label}
              </label>
              <input
                type="password"
                id="passcode"
                value={formData.passcode}
                onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                className={`input-field ${passcodeError ? 'border-red-500' : ''}`}
                placeholder="Enter passcode"
                required
              />
              {passcodeError && (
                <p className="text-sm text-red-600 mt-1">{passcodeError}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Current passcode for all roles: <span className="font-mono font-bold">01234</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3 text-base"
            >
              Verify & Enter ProcessCraft
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              This is a demo environment. Your data is stored locally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
