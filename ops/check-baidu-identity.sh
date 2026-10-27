#!/bin/bash
# 验证百度 IP 身份与 UA 构成（2026-10-28）
set -u
cd /var/log/nginx || exit 1

echo "=== 1. 反查 DNS（官方蜘蛛应解析为 *.crawl.baidu.com）==="
for ip in 220.181.108.175 220.181.108.90 116.179.32.100 116.179.32.106; do
  name=$(timeout 5 getent hosts "$ip" 2>/dev/null | awk '{print $2}')
  if [ -z "$name" ]; then name=$(timeout 5 nslookup "$ip" 2>/dev/null | grep -i 'name =' | head -1 | sed 's/.*name = //'); fi
  echo "$ip -> ${name:-未解析}"
done

echo
echo "=== 2. 真百度 IP 的 UA 构成（PC / 移动 / 其他）==="
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
collect | awk -v re="$BAIDU" '$1 ~ re {
  line=$0
  if (line ~ /Mobile/) m++ ; else if (line ~ /Baiduspider/) pc++
} END {
  printf "移动端 UA: %d 次\nPC 端 UA: %d 次\n", m, pc
}'

echo
echo "=== 3. UA 原文样本（去重前 5 种）==="
collect | awk -v re="$BAIDU" '$1 ~ re {
  match($0, /"[^"]*Baiduspider[^"]*"/)
  ua=substr($0, RSTART+1, RLENGTH-2)
  print ua
}' | sort | uniq -c | sort -rn | head -5
