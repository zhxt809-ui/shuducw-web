#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. /services/basic 顶部参考价条 ====="
basic=$(curl -s "$B/services/basic")
echo "  '代账参考区间': $(echo "$basic" | grep -c '代账参考区间')"
echo "  '2000-4000' 次数: $(echo "$basic" | grep -o '2000-4000' | wc -l)"
echo "  '查看交付标准': $(echo "$basic" | grep -c '查看交付标准')"
echo ""
echo "===== 2. 区县 FAQ 数量（应全部 5 条） ====="
for d in gaoxin weiyang lianhu yanta changan xixian xincheng beilin baqiao; do
  n=$(curl -s "$B/services/district/$d" | python3 -c "import sys,re; t=sys.stdin.read(); print(len(re.findall(r'\"@type\":\"Question\"', t)))")
  echo "  $d -> $n"
done
echo ""
echo "===== 3. 新增 FAQ 内容在页 ====="
echo "  gaoxin 研发费用归集: $(curl -s $B/services/district/gaoxin | grep -c '代账机构能处理研发费用归集吗')"
echo "  gaoxin 集群注册: $(curl -s $B/services/district/gaoxin | grep -c '孵化器集群注册的公司')"
echo "  lianhu 账务交接: $(curl -s $B/services/district/lianhu | grep -c '更换代账公司，账务交接')"
echo "  xincheng 风险提示: $(curl -s $B/services/district/xincheng | grep -c '税务风险提示或异常提醒')"
echo ""
echo "===== 4. 页面状态 ====="
for p in /services/basic /services/district/gaoxin /services/district/lianhu /services/district/xincheng; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
