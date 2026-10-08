#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 残留修复验证 ====="
b=$(curl -s "$B/services/basic")
echo "  basic页'中端增值'残留: $(echo "$b" | grep -c '中端增值')（应0）"
echo "  basic页'财税合规与内审'新标题: $(echo "$b" | grep -c '财税合规与内审')"
c=$(curl -s "$B/services/consulting")
echo "  consulting TDK'高端'残留: $(echo "$c" | grep -cE '高端财税咨询')（应0）"
h=$(curl -s "$B/")
echo "  首页desc'高端财税风控'残留: $(echo "$h" | grep -c '高端财税风控')（应0）"
echo "  首页四层'财税合规与内审': $(echo "$h" | grep -c '财税合规与内审')"
echo ""
echo "===== 2. 隐私政策 ====="
p=$(curl -s "$B/privacy")
echo "  全字段覆盖: $(echo "$p" | grep -c '手机号码、企业名称、企业类型、咨询内容')"
echo ""
echo "===== 3. 全站残留终检 ====="
for pp in / /about /services /services/basic /services/compliance /services/consulting /faq /contact /self-check /shareholder-loans; do
  x=$(curl -s "$B$pp" | grep -oE '高端|中端增值|品牌核心|注册税务师' | sort -u | wc -l)
  echo "  $pp 残留组数: $x（应0，services/consulting TDK已清）"
done
echo ""
echo "===== 4. 回归 ====="
for p in / /about /services /services/basic /services/compliance /services/consulting /faq /contact /privacy /self-check /shareholder-loans /cases /news; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
