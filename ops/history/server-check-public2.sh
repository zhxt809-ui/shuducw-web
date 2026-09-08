#!/bin/bash
echo "=== required-server-files.json publicDir ==="
python3 -c "
import json
d=json.load(open('/var/www/shuducw-run/.next/required-server-files.json'))
print('publicDir:', d.get('publicDir'))
print('appDir:', d.get('appDir'))
print('distDir:', d.get('distDir'))
print('domainRedirects:', d.get('domainRedirects'))
"
echo "=== other build-time files at root (pattern test) ==="
for f in google28fc85f4f8afed73.html baidu_verify_codeva-t1LOLMCF42.html ByteDanceVerify.html llms.txt; do
  curl -s -o /dev/null -w "$f: %{http_code}\n" http://127.0.0.1:3000/$f
done
echo "=== verbose 404 source for key file ==="
curl -s -D - -o /dev/null http://127.0.0.1:3000/9c615d0ffcf44fd4a1c860a302b08850.txt | head -15
echo "=== check /public/ alias serving (nginx direct) ==="
curl -sk -o /dev/null -w "nginx /public/key: %{http_code}\n" -H "Host: www.shuducw.com" https://127.0.0.1/public/9c615d0ffcf44fd4a1c860a302b08850.txt
echo "=== standalone server.js head ==="
head -30 /var/www/shuducw-run/server.js
