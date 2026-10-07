#!/bin/bash
# 对账：360Spider 到底抓了多少个内容页？用 shell 独立方法与 Python 结果比对
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
MINE='^(8\.152\.3\.67|85\.149\.220\.12) '
CONTENT='^/(about|services|news|faq|cases|contact|tools|self-check|privacy|shareholder-loans)'

echo "===== 方法 A：shell 数（按路径前缀白名单）====="
echo "  360Spider 请求总数: $(grep -i 360spider "$TMP" | grep -vE "$MINE" | wc -l)"
echo "  其中路径匹配内容页前缀的去重数: $(grep -i 360spider "$TMP" | grep -vE "$MINE" | awk -v re="$CONTENT" '$7 ~ re {print $7}' | sort -u | wc -l)"
echo ""
echo "  明细（前 25 个）："
grep -i 360spider "$TMP" | grep -vE "$MINE" | awk -v re="$CONTENT" '$7 ~ re {print $7}' | sort -u | head -25 | sed 's/^/      /'
echo ""
echo "  状态码分布："
grep -i 360spider "$TMP" | grep -vE "$MINE" | awk '{print $9}' | sort | uniq -c | sort -rn | head -6 | sed 's/^/      /'

echo ""
echo "===== 方法 B：Python 口径（最后一段不含点）====="
echo "  明细（前 25 个）："
python3 - <<'PYEOF' 2>/dev/null || python3 -c "
import gzip,glob,re,os
"
PYEOF
python3 /usr/local/bin/crawl-daily-report.py --date 2026-10-06 2>&1 | grep -A6 '360' | head -12 | sed 's/^/      /'

echo ""
echo "===== 关键差异排查：360 是否大量抓取了 /news/xxx 但被某个条件排除 ====="
echo "  360 抓过的 /news/ 路径去重数: $(grep -i 360spider "$TMP" | grep -vE "$MINE" | awk '$7 ~ /^\/news\// {print $7}' | sort -u | wc -l)"
echo "  其中带点的路径（会被 Python 排除）: $(grep -i 360spider "$TMP" | grep -vE "$MINE" | awk '$7 ~ /^\/news\// {print $7}' | grep -c '\.')"
echo ""
echo "  示例（360 抓的 /news/ 路径）："
grep -i 360spider "$TMP" | grep -vE "$MINE" | awk '$7 ~ /^\/news\// {print $7}' | sort -u | head -10 | sed 's/^/      /'
rm -f "$TMP"
