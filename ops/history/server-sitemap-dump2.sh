#!/bin/bash
echo "=== sitemap 全部 URL ==="
curl -s http://127.0.0.1:3000/sitemap.xml | grep -oE "<loc>[^<]*</loc>" | sed 's/<[^>]*>//g'
