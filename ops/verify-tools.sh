#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 两个工具页 ====="
for p in /tools/vat /tools/income-tax; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
echo ""
echo "===== 2. 增值税计算器内容 ====="
vat=$(curl -s "$B/tools/vat")
echo "  '小规模纳税人'按钮: $(echo "$vat" | grep -c '小规模纳税人</button>')"
echo "  '一般纳税人'按钮: $(echo "$vat" | grep -c '一般纳税人</button>')"
echo "  月销售额输入框: $(echo "$vat" | grep -c 'vat-small-sales')"
echo "  衔接公告口径说明: $(echo "$vat" | grep -c '2027-12-31')"
echo "  免责声明: $(echo "$vat" | grep -c '简化估算')"
echo "  Schema(WebApplication): $(echo "$vat" | grep -c 'applicationCategory')"
echo "  内嵌留资表单(select): $(echo "$vat" | grep -o '<select' | wc -l)"
echo ""
echo "===== 3. 个税计算器内容 ====="
iit=$(curl -s "$B/tools/income-tax")
echo "  '经营所得'按钮: $(echo "$iit" | grep -c '经营所得（个体户）</button>')"
echo "  '工资薪金'按钮: $(echo "$iit" | grep -c '工资薪金</button>')"
echo "  收入输入框: $(echo "$iit" | grep -c 'iit-biz-income')"
echo "  专项附加扣除框: $(echo "$iit" | grep -c 'iit-deduction')"
echo "  五级税率说明: $(echo "$iit" | grep -c '50 万部分 35%')"
echo "  内嵌留资表单(select): $(echo "$iit" | grep -o '<select' | wc -l)"
echo ""
echo "===== 4. SEO 同步 ====="
echo "  sitemap 含 tools: $(curl -s $B/sitemap.xml | grep -c '/tools/')  总URL: $(curl -s $B/sitemap.xml | grep -c '<loc>')"
echo "  llms.txt 免费工具章节: $(curl -s $B/llms.txt | grep -c '免费在线工具')"
echo "  页脚工具组(首页): $(curl -s $B/ | grep -c '增值税计算器')"
echo "  直播电商页内链: $(curl -s $B/services/live-commerce | grep -c '/tools/income-tax')"
echo "  basic页内链: $(curl -s $B/services/basic | grep -c '/tools/vat')"
echo ""
echo "===== 5. 标题与全页健康 ====="
t=$(curl -s "$B/tools/vat" | grep -oE '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
echo "  tools/vat 标题: $t"
echo "  品牌1次: $(echo "$t" | grep -o '西安数度财务咨询' | wc -l)次"
for p in / /services /services/basic /contact /faq /cases /self-check /news; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
