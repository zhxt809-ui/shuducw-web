#!/bin/bash
echo "=== run dir public ==="
ls -la /var/www/shuducw-run/public/ | head -20
echo "=== standalone .next public refs ==="
find /var/www/shuducw-run/.next -maxdepth 2 -name 'public*' 2>/dev/null
echo "=== does .next have a public copy? ==="
ls /var/www/shuducw-run/.next/ 2>/dev/null | head
find /var/www/shuducw-run/.next -maxdepth 3 -name 'BingSiteAuth.xml' 2>/dev/null
find /var/www/shuducw-run -maxdepth 3 -name 'BingSiteAuth.xml' 2>/dev/null
echo "=== local node serving tests ==="
curl -s -o /dev/null -w "BingSiteAuth(root): %{http_code}\n" http://127.0.0.1:3000/BingSiteAuth.xml
curl -s -o /dev/null -w "key(root): %{http_code}\n" http://127.0.0.1:3000/9c615d0ffcf44fd4a1c860a302b08850.txt
curl -s -o /dev/null -w "key(/public/): %{http_code}\n" http://127.0.0.1:3000/public/9c615d0ffcf44fd4a1c860a302b08850.txt
curl -s -o /dev/null -w "nginx key(root): %{http_code}\n" https://127.0.0.1/9c615d0ffcf44fd4a1c860a302b08850.txt -sk -H "Host: www.shuducw.com"
