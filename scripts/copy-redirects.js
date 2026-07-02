// copy-redirects.js
// 把根目录的 _redirects 复制到 public/（ESA Pages 需要在静态资源目录下）
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', '_redirects');
const dst = path.join(__dirname, '..', 'public', '_redirects');

if (!fs.existsSync(src)) {
  console.log('[copy-redirects] _redirects not found, skipping');
  process.exit(0);
}
if (!fs.existsSync(path.dirname(dst))) {
  console.log('[copy-redirects] public/ not found, skipping');
  process.exit(0);
}
fs.copyFileSync(src, dst);
console.log('[copy-redirects] copied _redirects → public/_redirects');
