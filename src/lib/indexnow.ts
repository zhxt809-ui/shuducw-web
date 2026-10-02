/**
 * IndexNow 单条流式提交（Bing / Yandex / Naver / Seznam）。
 *
 * 依据《Bing Webmaster Guidelines》第 4 节原文：
 *   "Use IndexNow to notify Bing when: URLs are added / Content is updated / URLs are removed.
 *    Avoid batch submissions when possible. Streaming submissions provide faster updates,
 *    reduce server load, and improve indexing accuracy."
 *
 * 因此本模块**逐条提交**（单条 GET 形式），不接收批量列表、不做全量推送；
 * 由文章发布/更新/删除接口在动作发生时即时调用。
 *
 * 2026-10-02 说明：此前用 ops/content/submit-indexnow-from-sitemap.py 做过两次"全量 55 条"
 * 批量提交，与官方"避免批量提交"的建议相反，已废弃该用法；脚本保留仅用于极端情况下的全站重建。
 */

const HOST = 'www.shuducw.com';
// IndexNow 的 key 是公钥（按协议必须公开发布在 /<key>.txt），不是机密；仓库内出现不构成泄漏。
const KEY = '9c615d0ffcf44fd4a1c860a302b08850';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

export function articleUrl(slug: string): string {
  return `https://${HOST}/news/${slug}`;
}

export function categoryUrl(category: string): string {
  return `https://${HOST}/news/${category}`;
}

/** 单条提交（流式）。返回是否被 IndexNow 接受。 */
async function submitOne(url: string): Promise<boolean> {
  const target = `${ENDPOINT}?url=${encodeURIComponent(url)}&key=${KEY}&keyLocation=${encodeURIComponent(KEY_LOCATION)}`;
  try {
    const res = await fetch(target, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ShuduIndexNow/1.0)' },
      signal: AbortSignal.timeout(10_000),
    });
    // 200 = 已接收；202 = 已接收待处理；422 = URL 不属于该 host 或 key 不匹配
    const ok = res.status === 200 || res.status === 202;
    console.log(`[IndexNow] ${ok ? '已接收' : `未接收(${res.status})`} ${url}`);
    return ok;
  } catch (error) {
    console.warn('[IndexNow] 提交失败（不影响发布）:', url, String(error).slice(0, 120));
    return false;
  }
}

/**
 * 逐条提交一组 URL。
 * 调用方一律用 `void submitToIndexNow([...])` 触发，绝不 await——提交通知不能拖慢或影响发布接口。
 */
export async function submitToIndexNow(urls: string[]): Promise<void> {
  if (process.env.INDEXNOW_DISABLED === '1') return;
  // 本地 dev 默认不发真实提交通知（除非显式 INDEXNOW_FORCE=1）
  if (process.env.NODE_ENV !== 'production' && process.env.INDEXNOW_FORCE !== '1') return;

  const unique = Array.from(new Set(urls.filter((u) => u.startsWith(`https://${HOST}/`))));
  for (const url of unique) {
    await submitOne(url);
    // 逐条之间留出间隔，避免被判定为批量提交
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
