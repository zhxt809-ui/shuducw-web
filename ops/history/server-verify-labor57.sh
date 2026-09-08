#!/bin/bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
echo "=== 劳动合同法 第五十七条 ==="
curl -s --max-time 25 -A "$UA" "http://amr.guizhou.gov.cn/zwgk/xxgkml/jcxxgk/zcfg/fl/202201/t20220105_72244195.html" \
  | sed 's/<[^>]*>//g' | tr -d ' \t\r\n' | grep -oE '第五十七条[^第]{0,220}' | head -2
echo "=== 页面标题 ==="
curl -s --max-time 25 -A "$UA" "http://amr.guizhou.gov.cn/zwgk/xxgkml/jcxxgk/zcfg/fl/202201/t20220105_72244195.html" \
  | grep -oE '<title>[^<]*</title>' | head -1
