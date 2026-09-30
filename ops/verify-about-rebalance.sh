#!/bin/bash
B="https://www.shuducw.com"
a=$(curl -s "$B/about")
echo "===== 1. 板块顺序：服务行业覆盖应在核心资质之前（贵在左列正文之后）====="
pos_ind=$(echo "$a" | grep -bo '服务行业覆盖' | head -1 | cut -d: -f1)
pos_cred=$(echo "$a" | grep -bo '核心资质' | head -1 | cut -d: -f1)
pos_lic=$(echo "$a" | grep -bo '资质证照' | head -1 | cut -d: -f1)
pos_head=$(echo "$a" | grep -bo '企业负责人' | head -1 | cut -d: -f1)
echo "  公司简介 位置: $(echo "$a" | grep -bo '公司简介' | head -1 | cut -d: -f1)"
echo "  服务行业覆盖 位置: $pos_ind"
echo "  核心资质 位置: $pos_cred"
echo "  资质证照 位置: $pos_lic"
echo "  企业负责人 位置: $pos_head"
if [ "$pos_ind" -lt "$pos_cred" ]; then echo "  ✓ 顺序正确：服务行业覆盖 < 核心资质"; else echo "  ✗ 顺序错误"; fi
echo ""
echo "===== 2. 间距类名 ====="
echo "  简介 !pb-4 md:!pb-6: $(echo "$a" | grep -o 'section-padding !pb-4 md:!pb-6' | wc -l)"
echo "  负责人 !pt-6 md:!pt-8: $(echo "$a" | grep -o 'section-padding !pt-6 md:!pt-8' | wc -l)"
echo ""
echo "===== 3. 内容完整性（搬迁未丢内容）====="
echo "  服务行业覆盖 出现次数: $(echo "$a" | grep -o '服务行业覆盖' | wc -l)"
echo "  核心资质 出现次数: $(echo "$a" | grep -o '核心资质' | wc -l)"
echo "  适配初创、成长型 提示: $(echo "$a" | grep -o '适配初创、成长型、中小型企业全周期需求' | wc -l)"
echo "  企业负责人板块元素(照片/活动/证书/办公环境): $(echo "$a" | grep -oE '公开活动|负责人资质证书|办公环境' | sort -u | tr '\n' ' ')"
echo ""
echo "===== 4. 页面回归 ====="
for p in /about / /services /contact; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
