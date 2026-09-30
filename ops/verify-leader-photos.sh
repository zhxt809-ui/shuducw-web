#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 图片资源可访问 ====="
for img in leader-chenwenhua.jpg lecture-xaufe-2026.jpg activity-waishi.jpg cert-acc-international.jpg cert-xaufe.jpg cert-waishi.jpg qr-xiaohongshu.jpg; do
  echo "  /$img -> $(curl -s -o /dev/null -w '%{http_code} %{size_download}B' $B/$img)"
done
echo ""
echo "===== 2. 首页引用 ====="
home=$(curl -s "$B/")
echo "  负责人照片: $(echo "$home" | grep -c 'leader-chenwenhua.jpg')"
echo "  讲座照片: $(echo "$home" | grep -c 'lecture-xaufe-2026.jpg')"
echo "  小红书二维码: $(echo "$home" | grep -c 'qr-xiaohongshu.jpg')"
echo "  '扫码关注小红书': $(echo "$home" | grep -c '扫码关注小红书')"
echo ""
echo "===== 3. /about 负责人板块 ====="
about=$(curl -s "$B/about")
echo "  '企业负责人'标题: $(echo "$about" | grep -c '企业负责人')"
echo "  证件照: $(echo "$about" | grep -c 'leader-chenwenhua.jpg')"
echo "  公开活动2图: $(echo "$about" | grep -oE 'lecture-xaufe-2026.jpg|activity-waishi.jpg' | sort -u | wc -l)/2"
echo "  资质证书3图: $(echo "$about" | grep -oE 'cert-acc-international.jpg|cert-xaufe.jpg|cert-waishi.jpg' | sort -u | wc -l)/3"
echo ""
echo "===== 4. 页面健康 ====="
for p in / /about /news /tools/vat; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
