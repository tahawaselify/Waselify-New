const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class WorkflowImportService {
  constructor() {
    this.workflowsPath = path.join(__dirname, '../../n8n/Q-Agents/Workflows');
    this.n8nUrl = process.env.N8N_URL || 'http://localhost:5678';
    this.n8nApiKey = process.env.N8N_API_KEY;
    
    // Check if n8n is configured
    if (!this.n8nApiKey) {
      console.warn('⚠️  N8N_API_KEY not configured. n8n import features will be disabled.');
    }
  }

  /**
   * Get all available workflow files
   */
  async getAvailableWorkflows() {
    try {
      const files = await fs.readdir(this.workflowsPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const workflows = [];
      for (const file of jsonFiles) {
        const filePath = path.join(this.workflowsPath, file);
        const content = await fs.readFile(filePath, 'utf8');
        const workflow = JSON.parse(content);
        
        workflows.push({
          filename: file,
          name: workflow.name || file.replace('.json', ''),
          description: this.extractDescription(workflow),
          nodeCount: workflow.nodes?.length || 0,
          active: workflow.active || false,
          tags: workflow.tags || [],
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
          size: content.length
        });
      }
      
      return workflows;
    } catch (error) {
      console.error('Error reading workflow files:', error);
      throw new Error('Failed to read workflow files');
    }
  }

  /**
   * Extract description from workflow
   */
  extractDescription(workflow) {
    // Look for description in sticky notes or workflow metadata
    if (workflow.description) return workflow.description;
    
    // Look for description in sticky notes
    const stickyNotes = workflow.nodes?.filter(node => 
      node.type === 'n8n-nodes-base.stickyNote'
    ) || [];
    
    if (stickyNotes.length > 0) {
      return stickyNotes[0].parameters?.content || 'No description available';
    }
    
    return 'No description available';
  }

  /**
   * Import a specific workflow to n8n
   */
  async importWorkflowToN8n(filename) {
    if (!this.n8nApiKey) {
      throw new Error('N8N_API_KEY not configured. Please set the N8N_API_KEY environment variable.');
    }
    
    try {
      const filePath = path.join(this.workflowsPath, filename);
      const content = await fs.readFile(filePath, 'utf8');
      const workflow = JSON.parse(content);
      
      // Prepare workflow for n8n import
      const importData = {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        active: false, // Import as inactive by default
        settings: workflow.settings || {},
        tags: workflow.tags || [],
        triggerCount: workflow.triggerCount || 0,
        updatedAt: new Date().toISOString(),
        versionId: workflow.versionId || '1'
      };
      
      // Import to n8n via API
      const response = await axios.post(
        `${this.n8nUrl}/api/v1/workflows`,
        importData,
        {
          headers: {
            'X-N8N-API-KEY': this.n8nApiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        success: true,
        workflowId: response.data.id,
        name: workflow.name,
        message: 'Workflow imported successfully'
      };
    } catch (error) {
      console.error('Error importing workflow to n8n:', error);
      throw new Error(`Failed to import workflow: ${error.message}`);
    }
  }

  /**
   * Import all workflows to n8n
   */
  async importAllWorkflowsToN8n() {
    if (!this.n8nApiKey) {
      throw new Error('N8N_API_KEY not configured. Please set the N8N_API_KEY environment variable.');
    }
    
    try {
      const workflows = await this.getAvailableWorkflows();
      const results = [];
      
      for (const workflow of workflows) {
        try {
          const result = await this.importWorkflowToN8n(workflow.filename);
          results.push({
            filename: workflow.filename,
            success: true,
            ...result
          });
        } catch (error) {
          results.push({
            filename: workflow.filename,
            success: false,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error importing all workflows:', error);
      throw new Error('Failed to import workflows');
    }
  }

  /**
   * Get workflow content by filename
   */
  async getWorkflowContent(filename) {
    try {
      const filePath = path.join(this.workflowsPath, filename);
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading workflow file:', error);
      throw new Error('Failed to read workflow file');
    }
  }

  /**
   * Test n8n connection
   */
  async testN8nConnection() {
    if (!this.n8nApiKey) {
      return {
        success: false,
        error: 'N8N_API_KEY not configured',
        message: 'Please set the N8N_API_KEY environment variable'
      };
    }
    
    try {
      const response = await axios.get(`${this.n8nUrl}/api/v1/health`, {
        headers: {
          'X-N8N-API-KEY': this.n8nApiKey
        }
      });
      
      return {
        success: true,
        status: response.data.status,
        version: response.data.version,
        message: 'n8n connection successful'
      };
    } catch (error) {
      console.error('Error testing n8n connection:', error);
      return {
        success: false,
        error: error.message,
        message: 'n8n connection failed'
      };
    }
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats() {
    try {
      const workflows = await this.getAvailableWorkflows();
      
      return {
        totalWorkflows: workflows.length,
        totalSize: workflows.reduce((sum, w) => sum + w.size, 0),
        activeWorkflows: workflows.filter(w => w.active).length,
        averageNodeCount: workflows.reduce((sum, w) => sum + w.nodeCount, 0) / workflows.length,
        categories: this.categorizeWorkflows(workflows)
      };
    } catch (error) {
      console.error('Error getting workflow stats:', error);
      throw new Error('Failed to get workflow statistics');
    }
  }

  /**
   * Categorize workflows by type
   */
  categorizeWorkflows(workflows) {
    const categories = {
      'Lead Generation': [],
      'Email Automation': [],
      'Chatbot': [],
      'Customer Support': [],
      'HR & Recruitment': [],
      'Financial': [],
      'Sales': [],
      'Other': []
    };
    
    workflows.forEach(workflow => {
      const name = workflow.name.toLowerCase();
      
      if (name.includes('lead') || name.includes('generation')) {
        categories['Lead Generation'].push(workflow);
      } else if (name.includes('gmail') || name.includes('email')) {
        categories['Email Automation'].push(workflow);
      } else if (name.includes('chatbot') || name.includes('chat')) {
        categories['Chatbot'].push(workflow);
      } else if (name.includes('support') || name.includes('customer')) {
        categories['Customer Support'].push(workflow);
      } else if (name.includes('hr') || name.includes('job') || name.includes('recruitment')) {
        categories['HR & Recruitment'].push(workflow);
      } else if (name.includes('financial') || name.includes('invoice') || name.includes('report')) {
        categories['Financial'].push(workflow);
      } else if (name.includes('sales') || name.includes('odoo')) {
        categories['Sales'].push(workflow);
      } else {
        categories['Other'].push(workflow);
      }
    });
    
    return categories;
  }
}

module.exports = new WorkflowImportService(); 