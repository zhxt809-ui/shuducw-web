#!/bin/bash
B="https://www.shuducw.com"
for u in /office-1.jpg /logo.png /og.png /robots.txt / ; do
  echo "--- $u ---"
  curl -s -o /dev/null -D - "$B$u" | grep -iE '^(HTTP|cache-control|expires|etag|last-modified|age)' | sed 's/^/    /'
done
echo ""
echo "--- /_next/static 下的 JS（哈希文件名，应 immutable）---"
js=$(curl -s "$B/" | grep -oE '/_next/static/[^"]+\.js' | head -1)
echo "    文件: $js"
curl -s -o /dev/null -D - "$B$js" | grep -iE '^(HTTP|cache-control|expires|etag)' | sed 's/^/    /'
echo ""
echo "--- /_next/static 下的 CSS ---"
css=$(curl -s "$B/" | grep -oE '/_next/static/[^"]+\.css' | head -1)
echo "    文件: $css"
curl -s -o /dev/null -D - "$B$css" | grep -iE '^(HTTP|cache-control|expires|etag)' | sed 's/^/    /'
