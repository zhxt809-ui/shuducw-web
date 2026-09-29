#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 标题品牌重复修复（应全部为 1 次） ====="
for p in / /about /services /faq /contact /cases /news /self-check /services/district/gaoxin /services/district/baqiao /services/live-commerce; do
  t=$(curl -s "$B$p" | grep -oE '<title>[^<]*</title>' | head -1 | sed 's/<[^>]*>//g')
  echo "  [$(echo "$t" | grep -o '西安数度财务咨询' | wc -l)次] $p"
done
echo "  --- 文章页 ---"
t=$(curl -s "$B/news/2026-shuiwujicha-zhongdian" | grep -oE '<title>[^<]*</title>' | head -1 | sed 's/<[^>]*>//g')
echo "  [$(echo "$t" | grep -o '西安数度财务咨询' | wc -l)次] /news/2026-shuiwujicha-zhongdian"
echo "  --- 分类页 ---"
t=$(curl -s "$B/news/tips" | grep -oE '<title>[^<]*</title>' | head -1 | sed 's/<[^>]*>//g')
echo "  [$(echo "$t" | grep -o '西安数度财务咨询' | wc -l)次] /news/tips"
echo ""
echo "===== 2. 首页极简留资表单（豆包①） ====="
home=$(curl -s "$B/")
echo "  input 数: $(echo "$home" | grep -o '<input' | wc -l)  select 数: $(echo "$home" | grep -o '<select' | wc -l)"
echo "  含'30 秒留资': $(echo "$home" | grep -c '30 秒留资')"
echo "  含'提交，等顾问联系': $(echo "$home" | grep -c '提交，等顾问联系')"
echo "  含蜜罐字段: $(echo "$home" | grep -c 'aria-hidden=\"true\"')"
echo ""
echo "===== 3. 文章页公私域互导（豆包⑤） ====="
art=$(curl -s "$B/news/2026-shuiwujicha-zhongdian")
echo "  小红书链接: $(echo "$art" | grep -c 'xiaohongshu.com/user/profile/6521552259')"
echo "  企微二维码图: $(echo "$art" | grep -c 'qr-wecom.png')"
echo "  免费自查入口: $(echo "$art" | grep -c '/self-check')"
echo "  含'扫码加企微顾问': $(echo "$art" | grep -c '扫码加企微顾问')"
echo ""
echo "===== 4. 页面状态 ====="
for p in / /news/2026-shuiwujicha-zhongdian /services /faq; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
echo ""
echo "===== 5. 咨询数据未被测试污染 ====="
curl -s "$B/api/health"
