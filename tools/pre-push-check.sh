#!/usr/bin/env bash
# ============================================================
# 预推送本地验证（pre-push）
# Fluid 主题版：只检查硬性要求（页面/URL/合规）
# hreflang / lang-switch 留待 P3 打磨
# ============================================================
set -e

cd "$(dirname "$0")/.."

echo "==> 1/4 hexo clean"
npx hexo clean

echo "==> 2/4 hexo generate"
npx hexo generate

echo "==> 3/4 关键页面存在性检查"
REQUIRED=(
  "public/index.html"
  "public/about/index.html"
  "public/about/privacy/index.html"
  "public/404.html"
  "public/archives/index.html"
  "public/en/index.html"
  "public/en/about/index.html"
  "public/en/about/privacy/index.html"
  "public/en/404.html"
  "public/en/archives/index.html"
  "public/security-of-blog/index.html"
  "public/en/security-of-blog/index.html"
)
MISSING=0
for f in "${REQUIRED[@]}"; do
  if [ ! -f "$f" ]; then
    echo "   ❌ 缺失: $f"
    MISSING=$((MISSING+1))
  fi
done
if [ $MISSING -gt 0 ]; then
  echo "==> 失败: ${MISSING} 个关键页面缺失"
  exit 1
fi
echo "   ✅ 10 个关键页面齐全"

echo "==> 4/4 URL 与合规检查"
ERRORS=0

# 检查双斜杠（// 出现在 href 中）
DUP_SLASH=$(grep -rE 'href="//' public/ 2>/dev/null | grep -v 'target="_blank"' | grep -v '//github.com\|//at.alicdn.com' | wc -l | tr -d ' ')
if [ "$DUP_SLASH" -gt 0 ]; then
  echo "   ❌ 发现 $DUP_SLASH 处 href=\"// 协议相对 URL"
  grep -rE 'href="//' public/ 2>/dev/null | grep -v '//github.com' | head -3
  ERRORS=$((ERRORS+1))
fi

# 检查本站是否还有 at.alicdn.com（iconfont CDN）引用
ALI_CDN=$(grep -rE 'at\.alicdn\.com' public/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$ALI_CDN" -gt 0 ]; then
  echo "   ❌ 发现 $ALI_CDN 处 at.alicdn.com 公共 CDN 引用（应本地化）"
  grep -rE 'at\.alicdn\.com' public/ 2>/dev/null | head -3
  ERRORS=$((ERRORS+1))
fi

# 检查 jsdelivr CDN
JSDELIVR=$(grep -rE 'jsdelivr' public/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$JSDELIVR" -gt 0 ]; then
  echo "   ❌ 发现 $JSDELIVR 处 jsdelivr 引用"
  ERRORS=$((ERRORS+1))
fi

# 检查备案号
if ! grep -q '晋ICP备2026000871号-1' public/index.html; then
  echo "   ❌ 首页缺备案号"
  ERRORS=$((ERRORS+1))
fi
if ! grep -q '晋ICP备2026000871号-1' public/about/index.html; then
  echo "   ❌ 关于页缺备案号"
  ERRORS=$((ERRORS+1))
fi

if [ $ERRORS -gt 0 ]; then
  echo "==> 失败: ${ERRORS} 处问题"
  exit 1
fi
echo "   ✅ URL 与合规全部通过"

echo "==> 全部通过 ✅"
