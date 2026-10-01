import type { Metadata } from 'next';
import TopicPage, { buildTopicJsonLd } from '@/components/topic-page';
import { socialInsuranceIit } from '@/data/topics/social-insurance-iit';

const TITLE =
  '社保缴纳合规_员工自愿放弃社保无效_个税专项附加扣除标准_全年一次性奖金政策_西安数度财务咨询';
const DESCRIPTION =
  '社保缴费与个税申报的合规要点：未按时足额缴纳社会保险费的法律责任（《社会保险法》第八十六条，按日加收万分之五滞纳金）、员工自愿放弃社保声明是否有效、专项附加扣除标准（国发〔2023〕13号）、全年一次性奖金单独计税政策（执行至2027年12月31日）与综合所得汇算清缴办理期限。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    '社保缴纳合规',
    '员工自愿放弃社保',
    '社保缴费基数',
    '社会保险法第八十六条',
    '专项附加扣除标准',
    '国发2023 13号',
    '全年一次性奖金 单独计税',
    '个税汇算清缴 3月1日至6月30日',
    '西安社保代理 个税申报',
    '西安数度财务咨询',
  ],
  alternates: { canonical: '/social-insurance-iit' },
};

const jsonLd = buildTopicJsonLd({
  name: TITLE,
  description: DESCRIPTION,
  path: '/social-insurance-iit',
  breadcrumbName: '社保与个税',
  faqs: socialInsuranceIit.faqs,
});

export default function SocialInsuranceIitPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopicPage data={socialInsuranceIit} />
    </>
  );
}
