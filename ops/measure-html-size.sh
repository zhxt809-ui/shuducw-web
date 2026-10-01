#!/bin/bash
B="https://www.shuducw.com"
echo "===== 首页 HTML 体积与 inspector 属性占比 ====="
curl -s "$B/" -o /tmp/h.html
total=$(wc -c < /tmp/h.html)
cnt=$(grep -o 'data-inspector-' /tmp/h.html | wc -l)
bytes=$(grep -oE 'data-inspector-(line|column|relative-path)="[^"]*"' /tmp/h.html | wc -c)
echo "  首页总字节: $total"
echo "  data-inspector- 出现次数: $cnt"
echo "  这些属性占用字节: $bytes"
echo "  占比: $((bytes * 100 / total))%"
echo ""
echo "===== 各页面 HTML 体积 ====="
for p in / /about /news /contact /self-check /cases; do
  echo "  $p: $(curl -s $B$p | wc -c) 字节"
done
echo ""
echo "===== 压缩后（gzip）对比 ====="
for p in / /about; do
  raw=$(curl -s $B$p | wc -c)
  gz=$(curl -s -H 'Accept-Encoding: gzip' $B$p --compressed | wc -c)
  echo "  $p: 原始 $raw 字节 → gzip 传输 $gz 字节"
done
