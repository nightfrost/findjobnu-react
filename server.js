// Simple Express server with compression to serve dist/ with proper content-encoding
// Useful for running Lighthouse locally with text compression enabled
import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { accessSync, constants as fsConstants } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4173;
const distDir = path.resolve(__dirname, 'dist');

app.use(compression());

// Serve precompressed assets when available (skip rewrite if the compressed file is missing)
// Many CDNs/servers will do this automatically based on .gz/.br files and Accept-Encoding
app.get(/\.(js|css|html|svg|json|xml|txt|woff2?)$/, (req, res, next) => {
  const ae = req.headers['accept-encoding'] || '';

  const tryRewrite = (ext, encoding) => {
    const candidate = path.join(distDir, req.url + ext);
    try {
      accessSync(candidate, fsConstants.F_OK);
      req.url = req.url + ext;
      res.set('Content-Encoding', encoding);
      return true;
    } catch {
      return false;
    }
  };

  if (ae.includes('br') && tryRewrite('.br', 'br')) {
    return next();
  }
  if (ae.includes('gzip') && tryRewrite('.gz', 'gzip')) {
    return next();
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
