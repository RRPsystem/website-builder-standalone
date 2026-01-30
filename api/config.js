// API endpoint to provide client-side configuration
// This safely exposes only public keys (anon key, not service key)

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return only public configuration
  // NEVER expose service role key or other secrets here
  return res.status(200).json({
    SUPABASE_URL: process.env.SUPABASE_URL || 'https://huaaogdxxdcakxryecnw.supabase.co',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    // Add other public config as needed
    APP_NAME: 'Standalone Builder',
    VERSION: '1.0.0'
  });
}
