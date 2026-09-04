'use client';

import { useState, type FormEvent } from 'react';
import { MessageSquare, CheckCircle, Loader2 } from 'lucide-react';

export default function ConsultationForm() {
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.companyName.trim()) {
      setErrorMsg('请输入企业名称');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('请输入联系电话');
      return;
    }
    if (!/^[\d\-+\s]{7,20}$/.test(formData.phone.trim())) {
      setErrorMsg('请输入有效的联系电话');
      return;
    }
    if (!formData.content.trim()) {
      setErrorMsg('请输入咨询内容');
      return;
    }

    setIsSubmitting(true);

    try {
      // 提交咨询 — 通过 API 存入数据库
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: formData.companyName.trim(),
          phone: formData.phone.trim(),
          content: formData.content.trim(),
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setIsSubmitted(true);
        setFormData({ companyName: '', phone: '', content: '' });
      } else {
        setErrorMsg(result.error || '提交失败，请直接拨打电话 029-84556877 / 13359182829 咨询');
      }
    } catch {
      setErrorMsg('网络异常，请直接拨打电话 029-84556877 / 13359182829 咨询');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white border border-brand-border rounded-sm p-6 md:p-8">
        <div className="text-center py-8">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-brand-navy mb-2">提交成功</h3>
          <p className="text-brand-text-muted text-sm mb-6">
            感谢您的咨询，我们将在 1 个工作日内与您联系
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-2 bg-brand-navy text-white text-sm font-medium rounded-sm hover:bg-brand-navy-light transition-colors"
          >
            继续咨询
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-border rounded-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-gold/10 rounded-sm flex items-center justify-center">
          <MessageSquare size={20} className="text-brand-gold" />
        </div>
        <div>
          <h3 className="font-bold text-brand-navy">预约咨询</h3>
          <p className="text-xs text-brand-text-muted">专业顾问一对一服务</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="company-name" className="block text-sm font-medium text-brand-navy mb-1.5">
            企业名称 <span className="text-red-500">*</span>
          </label>
          <input
            id="company-name"
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
            placeholder="请输入企业名称"
            className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm text-brand-text bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-brand-navy mb-1.5">
            联系电话 <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="请输入联系电话"
            className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm text-brand-text bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-brand-navy mb-1.5">
            咨询内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="请简要描述您的咨询需求"
            rows={4}
            className="w-full px-4 py-2.5 border border-brand-border rounded-sm text-sm text-brand-text bg-white focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition-colors resize-y"
          />
        </div>

        {errorMsg && (
          <p className="text-red-500 text-sm">{errorMsg}</p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-brand-navy text-white font-medium rounded-sm text-sm hover:bg-brand-navy-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                提交中...
              </>
            ) : (
              '提交咨询'
            )}
          </button>
          <p className="text-xs text-brand-text-muted mt-2 text-center">
            提交后我们将在 1 个工作日内与您联系
          </p>
        </div>
      </form>
    </div>
  );
}
