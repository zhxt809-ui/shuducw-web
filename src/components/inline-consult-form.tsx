'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, Shield, Phone } from 'lucide-react';

const BUSINESS_TYPES = ['个体户', '小微企业', '一般纳税人企业', '高新技术企业', '集团/多主体企业', '其他'];
const QUESTION_TOPICS = ['代理记账报税', '税务异常处理', '乱账清理', '财税合规体检', '内部审计', '股权架构税务', '其他问题'];

/**
 * 首页内嵌极简留资表单（2026-09 新增）
 * 与悬浮球弹窗共用 /api/consultations/mini 接口（同一套蜜罐 + 三层限流 + 白名单校验），
 * 目的：让首页访客无需先发现悬浮球、也无需跳转联系页，直接在首屏下方完成留资。
 */
export function InlineConsultForm() {
  const [businessType, setBusinessType] = useState('');
  const [question, setQuestion] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState(''); // 蜜罐
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

  if (submitted) {
    return (
      <div className="p-6 md:p-8 text-center">
        <CheckCircle size={44} className="mx-auto text-green-500 mb-3" />
        <h3 className="text-lg font-bold text-brand-navy mb-2">已收到您的咨询</h3>
        <p className="text-sm text-brand-text-muted leading-relaxed">
          顾问将在工作日 9:00-18:00 尽快回电（法定节假日顺延）。
          如需即时沟通，可拨打 <span className="text-brand-navy font-medium">029-84556877</span>
          或 <span className="text-brand-navy font-medium">13359182829</span>。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-9 h-9 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
          <Phone size={17} className="text-brand-gold" />
        </span>
        <div>
          <h3 className="font-bold text-brand-navy">30 秒留资，顾问回电</h3>
          <p className="text-xs text-brand-text-muted">只需 3 项信息，不用注册、不留公司名</p>
        </div>
      </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div>
          <label htmlFor="inline-type" className="block text-sm font-medium text-brand-navy mb-1.5">
            企业类型 <span className="text-red-500">*</span>
          </label>
          <select
            id="inline-type"
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
          <label htmlFor="inline-question" className="block text-sm font-medium text-brand-navy mb-1.5">
            咨询问题 <span className="text-red-500">*</span>
          </label>
          <select
            id="inline-question"
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
          <label htmlFor="inline-phone" className="block text-sm font-medium text-brand-navy mb-1.5">
            手机号 <span className="text-red-500">*</span>
          </label>
          <input
            id="inline-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="请输入手机号"
            autoComplete="tel"
            className="w-full px-3.5 py-2.5 border border-brand-border rounded-sm text-sm text-brand-text bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition-colors"
          />
        </div>
      </div>

      {errorMsg && <p className="text-red-500 text-sm mt-3">{errorMsg}</p>}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-5">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-white font-medium rounded-sm text-sm hover:bg-brand-gold-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> 提交中...
            </>
          ) : (
            '提交，等顾问联系'
          )}
        </button>
        <p className="text-xs text-brand-text-muted flex items-center gap-1.5">
          <Shield size={12} className="text-brand-gold flex-shrink-0" />
          信息仅用于顾问回电，严格保密、不对外公开
        </p>
      </div>
    </form>
  );
}
