import type { Metadata } from 'next';
import TopicPage, { buildTopicJsonLd } from '@/components/topic-page';
import { companyDeregistration } from '@/data/topics/company-deregistration';

const TITLE = '公司注销流程与法定时限_简易注销公示20日_清税证明办理_注销前股东往来处理_西安数度财务咨询';
const DESCRIPTION =
  '公司注销流程与法定时限：简易注销公示期20日、公示期满之日起20日内申请（宽展期最长30日，最晚50日）、清算组15日内成立、债权人60日内公告（《企业注销指引（2025年修订）》市场监管总局等六部门2025年公告第52号、公司法2023年修订），以及税务注销承诺制容缺办理、注销前股东往来挂账与未实缴出资的处理。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    '公司注销流程',
    '简易注销 公示20日',
    '企业注销指引2025年修订',
    '清税证明',
    '税务注销 承诺制容缺',
    '清算组 15日内成立',
    '注销 股东往来处理',
    '吊销满三年 强制注销',
    '西安公司注销代办',
    '西安数度财务咨询',
  ],
  alternates: { canonical: '/company-deregistration' },
};

const jsonLd = buildTopicJsonLd({
  name: TITLE,
  description: DESCRIPTION,
  path: '/company-deregistration',
  breadcrumbName: '公司注销与清算',
  faqs: companyDeregistration.faqs,
});

export default function CompanyDeregistrationPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopicPage data={companyDeregistration} />
    </>
  );
}
