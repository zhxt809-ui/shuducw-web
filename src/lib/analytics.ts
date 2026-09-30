/**
 * 百度统计事件上报封装（2026-09 新增）
 *
 * 用途：把「表单提交 / 工具使用 / 线索点击」等关键行为上报到百度统计，
 * 便于在百度统计后台「事件分析」中查看工具使用量、留资转化与来源页分布。
 *
 * 说明：
 * - 百度统计基础代码已在 src/app/layout.tsx 注入（ID e4ea9df47a0ee696df42e73cc3a761c3），
 *   本文件只负责调用 _trackEvent，不重复加载脚本。
 * - 服务端渲染（无 window）与脚本未加载完成时静默跳过，绝不影响业务逻辑。
 * - 上报的数据仅用于站内统计分析（与隐私政策「匿名化访问数据」口径一致），
 *   不上报任何用户填写的内容（如手机号、企业名称），仅上报行为类别与所在页面。
 */

type HmtCommand = [string, string, string, string?, number?];
type HmtWindow = Window & { _hmt?: HmtCommand[] };

/**
 * 上报一个事件
 * @param category 事件类别，如「表单」「工具」「线索」
 * @param action   事件动作，如「提交成功」「开始自查」「点击电话」
 * @param label    事件标签，如具体表单名/工具名/页面路径（可选）
 * @param value    数值（可选，如自查发现的关注项数）
 */
export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  if (typeof window === 'undefined') return;
  try {
    const w = window as HmtWindow;
    w._hmt = w._hmt || [];
    const command: HmtCommand =
      value === undefined
        ? ['_trackEvent', category, action, label ?? '']
        : ['_trackEvent', category, action, label ?? '', value];
    w._hmt.push(command);
  } catch {
    // 统计失败不影响业务
  }
}

/** 便捷方法：上报工具使用（label 为工具名，同时带上当前页面路径便于交叉分析） */
export function trackToolUse(toolName: string): void {
  trackEvent('工具', '使用', toolName, undefined);
}

/** 便捷方法：上报线索点击（电话、小红书、企微入口等） */
export function trackLeadClick(channel: string): void {
  const path = typeof window === 'undefined' ? '' : window.location.pathname;
  trackEvent('线索', channel, path);
}
