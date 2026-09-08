#!/bin/bash
echo "=== 精确统计 ==="
curl -s http://127.0.0.1:3000/sitemap.xml > /tmp/sm.xml
echo "loc 标签数: $(grep -c '<loc>' /tmp/sm.xml)"
echo "loc 闭合数: $(grep -c '</loc>' /tmp/sm.xml)"
echo "urlset 条目数: $(grep -c '<url>' /tmp/sm.xml)"
echo "=== 首行格式 ==="
head -8 /tmp/sm.xml
