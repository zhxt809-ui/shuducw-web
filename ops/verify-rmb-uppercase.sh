#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 人民币大写转换器页面 ====="
rmb=$(curl -s "$B/tools/rmb-uppercase")
echo "  状态: $(curl -s -o /dev/null -w '%{http_code}' $B/tools/rmb-uppercase)"
echo "  输入框: $(echo "$rmb" | grep -c 'rmb-amount')"
echo "  示例速填 chips: $(echo "$rmb" | grep -o '16409.02' | wc -l)"
echo "  规则说明: $(echo "$rmb" | grep -c '壹仟肆佰零玖元伍角')"
echo "  文号依据: $(echo "$rmb" | grep -c '银发〔1997〕393号')"
echo "  Schema: $(echo "$rmb" | grep -c 'applicationCategory')"
echo "  内嵌表单(select): $(echo "$rmb" | grep -o '<select' | wc -l)"
echo ""
echo "===== 2. 导航/页脚/互链 ====="
home=$(curl -s "$B/")
echo "  首页导航含'金额大写转换': $(echo "$home" | grep -c '/tools/rmb-uppercase')"
echo "  页脚工具组含: $(echo "$home" | grep -c '金额大写转换')"
echo "  增值税页互链: $(curl -s $B/tools/vat | grep -c '/tools/rmb-uppercase')"
echo "  个税页互链: $(curl -s $B/tools/income-tax | grep -c '/tools/rmb-uppercase')"
echo ""
echo "===== 3. SEO 同步 ====="
echo "  sitemap 含 rmb-uppercase: $(curl -s $B/sitemap.xml | grep -c 'rmb-uppercase')  总URL: $(curl -s $B/sitemap.xml | grep -c '<loc>')"
echo "  llms.txt: $(curl -s $B/llms.txt | grep -c 'rmb-uppercase')"
t=$(echo "$rmb" | grep -oE '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
echo "  标题: $t"
echo "  品牌1次: $(echo "$t" | grep -o '西安数度财务咨询' | wc -l)次"
echo ""
echo "===== 4. 全页健康 ====="
for p in / /tools/vat /tools/income-tax /services/basic /contact; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
