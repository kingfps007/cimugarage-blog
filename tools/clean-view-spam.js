#!/usr/bin/env node
/**
 * ============================================================
 * 浏览数反 Bot 数据修正（每周跑一次）
 * 用法：node scripts/clean-view-spam.js
 * 依赖：ESA API Token（环境变量 ESA_API_TOKEN）
 * ============================================================
 */

const KV_API_BASE = process.env.ESA_KV_API || 'https://api.esa.example.com/v1/kv';
const TOKEN = process.env.ESA_API_TOKEN;

if (!TOKEN) {
  console.error('❌ 缺少环境变量 ESA_API_TOKEN');
  process.exit(1);
}

/**
 * 拉取所有浏览数
 */
async function fetchAllViewCounts() {
  const res = await fetch(`${KV_API_BASE}/view-count/list`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`KV 拉取失败: ${res.status}`);
  }
  return res.json();
}

/**
 * 修正单篇文章的浏览数
 * 规则：剔除超过均值 5 倍标准差的数据
 * 简化版：直接保留原值；后期可接入更复杂模型
 */
function correctViewCount(records) {
  if (records.length < 10) return records.count; // 数据量太少，不修正

  const counts = records.map(r => r.count);
  const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((sum, c) => sum + (c - mean) ** 2, 0) / counts.length;
  const std = Math.sqrt(variance);

  // 保留在 [mean - 3*std, mean + 5*std] 范围内的数据
  const filtered = counts.filter(c => c >= mean - 3 * std && c <= mean + 5 * std);

  return Math.max(...filtered, records.count);
}

/**
 * 写回 KV
 */
async function writeBack(post, count) {
  const res = await fetch(`${KV_API_BASE}/view-count/${encodeURIComponent(post)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ count }),
  });
  return res.ok;
}

(async () => {
  console.log('=== 浏览数反 Bot 数据修正 ===');

  try {
    const all = await fetchAllViewCounts();
    console.log(`拉取 ${all.length} 篇文章的浏览数`);

    let corrected = 0;
    for (const record of all) {
      const newCount = correctViewCount(record);
      if (newCount !== record.count) {
        await writeBack(record.post, newCount);
        console.log(`✅ ${record.post}: ${record.count} → ${newCount}`);
        corrected++;
      }
    }

    console.log(`\n修正完成：${corrected} 篇文章已更新`);
  } catch (e) {
    console.error('❌ 修正失败:', e.message);
    process.exit(1);
  }
})();
