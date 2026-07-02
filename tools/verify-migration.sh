#!/bin/bash
# ============================================================
# 迁移验证：Halo 原文 vs Hexo 新版
# 用法：bash scripts/verify-migration.sh <halo-url> <hexo-path>
#
# 检查项：
#   1. 字数差异（±10% 容差）
#   2. 图片数量
#   3. 标题数量
#   4. 代码块数量
#
# 要求：WSL / Git Bash，不在 PowerShell 运行
# ============================================================

set -e

if [[ $# -ne 2 ]]; then
  echo "用法: $0 <halo-url> <hexo-path>"
  echo "示例: $0 https://cimugarage.cn/archives/security-of-blog/ source/_posts/2026-07-02-security-of-blog/index.md"
  exit 1
fi

HALO_URL=$1
HEXO_PATH=$2

if [[ ! -f "$HEXO_PATH" ]]; then
  echo "❌ Hexo 文件不存在: $HEXO_PATH"
  exit 1
fi

echo "=== 迁移验证 ==="
echo "Halo URL: $HALO_URL"
echo "Hexo 路径: $HEXO_PATH"
echo ""

# 1. 字数
halo_html=$(curl -sf "$HALO_URL" || echo "")
if [[ -z "$halo_html" ]]; then
  echo "⚠️ Halo URL 抓取失败（可能是迁移后已下线），跳过字数检查"
else
  halo_text=$(echo "$halo_html" | python3 -c "import sys, re; t=re.sub(r'<script.*?</script>', '', sys.stdin.read(), flags=re.S); t=re.sub(r'<style.*?</style>', '', t, flags=re.S); t=re.sub(r'<[^>]+>', ' ', t); t=re.sub(r'\s+', ' ', t); print(len(t.strip()))")
  hexo_text=$(cat "$HEXO_PATH" | python3 -c "import sys, re; t=re.sub(r'<[^>]+>', ' ', sys.stdin.read()); t=re.sub(r'\s+', ' ', t); print(len(t.strip()))")
  diff=$(( halo_text > hexo_text ? halo_text - hexo_text : hexo_text - halo_text ))
  threshold=$(( halo_text / 10 ))
  if [[ $diff -gt $threshold ]]; then
    echo "❌ 字数差异过大: halo=$halo_text hexo=$hexo_text 差异=$diff 阈值=$threshold"
    exit 1
  else
    echo "✅ 字数一致: halo=$halo_text hexo=$hexo_text 差异=$diff"
  fi
fi

# 2. 图片
if [[ -n "$halo_html" ]]; then
  halo_imgs=$(echo "$halo_html" | grep -oc '<img' || echo 0)
  hexo_imgs=$(grep -c '!\[' "$HEXO_PATH" || echo 0)
  if [[ "$halo_imgs" != "$hexo_imgs" ]]; then
    echo "⚠️ 图片数差异: halo=$halo_imgs hexo=$hexo_imgs"
  else
    echo "✅ 图片数一致: $halo_imgs"
  fi
fi

# 3. 标题（H2）
if [[ -n "$halo_html" ]]; then
  halo_h2=$(echo "$halo_html" | grep -oc '<h2' || echo 0)
  hexo_h2=$(grep -c '^## ' "$HEXO_PATH" || echo 0)
  if [[ "$halo_h2" != "$hexo_h2" ]]; then
    echo "⚠️ H2 数量差异: halo=$halo_h2 hexo=$hexo_h2"
  else
    echo "✅ H2 数量一致: $halo_h2"
  fi
fi

# 4. 代码块
halo_code=$(echo "$halo_html" | grep -oc '<pre' || echo 0)
hexo_code=$(grep -c '^```' "$HEXO_PATH" || echo 0)
hexo_code=$((hexo_code / 2))
if [[ "$halo_code" != "$hexo_code" ]]; then
  echo "⚠️ 代码块数差异: halo=$halo_code hexo=$hexo_code"
else
  echo "✅ 代码块数一致: $halo_code"
fi

echo ""
echo "=== 验证完成 ==="
