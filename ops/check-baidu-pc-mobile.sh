#!/bin/bash
# 真百度 IP：按日拆 PC / 移动（2026-10-28）
set -u
cd /var/log/nginx || exit 1
BAIDU='^180\.76\.|^220\.181\.|^123\.125\.71\.|^116\.179\.|^124\.238\.'
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
echo "日期            移动端  PC端"
collect | awk -v re="$BAIDU" '$1 ~ re && $9 == 200 {
  split($4, a, "[")
  split(a[2], dp, ":")
  day=dp[1]
  if ($0 ~ /Mobile/) mob[day]++; else pc[day]++
  seen[day]=1
} END {
  n=0
  for (k in seen) { arr[n++]=k }
  for (i=0;i<n;i++) for (j=i+1;j<n;j++) if (arr[i] > arr[j]) { t=arr[i]; arr[i]=arr[j]; arr[j]=t }
  for (i=0;i<n;i++) {
    key=arr[i]
    printf "%-15s %5d %6d\n", key, mob[key]+0, pc[key]+0
  }
}'
