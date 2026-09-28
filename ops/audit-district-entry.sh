#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 内链入口统计：哪些页面链接到区县页 ====="
for p in / /about /services /services/basic /services/compliance /services/consulting /news /faq /contact /cases; do
  n=$(curl -s "$B$p" | grep -o '/services/district/' | wc -l)
  echo "  $p -> $n 个区县链接"
done
echo ""
echo "===== 2. 爬虫可达性：sitemap 中的区县页 ====="
echo "  sitemap 区县 URL 数: $(curl -s $B/sitemap.xml | grep -o '/services/district/' | wc -l)"
echo "  sitemap 总 URL 数: $(curl -s $B/sitemap.xml | grep -c '<loc>')"
echo ""
echo "===== 3. AI 可达性：llms.txt 中的区县条目 ====="
echo "  llms.txt 区县条目数: $(curl -s $B/llms.txt | grep -o '/services/district/' | wc -l)"
echo ""
echo "===== 4. 页脚是否有服务区域块 ====="
curl -s "$B/" | python3 -c "
import sys, re
t = sys.stdin.read()
# 取 footer 片段
m = re.search(r'<footer.*?</footer>', t, re.S)
f = m.group(0) if m else ''
print('  footer 内区县链接数:', f.count('/services/district/'))
print('  footer 含\"服务区域\"字样:', '服务区域' in f)
print('  全站 footer 链接总数:', len(re.findall(r'href=\"(/[^\"]*)\"', f)))
"
echo ""
echo "===== 5. 首页区域相关表述 ====="
curl -s "$B/" | grep -oE '各区县|区域专项|服务区域|区县服务' | sort | uniq -c
