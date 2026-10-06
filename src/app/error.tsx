'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到控制台/日志，便于排查
    console.error('页面错误:', error);
  }, [error]);

  return (
    <section className="bg-white">
      <div className="container-brand section-padding flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle size={48} className="mx-auto text-brand-gold mb-4" />
          <h1 className="text-2xl font-bold text-brand-navy mb-3">页面加载异常</h1>
          <p className="text-brand-text-muted text-sm leading-relaxed mb-8">
            抱歉，页面暂时无法加载。您可以刷新重试，或返回首页浏览其他内容。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors"
            >
              <RefreshCcw size={16} /> 刷新重试
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-brand-navy text-brand-navy rounded-sm hover:bg-brand-navy/5 transition-colors"
            >
              <Home size={16} /> 返回首页
            </Link>
          </div>
          <div className="mt-8 text-brand-text-muted text-sm">
            或致电{' '}
            <a href="tel:02988456877" className="text-brand-navy font-medium">
              029-88456877
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
