/* Static server that mirrors Vercel's behaviour locally: cleanUrls, case-sensitive
   paths, and brotli/gzip on text. Run: node tools/qa/serve.js  ->  localhost:4321

   NOTE: this does not implement vercel.json redirects, so /Litigation 404s here
   even though it 308s to /business-law once deployed. Verify redirects against a
   Vercel preview URL, not this server. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const ROOT = require('path').join(__dirname, '..', '..', 'public');
const TYPES = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8',
 '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon','.woff2':'font/woff2',
 '.json':'application/json','.txt':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8'};
http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  // cleanUrls emulation (case-sensitive, like Vercel)
  let f = path.join(ROOT, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    if (fs.existsSync(f + '.html')) f = f + '.html';
  }
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404 ' + p); }
  const ext = path.extname(f).toLowerCase();
  const text = ['.html','.css','.js','.json','.txt','.xml','.svg'].includes(ext);
  const accept = req.headers['accept-encoding'] || '';
  const head = {'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control':'no-store'};
  if (text && /br/.test(accept)) { head['Content-Encoding']='br'; res.writeHead(200, head); return fs.createReadStream(f).pipe(zlib.createBrotliCompress()).pipe(res); }
  if (text && /gzip/.test(accept)) { head['Content-Encoding']='gzip'; res.writeHead(200, head); return fs.createReadStream(f).pipe(zlib.createGzip()).pipe(res); }
  res.writeHead(200, head);
  fs.createReadStream(f).pipe(res);
}).listen(4321, ()=>console.log('http://localhost:4321'));
