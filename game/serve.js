// 极简静态服务器（带正确 MIME，省得浏览器拒绝 ES 模块）。
// 用：node serve.js  然后打开 http://localhost:8099/web/index.html
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const PORT = process.env.PORT || process.argv[2] || 8099;

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/' || p === '') { res.writeHead(302, { location: '/web/index.html' }); return res.end(); }
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('403'); }
  fs.readFile(file, (e, d) => {
    if (e) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(d);
  });
}).listen(PORT, () => console.log(`serving game/ → http://localhost:${PORT}/web/index.html`));
