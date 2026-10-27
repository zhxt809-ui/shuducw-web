#!/bin/bash
# 线上验收（2026-10-27）：logo 图片、页面图标、结构化数据 logo 字段
set -u
DOM=www.shuducw.com
C="curl -sk --resolve $DOM:443:127.0.0.1"

echo "=== 1. logo.png 与图标文件 ==="
for f in /logo.png /favicon.ico /icon.png /apple-icon.png; do
  code=$($C -o /dev/null -w '%{http_code}' "https://$DOM$f")
  size=$($C -o /dev/null -w '%{size_download}' "https://$DOM$f")
  type=$($C -o /dev/null -w '%{content_type}' "https://$DOM$f")
  echo "$f -> $code  $size 字节  $type"
done

echo
echo "=== 2. 首页 HTML 中的 logo 引用 ==="
$C "https://$DOM/" > /tmp/home.html
echo "首页字节: $(wc -c < /tmp/home.html)"
echo "-- img/logo 相关标签 --"
grep -oE '<img[^>]*logo[^>]*>' /tmp/home.html | head -3
echo "-- icon 链接 --"
grep -oE '<link[^>]*rel="(icon|apple-touch-icon)"[^>]*>' /tmp/home.html | head -5
echo "-- 旧方块残留检查 --"
if grep -q 'bg-brand-navy rounded-sm' /tmp/home.html; then echo "!! 仍有旧方块"; else echo "旧方块已移除 OK"; fi

echo
echo "=== 3. 首页结构化数据里的 logo ==="
grep -oE '"logo":"[^"]*"' /tmp/home.html | head -2
grep -oE '"image":"[^"]*logo[^"]*"' /tmp/home.html | head -2

echo
echo "=== 4. 其他页面抽查 ==="
for p in /about /contact /news; do
  code=$($C -o /dev/null -w '%{http_code}' "https://$DOM$p")
  echo "$p -> $code"
done
echo "-- 关于页 schema logo --"
$C "https://$DOM/about" | grep -oE '"logo":"[^"]*"' | head -2
