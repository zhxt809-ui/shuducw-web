/**
 * 小红书近期笔记（服务器 data/xiaohongshu-notes.json，运行时读取）
 *
 * 为什么读服务器数据文件而不是写死在代码里：
 * - 首页为 ISR（revalidate = 60），与资讯列表一样在运行时读数据，
 *   因此**新增一条笔记只需改服务器上的 JSON 文件，约 60 秒后自动生效，无需重新构建部署**。
 * - 笔记链接必须保留分享原链的 xsec_token 参数：实测去掉 token 或改用 /explore/ 形态
 *   会被小红书重定向到 404（xsec_token 是网页端未登录可访问笔记的凭据）。
 *
 * 安全与健壮性：
 * - 只接受小红书域名（xiaohongshu.com / xhslink.com）的 https 链接，避免数据文件被写入
 *   非预期协议或站外跳转；
 * - 文件缺失、JSON 损坏、字段不合法时一律返回空数组，模块自动隐藏，绝不影响首页渲染。
 */
import { promises as fs } from 'fs';
import path from 'path';

export interface XiaohongshuNote {
  /** 笔记标题（不要带" - 数度财税"" | 小红书"等分享文案后缀） */
  title: string;
  /** 笔记链接：必须是带 xsec_token 的分享原链 */
  url: string;
  /** 可选：展示用日期，如 "2026-09" */
  date?: string;
}

const ALLOWED_HOSTS = ['www.xiaohongshu.com', 'xiaohongshu.com', 'xhslink.com', 'www.xhslink.com'];

function notesPath(): string {
  const dir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  return path.join(dir, 'xiaohongshu-notes.json');
}

function isSafeUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && ALLOWED_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

/** 读取最近笔记（默认最多 3 条；按数据文件顺序，最新的放最前） */
export async function getXiaohongshuNotes(limit = 3): Promise<XiaohongshuNote[]> {
  try {
    const raw = await fs.readFile(notesPath(), 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    const list: XiaohongshuNote[] = Array.isArray(parsed)
      ? (parsed as XiaohongshuNote[])
      : ((parsed as { notes?: XiaohongshuNote[] })?.notes ?? []);
    if (!Array.isArray(list)) return [];
    return list
      .filter(
        (n): n is XiaohongshuNote =>
          !!n &&
          typeof n.title === 'string' &&
          n.title.trim().length > 0 &&
          typeof n.url === 'string' &&
          isSafeUrl(n.url)
      )
      .slice(0, limit);
  } catch {
    return [];
  }
}
