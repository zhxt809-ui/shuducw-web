'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';

const navItems = [
  { href: '/', label: '首页' },
  { href: '/about', label: '关于我们' },
  {
    href: '/services',
    label: '财税服务',
    children: [
      { href: '/services/basic', label: '基础财税服务' },
      { href: '/services/compliance', label: '高端合规内审' },
      { href: '/services/consulting', label: '财税咨询风控' },
    ],
  },
  { href: '/news', label: '财税资讯' },
  { href: '/faq', label: '常见问题' },
  { href: '/contact', label: '联系我们' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  // 判断当前是否在服务子页面
  const isServicesActive =
    pathname === '/services' ||
    pathname.startsWith('/services/');

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
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            if (item.children) {
              return (
                <div
                  key={item.href}
                  className="relative group"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link
                    href={item.href}
                    className={`nav-link text-sm inline-flex items-center gap-1 ${
                      isServicesActive ? 'nav-link-active' : ''
                    }`}
                  >
                    {item.label}
                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                  </Link>
                  {/* 下拉菜单 */}
                  {servicesOpen && (
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
                        <div className="border-t border-brand-border mt-2 pt-2">
                          <Link
                            href="/services"
                            className="flex items-center gap-2 px-5 py-2.5 text-sm text-brand-gold font-medium hover:bg-brand-bg transition-colors"
                          >
                            查看全部业务范围
                          </Link>
                        </div>
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
                className={`nav-link text-sm ${isActive ? 'nav-link-active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href="tel:02984556877"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold text-white text-sm font-medium rounded-sm hover:bg-brand-gold-light transition-colors"
          >
            <Phone size={14} />
            029-84556877
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
              const isActive = pathname === item.href;
              if (item.children) {
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block py-2.5 px-3 text-sm rounded-md transition-colors ${
                        isServicesActive
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
                    isActive
                      ? 'bg-brand-navy/5 text-brand-navy font-medium'
                      : 'text-brand-text-muted hover:text-brand-navy hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href="tel:02984556877"
              className="flex items-center gap-2 mt-2 px-3 py-2.5 bg-brand-gold text-white text-sm font-medium rounded-md"
            >
              <Phone size={14} />
              电话咨询 029-84556877
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
