const fs = require('fs');
const files = [
  'public/index.html',
  'public/en/index.html',
  'public/security-of-blog/index.html',
  'public/en/security-of-blog/index.html',
  'public/about/index.html',
  'public/en/about/index.html',
  'public/linuxru-men/index.html',
];
for (const f of files) {
  if (!fs.existsSync(f)) { console.log(f, 'MISSING'); continue; }
  const h = fs.readFileSync(f, 'utf8');
  const m = h.match(/<li class="nav-item" id="lang-switch-btn">[\s\S]{0,2000}?<\/li>/);
  if (m) {
    const isEn = (f.indexOf('public/en/') === 0);
    const enBtnMatch = m[0].match(/href="([^"]+)"/);
    const enBtnTitle = m[0].match(/title="([^"]+)"/);
    console.log(`${f}  [en=${isEn}]  url=${enBtnMatch[1]}  title=${enBtnTitle[1]}`);
  } else {
    console.log(f, 'NO LANG BUTTON');
  }
}

// 验证 navbar 菜单没有 "English"
const idx = fs.readFileSync('public/index.html', 'utf8');
const hasEnglishLink = /class="nav-link"[^>]*target="_self"[^>]*href="\/en\/"[\s\S]{0,200}?>English</.test(idx);
console.log('\nindex.html has English navbar link:', hasEnglishLink);
