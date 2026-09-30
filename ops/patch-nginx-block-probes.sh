#!/bin/bash
set -e
CONF="/etc/nginx/sites-enabled/shuducw"
BAKDIR="/root/nginx-backups"
mkdir -p "$BAKDIR"
BAK="$BAKDIR/shuducw.bak-$(date +%Y%m%d%H%M%S)"

# 1. 备份
cp "$CONF" "$BAK"
echo "backup: $BAK"

# 2. 已加过就不重复加
if grep -q "扫描器探针拦截" "$CONF"; then
  echo "already patched, skip"
  exit 0
fi

# 3. 在主 server 块的 location / 前插入拦截规则
python3 - "$CONF" <<'PYEOF'
import sys
path = sys.argv[1]
content = open(path).read()
block = """    # 扫描器探针拦截（2026-09-30）：本站无 PHP、无 /article/ 路由，nginx 层直接 404
    location ~* \\.php$ { return 404; }
    location ~* ^/article/ { return 404; }
    location ~* ^/(wp-admin|wp-login|xmlrpc|phpinfo|\\.env) { return 404; }

    location / {"""
assert content.count("    location / {") == 1, "location / 不止一处，中止"
content = content.replace("    location / {", block, 1)
open(path, "w").write(content)
print("patched")
PYEOF

# 4. 语法测试，失败即回滚
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

# 5. 验证
sleep 1
echo "--- 验证 ---"
for u in "/article/detail-47023.html" "/index.html" "/index" "/wp-admin/" "/.env" "/x.php" "/"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "https://www.shuducw.com$u")
  size=$(curl -s --max-time 10 "https://www.shuducw.com$u" | wc -c)
  echo "  $u -> $code (${size}B)"
done
