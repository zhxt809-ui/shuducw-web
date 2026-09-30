#!/bin/bash
B="https://www.shuducw.com"
a=$(curl -s "$B/about")
echo "===== 1. 新类名已进入 about 页 HTML ====="
echo "  简介 !pb-4 md:!pb-6: $(echo "$a" | grep -o 'section-padding !pb-4 md:!pb-6' | wc -l)（应≥1）"
echo "  负责人 !pt-6 md:!pt-8: $(echo "$a" | grep -o 'section-padding !pt-6 md:!pt-8' | wc -l)（应≥1）"
echo "  旧值残留 !pb-10/: $(echo "$a" | grep -o '!pb-10' | wc -l)（应0）"
echo "  旧值残留 !pt-10/: $(echo "$a" | grep -o '!pt-10' | wc -l)（应0）"
echo ""
echo "===== 2. Tailwind 是否真的生成了这些 !important 规则 ====="
css=$(echo "$a" | grep -oE '/_next/static/css/[a-zA-Z0-9._-]+\.css' | head -1)
echo "  CSS 文件: $css"
c=$(curl -s "$B$css")
for cls in 'pb-4' 'pb-6' 'pt-6' 'pt-8'; do
  n=$(echo "$c" | grep -oE "\\\\!$cls\{[^}]*\}" | head -1)
  echo "  \\!$cls 规则: ${n:-（未找到）}"
done
echo ""
echo "===== 3. 页面回归 ====="
for p in /about / /contact; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
