'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';

type NavChild = { href: string; label: string };
type NavItem = {
  href: string;
  label: string;
  /** 判定高亮的路径前缀（默认用 href） */
  activePrefixes?: string[];
  /** 下拉菜单底部的"查看全部"链接 */
  more?: NavChild;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  { href: '/', label: '首页' },
  { href: '/about', label: '关于我们' },
  {
    href: '/services',
    label: '财税服务',
    activePrefixes: ['/services'],
    more: { href: '/services', label: '查看全部业务范围' },
    children: [
      { href: '/services/basic', label: '基础财税服务' },
      { href: '/services#layer-02', label: '税务合规与优化服务' },
      { href: '/services#layer-03', label: '财务内控管理服务' },
      { href: '/services#layer-04', label: '股权与投融资财税服务' },
      { href: '/services#layer-05', label: '企业专项定制服务' },
      { href: '/services/live-commerce', label: '直播电商个体户财税咨询' },
      { href: '/services/delivery', label: '服务交付标准' },
    ],
  },
  { href: '/news', label: '财税资讯' },
  { href: '/cases', label: '客户案例' },
  {
    href: '/tools',
    label: '财税工具',
    activePrefixes: ['/tools', '/self-check'],
    children: [
      { href: '/tools', label: '工具中心' },
      { href: '/tools/vat', label: '增值税计算器' },
      { href: '/tools/income-tax', label: '个税计算器' },
      { href: '/tools/bonus-tax', label: '年终奖试算' },
      { href: '/tools/rmb-uppercase', label: '金额大写转换' },
      { href: '/self-check', label: '账务风险自查' },
    ],
  },
  { href: '/faq', label: '常见问题' },
  { href: '/contact', label: '联系我们' },
];

function isGroupActive(item: NavItem, pathname: string): boolean {
  if (item.activePrefixes) return item.activePrefixes.some((p) => pathname.startsWith(p));
  return pathname === item.href || pathname.startsWith(item.href + '/');
}

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // 当前展开的下拉菜单（以父项 href 标识）
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-border">
      <div className="container-brand flex items-center justify-between h-16 md:h-20 px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-navy rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-base md:text-lg">数</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-brand-navy font-bold text-base md:text-lg leading-tight">西安数度财务咨询</div>
            <div className="text-brand-text-muted text-xs">Xi&apos;an Shudu Financial Consulting</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-8">
          {navItems.map((item) => {
            const active = isGroupActive(item, pathname);
            if (item.children) {
              return (
                <div
                  key={item.href}
                  className="relative group"
                  onMouseEnter={() => setOpenMenu(item.href)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    href={item.href}
                    className={`nav-link text-sm inline-flex items-center gap-1 ${
                      active ? 'nav-link-active' : ''
                    }`}
                  >
                    {item.label}
                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                  </Link>
                  {/* 下拉菜单 */}
                  {openMenu === item.href && (
                    <div className="absolute left-0 top-full pt-3">
                      <div className="bg-white border border-brand-border rounded-sm shadow-lg py-2 min-w-[180px]">
                        {item.children.map((child) => {
                          const childActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-5 py-2.5 text-sm transition-colors ${
                                childActive
                                  ? 'text-brand-navy font-medium bg-brand-bg'
                                  : 'text-brand-text-muted hover:text-brand-navy hover:bg-brand-bg'
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                        {item.more && (
                          <div className="border-t border-brand-border mt-2 pt-2">
                            <Link
                              href={item.more.href}
                              className="flex items-center gap-2 px-5 py-2.5 text-sm text-brand-gold font-medium hover:bg-brand-bg transition-colors"
                            >
                              {item.more.label}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link text-sm ${pathname === item.href ? 'nav-link-active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href="tel:02988456877"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold text-white text-sm font-medium rounded-sm hover:bg-brand-gold-light transition-colors"
          >
            <Phone size={14} />
            029-88456877
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-brand-navy"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? '关闭菜单' : '打开菜单'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-brand-border bg-white">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const active = isGroupActive(item, pathname);
              if (item.children) {
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block py-2.5 px-3 text-sm rounded-md transition-colors ${
                        active
                          ? 'bg-brand-navy/5 text-brand-navy font-medium'
                          : 'text-brand-text-muted hover:text-brand-navy hover:bg-gray-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                    <div className="pl-4 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 px-3 text-sm text-brand-text-muted hover:text-brand-navy hover:bg-gray-50 rounded-md"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block py-2.5 px-3 text-sm rounded-md transition-colors ${
                    pathname === item.href
                      ? 'bg-brand-navy/5 text-brand-navy font-medium'
                      : 'text-brand-text-muted hover:text-brand-navy hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href="tel:02988456877"
              className="flex items-center gap-2 mt-2 px-3 py-2.5 bg-brand-gold text-white text-sm font-medium rounded-md"
            >
              <Phone size={14} />
              电话咨询 029-88456877
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
