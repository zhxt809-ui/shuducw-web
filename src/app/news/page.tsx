import type { Metadata } from 'next';
import NewsListPage from '@/components/news-list';

// 2026-09-07 修复：列表页必须是 ISR（revalidate=60），否则构建时用本地数据静态预渲染，
// 发布新文章后前台列表不会更新（曾出现"只有 13 篇"的旧数据问题）。
export const revalidate = 60;

export const metadata: Metadata = {
  title: '财税资讯_西安数度财务咨询_公司注册_代理记账_税务政策解读',
  description:
    '西安数度财务咨询有限公司财税资讯栏目，分享公司注册、代理记账、税务政策解读、财税实操案例等内容，助力企业合规经营、优化税负。',
  keywords: [
    '西安数度财务咨询',
    '西安财税资讯',
    '西安公司注册',
    '西安代理记账',
    '西安税务政策',
  ],
  alternates: { canonical: '/news' },
};

// 全部资讯列表页（分类页由 /news/[slug] 处理 cases/tips/policies）
export default function NewsIndexPage() {
  return <NewsListPage />;
}
