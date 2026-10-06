'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, MessageSquare, QrCode, X, ChevronUp } from 'lucide-react';
import { MiniConsultDialog } from '@/components/mini-consult-dialog';
import { trackEvent, trackLeadClick } from '@/lib/analytics';

/**
 * 全站浮动咨询按钮（移动端/桌面端通用）
 * 固定在右下角：极简留资弹窗 + 企微二维码 + 电话咨询，持续捕获访客线索
 */
export function FloatingConsultButton() {
  const [open, setOpen] = useState(false);
  const [showWecom, setShowWecom] = useState(false);
  const [showMini, setShowMini] = useState(false);

  const toggleWecom = () => {
    if (!showWecom) trackLeadClick('打开企微二维码');
    setShowWecom((v) => !v);
  };

  const openMini = () => {
    setOpen(false);
    setShowWecom(false);
    setShowMini(true);
    trackEvent('线索', '打开留资弹窗', window.location.pathname);
  };

  // 埋点：全站委托监听「电话」与「小红书」链接点击
  // 覆盖页脚、百度地图弹窗、各页 CTA 等所有位置的 tel:/小红书 链接，无需逐处改造
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const el = event.target as Element | null;
      const anchor = el?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (href.startsWith('tel:')) {
        trackLeadClick('点击电话');
      } else if (href.includes('xiaohongshu.com')) {
        trackLeadClick('点击小红书');
      }
    };
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* 极简留资弹窗 */}
      <MiniConsultDialog open={showMini} onClose={() => setShowMini(false)} />

      {/* 企微二维码卡片 */}
      {showWecom && (
        <div className="bg-white rounded-lg shadow-xl border border-brand-border p-4 w-48 text-center overflow-hidden">
          <img
            src="/qr-wecom.png"
            alt="西安数度财务咨询企业微信二维码"
            className="w-40 h-40 mx-auto rounded-md border border-brand-border"
            width={160}
            height={160}
          />
          <p className="mt-2 text-sm font-medium text-brand-text">扫码添加企微顾问</p>
          <p className="mt-1 text-xs text-brand-text-muted">长按识别 · 工作日在线</p>
          <p className="mt-1 text-xs text-brand-text-muted">或致电 029-88456877</p>
        </div>
      )}

      {/* 展开面板 */}
      {open && (
        <div className="bg-white rounded-lg shadow-xl border border-brand-border p-3 w-56 overflow-hidden">
          <button
            type="button"
            onClick={openMini}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-brand-bg transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={16} className="text-brand-gold" />
            </span>
            <span className="text-sm font-medium text-brand-text">在线免费咨询</span>
            <span className="ml-auto text-xs text-brand-text-muted">30 秒留资</span>
          </button>
          <button
            type="button"
            onClick={toggleWecom}
            aria-label={showWecom ? '收起企业微信二维码' : '打开企业微信二维码'}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-brand-bg transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
              <QrCode size={16} className="text-brand-gold" />
            </span>
            <span className="text-sm font-medium text-brand-text">企微咨询</span>
            <span className="ml-auto text-xs text-brand-text-muted">{showWecom ? '收起' : '扫码'}</span>
          </button>
          <a
            href="tel:02988456877"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-brand-bg transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-brand-navy/5 flex items-center justify-center flex-shrink-0">
              <Phone size={16} className="text-brand-navy" />
            </span>
            <span className="text-sm text-brand-text">
              <span className="block font-medium">电话咨询</span>
              <span className="block text-xs text-brand-text-muted">029-88456877</span>
            </span>
          </a>
          <Link
            href="/faq"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-brand-bg transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-brand-bg flex items-center justify-center flex-shrink-0">
              <ChevronUp size={16} className="text-brand-text-muted" />
            </span>
            <span className="text-sm font-medium text-brand-text">常见问题 FAQ</span>
          </Link>
        </div>
      )}

      {/* 主按钮 */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? '关闭咨询菜单' : '打开咨询菜单'}
        className="w-14 h-14 rounded-full bg-brand-gold text-white shadow-lg shadow-brand-gold/30 flex items-center justify-center hover:bg-brand-gold-light transition-colors"
      >
        {open ? <X size={24} /> : <Phone size={24} />}
      </button>
    </div>
  );
}
