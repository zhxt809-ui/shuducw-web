#!/bin/bash
B=http://127.0.0.1:3000
echo "=== 1. 服务器数据：已发布数 ==="
curl -s "$B/api/articles?is_published=true&limit=50" | python3 -c "
import sys, json
d = json.load(sys.stdin)['data']
print('已发布:', len(d))
for a in d: print(' ', a['id'], a['slug'])
"
echo "=== 2. 前台资讯列表页渲染的文章链接数 ==="
curl -s "$B/news" > /tmp/nl.html
grep -oE 'href="/news/[a-z0-9-]+"' /tmp/nl.html | sort -u | wc -l
echo "=== 3. 各分类页文章数 ==="
for c in cases tips policies; do
  n=$(curl -s "$B/news/$c" | grep -oE 'href="/news/[a-z0-9-]+"' | sort -u | wc -l)
  echo "$c: $n"
done
echo "=== 4. 列表页 HTML 是否含 #10 和 xian-kaigongsi ==="
grep -c "zhuce-zijin-renjiao-2026" /tmp/nl.html | xargs echo "#10 在列表:"
grep -c "xian-kaigongsi-leixing-duibi-2026" /tmp/nl.html | xargs echo "xian-kaigongsi 在列表:"
