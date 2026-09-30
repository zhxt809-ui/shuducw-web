from PIL import Image, ImageOps
import os

path = r'D:\md\数度网站\extracted\projects\public\cert-waishi.jpg'

img = Image.open(path)
print('before:', img.size, img.mode)
# 先应用 EXIF 方向（得到浏览器实际显示视角），再逆时针旋转 90 度
img = ImageOps.exif_transpose(img)
img = img.rotate(90, expand=True)
print('after rotate:', img.size)

# 转 RGB 并压缩保存（与既有图片处理口径一致）
if img.mode != 'RGB':
    img = img.convert('RGB')
img.save(path, 'JPEG', quality=85, optimize=True)
print('saved:', os.path.getsize(path), 'bytes')
