// API endpoint to save pages to Supabase
// Requires authentication via Bearer token

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  const token = authHeader.replace('Bearer ', '');

  // Initialize Supabase with service role for database operations
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[pages/save] Missing Supabase configuration');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Verify the user's token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[pages/save] Auth error:', authError);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = user.id;
    const { id, title, slug, content, content_json, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Generate slug if not provided
    const pageSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const pageData = {
      user_id: userId,
      title: title,
      slug: pageSlug,
      content: content || '',
      content_json: content_json || null,
      status: status || 'draft',
      updated_at: new Date().toISOString()
    };

    let result;

    if (id) {
      // Update existing page
      const { data, error } = await supabase
        .from('standalone_pages')
        .update(pageData)
        .eq('id', id)
        .eq('user_id', userId) // Ensure user owns this page
        .select()
        .single();

      if (error) {
        console.error('[pages/save] Update error:', error);
        return res.status(500).json({ error: 'Failed to update page', details: error.message });
      }

      result = data;
    } else {
      // Create new page
      pageData.created_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('standalone_pages')
        .insert(pageData)
        .select()
        .single();

      if (error) {
        console.error('[pages/save] Insert error:', error);
        return res.status(500).json({ error: 'Failed to create page', details: error.message });
      }

      result = data;
    }

    console.log('[pages/save] Page saved:', result.id);
    return res.status(200).json({ 
      success: true, 
      page: result 
    });

  } catch (err) {
    console.error('[pages/save] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
