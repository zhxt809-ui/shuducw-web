#!/bin/bash
echo "=== status of every article URL (server-side, fast) ==="
for u in $(curl -s http://127.0.0.1:3000/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' | grep '/news/'); do
  path=${u#https://www.shuducw.com}
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3000$path")
  echo "$code $path"
done
