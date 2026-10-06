#!/bin/bash
# 旧 URL 301 规则的线上验收
# 重点：① 旧 .html 路径是否 301 到正确落点；② 平台验证文件与正常页面是否被误伤
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
PASS=0; FAIL=0

chk() { # chk <路径> <期望状态码> <说明>
  local code=$(curl -s -o /dev/null -w '%{http_code}' -A "$UA" "https://www.shuducw.com$1")
  local dest=$(curl -s -o /dev/null -w '%{redirect_url}' -A "$UA" "https://www.shuducw.com$1")
  if [ "$code" = "$2" ]; then
    PASS=$((PASS+1)); printf "  ✅ %-46s %s  %s\n" "$1" "$code" "$3"
  else
    FAIL=$((FAIL+1)); printf "  ❌ %-46s %s（期望 %s）%s\n" "$1" "$code" "$2" "$3"
  fi
  [ -n "$dest" ] && printf "        → 落点 %s\n" "$dest"
}

echo "===== 1. 旧静态页面应 301 归位 ====="
chk /index.html   301 "→ /"
chk /index.htm    301 "→ /"
chk /about.html   301 "→ /about"
chk /news.html    301 "→ /news"
chk /contact.html 301 "→ /contact"
chk /cases.html   301 "→ /cases"
chk /service.html 301 "→ /service（新版无此路由，预期最终 404，不造假页面）"
chk /guanyu.html  301 "→ /guanyu（同上，始终 404）"

echo ""
echo "===== 2. 平台验证文件绝不能被跳转（跳了=验证失效）====="
chk /ByteDanceVerify.html                    200 "头条验证文件"
chk /baidu_verify_codeva-g1bYVrbUdM.html     200 "百度验证文件 1"
chk /baidu_verify_codeva-t1LOLMCF42.html     200 "百度验证文件 2"
chk /google28fc85f4f8afed73.html             200 "Google 验证文件"
chk /BingSiteAuth.xml                        200 "必应验证文件"
chk /sogousiteverification.txt               200 "搜狗验证文件"
chk /9c615d0ffcf44fd4a1c860a302b08850.txt    200 "IndexNow 密钥文件"

echo ""
echo "===== 3. 正常页面与接口不受影响 ====="
chk /            200 "首页"
chk /about       200 "关于我们"
chk /contact     200 "联系我们"
chk /news        200 "资讯列表"
chk /news/xian-jinshui4-fengkong-zicha-2026 200 "文章页"
chk /services/district/xincheng 200 "区县页"
chk /sitemap.xml 200 "站点地图"
chk /robots.txt  200 "robots"
chk /llms.txt    200 "llms.txt"
chk /api/health  200 "健康检查接口"

echo ""
echo "===== 4. 301 落点是否直达 200（不能出现跳转到 404 的循环）====="
for u in /index.html /about.html /news.html /contact.html /cases.html; do
  fin=$(curl -sL -o /dev/null -w '%{http_code}|%{url_effective}' -A "$UA" "https://www.shuducw.com$u")
  printf "  %-16s 最终 %-4s %s\n" "$u" "${fin%%|*}" "${fin#*|}"
done

echo ""
echo "===== 汇总 ====="
echo "  通过 $PASS 项，失败 $FAIL 项"
