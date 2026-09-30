#!/bin/bash
B="https://www.shuducw.com"
echo "===== about 页 4 处修改验证 ====="
about=$(curl -s "$B/about")
echo "  HTTP: $(curl -s -o /dev/null -w '%{http_code}' $B/about)"

echo "--- 1. 资质荣誉实拍已移出右侧资质证照 ---"
echo "  资质证照区内 honors 引用: $(echo "$about" | grep -oE 'license-daiji[^<]*|honors-1' | grep -c 'honors-1')（应0）"
echo "  营业执照+许可证仍存: 营业执照=$(echo "$about" | grep -c 'license-yingye.jpg') 许可证=$(echo "$about" | grep -c 'license-daiji.jpg')"

echo "--- 2. 办公环境区含 honors-1（4图） ---"
echo "  办公环境 honors: $(echo "$about" | grep -c '/honors-1.jpg')"
echo "  描述更新: $(echo "$about" | grep -c '公司办公环境与资质荣誉实拍')"

echo "--- 3. 活动图不再硬裁（无 h-56 object-cover） ---"
echo "  活动图 object-cover 残留: $(echo "$about" | grep -oE 'h-56 object-cover' | wc -l)（应0）"

echo "--- 4. 证书区完整显示（无 h-52 裁切） ---"
echo "  证书 object-cover 残留: $(echo "$about" | grep -oE 'h-52 object-cover' | wc -l)（应0）"

echo "--- 5. 间距收窄 ---"
echo "  pb-10: $(echo "$about" | grep -c 'pb-10')  pt-10: $(echo "$about" | grep -c 'pt-10')"

echo "--- 6. cert-waishi 图片方向（横版 1391x970） ---"
curl -s -o /dev/null "$B/cert-waishi.jpg"
python3 -c "
from PIL import Image
import urllib.request, io
data = urllib.request.urlopen('$B/cert-waishi.jpg').read()
img = Image.open(io.BytesIO(data))
print('  cert-waishi 尺寸:', img.size, '（横版=已旋转）')
"
