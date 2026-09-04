import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { FloatingConsultButton } from '@/components/floating-consult';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '西安数度财务咨询_2012年老牌财税咨询_企业财税合规_内部管理审计服务',
    template: '%s_西安数度财务咨询',
  },
  description:
    '西安数度财务咨询有限公司2012年成立，首届西安市代理记账协会副会长单位，拥有高级会计师、国际注册会计师、注册税务师团队，专业提供工商财税托管、企业财税合规、内部管理审计、高端财税风控落地服务。',
  keywords: [
    '西安数度财务咨询',
    '西安财税公司',
    '西安财税咨询',
    '西安企业财税合规',
    '西安内部管理审计',
    '西安代理记账',
    '西安公司注册',
    '西安税务筹划',
  ],
  authors: [{ name: '西安数度财务咨询有限公司' }],
  openGraph: {
    title: '西安数度财务咨询_2012年老牌财税咨询_企业财税合规_内部管理审计服务',
    description:
      '西安数度财务咨询有限公司2012年成立，首届西安市代理记账协会副会长单位，拥有高级会计师、国际注册会计师、注册税务师团队，专业提供工商财税托管、企业财税合规、内部管理审计、高端财税风控落地服务。',
    locale: 'zh_CN',
    type: 'website',
    siteName: '西安数度财务咨询',
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL('https://www.shuducw.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <FloatingConsultButton />
      </body>
    </html>
  );
}
