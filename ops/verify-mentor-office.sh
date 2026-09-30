#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 新图片资源 ====="
for img in office-1.jpg office-2.jpg office-3.jpg honors-1.jpg; do
  echo "  /$img -> $(curl -s -o /dev/null -w '%{http_code} %{size_download}B' $B/$img)"
done
echo ""
echo "===== 2. 首页 ====="
home=$(curl -s "$B/")
echo "  校外硕士生导师: $(echo "$home" | grep -c '受聘西安财经大学校外硕士生导师')"
echo "  中税网金牌讲师: $(echo "$home" | grep -c '中税网金牌讲师')"
echo "  二十余年(个人): $(echo "$home" | grep -c '二十余年财税咨询与企业服务实战经验')"
echo ""
echo "===== 3. /about ====="
about=$(curl -s "$B/about")
echo "  双受聘身份: 财大=$(echo "$about" | grep -c '受聘西安财经大学校外硕士生导师') 外事=$(echo "$about" | grep -c '西安外事学院商学院校外实习实训指导教师')"
echo "  中税网金牌讲师: $(echo "$about" | grep -c '中税网金牌讲师')"
echo "  财大聘书标题: $(echo "$about" | grep -c '西安财经大学校外硕士生导师聘书')"
echo "  外事聘书标题: $(echo "$about" | grep -c '西安外事学院商学院校外实习实训指导教师聘书')"
echo "  授牌仪式: $(echo "$about" | grep -c '西安外事学院授牌仪式')"
echo "  优势区'二十余年实战经验': $(echo "$about" | grep -c '二十余年实战经验')"
echo "  个人20多年/公司十几年分开: 个人=$(echo "$about" | grep -oE '二十余年财税咨询[^，。]*' | head -1) | 公司=$(echo "$about" | grep -oE '深耕西安财税市场十余年' | head -1)"
echo "  资质荣誉实拍图: $(echo "$about" | grep -c 'honors-1.jpg')"
echo "  办公环境3图: $(echo "$about" | grep -oE 'office-[123].jpg' | sort -u | wc -l)/3"
echo ""
echo "===== 4. 页面健康 ====="
for p in / /about /news /faq /services/delivery /tools/vat; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
