#!/bin/bash
# 验证 Bing 站长平台验证文件（含逐字节校验）
echo "===== 1. BingSiteAuth.xml 线上可访问性 ====="
CODE=$(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/BingSiteAuth.xml)
SIZE=$(curl -s https://www.shuducw.com/BingSiteAuth.xml | wc -c)
SHA=$(curl -s https://www.shuducw.com/BingSiteAuth.xml | sha256sum | awk '{print $1}')
echo "  HTTP 状态 : $CODE"
echo "  字节长度  : $SIZE  (期望 85)"
echo "  sha256    : $SHA"
echo "  期望 sha256: a3d324a738c91909661693481703a4dc39d6a0e9d2e6b149cde1c589e2ce6f83"
if [ "$SHA" = "a3d324a738c91909661693481703a4dc39d6a0e9d2e6b149cde1c589e2ce6f83" ]; then
  echo "  逐字节一致: 是 ✅"
else
  echo "  逐字节一致: 否 ❌（平台校验会失败）"
fi
echo "  Content-Type: $(curl -s -o /dev/null -w '%{content_type}' https://www.shuducw.com/BingSiteAuth.xml)"
echo "  内容:"
curl -s https://www.shuducw.com/BingSiteAuth.xml | sed 's/^/    /'

echo ""
echo "===== 2. 旧 token 是否已被覆盖（预期：是）====="
echo -n "  旧 token 4194D34733ECFB57BFB6802C2A640301 是否仍在线: "
curl -s https://www.shuducw.com/BingSiteAuth.xml | grep -q '4194D34733ECFB57BFB6802C2A640301' && echo "是" || echo "否（已被新 token 覆盖）"
echo -n "  新 token 1EF159F45674E8DD28A5BF361D34FF7D 在线: "
curl -s https://www.shuducw.com/BingSiteAuth.xml | grep -q '1EF159F45674E8DD28A5BF361D34FF7D' && echo "是 ✅" || echo "否 ❌"

echo ""
echo "===== 3. 其他验证文件回归 ====="
for f in ByteDanceVerify.html sogousiteverification.txt 9c615d0ffcf44fd4a1c860a302b08850.txt 81d494eacc771fbdb6f8d6faa3f8238b.txt baidu_verify_codeva-g1bYVrbUdM.html baidu_verify_codeva-t1LOLMCF42.html; do
  echo "  /$f -> HTTP $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/$f)"
done

echo ""
echo "===== 4. 站点与 sitemap 回归 ====="
echo "  首页: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/)"
echo "  health: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/api/health)"
echo "  sitemap.xml: $(curl -s https://www.shuducw.com/sitemap.xml | grep -c '<loc>') 条"
echo "  首页标题: $(curl -s https://www.shuducw.com/ | grep -o '<title>[^<]*</title>' | head -1)"

echo ""
echo "===== 5. Bing 系爬虫是否来取过验证文件 / sitemap（Bing 校验时的关键动作）====="
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
echo "  /BingSiteAuth.xml 历史请求:"
grep 'BingSiteAuth' "$TMP" | awk '{print "    " $1, $4, $7, $9}' | tail -6
echo "  bingbot 累计请求: $(grep -ci 'bingbot' "$TMP") 次"
echo "  bingbot 最近 5 次:"
grep -i 'bingbot' "$TMP" | tail -5 | awk '{print "    " $1, $4, $7, $9}'
rm -f "$TMP"
