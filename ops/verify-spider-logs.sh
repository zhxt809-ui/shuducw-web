#!/bin/bash
# 统计各搜索引擎蜘蛛的真实抓取记录（比抓 SERP 更可靠）
LOGS=$(ls /var/log/nginx/*access*.log /www/wwwlogs/*.log /var/www/*/logs/*.log 2>/dev/null | head -20)
if [ -z "$LOGS" ]; then
  echo "未找到 nginx 日志，尝试全局查找："
  find /var/log /www -maxdepth 3 -name "*access*log*" 2>/dev/null | head -10
  exit 0
fi
echo "===== 日志文件 ====="
for f in $LOGS; do echo "  $f  ($(wc -l < "$f") 行)"; done
echo ""
echo "===== 各搜索引擎蜘蛛抓取次数与最近抓取时间 ====="
printf "  %-22s %10s   %s\n" "蜘蛛" "次数" "最近抓取"
for ua in "360Spider" "HaosouSpider" "Baiduspider" "Sogou web spider" "bingbot" "Googlebot" "Bytespider" "YisouSpider" "YandexBot" "PetalBot" "Applebot" "GPTBot" "ClaudeBot" "DeepSeek" "OAI-SearchBot"; do
  cnt=$(cat $LOGS 2>/dev/null | grep -c "$ua")
  line=$(grep "$ua" $LOGS 2>/dev/null | tail -1)
  ts=$(echo "$line" | grep -oE '\[[^]]+\]' | head -1 | tr -d '[]')
  # 取该蜘蛛抓取的最后一个 URL
  url=$(echo "$line" | awk '{print $7}')
  if [ "$cnt" -gt 0 ]; then
    printf "  %-22s %10s   %s   %s\n" "$ua" "$cnt" "${ts:-?}" "${url:-}"
  else
    printf "  %-22s %10s   %s\n" "$ua" "0" "从未抓取"
  fi
done
echo ""
echo "===== 360 蜘蛛最近 15 条抓取明细 ====="
cat $LOGS 2>/dev/null | grep -E "360Spider|HaosouSpider" | tail -15 | awk '{print "  " $4, $6, $7, $9}'
echo ""
echo "===== 全站总请求量 ====="
cat $LOGS 2>/dev/null | wc -l
