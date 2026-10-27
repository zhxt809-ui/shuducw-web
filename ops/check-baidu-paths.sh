#!/bin/bash
# 真百度 IP 抓取的 URL 明细（2026-10-28）
set -u
cd /var/log/nginx || exit 1

collect() {
  for f in access.log access.log.1 access.log.2.gz access.log.3.gz access.log.4.gz access.log.5.gz \
           access.log.6.gz access.log.7.gz access.log.8.gz access.log.9.gz access.log.10.gz \
           access.log.11.gz access.log.12.gz access.log.13.gz access.log.14.gz; do
    [ -f "$f" ] || continue
    case "$f" in
      *.gz) zgrep -h 'Baiduspider' "$f" 2>/dev/null ;;
      *)    grep -h 'Baiduspider' "$f" 2>/dev/null ;;
    esac
  done
}

BAIDU='^180\.76\.|^220\.181\.|^123\.125\.71\.|^116\.179\.|^124\.238\.'

echo "=== 1. 真百度 IP 请求的路径 TOP20（含全部日志）==="
collect | awk -v re="$BAIDU" '$1 ~ re {print $7}' | sort | uniq -c | sort -rn | head -20

echo
echo "=== 2. 是否有内页抓取（排除 / 与静态资源）==="
collect | awk -v re="$BAIDU" '$1 ~ re {print $7}' \
  | grep -vE '^/$|\.(jpg|jpeg|png|gif|svg|ico|css|js|webp|xml|txt)$' \
  | sort | uniq -c | sort -rn | head -15
echo "(空 = 从未抓过内页)"

echo
echo "=== 3. 真百度 IP 是否取过 robots / sitemap ==="
collect | awk -v re="$BAIDU" '$1 ~ re {print $7, $9}' | grep -E 'robots|sitemap' | sort | uniq -c
echo "(空 = 从未取过)"

echo
echo "=== 4. 真百度 IP 每日去重抓取次数（200 计数，视为完成的一次抓取）==="
collect | awk -v re="$BAIDU" '$1 ~ re && $9 == 200 {
  split($4, a, "[")
  split(a[2], d, ":")
  print d[1]
}' | sort | uniq -c | sort -k2
