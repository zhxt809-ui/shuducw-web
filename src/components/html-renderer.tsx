'use client';

import { useEffect, useRef } from 'react';

interface HtmlRendererProps {
  html: string;
  className?: string;
}

export function HtmlRenderer({ html, className }: HtmlRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 清空容器
    containerRef.current.innerHTML = '';

    // 创建一个新的 div 来存放 HTML 内容
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    // 提取所有 script 标签
    const scripts = wrapper.querySelectorAll('script');
    const scriptContents: string[] = [];

    scripts.forEach((script) => {
      if (script.textContent) {
        scriptContents.push(script.textContent);
      }
      // 移除 script 标签，稍后手动执行
      script.remove();
    });

    // 将 HTML 内容添加到容器
    containerRef.current.appendChild(wrapper);

    // 手动执行脚本
    scriptContents.forEach((scriptContent) => {
      try {
        const script = document.createElement('script');
        script.textContent = scriptContent;
        containerRef.current!.appendChild(script);
      } catch (error) {
        console.error('执行 HTML 内嵌脚本失败:', error);
      }
    });

    // 清理函数
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [html]);

  return <div ref={containerRef} className={className} />;
}
