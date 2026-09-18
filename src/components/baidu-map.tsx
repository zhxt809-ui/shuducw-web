'use client';

import { useEffect, useRef } from 'react';

// 百度地图浏览器端 AK（公开用途，受 Referer 白名单约束，非机密）
const BAIDU_MAP_AK = '6ngs3Qmd4BqYCFnnYYUmI63OL4nGee1P';

// 百度地图全局类型最小声明（API 脚本运行时动态加载，无官方类型包）
type BPoint = { lng: number; lat: number };

type BMapType = {
  Map: new (el: HTMLElement) => {
    centerAndZoom(p: BPoint, zoom: number): void;
    addOverlay(marker: unknown): void;
    openInfoWindow(w: unknown, p: BPoint): void;
    enableScrollWheelZoom(v: boolean): void;
  };
  Point: new (lng: number, lat: number) => BPoint;
  Marker: new (p: BPoint) => {
    setAnimation(v: number): void;
    addEventListener(ev: string, fn: () => void): void;
  };
  InfoWindow: new (content: string, opts: { width: number; title?: string }) => unknown;
  LocalSearch: new (
    city: string,
    opts: {
      onSearchComplete: (res: {
        getCurrentNumPois(): number;
        getPoi(i: number): { point: BPoint } | undefined;
      }) => void;
    }
  ) => { search(keyword: string): void };
  BMAP_ANIMATION_BOUNCE: number;
};

export default function BaiduMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const win = window as unknown as { BMap?: BMapType };
    if (win.BMap) {
      initMap(win.BMap);
      return;
    }

    let disposed = false;
    const init = () => {
      if (disposed || !win.BMap) return;
      initMap(win.BMap);
    };
    (window as unknown as Record<string, unknown>).__baiduMapInit = init;

    const script = document.createElement('script');
    script.src = `https://api.map.baidu.com/api?v=3.0&ak=${BAIDU_MAP_AK}&callback=__baiduMapInit`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      disposed = true;
      delete (window as unknown as Record<string, unknown>).__baiduMapInit;
    };
  }, []);

  function initMap(BMap: BMapType) {
    const el = containerRef.current;
    if (!el) return;

    const map = new BMap.Map(el);
    map.enableScrollWheelZoom(true);

    const onComplete = (res: {
      getCurrentNumPois(): number;
      getPoi(i: number): { point: BPoint } | undefined;
    }) => {
      const poi = res.getCurrentNumPois() > 0 ? res.getPoi(0) : undefined;
      if (poi) {
        map.centerAndZoom(poi.point, 17);
        const marker = new BMap.Marker(poi.point);
        marker.setAnimation(BMap.BMAP_ANIMATION_BOUNCE);
        const info = new BMap.InfoWindow(
          '<div style="font-size:13px;line-height:1.8">西安数度财务咨询有限公司<br/>' +
            '西安市高新区唐延路35号旺座现代城D座1006室<br/>' +
            '<a href="tel:02984556877" style="color:#B8860B">029-84556877</a></div>',
          { width: 240, title: '西安数度财务咨询有限公司' }
        );
        marker.addEventListener('click', () => map.openInfoWindow(info, poi.point));
        map.addOverlay(marker);
      } else {
        // 检索失败时定位到唐延路35号旺座现代城附近（BD-09 近似坐标）
        map.centerAndZoom(new BMap.Point(108.8983, 34.2207), 16);
      }
    };

    const ls = new BMap.LocalSearch('西安市', { onSearchComplete: onComplete });
    ls.search('唐延路35号旺座现代城');
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[380px] rounded-sm border border-brand-border bg-brand-bg"
      aria-label="公司位置地图"
    />
  );
}
