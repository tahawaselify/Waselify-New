import { apiClient, type ApiResponse, type WorkflowDefinition } from '@/lib/api';

export interface Workflow {
  filename: string;
  name: string;
  description: string;
  nodeCount: number;
  active: boolean;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  size: number;
}

export interface WorkflowStats {
  totalWorkflows: number;
  activeWorkflows: number;
  inactiveWorkflows: number;
  totalNodes: number;
  averageNodesPerWorkflow: number;
}

export interface ImportResult {
  success: boolean;
  name?: string;
  error?: string;
  details?: any;
}

export interface ImportSummary {
  successful: number;
  failed: number;
  total: number;
  results: ImportResult[];
}

class WorkflowService {
  // Get all workflows
  async getWorkflows(): Promise<ApiResponse<WorkflowDefinition[]>> {
    return apiClient.getWorkflows();
  }

  // Get single workflow
  async getWorkflow(id: string): Promise<ApiResponse<WorkflowDefinition>> {
    return apiClient.getWorkflow(id);
  }

  // Create new workflow
  async createWorkflow(workflow: Partial<WorkflowDefinition>): Promise<ApiResponse<WorkflowDefinition>> {
    return apiClient.createWorkflow(workflow);
  }

  // Update workflow
  async updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<ApiResponse<WorkflowDefinition>> {
    return apiClient.updateWorkflow(id, workflow);
  }

  // Delete workflow
  async deleteWorkflow(id: string): Promise<ApiResponse<void>> {
    return apiClient.deleteWorkflow(id);
  }

  // Execute workflow
  async executeWorkflow(id: string, input?: any): Promise<ApiResponse<any>> {
    return apiClient.executeWorkflow(id, input);
  }

  // Import workflow from file
  async importWorkflow(filename: string): Promise<ImportResult> {
    try {
      const response = await apiClient.createWorkflow({
        name: filename,
        description: `Imported workflow: ${filename}`,
        active: true,
        nodes: [],
        connections: [],
        version: 1
      });

      if (response.success && response.data) {
        return {
          success: true,
          name: response.data.name,
          details: response.data
        };
      } else {
        return {
          success: false,
          error: response.error || 'Import failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Import all workflows
  async importAllWorkflows(): Promise<{ summary: ImportSummary; data: ImportResult[] }> {
    // This would typically fetch available workflow files and import them
    // For now, return a mock implementation
    const mockWorkflows = [
      'lead-generation-workflow.json',
      'email-automation-workflow.json',
      'customer-support-workflow.json'
    ];

    const results: ImportResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const filename of mockWorkflows) {
      const result = await this.importWorkflow(filename);
      results.push(result);
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }

    return {
      summary: {
        successful,
        failed,
        total: mockWorkflows.length,
        results
      },
      data: results
    };
  }

  // Get workflow statistics
  async getWorkflowStats(): Promise<WorkflowStats> {
    try {
      const response = await this.getWorkflows();
      
      if (response.success && response.data) {
        const workflows = response.data;
        const totalWorkflows = workflows.length;
        const activeWorkflows = workflows.filter(w => w.active).length;
        const totalNodes = workflows.reduce((sum, w) => sum + (w.nodes?.length || 0), 0);
        
        return {
          totalWorkflows,
          activeWorkflows,
          inactiveWorkflows: totalWorkflows - activeWorkflows,
          totalNodes,
          averageNodesPerWorkflow: totalWorkflows > 0 ? Math.round(totalNodes / totalWorkflows) : 0
        };
      }
      
      return {
        totalWorkflows: 0,
        activeWorkflows: 0,
        inactiveWorkflows: 0,
        totalNodes: 0,
        averageNodesPerWorkflow: 0
      };
    } catch (error) {
      console.error('Error getting workflow stats:', error);
      return {
        totalWorkflows: 0,
        activeWorkflows: 0,
        inactiveWorkflows: 0,
        totalNodes: 0,
        averageNodesPerWorkflow: 0
      };
    }
  }
}

export default new WorkflowService(); 