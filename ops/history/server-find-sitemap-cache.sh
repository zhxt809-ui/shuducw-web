#!/bin/bash
echo "=== .next structure (find cache-like dirs) ==="
find /var/www/shuducw-run/.next -maxdepth 2 -type d 2>/dev/null | head -30
echo "=== any sitemap cache files ==="
find /var/www/shuducw-run/.next -iname '*sitemap*' 2>/dev/null
echo "=== .next/cache exists? ==="
ls -la /var/www/shuducw-run/.next/cache 2>/dev/null && echo "cache exists" || echo "no .next/cache"
echo "=== .next/server/app sitemap artifacts ==="
find /var/www/shuducw-run/.next/server -iname '*sitemap*' 2>/dev/null
