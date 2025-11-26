import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Square, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  DollarSign,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import workflowExecutionService, { 
  WorkflowExecution, 
  WorkflowStats, 
  ExecutionStatus 
} from '@/services/workflowExecutionService';

interface WorkflowExecutionDashboardProps {
  workflowId: string;
  workflowName: string;
  className?: string;
}

const WorkflowExecutionDashboard: React.FC<WorkflowExecutionDashboardProps> = ({
  workflowId,
  workflowName,
  className = ''
}) => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [pollingExecutions, setPollingExecutions] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, [workflowId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load executions and stats in parallel
      const [executionsData, statsData] = await Promise.all([
        workflowExecutionService.getUserExecutions(10, undefined, workflowId),
        workflowExecutionService.getWorkflowStats(workflowId)
      ]);

      setExecutions(executionsData);
      setStats(statsData);

      // Start polling for running executions
      executionsData
        .filter(exec => exec.status === 'running')
        .forEach(exec => startPolling(exec.id));

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflow data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Start polling for execution status
  const startPolling = (executionId: string) => {
    if (pollingExecutions.has(executionId)) return;

    setPollingExecutions(prev => new Set(prev).add(executionId));

    workflowExecutionService.pollExecutionStatus(
      executionId,
      (status: ExecutionStatus) => {
        setExecutions(prev => 
          prev.map(exec => 
            exec.id === executionId 
              ? { ...exec, ...status }
              : exec
          )
        );

        // Stop polling if completed
        if (status.status !== 'running') {
          setPollingExecutions(prev => {
            const newSet = new Set(prev);
            newSet.delete(executionId);
            return newSet;
          });

          // Show completion notification
          if (status.status === 'completed') {
            toast({
              title: 'Success',
              description: `${workflowName} completed successfully!`,
            });
          } else if (status.status === 'failed') {
            toast({
              title: 'Error',
              description: `${workflowName} failed: ${status.error_message}`,
              variant: 'destructive'
            });
          }
        }
      }
    );
  };

  // Execute workflow
  const handleExecute = async () => {
    try {
      setExecuting(true);
      
      const result = await workflowExecutionService.executeWorkflow(workflowId);
      
      // Add new execution to list
      const newExecution: WorkflowExecution = {
        id: result.runId,
        workflow_id: workflowId,
        user_id: 'current-user', // Will be set by backend
        status: 'running',
        started_at: new Date().toISOString(),
        workflows: {
          name: workflowName,
          description: '',
          category: ''
        }
      };

      setExecutions(prev => [newExecution, ...prev]);
      
      // Start polling for this execution
      startPolling(result.runId);

      toast({
        title: 'Workflow Started',
        description: `${workflowName} execution has begun`,
      });

    } catch (error) {
      console.error('❌ Failed to execute workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to start workflow execution',
        variant: 'destructive'
      });
    } finally {
      setExecuting(false);
    }
  };

  // Retry failed execution
  const handleRetry = async (executionId: string) => {
    try {
      const result = await workflowExecutionService.retryExecution(executionId);
      
      // Update execution status
      setExecutions(prev => 
        prev.map(exec => 
          exec.id === executionId 
            ? { ...exec, status: 'running' as const }
            : exec
        )
      );

      // Start polling for new execution
      startPolling(result.runId);

      toast({
        title: 'Retry Started',
        description: 'Workflow execution retry has begun',
      });

    } catch (error) {
      console.error('❌ Failed to retry execution:', error);
      toast({
        title: 'Error',
        description: 'Failed to retry workflow execution',
        variant: 'destructive'
      });
    }
  };

  // Cancel running execution
  const handleCancel = async (executionId: string) => {
    try {
      await workflowExecutionService.cancelExecution(executionId);
      
      // Update execution status
      setExecutions(prev => 
        prev.map(exec => 
          exec.id === executionId 
            ? { ...exec, status: 'cancelled' as const }
            : exec
        )
      );

      toast({
        title: 'Cancelled',
        description: 'Workflow execution has been cancelled',
      });

    } catch (error) {
      console.error('❌ Failed to cancel execution:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel workflow execution',
        variant: 'destructive'
      });
    }
  };

  // Get metrics for specific execution
  const getExecutionMetrics = (execution: WorkflowExecution) => {
    return workflowExecutionService.getWorkflowMetrics(execution);
  };

  // Get appropriate icon for workflow type
  const getWorkflowIcon = (execution: WorkflowExecution) => {
    const metrics = getExecutionMetrics(execution);
    
    switch (metrics.type) {
      case 'lead_generation':
        return <Users className="w-4 h-4" />;
      case 'whatsapp_chatbot':
        return <MessageSquare className="w-4 h-4" />;
      case 'invoice_collection':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{workflowName}</h2>
          <p className="text-gray-600">Workflow execution dashboard</p>
        </div>
        <Button 
          onClick={handleExecute} 
          disabled={executing}
          className="flex items-center gap-2"
        >
          {executing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {executing ? 'Starting...' : 'Execute Workflow'}
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_runs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.success_rate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {workflowExecutionService.formatDuration(stats.avg_duration)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Runs</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failed_runs}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {executions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No executions yet</p>
              <p className="text-sm">Execute the workflow to see results here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {executions.map((execution) => {
                const metrics = getExecutionMetrics(execution);
                const isRunning = execution.status === 'running';
                const isPolling = pollingExecutions.has(execution.id);

                return (
                  <div 
                    key={execution.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getWorkflowIcon(execution)}
                        <div>
                          <div className="font-medium">
                            {new Date(execution.started_at).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Duration: {workflowExecutionService.formatDuration(execution.duration_ms || 0)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={workflowExecutionService.getStatusColor(execution.status)}
                        >
                          {workflowExecutionService.getStatusIcon(execution.status)}
                          {execution.status}
                          {isPolling && <RefreshCw className="w-3 h-3 ml-1 animate-spin" />}
                        </Badge>

                        <div className="flex gap-1">
                          {execution.status === 'failed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetry(execution.id)}
                            >
                              <RefreshCw className="w-3 h-3" />
                            </Button>
                          )}

                          {isRunning && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(execution.id)}
                            >
                              <Square className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar for running executions */}
                    {isRunning && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Processing...</span>
                          <span>{isPolling ? 'Live' : 'Checking...'}</span>
                        </div>
                        <Progress value={undefined} className="h-2" />
                      </div>
                    )}

                    {/* Execution results */}
                    {execution.status === 'completed' && metrics.metrics && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {Object.entries(metrics.metrics).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <div className="font-medium text-gray-900">
                              {typeof value === 'number' && key.includes('rate') 
                                ? `${value}%` 
                                : typeof value === 'number' && key.includes('time')
                                ? workflowExecutionService.formatDuration(value)
                                : value
                              }
                            </div>
                            <div className="text-gray-500 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Error message */}
                    {execution.status === 'failed' && execution.error_message && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">Error:</span>
                          <span>{execution.error_message}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowExecutionDashboard; 