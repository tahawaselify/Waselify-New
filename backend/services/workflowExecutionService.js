const n8nService = require('./n8nService');
const { supabase } = require('../lib/supabaseClient');

class WorkflowExecutionService {
  constructor() {
    this.n8nService = n8nService;
  }

  // Clone workflow for specific user (NEW METHOD)
  async cloneWorkflowForUser(originalWorkflowId, userId, userConfig = {}) {
    try {
      console.log(`🔄 Cloning workflow ${originalWorkflowId} for user ${userId}`);

      // 1. Get original workflow from n8n
      const originalWorkflow = await this.n8nService.getWorkflow(originalWorkflowId);
      
      // 2. Create user-specific workflow
      const userWorkflow = {
        ...originalWorkflow,
        name: `${originalWorkflow.name} - User ${userId}`,
        id: undefined, // Let n8n generate new ID
        active: false, // Start inactive for safety
        // Add user-specific configuration
        nodes: originalWorkflow.nodes.map(node => {
          // Replace placeholders with user-specific values
          if (node.parameters) {
            const userNode = { ...node };
            // Example: Replace API keys, phone numbers, etc.
            if (userConfig.apiKey && node.parameters.apiKey) {
              userNode.parameters.apiKey = userConfig.apiKey;
            }
            if (userConfig.phoneNumber && node.parameters.phoneNumber) {
              userNode.parameters.phoneNumber = userConfig.phoneNumber;
            }
            return userNode;
          }
          return node;
        })
      };

      // 3. Create new workflow in n8n
      const newWorkflow = await this.n8nService.createWorkflow(userWorkflow);
      
      // 4. Store user-workflow mapping in database
      await supabase
        .from('user_workflows')
        .insert({
          user_id: userId,
          original_workflow_id: originalWorkflowId,
          user_workflow_id: newWorkflow.id,
          workflow_name: newWorkflow.name,
          user_config: userConfig,
          created_at: new Date().toISOString()
        });

      console.log(`✅ Created user workflow: ${newWorkflow.id}`);
      return newWorkflow;

    } catch (error) {
      console.error('❌ Failed to clone workflow for user:', error);
      throw error;
    }
  }

  // Get or create user-specific workflow
  async getUserWorkflow(originalWorkflowId, userId, userConfig = {}) {
    try {
      // 1. Check if user already has this workflow
      const { data: existingWorkflow } = await supabase
        .from('user_workflows')
        .select('*')
        .eq('user_id', userId)
        .eq('original_workflow_id', originalWorkflowId)
        .single();

      if (existingWorkflow) {
        console.log(`✅ Found existing user workflow: ${existingWorkflow.user_workflow_id}`);
        return existingWorkflow.user_workflow_id;
      }

      // 2. Clone workflow for new user
      const newWorkflow = await this.cloneWorkflowForUser(originalWorkflowId, userId, userConfig);
      return newWorkflow.id;

    } catch (error) {
      console.error('❌ Failed to get user workflow:', error);
      throw error;
    }
  }

  // Execute workflow and store results
  async executeWorkflow(workflowId, userId, inputData = {}) {
    try {
      console.log(`🚀 Executing workflow ${workflowId} for user ${userId}`);

      // 1. Create workflow run record
      const { data: runRecord, error: createError } = await supabase
        .from('workflow_runs')
        .insert({
          workflow_id: workflowId,
          user_id: userId,
          status: 'running',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;

      // 2. Execute in n8n
      const execution = await this.n8nService.executeWorkflow(workflowId, inputData);
      
      // 3. Update with execution ID
      await supabase
        .from('workflow_runs')
        .update({ 
          result_data: { execution_id: execution.id },
          status: 'running'
        })
        .eq('id', runRecord.id);

      // 4. Start monitoring execution
      this.monitorExecution(runRecord.id, execution.id, workflowId);

      return {
        runId: runRecord.id,
        executionId: execution.id,
        status: 'running'
      };

    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      throw error;
    }
  }

  // Monitor execution and update results
  async monitorExecution(runId, executionId, workflowId) {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts++;
        
        // Get execution status from n8n
        const execution = await this.n8nService.getExecutionStatus(executionId);
        
        if (execution.status === 'completed') {
          // ✅ Execution completed successfully
          await this.processCompletedExecution(runId, execution);
        } else if (execution.status === 'failed') {
          // ❌ Execution failed
          await this.processFailedExecution(runId, execution);
        } else if (execution.status === 'running' && attempts < maxAttempts) {
          // 🔄 Still running, check again in 5 seconds
          setTimeout(checkStatus, 5000);
        } else {
          // ⏰ Timeout or unknown status
          await this.processTimeoutExecution(runId, execution);
        }

      } catch (error) {
        console.error('❌ Error monitoring execution:', error);
        await this.processFailedExecution(runId, { error: error.message });
      }
    };

    // Start monitoring
    setTimeout(checkStatus, 2000);
  }

  // Process successful execution
  async processCompletedExecution(runId, execution) {
    try {
      console.log(`✅ Execution ${runId} completed successfully`);

      // Extract meaningful data from n8n output
      const processedData = this.extractWorkflowData(execution);
      
      // Calculate duration
      const duration = execution.stoppedAt ? 
        new Date(execution.stoppedAt) - new Date(execution.startedAt) : 
        null;

      // Update database
      await supabase
        .from('workflow_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          result_data: {
            ...processedData,
            execution_id: execution.id,
            raw_output: execution.data // Keep raw data for debugging
          }
        })
        .eq('id', runId);

      // Send notification to user
      await this.sendCompletionNotification(runId, processedData);

    } catch (error) {
      console.error('❌ Error processing completed execution:', error);
    }
  }

  // Process failed execution
  async processFailedExecution(runId, execution) {
    try {
      console.log(`❌ Execution ${runId} failed`);

      await supabase
        .from('workflow_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: execution.error || 'Unknown error occurred',
          result_data: {
            execution_id: execution.id,
            error: execution.error
          }
        })
        .eq('id', runId);

      // Send error notification
      await this.sendErrorNotification(runId, execution.error);

    } catch (error) {
      console.error('❌ Error processing failed execution:', error);
    }
  }

  // Process timeout execution
  async processTimeoutExecution(runId, execution) {
    try {
      console.log(`⏰ Execution ${runId} timed out`);

      await supabase
        .from('workflow_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: 'Execution timed out after 5 minutes',
          result_data: {
            execution_id: execution.id,
            error: 'Timeout'
          }
        })
        .eq('id', runId);

    } catch (error) {
      console.error('❌ Error processing timeout execution:', error);
    }
  }

  // Extract meaningful data from n8n execution
  extractWorkflowData(execution) {
    try {
      const data = execution.data || {};
      
      // Extract data based on workflow type
      // This will be customized for each workflow
      const extracted = {
        execution_id: execution.id,
        status: execution.status,
        started_at: execution.startedAt,
        completed_at: execution.stoppedAt,
        duration: execution.stoppedAt ? 
          new Date(execution.stoppedAt) - new Date(execution.startedAt) : 
          null
      };

      // Process workflow-specific data
      if (data.leads_generated) {
        extracted.leads_generated = data.leads_generated;
        extracted.success_rate = data.success_rate;
        extracted.generated_leads = data.generated_leads || [];
      }

      if (data.messages_processed) {
        extracted.messages_processed = data.messages_processed;
        extracted.response_time = data.avg_response_time;
        extracted.customer_satisfaction = data.satisfaction_score;
      }

      if (data.invoices_processed) {
        extracted.invoices_processed = data.invoices_processed;
        extracted.payments_collected = data.payments_collected;
        extracted.collection_rate = data.collection_rate;
      }

      return extracted;

    } catch (error) {
      console.error('❌ Error extracting workflow data:', error);
      return { error: 'Failed to extract data' };
    }
  }

  // Send completion notification
  async sendCompletionNotification(runId, data) {
    try {
      // Get workflow and user info
      const { data: run } = await supabase
        .from('workflow_runs')
        .select(`
          *,
          workflows(name),
          profiles(full_name)
        `)
        .eq('id', runId)
        .single();

      if (run) {
        await supabase
          .from('notifications')
          .insert({
            user_id: run.user_id,
            type: 'success',
            title: 'Workflow Completed Successfully',
            message: `${run.workflows.name} has completed successfully. ${this.generateSuccessMessage(data)}`
          });
      }
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }

  // Send error notification
  async sendErrorNotification(runId, error) {
    try {
      const { data: run } = await supabase
        .from('workflow_runs')
        .select(`
          *,
          workflows(name)
        `)
        .eq('id', runId)
        .single();

      if (run) {
        await supabase
          .from('notifications')
          .insert({
            user_id: run.user_id,
            type: 'error',
            title: 'Workflow Execution Failed',
            message: `${run.workflows.name} failed to complete: ${error}`
          });
      }
    } catch (error) {
      console.error('❌ Error sending error notification:', error);
    }
  }

  // Generate success message based on data
  generateSuccessMessage(data) {
    if (data.leads_generated) {
      return `Generated ${data.leads_generated} leads with ${data.success_rate}% success rate.`;
    }
    if (data.messages_processed) {
      return `Processed ${data.messages_processed} messages with ${data.response_time}ms average response time.`;
    }
    if (data.invoices_processed) {
      return `Processed ${data.invoices_processed} invoices and collected ${data.payments_collected}.`;
    }
    return 'Workflow completed successfully.';
  }

  // Get user's workflow executions
  async getUserExecutions(userId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('workflow_runs')
        .select(`
          *,
          workflows(name, description, category)
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('❌ Error fetching user executions:', error);
      throw error;
    }
  }

  // Get workflow statistics
  async getWorkflowStats(workflowId, period = '7d') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (period === '7d' ? 7 : 30));

      const { data, error } = await supabase
        .from('workflow_runs')
        .select('*')
        .eq('workflow_id', workflowId)
        .gte('started_at', startDate.toISOString());

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total_runs: data.length,
        successful_runs: data.filter(r => r.status === 'completed').length,
        failed_runs: data.filter(r => r.status === 'failed').length,
        success_rate: data.length > 0 ? 
          (data.filter(r => r.status === 'completed').length / data.length) * 100 : 0,
        avg_duration: data.length > 0 ? 
          data.reduce((sum, r) => sum + (r.duration_ms || 0), 0) / data.length : 0
      };

      return stats;

    } catch (error) {
      console.error('❌ Error fetching workflow stats:', error);
      throw error;
    }
  }
}

module.exports = new WorkflowExecutionService(); 