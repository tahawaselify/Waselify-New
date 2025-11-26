const axios = require('axios');
const FormData = require('form-data');

class N8nService {
  constructor() {
    this.baseURL = process.env.N8N_URL || 'http://localhost:5678';
    this.apiKey = process.env.N8N_API_KEY;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  // Health check
  async checkHealth() {
    try {
      const response = await this.client.get('/healthz');
      return {
        status: 'healthy',
        version: response.data.version,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('n8n health check failed:', error.message);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Get all workflows
  async getWorkflows() {
    try {
      const response = await this.client.get('/api/v1/workflows');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflows:', error.message);
      throw new Error('Failed to fetch workflows from n8n');
    }
  }

  // Get specific workflow
  async getWorkflow(workflowId) {
    try {
      const response = await this.client.get(`/api/v1/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch workflow ${workflowId}:`, error.message);
      throw new Error('Failed to fetch workflow from n8n');
    }
  }

  // Create new workflow
  async createWorkflow(workflowData) {
    try {
      const response = await this.client.post('/api/v1/workflows', workflowData);
      return response.data;
    } catch (error) {
      console.error('Failed to create workflow:', error.message);
      throw new Error('Failed to create workflow in n8n');
    }
  }

  // Update workflow
  async updateWorkflow(workflowId, workflowData) {
    try {
      const response = await this.client.put(`/api/v1/workflows/${workflowId}`, workflowData);
      return response.data;
    } catch (error) {
      console.error(`Failed to update workflow ${workflowId}:`, error.message);
      throw new Error('Failed to update workflow in n8n');
    }
  }

  // Delete workflow
  async deleteWorkflow(workflowId) {
    try {
      await this.client.delete(`/api/v1/workflows/${workflowId}`);
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete workflow ${workflowId}:`, error.message);
      throw new Error('Failed to delete workflow from n8n');
    }
  }

  // Activate/deactivate workflow
  async toggleWorkflow(workflowId, active) {
    try {
      const response = await this.client.patch(`/api/v1/workflows/${workflowId}`, {
        active: active
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to toggle workflow ${workflowId}:`, error.message);
      throw new Error('Failed to toggle workflow in n8n');
    }
  }

  // Execute workflow
  async executeWorkflow(workflowId, data = {}) {
    try {
      const response = await this.client.post(`/api/v1/workflows/${workflowId}/trigger`, data);
      return response.data;
    } catch (error) {
      console.error(`Failed to execute workflow ${workflowId}:`, error.message);
      throw new Error('Failed to execute workflow in n8n');
    }
  }

  // Get execution status
  async getExecutionStatus(executionId) {
    try {
      const response = await this.client.get(`/api/v1/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get execution status ${executionId}:`, error.message);
      throw new Error('Failed to get execution status from n8n');
    }
  }

  // Cancel execution
  async cancelExecution(executionId) {
    try {
      const response = await this.client.post(`/api/v1/executions/${executionId}/stop`);
      return response.data;
    } catch (error) {
      console.error(`Failed to cancel execution ${executionId}:`, error.message);
      throw new Error('Failed to cancel execution in n8n');
    }
  }

  // Import workflow from JSON
  async importWorkflow(workflowJson) {
    try {
      const response = await this.client.post('/api/v1/workflows/import', {
        workflow: workflowJson
      });
      return response.data;
    } catch (error) {
      console.error('Failed to import workflow:', error.message);
      throw new Error('Failed to import workflow to n8n');
    }
  }

  // Export workflow to JSON
  async exportWorkflow(workflowId) {
    try {
      const response = await this.client.get(`/api/v1/workflows/${workflowId}/export`);
      return response.data;
    } catch (error) {
      console.error(`Failed to export workflow ${workflowId}:`, error.message);
      throw new Error('Failed to export workflow from n8n');
    }
  }

  // Get workflow statistics
  async getWorkflowStats(workflowId) {
    try {
      const response = await this.client.get(`/api/v1/workflows/${workflowId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get workflow stats ${workflowId}:`, error.message);
      throw new Error('Failed to get workflow statistics from n8n');
    }
  }

  // Test webhook endpoint
  async testWebhook(webhookUrl, data = {}) {
    try {
      const response = await axios.post(webhookUrl, data, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      console.error('Webhook test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new N8nService(); 