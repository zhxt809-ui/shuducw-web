#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 硬承诺已全部清除 ====="
total=0
for p in /contact /services/live-commerce /services/district/gaoxin /services/district/weiyang /services/district/lianhu /services/district/yanta /services/district/changan /services/district/xixian /services/district/xincheng /services/district/beilin /services/district/baqiao; do
  n=$(curl -s "$B$p" | grep -o '1 个工作日内' | wc -l)
  total=$((total+n))
  echo "  $p '1 个工作日内': $n（应0）"
done
echo "  合计（应0）: $total"
echo ""
echo "===== 2. 软口径已上线 ====="
echo "  /contact '尽快与您联系': $(curl -s $B/contact | grep -o '提交后顾问会尽快与您联系' | wc -l)"
echo "  /services/district/gaoxin '尽快与您联系（工作时段响应更快）': $(curl -s $B/services/district/gaoxin | grep -o '提交后顾问会尽快与您联系（工作时段响应更快）' | wc -l)"
echo "  /services/live-commerce 软口径: $(curl -s $B/services/live-commerce | grep -o '提交后顾问会尽快与您联系（工作时段响应更快）' | wc -l)"
echo ""
echo "===== 3. 表单成功页文案（客户端 chunk 核对）====="
D=/var/www/shuducw-run/.next/static/chunks
echo "  '客服会尽快与您联系（工作时段响应更快）': $(grep -rl '客服会尽快与您联系' $D 2>/dev/null | wc -l) 个 chunk"
echo "  首页内联/悬浮弹窗原有软口径保留: $(grep -rl '顾问将在工作日 9:00-18:00 尽快回电' $D 2>/dev/null | wc -l) 个 chunk"
echo ""
echo "===== 4. 页面回归 ====="
for p in / /contact /self-check /shareholder-loans /services/live-commerce /services/district/gaoxin /services/district/baqiao; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
