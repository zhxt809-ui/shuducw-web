#!/bin/bash
LOG=/var/log/nginx/access.log
echo "===== 各蜘蛛抓取过的不同 URL（内页覆盖度）====="
for ua in "Baiduspider" "Googlebot" "360Spider" "YandexBot" "bingbot" "PetalBot" "OAI-SearchBot" "GPTBot" "Bytespider" "Sogou"; do
  echo ""
  echo "--- $ua ---"
  urls=$(grep "$ua" $LOG 2>/dev/null | awk '{print $7}' | sort -u)
  cnt=$(echo "$urls" | grep -c . )
  echo "  不同 URL 数: $cnt"
  echo "$urls" | head -12 | sed 's/^/    /'
done
echo ""
echo "===== 重点新页是否被任何蜘蛛抓过 ====="
for p in /shareholder-loans /self-check /services/delivery /cases /about /contact /services/district/gaoxin /tools/vat /sitemap.xml; do
  n=$(grep -cE "GET $p " $LOG 2>/dev/null)
  echo "  $p -> $n 次"
done
echo ""
echo "===== 是否有 404/500（抓取异常）====="
echo "  404: $(awk '$9==404' $LOG | wc -l)   500: $(awk '$9==500' $LOG | wc -l)   301: $(awk '$9==301' $LOG | wc -l)"
echo "  404 的 URL TOP:"
awk '$9==404 {print $7}' $LOG | sort | uniq -c | sort -rn | head -6 | sed 's/^/    /'
