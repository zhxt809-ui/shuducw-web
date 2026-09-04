'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, MessageSquare, X, ChevronUp } from 'lucide-react';

/**
 * 全站浮动咨询按钮（移动端/桌面端通用）
 * 固定在右下角：电话咨询 + 在线咨询表单入口，持续捕获访客线索
 */
export function FloatingConsultButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* 展开面板 */}
      {open && (
        <div className="bg-white rounded-lg shadow-xl border border-brand-border p-3 w-56 overflow-hidden">
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-brand-bg transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={16} className="text-brand-gold" />
            </span>
            <span className="text-sm font-medium text-brand-text">在线免费咨询</span>
          </Link>
          <a
            href="tel:02984556877"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-brand-bg transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-brand-navy/5 flex items-center justify-center flex-shrink-0">
              <Phone size={16} className="text-brand-navy" />
            </span>
            <span className="text-sm text-brand-text">
              <span className="block font-medium">电话咨询</span>
              <span className="block text-xs text-brand-text-muted">029-84556877</span>
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
