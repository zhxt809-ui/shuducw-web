#!/bin/bash
# 诊断：Baiduspider 抓了 1107 次，为什么只碰到 2 个内容页？
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
grep -i 'baiduspider' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' > /tmp/bd.txt
echo "===== 1. Baiduspider 抓取总量与状态码分布 ====="
echo "  请求总数: $(wc -l < /tmp/bd.txt)"
awk '{print $9}' /tmp/bd.txt | sort | uniq -c | sort -rn | head -8 | sed 's/^/    /'

echo ""
echo "===== 2. 抓取最多的 URL（前 20）====="
awk '{print $7}' /tmp/bd.txt | sort | uniq -c | sort -rn | head -20 | sed 's/^/    /'

echo ""
echo "===== 3. 抓过的不同 URL 总数（含所有类型）====="
echo "  不同 URL: $(awk '{print $7}' /tmp/bd.txt | sort -u | wc -l) 个"
echo "  其中内容页(/news|/services|/about|/faq|/contact|/tools...): $(awk '$7 ~ /^\/(news|services|about|faq|contact|tools|self-check)/' /tmp/bd.txt | awk '{print $7}' | sort -u | wc -l) 个"
echo "  其中被 301/308 跳转的: $(awk '$9 ~ /^3/' /tmp/bd.txt | wc -l) 次"
echo "  其中 404: $(awk '$9 == "404"' /tmp/bd.txt | wc -l) 次"

echo ""
echo "===== 4. 来源 IP 分布（前 10）====="
awk '{print $1}' /tmp/bd.txt | sort | uniq -c | sort -rn | head -10 | sed 's/^/    /'

echo ""
echo "===== 5. 最近 10 次 Baiduspider 请求明细 ====="
tail -10 /tmp/bd.txt | awk '{print "    " $1, $4, $7, $9}'

echo ""
echo "===== 6. UA 原文样本（确认是否为真百度）====="
awk -F'"' '{print $6}' /tmp/bd.txt | sort | uniq -c | sort -rn | head -5 | sed 's/^/    /'

echo ""
echo "===== 7. 对比：Googlebot / 360Spider 抓取最多的 URL（前 8）====="
for ua in Googlebot 360Spider; do
  echo "  ▸ $ua:"
  grep -i "$ua" "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' | awk '{print $7}' | sort | uniq -c | sort -rn | head -8 | sed 's/^/      /'
done
rm -f "$TMP" /tmp/bd.txt
