#!/bin/bash
curl -s http://127.0.0.1:3000/sitemap.xml > /tmp/sm.xml
echo "loc 出现次数(-o): $(grep -o '<loc>' /tmp/sm.xml | wc -l)"
echo "url 条目: $(grep -c '<url>' /tmp/sm.xml)"
echo "=== 含多个 <loc> 的行 ==="
awk 'BEGIN{n=0} {c=gsub(/<loc>/,"<loc>"); if(c>1){print NR": "$0; n++}} END{print "多loc行数:", n}' /tmp/sm.xml
echo "=== 尾行格式 ==="
tail -6 /tmp/sm.xml
