#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 风险自查升级 ====="
sc=$(curl -s "$B/self-check")
echo "  hero'2 分钟·6 道题': $(echo "$sc" | grep -c '2 分钟 · 6 道题')"
echo "  六维度: $(echo "$sc" | grep -oE '账务规范|资金往来|发票管理|纳税申报|股东往来|内部管控' | sort -u | wc -l)/6"
echo "  '3 道题'残留: $(echo "$sc" | grep -c '3 道题')"
echo "  组件6题渲染: $(curl -s "$B/self-check" | grep -oE '出纳与会计是否分岗|老板或股东与公司之间是否有长期资金占用|对外开票和取得进项发票' | sort -u | wc -l)/3抽验"
echo "  结果口径(不吓人): $(echo "$sc" | grep -c '需要进一步关注')"
echo ""
echo "===== 2. 首页问题落点精确化 ====="
home=$(curl -s "$B/")
echo "  #5 风险不清→self-check: $(echo "$home" | grep -oE '企业利润不错，却不清楚税务风险在哪里' | head -1)"
echo "  #6 融资→consulting: $(echo "$home" | grep -oE '企业准备融资，财务数据需要规范' | head -1)"
echo "  工具区'6 道题多维自测': $(echo "$home" | grep -c '6 道题多维自测')"
echo ""
echo "===== 3. 隐私政策 ====="
pv=$(curl -s "$B/privacy")
echo "  手机号码口径: $(echo "$pv" | grep -c '手机号码、企业类型、咨询问题')"
echo "  保留期限: $(echo "$pv" | grep -c '完成咨询目的所需的合理期限内保存')"
echo ""
echo "===== 4. 联系页 hero ====="
echo "  '高端财税风控'残留: $(curl -s "$B/contact" | grep -c '高端财税风控')"
echo "  地图组件: $(curl -s "$B/contact" | grep -c '百度地图')"
echo ""
echo "===== 5. llms.txt 线上同步 ====="
ll=$(curl -s "$B/llms.txt")
echo "  五类服务章节: $(echo "$ll" | grep -cE '### 0[1-5] ')（应5）"
echo "  旧「配套与专项服务」残留: $(echo "$ll" | grep -c '配套与专项服务')（应0）"
echo "  高端残留: $(echo "$ll" | grep -c '高端')"
echo "  self-check 6题: $(echo "$ll" | grep -c '6 道题')"
echo "  下架文章残留: 五粮液=$(echo "$ll" | grep -c 'wuliangye') 餐饮=$(echo "$ll" | grep -c 'canyin-hezheng') 永明=$(echo "$ll" | grep -c 'yongmei')"
echo ""
echo "===== 6. 页面健康 ====="
for p in / /self-check /services /faq /services/delivery /about /cases /contact /privacy; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
