#!/bin/bash
echo "=== 360 search for 国务院规定 URL ==="
curl -s --max-time 20 -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36" \
  "https://www.so.com/s?q=%E5%9B%BD%E5%8A%A1%E9%99%A2%E5%85%B3%E4%BA%8E%E5%AE%9E%E6%96%BD%E3%80%8A%E4%B8%AD%E5%8D%8E%E4%BA%BA%E6%B0%91%E5%85%B1%E5%92%8C%E5%9B%BD%E5%85%AC%E5%8F%B8%E6%B3%95%E3%80%8B%E6%B3%A8%E5%86%8C%E8%B5%84%E6%9C%AC%E7%99%BB%E8%AE%B0%E7%AE%A1%E7%90%86%E5%88%B6%E5%BA%A6%E7%9A%84%E8%A7%84%E5%AE%9A" \
  | grep -oE 'https?://[^" ]*gov\.cn[^" ]*' | head -20
echo "=== exit ==="
