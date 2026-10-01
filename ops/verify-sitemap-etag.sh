#!/bin/bash
# 验证 sitemap ETag / 304 / txt 版本（百度文档：支持 ETag 的 sitemap 会被更频繁抓取）
echo "===== 1. /sitemap.xml 响应头（应含 ETag 与 Last-Modified）====="
curl -s -o /dev/null -D - https://www.shuducw.com/sitemap.xml | grep -iE '^(HTTP|content-type|cache-control|etag|last-modified|x-nextjs)'
echo ""
echo "===== 2. /sitemap.txt 响应头与内容 ====="
curl -s -o /dev/null -D - https://www.shuducw.com/sitemap.txt | grep -iE '^(HTTP|content-type|cache-control|etag|last-modified|x-nextjs)'
echo "  行数（应为 55）: $(curl -s https://www.shuducw.com/sitemap.txt | grep -c 'https://')"
echo "  前 3 行:"
curl -s https://www.shuducw.com/sitemap.txt | head -3 | sed 's/^/    /'
echo ""
echo "===== 3. ETag 是否稳定（连续两次请求应一致）====="
E1=$(curl -s -o /dev/null -D - https://www.shuducw.com/sitemap.xml | grep -i '^etag' | tr -d '\r')
E2=$(curl -s -o /dev/null -D - https://www.shuducw.com/sitemap.xml | grep -i '^etag' | tr -d '\r')
echo "  第一次: $E1"
echo "  第二次: $E2"
[ "$E1" = "$E2" ] && echo "  一致 OK（内容未变时 ETag 不变）" || echo "  不一致! ETag 每次都在变"
echo ""
echo "===== 4. 条件请求是否返回 304（搜索引擎用 ETag 判断内容未变）====="
TAG=$(curl -s -o /dev/null -D - https://www.shuducw.com/sitemap.xml | grep -i '^etag' | tr -d '\r' | cut -d' ' -f2)
echo "  使用 ETag: $TAG"
echo -n "  If-None-Match 请求返回: "
curl -s -o /dev/null -w '%{http_code}\n' -H "If-None-Match: $TAG" https://www.shuducw.com/sitemap.xml
echo -n "  无条件的正常请求返回: "
curl -s -o /dev/null -w '%{http_code}\n' https://www.shuducw.com/sitemap.xml
echo ""
echo "===== 5. 两个格式条目是否一致（同源不漂移）====="
X=$(curl -s https://www.shuducw.com/sitemap.xml | grep -c '<loc>')
T=$(curl -s https://www.shuducw.com/sitemap.txt | grep -c 'https://')
echo "  XML 条目: $X   TXT 行数: $T   $([ "$X" = "$T" ] && echo '一致 OK' || echo '不一致!')"
echo ""
echo "===== 6. sitemap 响应耗时（动态生成后是否可接受）====="
for i in 1 2 3; do
  curl -s -o /dev/null -w "  第 $i 次: %{time_total}s\n" https://www.shuducw.com/sitemap.xml
done
echo ""
echo "===== 7. 回归：站点与文章数据未受影响 ====="
curl -s -o /dev/null -w "  首页: %{http_code}\n" https://www.shuducw.com/
curl -s -o /dev/null -w "  /news: %{http_code}\n" https://www.shuducw.com/news
curl -s -o /dev/null -w "  /api/health: %{http_code}\n" https://www.shuducw.com/api/health
curl -s https://www.shuducw.com/api/health | head -c 200
echo ""
echo "  已发布文章数（sitemap 中 /news/ 详情页）: $(curl -s https://www.shuducw.com/sitemap.xml | grep -o '<loc>[^<]*/news/[^<]*</loc>' | wc -l)"
