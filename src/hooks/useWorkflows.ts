import { useState, useEffect, useCallback } from 'react';
import { apiClient, type WorkflowDefinition, type WorkflowExecution } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';

interface UseWorkflowsReturn {
  workflows: WorkflowDefinition[];
  executions: WorkflowExecution[];
  isLoading: boolean;
  isExecuting: boolean;
  error: string | null;
  
  // Workflow operations
  createWorkflow: (workflow: Partial<WorkflowDefinition>) => Promise<void>;
  updateWorkflow: (id: string, workflow: Partial<WorkflowDefinition>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  activateWorkflow: (id: string, active: boolean) => Promise<void>;
  
  // Execution operations
  executeWorkflow: (id: string, input?: any) => Promise<void>;
  cancelExecution: (executionId: string) => Promise<void>;
  getExecutionStatus: (executionId: string) => Promise<WorkflowExecution | null>;
  
  // Utility functions
  refreshWorkflows: () => Promise<void>;
  refreshExecutions: () => Promise<void>;
}

export function useWorkflows(): UseWorkflowsReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load workflows
  const loadWorkflows = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getWorkflows();
      if (response.success && response.data) {
        setWorkflows(response.data);
      } else {
        setError(response.error || 'Failed to load workflows');
      }
    } catch (err) {
      setError('Failed to load workflows');
      console.error('Error loading workflows:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load executions
  const loadExecutions = useCallback(async () => {
    if (!user) return;
    
    try {
      // This would be implemented in the backend
      // const response = await apiClient.getExecutions();
      // if (response.success && response.data) {
      //   setExecutions(response.data);
      // }
    } catch (err) {
      console.error('Error loading executions:', err);
    }
  }, [user]);

  // Create workflow
  const createWorkflow = useCallback(async (workflow: Partial<WorkflowDefinition>) => {
    if (!user) return;
    
    try {
      const response = await apiClient.createWorkflow(workflow);
      if (response.success && response.data) {
        setWorkflows(prev => [...prev, response.data!]);
        toast({
          title: "Workflow Created",
          description: "Your workflow has been created successfully.",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create workflow",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Update workflow
  const updateWorkflow = useCallback(async (id: string, workflow: Partial<WorkflowDefinition>) => {
    if (!user) return;
    
    try {
      const response = await apiClient.updateWorkflow(id, workflow);
      if (response.success && response.data) {
        setWorkflows(prev => prev.map(w => w.id === id ? response.data! : w));
        toast({
          title: "Workflow Updated",
          description: "Your workflow has been updated successfully.",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update workflow",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update workflow",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Delete workflow
  const deleteWorkflow = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const response = await apiClient.deleteWorkflow(id);
      if (response.success) {
        setWorkflows(prev => prev.filter(w => w.id !== id));
        toast({
          title: "Workflow Deleted",
          description: "Your workflow has been deleted successfully.",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete workflow",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete workflow",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Execute workflow
  const executeWorkflow = useCallback(async (id: string, input?: any) => {
    if (!user) return;
    
    setIsExecuting(true);
    
    try {
      const response = await apiClient.executeWorkflow(id, input);
      if (response.success && response.data) {
        setExecutions(prev => [response.data!, ...prev]);
        toast({
          title: "Workflow Started",
          description: "Your workflow execution has started.",
          variant: "default"
        });
        
        // Start polling for status updates
        pollExecutionStatus(response.data.id);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to execute workflow",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to execute workflow",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  }, [user, toast]);

  // Cancel execution
  const cancelExecution = useCallback(async (executionId: string) => {
    if (!user) return;
    
    try {
      const response = await apiClient.cancelExecution(executionId);
      if (response.success) {
        setExecutions(prev => prev.map(e => 
          e.id === executionId ? { ...e, status: 'cancelled' } : e
        ));
        toast({
          title: "Execution Cancelled",
          description: "Workflow execution has been cancelled.",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to cancel execution",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to cancel execution",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Get execution status
  const getExecutionStatus = useCallback(async (executionId: string): Promise<WorkflowExecution | null> => {
    if (!user) return null;
    
    try {
      const response = await apiClient.getExecutionStatus(executionId);
      if (response.success && response.data) {
        return response.data;
      }
    } catch (err) {
      console.error('Error getting execution status:', err);
    }
    
    return null;
  }, [user]);

  // Poll execution status
  const pollExecutionStatus = useCallback((executionId: string) => {
    const interval = setInterval(async () => {
      const status = await getExecutionStatus(executionId);
      if (status && ['completed', 'failed', 'cancelled'].includes(status.status)) {
        clearInterval(interval);
        setExecutions(prev => prev.map(e => 
          e.id === executionId ? status : e
        ));
        
        if (status.status === 'completed') {
          toast({
            title: "Workflow Completed",
            description: "Your workflow has completed successfully.",
            variant: "default"
          });
        } else if (status.status === 'failed') {
          toast({
            title: "Workflow Failed",
            description: status.error || "Your workflow execution failed.",
            variant: "destructive"
          });
        }
      }
    }, 2000); // Poll every 2 seconds
    
    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  }, [getExecutionStatus, toast]);

  // Activate/deactivate workflow
  const activateWorkflow = useCallback(async (id: string, active: boolean) => {
    if (!user) return;
    
    try {
      const response = await apiClient.updateWorkflow(id, { active });
      if (response.success && response.data) {
        setWorkflows(prev => prev.map(w => w.id === id ? response.data! : w));
        toast({
          title: active ? "Workflow Activated" : "Workflow Deactivated",
          description: `Your workflow has been ${active ? 'activated' : 'deactivated'}.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update workflow status",
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update workflow status",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Refresh functions
  const refreshWorkflows = useCallback(() => loadWorkflows(), [loadWorkflows]);
  const refreshExecutions = useCallback(() => loadExecutions(), [loadExecutions]);

  // Load data on mount
  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, [loadWorkflows, loadExecutions]);

  return {
    workflows,
    executions,
    isLoading,
    isExecuting,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    activateWorkflow,
    executeWorkflow,
    cancelExecution,
    getExecutionStatus,
    refreshWorkflows,
    refreshExecutions,
  };
} 