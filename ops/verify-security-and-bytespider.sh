#!/bin/bash
# 1) 验证字节爬虫探测过的敏感路径是否都被安全挡掉（不能有 .env / 凭证泄漏）
# 2) 复查字节爬虫到底有没有抓过内容页
echo "===== 1. 敏感路径安全验证（全部应为 404/403/301，绝不能 200 返回内容）====="
for p in "/staging/.env" "/core/.env" "/env.old" "/api/.env.bak" \
         "/@fs/src/.env?raw" "/@fs/root/.aws/credentials?raw" "/__vite_rsc_findSourceMapURL?filename=file:///app/.env" \
         "/.env" "/.git/config" "/v1/graphql" "/dashboard" "/_payload.json" "/api/auth/" "/api/config"; do
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "https://www.shuducw.com$p")
  SIZE=$(curl -s "https://www.shuducw.com$p" | wc -c)
  FLAG="✅"
  if [ "$CODE" = "200" ]; then FLAG="⚠️ 需检查"; fi
  printf "  %s  %-3s  %7s 字节  %s\n" "$FLAG" "$CODE" "$SIZE" "$p"
done

echo ""
echo "===== 2. 字节爬虫是否抓过我们的内容页（严格：排除我方 IP，只看 crawl.bytedance.com）====="
cd /var/log/nginx || exit 1
TMP=$(mktemp); zcat -f access.log.*.gz access.log.1 access.log 2>/dev/null > "$TMP"
grep -i 'bytespider' "$TMP" | grep -vE '^(8\.152\.3\.67|85\.149\.220\.12) ' > /tmp/bsp.txt
echo "  Bytespider 请求总数: $(wc -l < /tmp/bsp.txt)"
echo "  其中 robots.txt: $(awk '$7=="/robots.txt"' /tmp/bsp.txt | wc -l)"
echo "  其中 sitemap.xml: $(awk '$7=="/sitemap.xml"' /tmp/bsp.txt | wc -l)"
echo "  其中首页: $(awk '$7=="/"' /tmp/bsp.txt | wc -l)"
echo "  其中验证文件: $(awk '$7=="/ByteDanceVerify.html"' /tmp/bsp.txt | wc -l)"
echo "  其中【真正的资讯/服务内容页】: $(awk '$7 ~ /^\/(news|services|about|faq|contact|tools)/' /tmp/bsp.txt | wc -l)"
echo "  其中敏感路径探测(.env/.git/AWS/等): $(awk '$7 ~ /\.env|\.git|@fs|aws|graphql|dashboard|payload|api\/auth|api\/config|staging/' /tmp/bsp.txt | wc -l)"
echo ""
echo "  时间跨度: $(head -1 /tmp/bsp.txt | awk '{print $4}') → $(tail -1 /tmp/bsp.txt | awk '{print $4}')"
echo "  最近 6 次 Bytespider 请求:"
tail -6 /tmp/bsp.txt | awk '{print "    " $1, $4, $7, $9}'
rm -f "$TMP" /tmp/bsp.txt
