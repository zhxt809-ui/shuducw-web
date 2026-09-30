#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 业务范围页：四层客户语言 ====="
srv=$(curl -s "$B/services")
echo "  核心业务体系标题: $(echo "$srv" | grep -c '核心业务体系')"
echo "  四层模块: $(echo "$srv" | grep -oE '基础财税托管|财务规范与税务合规|内部管理与风险控制|财税顾问与专项咨询' | sort -u | wc -l)/4"
echo "  配套与专项服务: $(echo "$srv" | grep -c '配套与专项服务')"
echo "  旧'中端增值/高端增值/品牌核心'残留: $(echo "$srv" | grep -oE '中端增值|高端增值|品牌核心' | sort -u | wc -l)（应0）"
echo "  旧'高端'残留: $(echo "$srv" | grep -o '高端' | wc -l)"
echo ""
echo "===== 2. FAQ 政策体检 ====="
faq=$(curl -s "$B/faq")
echo "  注销: 简易20日=$(echo "$faq" | grep -c '简易注销，公示期为 20 日') 普通45日=$(echo "$faq" | grep -c '公告期通常为 45 日')"
echo "  内审(管理建议): $(echo "$faq" | grep -c '并非对所有企业都有法定要求')"
echo "  高企补贴(地区): $(echo "$faq" | grep -c '部分地区可能根据当地政策提供一次性奖励')"
echo "  税务师: $(echo "$faq" | grep -c '税务师') / 注册税务师残留: $(echo "$faq" | grep -c '注册税务师')"
echo "  更新时间块: $(echo "$faq" | grep -c '本页内容更新于 2026 年 9 月')"
echo ""
echo "===== 3. 全站注册税务师→税务师 ====="
for p in / /about /services /faq /cases /news /tools/vat; do
  c=$(curl -s "$B$p" | grep -o '注册税务师' | wc -l)
  echo "  $p 注册税务师: $c"
done
echo ""
echo "===== 4. 负责人资质三分组（首页+/about） ====="
home=$(curl -s "$B/")
echo "  首页: 专业资质=$(echo "$home" | grep -c '专业资质') 荣誉与社会任职=$(echo "$home" | grep -c '荣誉与社会任职')"
about=$(curl -s "$B/about")
echo "  /about: 专业资质=$(echo "$about" | grep -c '专业资质') 荣誉与社会任职=$(echo "$about" | grep -c '荣誉与社会任职')"
echo ""
echo "===== 5. 交付标准页专项流程 ====="
del=$(curl -s "$B/services/delivery")
echo "  专项服务交付流程: $(echo "$del" | grep -c '专项服务交付流程')"
echo "  三类流程: 风险排查=$(echo "$del" | grep -c '财税风险排查交付') 内审=$(echo "$del" | grep -c '内部管理审计交付') 顾问=$(echo "$del" | grep -c '常年财税顾问交付')"
echo ""
echo "===== 6. 案例档案（服务实录页） ====="
for slug in xian-shipin-yecaishui-yitihua-anli xian-baoxian-caiwu-zixun-shuiwu-hegui-anli xian-gaoxin-jishu-qiye-caiwu-guwen-anli; do
  a=$(curl -s "$B/news/$slug")
  echo "  $slug 案例档案: $(echo "$a" | grep -c '案例档案')"
done
echo ""
echo "===== 7. 页面健康 + 标题 ====="
for p in / /services /faq /services/delivery /about /cases /news; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
echo "  /services title: $(curl -s $B/services | grep -oE '<title>[^<]*</title>' | head -1)"
echo "  /faq title: $(curl -s $B/faq | grep -oE '<title>[^<]*</title>' | head -1)"
