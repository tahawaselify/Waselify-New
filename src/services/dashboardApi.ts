import { supabase } from '@/lib/supabaseClient';

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  error_message?: string;
  execution_data: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface WorkflowMetrics {
  id: string;
  workflow_id: string;
  metric_date: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_duration_seconds: number;
  total_duration_seconds: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowAlert {
  id: string;
  workflow_id: string;
  alert_type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  is_read: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
}

export interface DashboardStats {
  totalConversations?: number;
  activeConversations?: number;
  avgResponseTime?: number;
  customerSatisfaction?: number;
  messagesToday?: number;
  productInquiries?: number;
  conversionRate?: number;
  aiAccuracy?: number;
  catalogQueries?: number;
  salesGenerated?: number;
  totalExecutions?: number;
  successfulExecutions?: number;
  failedExecutions?: number;
  successRate?: number;
  avgDuration?: number;
}

export interface ChatMessage {
  id: string;
  customer_name: string;
  phone: string;
  message: string;
  response: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  intent: 'product_inquiry' | 'pricing' | 'support' | 'order_status' | 'general';
  ai_confidence: number;
  response_time: number;
  customer_satisfaction?: number;
}

class DashboardApiService {
  // Get workflow executions for a specific workflow
  async getWorkflowExecutions(workflowId: string, limit: number = 10): Promise<WorkflowExecution[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workflow executions:', error);
      return [];
    }
  }

  // Get workflow metrics for a specific workflow
  async getWorkflowMetrics(workflowId: string, days: number = 7): Promise<WorkflowMetrics[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_metrics')
        .select('*')
        .eq('workflow_id', workflowId)
        .gte('metric_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('metric_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workflow metrics:', error);
      return [];
    }
  }

  // Get workflow alerts for a specific workflow
  async getWorkflowAlerts(workflowId: string, limit: number = 10): Promise<WorkflowAlert[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_alerts')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workflow alerts:', error);
      return [];
    }
  }

  // Get dashboard stats for a specific workflow
  async getDashboardStats(workflowId: string): Promise<DashboardStats> {
    try {
      // Get latest execution data
      const { data: latestExecution } = await supabase
        .from('workflow_executions')
        .select('execution_data, status')
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      // Get today's metrics
      const { data: todayMetrics } = await supabase
        .from('workflow_metrics')
        .select('*')
        .eq('workflow_id', workflowId)
        .eq('metric_date', new Date().toISOString().split('T')[0])
        .single();

      // Get running executions count
      const { data: runningExecutions } = await supabase
        .from('workflow_executions')
        .select('id')
        .eq('workflow_id', workflowId)
        .eq('status', 'running');

      // Calculate stats based on workflow type
      const stats: DashboardStats = {
        totalExecutions: todayMetrics?.total_executions || 0,
        successfulExecutions: todayMetrics?.successful_executions || 0,
        failedExecutions: todayMetrics?.failed_executions || 0,
        successRate: todayMetrics?.success_rate || 0,
        avgDuration: todayMetrics?.avg_duration_seconds || 0,
        activeConversations: runningExecutions?.length || 0,
      };

      // Add workflow-specific stats from execution data
      if (latestExecution?.execution_data) {
        const execData = latestExecution.execution_data;
        stats.totalConversations = execData.conversations || 0;
        stats.messagesToday = execData.messages_processed || 0;
        stats.productInquiries = execData.product_inquiries || 0;
        stats.salesGenerated = execData.sales_generated || 0;
        stats.avgResponseTime = execData.avg_response_time || 0;
        stats.customerSatisfaction = execData.customer_satisfaction || 0;
        stats.conversionRate = execData.conversion_rate || 0;
        stats.aiAccuracy = execData.ai_accuracy || 0;
        stats.catalogQueries = execData.catalog_queries || 0;
      }

      return stats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {};
    }
  }

  // Get recent chat messages (for chatbot workflows)
  async getRecentChatMessages(workflowId: string, limit: number = 20): Promise<ChatMessage[]> {
    try {
      // For now, we'll generate mock chat messages based on execution data
      // In a real implementation, this would come from a chat_messages table
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('execution_data, started_at')
        .eq('workflow_id', workflowId)
        .order('started_at', { ascending: false })
        .limit(5);

      const messages: ChatMessage[] = [];
      
      executions?.forEach((execution, index) => {
        const execData = execution.execution_data;
        const baseTime = new Date(execution.started_at);
        
        // Generate mock messages based on execution data
        for (let i = 0; i < Math.min(5, execData.conversations || 3); i++) {
          messages.push({
            id: `msg-${index}-${i}`,
            customer_name: `Customer ${i + 1}`,
            phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
            message: `Hi, I'm interested in your products`,
            response: `Hello! I'd be happy to help you with our products. What specific item are you looking for?`,
            timestamp: new Date(baseTime.getTime() - i * 60000).toISOString(),
            status: 'read' as const,
            intent: 'product_inquiry' as const,
            ai_confidence: 0.85 + Math.random() * 0.1,
            response_time: 2 + Math.random() * 3,
            customer_satisfaction: 4 + Math.random()
          });
        }
      });

      return messages.slice(0, limit);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  // Start a workflow execution
  async startWorkflow(workflowId: string, workflowName: string, config?: any): Promise<WorkflowExecution | null> {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_id: workflowId,
          workflow_name: workflowName,
          status: 'running',
          execution_data: config || {},
          metadata: { started_by: 'user' }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting workflow:', error);
      return null;
    }
  }

  // Stop/pause a workflow execution
  async stopWorkflow(executionId: string, status: 'paused' | 'cancelled' = 'paused'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workflow_executions')
        .update({
          status,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', executionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error stopping workflow:', error);
      return false;
    }
  }

  // Complete a workflow execution
  async completeWorkflow(executionId: string, executionData: any, durationSeconds: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workflow_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_seconds: durationSeconds,
          execution_data: executionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', executionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error completing workflow:', error);
      return false;
    }
  }

  // Mark alert as read
  async markAlertAsRead(alertId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('workflow_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return false;
    }
  }

  // Get system health status
  async getSystemHealth(workflowId: string): Promise<{ status: string; lastCheck: string; components: any[] }> {
    try {
      // Check for recent failures
      const { data: recentFailures } = await supabase
        .from('workflow_executions')
        .select('id')
        .eq('workflow_id', workflowId)
        .eq('status', 'failed')
        .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const status = recentFailures && recentFailures.length > 0 ? 'issues' : 'healthy';
      
      return {
        status,
        lastCheck: new Date().toISOString(),
        components: [
          { name: 'Database', status: 'healthy' },
          { name: 'API Gateway', status: 'healthy' },
          { name: 'Workflow Engine', status: status }
        ]
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        status: 'unknown',
        lastCheck: new Date().toISOString(),
        components: []
      };
    }
  }
}

export const dashboardApi = new DashboardApiService(); 