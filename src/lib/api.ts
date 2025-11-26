// API client for n8n backend integration
import { api as apiConfig } from './config';
import { rateLimiter, getCsrfToken, securityMonitor } from './security';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  connections: any[];
  active: boolean;
  version: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = apiConfig.baseUrl) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Rate limiting check
      if (!rateLimiter.canMakeRequest(endpoint)) {
        securityMonitor.logEvent('RATE_LIMIT_EXCEEDED', { endpoint });
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Security monitoring
      securityMonitor.logEvent('API_REQUEST', { endpoint, method: options.method || 'GET' });

      const url = `${this.baseUrl}${endpoint}`;
      
      // Add security headers
      const headers = {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
      };

      const response = await fetch(url, {
        headers,
        ...options,
      });

      // Check for security headers in response
      const securityHeaders = {
        csp: response.headers.get('content-security-policy'),
        hsts: response.headers.get('strict-transport-security'),
        xFrameOptions: response.headers.get('x-frame-options'),
      };

      // Log security header status
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 Security Headers:', securityHeaders);
      }

      const data = await response.json();

      if (!response.ok) {
        // Log security events for error responses
        if (response.status === 401) {
          securityMonitor.logEvent('UNAUTHORIZED_ACCESS', { endpoint });
        } else if (response.status === 403) {
          securityMonitor.logEvent('FORBIDDEN_ACCESS', { endpoint });
        } else if (response.status >= 500) {
          securityMonitor.logEvent('SERVER_ERROR', { endpoint, status: response.status });
        }

        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      securityMonitor.logEvent('API_REQUEST_FAILED', { 
        endpoint, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Workflow Management
  async getWorkflows(): Promise<ApiResponse<WorkflowDefinition[]>> {
    return this.request<WorkflowDefinition[]>('/workflows');
  }

  async getWorkflow(id: string): Promise<ApiResponse<WorkflowDefinition>> {
    return this.request<WorkflowDefinition>(`/workflows/${id}`);
  }

  async createWorkflow(workflow: Partial<WorkflowDefinition>): Promise<ApiResponse<WorkflowDefinition>> {
    return this.request<WorkflowDefinition>('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  async updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<ApiResponse<WorkflowDefinition>> {
    return this.request<WorkflowDefinition>(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workflow),
    });
  }

  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  // Workflow Execution
  async executeWorkflow(id: string, input?: any): Promise<ApiResponse<WorkflowExecution>> {
    return this.request<WorkflowExecution>(`/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ input }),
    });
  }

  async getExecution(id: string): Promise<ApiResponse<WorkflowExecution>> {
    return this.request<WorkflowExecution>(`/executions/${id}`);
  }

  async cancelExecution(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/executions/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export type { ApiResponse, WorkflowExecution, WorkflowDefinition }; 