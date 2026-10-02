#!/bin/bash
# 验证头条搜索站长平台验证文件（含"必须逐字节一致"的关键校验）
echo "===== 1. ByteDanceVerify.html 线上可访问性 ====="
CODE=$(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/ByteDanceVerify.html)
SIZE=$(curl -s https://www.shuducw.com/ByteDanceVerify.html | wc -c)
BODY=$(curl -s https://www.shuducw.com/ByteDanceVerify.html)
SHA=$(curl -s https://www.shuducw.com/ByteDanceVerify.html | sha256sum | awk '{print $1}')
echo "  HTTP 状态 : $CODE"
echo "  内容      : $BODY"
echo "  字节长度  : $SIZE  (期望 20)"
echo "  sha256    : $SHA"
echo "  期望 sha256: ac626aa8e2db1947967d688a1be92c0fc46a22455afb69ceb151a5dcb17f2079"
if [ "$SHA" = "ac626aa8e2db1947967d688a1be92c0fc46a22455afb69ceb151a5dcb17f2079" ]; then
  echo "  逐字节一致: 是 ✅"
else
  echo "  逐字节一致: 否 ❌（平台校验会失败）"
fi
echo "  Content-Type: $(curl -s -o /dev/null -w '%{content_type}' https://www.shuducw.com/ByteDanceVerify.html)"

echo ""
echo "===== 2. 是否存在多余空白/换行（平台按内容比对）====="
curl -s https://www.shuducw.com/ByteDanceVerify.html | od -c | head -3

echo ""
echo "===== 3. 旧的字节验证 token 是否已不可用（预期：已被覆盖）====="
echo -n "  旧 token Rej+JakUyI7QGPqJJk/Q 是否仍在线: "
curl -s https://www.shuducw.com/ByteDanceVerify.html | grep -q 'Rej+JakUyI7QGPqJJk/Q' && echo "是" || echo "否（已被新 token 覆盖）"

echo ""
echo "===== 4. 其他验证文件回归（不能被本次部署影响）====="
for f in sogousiteverification.txt 9c615d0ffcf44fd4a1c860a302b08850.txt 81d494eacc771fbdb6f8d6faa3f8238b.txt BingSiteAuth.xml baidu_verify_codeva-g1bYVrbUdM.html baidu_verify_codeva-t1LOLMCF42.html; do
  echo "  /$f -> HTTP $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/$f)"
done

echo ""
echo "===== 5. 站点与 sitemap 回归 ====="
echo "  首页: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/)"
echo "  资讯: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/news)"
echo "  health: $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com/api/health)"
echo "  sitemap.xml: $(curl -s https://www.shuducw.com/sitemap.xml | grep -c '<loc>') 条"
echo "  sitemap.txt: $(curl -s https://www.shuducw.com/sitemap.txt | grep -c 'https://') 条"

echo ""
echo "===== 6. 是否已有爬虫来取过该验证文件（平台校验会来抓）====="
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
grep -i 'ByteDanceVerify' "$TMP" | awk '{print "  " $1, $4, $7, $9}' | tail -5
echo "  历史请求总数: $(grep -ic 'ByteDanceVerify' "$TMP")"
rm -f "$TMP"
