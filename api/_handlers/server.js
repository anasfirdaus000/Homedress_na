import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from .env.local (check both current and parent dir)
const possibleEnvPaths = [
  join(__dirname, '.env.local'),
  join(__dirname, '../.env.local'),
  join(process.cwd(), '.env.local'),
  join(process.cwd(), '../.env.local')
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  if (existsSync(envPath)) {
    try {
      const envContent = readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) return;
        const key = trimmed.substring(0, eqIdx).trim();
        const value = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = value;
      });
      console.log(`✅ Loaded env from ${envPath}`);
      envLoaded = true;
      break;
    } catch (e) {
      console.error(`Failed to read env from ${envPath}:`, e.message);
    }
  }
}

if (!envLoaded) {
  console.warn('⚠️ No .env.local found. Ensure Supabase credentials are set in environment.');
}

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
  const url = new URL(req.url, `http://localhost:3003`);
  const path = url.pathname;
  
  // Attach query params to req.query (Vercel style)
  req.query = Object.fromEntries(url.searchParams);

  // Parse body for methods that might have one
  const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (hasBody) {
    let body = '';
    for await (const chunk of req) body += chunk;
    try { 
      req.body = body ? JSON.parse(body) : {}; 
    } catch { 
      req.body = {}; 
    }
  } else {
    req.body = {};
  }

  // Helper to send JSON
  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
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

  // Routing
  try {
    // Basic mapping
    const routes = {
      '/api/checkout': 'checkout',
      '/api/track': 'track',
      '/api/products': 'products',
      '/api/hero': 'hero',
      '/api/categories': 'categories',
      '/api/featured': 'featured',
      '/api/menus': 'menus',
      '/api/search': 'search'
    };

    let handlerName = routes[path];
    
    // Handle admin routes
    if (!handlerName && path.startsWith('/api/admin/')) {
      const adminSub = path.replace('/api/admin/', '');
      handlerName = `admin/${adminSub}`;
    }

    if (handlerName) {
      const handler = await loadHandler(handlerName);
      if (handler) {
        // Mock Vercel res object
        const mockRes = {
          ...res,
          status: (code) => {
            res.statusCode = code;
            return {
              json: (data) => sendJSON(code, data),
              end: () => res.end(),
              send: (data) => {
                res.writeHead(code);
                res.end(data);
              }
            };
          },
          setHeader: res.setHeader.bind(res),
          json: (data) => sendJSON(res.statusCode || 200, data)
        };
        return handler(req, mockRes);
      }
    }

    sendJSON(404, { error: `API endpoint ${path} not found` });
  } catch (err) {
    console.error('Server error:', err);
    sendJSON(500, { error: 'Internal server error' });
  }
});

const PORT = 3003;
const HOST = '127.0.0.1';
server.listen(PORT, HOST, () => {
  console.log(`\n🚀 API Server running at http://${HOST}:${PORT}`);
});
