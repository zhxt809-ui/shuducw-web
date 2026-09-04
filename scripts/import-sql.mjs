#!/usr/bin/env node
/**
 * 从 Supabase SQL 备份迁移数据到本地 JSON 存储
 *
 * 用法：node scripts/import-sql.mjs <备份文件路径>
 * 示例：node scripts/import-sql.mjs ../database-backup.sql
 *
 * 说明：
 * - 解析 SQL 备份中的多条 INSERT INTO articles ... 语句，写入 data/articles.json
 * - 咨询记录（consultations）为测试数据，默认不迁移（生产环境建议从零开始）
 * - 数据目录可通过 DATA_DIR 环境变量指定（默认 ./data）
 */
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

function parsePgString(raw) {
  // 处理 PostgreSQL E'...' 转义字符串
  if (raw.startsWith("E'")) {
    const inner = raw.slice(2, -1);
    return inner
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\');
  }
  if (raw.startsWith("'")) {
    return raw.slice(1, -1).replace(/''/g, "'");
  }
  return null;
}

function parseValue(raw) {
  const v = raw.trim();
  if (v === 'NULL') return null;
  if (v === 'true' || v === 'TRUE') return true;
  if (v === 'false' || v === 'FALSE') return false;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  return parsePgString(v);
}

/**
 * 从 SQL 文本中提取所有 INSERT INTO <table> ... VALUES ( ... ); 语句
 * 返回 [{ fields: string[] }]
 */
function extractInsertRows(sql, tableName) {
  const statements = [];
  const regex = new RegExp(`INSERT INTO ${tableName}[\\s\\S]*?VALUES`, 'g');
  let match;
  while ((match = regex.exec(sql)) !== null) {
    // 从 VALUES 之后开始解析
    const start = match.index + match[0].length;
    // 找到该语句的结束分号（在字符串之外）
    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;
    for (let i = start; i < sql.length; i++) {
      const ch = sql[i];
      if (inString) {
        if (escape) escape = false;
        else if (ch === '\\' && sql[i - 1] === 'E' && sql[i - 2] === "'") escape = true;
        else if (ch === "'") {
          if (sql[i + 1] === "'") { i++; }
          else inString = false;
        }
        continue;
      }
      if (ch === "'") { inString = true; continue; }
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      else if (ch === ';' && depth === 0) { end = i; break; }
    }
    if (end === -1) break;

    let block = sql.slice(start, end);
    // 截断 ON CONFLICT ... DO UPDATE 子句（仅保留 VALUES 元组部分）
    const conflictIdx = findKeywordOutsideString(block, 'ON CONFLICT');
    if (conflictIdx !== -1) {
      block = block.slice(0, conflictIdx);
    }
    const rows = extractTupleRows(block);
    if (rows.length > 0) statements.push(...rows);
    regex.lastIndex = end + 1;
  }
  return statements;
}

/** 在字符串之外查找关键字位置 */
function findKeywordOutsideString(text, keyword) {
  let inString = false;
  let escape = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === "'") inString = false;
      continue;
    }
    if (ch === "'") { inString = true; continue; }
    if (ch.toUpperCase() === keyword[0] && text.slice(i, i + keyword.length).toUpperCase() === keyword) {
      return i;
    }
  }
  return -1;
}

/** 提取 VALUES 块中的所有元组行 */
function extractTupleRows(block) {
  const rows = [];
  let depth = 0;
  let current = '';
  let inString = false;
  let escape = false;

  for (let i = 0; i < block.length; i++) {
    const ch = block[i];
    if (inString) {
      current += ch;
      if (escape) escape = false;
      else if (ch === '\\' && current.startsWith("E'")) escape = true;
      else if (ch === "'") {
        if (block[i + 1] === "'") { current += "'"; i++; }
        else inString = false;
      }
      continue;
    }
    if (ch === "'") { inString = true; current += ch; continue; }
    if (ch === '(') { depth++; if (depth === 1) { current = ''; continue; } }
    if (ch === ')') {
      depth--;
      if (depth === 0) { rows.push(current); continue; }
    }
    if (ch === ',' && depth === 0) continue;
    current += ch;
  }
  return rows;
}

/** 将元组行拆分为字段数组 */
function splitFields(row) {
  const fields = [];
  let f = '';
  let fString = false;
  let fEscape = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (fString) {
      f += ch;
      if (fEscape) fEscape = false;
      else if (ch === '\\' && f.startsWith("E'")) fEscape = true;
      else if (ch === "'") {
        if (row[i + 1] === "'") { f += "'"; i++; }
        else fString = false;
      }
      continue;
    }
    if (ch === "'") { fString = true; f += ch; continue; }
    if (ch === ',') { fields.push(f.trim()); f = ''; continue; }
    f += ch;
  }
  fields.push(f.trim());
  return fields;
}

async function main() {
  const backupFile = process.argv[2];
  if (!backupFile) {
    console.error('用法: node scripts/import-sql.mjs <备份SQL文件路径>');
    process.exit(1);
  }

  const sql = await readFile(backupFile, 'utf-8');
  const rows = extractInsertRows(sql, 'articles');

  if (rows.length === 0) {
    console.error('未找到 articles 表的 INSERT 语句');
    process.exit(1);
  }

  const articles = rows.map((row) => {
    const fields = splitFields(row).map(parseValue);
    const [
      id, title, slug, category, summary, content, cover_image,
      keywords, is_published, sort_order, published_at, created_at, updated_at,
    ] = fields;

    return {
      id,
      title,
      slug,
      category,
      summary,
      content,
      cover_image,
      keywords: keywords || '',
      is_published,
      sort_order,
      published_at,
      created_at,
      updated_at,
    };
  });

  // 按 id 排序
  articles.sort((a, b) => a.id - b.id);

  await mkdir(dataDir, { recursive: true });
  const articlesPath = path.join(dataDir, 'articles.json');
  await writeFile(articlesPath, JSON.stringify(articles, null, 2) + '\n', 'utf-8');

  console.log(`✅ 已迁移 ${articles.length} 篇文章到 ${articlesPath}`);
  articles.forEach((a) => {
    const status = a.is_published ? '已发布' : '草稿';
    console.log(`   - [${a.category}] ${a.title} (id=${a.id}, ${status})`);
  });

  // 咨询记录统计（仅提示，不迁移）
  const consultRows = extractInsertRows(sql, 'consultations');
  console.log(`\nℹ️  咨询记录 ${consultRows.length} 条（测试/历史数据，未迁移到生产环境）`);
}

main().catch((err) => {
  console.error('迁移失败:', err);
  process.exit(1);
});
