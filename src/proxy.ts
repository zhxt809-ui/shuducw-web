import { NextRequest, NextResponse } from 'next/server';

/**
 * 旧版静态页面 URL 的 301 归位规则。
 *
 * 背景（2026-10-06 实测）：
 *   本站改版前是静态 HTML 站点，旧版 `/index.html` 一类地址在第三方仍留有痕迹——
 *   nginx 日志显示 360Spider 在 9/22–10/6 期间请求 `/index.html` 共 54 次（一直 404），
 *   Googlebot 也请求过 1 次。放任 404 会让这些来源的访客与爬虫都拿不到页面。
 *
 * 采用**原则性规则**而不是逐个猜文件名：
 *   `/xxx.html` → 301 → `/xxx`；`/index.html` → 301 → `/`；同样适用于 `.htm`。
 *   好处：不论旧站当年用什么文件名，只要新版存在对应 clean URL 就能自动接住；
 *   新版不存在的路径依然正常 404，不会凭空造出页面（避免软 404）。
 *
 * 绝不跳转的白名单：各搜索引擎/AI 平台的站点归属验证文件，
 * 一旦被跳转会导致已完成的验证失效（百度/头条/Google 均已上传验证文件）。
 *
 * 注：Next.js 16 起该文件约定由 `middleware.ts` 更名为 `proxy.ts`（旧名仍可用但会告警）。
 */
const VERIFY_FILE = /^\/(?:ByteDanceVerify|baidu_verify_[A-Za-z0-9_-]+|google[0-9a-f]+|[A-Za-z0-9_-]*verification[A-Za-z0-9_-]*)\.html?$/i;

/** 规范化站点源：跳转落点一律指向它（可用环境变量覆盖，默认线上正式域名） */
const CANONICAL_ORIGIN = process.env.SITE_ORIGIN ?? 'https://www.shuducw.com';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只管 .html / .htm
  if (!/\.html?$/i.test(pathname)) {
    return NextResponse.next();
  }
  // 验证文件放行（必须保持原样可访问）
  if (VERIFY_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const stripped = pathname.replace(/\.html?$/i, '');
  const target = stripped === '' || stripped === '/index' ? '/' : stripped;

  // 必须用**规范域名**拼落点：实测 Next standalone 生成的绝对地址会带上内部地址
  // （https://localhost:3000/...），补 X-Forwarded-Host 也无效——它会忽略转发头，
  // 只认自己的内部 host。这会导致真实用户点开跳转直接失败。故此处固定为规范域名。
  const url = new URL(target + request.nextUrl.search, CANONICAL_ORIGIN);
  return NextResponse.redirect(url, 301);
}

export default proxy;

export const config = {
  // 跳过静态资源与接口，其余路径进入上面的判断（非 .html 会立刻放行）
  matcher: ['/((?!_next/static|_next/image|api/|favicon.ico).*)'],
};
