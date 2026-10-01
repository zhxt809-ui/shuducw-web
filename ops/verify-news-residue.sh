#!/bin/bash
B="https://www.shuducw.com"
echo "===== 各页是否残留旧文案（注册税务师/高端财税风控/高端）====="
for p in /news /news/tips /news/cases /news/shilu /news/policies /cases /; do
  n=$(curl -s "$B$p" | grep -oE '注册税务师|高端财税风控|高端' | sort | uniq -c | tr '\n' ' ')
  echo "  $p -> ${n:-无残留}"
done
echo ""
echo "===== 各页 title 与 description（核对是否含旧词）====="
for p in /news /news/tips /cases; do
  echo "--- $p ---"
  curl -s "$B$p" | grep -oE '<title>[^<]*</title>' | head -1
  curl -s "$B$p" | grep -oE '<meta name="description" content="[^"]*"' | head -1
done
