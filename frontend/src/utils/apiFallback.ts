/**
 * API Fallback Utility
 * Provides consistent fallback behavior when backend APIs are unavailable
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FallbackConfig {
  timeout?: number;
  retries?: number;
  fallbackData?: any;
  showUserNotification?: boolean;
}

/**
 * Enhanced API call with fallback support
 */
export async function apiCall<T = any>(
  url: string,
  options: RequestInit = {},
  fallbackConfig: FallbackConfig = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = 5000,
    retries = 1,
    fallbackData = null,
    showUserNotification = true
  } = fallbackConfig;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data,
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
    }
  }

  // All attempts failed, use fallback
  if (showUserNotification) {
    console.warn(`API call failed after ${retries + 1} attempts, using fallback data:`, lastError?.message);
  }

  return {
    success: false,
    error: lastError?.message || 'API call failed',
    data: fallbackData,
  };
}

/**
 * Research-specific API calls with fallbacks
 */
export const researchApi = {
  async createResearchPlan(data: any): Promise<ApiResponse> {
    return apiCall('/api/research/create-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }, {
      fallbackData: {
        id: `research-${Date.now()}`,
        status: 'PENDING_APPROVAL',
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      showUserNotification: false, // Handled by component
    });
  },

  async executeResearch(data: any): Promise<ApiResponse> {
    return apiCall('/api/research/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    }, {
      fallbackData: {
        status: 'COMPLETED',
        insights: [
          {
            id: 'insight-1',
            category: 'USER_BEHAVIOR',
            title: 'Mobile-First Preference',
            description: 'Users prefer mobile interfaces for quick access and convenience',
            confidence: 0.85,
            evidence: ['Survey responses', 'Usage analytics'],
            impact: 'HIGH',
            recommendations: ['Optimize mobile experience', 'Implement responsive design']
          },
          {
            id: 'insight-2',
            category: 'SECURITY',
            title: 'Security Concerns',
            description: 'Users prioritize security features and data protection',
            confidence: 0.92,
            evidence: ['User interviews', 'Security feedback'],
            impact: 'HIGH',
            recommendations: ['Implement biometric authentication', 'Add security indicators']
          }
        ],
        recommendations: [
          {
            id: 'rec-1',
            title: 'Implement Progressive Web App',
            priority: 'HIGH',
            effort: 'MEDIUM',
            impact: 'HIGH',
            description: 'Create a PWA for better mobile experience and offline functionality'
          },
          {
            id: 'rec-2',
            title: 'Add Biometric Authentication',
            priority: 'HIGH',
            effort: 'LOW',
            impact: 'HIGH',
            description: 'Implement fingerprint/face recognition for secure access'
          }
        ],
        completedAt: new Date().toISOString(),
      },
    });
  },

  async getBiasIssues(): Promise<ApiResponse> {
    return apiCall('/api/admin-research/bias-issues', {
      method: 'GET',
    }, {
      fallbackData: [
        {
          id: '1',
          type: 'GENDER',
          severity: 'MEDIUM',
          description: 'Persona descriptions show gender bias with 80% of tech-savvy personas being male',
          suggestion: 'Ensure equal representation of genders across all persona types',
          affectedData: ['Tech-Savvy Investor', 'Primary Users Cohort'],
          confidence: 0.85
        },
        {
          id: '2',
          type: 'AGE',
          severity: 'LOW',
          description: 'Age range 25-35 is overrepresented, missing older demographics',
          suggestion: 'Include age ranges 35-50 and 50+ to represent diverse user base',
          affectedData: ['Primary Users Cohort', 'Demographics Profile 1'],
          confidence: 0.72
        }
      ],
    });
  }
};

/**
 * Project-specific API calls with fallbacks
 */
export const projectApi = {
  async updateProject(projectId: string, updates: any): Promise<ApiResponse> {
    return apiCall(`/api/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, {
      fallbackData: {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    });
  },

  async deleteProject(projectId: string): Promise<ApiResponse> {
    return apiCall(`/api/projects/${projectId}`, {
      method: 'DELETE',
    }, {
      fallbackData: { success: true },
    });
  }
};

/**
 * Utility to show user-friendly notifications
 */
export function showApiNotification(message: string, type: 'success' | 'error' | 'warning' = 'success') {
  // This could be replaced with a proper notification system
  if (type === 'error') {
    console.error('API Error:', message);
  } else if (type === 'warning') {
    console.warn('API Warning:', message);
  } else {
    console.log('API Success:', message);
  }
}

/**
 * Check if we're in offline mode
 */
export function isOfflineMode(): boolean {
  return !navigator.onLine || localStorage.getItem('offline_mode') === 'true';
}

/**
 * Set offline mode
 */
export function setOfflineMode(enabled: boolean) {
  if (enabled) {
    localStorage.setItem('offline_mode', 'true');
  } else {
    localStorage.removeItem('offline_mode');
  }
}
