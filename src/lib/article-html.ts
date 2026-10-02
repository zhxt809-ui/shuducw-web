/**
 * 文章正文的服务端预处理。
 *
 * 为什么需要（2026-10-01 线上实测）：
 *   正文以 `<!-- html-content -->` 标记的文章，此前交给客户端组件 HtmlRenderer 用
 *   innerHTML 注入，导致服务端返回的 HTML 里没有正文文字——实测两篇此类文章的
 *   "可见文本"（剥离 script/style 与标签后）分别只有 1228 / 1331 字，基本只有导航与页脚，
 *   即**不执行 JS 的爬虫（百度、GPTBot、ClaudeBot、Bytespider 等）读不到正文**。
 *   同时这些正文自带 <h1>，与页面模板的标题 <h1> 重复，单页出现两个 H1。
 *
 * 处理策略：
 *   1. 剥离 <script> 并单独返回，交给客户端组件在 hydration 后执行，
 *      保留原有的"脚本渲染图表/思维导图"的用户可见效果；
 *   2. 把正文内的 <h1> 降级为 <h2>，使页面只保留模板标题这一个 H1。
 */
export const HTML_CONTENT_MARK = '<!-- html-content -->';

/**
 * 把正文内的 <h1> 降级为 <h2>。
 *
 * 两条渲染路径都要用（2026-10-01 线上复测补充）：
 *   · html-content 文章：正文自带 <h1>
 *   · markdown 文章：正文里写了原生 <h1>，marked 会原样输出
 * 两类文章都会与页面模板的标题 <h1> 撞车，导致单页出现两个 H1。
 */
export function demoteContentHeadings(html: string): string {
  return html.replace(/<h1(\s[^>]*)?>/gi, '<h2$1>').replace(/<\/h1\s*>/gi, '</h2>');
}

export function prepareArticleHtml(raw: string): { html: string; scripts: string[] } {
  const scripts: string[] = [];

  let html = raw.startsWith(HTML_CONTENT_MARK) ? raw.slice(HTML_CONTENT_MARK.length).trim() : raw;

  html = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (_match, body: string) => {
    if (body && body.trim()) scripts.push(body);
    return '';
  });

  html = demoteContentHeadings(html);

  return { html, scripts };
}
