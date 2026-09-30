#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 证书缩略展示 + 不可放大 ====="
about=$(curl -s "$B/about")
echo "  HTTP: $(curl -s -o /dev/null -w '%{http_code}' $B/about)"
echo "  证书区无放大链接(href=/cert): $(echo "$about" | grep -oE 'href=\"/cert-[a-z-]+\.jpg\"' | wc -l)（应0）"
echo "  证书img存在: $(echo "$about" | grep -oE 'src=\"/cert-[a-z-]+\.jpg\"' | wc -l)（应3）"
echo "  max-w-[180px]缩略: $(echo "$about" | grep -c 'max-w-\[180px\]')"
echo "  不可放大提示: $(echo "$about" | grep -c '缩略展示（不提供原图放大）')"
echo "  证书点击大图残留: $(echo "$about" | grep -oE '证书均为实拍|点击可查看大图 · 证书' | wc -l)（应0）"
echo ""
echo "===== 2. 证书图片线上像素（400px宽） ====="
for f in cert-acc-international cert-xaufe cert-waishi; do
  sz=$(curl -sI "$B/$f.jpg" | grep -i content-length | awk '{print $2}')
  echo "  $f.jpg: $(echo $sz | tr -d '\r') bytes"
done
echo ""
echo "===== 3. 活动图等高（aspect-4/3） ====="
echo "  aspect-[4/3]容器: $(echo "$about" | grep -c 'aspect-\[4/3\]')（应2）"
echo "  object-cover居中: $(echo "$about" | grep -c 'object-cover object-center')（应2）"
echo "  h-56旧裁切残留: $(echo "$about" | grep -oE 'h-56 object-cover' | wc -l)（应0）"
echo ""
echo "===== 4. 回归 ====="
for p in / /about; do
  echo "  $p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
