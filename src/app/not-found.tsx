import Link from 'next/link';
import { Home, ArrowRight, Phone } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="bg-brand-navy text-white">
      <div className="container-brand section-padding flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto">
          <div className="text-7xl font-bold text-brand-gold mb-4">404</div>
          <h1 className="text-2xl font-bold mb-3">页面不存在</h1>
          <p className="text-white/70 text-sm leading-relaxed mb-8">
            您访问的页面不存在或已被移动。您可以返回首页，或浏览我们的财税服务与财税资讯。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-white font-medium rounded-sm hover:bg-brand-gold-light transition-colors"
            >
              <Home size={16} /> 返回首页
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-sm hover:bg-white/10 transition-colors"
            >
              查看财税服务 <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-8 text-white/60 text-sm">
            有财税问题？致电{' '}
            <a href="tel:02988456877" className="text-brand-gold font-medium">
              029-88456877
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
