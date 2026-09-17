import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { districts } from '@/data/districts';
import DistrictLandingPage from '@/components/district-page';

// 生成所有区县落地页静态路由（新增区县后自动覆盖）
export function generateStaticParams() {
  return districts.map((d) => ({ district: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ district: string }>;
}): Promise<Metadata> {
  const { district } = await params;
  const conf = districts.find((d) => d.slug === district);
  if (!conf) return { title: '区域服务_西安数度财务咨询' };
  return {
    title: conf.metaTitle,
    description: conf.metaDescription,
    keywords: conf.keywords,
    alternates: { canonical: `/services/district/${conf.slug}` },
  };
}

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ district: string }>;
}) {
  const { district } = await params;
  const conf = districts.find((d) => d.slug === district);
  if (!conf) notFound();
  return <DistrictLandingPage district={conf} />;
}
