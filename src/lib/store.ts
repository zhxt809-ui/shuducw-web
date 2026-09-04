/**
 * 本地文件存储适配层（默认后端）
 *
 * 用途：将财税资讯文章与预约咨询记录存储为服务器本地 JSON 文件，
 * 替代海外 Supabase，满足"数据迁回国内"的合规要求，并适合 2核2G 轻量服务器部署。
 *
 * 通过环境变量 DATA_STORE 切换后端：
 * - DATA_STORE=file（默认）: 本地 JSON 文件存储，数据目录由 DATA_DIR 指定（默认 ./data）
 * - DATA_STORE=supabase   : 沿用原有 Supabase 存储（兼容过渡期使用）
 *
 * 数据文件：
 * - <DATA_DIR>/articles.json      财税资讯文章
 * - <DATA_DIR>/consultations.json 预约咨询记录
 *
 * 说明：低并发内容站场景下 JSON 文件存储完全够用；如需更高性能，
 * 可平滑替换为 SQLite/PostgreSQL，接口保持不变。
 */
import { promises as fs } from 'fs';
import path from 'path';

export type ArticleCategory = 'cases' | 'tips' | 'policies';

export interface Article {
  id: number;
  title: string;
  slug: string;
  category: ArticleCategory | string;
  summary: string | null;
  content: string;
  cover_image: string | null;
  keywords?: string | null;
  is_published: boolean;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: number;
  company_name: string;
  phone: string;
  content: string;
  status: 'pending' | 'contacted' | 'closed';
  created_at: string;
}

export interface ListArticlesParams {
  category?: string;
  publishedOnly?: boolean;
  limit?: number;
  offset?: number;
}

function getDataDir(): string {
  return process.env.DATA_DIR || path.join(process.cwd(), 'data');
}

function getArticlesFile(): string {
  return path.join(getDataDir(), 'articles.json');
}

function getConsultationsFile(): string {
  return path.join(getDataDir(), 'consultations.json');
}

/** 确保数据目录与文件存在 */
async function ensureFile(filePath: string, initial: unknown[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/** 简单的进程内写入串行化，避免并发提交互相覆盖 */
const writeQueue: Promise<unknown>[] = [];

function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const prev = writeQueue.length ? writeQueue[writeQueue.length - 1] : Promise.resolve();
  const run = prev.then(task, task);
  writeQueue.push(run);
  run.finally(() => {
    const idx = writeQueue.indexOf(run);
    if (idx >= 0) writeQueue.splice(idx, 1);
  });
  return run;
}

/* ==================== 文章 ==================== */

export async function listArticles(params: ListArticlesParams = {}): Promise<Article[]> {
  const { category, publishedOnly = true, limit = 50, offset = 0 } = params;
  const file = getArticlesFile();
  await ensureFile(file, []);
  const articles = await readJson<Article[]>(file, []);

  let result = [...articles];
  if (publishedOnly) {
    result = result.filter((a) => a.is_published);
  }
  if (category) {
    result = result.filter((a) => a.category === category);
  }
  // 排序：sort_order 降序 → published_at 降序 → id 降序
  result.sort((a, b) => {
    if (a.sort_order !== b.sort_order) return (b.sort_order ?? 0) - (a.sort_order ?? 0);
    const pa = a.published_at ? new Date(a.published_at).getTime() : 0;
    const pb = b.published_at ? new Date(b.published_at).getTime() : 0;
    if (pa !== pb) return pb - pa;
    return b.id - a.id;
  });

  return result.slice(offset, offset + limit);
}

export async function countArticles(params: { category?: string; publishedOnly?: boolean } = {}): Promise<number> {
  const { category, publishedOnly = true } = params;
  const file = getArticlesFile();
  await ensureFile(file, []);
  const articles = await readJson<Article[]>(file, []);
  let result = articles;
  if (publishedOnly) result = result.filter((a) => a.is_published);
  if (category) result = result.filter((a) => a.category === category);
  return result.length;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const file = getArticlesFile();
  await ensureFile(file, []);
  const articles = await readJson<Article[]>(file, []);
  return articles.find((a) => a.slug === slug) || null;
}

export async function getArticleById(id: number): Promise<Article | null> {
  const file = getArticlesFile();
  await ensureFile(file, []);
  const articles = await readJson<Article[]>(file, []);
  return articles.find((a) => a.id === id) || null;
}

export async function createArticle(data: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<Article> {
  return enqueueWrite(async () => {
    const file = getArticlesFile();
    await ensureFile(file, []);
    const articles = await readJson<Article[]>(file, []);
    const now = new Date().toISOString();
    const id = articles.reduce((max, a) => Math.max(max, a.id), 0) + 1;
    const article: Article = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    };
    articles.push(article);
    await writeJson(file, articles);
    return article;
  });
}

export async function updateArticle(id: number, patch: Partial<Omit<Article, 'id' | 'created_at'>>): Promise<Article | null> {
  return enqueueWrite(async () => {
    const file = getArticlesFile();
    await ensureFile(file, []);
    const articles = await readJson<Article[]>(file, []);
    const idx = articles.findIndex((a) => a.id === id);
    if (idx < 0) return null;
    const updated: Article = {
      ...articles[idx],
      ...patch,
      id,
      updated_at: new Date().toISOString(),
    };
    articles[idx] = updated;
    await writeJson(file, articles);
    return updated;
  });
}

export async function deleteArticle(id: number): Promise<boolean> {
  return enqueueWrite(async () => {
    const file = getArticlesFile();
    await ensureFile(file, []);
    const articles = await readJson<Article[]>(file, []);
    const idx = articles.findIndex((a) => a.id === id);
    if (idx < 0) return false;
    articles.splice(idx, 1);
    await writeJson(file, articles);
    return true;
  });
}

export async function slugExists(slug: string, excludeId?: number): Promise<boolean> {
  const file = getArticlesFile();
  await ensureFile(file, []);
  const articles = await readJson<Article[]>(file, []);
  return articles.some((a) => a.slug === slug && a.id !== excludeId);
}

/* ==================== 咨询 ==================== */

export async function listConsultations(limit = 100): Promise<Consultation[]> {
  const file = getConsultationsFile();
  await ensureFile(file, []);
  const items = await readJson<Consultation[]>(file, []);
  return items
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export async function countConsultations(): Promise<number> {
  const file = getConsultationsFile();
  await ensureFile(file, []);
  const items = await readJson<Consultation[]>(file, []);
  return items.length;
}

export async function createConsultation(data: {
  company_name: string;
  phone: string;
  content: string;
}): Promise<Consultation> {
  return enqueueWrite(async () => {
    const file = getConsultationsFile();
    await ensureFile(file, []);
    const items = await readJson<Consultation[]>(file, []);
    const id = items.reduce((max, c) => Math.max(max, c.id), 0) + 1;
    const item: Consultation = {
      id,
      company_name: data.company_name,
      phone: data.phone,
      content: data.content,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    items.push(item);
    await writeJson(file, items);
    return item;
  });
}

/* ==================== 健康检查 ==================== */

export async function healthCheck(): Promise<{
  status: 'ok' | 'degraded';
  backend: 'file';
  dataDir: string;
  articlesFile: boolean;
  consultationsFile: boolean;
  articlesCount: number;
  consultationsCount: number;
}> {
  const articlesFile = getArticlesFile();
  const consultationsFile = getConsultationsFile();
  await ensureFile(articlesFile, []);
  await ensureFile(consultationsFile, []);

  const articles = await readJson<Article[]>(articlesFile, []);
  const consultations = await readJson<Consultation[]>(consultationsFile, []);

  return {
    status: 'ok',
    backend: 'file',
    dataDir: getDataDir(),
    articlesFile: true,
    consultationsFile: true,
    articlesCount: articles.length,
    consultationsCount: consultations.length,
  };
}
