const fs = require('fs');
const h = fs.readFileSync('public/index.html', 'utf8');
const re = /<time datetime="([^"]+)" pubdate>[\s\S]{0,2000}?href="([^"]+)"/g;
let m;
while ((m = re.exec(h))) {
  console.log(m[1], '->', m[2]);
}
