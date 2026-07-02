#!/bin/bash
# ============================================================
# 链接有效性检查
# 用法：bash scripts/check-links.sh
# 检查项：Markdown 中的内部 /assets/ 路径是否存在
# ============================================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/source/assets"

error_count=0

# 收集所有 /assets/ 引用
echo "扫描内部资源引用..."
references=$(grep -rhoE '/assets/[a-zA-Z0-9_/.-]+' "$ROOT_DIR/source" 2>/dev/null | sort -u)

for ref in $references; do
  # 去掉前导 /
  rel="${ref#/}"
  full_path="$ROOT_DIR/source/$rel"

  if [[ ! -f "$full_path" ]]; then
    echo "❌ 缺失资源: $ref"
    error_count=$((error_count + 1))
  fi
done

echo ""
echo "链接检查完成：$error_count 个缺失资源"

if [[ $error_count -gt 0 ]]; then
  exit 1
fi
