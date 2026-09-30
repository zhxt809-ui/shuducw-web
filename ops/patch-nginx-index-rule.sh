#!/bin/bash
set -e
CONF="/etc/nginx/sites-enabled/shuducw"
BAKDIR="/root/nginx-backups"
mkdir -p "$BAKDIR"
BAK="$BAKDIR/shuducw.bak-$(date +%Y%m%d%H%M%S)"

if grep -q "index(\\\\.html)" "$CONF"; then
  echo "already has index rule, skip"
  exit 0
fi

cp "$CONF" "$BAK"
echo "backup: $BAK"

python3 - "$CONF" <<'PYEOF'
import sys
path = sys.argv[1]
content = open(path).read()
old = "    location ~* ^/(wp-admin|wp-login|xmlrpc|phpinfo|\\.env) { return 404; }"
new = old + "\n    location ~* ^/index(\\.html)?$ { return 404; }"
assert content.count(old) == 1, "锚点行不存在，中止"
content = content.replace(old, new, 1)
open(path, "w").write(content)
print("patched")
PYEOF

if nginx -t 2>&1; then
  systemctl reload nginx
  echo "reloaded OK"
else
  echo "nginx -t FAILED, rolling back"
  cp "$BAK" "$CONF"
  nginx -t
  echo "rollback done"
  exit 1
fi

sleep 1
for u in "/index" "/index.html" "/index%E6%95%B0%E5%BA%A6" "/" "/news" "/tools/vat"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "https://www.shuducw.com$u")
  size=$(curl -s --max-time 10 "https://www.shuducw.com$u" | wc -c)
  echo "  $u -> $code (${size}B)"
done
