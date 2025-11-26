const express = require('express');
const router = express.Router();
const workflowExecutionService = require('../services/workflowExecutionService');
const { authenticateUser } = require('../middleware/auth');

// Execute a workflow (with per-user duplication)
router.post('/execute/:workflowId', authenticateUser, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { data, userConfig = {} } = req.body;
    const userId = req.user.id;

    console.log(`🚀 User ${userId} executing workflow ${workflowId}`);

    // Get or create user-specific workflow
    const userWorkflowId = await workflowExecutionService.getUserWorkflow(
      workflowId, 
      userId, 
      userConfig
    );

    console.log(`📋 Using user workflow: ${userWorkflowId}`);

    // Execute the user's specific workflow
    const result = await workflowExecutionService.executeWorkflow(
      userWorkflowId, 
      userId, 
      data
    );

    res.status(201).json({
      success: true,
      message: 'Workflow execution started',
      data: {
        ...result,
        userWorkflowId,
        originalWorkflowId: workflowId
      }
    });

  } catch (error) {
    console.error('❌ Workflow execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute workflow',
      details: error.message
    });
  }
});

// Get user's workflow executions
router.get('/user/executions', authenticateUser, async (req, res) => {
  try {
    const { limit = 10, status, workflowId } = req.query;
    const userId = req.user.id;

    let executions = await workflowExecutionService.getUserExecutions(userId, parseInt(limit));

    // Filter by status if provided
    if (status) {
      executions = executions.filter(exec => exec.status === status);
    }

    // Filter by workflow if provided
    if (workflowId) {
      executions = executions.filter(exec => exec.workflow_id === workflowId);
    }

    res.json({
      success: true,
      data: executions,
      count: executions.length
    });

  } catch (error) {
    console.error('❌ Get user executions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch executions',
      details: error.message
    });
  }
});

// Get specific execution details
router.get('/executions/:executionId', authenticateUser, async (req, res) => {
  try {
    const { executionId } = req.params;
    const userId = req.user.id;

    const { data: execution, error } = await supabase
      .from('workflow_runs')
      .select(`
        *,
        workflows(name, description, category)
      `)
      .eq('id', executionId)
      .eq('user_id', userId)
      .single();

    if (error || !execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }

    res.json({
      success: true,
      data: execution
    });

  } catch (error) {
    console.error('❌ Get execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch execution',
      details: error.message
    });
  }
});

// Get workflow statistics
router.get('/stats/:workflowId', authenticateUser, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { period = '7d' } = req.query;
    const userId = req.user.id;

    // Verify user has access to this workflow
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', userId)
      .single();

    if (workflowError || !workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found or access denied'
      });
    }

    const stats = await workflowExecutionService.getWorkflowStats(workflowId, period);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Get workflow stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workflow statistics',
      details: error.message
    });
  }
});

// Retry failed execution
router.post('/executions/:executionId/retry', authenticateUser, async (req, res) => {
  try {
    const { executionId } = req.params;
    const { data } = req.body;
    const userId = req.user.id;

    // Get the failed execution
    const { data: failedExecution, error } = await supabase
      .from('workflow_runs')
      .select('*')
      .eq('id', executionId)
      .eq('user_id', userId)
      .eq('status', 'failed')
      .single();

    if (error || !failedExecution) {
      return res.status(404).json({
        success: false,
        error: 'Failed execution not found'
      });
    }

    // Execute the workflow again
    const result = await workflowExecutionService.executeWorkflow(
      failedExecution.workflow_id,
      userId,
      data
    );

    res.status(201).json({
      success: true,
      message: 'Workflow retry started',
      data: result
    });

  } catch (error) {
    console.error('❌ Retry execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retry execution',
      details: error.message
    });
  }
});

// Cancel running execution
router.post('/executions/:executionId/cancel', authenticateUser, async (req, res) => {
  try {
    const { executionId } = req.params;
    const userId = req.user.id;

    // Get the running execution
    const { data: runningExecution, error } = await supabase
      .from('workflow_runs')
      .select('*')
      .eq('id', executionId)
      .eq('user_id', userId)
      .eq('status', 'running')
      .single();

    if (error || !runningExecution) {
      return res.status(404).json({
        success: false,
        error: 'Running execution not found'
      });
    }

    // Cancel in n8n
    await n8nService.cancelExecution(runningExecution.result_data.execution_id);

    // Update database
    await supabase
      .from('workflow_runs')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        error_message: 'Execution cancelled by user'
      })
      .eq('id', executionId);

    res.json({
      success: true,
      message: 'Execution cancelled successfully'
    });

  } catch (error) {
    console.error('❌ Cancel execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel execution',
      details: error.message
    });
  }
});

// Get real-time execution status
router.get('/executions/:executionId/status', authenticateUser, async (req, res) => {
  try {
    const { executionId } = req.params;
    const userId = req.user.id;

    const { data: execution, error } = await supabase
      .from('workflow_runs')
      .select('*')
      .eq('id', executionId)
      .eq('user_id', userId)
      .single();

    if (error || !execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }

    // If still running, get latest status from n8n
    if (execution.status === 'running' && execution.result_data?.execution_id) {
      try {
        const n8nStatus = await n8nService.getExecutionStatus(execution.result_data.execution_id);
        
        res.json({
          success: true,
          data: {
            id: execution.id,
            status: n8nStatus.status,
            started_at: execution.started_at,
            duration_ms: execution.duration_ms,
            progress: n8nStatus.progress || 0
          }
        });
      } catch (n8nError) {
        // Return database status if n8n is unreachable
        res.json({
          success: true,
          data: {
            id: execution.id,
            status: execution.status,
            started_at: execution.started_at,
            duration_ms: execution.duration_ms
          }
        });
      }
    } else {
      res.json({
        success: true,
        data: {
          id: execution.id,
          status: execution.status,
          started_at: execution.started_at,
          completed_at: execution.completed_at,
          duration_ms: execution.duration_ms,
          error_message: execution.error_message
        }
      });
    }

  } catch (error) {
    console.error('❌ Get execution status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get execution status',
      details: error.message
    });
  }
});

module.exports = router; 