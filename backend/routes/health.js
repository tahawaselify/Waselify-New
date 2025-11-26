const express = require('express');
const router = express.Router();
const n8nService = require('../services/n8nService');
const { authenticateToken } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

// Initialize services
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Basic health check
router.get('/', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Waselify n8n Backend',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Health check failed'
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {}
    };

    // Check n8n service
    try {
      const n8nHealth = await n8nService.checkHealth();
      healthStatus.services.n8n = {
        status: 'healthy',
        response: n8nHealth
      };
    } catch (error) {
      healthStatus.services.n8n = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.status = 'degraded';
    }

    // Check Supabase connection
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      healthStatus.services.supabase = {
        status: 'healthy',
        response: 'Connected successfully'
      };
    } catch (error) {
      healthStatus.services.supabase = {
        status: 'unhealthy',
        error: error.message
      };
      healthStatus.status = 'degraded';
    }

    // Check environment variables
    const requiredEnvVars = [
      'N8N_URL',
      'N8N_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET'
    ];

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      healthStatus.services.environment = {
        status: 'unhealthy',
        error: `Missing environment variables: ${missingEnvVars.join(', ')}`
      };
      healthStatus.status = 'degraded';
    } else {
      healthStatus.services.environment = {
        status: 'healthy',
        response: 'All required environment variables are set'
      };
    }

    // Check system resources
    const systemInfo = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform
    };

    healthStatus.services.system = {
      status: 'healthy',
      info: systemInfo
    };

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);

  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Detailed health check failed',
      message: error.message
    });
  }
});

// n8n specific health check
router.get('/n8n', async (req, res) => {
  try {
    const health = await n8nService.checkHealth();
    res.json({
      status: 'healthy',
      service: 'n8n',
      response: health
    });
  } catch (error) {
    console.error('n8n health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'n8n',
      error: error.message
    });
  }
});

// Database health check
router.get('/database', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    res.json({
      status: 'healthy',
      service: 'database',
      response: 'Connected successfully'
    });
  } catch (error) {
    console.error('Database health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'database',
      error: error.message
    });
  }
});

// Workflow health check
router.get('/workflows', async (req, res) => {
  try {
    const workflows = await n8nService.getWorkflows();
    
    const activeWorkflows = workflows.filter(w => w.active);
    const inactiveWorkflows = workflows.filter(w => !w.active);

    res.json({
      status: 'healthy',
      service: 'workflows',
      stats: {
        total: workflows.length,
        active: activeWorkflows.length,
        inactive: inactiveWorkflows.length
      },
      workflows: workflows.slice(0, 5) // Return first 5 workflows as sample
    });
  } catch (error) {
    console.error('Workflows health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'workflows',
      error: error.message
    });
  }
});

// API endpoints health check
router.get('/endpoints', async (req, res) => {
  try {
    const endpoints = [
      { name: 'auth', path: '/api/auth' },
      { name: 'workflows', path: '/api/workflows' },
      { name: 'executions', path: '/api/executions' },
      { name: 'templates', path: '/api/templates' },
      { name: 'webhooks', path: '/api/webhooks' }
    ];

    const endpointStatus = endpoints.map(endpoint => ({
      name: endpoint.name,
      path: endpoint.path,
      status: 'available'
    }));

    res.json({
      status: 'healthy',
      service: 'endpoints',
      endpoints: endpointStatus
    });
  } catch (error) {
    console.error('Endpoints health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      service: 'endpoints',
      error: error.message
    });
  }
});

// System metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform
      },
      process: {
        pid: process.pid,
        title: process.title,
        argv: process.argv,
        env: Object.keys(process.env).length
      }
    };

    res.json({
      status: 'healthy',
      service: 'metrics',
      metrics
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({
      status: 'unhealthy',
      service: 'metrics',
      error: error.message
    });
  }
});

// Readiness probe
router.get('/ready', async (req, res) => {
  try {
    // Check if all critical services are ready
    const checks = [];

    // Check n8n
    try {
      await n8nService.checkHealth();
      checks.push({ service: 'n8n', status: 'ready' });
    } catch (error) {
      checks.push({ service: 'n8n', status: 'not ready', error: error.message });
    }

    // Check database
    try {
      const { error } = await supabase
        .from('workflow_templates')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }
      checks.push({ service: 'database', status: 'ready' });
    } catch (error) {
      checks.push({ service: 'database', status: 'not ready', error: error.message });
    }

    const allReady = checks.every(check => check.status === 'ready');
    const statusCode = allReady ? 200 : 503;

    res.status(statusCode).json({
      status: allReady ? 'ready' : 'not ready',
      checks
    });

  } catch (error) {
    console.error('Readiness check error:', error);
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

// Liveness probe
router.get('/live', async (req, res) => {
  try {
    // Simple check to see if the process is alive
    res.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      pid: process.pid
    });
  } catch (error) {
    console.error('Liveness check error:', error);
    res.status(503).json({
      status: 'not alive',
      error: error.message
    });
  }
});

module.exports = router; 