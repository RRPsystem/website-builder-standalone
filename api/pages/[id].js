// API endpoint to get or delete a specific page
// Requires authentication via Bearer token

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Page ID is required' });
  }

  // Check authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  const token = authHeader.replace('Bearer ', '');

  // Initialize Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Verify the user's token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (req.method === 'GET') {
      // Get page by ID
      const { data: page, error } = await supabase
        .from('standalone_pages')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      return res.status(200).json({ success: true, page });
    }

    if (req.method === 'DELETE') {
      // Delete page
      const { error } = await supabase
        .from('standalone_pages')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('[pages/delete] Error:', error);
        return res.status(500).json({ error: 'Failed to delete page' });
      }

      return res.status(200).json({ success: true, message: 'Page deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('[pages] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
