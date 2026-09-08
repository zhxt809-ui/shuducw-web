#!/bin/bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
echo "=== 360搜索: site:shuducw.com ==="
curl -s --max-time 20 -A "$UA" "https://www.so.com/s?q=site%3Ashuducw.com" | grep -oE "shuducw\.com[^\"< ]{0,40}" | sort -u | head -12
echo "=== 360搜索: 西安数度财务咨询 ==="
curl -s --max-time 20 -A "$UA" "https://www.so.com/s?q=%E8%A5%BF%E5%AE%89%E6%95%B0%E5%BA%A6%E8%B4%A2%E5%8A%A1%E5%92%A8%E8%AF%A2" | grep -oE "shuducw\.com[^\"< ]{0,40}" | sort -u | head -8
