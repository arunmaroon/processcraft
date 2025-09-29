import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/layout/Layout';
import ProjectManager from './components/layout/ProjectManager';
import ProjectDetail from './components/layout/ProjectDetail';
import ProjectsPage from './components/layout/ProjectsPage';
import AnalyticsPage from './components/layout/AnalyticsPage';
import TeamPage from './components/layout/TeamPage';
import SettingsPage from './components/layout/SettingsPage';
import Login from './components/shared/Login';
import AdminLogin from './components/admin/AdminLogin';
import ResearchCentralDashboard from './components/admin/ResearchCentralDashboard';
import AIAgentHub from './components/admin/AIAgentHub';
import UXDesignerModule from './components/ux/UXDesignerModule';
import { useApp } from './context/AppContext';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">There was an error loading the application.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const { state, dispatch } = useApp();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check for admin token - MUST be called before any conditional returns
  useEffect(() => {
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      setIsAdmin(true);
    }
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAdminLogout = () => {
    setIsAdmin(false);
    dispatch({ type: 'LOGOUT' });
  };

  if (isAdmin) {
    return (
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<ProjectManager />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/ux-designer" element={<UXDesignerModule project={null} />} />
            <Route path="/admin/research-central" element={<ResearchCentralDashboard onLogout={handleAdminLogout} />} />
            <Route path="/admin/ai-agent-hub" element={<AIAgentHub />} />
            <Route path="/admin/login" element={<AdminLogin onLogin={setIsAdmin} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    );
  }

  if (!state.user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin onLogin={setIsAdmin} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  // If user is ADMIN, redirect to Research Central
  if (state.user.role === 'ADMIN') {
    return (
      <Router>
        <Routes>
          <Route path="/admin/research-central" element={<ResearchCentralDashboard onLogout={handleAdminLogout} />} />
          <Route path="/admin/ai-agent-hub" element={<AIAgentHub />} />
          <Route path="/admin/login" element={<AdminLogin onLogin={setIsAdmin} />} />
          <Route path="*" element={<Navigate to="/admin/research-central" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ProjectManager />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/admin/login" element={<AdminLogin onLogin={setIsAdmin} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;