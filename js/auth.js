// Standalone Auth Service - Supabase Authentication
// This handles user login, logout, and session management

(function() {
  'use strict';

  // Supabase configuration - loaded from environment or defaults
  const SUPABASE_URL = window.STANDALONE_CONFIG?.SUPABASE_URL || 'https://huaaogdxxdcakxryecnw.supabase.co';
  const SUPABASE_ANON_KEY = window.STANDALONE_CONFIG?.SUPABASE_ANON_KEY || '';

  // Auth state
  let currentUser = null;
  let currentSession = null;
  let supabaseClient = null;

  // Initialize Supabase client
  function initSupabase() {
    if (!window.supabase) {
      console.error('[Auth] Supabase library not loaded');
      return false;
    }
    if (!SUPABASE_ANON_KEY) {
      console.warn('[Auth] No Supabase anon key configured');
      return false;
    }
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('[Auth] Supabase client initialized');
      return true;
    } catch (e) {
      console.error('[Auth] Failed to initialize Supabase:', e);
      return false;
    }
  }

  // Check if user is logged in
  async function checkSession() {
    if (!supabaseClient) {
      if (!initSupabase()) return null;
    }
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (error) throw error;
      if (session) {
        currentSession = session;
        currentUser = session.user;
        console.log('[Auth] Session found:', currentUser.email);
        return currentUser;
      }
    } catch (e) {
      console.error('[Auth] Session check failed:', e);
    }
    return null;
  }

  // Login with email/password
  async function login(email, password) {
    if (!supabaseClient) {
      if (!initSupabase()) {
        throw new Error('Supabase niet geconfigureerd');
      }
    }
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (error) throw error;
      currentSession = data.session;
      currentUser = data.user;
      console.log('[Auth] Login successful:', currentUser.email);
      
      // Store in localStorage for persistence
      localStorage.setItem('sb_user', JSON.stringify({
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.user_metadata?.role || 'user'
      }));
      
      return currentUser;
    } catch (e) {
      console.error('[Auth] Login failed:', e);
      throw e;
    }
  }

  // Register new user
  async function register(email, password, metadata = {}) {
    if (!supabaseClient) {
      if (!initSupabase()) {
        throw new Error('Supabase niet geconfigureerd');
      }
    }
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: metadata
        }
      });
      if (error) throw error;
      console.log('[Auth] Registration successful:', data.user?.email);
      return data;
    } catch (e) {
      console.error('[Auth] Registration failed:', e);
      throw e;
    }
  }

  // Logout
  async function logout() {
    if (!supabaseClient) return;
    try {
      await supabaseClient.auth.signOut();
      currentUser = null;
      currentSession = null;
      localStorage.removeItem('sb_user');
      console.log('[Auth] Logged out');
    } catch (e) {
      console.error('[Auth] Logout failed:', e);
    }
  }

  // Get current user
  function getUser() {
    return currentUser;
  }

  // Get current session token
  function getToken() {
    return currentSession?.access_token || null;
  }

  // Check if user is admin
  function isAdmin() {
    if (!currentUser) return false;
    const role = currentUser.user_metadata?.role || 'user';
    return role === 'admin';
  }

  // Password reset
  async function resetPassword(email) {
    if (!supabaseClient) {
      if (!initSupabase()) {
        throw new Error('Supabase niet geconfigureerd');
      }
    }
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password.html'
      });
      if (error) throw error;
      console.log('[Auth] Password reset email sent');
      return true;
    } catch (e) {
      console.error('[Auth] Password reset failed:', e);
      throw e;
    }
  }

  // Listen for auth state changes
  function onAuthStateChange(callback) {
    if (!supabaseClient) {
      if (!initSupabase()) return null;
    }
    return supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] State change:', event);
      currentSession = session;
      currentUser = session?.user || null;
      if (callback) callback(event, currentUser);
    });
  }

  // Export to window
  window.StandaloneAuth = {
    init: initSupabase,
    checkSession,
    login,
    register,
    logout,
    getUser,
    getToken,
    isAdmin,
    resetPassword,
    onAuthStateChange,
    get client() { return supabaseClient; }
  };

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSupabase();
      checkSession();
    });
  } else {
    initSupabase();
    checkSession();
  }

})();
