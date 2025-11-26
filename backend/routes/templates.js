const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

// Get all workflow templates
router.get('/', async (req, res) => {
  try {
    const { category, complexity, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (complexity) {
      query = query.eq('complexity_level', complexity);
    }

    const { data: templates, error, count } = await query
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch templates' });
    }

    res.json({
      templates,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count || templates.length
      }
    });

  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get template by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: template, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);

  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new template (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      json_file_path,
      n8n_link,
      estimated_setup_cost,
      estimated_monthly_cost,
      complexity_level
    } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Name, description, and category are required' });
    }

    const { data: template, error } = await supabase
      .from('workflow_templates')
      .insert([
        {
          name,
          description,
          category,
          json_file_path: json_file_path || null,
          n8n_link: n8n_link || null,
          estimated_setup_cost: estimated_setup_cost || 0,
          estimated_monthly_cost: estimated_monthly_cost || 0,
          complexity_level: complexity_level || 'medium',
          is_active: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create template' });
    }

    res.status(201).json({
      message: 'Template created successfully',
      template
    });

  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update template (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: template, error } = await supabase
      .from('workflow_templates')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({
      message: 'Template updated successfully',
      template
    });

  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete template (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('workflow_templates')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete template' });
    }

    res.json({ message: 'Template deleted successfully' });

  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get templates by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20 } = req.query;

    const { data: templates, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch templates' });
    }

    res.json(templates);

  } catch (error) {
    console.error('Get templates by category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search templates
router.get('/search', async (req, res) => {
  try {
    const { q, category, complexity, limit = 20 } = req.query;

    let query = supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_active', true);

    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (complexity) {
      query = query.eq('complexity_level', complexity);
    }

    const { data: templates, error } = await query
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(500).json({ error: 'Failed to search templates' });
    }

    res.json(templates);

  } catch (error) {
    console.error('Search templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get template categories
router.get('/categories/list', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('workflow_templates')
      .select('category')
      .eq('is_active', true);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }

    const uniqueCategories = [...new Set(categories.map(item => item.category))];
    
    res.json(uniqueCategories);

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get popular templates
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // This would typically be based on usage statistics
    // For now, returning recent templates
    const { data: templates, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch popular templates' });
    }

    res.json(templates);

  } catch (error) {
    console.error('Get popular templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle template active status (admin only)
router.patch('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get current status
    const { data: currentTemplate, error: fetchError } = await supabase
      .from('workflow_templates')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError || !currentTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Toggle status
    const { data: template, error } = await supabase
      .from('workflow_templates')
      .update({
        is_active: !currentTemplate.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to toggle template status' });
    }

    res.json({
      message: `Template ${template.is_active ? 'activated' : 'deactivated'} successfully`,
      template
    });

  } catch (error) {
    console.error('Toggle template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 