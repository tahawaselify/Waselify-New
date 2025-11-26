const express = require('express');
const router = express.Router();
const n8nService = require('../services/n8nService');
const { authenticateToken } = require('../middleware/auth');

// Get all workflows
router.get('/', authenticateToken, async (req, res) => {
  try {
    const workflows = await n8nService.getWorkflows();
    res.json({
      success: true,
      data: workflows
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific workflow
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const workflow = await n8nService.getWorkflow(req.params.id);
    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new workflow
router.post('/', authenticateToken, async (req, res) => {
  try {
    const workflowData = req.body;
    const newWorkflow = await n8nService.createWorkflow(workflowData);
    res.status(201).json({
      success: true,
      data: newWorkflow
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update workflow
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const workflowData = req.body;
    const updatedWorkflow = await n8nService.updateWorkflow(req.params.id, workflowData);
    res.json({
      success: true,
      data: updatedWorkflow
    });
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete workflow
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await n8nService.deleteWorkflow(req.params.id);
    res.json({
      success: true,
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Toggle workflow activation
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { active } = req.body;
    const updatedWorkflow = await n8nService.toggleWorkflow(req.params.id, active);
    res.json({
      success: true,
      data: updatedWorkflow
    });
  } catch (error) {
    console.error('Error toggling workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute workflow
router.post('/:id/execute', authenticateToken, async (req, res) => {
  try {
    const executionData = req.body;
    const execution = await n8nService.executeWorkflow(req.params.id, executionData);
    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get workflow statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await n8nService.getWorkflowStats(req.params.id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching workflow stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Import workflow from JSON
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const { workflow } = req.body;
    const importedWorkflow = await n8nService.importWorkflow(workflow);
    res.status(201).json({
      success: true,
      data: importedWorkflow
    });
  } catch (error) {
    console.error('Error importing workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export workflow to JSON
router.get('/:id/export', authenticateToken, async (req, res) => {
  try {
    const exportedWorkflow = await n8nService.exportWorkflow(req.params.id);
    res.json({
      success: true,
      data: exportedWorkflow
    });
  } catch (error) {
    console.error('Error exporting workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 