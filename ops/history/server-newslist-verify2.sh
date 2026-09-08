#!/bin/bash
B=http://127.0.0.1:3000
sleep 3
echo "=== 1. 资讯列表页文章链接数 ==="
curl -s "$B/news" > /tmp/nl2.html
echo "全部文章链接(含分类页): $(grep -oE 'href=\"/news/[a-z0-9-]+\"' /tmp/nl2.html | sort -u | wc -l)"
echo "#10 在列表: $(grep -c 'zhuce-zijin-renjiao-2026' /tmp/nl2.html)"
echo "xian-kaigongsi 在列表: $(grep -c 'xian-kaigongsi-leixing-duibi-2026' /tmp/nl2.html)"
echo "test 占位文章残留: $(grep -c 'test-1781496267610' /tmp/nl2.html)"
echo "=== 2. 列表页标题抽样（应显示真实文章标题）==="
curl -s "$B/news" | sed 's/<[^>]*>//g' | grep -oE "(公司注册|2026|西安|税务|财税|政策|案例)[^ ]{0,14}" | sort -u | head -12
echo "=== 3. 各分类页 ==="
for c in cases tips policies; do
  n=$(curl -s "$B/news/$c" | grep -oE 'href="/news/[a-z0-9-]+"' | sort -u | wc -l)
  echo "$c: $n 链接"
done
echo "=== 4. sitemap ==="
curl -s "$B/sitemap.xml" | grep -o '<loc>' | wc -l
