// Vercel Serverless Function: GET /api/ideas/[id]
// Proxies Travel Compositor idea detail using env credentials (Bearer auth).
// Matches TC docs:
//   POST /resources/authentication/authenticate  -> token
//   GET  /resources/travelidea/{micrositeId}/{ideaId}  (with language/currency/adults)
//   Optional info endpoint via ?info=1 -> /resources/travelidea/{micrositeId}/info/{ideaId}

export default async function handler(req, res) {
  // DEBUG: Log invocation
  console.log('[TC API] Function invoked!');
  console.log('[TC API] req.query:', req.query);
  console.log('[TC API] req.url:', req.url);
  
  try {
    const {
      TC_BASE_URL = '', // e.g. https://online.travelcompositor.com
      TC_MICROSITE_ID = '',
      TC_MICROSITES = '', // JSON config for multiple microsites
      TC_TOKEN = '', // optional static token
      TC_USERNAME = '',
      TC_PASSWORD = '',
      TC_TENANT_ID = ''
    } = process.env;

    const { id } = req.query || {};
    console.log('[TC API] ID from query:', id);
    
    if (!id) {
      console.error('[TC API] Missing ID!');
      return res.status(400).json({ error: 'Missing id', received: { query: req.query, url: req.url } });
    }
    if (!TC_BASE_URL) {
      return res.status(500).json({ error: 'Missing TC_BASE_URL' });
    }

    const micrositeId = String(req.query?.micrositeId || TC_MICROSITE_ID);
    if (!micrositeId) {
      return res.status(400).json({ error: 'micrositeId parameter is required' });
    }

    // Get credentials for this specific microsite
    let username = TC_USERNAME;
    let password = TC_PASSWORD;
    
    // Method 1: TC_MICROSITES JSON (supports multiple microsites in one variable)
    if (TC_MICROSITES) {
      try {
        const micrositesConfig = JSON.parse(TC_MICROSITES);
        if (micrositesConfig[micrositeId]) {
          username = micrositesConfig[micrositeId].username || username;
          password = micrositesConfig[micrositeId].password || password;
        }
      } catch (e) {
        console.warn('[ideas/id] Failed to parse TC_MICROSITES:', e.message);
      }
    }
    
    // Method 2: Numbered suffix pattern (TC_MICROSITE_ID_2, TC_USERNAME_2, etc.)
    // Check if this microsite matches a numbered suffix variable
    for (let i = 2; i <= 10; i++) {
      const suffixedMicrositeId = process.env[`TC_MICROSITE_ID_${i}`];
      if (suffixedMicrositeId === micrositeId) {
        username = process.env[`TC_USERNAME_${i}`] || username;
        password = process.env[`TC_PASSWORD_${i}`] || password;
        console.log(`[ideas/id] Using credentials from TC_*_${i} for microsite:`, micrositeId);
        break;
      }
    }
    // Remove trailing slash and /resources if present to avoid duplication
    const base = TC_BASE_URL.replace(/\/$/, '').replace(/\/resources\/?$/, '');
    const AUTH_PATH = (process.env.TC_AUTH_PATH || '/resources/authentication/authenticate');
    const IDEAS_PATH = (process.env.TC_TRAVELIDEA_PATH || '/resources/travelidea');

    // Query params
    const {
      language: languageRaw = 'NL',
      lang: langRaw,
      currency = 'EUR',
      adults = '2',
      info
    } = req.query || {};
    const language = String(langRaw || languageRaw || 'NL');
    const params = new URLSearchParams();
    // TC endpoints are inconsistent: some use `lang`, others use `language`.
    // Send both to maximize chance of localized texts.
    params.set('language', String(language));
    params.set('lang', String(language));
    params.set('currency', String(currency));
    if (adults) params.set('adults', String(adults));

    // Acquire Bearer token
    const headers = { Accept: 'application/json' };
    if (TC_TENANT_ID) headers['X-Tenant-Id'] = String(TC_TENANT_ID);
    let bearer = TC_TOKEN;
    if (!bearer) {
      if (!username || !password || !micrositeId) {
        return res.status(500).json({ error: 'Missing TC credentials to authenticate' });
      }
      const authBody = { 
        username, 
        password, 
        micrositeId: parseInt(micrositeId) || micrositeId // Try both string and number
      };
      console.log('[TC API] Attempting auth with:', { 
        url: `${base}${AUTH_PATH}`, 
        username: TC_USERNAME,
        micrositeId: authBody.micrositeId 
      });
      
      const authRes = await fetch(`${base}${AUTH_PATH}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip'
        },
        body: JSON.stringify(authBody)
      });
      const authText = await authRes.text();
      let authJson; try { authJson = JSON.parse(authText); } catch (e) { authJson = null; }
      
      console.log('[TC API] Auth response:', {
        status: authRes.status,
        hasToken: !!authJson?.token,
        responseKeys: authJson ? Object.keys(authJson) : []
      });
      
      if (!authRes.ok || !authJson?.token) {
        console.error('[TC API] Auth failed:', {
          status: authRes.status,
          statusText: authRes.statusText,
          response: authJson || authText,
          url: `${base}${AUTH_PATH}`,
          username: TC_USERNAME,
          micrositeId
        });
        return res.status(authRes.status || 500).json({ 
          error: 'Auth failed', 
          detail: authJson || authText,
          status: authRes.status,
          authUrl: `${base}${AUTH_PATH}`
        });
      }
      bearer = authJson.token;
      console.log('[TC API] Auth successful, token received:', bearer ? `${bearer.substring(0, 20)}...` : 'EMPTY');
    }
    
    console.log('[TC API] Making request with token:', bearer ? `${bearer.substring(0, 20)}...` : 'EMPTY');
    // Travel Compositor uses 'auth-token' header (lowercase with dash), not Authorization Bearer
    headers['auth-token'] = bearer;

    // Build detail or info URL
    const path = info ? `${IDEAS_PATH}/${encodeURIComponent(micrositeId)}/info/${encodeURIComponent(id)}`
                      : `${IDEAS_PATH}/${encodeURIComponent(micrositeId)}/${encodeURIComponent(id)}`;
    const upstreamUrl = `${base}${path}?${params.toString()}`;

    const r = await fetch(upstreamUrl, { headers });
    const status = r.status;
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch (e) { data = null; }
    if (!r.ok) {
      return res.status(status).json({ error: 'Upstream error', status, upstreamUrl, authMode: 'bearer', detail: data || text || null });
    }

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Proxy failure', detail: e?.message || String(e) });
  }
}
