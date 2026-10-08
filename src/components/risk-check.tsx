'use client';

import { useState } from 'react';
import { ClipboardCheck, ArrowRight, RotateCcw, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import ConsultationForm from './consultation-form';
import { trackEvent } from '@/lib/analytics';

type Option = { label: string; score: number };
type Question = {
  q: string;
  dimension: string;
  options: Option[];
};

// 六维度自查：账务规范 / 资金往来 / 发票管理 / 纳税申报 / 股东往来 / 内部管控
const QUESTIONS: Question[] = [
  {
    q: '1. 您目前的账务是怎么处理的？',
    dimension: '账务规范',
    options: [
      { label: '有专职会计，账务规范', score: 0 },
      { label: '由代理记账机构处理', score: 0 },
      { label: '自己简单记账，没有系统账', score: 2 },
      { label: '基本没有记账', score: 2 },
    ],
  },
  {
    q: '2. 经营收款主要走什么账户？',
    dimension: '资金往来',
    options: [
      { label: '全部走对公账户', score: 0 },
      { label: '对公为主，少量微信/支付宝', score: 1 },
      { label: '主要用个人微信/支付宝收款', score: 2 },
      { label: '现金为主', score: 2 },
    ],
  },
  {
    q: '3. 对外开票和取得进项发票的情况如何？',
    dimension: '发票管理',
    options: [
      { label: '规范开票，进项凭证齐全', score: 0 },
      { label: '部分业务没有发票或凭证不全', score: 1 },
      { label: '长期无票，或用其他票据代替', score: 2 },
    ],
  },
  {
    q: '4. 过去 12 个月是否出现过逾期申报或税务异常？',
    dimension: '纳税申报',
    options: [
      { label: '没有，都按期申报', score: 0 },
      { label: '有过 1-2 次逾期', score: 1 },
      { label: '多次逾期或被列为异常户', score: 2 },
    ],
  },
  {
    q: '5. 老板或股东与公司之间是否有长期资金占用？',
    dimension: '股东往来',
    options: [
      { label: '无往来，或已及时结清', score: 0 },
      { label: '偶有往来，已归还', score: 1 },
      { label: '长期挂账，未处理', score: 2 },
    ],
  },
  {
    q: '6. 出纳与会计是否分岗？每月是否核对银行余额？',
    dimension: '内部管控',
    options: [
      { label: '分岗，且按月核对银行余额', score: 0 },
      { label: '基本执行，但不够严格', score: 1 },
      { label: '一人兼管，或很少核对', score: 2 },
    ],
  },
];

// 各维度的自查建议与对应服务
const DIMENSION_GUIDE: Record<
  string,
  { direction: string; advice: string; href: string; service: string }
> = {
  账务规范: {
    direction: '账务核算不完整',
    advice: '建议尽快补齐账务或委托专业机构系统梳理，确保收入、成本可核算、账实相符。',
    href: '/services/compliance',
    service: '税务合规与优化服务',
  },
  资金往来: {
    direction: '经营收款公私混用',
    advice: '建议规范对公收付，逐步减少个人账户收款，避免经营收入难以完整入账。',
    href: '/services/compliance',
    service: '税务合规与优化服务',
  },
  发票管理: {
    direction: '发票开具与取得不规范',
    advice: '建议规范开票与进项凭证管理，避免因发票问题影响抵扣或引发涉税风险。',
    href: '/services/compliance',
    service: '税务合规与优化服务',
  },
  纳税申报: {
    direction: '存在逾期申报或异常记录',
    advice: '建议尽快查明原因、补办申报并处理异常状态，避免影响企业信用。',
    href: '/services/compliance',
    service: '税务合规与优化服务',
  },
  股东往来: {
    direction: '股东与公司资金往来长期未处理',
    advice: '建议梳理股东借款与公司往来，按借款或分红依法处理并完善凭证。',
    href: '/services/consulting',
    service: '股权与投融资财税服务',
  },
  内部管控: {
    direction: '财务岗位与核对机制薄弱',
    advice: '建议落实出纳会计分岗、按月核对银行余额，完善基础内控。',
    href: '/services/compliance',
    service: '财务内控管理服务',
  },
};

function resultInfo(flaggedCount: number) {
  if (flaggedCount === 0) {
    return {
      head: '基础较好，未发现需要特别关注的环节',
      color: 'text-green-600',
      desc: '您的财税管理基础较好。建议保持按期申报与凭证规范，并定期复核上述六个方面，防患于未然。',
    };
  }
  if (flaggedCount <= 2) {
    return {
      head: `发现 ${flaggedCount} 项需要进一步关注的财税事项`,
      color: 'text-amber-600',
      desc: '以下方面建议结合企业账务、合同、发票及申报资料进一步核实。如需要，可预约持证会计做一次账务梳理与税务风险排查。',
    };
  }
  return {
    head: `发现 ${flaggedCount} 项需要重点关注的财税事项`,
    color: 'text-red-600',
    desc: '以下方面风险信号较明显，建议尽快安排一次专业财税诊断，逐项排查并规范。具体情况需结合企业账务、合同、发票及申报资料进一步判断。',
  };
}

export default function RiskCheck() {
  const [step, setStep] = useState(0); // 0=开始 1-6=题目 7=结果
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const flagged = QUESTIONS.map((q, i) => ({
    dimension: q.dimension,
    flagged: (answers[i] !== undefined && q.options[answers[i]].score >= 2) || false,
  })).filter((f) => f.flagged);

  const info = resultInfo(flagged.length);

  const next = () => {
    if (selected === null) return;
    const newAnswers = [...answers, QUESTIONS[step - 1].options[selected].score];
    setAnswers(newAnswers);
    setSelected(null);
    if (step < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      setStep(7);
      // 埋点：完成自查，value 为需关注维度数（用于分析企业财税问题分布）
      trackEvent('工具', '完成自查', '账务风险自查', newAnswers.filter((s) => s >= 2).length);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
  };

  // 结果页：预填咨询内容
  const summary = flagged.map((f) => f.dimension).join('、') || '未发现明显异常';
  const prefillContent = `账务风险自查：发现 ${flagged.length} 项需关注事项（${summary}）。请会计与我联系，安排财税诊断。`;

  return (
    <div className="bg-white border border-brand-border rounded-sm p-6 md:p-10">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-gold/10 rounded-sm flex items-center justify-center">
          <ClipboardCheck size={20} className="text-brand-gold" />
        </div>
        <div>
          <h3 className="font-bold text-brand-navy">账务风险自查</h3>
          <p className="text-xs text-brand-text-muted">
            6 道题 · 约 2 分钟 · 覆盖账务 / 资金 / 发票 / 申报 / 股东往来 / 内控
          </p>
        </div>
      </div>

      {/* 步骤 0：开始 */}
      {step === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-brand-text leading-relaxed max-w-md mx-auto mb-6">
            面向西安个体工商户与小微企业主：回答 6 道选择题，从
            账务规范、资金往来、发票管理、纳税申报、股东往来、内部管控
            六个维度初步判断企业财税状况，并给出对应的自查建议。结果仅供参考，不构成专业意见。
          </p>
          <button
            onClick={() => {
              setStep(1);
              trackEvent('工具', '开始自查', '账务风险自查');
            }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors"
          >
            开始自查 <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* 步骤 1-6：答题 */}
      {step >= 1 && step <= QUESTIONS.length && (
        <div>
          {/* 进度 */}
          <div className="flex items-center gap-2 mb-6">
            {QUESTIONS.map((q, i) => (
              <div
                key={q.dimension}
                className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-brand-gold' : 'bg-brand-border'}`}
              />
            ))}
            <span className="text-xs text-brand-text-muted ml-2">{step}/{QUESTIONS.length}</span>
          </div>

          <p className="font-medium text-brand-navy mb-5">
            {QUESTIONS[step - 1].q}
            <span className="ml-2 text-xs text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-sm">
              {QUESTIONS[step - 1].dimension}
            </span>
          </p>
          <div className="space-y-3">
            {QUESTIONS[step - 1].options.map((opt, idx) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setSelected(idx)}
                className={`w-full text-left px-4 py-3 rounded-sm border text-sm transition-colors ${
                  selected === idx
                    ? 'border-brand-navy bg-brand-navy/5 text-brand-navy font-medium'
                    : 'border-brand-border text-brand-text hover:border-brand-navy/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={restart}
              className="inline-flex items-center gap-1.5 text-xs text-brand-text-muted hover:text-brand-navy transition-colors"
            >
              <RotateCcw size={13} /> 重新开始
            </button>
            <button
              onClick={next}
              disabled={selected === null}
              className="inline-flex items-center gap-2 px-8 py-2.5 bg-brand-navy text-white text-sm font-medium rounded-sm hover:bg-brand-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === QUESTIONS.length ? '查看结果' : '下一题'} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 步骤 7：结果 */}
      {step === QUESTIONS.length + 1 && (
        <div>
          <div className="text-center py-4 mb-6">
            <p className={`text-xl md:text-2xl font-bold ${info.color} mb-3`}>{info.head}</p>
            <p className="text-sm text-brand-text leading-relaxed max-w-lg mx-auto">{info.desc}</p>
          </div>

          {/* 自查明细 */}
          <div className="bg-brand-bg border border-brand-border rounded-sm p-4 mb-6">
            <p className="text-xs font-semibold text-brand-navy mb-3">自查明细</p>
            <ul className="space-y-2 text-xs text-brand-text leading-relaxed">
              {QUESTIONS.map((q, i) => (
                <li key={q.dimension} className="flex items-start gap-2">
                  <span
                    className={`flex-shrink-0 mt-0.5 ${
                      q.options[answers[i]].score >= 2 ? 'text-red-500' : 'text-green-600'
                    }`}
                  >
                    {q.options[answers[i]].score >= 2 ? '●' : '○'}
                  </span>
                  <span>
                    <span className="text-brand-navy font-medium">{q.dimension}</span>
                    <span className="text-brand-text-muted">：{q.options[answers[i]].label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 需关注事项：风险方向 + 自查建议 + 对应服务 */}
          {flagged.length > 0 ? (
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-brand-gold flex-shrink-0" />
                <p className="text-sm font-semibold text-brand-navy">建议重点关注的方面</p>
              </div>
              {flagged.map((f) => {
                const guide = DIMENSION_GUIDE[f.dimension];
                return (
                  <div key={f.dimension} className="p-4 bg-brand-bg border border-brand-border rounded-sm">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-brand-navy">{f.dimension}</span>
                      <span className="text-xs text-brand-text-muted">｜{guide.direction}</span>
                    </div>
                    <p className="text-xs text-brand-text leading-relaxed mb-3">{guide.advice}</p>
                    <Link
                      href={guide.href}
                      className="inline-flex items-center gap-1 text-xs text-brand-gold hover:text-brand-navy transition-colors"
                    >
                      对应服务：{guide.service} <ArrowRight size={12} />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mb-6 text-xs text-brand-text-muted bg-brand-bg border border-brand-border rounded-sm p-4">
              六个维度均未发现明显异常，建议保持按期申报与凭证规范，并定期复核。
            </p>
          )}

          {/* 引导留资：预约诊断 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-brand-gold flex-shrink-0" />
              <p className="text-sm font-semibold text-brand-navy">
                预约专业财税诊断，获取详细的《风险排查建议》
              </p>
            </div>
            <ConsultationForm defaultContent={prefillContent} source="账务风险自查结果页" />
          </div>

          <button
            onClick={restart}
            className="inline-flex items-center gap-1.5 text-xs text-brand-text-muted hover:text-brand-navy transition-colors"
          >
            <RotateCcw size={13} /> 重新自查
          </button>
        </div>
      )}
    </div>
  );
}
