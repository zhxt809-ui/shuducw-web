'use client';

import { useEffect } from 'react';

/**
 * 执行文章正文中被服务端剥离出来的内联脚本（例如思维导图/图表的渲染脚本）。
 *
 * 正文本身已由服务端渲染为可见文本，本组件只负责恢复脚本带来的可视效果，
 * 因此即使脚本失败也不影响正文被搜索引擎与大模型读取。
 */
export function ArticleScripts({ code }: { code: string }) {
  useEffect(() => {
    if (!code) return;

    const injected: HTMLScriptElement[] = [];
    try {
      const el = document.createElement('script');
      el.textContent = code;
      document.body.appendChild(el);
      injected.push(el);
    } catch (error) {
      console.error('执行文章内联脚本失败:', error);
    }

    return () => {
      injected.forEach((el) => el.remove());
    };
  }, [code]);

  return null;
}
