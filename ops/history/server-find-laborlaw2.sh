#!/bin/bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
echo "=== search 2 ==="
curl -s --max-time 20 -A "$UA" "https://www.so.com/s?q=%E4%B8%AD%E5%8D%8E%E4%BA%BA%E6%B0%91%E5%85%B1%E5%92%8C%E5%9B%BD%E5%8A%B3%E5%8A%A8%E5%90%88%E5%90%8C%E6%B3%95+2012%E4%BF%AE%E6%AD%A3+%E5%85%A8%E6%96%87" \
  | grep -oE 'https?://[^" ]*gov\.cn[^" ]*' | sort -u | head -10
echo "=== search 3 (人社局 sites) ==="
curl -s --max-time 20 -A "$UA" "https://www.so.com/s?q=%E5%8A%B3%E5%8A%A1%E6%B4%BE%E9%81%A3+%E6%B3%A8%E5%86%8C%E8%B5%84%E6%9C%AC+%E4%BA%8C%E7%99%BE%E4%B8%87%E5%85%83+%E5%8A%B3%E5%8A%A8%E5%90%88%E5%90%8C%E6%B3%95" \
  | grep -oE 'https?://[^" ]*' | grep -iE 'mohrss|rsj\.|hrss\.' | sort -u | head -10
