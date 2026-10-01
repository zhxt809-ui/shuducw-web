#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 线上图片体积（瘦身后）====="
cd /var/www/shuducw-run/public
total=0
for f in office-1.jpg office-2.jpg office-3.jpg honors-1.jpg lecture-xaufe-2026.jpg activity-waishi.jpg qr-xiaohongshu.jpg; do
  sz=$(stat -c%s "$f")
  total=$((total+sz))
  echo "  $f: $((sz/1024)) KB"
done
echo "  7 张合计: $((total/1024)) KB"
all=$(du -sb /var/www/shuducw-run/public | cut -f1)
echo "  public 总体积: $((all/1024)) KB"
echo ""
echo "===== 2. 线上文件与本地是否一致（sha256 前 16 位）====="
for f in office-1.jpg office-2.jpg office-3.jpg honors-1.jpg lecture-xaufe-2026.jpg activity-waishi.jpg qr-xiaohongshu.jpg; do
  echo "  $f $(sha256sum $f | cut -c1-16)"
done
echo ""
echo "===== 3. width/height 属性已输出（防布局跳动）====="
a=$(curl -s "$B/about")
echo "  license width=400: $(echo "$a" | grep -o 'width="400"' | wc -l)"
echo "  h-auto 类: $(echo "$a" | grep -o 'h-auto' | wc -l)"
echo "  decoding=async: $(echo "$a" | grep -o 'decoding="async"' | wc -l)"
echo ""
echo "===== 4. 图片仍可访问（HTTP 200 + 体积）====="
for f in office-1.jpg office-2.jpg office-3.jpg honors-1.jpg lecture-xaufe-2026.jpg activity-waishi.jpg qr-xiaohongshu.jpg cert-acc-international.jpg license-yingye.jpg; do
  r=$(curl -s -o /dev/null -w '%{http_code}/%{size_download}' "$B/$f")
  echo "  /$f -> $r"
done
echo ""
echo "===== 5. 页面回归 ====="
for p in / /about /contact /self-check /shareholder-loans /cases /news /services/delivery; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
