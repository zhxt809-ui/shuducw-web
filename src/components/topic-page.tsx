import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, FileSearch, Scale, PhoneCall, Landmark } from 'lucide-react';

/**
 * 专题页共享骨架（2026-10-01 新增）
 * 结构与 /shareholder-loans 模型页保持一致，供发票合规/社保与个税/高新认定/注销清算等专题复用，
 * 避免复制多份长页面；背景按 深蓝-白-灰-白-灰-白-深蓝 交替，可选项统一放在第 4 段以保持交替不被打破。
 * 注意：均为静态渲染，无客户端状态，不影响首屏性能。
 */

export type TopicScenario = { title: string; desc: string; risk: string };
export type TopicPolicy = { title: string; body: string; source: string; sourceUrl: string };
export type TopicStep = { title: string; desc: string };
export type TopicLink = { href: string; title: string; note: string };

/** 可选的第 4 段内容：量化指标表 或 自查清单（二选一或同时） */
export type TopicExtra = {
  title: string;
  intro?: string;
  metrics?: { label: string; value: string; note?: string }[];
  checklist?: string[];
  footnote?: string;
};

export type TopicData = {
  badge: string;
  h1: string;
  intro: ReactNode;
  scenariosTitle: string;
  scenariosIntro: string;
  scenarios: TopicScenario[];
  policiesTitle?: string;
  policiesIntro?: string;
  policies: TopicPolicy[];
  /** 可见渲染的问答（同时用于 FAQPage Schema，二者必须一致：Schema 里的问答必须页面可见） */
  faqs: { q: string; a: string }[];
  extra?: TopicExtra;
  stepsTitle: string;
  stepsIntro: string;
  steps: TopicStep[];
  links: TopicLink[];
  ctaTitle: string;
  ctaBody: string;
  ctaPrimaryHref: string;
  ctaPrimaryText: string;
};

export default function TopicPage({ data }: { data: TopicData }) {
  return (
    <>
      {/* 页面头图 */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-16 md:!py-20">
          <div className="max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold-light text-sm rounded-sm mb-6">
              {data.badge}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{data.h1}</h1>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">{data.intro}</p>
          </div>
        </div>
      </section>

      {/* 问题场景 */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">{data.scenariosTitle}</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">{data.scenariosIntro}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {data.scenarios.map((s) => (
              <div key={s.title} className="card-brand">
                <h3 className="font-bold text-brand-navy mb-2 flex items-center gap-2">
                  <FileSearch size={17} className="text-brand-gold flex-shrink-0" />
                  {s.title}
                </h3>
                <p className="text-sm text-brand-text mb-3 leading-relaxed">{s.desc}</p>
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-sm px-3 py-2 leading-relaxed">
                  潜在风险：{s.risk}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 政策依据 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">
              {data.policiesTitle ?? '政策依据（来源可查）'}
            </h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">
              {data.policiesIntro ?? '以下政策均来自财政部、国家税务总局等官方公开文件'}
            </p>
          </div>
          <div className="space-y-5 max-w-4xl mx-auto">
            {data.policies.map((p) => (
              <div key={p.title} className="bg-white border border-brand-border rounded-sm p-6">
                <h3 className="font-bold text-brand-navy mb-3 flex items-center gap-2">
                  <Scale size={17} className="text-brand-gold flex-shrink-0" />
                  {p.title}
                </h3>
                <p className="text-sm text-brand-text leading-relaxed mb-4">{p.body}</p>
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-gold hover:text-brand-navy transition-colors"
                >
                  {p.source} <ArrowRight size={12} />
                </a>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-brand-text-muted max-w-2xl mx-auto">
            以上为政策一般性说明，具体适用以企业实际经营情况及主管税务机关认定为准。
          </p>
        </div>
      </section>

      {/* 可选的量化指标 / 自查清单 */}
      {data.extra && (
        <section className="bg-white">
          <div className="container-brand section-padding !py-12 md:!py-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">{data.extra.title}</h2>
              <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
              {data.extra.intro && (
                <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">{data.extra.intro}</p>
              )}
            </div>

            {data.extra.metrics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
                {data.extra.metrics.map((m) => (
                  <div key={m.label} className="card-brand text-center">
                    <p className="text-xs text-brand-text-muted mb-2">{m.label}</p>
                    <p className="text-xl font-bold text-brand-navy mb-1">{m.value}</p>
                    {m.note && <p className="text-xs text-brand-text-muted leading-relaxed">{m.note}</p>}
                  </div>
                ))}
              </div>
            )}

            {data.extra.checklist && (
              <ul className="max-w-3xl mx-auto space-y-3">
                {data.extra.checklist.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 bg-brand-bg border border-brand-border rounded-sm px-4 py-3"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
                    <span className="text-sm text-brand-text leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {data.extra.footnote && (
              <p className="mt-6 text-center text-xs text-brand-text-muted max-w-2xl mx-auto">{data.extra.footnote}</p>
            )}
          </div>
        </section>
      )}

      {/* 处理路径 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">{data.stepsTitle}</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
            <p className="text-brand-text-muted max-w-2xl mx-auto text-sm md:text-base">{data.stepsIntro}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {data.steps.map((step, idx) => (
              <div key={step.title} className="card-brand">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
                <h3 className="font-bold text-brand-navy mb-2">{step.title}</h3>
                <p className="text-xs text-brand-text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 常见问题（页面可见，与 FAQPage Schema 一一对应） */}
      <section className="bg-white">
        <div className="container-brand section-padding">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">常见问题</h2>
            <div className="w-16 h-[2px] bg-brand-gold mx-auto mb-6" />
          </div>
          <div className="space-y-5 max-w-4xl mx-auto">
            {data.faqs.map((f) => (
              <div key={f.q} className="bg-brand-bg border border-brand-border rounded-sm p-6">
                <h3 className="font-bold text-brand-navy mb-3 leading-snug">{f.q}</h3>
                <p className="text-sm text-brand-text leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 延伸阅读 */}
      <section className="bg-brand-bg">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-6">延伸阅读</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.links.map((l) => (
              <Link key={l.href} href={l.href} className="card-brand block hover:border-brand-gold/60 transition-colors">
                <p className="text-sm font-semibold text-brand-navy leading-snug">{l.title}</p>
                <p className="text-xs text-brand-text-muted mt-2">{l.note}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 服务承接 CTA */}
      <section className="bg-brand-navy text-white">
        <div className="container-brand section-padding !py-12 md:!py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Landmark size={22} className="text-brand-gold" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{data.ctaTitle}</h2>
            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8 max-w-2xl mx-auto">{data.ctaBody}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={data.ctaPrimaryHref}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-navy font-medium rounded-sm hover:bg-brand-gold-light transition-colors"
              >
                {data.ctaPrimaryText} <ArrowRight size={16} />
              </Link>
              <a
                href="tel:02988456877"
                className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-sm hover:border-brand-gold/60 transition-colors"
              >
                <PhoneCall size={16} /> 029-88456877 免费咨询
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** 专题页统一的 JSON-LD（WebPage + FAQPage + BreadcrumbList） */
export function buildTopicJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  breadcrumbName: string;
  faqs: { q: string; a: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: opts.name,
        description: opts.description,
        publisher: {
          '@type': 'Organization',
          name: '西安数度财务咨询有限公司',
          url: 'https://www.shuducw.com',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: opts.faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: 'https://www.shuducw.com/' },
          { '@type': 'ListItem', position: 2, name: opts.breadcrumbName, item: `https://www.shuducw.com${opts.path}` },
        ],
      },
    ],
  };
}
