#!/bin/bash
# 全量日志（含轮转 .gz）分析：14 天各搜索引擎抓取实况
cd /var/log/nginx || exit 1
ALL=$(mktemp)
zcat -f access.log.14.gz access.log.13.gz access.log.12.gz access.log.11.gz access.log.10.gz \
     access.log.9.gz access.log.8.gz access.log.7.gz access.log.6.gz access.log.5.gz \
     access.log.4.gz access.log.3.gz access.log.2.gz access.log.1 access.log 2>/dev/null > "$ALL"

echo "===== 日志总行数: $(wc -l < "$ALL")  时间跨度: $(head -1 "$ALL" | grep -oE '\[[^]]+\]')  至  $(tail -1 "$ALL" | grep -oE '\[[^]]+\]') ====="
echo ""
echo "===== 搜索引擎/AI 爬虫抓取统计（14 天）====="
printf "  %-20s %8s %10s  %s\n" "爬虫" "请求数" "不同URL" "首次出现"
for ua in "Baiduspider" "Googlebot" "360Spider" "bingbot" "Sogou" "YandexBot" "PetalBot" "YisouSpider" "Bytespider" "Applebot" "OAI-SearchBot" "GPTBot" "ClaudeBot" "PerplexityBot" "DoubaoBot" "DeepSeek"; do
  sub=$(grep "$ua" "$ALL")
  cnt=$(echo "$sub" | grep -c .)
  uniqurl=$(echo "$sub" | awk '{print $7}' | sort -u | grep -c .)
  first=$(echo "$sub" | head -1 | grep -oE '\[[^]]+\]' | tr -d '[]')
  printf "  %-20s %8s %10s  %s\n" "$ua" "$cnt" "$uniqurl" "${first:-从未}"
done
echo ""
echo "===== 各主流引擎抓取的 URL 明细（不同 URL 数）====="
for ua in "Baiduspider" "Googlebot" "360Spider" "bingbot" "Sogou" "YandexBot" "PetalBot"; do
  echo ""
  echo "--- $ua 抓过的 URL ---"
  grep "$ua" "$ALL" | awk '{print $7}' | sort | uniq -c | sort -rn | head -18 | sed 's/^/    /'
done
echo ""
echo "===== 重点页面被哪些引擎抓过（14 天）====="
for p in /shareholder-loans /self-check /services/delivery /cases /services/district/gaoxin /tools/vat /about /contact; do
  echo "  $p"
  for ua in "Baiduspider" "Googlebot" "360Spider" "bingbot" "Sogou" "YandexBot" "PetalBot"; do
    n=$(grep "$ua" "$ALL" | grep -c "GET $p ")
    [ "$n" -gt 0 ] && echo "      $ua: $n"
  done
done
echo ""
echo "===== 360Spider 全部抓取记录（看是否逐步深入）====="
grep "360Spider" "$ALL" | awk '{print "  " $4, $7, $9}'
echo ""
echo "===== HTTP 状态码分布 ====="
awk '{print $9}' "$ALL" | sort | uniq -c | sort -rn | head -8 | sed 's/^/  /'
rm -f "$ALL"
