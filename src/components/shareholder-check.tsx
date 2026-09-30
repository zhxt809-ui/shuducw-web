'use client';

import { useState } from 'react';
import { Landmark, ArrowRight, RotateCcw, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import ConsultationForm from './consultation-form';

type Option = { label: string; score: number };
type Question = { q: string; dimension: string; options: Option[] };

// 股东往来自查：借款 / 垫付个人消费 / 公私账户混用 / 往来挂账 / 协议与期限
const QUESTIONS: Question[] = [
  {
    q: '1. 股东或老板是否从公司账户借过款？',
    dimension: '股东借款',
    options: [
      { label: '从未借款', score: 0 },
      { label: '偶有短期周转，年度内已归还', score: 1 },
      { label: '长期大额借款，未归还', score: 2 },
    ],
  },
  {
    q: '2. 公司是否用公款为股东或家人支付个人消费（旅游、家庭开支、车辆房屋等）？',
    dimension: '个人消费',
    options: [
      { label: '从未发生', score: 0 },
      { label: '偶有发生，已归还或已处理', score: 1 },
      { label: '经常发生', score: 2 },
    ],
  },
  {
    q: '3. 股东个人账户是否收取公司经营款项或支付公司费用？',
    dimension: '公私混用',
    options: [
      { label: '没有，全部走对公账户', score: 0 },
      { label: '少量，已及时归账', score: 1 },
      { label: '大量使用个人账户走公司账', score: 2 },
    ],
  },
  {
    q: '4. "其他应收款"中是否长期挂有股东或老板的款项？',
    dimension: '往来挂账',
    options: [
      { label: '没有', score: 0 },
      { label: '有，但年度内已清理', score: 1 },
      { label: '长期挂账（超过 1 年未处理）', score: 2 },
    ],
  },
  {
    q: '5. 股东借款是否有书面协议，约定了归还期限或利息？',
    dimension: '协议与期限',
    options: [
      { label: '无借款', score: 0 },
      { label: '有协议，有明确归还期限', score: 1 },
      { label: '无协议，或没有明确归还期限', score: 2 },
    ],
  },
];

const DIMENSION_GUIDE: Record<
  string,
  { direction: string; advice: string; href: string; service: string }
> = {
  股东借款: {
    direction: '股东借款长期未还可能被视同分红征税',
    advice:
      '按财税〔2003〕158号，纳税年度终了后股东借款既不归还、又未用于企业生产经营的，可能被视同为股东分红，按"利息、股息、红利所得"20% 缴纳个人所得税。建议在纳税年度内及时归还，或依法按分红处理。',
    href: '/services/consulting',
    service: '财税顾问与专项咨询',
  },
  个人消费: {
    direction: '公款支付个人消费易被认定为分配',
    advice:
      '公司为股东或家人支付与企业生产经营无关的个人消费，可能被视同向股东分配，需依法处理。建议规范列支，严格区分公司与个人开支。',
    href: '/services/compliance',
    service: '财务规范与税务合规',
  },
  公私混用: {
    direction: '个人账户走公司账，收入完整性有风险',
    advice:
      '长期用个人账户收付公司经营款项，收入难以完整入账，易被认定为隐匿收入。建议尽快规范对公收付，逐笔归账。',
    href: '/services/compliance',
    service: '财务规范与税务合规',
  },
  往来挂账: {
    direction: '往来长期挂账，汇算清缴易被纳税调整',
    advice:
      '其他应收款中股东款项长期挂账，汇算清缴时可能被要求说明用途并做纳税调整；长期无法收回的损失如无税前扣除依据，不能自行扣除。建议定期清理往来。',
    href: '/services/compliance',
    service: '财务规范与税务合规',
  },
  协议与期限: {
    direction: '借款关系不清晰、归还期限不明',
    advice:
      '股东借款建议签订书面借款协议，明确金额、用途与归还期限，并尽量在纳税年度内归还，避免被认定为长期挂账。',
    href: '/services/consulting',
    service: '财税顾问与专项咨询',
  },
};

function resultInfo(flaggedCount: number) {
  if (flaggedCount === 0) {
    return {
      head: '未发现需要特别关注的股东往来事项',
      color: 'text-green-600',
      desc: '您的股东与公司资金往来管理基础较好。建议保持书面协议、年度内归还、定期清理往来的习惯。',
    };
  }
  if (flaggedCount <= 2) {
    return {
      head: `发现 ${flaggedCount} 项需要进一步关注的股东往来事项`,
      color: 'text-amber-600',
      desc: '以下方面建议结合公司账务、借款凭证及申报资料进一步核实。如需帮助，可预约持证会计做一次账务梳理与往来清理。',
    };
  }
  return {
    head: `发现 ${flaggedCount} 项需要重点关注的股东往来事项`,
    color: 'text-red-600',
    desc: '以下方面风险信号较明显，建议尽快安排一次专业财税诊断，逐项排查并规范。具体情况需结合公司账务、合同与申报资料进一步判断，以主管税务机关认定为准。',
  };
}

export default function ShareholderCheck() {
  const [step, setStep] = useState(0); // 0=开始 1-5=题目 6=结果
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
      setStep(6);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
  };

  const summary = flagged.map((f) => f.dimension).join('、') || '未发现明显异常';
  const prefillContent = `股东往来自查：发现 ${flagged.length} 项需关注事项（${summary}）。请会计与我联系，安排财税诊断。`;

  return (
    <div className="bg-white border border-brand-border rounded-sm p-6 md:p-10">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-gold/10 rounded-sm flex items-center justify-center">
          <Landmark size={20} className="text-brand-gold" />
        </div>
        <div>
          <h3 className="font-bold text-brand-navy">股东往来自查</h3>
          <p className="text-xs text-brand-text-muted">
            5 道题 · 约 2 分钟 · 覆盖借款 / 个人消费 / 公私混用 / 挂账 / 协议
          </p>
        </div>
      </div>

      {/* 步骤 0：开始 */}
      {step === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-brand-text leading-relaxed max-w-md mx-auto mb-6">
            面向有限公司股东与经营者：回答 5 道题，从股东借款、个人消费、公私账户混用、
            往来挂账、协议与期限五个方面，初步判断股东与公司资金往来的涉税关注点，并给出自查建议。
            结果仅供参考，不构成专业意见。
          </p>
          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-navy text-white font-medium rounded-sm hover:bg-brand-navy-light transition-colors"
          >
            开始自查 <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* 步骤 1-5：答题 */}
      {step >= 1 && step <= QUESTIONS.length && (
        <div>
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

      {/* 步骤 6：结果 */}
      {step === QUESTIONS.length + 1 && (
        <div>
          <div className="text-center py-4 mb-6">
            <p className={`text-xl md:text-2xl font-bold ${info.color} mb-3`}>{info.head}</p>
            <p className="text-sm text-brand-text leading-relaxed max-w-lg mx-auto">{info.desc}</p>
          </div>

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
              五个方面均未发现明显异常，建议保持书面协议、年度内归还、定期清理往来的习惯。
            </p>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-brand-gold flex-shrink-0" />
              <p className="text-sm font-semibold text-brand-navy">
                预约专业财税诊断，获取详细的《股东往来规范建议》
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
