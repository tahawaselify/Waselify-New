import { apiClient, type ApiResponse, type WorkflowExecution } from '@/lib/api';

export interface ExecutionStats {
  total: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}

export interface ExecutionFilters {
  status?: 'running' | 'completed' | 'failed' | 'cancelled';
  workflowId?: string;
  dateFrom?: string;
  dateTo?: string;
}

class WorkflowExecutionService {
  // Get all executions
  async getExecutions(filters?: ExecutionFilters): Promise<ApiResponse<WorkflowExecution[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.workflowId) queryParams.append('workflowId', filters.workflowId);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
    
    const endpoint = `/executions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // This would be implemented in the backend
    // For now, return a mock response
    return {
      success: true,
      data: []
    };
  }

  // Get single execution
  async getExecution(id: string): Promise<ApiResponse<WorkflowExecution>> {
    return apiClient.getExecution(id);
  }

  // Execute workflow
  async executeWorkflow(workflowId: string, input?: any): Promise<ApiResponse<WorkflowExecution>> {
    return apiClient.executeWorkflow(workflowId, input);
  }

  // Cancel execution
  async cancelExecution(id: string): Promise<ApiResponse<void>> {
    return apiClient.cancelExecution(id);
  }

  // Get execution statistics
  async getExecutionStats(): Promise<ExecutionStats> {
    try {
      const response = await this.getExecutions();
      
      if (response.success && response.data) {
        const executions = response.data;
        
        return {
          total: executions.length,
          running: executions.filter(e => e.status === 'running').length,
          completed: executions.filter(e => e.status === 'completed').length,
          failed: executions.filter(e => e.status === 'failed').length,
          cancelled: executions.filter(e => e.status === 'cancelled').length
        };
      }
      
      return {
        total: 0,
        running: 0,
        completed: 0,
        failed: 0,
        cancelled: 0
      };
    } catch (error) {
      console.error('Error getting execution stats:', error);
      return {
        total: 0,
        running: 0,
        completed: 0,
        failed: 0,
        cancelled: 0
      };
    }
  }

  // Poll execution status
  async pollExecutionStatus(id: string, onUpdate?: (execution: WorkflowExecution) => void): Promise<WorkflowExecution> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const response = await this.getExecution(id);
          
          if (response.success && response.data) {
            const execution = response.data;
            
            if (onUpdate) {
              onUpdate(execution);
            }
            
            // Continue polling if still running
            if (execution.status === 'running') {
              setTimeout(poll, 2000); // Poll every 2 seconds
            } else {
              resolve(execution);
            }
          } else {
            reject(new Error(response.error || 'Failed to get execution status'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }
}

export default new WorkflowExecutionService(); 