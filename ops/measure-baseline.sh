#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 压缩传输情况（Content-Encoding / 实际传输字节）====="
for p in / /about; do
  echo "  --- $p ---"
  curl -s -o /dev/null -D /tmp/hdr -H 'Accept-Encoding: gzip, deflate, br' "$B$p"
  grep -iE '^(content-encoding|content-length|vary)' /tmp/hdr | sed 's/^/      /'
  raw=$(curl -s "$B$p" | wc -c)
  tx=$(curl -s -o /dev/null -w '%{size_download}' -H 'Accept-Encoding: gzip, deflate, br' "$B$p")
  echo "      未压缩 $raw 字节 / 实际传输 $tx 字节"
done
echo ""
echo "===== 2. 首页 JS 与 CSS 传输体积 ====="
curl -s "$B/" -o /tmp/h.html
js_total=0
for src in $(grep -oE 'src="/_next/static/[^"]+\.js"' /tmp/h.html | sed 's/src="//;s/"//' | sort -u); do
  sz=$(curl -s -o /dev/null -w '%{size_download}' -H 'Accept-Encoding: gzip' "$B$src")
  js_total=$((js_total+sz))
done
css_total=0
for href in $(grep -oE 'href="/_next/static/[^"]+\.css"' /tmp/h.html | sed 's/href="//;s/"//' | sort -u); do
  sz=$(curl -s -o /dev/null -w '%{size_download}' -H 'Accept-Encoding: gzip' "$B$href")
  css_total=$((css_total+sz))
done
echo "  JS 传输合计: $((js_total/1024)) KB"
echo "  CSS 传输合计: $((css_total/1024)) KB"
echo ""
echo "===== 3. 调试属性与开发模式痕迹 ====="
echo "  data-inspector- 次数: $(grep -o 'data-inspector-' /tmp/h.html | wc -l)"
echo "  占用字节: $(grep -oE 'data-inspector-(line|column|relative-path)="[^"]*"' /tmp/h.html | wc -c)"
echo "  __source/__self 痕迹: $(grep -oE '__source|__self' /tmp/h.html | wc -l)"
echo "  jsxDEV/dev 运行时引用: $(grep -oE 'jsx-dev-runtime' /tmp/h.html | wc -l)"
echo ""
echo "===== 4. 首页 HTML 体积（含 inspector / 去掉后估算）====="
total=$(wc -c < /tmp/h.html)
insp=$(grep -oE 'data-inspector-(line|column|relative-path)="[^"]*"' /tmp/h.html | wc -c)
echo "  当前: $total 字节   其中 inspector: $insp 字节   去掉后约: $((total-insp)) 字节"
