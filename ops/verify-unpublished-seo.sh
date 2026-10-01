#!/bin/bash
LOG=/var/log/nginx/access.log
B="https://www.shuducw.com"
echo "===== 1. 301 跳转 TOP（244 次占比偏高，看是否正常 www 跳转）====="
awk '$9==301 {print $7}' $LOG | sort | uniq -c | sort -rn | head -8 | sed 's/^/  /'
echo "  --- 301 的 Host 分布 ---"
grep ' 301 ' $LOG | awk -F'"' '{print $1}' | awk '{print $NF}' | sort | uniq -c | sort -rn | head -5 | sed 's/^/  /'
echo ""
echo "===== 2. 未发布文章的线上状态（PetalBot 正在抓这些页）====="
for u in /news/wuliangye-zhongxiaoqiye-caiwuhegui /news/xian-canyin-hezhengzhenshou-butui /news/yanfa-jijia-kouchu-yongmei /news/18-1783927822503 /news/5-10-1783086858170; do
  code=$(curl -s -o /tmp/p.html -w '%{http_code}' "$B$u")
  noindex=$(grep -c 'noindex' /tmp/p.html)
  len=$(wc -c < /tmp/p.html)
  title=$(grep -oE '<title>[^<]*</title>' /tmp/p.html | head -1 | sed 's/<[^>]*>//g')
  echo "  $u"
  echo "      HTTP=$code  noindex=$noindex  字节=$len  标题=${title:-无}"
done
echo ""
echo "===== 3. 未发布文章是否仍在 sitemap（应不在）====="
curl -s "$B/sitemap.xml" -o /tmp/sm.xml
for u in wuliangye-zhongxiaoqiye-caiwuhegui xian-canyin-hezhengzhenshou-butui yanfa-jijia-kouchu-yongmei; do
  if grep -q "$u" /tmp/sm.xml; then echo "  在库! $u"; else echo "  已移除 OK  $u"; fi
done
echo ""
echo "===== 4. robots.txt 对未发布/管理页的规则 ====="
curl -s "$B/robots.txt" | head -30
