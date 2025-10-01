import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Project, Notification, VersionHistory } from '../types';

interface AppState {
  user: User | null;
  projects: Project[];
  notifications: Notification[];
  versionHistory: VersionHistory[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_VERSION_HISTORY'; payload: VersionHistory[] }
  | { type: 'ADD_VERSION'; payload: VersionHistory }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AppState = {
  user: null,
  projects: [],
  notifications: [],
  versionHistory: [],
  loading: true,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: (state.projects || []).map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
      };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: (state.notifications || []).map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'SET_VERSION_HISTORY':
      return { ...state, versionHistory: action.payload };
    case 'ADD_VERSION':
      return { ...state, versionHistory: [...state.versionHistory, action.payload] };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Helper functions
  getProjectById: (id: string) => Project | undefined;
  getProjectsByRole: (role: string) => Project[];
  getUnreadNotifications: () => Notification[];
  canUserEditProject: (projectId: string, stage: string) => boolean;
  // API functions
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('AppContext: Starting data load');
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load user from localStorage
        const savedUser = localStorage.getItem('processcraft_user');
        if (savedUser) {
          dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
        } else {
          // Create default user for demo
          const defaultUser: User = {
            id: '1',
            name: 'John Doe',
            email: 'john@processcraft.com',
            role: 'PM',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
          };
          dispatch({ type: 'SET_USER', payload: defaultUser });
          localStorage.setItem('processcraft_user', JSON.stringify(defaultUser));
        }

        // Load projects - prioritize API over localStorage
        try {
          let projectsToLoad: Project[] = [];
          
          // First, try to load from API (primary source)
          try {
            const projectsResponse = await fetch('/api/projects');
            if (projectsResponse.ok) {
              const apiProjects = await projectsResponse.json();
              console.log('✅ Loaded projects from API:', apiProjects.length);
              projectsToLoad = apiProjects;
              // Update localStorage with API data
              saveProjectsToStorage(apiProjects);
            } else {
              throw new Error(`API error: ${projectsResponse.status}`);
            }
          } catch (apiError) {
            console.log('⚠️ API not available, trying localStorage...');
            // Fallback to localStorage
            projectsToLoad = loadProjectsFromStorage();
            console.log('📁 Loaded projects from localStorage:', projectsToLoad.length);
          }
          
          // If no projects from either source, use sample data
          if (projectsToLoad.length === 0) {
            console.log('No projects found, using sample data');
            const sampleProjects = [
              {
                id: '1',
                name: 'DigiGold Mobile App',
                description: 'A mobile banking app for digital gold investment',
                status: 'IN_PROGRESS' as const,
                currentStage: 'USER_RESEARCH' as const,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                assignedUsers: {
                  PM: ['1'],
                  RESEARCHER: ['2'],
                  UX_DESIGNER: ['3'],
                  UI_DESIGNER: ['4'],
                  VISUAL_DESIGNER: ['5'],
                  UX_WRITER: ['6'],
                  DEVELOPER: ['7']
                },
                prd: {
                  id: 'prd-1',
                  objectives: [
                    'Enable users to buy and sell digital gold',
                    'Provide real-time gold price tracking',
                    'Offer secure wallet functionality'
                  ],
                  targetUsers: [
                    'Tech-savvy millennials (25-35)',
                    'Investment enthusiasts',
                    'Mobile-first users'
                  ],
                  successMetrics: [
                    'User acquisition rate > 1000/month',
                    'Transaction volume > ₹1Cr/month',
                    'User retention > 80% after 3 months'
                  ],
                  businessContext: 'Digital gold is becoming increasingly popular as an investment option. We need to create a user-friendly mobile app that makes gold investment accessible to everyone.',
                  constraints: [
                    'Must comply with financial regulations',
                    'Maximum 2-second load time',
                    'Support for iOS and Android'
                  ],
                  status: 'COMPLETED' as const,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                approvals: [],
                version: 1
              }
            ];
            projectsToLoad = sampleProjects;
            // Save sample data to localStorage
            saveProjectsToStorage(sampleProjects);
          }
          
          // Set the projects (from localStorage, API, or sample data)
          console.log('AppContext: Final projects to load:', projectsToLoad);
          console.log('AppContext: Final number of projects:', projectsToLoad.length);
          dispatch({ type: 'SET_PROJECTS', payload: projectsToLoad });
          
        } catch (error) {
          console.error('Error loading projects:', error);
          // Fallback to empty array if everything fails
          dispatch({ type: 'SET_PROJECTS', payload: [] });
        }

        // Load notifications (with fallback)
        try {
          const notificationsResponse = await fetch('/api/notifications');
          if (notificationsResponse.ok) {
            const notifications = await notificationsResponse.json();
            dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
          } else {
            dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
          }
        } catch (error) {
          dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
        }

        // Load version history (with fallback)
        try {
          const versionsResponse = await fetch('/api/versions');
          if (versionsResponse.ok) {
            const versions = await versionsResponse.json();
            dispatch({ type: 'SET_VERSION_HISTORY', payload: versions });
          } else {
            dispatch({ type: 'SET_VERSION_HISTORY', payload: [] });
          }
        } catch (error) {
          dispatch({ type: 'SET_VERSION_HISTORY', payload: [] });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
      } finally {
        console.log('AppContext: Data load complete, setting loading to false');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadData();
  }, []);

  // Helper functions for data persistence
  const saveProjectsToStorage = (projects: Project[]) => {
    try {
      // Save to primary storage
      localStorage.setItem('processcraft_projects', JSON.stringify(projects));
      
      // Save to backup storage
      localStorage.setItem('processcraft_projects_backup', JSON.stringify(projects));
      
      // Save with timestamp for debugging
      localStorage.setItem('processcraft_projects_timestamp', new Date().toISOString());
      
      console.log('Projects saved to localStorage with backup');
    } catch (error) {
      console.error('Error saving projects to localStorage:', error);
    }
  };

  const loadProjectsFromStorage = (): Project[] => {
    try {
      // Try primary storage first
      const primary = localStorage.getItem('processcraft_projects');
      let projects = [];
      
      if (primary) {
        projects = JSON.parse(primary);
      } else {
        // Try backup storage
        const backup = localStorage.getItem('processcraft_projects_backup');
        if (backup) {
          console.log('Using backup projects data');
          projects = JSON.parse(backup);
        } else {
          return [];
        }
      }
      
      // Load PRD data for each project
      const projectsWithPRD = (projects || []).map(project => {
        try {
          const prdData = localStorage.getItem(`prd-generated-${project.id}`);
          if (prdData) {
            const parsedPRD = JSON.parse(prdData);
            return {
              ...project,
              prd: {
                ...project.prd,
                content: parsedPRD.content,
                status: parsedPRD.status || 'COMPLETED',
                generatedAt: parsedPRD.generatedAt,
                updatedAt: parsedPRD.updatedAt
              }
            };
          }
        } catch (error) {
          console.error(`Error loading PRD for project ${project.id}:`, error);
        }
        return project;
      });
      
      return projectsWithPRD;
    } catch (error) {
      console.error('Error loading projects from localStorage:', error);
      return [];
    }
  };

  const getProjectById = (id: string): Project | undefined => {
    return (state.projects || []).find(p => p.id === id);
  };

  const getProjectsByRole = (role: string): Project[] => {
    if (!state.user) return [];
    return (state.projects || []).filter(project => {
      const assignedUsers = project.assignedUsers[role as keyof typeof project.assignedUsers];
      return assignedUsers?.includes(state.user!.id);
    });
  };

  const getUnreadNotifications = (): Notification[] => {
    return (state.notifications || []).filter(n => !n.read);
  };

  const canUserEditProject = (projectId: string, stage: string): boolean => {
    if (!state.user) return false;
    const project = getProjectById(projectId);
    if (!project) return false;

    // Check if user is assigned to the project
    const assignedUsers = project.assignedUsers[state.user.role as keyof typeof project.assignedUsers];
    if (!assignedUsers?.includes(state.user.id)) return false;

    // Check role permissions for stage
    const rolePermissions: { [key: string]: string[] } = {
      'PM': ['PRODUCT_THINKING'],
      'RESEARCHER': ['USER_RESEARCH'],
      'UX_DESIGNER': ['UX_DESIGN'],
      'UI_DESIGNER': ['UI_DESIGN'],
      'VISUAL_DESIGNER': ['VISUAL_DESIGN'],
      'UX_WRITER': ['UX_CONTENT'],
      'DEVELOPER': ['CODE_EXPORT'],
      'ADMIN': ['PRODUCT_THINKING', 'USER_RESEARCH', 'UX_DESIGN', 'UI_DESIGN', 'VISUAL_DESIGN', 'UX_CONTENT', 'CODE_EXPORT'],
    };

    return rolePermissions[state.user.role]?.includes(stage) || false;
  };

  // API functions
  const createProject = async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      console.log('Creating project via API:', projectData);
      
      // Create project via API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const newProject = await response.json();
      console.log('✅ Project created via API:', newProject);
      
      // Update state
      dispatch({ type: 'ADD_PROJECT', payload: newProject });
      
      // Also save to localStorage as backup
      const currentProjects = loadProjectsFromStorage();
      const updatedProjects = [...currentProjects, newProject];
      saveProjectsToStorage(updatedProjects);
      
    } catch (error) {
      console.error('❌ Error creating project:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProject = async (project: Project) => {
    console.log('AppContext: updateProject called with:', project);
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Update project via API
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const updatedProject = await response.json();
      console.log('✅ Project updated via API:', updatedProject);
      
      // Update state
      dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
      
      // Also save to localStorage as backup
      const currentProjects = loadProjectsFromStorage();
      const finalProjects = (currentProjects || []).map(p => p.id === project.id ? updatedProject : p);
      saveProjectsToStorage(finalProjects);
      
    } catch (error) {
      console.error('❌ Error updating project:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteProject = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Delete project via API
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Project deleted via API:', id);
      
      // Update state
      dispatch({ type: 'DELETE_PROJECT', payload: id });
      
      // Also update localStorage as backup
      const currentProjects = loadProjectsFromStorage();
      const updatedProjects = currentProjects.filter(p => p.id !== id);
      saveProjectsToStorage(updatedProjects);
      
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete project' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Function to refresh projects from localStorage
  const refreshProjects = () => {
    console.log('AppContext: Refreshing projects from localStorage');
    const projectsFromStorage = loadProjectsFromStorage();
    console.log('AppContext: Refreshed projects:', projectsFromStorage);
    dispatch({ type: 'SET_PROJECTS', payload: projectsFromStorage });
  };

  // Force reload projects from localStorage whenever state changes
  useEffect(() => {
    if (state.projects.length > 0) {
      console.log('AppContext: State changed, ensuring localStorage sync');
      saveProjectsToStorage(state.projects);
    }
  }, [state.projects]);

  // Debug function to check localStorage status
  const debugLocalStorage = () => {
    console.log('=== LOCALSTORAGE DEBUG ===');
    console.log('Primary storage:', localStorage.getItem('processcraft_projects'));
    console.log('Backup storage:', localStorage.getItem('processcraft_projects_backup'));
    console.log('Timestamp:', localStorage.getItem('processcraft_projects_timestamp'));
    console.log('Current state projects:', state.projects);
    console.log('========================');
  };

  // Clear localStorage function for testing
  const clearLocalStorage = () => {
    localStorage.removeItem('processcraft_projects');
    localStorage.removeItem('processcraft_projects_backup');
    localStorage.removeItem('processcraft_projects_timestamp');
    console.log('LocalStorage cleared');
  };

  // Expose debug functions to window for testing
  if (typeof window !== 'undefined') {
    (window as any).debugLocalStorage = debugLocalStorage;
    (window as any).clearLocalStorage = clearLocalStorage;
    (window as any).refreshProjects = refreshProjects;
  }


  const value: AppContextType = {
    state,
    dispatch,
    getProjectById,
    getProjectsByRole,
    getUnreadNotifications,
    canUserEditProject,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
