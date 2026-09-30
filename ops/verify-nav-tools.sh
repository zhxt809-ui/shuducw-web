#!/bin/bash
B="https://www.shuducw.com"
curl -s "$B/" > /tmp/h.html
echo "===== 顶部导航（首页） ====="
echo "  '在线工具'菜单项: $(grep -c '在线工具' /tmp/h.html)"
echo "  /tools/vat 链接: $(grep -c 'href="/tools/vat"' /tmp/h.html)"
echo "  /tools/income-tax 链接: $(grep -c '/tools/income-tax' /tmp/h.html)"
echo "  /self-check 链接: $(grep -c 'href="/self-check"' /tmp/h.html)"
echo "  财税服务下拉含交付标准: $(grep -c '服务交付标准' /tmp/h.html)"
echo "  页脚工具组仍在: $(grep -c '增值税计算器' /tmp/h.html)"
echo ""
echo "===== 工具页与导航健康 ====="
for p in /tools/vat /tools/income-tax /services/basic /about /news /cases /faq /contact; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
