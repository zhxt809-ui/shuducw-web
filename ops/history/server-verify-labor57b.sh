#!/bin/bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
URL="http://amr.guizhou.gov.cn/zwgk/xxgkml/jcxxgk/zcfg/fl/202201/t20220105_72244195.html"
echo "=== follow redirect ==="
HTML=$(curl -sL --max-time 30 -A "$UA" "$URL")
echo "len: ${#HTML}"
echo "$HTML" | sed 's/<[^>]*>//g' | tr -d ' \t\r\n' | grep -oE '第五十七条[^第]{0,240}' | head -2
echo "=== title ==="
echo "$HTML" | grep -oE '<title>[^<]*</title>' | head -1
echo "=== 劳务派遣/二百万元 context ==="
echo "$HTML" | sed 's/<[^>]*>//g' | tr -d ' \t\r\n' | grep -oE '劳务派遣[^。]{0,80}二百万元[^。]{0,40}' | head -3
