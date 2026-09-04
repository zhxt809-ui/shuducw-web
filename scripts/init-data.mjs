#!/usr/bin/env node
/**
 * 数据初始化脚本
 *
 * 用途：创建本地数据目录和空的 JSON 数据文件（articles.json / consultations.json）。
 * 运行：node scripts/init-data.mjs
 *
 * 数据迁移（从 Supabase 迁移已有文章）：
 * 1. 在 Supabase SQL Editor 执行导出查询：
 *    SELECT id, title, slug, category, summary, content, cover_image,
 *           is_published, sort_order, published_at, created_at, updated_at
 *    FROM articles ORDER BY id;
 * 2. 将结果保存为 JSON 数组，写入 data/articles.json
 * 3. 重新部署或重启服务即可生效
 */
import { mkdir, writeFile, access } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

async function ensureDataFile(fileName, initialContent) {
  const filePath = path.join(dataDir, fileName);
  try {
    await access(filePath);
    console.log(`[skip] ${filePath} 已存在`);
  } catch {
    await writeFile(filePath, initialContent, 'utf-8');
    console.log(`[ok]   ${filePath} 已创建`);
  }
}

async function main() {
  await mkdir(dataDir, { recursive: true });
  console.log(`[ok]   数据目录: ${dataDir}`);

  await ensureDataFile('articles.json', '[]\n');
  await ensureDataFile('consultations.json', '[]\n');

  console.log('\n初始化完成。');
  console.log('提示：如有 Supabase 存量文章，请按脚本头部说明迁移到 data/articles.json。');
}

main().catch((err) => {
  console.error('初始化失败:', err);
  process.exit(1);
});
