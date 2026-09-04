'use client';

import { useState } from 'react';
import { Share2, X, Link2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url?: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareToWeibo = () => {
    window.open(
      `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`,
      '_blank',
      'width=600,height=500'
    );
    setOpen(false);
  };

  const shareToWechat = () => {
    // 微信内分享需要 JSSDK，外部浏览器只能通过二维码
    window.open(
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`,
      '_blank',
      'width=400,height=400'
    );
    setOpen(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = currentUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
        aria-label="分享"
      >
        <Share2 size={14} />
        <span>分享</span>
      </button>

      {open && (
        <>
          {/* 点击外部关闭 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-8 z-50 bg-white rounded-lg shadow-xl border border-brand-border py-2 min-w-[140px]">
            <div className="absolute -top-2 right-4 w-3 h-3 bg-white border-l border-t border-brand-border transform rotate-45deg" />

            <button
              onClick={shareToWechat}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-brand-text hover:bg-brand-bg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.328.328 0 0 0 .168-.054l1.974-1.136a.793.793 0 0 1 .596-.09c1.06.291 2.207.448 3.393.448h.063a8.51 8.51 0 0 1-.293-2.187c0-3.792 3.46-6.864 7.73-6.864.103 0 .205.002.306.005C16.523 4.272 12.927 2.188 8.691 2.188zm-2.93 3.146a1.017 1.017 0 1 1 0 2.034 1.017 1.017 0 0 1 0-2.034zm5.859 0a1.017 1.017 0 1 1 0 2.034 1.017 1.017 0 0 1 0-2.034zM24 14.382c0-3.375-3.219-6.117-7.196-6.117-3.978 0-7.197 2.742-7.197 6.117 0 3.374 3.219 6.117 7.197 6.117.938 0 1.834-.141 2.661-.396a.65.65 0 0 1 .488.072l1.618.932a.27.27 0 0 0 .137.044.24.24 0 0 0 .238-.242c0-.06-.023-.118-.04-.174l-.32-1.214a.485.485 0 0 1 .175-.546C22.992 18.227 24 16.412 24 14.382zm-9.293-2.395a.832.832 0 1 1 0-1.664.832.832 0 0 1 0 1.664zm4.354 0a.832.832 0 1 1 0-1.664.832.832 0 0 1 0 1.664z"/>
              </svg>
              微信
            </button>

            <button
              onClick={shareToWeibo}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-brand-text hover:bg-brand-bg transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM9.05 17.219c-.384.616-1.208.884-1.829.59-.612-.289-.793-.991-.406-1.593.379-.595 1.162-.866 1.778-.58.622.287.817.978.457 1.583zm1.593-1.224c-.146.246-.473.36-.718.254-.241-.106-.31-.39-.167-.629.142-.238.453-.354.694-.255.246.09.32.389.191.63zm.262-2.112c-.851-.223-1.821.203-2.18 1.029-.37.823.005 1.739.85 2.063.87.333 1.865-.063 2.229-.881.362-.81-.051-1.729-.899-2.211zm8.399-1.711c-.348-.106-.583-.175-.404-.593.391-.915.432-1.704.009-2.27-.794-1.071-2.967-1.016-5.456-.014 0 0-.714.314-.531-.255.349-1.123.295-2.063-.246-2.605-1.227-1.229-4.491.046-7.293 2.846C1.266 12.434.052 14.658.052 16.58c0 3.684 4.772 5.927 9.434 5.927 6.111 0 10.176-3.551 10.176-6.367 0-1.703-1.432-2.669-2.758-3.058zm-.241-3.952c1.5 1.5 1.875 3.583 1.125 5.438-.165.345.03.75.375.915.345.165.75-.03.915-.375 1.05-2.25.57-4.95-1.5-6.75-.255-.345-.645-.42-.99-.165-.255.255-.3.645-.075.99zm2.775-2.625c2.25 2.55 2.775 6.075 1.575 9.075-.135.39.045.84.435.99.39.135.84-.045.99-.435 1.425-3.45.795-7.65-1.875-10.65-.27-.3-.72-.33-1.005-.06-.3.27-.33.72-.12 1.08z"/>
              </svg>
              微博
            </button>

            <button
              onClick={copyLink}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-brand-text hover:bg-brand-bg transition-colors"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-green-600" />
                  <span className="text-green-600">已复制</span>
                </>
              ) : (
                <>
                  <Link2 size={16} />
                  复制链接
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
