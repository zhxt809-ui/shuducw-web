#!/bin/bash
# 百度 sitemap 提交后的抓取监控（提交时间基线：2026-10-01 21:30 前后）
# 关键背景：提交前百度 14 天内从未请求过 /sitemap.xml（0 次），也从未请求过 /robots.txt（0 次），
#          因此任何一次真实百度 IP 的 sitemap 请求都是本次提交产生的新行为。
# 同时排除伪装 Baiduspider UA 的扫描器（此前发现 GCP 段 IP 用假 UA 探测 /.env 等路径）。
LOG=/var/log/baidu-sitemap-watch.log
STAMP=/root/baidu-sitemap-first-fetch.txt

cd /var/log/nginx || exit 1
ALL=$(mktemp)
zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$ALL"

# 百度官方 IP 段（用于区分真实 Baiduspider 与伪装 UA 的扫描器）
REAL_BAIDU='(220\.181\.|123\.125\.71\.|116\.179\.32\.|111\.206\.|182\.61\.14\.|180\.76\.|61\.135\.16[89]\.|180\.149\.|106\.12\.|39\.156\.)'

SITEMAP_HITS=$(grep 'Baiduspider' "$ALL" | grep 'sitemap\.xml' | grep -Ec '' || true)
REAL_SITEMAP=$(grep 'Baiduspider' "$ALL" | grep 'sitemap\.xml' | grep -E "^$REAL_BAIDU" | wc -l)
ROBOTS_HITS=$(grep 'Baiduspider' "$ALL" | grep -c 'robots\.txt' || true)
CONTENT_HITS=$(grep 'Baiduspider' "$ALL" | grep -E "^$REAL_BAIDU" | grep -vE ' (GET|HEAD) /[^ ]*\.(css|js|png|jpg|jpeg|svg|ico|woff2?|webp|txt|xml)[ ?]' | grep -vE ' "GET / HTTP' | grep -vE ' "GET /index\.html HTTP' | awk '{print $7}' | grep -vE '^/(\?|$)' | sort | uniq -c | sort -rn | head -12)
# 伪装 Baiduspider UA 的扫描器（非百度 IP）：不计入百度抓取，但要单独盯着
FAKE_BAIDU=$(grep 'Baiduspider' "$ALL" | grep -vE "^$REAL_BAIDU" | wc -l)

echo "===== 1. 真实百度 IP 请求 /sitemap.xml（关键是这一项，基线为 0）====="
echo "  总次数（含伪装 UA）: $SITEMAP_HITS"
echo "  真实百度 IP 段次数: $REAL_SITEMAP"
if [ "$REAL_SITEMAP" -gt 0 ]; then
  echo "  === 明细 ==="
  grep 'Baiduspider' "$ALL" | grep 'sitemap\.xml' | grep -E "^$REAL_BAIDU" | awk '{print "    " $1, $4, $7, $9}' | tail -10
  if [ ! -f "$STAMP" ]; then
    grep 'Baiduspider' "$ALL" | grep 'sitemap\.xml' | grep -E "^$REAL_BAIDU" | head -1 | awk '{print $1, $4, $9}' > "$STAMP"
    echo "  已记录首次抓取到 $STAMP"
  fi
  echo "  首次抓取记录: $(cat "$STAMP" 2>/dev/null)"
  echo "FIRST_FETCH_DETECTED"
else
  echo "  尚未出现（提交后百度处理需要时间，官方说明一般 1 小时内开始）"
fi

echo ""
echo "===== 2. 真实百度 IP 请求 /robots.txt（此前为 0）====="
echo "  次数: $ROBOTS_HITS"
grep 'Baiduspider' "$ALL" | grep 'robots\.txt' | grep -E "^$REAL_BAIDU" | awk '{print "    " $1, $4, $9}' | tail -5

echo ""
echo "===== 3. 百度抓取的内容页（仅真实百度 IP，排除首页与静态资源，最多 12 条）====="
if [ -n "$CONTENT_HITS" ]; then echo "$CONTENT_HITS" | sed 's/^/  /'; else echo "  暂无（说明百度目前仍未抓取内容页）"; fi
echo "  伪装 Baiduspider UA 的扫描器请求数（非百度 IP，安全项，非收录行为）: $FAKE_BAIDU"

echo ""
echo "===== 4. 真实百度 IP 去重清单（判断是否换了新爬虫节点）====="
grep 'Baiduspider' "$ALL" | grep -E "^$REAL_BAIDU" | awk '{print $1}' | sort | uniq -c | sort -rn | head -10 | sed 's/^/  /'

echo ""
echo "===== 5. sitemap 被访问总览（所有 UA，含必应/360/谷歌）====="
grep 'sitemap\.xml' "$ALL" | sed 's/.*" "//' | cut -c1-30 | sort | uniq -c | sort -rn | head -6 | sed 's/^/  /'

echo ""
echo "===== 6. 百度最近 10 次请求（观察是否还在只抓首页）====="
grep 'Baiduspider' "$ALL" | tail -10 | awk '{print "  " $4, $7, $9}'

rm -f "$ALL"
