#!/bin/bash
# 真百度 IP 抓到的非 200 响应明细（2026-10-28）
set -u
cd /var/log/nginx || exit 1
BAIDU='^180\.76\.|^220\.181\.|^123\.125\.71\.|^116\.179\.|^124\.238\.'
collect() {
  for f in access.log access.log.1 access.log.2.gz access.log.3.gz access.log.4.gz access.log.5.gz \
           access.log.6.gz access.log.7.gz access.log.8.gz access.log.9.gz access.log.10.gz; do
    [ -f "$f" ] || continue
    case "$f" in
      *.gz) zgrep -h 'Baiduspider' "$f" 2>/dev/null ;;
      *)    grep -h 'Baiduspider' "$f" 2>/dev/null ;;
    esac
  done
}
echo "=== 真百度 IP 的非 200 响应：路径 × 状态码 ==="
collect | awk -v re="$BAIDU" '$1 ~ re && $9 != 200 { print $9, $7 }' | sort | uniq -c | sort -rn | head -15
echo "(若出现 404 的路径是我们自己的页面 → 是站内断链；若是 /.env 之类 → 是扫描器冒用 UA)"
