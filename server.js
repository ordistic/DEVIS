/**
 * DARI LUXE ERP — Production Web & PWA Server
 * Pure, high-performance static server with security headers,
 * path-traversal prevention, and service worker offline caching support.
 * Primary Database: Supabase Cloud PostgreSQL & Client-Side PWA Storage.
 * 
 * Serves the erp/ directory as the single source of truth.
 * Sensitive files are explicitly blocked from public access.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
// Serve from erp/ directory (single source of truth — no more public/ duplication)
const PUBLIC_DIR = __dirname;

// Files that must NEVER be served publicly for security
const FORBIDDEN_PATTERNS = [
  'server.js',
  'package.json',
  'package-lock.json',
  '.env',
  '.env.local',
  'node_modules',
  'supabase_schema.sql',
  '.sql',
  '.rar',
  '.zip',
  '.7z',
  'migrations',
  'BASELINE_AUDIT_REPORT.md',
  '.gitignore',
  'README.md'
];

// MIME types — strictly safe, approved web assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

function isForbiddenPath(decodedPath) {
  const lowerPath = decodedPath.toLowerCase();
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (lowerPath.includes(pattern.toLowerCase())) return true;
  }
  return false;
}

function safeStaticPath(urlPathname) {
  try {
    const decoded = decodeURIComponent(urlPathname);
    // SECURITY: Reject any path containing directory traversal attempts
    if (decoded.includes('..') || urlPathname.includes('..') || decoded.includes('\\')) {
      return null;
    }
    const normalized = path.posix.normalize('/' + decoded);
    const targetFile = normalized === '/' ? 'index.html' : normalized.replace(/^\//, '');
    const resolved = path.resolve(PUBLIC_DIR, targetFile);
    const publicResolved = path.resolve(PUBLIC_DIR);
    if (!resolved.startsWith(publicResolved + path.sep) && resolved !== publicResolved) {
      return null;
    }
    // SECURITY: Block sensitive files
    if (isForbiddenPath(resolved)) {
      return null;
    }
    return resolved;
  } catch (e) {
    return null;
  }
}

const server = http.createServer((req, res) => {
  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // 1. Health check & status
  if (pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      brand: 'DARI LUXE ERP',
      database: 'Supabase Cloud & Offline PWA',
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 2. Static File Serving from erp/ (single source of truth)
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  const filePath = safeStaticPath(pathname);
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = { 'Content-Type': contentType };

    if (pathname === '/sw.js') {
      headers['Service-Worker-Allowed'] = '/';
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('================================================================');
  console.log('   DARI LUXE ERP — Serveur Web & PWA / خادم الويب والتطبيق');
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Static Directory: ${PUBLIC_DIR} (erp/ — Single Source of Truth)`);
  console.log('   Database: Supabase Cloud PostgreSQL (Local SQLite removed)');
  console.log('================================================================');
});
