#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 股东往来专题页 ====="
sl=$(curl -s "$B/shareholder-loans")
echo "  HTTP: $(curl -s -o /dev/null -w '%{http_code}' $B/shareholder-loans)"
echo "  H1: $(echo "$sl" | grep -oE '<h1[^>]*>[^<]*</h1>' | head -1)"
echo "  政策依据: 158号=$(echo "$sl" | grep -c '财税〔2003〕158号') 25号公告=$(echo "$sl" | grep -c '国家税务总局公告2011年第25号')"
echo "  官方来源链接: $(echo "$sl" | grep -c 'fgk.chinatax.gov.cn')"
echo "  自查工具入口: $(echo "$sl" | grep -c '股东往来风险自查')"
echo "  四类场景: $(echo "$sl" | grep -oE '股东长期借款不还|公款垫付个人消费|个人账户收公司款|往来科目长期挂账' | sort -u | wc -l)/4"
echo "  合规路径: $(echo "$sl" | grep -oE '年度内归还|签订书面借款协议|依法按分红处理|定期清理往来' | sort -u | wc -l)/4"
echo "  FAQPage Schema: $(echo "$sl" | grep -c 'FAQPage')"
echo "  Breadcrumb Schema: $(echo "$sl" | grep -c 'BreadcrumbList')"
echo "  延伸阅读80万案例: $(echo "$sl" | grep -c 'xian-wanglaizhang-guazhang-80wan')"
echo "  工具5题在bundle: $(grep -l '股东往来自查' /var/www/shuducw-run/.next/static/chunks/*.js 2>/dev/null | head -1)"
echo ""
echo "===== 2. 首页问题卡落点 ====="
home=$(curl -s "$B/")
echo "  股东往来卡→专题页: $(echo "$home" | grep -c '/shareholder-loans')"
echo ""
echo "===== 3. FAQ 新增2题 + Schema ====="
faq=$(curl -s "$B/faq")
echo "  股东借款不还: $(echo "$faq" | grep -c '股东从公司借款长期不还，要交税吗')"
echo "  公款买豪车: $(echo "$faq" | grep -c '公司用公款给股东买豪车')"
echo "  FAQPage mainEntity 数量: $(echo "$faq" | grep -oE '\"@type\":\"Question\"' | wc -l)"
echo ""
echo "===== 4. self-check 交叉链 ====="
echo "  股东往来自查链接: $(curl -s "$B/self-check" | grep -c '/shareholder-loans')"
echo ""
echo "===== 5. sitemap + llms 收录 ====="
echo "  sitemap含专题页: $(curl -s "$B/sitemap.xml" | grep -c 'shareholder-loans')"
ll=$(curl -s "$B/llms.txt")
echo "  llms含专题页: $(echo "$ll" | grep -c 'shareholder-loans')"
echo "  llms FAQ计数30: $(echo "$ll" | grep -c '30 个高频财税问题')"
echo ""
echo "===== 6. 回归 ====="
for p in / /services /faq /self-check /services/consulting /services/compliance; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
