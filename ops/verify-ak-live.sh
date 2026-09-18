#!/bin/bash
echo "=== 联系页引用的 chunk 中是否含新 AK ==="
curl -s https://www.shuducw.com/contact | grep -oE '/_next/static/chunks/[a-f0-9]+\.js' | sort -u > /tmp/contact-chunks.txt
cat /tmp/contact-chunks.txt
echo "--- 在新 AK chunk 中检索 ---"
while read -r c; do
  [ -z "$c" ] && continue
  body=$(curl -s "https://www.shuducw.com$c")
  if echo "$body" | grep -q "FPO1FZ68t7p78X8EpBfqHvbXZHRFE2UZ"; then
    echo "新AK确认: $c"
  fi
done < /tmp/contact-chunks.txt
echo "=== 地图容器与按钮 ==="
curl -s https://www.shuducw.com/contact | grep -oE '公司位置地图|在百度地图中查看' | sort | uniq -c
