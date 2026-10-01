import type { Metadata } from 'next';
import TopicPage, { buildTopicJsonLd } from '@/components/topic-page';
import { invoiceCompliance } from '@/data/topics/invoice-compliance';

const TITLE = '发票管理不合规的风险_未取得发票不能税前扣除_虚开发票的法律责任_西安数度财务咨询';
const DESCRIPTION =
  '发票是企业所得税税前扣除的核心凭证。本专题讲解取得不合规发票、进项与业务不匹配、汇算清缴前未取得发票、以其他凭证代替发票的风险与规范处理，并说明虚开发票的法律责任（《刑法》第二百零五条、法释〔2024〕4号）与税前扣除凭证管理办法（国家税务总局公告2018年第28号）。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    '发票合规',
    '未取得发票 税前扣除',
    '汇算清缴 补开发票',
    '税务税前扣除凭证管理办法',
    '国家税务总局公告2018年第28号',
    '虚开发票 法律责任',
    '法释2024 4号',
    '进项税额转出',
    '西安代理记账 发票管理',
    '西安数度财务咨询',
  ],
  alternates: { canonical: '/invoice-compliance' },
};

const jsonLd = buildTopicJsonLd({
  name: TITLE,
  description: DESCRIPTION,
  path: '/invoice-compliance',
  breadcrumbName: '发票合规',
  faqs: invoiceCompliance.faqs,
});

export default function InvoiceCompliancePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopicPage data={invoiceCompliance} />
    </>
  );
}
