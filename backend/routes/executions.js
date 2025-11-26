const express = require('express');
const router = express.Router();
const n8nService = require('../services/n8nService');
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all executions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, workflowId } = req.query;
    
    const executions = await n8nService.getExecutions({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      workflowId
    });

    res.json(executions);
  } catch (error) {
    console.error('Get executions error:', error);
    res.status(500).json({ error: 'Failed to fetch executions' });
  }
});

// Get execution by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const execution = await n8nService.getExecution(id);
    
    if (!execution) {
      return res.status(404).json({ error: 'Execution not found' });
    }

    res.json(execution);
  } catch (error) {
    console.error('Get execution error:', error);
    res.status(500).json({ error: 'Failed to fetch execution' });
  }
});

// Execute workflow
router.post('/execute/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { data, options } = req.body;

    const execution = await n8nService.executeWorkflow(workflowId, data, options);
    
    res.status(201).json({
      message: 'Workflow execution started',
      executionId: execution.id,
      status: execution.status
    });
  } catch (error) {
    console.error('Execute workflow error:', error);
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
});

// Get execution status
router.get('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const status = await n8nService.getExecutionStatus(id);
    
    res.json({ status });
  } catch (error) {
    console.error('Get execution status error:', error);
    res.status(500).json({ error: 'Failed to get execution status' });
  }
});

// Cancel execution
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await n8nService.cancelExecution(id);
    
    res.json({ message: 'Execution cancelled successfully' });
  } catch (error) {
    console.error('Cancel execution error:', error);
    res.status(500).json({ error: 'Failed to cancel execution' });
  }
});

// Get execution logs
router.get('/:id/logs', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await n8nService.getExecutionLogs(id);
    
    res.json({ logs });
  } catch (error) {
    console.error('Get execution logs error:', error);
    res.status(500).json({ error: 'Failed to get execution logs' });
  }
});

// Retry failed execution
router.post('/:id/retry', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;
    
    const newExecution = await n8nService.retryExecution(id, data);
    
    res.status(201).json({
      message: 'Execution retry started',
      executionId: newExecution.id,
      status: newExecution.status
    });
  } catch (error) {
    console.error('Retry execution error:', error);
    res.status(500).json({ error: 'Failed to retry execution' });
  }
});

// Get execution statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    const stats = await n8nService.getExecutionStats(period);
    
    res.json(stats);
  } catch (error) {
    console.error('Get execution stats error:', error);
    res.status(500).json({ error: 'Failed to get execution statistics' });
  }
});

// Get user's recent executions
router.get('/user/recent', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.userId;
    
    const executions = await n8nService.getUserExecutions(userId, parseInt(limit));
    
    res.json(executions);
  } catch (error) {
    console.error('Get user executions error:', error);
    res.status(500).json({ error: 'Failed to get user executions' });
  }
});

module.exports = router; 