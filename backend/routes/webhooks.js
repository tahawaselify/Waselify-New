const express = require('express');
const router = express.Router();
const n8nService = require('../services/n8nService');
const { authenticateToken } = require('../middleware/auth');

// Test webhook endpoint
router.post('/test/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { data } = req.body;

    const result = await n8nService.testWebhook(workflowId, data);
    
    res.json({
      message: 'Webhook test successful',
      result
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({ error: 'Failed to test webhook' });
  }
});

// Get webhook URL for workflow
router.get('/url/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    const webhookUrl = await n8nService.getWebhookUrl(workflowId);
    
    if (!webhookUrl) {
      return res.status(404).json({ error: 'Webhook not found for this workflow' });
    }

    res.json({
      webhookUrl,
      workflowId
    });
  } catch (error) {
    console.error('Get webhook URL error:', error);
    res.status(500).json({ error: 'Failed to get webhook URL' });
  }
});

// Create webhook for workflow
router.post('/create/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { webhookData } = req.body;

    const webhook = await n8nService.createWebhook(workflowId, webhookData);
    
    res.status(201).json({
      message: 'Webhook created successfully',
      webhook
    });
  } catch (error) {
    console.error('Create webhook error:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Update webhook
router.put('/:webhookId', authenticateToken, async (req, res) => {
  try {
    const { webhookId } = req.params;
    const { webhookData } = req.body;

    const webhook = await n8nService.updateWebhook(webhookId, webhookData);
    
    res.json({
      message: 'Webhook updated successfully',
      webhook
    });
  } catch (error) {
    console.error('Update webhook error:', error);
    res.status(500).json({ error: 'Failed to update webhook' });
  }
});

// Delete webhook
router.delete('/:webhookId', authenticateToken, async (req, res) => {
  try {
    const { webhookId } = req.params;

    await n8nService.deleteWebhook(webhookId);
    
    res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Delete webhook error:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

// Get webhook statistics
router.get('/stats/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { period = '7d' } = req.query;

    const stats = await n8nService.getWebhookStats(workflowId, period);
    
    res.json(stats);
  } catch (error) {
    console.error('Get webhook stats error:', error);
    res.status(500).json({ error: 'Failed to get webhook statistics' });
  }
});

// Webhook receiver endpoint (for external services)
router.post('/receive/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const webhookData = req.body;

    // Log webhook data
    console.log(`Webhook received for workflow ${workflowId}:`, webhookData);

    // Process webhook data
    const result = await n8nService.processWebhook(workflowId, webhookData);
    
    res.json({
      message: 'Webhook processed successfully',
      result
    });
  } catch (error) {
    console.error('Process webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Get webhook logs
router.get('/logs/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const logs = await n8nService.getWebhookLogs(workflowId, {
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Get webhook logs error:', error);
    res.status(500).json({ error: 'Failed to get webhook logs' });
  }
});

// Validate webhook signature
router.post('/validate', async (req, res) => {
  try {
    const { signature, payload, secret } = req.body;

    const isValid = await n8nService.validateWebhookSignature(signature, payload, secret);
    
    res.json({
      valid: isValid
    });
  } catch (error) {
    console.error('Validate webhook signature error:', error);
    res.status(500).json({ error: 'Failed to validate webhook signature' });
  }
});

// Get webhook configuration
router.get('/config/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;

    const config = await n8nService.getWebhookConfig(workflowId);
    
    if (!config) {
      return res.status(404).json({ error: 'Webhook configuration not found' });
    }

    res.json(config);
  } catch (error) {
    console.error('Get webhook config error:', error);
    res.status(500).json({ error: 'Failed to get webhook configuration' });
  }
});

// Update webhook configuration
router.put('/config/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { config } = req.body;

    const updatedConfig = await n8nService.updateWebhookConfig(workflowId, config);
    
    res.json({
      message: 'Webhook configuration updated successfully',
      config: updatedConfig
    });
  } catch (error) {
    console.error('Update webhook config error:', error);
    res.status(500).json({ error: 'Failed to update webhook configuration' });
  }
});

// Enable/disable webhook
router.patch('/toggle/:workflowId', authenticateToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    const { enabled } = req.body;

    const result = await n8nService.toggleWebhook(workflowId, enabled);
    
    res.json({
      message: `Webhook ${enabled ? 'enabled' : 'disabled'} successfully`,
      result
    });
  } catch (error) {
    console.error('Toggle webhook error:', error);
    res.status(500).json({ error: 'Failed to toggle webhook' });
  }
});

module.exports = router; 