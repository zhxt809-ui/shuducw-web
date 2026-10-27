#!/bin/bash
# 核对百度抓取真伪（2026-10-27）：把日志里的 Baiduspider 请求按 IP 段拆分
# 依据百度官方《轻松两步，教你快速识别百度蜘蛛》：真实 Baiduspider 来自百度自有 IP 段
#   180.76.0.0/16、220.181.108.0/22、123.125.71.0/24、116.179.32.0/24、124.238.x
set -u
cd /var/log/nginx || exit 1

# 收集所有日志（含压缩）
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

echo "=== 1. Baiduspider 请求按 /16 段统计（近 10 天日志）==="
collect | awk '{print $1}' | awk -F. '{print $1"."$2".x.x"}' | sort | uniq -c | sort -rn | head -12

echo
echo "=== 2. 其中落在百度官方 IP 段的请求 ==="
collect | awk '{
  ip=$1
  if (ip ~ /^180\.76\./ || ip ~ /^220\.181\./ || ip ~ /^123\.125\.71\./ || ip ~ /^116\.179\./ || ip ~ /^124\.238\./) {
    print ip, $4, $7, $9
  }
}' | sort | head -40

echo
echo "=== 3. 按日期统计「真百度 IP」次数 ==="
collect | awk '{
  ip=$1
  if (ip ~ /^180\.76\./ || ip ~ /^220\.181\./ || ip ~ /^123\.125\.71\./ || ip ~ /^116\.179\./ || ip ~ /^124\.238\./) {
    # $4 形如 [27/Oct/2026:16:33:01
    split($4, a, "[")
    split(a[2], d, ":")
    print d[1]
  }
}' | sort | uniq -c | sort -k2
