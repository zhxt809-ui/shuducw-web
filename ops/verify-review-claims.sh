#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 绝对化广告词扫描（广告法违禁词，应为 0） ====="
for w in "最好" "最优" "最佳" "第一" "百分百" "100%" "保证" "绝对" "无风险" "包过" "确保" "顶级" "国家级" "最便宜" "最低价" "避税" "节税" "税负降低"; do
  n=$(curl -s "$B/" | grep -o "$w" | wc -l)
  [ "$n" -gt 0 ] && echo "  ⚠️ $w -> $n 处"
done
echo "(无输出 = 首页干净)"
echo ""
echo "===== 2. 全站主要页面同一扫描 ====="
for p in / /about /services /services/basic /services/compliance /services/consulting /faq /contact /cases; do
  for w in "最好" "最优" "第一" "百分百" "100%" "保证" "绝对"; do
    n=$(curl -s "$B$p" | grep -o "$w" | wc -l)
    [ "$n" -gt 0 ] && echo "  $p : $w -> $n"
  done
done
echo "(无输出 = 主站干净)"
echo ""
echo "===== 3. 页面结构要素核查（是否已有） ====="
home=$(curl -s "$B/")
echo "预约表单入口: $(echo "$home" | grep -c '预约咨询\|立即咨询\|免费咨询')"
echo "价格/报价信息: $(echo "$home" | grep -c '报价\|多少钱\|价格')"
echo "交付标准: $(echo "$home" | grep -c '交付标准\|服务标准\|SLA')"
echo "资质展示(代账许可): $(echo "$home" | grep -c 'DLJZ61010120170035')"
echo "纳税信用/协会: $(echo "$home" | grep -c '纳税信用\|副会长')"
echo "案例区块: $(echo "$home" | grep -c '服务实录\|案例')"
echo "ICP备案: $(echo "$home" | grep -c '陕ICP备')"
echo "公安备案: $(echo "$home" | grep -c '公网安备')"
echo "免责声明: $(echo "$home" | grep -c '不构成')"
echo "小红书入口: $(echo "$home" | grep -c '小红书')"
echo "行业覆盖: $(echo "$home" | grep -c '老年公寓\|管理咨询')"
echo ""
echo "===== 4. 服务页交付/流程说明 ====="
curl -s "$B/services/basic" | grep -oE '交付|服务流程|办理流程|周期' | sort | uniq -c | head -5
echo ""
echo "===== 5. 文章页免责声明核查（抽 2 篇） ====="
for s in xian-shipin-yecaishui-yitihua-anli 2026-shuiwujicha-zhongdian; do
  echo "--- $s ---"
  echo "  '不构成' 出现: $(curl -s "$B/news/$s" | grep -c '不构成')"
  echo "  '脱敏' 出现: $(curl -s "$B/news/$s" | grep -c '脱敏')"
done
echo ""
echo "===== 6. 表单承诺文案（SLA 是否写死） ====="
curl -s "$B/contact" | grep -oE '提交后[^<，。]*' | head -3
curl -s "$B/services/district/gaoxin" | grep -oE '提交后[^<，。]*' | head -2
