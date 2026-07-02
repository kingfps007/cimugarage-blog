#!/usr/bin/env bash
# ============================================================
# 预推送本地验证（pre-push）
# - 清空 → 构建 → 检查关键页面 → 检查 URL 完整性
# - 任意一步失败 → 退出 1，阻止推送
# ============================================================
set -e

cd "$(dirname "$0")/.."

echo "==> 1/4 hexo clean"
npx hexo clean > /dev/null

echo "==> 2/4 hexo generate"
npx hexo generate > /dev/null

echo "==> 3/4 关键页面存在性检查"
# 必须存在的 10 个关键页面
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

echo "==> 4/4 URL 完整性检查"
ERRORS=0

# 检查双斜杠（// 出现在 href 中）
DUP_SLASH=$(grep -rE 'href="//' public/ 2>/dev/null | grep -v 'target="_blank"' | wc -l | tr -d ' ')
if [ "$DUP_SLASH" -gt 0 ]; then
  echo "   ❌ 发现 $DUP_SLASH 处 href=\"// 协议相对 URL"
  grep -rE 'href="//' public/ 2>/dev/null | head -3
  ERRORS=$((ERRORS+1))
fi

# 检查 hreflang 完整性（每个有 lang 属性的页面都应该有 zh + en + x-default）
for f in public/index.html public/about/index.html public/about/privacy/index.html public/404.html public/archives/index.html public/en/index.html public/en/about/index.html public/en/about/privacy/index.html public/en/404.html public/en/archives/index.html; do
  if [ ! -f "$f" ]; then continue; fi
  HAS_ZH=$(grep -c 'hreflang="zh-CN"' "$f" || true)
  HAS_EN=$(grep -c 'hreflang="en"' "$f" || true)
  HAS_XDEF=$(grep -c 'hreflang="x-default"' "$f" || true)
  if [ "$HAS_ZH" -lt 1 ] || [ "$HAS_EN" -lt 1 ] || [ "$HAS_XDEF" -lt 1 ]; then
    echo "   ❌ $f hreflang 不全 (zh=$HAS_ZH en=$HAS_EN x=$HAS_XDEF)"
    ERRORS=$((ERRORS+1))
  fi
done

# 检查 lang-switch 是否存在
for f in public/index.html public/about/index.html public/about/privacy/index.html public/404.html public/en/index.html public/en/about/index.html public/en/about/privacy/index.html public/en/404.html; do
  if [ ! -f "$f" ]; then continue; fi
  if ! grep -q 'class="lang-switch"' "$f"; then
    echo "   ❌ $f 缺 lang-switch"
    ERRORS=$((ERRORS+1))
  fi
done

# 检查备案号
if ! grep -q '晋ICP备2026000871号-1' public/index.html; then
  echo "   ❌ 首页缺备案号"
  ERRORS=$((ERRORS+1))
fi

if [ $ERRORS -gt 0 ]; then
  echo "==> 失败: ${ERRORS} 处 URL/SEO 问题"
  exit 1
fi
echo "   ✅ URL/SEO 全部通过"

echo "==> 全部通过 ✅"
