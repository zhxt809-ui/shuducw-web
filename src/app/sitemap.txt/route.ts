import { NextResponse } from 'next/server';
import {
  getSitemapEntries,
  renderSitemapTxt,
  buildEtag,
  latestLastModified,
  isNotModified,
} from '@/lib/sitemap-data';

/**
 * 站点地图纯文本格式（每行一个网址）
 * 百度搜索资源平台的 sitemap 协议支持 txt 与 xml 两种格式，txt 常作为 XML 提交失败时的备选；
 * 360、搜狗 同样支持该格式。内容与 /sitemap.xml 同源，不会漂移。
 * 同样支持 ETag / 304，便于搜索引擎高效判断内容是否更新。
 */
export const revalidate = 300;

export async function GET(request: Request) {
  const entries = await getSitemapEntries();
  const txt = renderSitemapTxt(entries);
  const etag = buildEtag(txt);
  const lastModified = latestLastModified(entries);

  const headers: Record<string, string> = {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
    ETag: etag,
    'Last-Modified': lastModified,
  };

  if (isNotModified(request, etag)) {
    return new NextResponse(null, { status: 304, headers });
  }

  return new NextResponse(txt, { status: 200, headers });
}
