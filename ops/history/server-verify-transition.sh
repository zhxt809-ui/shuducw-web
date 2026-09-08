#!/bin/bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
echo "=== 国务院规定 gov.cn content (过渡期关键句) ==="
curl -s --max-time 25 -A "$UA" "https://www.gov.cn/zhengce/zhengceku/202407/content_6960377.htm" \
  | sed 's/<[^>]*>//g' | grep -oE '[^。；]*20[0-9]{2}年[^。；]*[。；]' | head -30
echo "=== 360 search for 公司法 2023 全文 gov.cn ==="
curl -s --max-time 20 -A "$UA" "https://www.so.com/s?q=%E4%B8%AD%E5%8D%8E%E4%BA%BA%E6%B0%91%E5%85%B1%E5%92%8C%E5%9B%BD%E5%85%AC%E5%8F%B8%E6%B3%95+2023%E5%B9%B4%E4%BF%AE%E8%AE%A2+%E5%85%A8%E6%96%87+site%3Agov.cn" \
  | grep -oE 'https?://[^" ]*gov\.cn[^" ]*' | head -15
