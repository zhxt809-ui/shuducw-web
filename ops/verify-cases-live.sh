#!/bin/bash
echo "=== 三篇案例页面状态 ==="
for s in xian-shipin-yecaishui-yitihua-anli xian-baoxian-caiwu-zixun-shuiwu-hegui-anli xian-gaoxin-jishu-qiye-caiwu-guwen-anli; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://www.shuducw.com/news/$s")
  echo "$s -> $code"
done
echo "=== 案例1 文案检查（应无'应客户要求'，含'脱敏处理'） ==="
curl -s https://www.shuducw.com/news/xian-shipin-yecaishui-yitihua-anli | grep -oE '脱敏处理|应客户要求|业财税一体化' | sort | uniq -c
echo "=== 资讯列表 cases 分类是否出现三篇 ==="
curl -s "https://www.shuducw.com/news/cases" | grep -oE '业财税一体化|保险销售企业财税服务|高新技术企业常年财税顾问' | sort | uniq -c
