// Page Service - Handles saving and loading pages from Supabase
// For the Standalone Builder

(function() {
  'use strict';

  const API_BASE = '';  // Same origin

  // Get auth token from Supabase session
  async function getToken() {
    if (window.StandaloneAuth && window.StandaloneAuth.getToken) {
      return window.StandaloneAuth.getToken();
    }
    // Fallback: try to get from Supabase directly
    if (window.supabase) {
      try {
        const { data: { session } } = await window.supabase.auth.getSession();
        return session?.access_token || null;
      } catch (e) {
        console.warn('[PageService] Could not get session:', e);
      }
    }
    return null;
  }

  // Check if user is logged in
  async function isLoggedIn() {
    const token = await getToken();
    return !!token;
  }

  // Save page to database
  async function savePage(pageData) {
    const token = await getToken();
    if (!token) {
      throw new Error('Je moet ingelogd zijn om pagina\'s op te slaan');
    }

    const response = await fetch(`${API_BASE}/api/pages/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(pageData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Opslaan mislukt');
    }

    return data.page;
  }

  // Get list of user's pages
  async function listPages() {
    const token = await getToken();
    if (!token) {
      return [];
    }

    const response = await fetch(`${API_BASE}/api/pages/list`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[PageService] List failed:', data.error);
      return [];
    }

    return data.pages || [];
  }

  // Get single page by ID
  async function getPage(id) {
    const token = await getToken();
    if (!token) {
      throw new Error('Je moet ingelogd zijn');
    }

    const response = await fetch(`${API_BASE}/api/standalone-pages/get?id=${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Pagina niet gevonden');
    }

    return data.page;
  }

  // Delete page
  async function deletePage(id) {
    const token = await getToken();
    if (!token) {
      throw new Error('Je moet ingelogd zijn');
    }

    const response = await fetch(`${API_BASE}/api/standalone-pages/delete?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Verwijderen mislukt');
    }

    return true;
  }

  // Export to window
  window.PageService = {
    isLoggedIn,
    savePage,
    listPages,
    getPage,
    deletePage
  };

})();
