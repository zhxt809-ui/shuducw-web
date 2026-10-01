#!/bin/bash
# 静态图片强缓存补丁（2026-10-01）
# 背景：Next standalone 对 public/ 下文件返回 Cache-Control: public, max-age=0，
#       导致老访客每次访问都要对十几张图片逐一回源校验（304 往返）。
# 做法：为常见图片扩展名加 7 天强缓存；文件名无内容哈希，故不用 immutable。
# 同时把 /_next/static/ 升级为 ^~ 前缀匹配，避免被新正则抢走（哈希文件保留一年 immutable）。
set -e
CONF="/etc/nginx/sites-enabled/shuducw"
BAKDIR="/root/nginx-backups"
mkdir -p "$BAKDIR"
BAK="$BAKDIR/shuducw.bak-$(date +%Y%m%d%H%M%S)"
cp "$CONF" "$BAK"
echo "backup: $BAK"

if grep -q "静态图片强缓存" "$CONF"; then
  echo "already patched, skip"
  exit 0
fi

python3 - "$CONF" <<'PYEOF'
import sys
path = sys.argv[1]
content = open(path).read()

# 1) /_next/static/ 用 ^~ 前缀匹配，保证哈希静态资源不被下面的图片正则抢走
old_static = "    location /_next/static/ {"
assert content.count(old_static) == 1, "/_next/static/ location 不止一处，中止"
content = content.replace(old_static, "    location ^~ /_next/static/ {", 1)

# 2) 图片强缓存规则，插到 location / 之前
block = """    # 静态图片强缓存（2026-10-01）：Next 对 public/ 文件默认 max-age=0，改为 7 天
    location ~* \\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_hide_header Cache-Control;
        proxy_hide_header Expires;
        add_header Cache-Control "public, max-age=604800" always;
        access_log off;
    }

    location / {"""
assert content.count("    location / {") == 1, "location / 不止一处，中止"
content = content.replace("    location / {", block, 1)

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
echo "--- 验证：图片缓存头 ---"
for u in /office-1.jpg /logo.png /og.png /favicon.ico; do
  echo "  $u"
  curl -s -o /dev/null -D - --max-time 10 "https://www.shuducw.com$u" | grep -iE '^(HTTP|content-type|cache-control|expires)' | sed 's/^/      /'
done
echo "--- 验证：/_next/static 仍为 immutable ---"
js=$(curl -s --max-time 10 "https://www.shuducw.com/" | grep -oE '/_next/static/[^"]+\.js' | head -1)
curl -s -o /dev/null -D - --max-time 10 "https://www.shuducw.com$js" | grep -iE '^(HTTP|cache-control)' | sed 's/^/      /'
echo "--- 验证：页面仍 200 ---"
for p in / /about /contact /news; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' --max-time 15 https://www.shuducw.com$p)"
done
echo "--- 验证：图片体积未变（应与优化后一致）---"
for f in office-1.jpg office-2.jpg honors-1.jpg; do
  echo "  $f -> $(curl -s --max-time 15 https://www.shuducw.com/$f | wc -c) 字节"
done
