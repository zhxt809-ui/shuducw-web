import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getIndustry, industries } from '@/data/industries';
import { IndustryLandingPage } from '@/components/industry-page';

// 生成所有行业专项页静态路由（新增行业后自动覆盖）
export function generateStaticParams() {
  return industries.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ industry: string }>;
}): Promise<Metadata> {
  const { industry } = await params;
  const conf = getIndustry(industry);
  if (!conf) return { title: '行业专项服务-西安数度财务咨询' };
  return {
    title: conf.metaTitle,
    description: conf.metaDescription,
    keywords: conf.keywords,
    alternates: { canonical: `/services/industry/${conf.slug}` },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry } = await params;
  const conf = getIndustry(industry);
  if (!conf) notFound();
  return <IndustryLandingPage industry={conf} />;
}
