#!/bin/bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
echo "=== 360 search 劳动合同法 57条 ==="
curl -s --max-time 20 -A "$UA" "https://www.so.com/s?q=%E5%8A%B3%E5%8A%A8%E5%90%88%E5%90%8C%E6%B3%95%E7%AC%AC%E4%BA%94%E5%8D%81%E4%B8%83%E6%9D%A1+%E5%8A%B3%E5%8A%A1%E6%B4%BE%E9%81%A3+%E6%B3%A8%E5%86%8C%E8%B5%84%E6%9C%AC+%E4%BA%8C%E7%99%BE%E4%B8%87%E5%85%83" \
  | grep -oE 'https?://[^" ]*\.(gov\.cn|mohrss\.gov\.cn)[^" ]*' | sort -u | head -10
echo "=== gov.cn 劳动合同法 via search ==="
curl -s --max-time 20 -A "$UA" "https://www.so.com/s?q=%E5%8A%B3%E5%8A%A8%E5%90%88%E5%90%8C%E6%B3%95%E5%85%A8%E6%96%87+site%3Agov.cn" \
  | grep -oE 'https?://[^" ]*gov\.cn[^" ]*' | sort -u | head -10
