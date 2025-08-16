// Simple Express server with compression to serve dist/ with proper content-encoding
// Useful for running Lighthouse locally with text compression enabled
import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4173;
const distDir = path.resolve(__dirname, 'dist');

app.use(compression());

// Serve precompressed assets when available
// Many CDNs/servers will do this automatically based on .gz/.br files and Accept-Encoding
app.get(/\.(js|css|html|svg|json|xml|txt|woff2?)$/, (req, res, next) => {
  const ae = req.headers['accept-encoding'] || '';
  if (ae.includes('br')) {
    req.url = req.url + '.br';
    res.set('Content-Encoding', 'br');
  } else if (ae.includes('gzip')) {
    req.url = req.url + '.gz';
    res.set('Content-Encoding', 'gzip');
  }
  next();
});

app.use(express.static(distDir, { setHeaders: (res, filePath) => {
  if (filePath.endsWith('.gz')) res.setHeader('Content-Type', contentTypeFor(filePath.slice(0, -3)));
  if (filePath.endsWith('.br')) res.setHeader('Content-Type', contentTypeFor(filePath.slice(0, -3)));
}}));

app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

function contentTypeFor(file) {
  if (file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.svg')) return 'image/svg+xml; charset=utf-8';
  if (file.endsWith('.json')) return 'application/json; charset=utf-8';
  if (file.endsWith('.xml')) return 'application/xml; charset=utf-8';
  if (file.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (file.endsWith('.woff')) return 'font/woff';
  if (file.endsWith('.woff2')) return 'font/woff2';
  return 'application/octet-stream';
}
