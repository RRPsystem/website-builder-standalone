// Admin stats API endpoint
// Requires admin authentication

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Verify user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: adminCheck } = await supabase
      .from('standalone_admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!adminCheck) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get stats
    const { count: totalPages } = await supabase
      .from('standalone_pages')
      .select('*', { count: 'exact', head: true });

    const { count: publishedPages } = await supabase
      .from('standalone_pages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    const { count: draftPages } = await supabase
      .from('standalone_pages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');

    // Get users list with page counts
    const { data: users } = await supabase.auth.admin.listUsers();
    
    // Get all pages with user info
    const { data: pages } = await supabase
      .from('standalone_pages')
      .select('id, title, slug, status, user_id, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50);

    // Map user emails to pages
    const userMap = {};
    if (users && users.users) {
      users.users.forEach(u => {
        userMap[u.id] = u.email;
      });
    }

    const pagesWithEmail = (pages || []).map(p => ({
      ...p,
      user_email: userMap[p.user_id] || 'Onbekend'
    }));

    // Count pages per user
    const usersList = (users?.users || []).map(u => {
      const pageCount = (pages || []).filter(p => p.user_id === u.id).length;
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        page_count: pageCount
      };
    });

    return res.status(200).json({
      users: users?.users?.length || 0,
      pages: totalPages || 0,
      published: publishedPages || 0,
      drafts: draftPages || 0,
      usersList,
      pagesList: pagesWithEmail
    });

  } catch (err) {
    console.error('[admin/stats] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
