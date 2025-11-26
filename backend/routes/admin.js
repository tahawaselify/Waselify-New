const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../lib/supabaseAdmin');

// Middleware to verify admin role using Supabase JWT (sent from frontend)
async function requireAdmin(req, res, next) {
  try {
    // Expect user info in headers (already authenticated on frontend). For stronger security,
    // you can verify Supabase JWT here with JWKs or pass a short-lived admin session token.
    const userId = req.header('x-user-id');
    const userRole = req.header('x-user-role');
    if (!userId || userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    req.adminUserId = userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function ensureAdminClient(res) {
  if (!supabaseAdmin) {
    res.status(500).json({ error: 'Admin client not configured on server' });
    return false;
  }
  return true;
}

// 1) Dashboard overrides: upsert per user+workflow
router.post('/overrides', requireAdmin, async (req, res) => {
  if (!ensureAdminClient(res)) return;
  try {
    const { user_id, workflow_name, hidden_widgets = [], kpi_priority = [], banner = null, time_window_days = null } = req.body || {};
    if (!user_id || !workflow_name) return res.status(400).json({ error: 'Missing user_id or workflow_name' });

    const { data, error } = await supabaseAdmin
      .from('dashboard_overrides')
      .upsert({
        user_id,
        workflow_name,
        hidden_widgets,
        kpi_priority,
        banner,
        time_window_days,
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();
    if (error) throw error;

    // Audit log
    await supabaseAdmin.from('admin_audit_log').insert({
      actor_id: req.adminUserId,
      action: 'upsert_override',
      target_user_id: user_id,
      target_workflow_name: workflow_name,
      payload: { hidden_widgets, kpi_priority, banner, time_window_days },
      created_at: new Date().toISOString()
    });

    res.json({ data });
  } catch (e) {
    console.error('overrides error', e);
    res.status(500).json({ error: e.message || 'Failed to upsert override' });
  }
});

// 2) Admin commands: maintenance, forceReload, showBanner, etc.
router.post('/commands', requireAdmin, async (req, res) => {
  if (!ensureAdminClient(res)) return;
  try {
    const { user_id, workflow_name, command, message = null } = req.body || {};
    if (!user_id || !workflow_name || !command) return res.status(400).json({ error: 'Missing fields' });

    const { data, error } = await supabaseAdmin
      .from('admin_commands')
      .insert({
        user_id,
        workflow_name,
        command,
        message,
        created_at: new Date().toISOString(),
        status: 'active'
      })
      .select('*')
      .single();
    if (error) throw error;

    await supabaseAdmin.from('admin_audit_log').insert({
      actor_id: req.adminUserId,
      action: 'publish_command',
      target_user_id: user_id,
      target_workflow_name: workflow_name,
      payload: { command, message },
      created_at: new Date().toISOString()
    });

    res.json({ data });
  } catch (e) {
    console.error('commands error', e);
    res.status(500).json({ error: e.message || 'Failed to publish command' });
  }
});

// 4) Start workflow (secure, server-side)
router.post('/workflows/start', requireAdmin, async (req, res) => {
  if (!ensureAdminClient(res)) return;
  try {
    const { user_id, workflow_name } = req.body || {};
    if (!workflow_name) return res.status(400).json({ error: 'Missing workflow_name' });

    // Resolve n8n workflow id by mapping table first
    let workflowId = null;
    const { data: mapRow } = await supabaseAdmin
      .from('workflow_name_mapping')
      .select('workflow_id')
      .eq('workflow_name', workflow_name)
      .maybeSingle();
    workflowId = mapRow?.workflow_id || null;

    // Fallback: try to find by name from n8n
    if (!workflowId) {
      const n8n = require('../services/n8nService');
      const workflows = await n8n.getWorkflows();
      const match = (workflows?.data || workflows)?.find?.(w => w.name === workflow_name || w.id === workflow_name);
      if (match) workflowId = match.id;
    }

    if (!workflowId) return res.status(404).json({ error: 'Workflow not found in mapping or n8n' });

    const n8n = require('../services/n8nService');
    await n8n.toggleWorkflow(workflowId, true);

    // Audit log
    await supabaseAdmin.from('admin_audit_log').insert({
      actor_id: req.adminUserId,
      action: 'start_workflow',
      target_user_id: user_id || null,
      target_workflow_name: workflow_name,
      payload: { workflow_id: workflowId },
      created_at: new Date().toISOString()
    });

    res.json({ success: true, workflow_id: workflowId });
  } catch (e) {
    console.error('start workflow error', e);
    res.status(500).json({ error: e.message || 'Failed to start workflow' });
  }
});

// 5) Stop workflow (secure, server-side)
router.post('/workflows/stop', requireAdmin, async (req, res) => {
  if (!ensureAdminClient(res)) return;
  try {
    const { user_id, workflow_name } = req.body || {};
    if (!workflow_name) return res.status(400).json({ error: 'Missing workflow_name' });

    // Resolve workflow id
    let workflowId = null;
    const { data: mapRow } = await supabaseAdmin
      .from('workflow_name_mapping')
      .select('workflow_id')
      .eq('workflow_name', workflow_name)
      .maybeSingle();
    workflowId = mapRow?.workflow_id || null;

    if (!workflowId) {
      const n8n = require('../services/n8nService');
      const workflows = await n8n.getWorkflows();
      const match = (workflows?.data || workflows)?.find?.(w => w.name === workflow_name || w.id === workflow_name);
      if (match) workflowId = match.id;
    }

    if (!workflowId) return res.status(404).json({ error: 'Workflow not found in mapping or n8n' });

    const n8n = require('../services/n8nService');
    await n8n.toggleWorkflow(workflowId, false);

    await supabaseAdmin.from('admin_audit_log').insert({
      actor_id: req.adminUserId,
      action: 'stop_workflow',
      target_user_id: user_id || null,
      target_workflow_name: workflow_name,
      payload: { workflow_id: workflowId },
      created_at: new Date().toISOString()
    });

    res.json({ success: true, workflow_id: workflowId });
  } catch (e) {
    console.error('stop workflow error', e);
    res.status(500).json({ error: e.message || 'Failed to stop workflow' });
  }
});


// 3) Optional: deactivate command (set status=inactive)
router.post('/commands/deactivate', requireAdmin, async (req, res) => {
  if (!ensureAdminClient(res)) return;
  try {
    const { command_id } = req.body || {};
    if (!command_id) return res.status(400).json({ error: 'Missing command_id' });

    const { data, error } = await supabaseAdmin
      .from('admin_commands')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', command_id)
      .select('*')
      .single();
    if (error) throw error;

    await supabaseAdmin.from('admin_audit_log').insert({
      actor_id: req.adminUserId,
      action: 'deactivate_command',
      payload: { command_id },
      created_at: new Date().toISOString()
    });

    res.json({ data });
  } catch (e) {
    console.error('deactivate command error', e);
    res.status(500).json({ error: e.message || 'Failed to deactivate command' });
  }
});

module.exports = router;

