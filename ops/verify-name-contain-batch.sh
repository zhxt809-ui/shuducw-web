#!/bin/bash
B="https://www.shuducw.com"
about=$(curl -s "$B/about")
home=$(curl -s "$B/")
echo "===== 1. 公司全称统一 ====="
echo "  首页bullet（无'高校官网报道'、带'有限公司'）: $(echo "$home" | grep -c '二十余年财税咨询与企业服务实战经验，2012 年创立西安数度财务咨询有限公司')"
echo "  首页'（高校官网报道）'残留: $(echo "$home" | grep -c '（高校官网报道）')"
echo "  about优势desc带'有限公司': $(echo "$about" | grep -c '2012 年创立西安数度财务咨询有限公司，深耕')"
echo "  about负责人简介带'有限公司': $(echo "$about" | grep -c '2012 年创立西安数度财务咨询有限公司，中税网金牌讲师')"
echo "  首页讲座链接锚文本保留: $(echo "$home" | grep -c '高校官网报道')"
echo ""
echo "===== 2. 外事授牌图 object-contain ====="
echo "  activity object-contain: $(echo "$about" | grep -o 'src=\"/activity-waishi.jpg\".\{0,200\}' | grep -c 'object-contain')"
echo "  lecture object-cover保留: $(echo "$about" | grep -o 'src=\"/lecture-xaufe-2026.jpg\".\{0,200\}' | grep -c 'object-cover')"
echo ""
echo "===== 3. 回归 ====="
for p in / /about; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
