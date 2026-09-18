'use client';

import { useState } from 'react';
import { ClipboardCheck, ArrowRight, RotateCcw, ShieldCheck } from 'lucide-react';
import ConsultationForm from './consultation-form';

type Option = { label: string; score: number; note: string };
type Question = { q: string; options: Option[] };

const QUESTIONS: Question[] = [
  {
    q: '1. 您目前的账务是怎么处理的？',
    options: [
      { label: '有专职会计，账务规范', score: 0, note: '账务处理较规范' },
      { label: '由代理记账机构处理', score: 1, note: '建议定期核对申报数据与凭证' },
      { label: '自己简单记账，没有系统账', score: 2, note: '账务不完整，成本费用难核算' },
      { label: '基本没有记账', score: 2, note: '存在申报与账务风险' },
    ],
  },
  {
    q: '2. 经营收款主要走什么账户？',
    options: [
      { label: '全部走对公账户', score: 0, note: '资金流规范' },
      { label: '对公为主，少量微信/支付宝', score: 1, note: '建议逐步规范资金流' },
      { label: '主要用个人微信/支付宝收款', score: 2, note: '公私混用风险较高' },
      { label: '现金为主', score: 2, note: '收入难以完整入账' },
    ],
  },
  {
    q: '3. 过去 12 个月是否出现过逾期申报或税务异常？',
    options: [
      { label: '没有，都按期申报', score: 0, note: '申报习惯良好' },
      { label: '有过 1-2 次逾期', score: 1, note: '需关注逾期对信用的影响' },
      { label: '多次逾期或被列为异常户', score: 2, note: '异常状态需尽快处理' },
    ],
  },
];

function resultInfo(total: number) {
  if (total <= 1) {
    return {
      level: '风险较低',
      color: 'text-green-600',
      desc: '您的财税管理基础较好。建议保持按期申报与凭证规范，定期做一次账务自查即可。',
    };
  }
  if (total <= 3) {
    return {
      level: '存在一定风险',
      color: 'text-amber-600',
      desc: '部分环节存在隐患（如账务不完整、收款公私混用、偶发逾期）。建议尽快做一次系统的账务梳理与税务风险排查，避免小问题积累成大风险。',
    };
  }
  return {
    level: '风险较高',
    color: 'text-red-600',
    desc: '您的财税管理存在明显风险点（账务缺失、资金公私混用或异常状态）。强烈建议尽快安排一次专业财税诊断，逐项排查并整改。',
  };
}

export default function RiskCheck() {
  const [step, setStep] = useState(0); // 0=开始 1-3=题目 4=结果
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const total = answers.reduce((s, v) => s + v, 0);
  const info = resultInfo(total);

  const next = () => {
    if (selected === null) return;
    const newAnswers = [...answers, QUESTIONS[step - 1].options[selected].score];
    setAnswers(newAnswers);
    setSelected(null);
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(4);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
  };

  // 结果页：生成预填咨询内容
  const summary = QUESTIONS.map((q, i) => {
    const ans = answers[i];
    return `${q.q.slice(3)}：${ans !== undefined ? q.options[ans].label : ''}`;
  }).join('；');
  const prefillContent = `账务风险自查结果（${total} 分，${info.level}）：${summary}。请会计与我联系，安排财税诊断。`;

  return (
    <div className="bg-white border border-brand-border rounded-sm p-6 md:p-10">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-gold/10 rounded-sm flex items-center justify-center">
          <ClipboardCheck size={20} className="text-brand-gold" />
        </div>
        <div>
          <h3 className="font-bold text-brand-navy">账务风险自查</h3>
          <p className="text-xs text-brand-text-muted">3 道题，1 分钟了解您的财税健康度</p>
        </div>
      </div>

      {/* 步骤 0：开始 */}
      {step === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-brand-text leading-relaxed max-w-md mx-auto mb-6">
            面向西安个体工商户与小微企业主：只需回答 3 个关于账务、资金流、申报习惯的问题，
            即可初步了解企业目前的财税风险状况。结果仅供参考，不构成专业意见。
          </p>
          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors"
          >
            开始自查 <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* 步骤 1-3：答题 */}
      {step >= 1 && step <= 3 && (
        <div>
          {/* 进度 */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-gold' : 'bg-brand-border'}`}
              />
            ))}
            <span className="text-xs text-brand-text-muted ml-2">{step}/3</span>
          </div>

          <p className="font-medium text-brand-navy mb-5">{QUESTIONS[step - 1].q}</p>
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
              {step === 3 ? '查看结果' : '下一题'} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 步骤 4：结果 */}
      {step === 4 && (
        <div>
          <div className="text-center py-4 mb-6">
            <p className={`text-2xl font-bold ${info.color} mb-3`}>{info.level}</p>
            <p className="text-sm text-brand-text leading-relaxed max-w-md mx-auto">{info.desc}</p>
          </div>

          {/* 自查明细 */}
          <div className="bg-brand-bg border border-brand-border rounded-sm p-4 mb-6">
            <p className="text-xs font-semibold text-brand-navy mb-3">自查明细</p>
            <ul className="space-y-2 text-xs text-brand-text leading-relaxed">
              {QUESTIONS.map((q, i) => (
                <li key={q.q}>
                  {q.q} <span className="text-brand-text-muted">→</span>{' '}
                  {q.options[answers[i]]?.label ?? ''}
                </li>
              ))}
            </ul>
          </div>

          {/* 引导留资：预约诊断 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-brand-gold flex-shrink-0" />
              <p className="text-sm font-semibold text-brand-navy">
                预约专业财税诊断，获取详细的《风险排查建议》
              </p>
            </div>
            <ConsultationForm defaultContent={prefillContent} />
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
