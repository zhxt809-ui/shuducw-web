import type { Metadata } from 'next';
import TopicPage, { buildTopicJsonLd } from '@/components/topic-page';
import { highTechEnterprise } from '@/data/topics/high-tech-enterprise';

const TITLE =
  '高新技术企业认定条件_研发费用占比5%_4%_3%_科技人员占比10%_高企15%所得税税率_西安数度财务咨询';
const DESCRIPTION =
  '高新技术企业认定条件与核心指标：科技人员占当年职工总数不低于10%、近三个会计年度研发费用占同期销售收入比例不低于5%/4%/3%（境内研发费用占比不低于60%）、近一年高新技术产品（服务）收入占比不低于60%、资格自颁发证书之日起有效期三年（国科发火〔2016〕32号），以及15%优惠税率与研发费用加计扣除100%的适用规则。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    '高新技术企业认定条件',
    '研发费用占比5% 4% 3%',
    '科技人员占比10%',
    '高新技术产品收入占比60%',
    '高企15%税率',
    '国科发火2016 32号',
    '高新技术企业认定管理工作指引',
    '研发费用加计扣除100%',
    '西安高新技术企业认定辅导',
    '西安数度财务咨询',
  ],
  alternates: { canonical: '/high-tech-enterprise' },
};

const jsonLd = buildTopicJsonLd({
  name: TITLE,
  description: DESCRIPTION,
  path: '/high-tech-enterprise',
  breadcrumbName: '高新技术企业认定',
  faqs: highTechEnterprise.faqs,
});

export default function HighTechEnterprisePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopicPage data={highTechEnterprise} />
    </>
  );
}
