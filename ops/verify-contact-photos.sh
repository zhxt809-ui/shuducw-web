#!/bin/bash
B="https://www.shuducw.com"
c=$(curl -s "$B/contact")
echo "===== 1. 到店环境板块已上线 ====="
echo "  标题'到店环境': $(echo "$c" | grep -o '到店环境' | wc -l)"
echo "  办公环境图 img: $(echo "$c" | grep -oE 'src=\"/office-[123]\.jpg\"' | wc -l)（应3）"
echo "  显式尺寸 width=720: $(echo "$c" | grep -o 'width=\"720\"' | wc -l)（应3）"
echo "  decoding=async: $(echo "$c" | grep -o 'decoding=\"async\"' | wc -l)"
echo ""
echo "===== 2. 图片不可放大（遵循隐私规则）====="
echo "  office 图片 href 链接: $(echo "$c" | grep -oE 'href=\"/?office-[123]\.jpg\"' | wc -l)（应0）"
echo "  页面内可放大图片（应只有地图/无）: $(echo "$c" | grep -oE 'href=\"/(license|cert|office|honors|activity|lecture)[^\" ]*\.jpg\"' | wc -l)（应0）"
echo ""
echo "===== 3. 板块背景交替（原位置区与表单区相邻同为 bg-brand-bg）====="
echo "  section 顺序与背景:"
curl -s "$B/contact" | grep -oE '<section class="[^"]*"' | head -8
echo ""
echo "===== 4. 预约提示与页面回归 ====="
echo "  建议先电话预约: $(echo "$c" | grep -o '建议先电话预约' | wc -l)"
for p in /contact /about / /self-check /shareholder-loans; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
