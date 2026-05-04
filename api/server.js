/**
 * Local Development API Server
 * Emulates Vercel Serverless Functions locally
 * Run: npm run dev:api (port 3001)
 * Vite proxies /api/* to this server
 */
import { createServer } from 'http';
import { readFileSync } from 'fs';

// Load env
try {
  const envContent = readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
} catch (e) {
  console.warn('⚠️  No .env.local found, using existing env vars');
}

// Dynamic import of API handlers
const handlers = {};
async function loadHandler(name) {
  if (!handlers[name]) {
    try {
      const mod = await import(`./${name}.js`);
      handlers[name] = mod.default;
    } catch (e) {
      console.error(`Failed to load handler ${name}:`, e.message);
      return null;
    }
  }
  return handlers[name];
}

const server = createServer(async (req, res) => {
  // Parse body for POST requests
  if (req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    try { req.body = JSON.parse(body); } catch { req.body = {}; }
  }

  // Parse URL
  const url = new URL(req.url, `http://localhost:3001`);
  const path = url.pathname;

  // Helper to send JSON
  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
  };

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // Route to handler
  try {
    if (path === '/api/checkout') {
      const handler = await loadHandler('checkout');
      if (handler) return handler(req, { ...res, status: (code) => ({ json: (data) => sendJSON(code, data), end: () => res.end() }), setHeader: res.setHeader.bind(res) });
    }
    
    if (path === '/api/track') {
      const handler = await loadHandler('track');
      if (handler) return handler(req, { ...res, status: (code) => ({ json: (data) => sendJSON(code, data), end: () => res.end() }), setHeader: res.setHeader.bind(res) });
    }

    // Admin API routes
    const adminMatch = path.match(/^\/api\/admin\/(.+)$/);
    if (adminMatch) {
      const handler = await loadHandler(`admin/${adminMatch[1]}`);
      if (handler) return handler(req, { ...res, status: (code) => ({ json: (data) => sendJSON(code, data), end: () => res.end() }), setHeader: res.setHeader.bind(res) });
    }

    sendJSON(404, { error: 'API endpoint not found' });
  } catch (err) {
    console.error('Server error:', err);
    sendJSON(500, { error: 'Internal server error' });
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 API Server running at http://localhost:${PORT}`);
  console.log('   Routes:');
  console.log('   POST /api/checkout');
  console.log('   POST /api/track');
  console.log('   GET  /api/admin/orders');
  console.log('   GET  /api/admin/products');
  console.log('   GET  /api/admin/settings\n');
});
