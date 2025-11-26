const express = require('express');
const router = express.Router();
const workflowImportService = require('../services/workflowImportService');

/**
 * GET /api/imports/workflows
 * Get all available workflow files
 */
router.get('/workflows', async (req, res) => {
  try {
    const workflows = await workflowImportService.getAvailableWorkflows();
    res.json({
      success: true,
      data: workflows,
      count: workflows.length
    });
  } catch (error) {
    console.error('Error getting workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/imports/workflows/:filename
 * Get specific workflow content
 */
router.get('/workflows/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const workflow = await workflowImportService.getWorkflowContent(filename);
    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error getting workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/imports/workflows/:filename
 * Import specific workflow to n8n
 */
router.post('/workflows/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const result = await workflowImportService.importWorkflowToN8n(filename);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error importing workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/imports/workflows
 * Import all workflows to n8n
 */
router.post('/workflows', async (req, res) => {
  try {
    const results = await workflowImportService.importAllWorkflowsToN8n();
    res.json({
      success: true,
      data: results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    console.error('Error importing workflows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/imports/stats
 * Get workflow statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await workflowImportService.getWorkflowStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/imports/test-n8n
 * Test n8n connection
 */
router.get('/test-n8n', async (req, res) => {
  try {
    const result = await workflowImportService.testN8nConnection();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error testing n8n connection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 