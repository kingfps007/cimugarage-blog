#!/bin/bash
# ============================================================
# 双语一致性检查
# 用法：bash scripts/check-bilingual.sh
# 检查项：category / tags / date / updated 字段在双语版中必须完全一致
# ============================================================

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
POSTS_DIR="$ROOT_DIR/source/_posts"

error_count=0
checked_count=0

for post_dir in "$POSTS_DIR"/*/; do
  # 跳过 _drafts / _开头的目录
  basename=$(basename "$post_dir")
  if [[ "$basename" == _* ]]; then continue; fi

  index_md="$post_dir/index.md"
  en_md="$post_dir/en.md"

  if [[ ! -f "$index_md" ]] || [[ ! -f "$en_md" ]]; then
    continue
  fi

  checked_count=$((checked_count + 1))

  for field in category tags date updated; do
    zh=$(grep -E "^${field}:" "$index_md" | head -1 | sed "s/^${field}:[[:space:]]*//")
    en=$(grep -E "^${field}:" "$en_md" | head -1 | sed "s/^${field}:[[:space:]]*//")

    if [[ -z "$zh" ]]; then
      echo "❌ $basename: 缺少 $field 字段（中文版）"
      error_count=$((error_count + 1))
      continue
    fi

    if [[ -z "$en" ]]; then
      echo "❌ $basename: 缺少 $field 字段（英文版）"
      error_count=$((error_count + 1))
      continue
    fi

    if [[ "$zh" != "$en" ]]; then
      echo "❌ $basename: $field 不一致"
      echo "   中文: $zh"
      echo "   英文: $en"
      error_count=$((error_count + 1))
    fi
  done
done

echo ""
echo "检查完成：$checked_count 篇双语文章，$error_count 个错误"

if [[ $error_count -gt 0 ]]; then
  exit 1
fi
