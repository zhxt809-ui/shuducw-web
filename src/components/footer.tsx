import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

const footerLinks = [
  {
    title: '核心业务',
    links: [
      { label: '基础财税服务', href: '/services/basic' },
      { label: '高端合规内审', href: '/services/compliance' },
      { label: '财税咨询风控', href: '/services/consulting' },
      { label: '业务范围总览', href: '/services' },
    ],
  },
  {
    title: '财税资讯',
    links: [
      { label: '财税案例', href: '/news/cases' },
      { label: '财税知识', href: '/news/tips' },
      { label: '政策解读', href: '/news/policies' },
      { label: '全部资讯', href: '/news' },
      { label: '常见问题 FAQ', href: '/faq' },
    ],
  },
  {
    title: '关于我们',
    links: [
      { label: '公司简介', href: '/about' },
      { label: '核心优势', href: '/about#advantages' },
      { label: '服务理念', href: '/about#philosophy' },
      { label: '联系我们', href: '/contact' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      {/* 金色分割线 */}
      <div className="h-[2px] bg-brand-gold" />

      <div className="container-brand section-padding !py-12 md:!py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* 公司信息 */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 bg-brand-gold rounded-sm flex items-center justify-center">
                <span className="text-white font-bold text-base">数</span>
              </div>
              <div>
                <div className="font-bold text-lg">西安数度财务咨询有限公司</div>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-md">
              2012 年成立，首届西安市代理记账协会副会长单位，深耕西安财税行业十余年，
              专业提供工商财税托管、企业财税合规、内部管理审计、高端财税风控落地服务。
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <MapPin size={16} className="text-brand-gold flex-shrink-0" />
                <span>西安市高新区唐延路35号旺座现代城D座1006室</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <Phone size={16} className="text-brand-gold flex-shrink-0" />
                <span>029-84556877 / 13359182829</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <Mail size={16} className="text-brand-gold flex-shrink-0" />
                <span>309814531@qq.com</span>
              </div>
            </div>
          </div>

          {/* 链接列表 */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-base mb-4 text-brand-gold">{group.title}</h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 底部分割线与版权 */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-white/50">
            <p>&copy; 2012-2026 西安数度财务咨询有限公司 版权所有</p>
            <a
              href="https://beian.miit.gov.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80 transition-colors"
            >
              陕ICP备2026024295号
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
