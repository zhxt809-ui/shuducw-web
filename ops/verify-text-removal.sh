#!/bin/bash
B="https://www.shuducw.com"
about=$(curl -s "$B/about")
home=$(curl -s "$B/")
echo "===== 1. 三处文字已删 ====="
echo "  '证书实拍 · 缩略展示（不提供原图放大）': $(echo "$about" | grep -c '不提供原图放大')（应0）"
echo "  '公司办公环境与资质荣誉实拍 · 点击可查看大图': $(echo "$about" | grep -c '公司办公环境与资质荣誉实拍 · 点击可查看大图')（应0）"
echo "  活动区'点击可查看大图'(孤立): $(echo "$about" | grep -cE '>点击可查看大图<')（应0）"
echo ""
echo "===== 2. 两处图不可放大 ====="
echo "  活动区/办公环境 href 链接: $(echo "$about" | grep -oE 'href=\"/?(lecture-xaufe-2026|activity-waishi|office-[123]|honors-1)\.jpg\"' | wc -l)（应0）"
echo "  证书 href 链接: $(echo "$about" | grep -oE 'href=\"/cert-[a-z-]+\.jpg\"' | wc -l)（应0）"
echo "  营业执照/许可证 href 保留: $(echo "$about" | grep -oE 'href=\"/license-[a-z]+\.jpg\"' | wc -l)（应2）"
echo ""
echo "===== 3. 图片仍在展示 ====="
echo "  活动图 img: $(echo "$about" | grep -oE 'src=\"/?(lecture-xaufe-2026|activity-waishi)\.jpg\"' | wc -l)（应2）"
echo "  办公环境 img: $(echo "$about" | grep -oE 'src=\"/?(office-[123]|honors-1)\.jpg\"' | wc -l)（应4）"
echo "  证书 img: $(echo "$about" | grep -oE 'src=\"/cert-[a-z-]+\.jpg\"' | wc -l)（应3）"
echo ""
echo "===== 4. 公司全称（上一批）回归 ====="
echo "  首页bullet带'有限公司': $(echo "$home" | grep -c '2012 年创立西安数度财务咨询有限公司')"
echo "  首页'（高校官网报道）'残留: $(echo "$home" | grep -c '（高校官网报道）')"
echo "  讲座锚文本保留: $(echo "$home" | grep -c '高校官网报道')"
echo "  about两处'有限公司': $(echo "$about" | grep -c '2012 年创立西安数度财务咨询有限公司')（应2）"
echo ""
echo "===== 5. 回归 ====="
for p in / /about; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
