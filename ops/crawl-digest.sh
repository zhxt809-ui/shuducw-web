#!/bin/bash
# 每日抓取摘要：统计各搜索引擎当天抓取了本站多少个"内容页"（只读 nginx 日志，不改动站点）
# 由 crontab 每天 00:10 执行，追加一行到 /var/log/crawl-digest.log
set -u
OUT=/var/log/crawl-digest.log
TMP=$(mktemp)
zcat -f /var/log/nginx/access.log.*.gz /var/log/nginx/access.log.1 /var/log/nginx/access.log 2>/dev/null > "$TMP"
[ -s "$TMP" ] || { rm -f "$TMP"; exit 0; }

MINE='^(8\.152\.3\.67|85\.149\.220\.12) '
# 内容页：核心业务页面与文章页，排除首页、静态资源、探针
CONTENT='^/(about|services|news|faq|cases|contact|tools|self-check|privacy|shareholder-loans)'

count() { # count <UA正则> [窗口日期]
  local ua="$1" day="${2:-}"
  if [ -n "$day" ]; then
    grep -iE "$ua" "$TMP" | grep -E "\[$day" | grep -vE "$MINE"
  else
    grep -iE "$ua" "$TMP" | grep -vE "$MINE"
  fi
}

DAY=$(date -d 'yesterday' '+%d/%b/%Y')
LINE="$(date -d 'yesterday' '+%Y-%m-%d')"

for pair in "baidu:baiduspider" "google:googlebot" "bing:bingbot" "360:360spider" "sogou:sogou" "bytespider:bytespider" "yisou:yisou"; do
  name="${pair%%:*}"; ua="${pair##*:}"
  d=$(count "$ua" "$DAY" | awk -v re="$CONTENT" '$7 ~ re {print $7}' | sort -u | wc -l)
  a=$(count "$ua" | awk -v re="$CONTENT" '$7 ~ re {print $7}' | sort -u | wc -l)
  LINE="$LINE  $name:${d}/${a}"
done
# 附加：百度当天是否读了 sitemap / robots
LINE="$LINE  | baidu_sitemap_hits:$(grep -i baiduspider "$TMP" | grep "\[$DAY" | awk '$7=="/sitemap.xml"' | wc -l)"
LINE="$LINE  baidu_robots_hits:$(grep -i baiduspider "$TMP" | grep "\[$DAY" | awk '$7=="/robots.txt"' | wc -l)"

echo "$LINE" >> "$OUT"
rm -f "$TMP"
