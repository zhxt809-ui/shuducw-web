#!/bin/bash
# 真百度 IP 的每日抓取按状态码拆分（2026-10-27）
set -u
cd /var/log/nginx || exit 1

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

echo "=== 1. 真百度 IP：每日 × 状态码 ==="
collect | awk '{
  ip=$1
  if (ip ~ /^180\.76\./ || ip ~ /^220\.181\./ || ip ~ /^123\.125\.71\./ || ip ~ /^116\.179\./ || ip ~ /^124\.238\./) {
    split($4, a, "[")
    split(a[2], d, ":")
    print d[1], $9
  }
}' | sort | uniq -c | sort -k2,2 -k3,3

echo
echo "=== 2. 真百度 IP：请求的 URL（含协议与主机）==="
collect | awk '{
  ip=$1
  if (ip ~ /^180\.76\./ || ip ~ /^220\.181\./ || ip ~ /^123\.125\.71\./ || ip ~ /^116\.179\./ || ip ~ /^124\.238\./) {
    print $7, $9
  }
}' | sort | uniq -c | sort -rn | head -15

echo
echo "=== 3. 真百度 IP：抓的是 http 还是 https（看 Host 头）==="
collect | awk '{
  ip=$1
  if (ip ~ /^180\.76\./ || ip ~ /^220\.181\./ || ip ~ /^123\.125\.71\./ || ip ~ /^116\.179\./ || ip ~ /^124\.238\./) {
    host="-"
    for (i=1;i<=NF;i++) if ($i ~ /^"http/) { host=$i }
    print host
  }
}' | sort | uniq -c | sort -rn | head -6
