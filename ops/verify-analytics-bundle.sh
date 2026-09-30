#!/bin/bash
D=/var/www/shuducw-run/.next/static/chunks
echo "===== 1. 埋点代码已进入客户端产物 ====="
echo "  _trackEvent 出现文件数: $(grep -rl "_trackEvent" $D 2>/dev/null | wc -l)"
echo ""
echo "===== 2. 各埋点标签逐一核对 ====="
for label in "账务风险自查" "股东往来自查" "增值税计算器" "个税计算器" "人民币大写转换器" "首页内联表单" "悬浮弹窗30秒留资" "预约咨询表单" "点击电话" "点击小红书" "打开企微二维码" "打开留资弹窗" "账务风险自查结果页" "股东往来自查结果页" "区域服务页表单" "直播电商服务页表单" "联系页表单"; do
  n=$(grep -rl "$label" $D 2>/dev/null | wc -l)
  echo "  $label -> $n 个 chunk"
done
echo ""
echo "===== 3. 百度统计基础代码仍在 ====="
echo "  layout 中 hm.js: $(grep -rl "hm.baidu.com/hm.js" /var/www/shuducw-run/.next/server 2>/dev/null | wc -l) 个文件"
echo ""
echo "===== 4. 页面回归 ====="
for p in / /self-check /shareholder-loans /contact /tools/vat /tools/income-tax /tools/rmb-uppercase /services/gaoxin; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' https://www.shuducw.com$p)"
done
