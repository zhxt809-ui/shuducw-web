'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Loader2, CheckCircle, Shield } from 'lucide-react';

const BUSINESS_TYPES = ['个体户', '小微企业', '一般纳税人企业', '高新技术企业', '集团/多主体企业', '其他'];
const QUESTION_TOPICS = ['代理记账报税', '税务异常处理', '乱账清理', '财税合规体检', '内部审计', '股权架构税务', '其他问题'];

/**
 * 极简留资弹窗（2026-09-20 新增）
 * 悬浮咨询球「在线免费咨询」点击后弹出：企业类型 + 咨询问题 + 手机号，
 * 面向不愿第一时间加企微/填长表单的访客，快速留存联系方式。
 */
export function MiniConsultDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [businessType, setBusinessType] = useState('');
  const [question, setQuestion] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState(''); // 蜜罐
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!businessType || !question || !phone.trim()) {
      setErrorMsg('请填写企业类型、咨询问题和手机号');
      return;
    }
    if (!/^[\d\-+\s]{7,20}$/.test(phone.trim())) {
      setErrorMsg('请输入有效的联系电话');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/consultations/mini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_type: businessType, question, phone: phone.trim(), website }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || '提交失败，请稍后再试');
      }
    } catch {
      setErrorMsg('网络异常，请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setBusinessType('');
    setQuestion('');
    setPhone('');
    setWebsite('');
    setErrorMsg('');
    setSubmitted(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm" onClick={close} />
      <div className="relative w-full max-w-sm bg-white rounded-lg shadow-2xl border border-brand-border overflow-hidden">
        <button
          type="button"
          onClick={close}
          aria-label="关闭"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-brand-text-muted hover:bg-brand-bg hover:text-brand-text transition-colors"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="p-6 text-center">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
            <h3 className="text-lg font-bold text-brand-navy mb-2">已收到！</h3>
            <p className="text-sm text-brand-text leading-relaxed mb-1">您的咨询已提交，顾问将在工作日 9:00-18:00 尽快回电。</p>
            <p className="text-xs text-brand-text-muted mb-5">如需即时沟通，也可扫码添加企微顾问</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={close}
                className="w-full px-4 py-2.5 bg-brand-navy text-white text-sm font-medium rounded-sm hover:bg-brand-navy-light transition-colors"
              >
                好的，知道了
              </button>
              <Link href="/contact" onClick={close} className="text-xs text-brand-gold hover:underline text-center">
                或填写完整预约表单 →
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle size={18} className="text-brand-gold" />
              </span>
              <div>
                <h3 className="font-bold text-brand-navy">免费获取专业建议</h3>
                <p className="text-xs text-brand-text-muted">30 秒快速留资，顾问工作日及时回电</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* 蜜罐：隐藏字段 */}
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] w-px h-px opacity-0 pointer-events-none"
              />

              <div>
                <label htmlFor="mini-type" className="block text-sm font-medium text-brand-navy mb-1.5">
                  企业类型 <span className="text-red-500">*</span>
                </label>
                <select
                  id="mini-type"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-brand-border rounded-sm text-sm text-brand-text bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition-colors"
                >
                  <option value="">请选择</option>
                  {BUSINESS_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mini-question" className="block text-sm font-medium text-brand-navy mb-1.5">
                  咨询问题 <span className="text-red-500">*</span>
                </label>
                <select
                  id="mini-question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-brand-border rounded-sm text-sm text-brand-text bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition-colors"
                >
                  <option value="">请选择</option>
                  {QUESTION_TOPICS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mini-phone" className="block text-sm font-medium text-brand-navy mb-1.5">
                  手机号 <span className="text-red-500">*</span>
                </label>
                <input
                  id="mini-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  autoComplete="tel"
                  className="w-full px-3.5 py-2.5 border border-brand-border rounded-sm text-sm text-brand-text bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition-colors"
                />
              </div>

              {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 bg-brand-gold text-white font-medium rounded-sm text-sm hover:bg-brand-gold-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> 提交中...
                  </>
                ) : (
                  '提交，等顾问联系'
                )}
              </button>

              <p className="text-xs text-brand-text-muted mt-1 text-center flex items-center justify-center gap-1.5">
                <Shield size={12} className="text-brand-gold flex-shrink-0" />
                信息仅用于顾问回电，不对外公开
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
