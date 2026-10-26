#!/bin/bash
# 收录诊断（2026-10-26）：分日志查百度真实抓取路径 + sitemap 取用情况
set -u
cd /var/log/nginx || exit 1

echo "=== 1. 各日志文件中的 Baiduspider 真实路径 ==="
for f in access.log access.log.1 access.log.2.gz access.log.3.gz access.log.4.gz access.log.5.gz; do
  [ -f "$f" ] || continue
  echo "-- $f"
  if [[ "$f" == *.gz ]]; then
    zgrep Baiduspider "$f" 2>/dev/null | grep -oE 'GET [^ ]+' | sort | uniq -c | sort -rn | head -6
  else
    grep Baiduspider "$f" 2>/dev/null | grep -oE 'GET [^ ]+' | sort | uniq -c | sort -rn | head -6
  fi
done

echo
echo "=== 2. 谁取过 sitemap（含压缩日志）==="
{
  for f in access.log access.log.1 access.log.2.gz access.log.3.gz access.log.4.gz access.log.5.gz access.log.6.gz; do
    [ -f "$f" ] || continue
    if [[ "$f" == *.gz ]]; then
      zgrep -h 'sitemap' "$f" 2>/dev/null
    else
      grep -h 'sitemap' "$f" 2>/dev/null
    fi
  done
} | awk '{print $1, $7, $9}' | sort | uniq -c | sort -rn | head -15

echo
echo "=== 3. 百度蜘蛛是否取过 robots/sitemap ==="
{
  for f in access.log access.log.1 access.log.2.gz access.log.3.gz access.log.4.gz access.log.5.gz access.log.6.gz; do
    [ -f "$f" ] || continue
    if [[ "$f" == *.gz ]]; then
      zgrep -h 'Baiduspider' "$f" 2>/dev/null
    else
      grep -h 'Baiduspider' "$f" 2>/dev/null
    fi
  done
} | grep -E 'robots|sitemap' | awk '{print $1, $7, $9}' | sort | uniq -c | sort -rn | head -10
echo "(以上为空 = 百度从未取过 sitemap)"
