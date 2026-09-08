#!/bin/bash
echo "=== all URLs in sitemap ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g'
echo "=== count ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -c '<loc>'
