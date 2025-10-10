import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles; if false, user needs ANY role
}

export default function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback,
  requireAll = false 
}: RoleGuardProps) {
  const { state } = useApp();

  if (!state.user) {
    return <div>Please log in to access this content.</div>;
  }

  const hasPermission = requireAll 
    ? allowedRoles.every(role => state.user!.role === role)
    : allowedRoles.includes(state.user.role);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600 mb-4">
          You don't have permission to access this content.
        </p>
        <p className="text-sm text-gray-500">
          Required roles: {allowedRoles.map(role => role?.replace('_', ' ') || 'Unknown').join(', ')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience components for common role checks
export function PMOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['PM']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function ResearcherOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['RESEARCHER']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function DesignerOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['UX_DESIGNER', 'UI_DESIGNER', 'VISUAL_DESIGNER']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function VisualDesignerOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['VISUAL_DESIGNER']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function UXWriterOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['UX_WRITER']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function DeveloperOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['DEVELOPER']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

