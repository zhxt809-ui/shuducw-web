#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
图片瘦身（任务 9 修复）：仅等比缩放 + 重新编码，绝不裁剪。
- 目标宽度按"展示尺寸 × 约 2 倍"设定，保留视网膜清晰度
- 触及不到用户指定尺寸的图（证书/营业执照 400px 宽）与社交分享图 og.png
- 不复制 EXIF（顺带去除元数据）
- 断言缩放前后长宽比一致（公差 0.5%），防止任何裁剪发生
"""
import os
import sys
from PIL import Image

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PUB = r"D:\md\数度网站\extracted\projects\public"

TARGETS = [
    # (文件名, 目标宽度, 说明)
    ("office-1.jpg", 720, "办公环境一（4 列网格，单格约 270px）"),
    ("office-2.jpg", 720, "办公环境二"),
    ("office-3.jpg", 720, "办公环境三"),
    ("honors-1.jpg", 600, "资质荣誉实拍（h-44 小格，原 1200x2133 冗余 54 倍）"),
    ("lecture-xaufe-2026.jpg", 1200, "讲座照片（about 2 列约 550px + 首页小图）"),
    ("activity-waishi.jpg", 800, "外事授牌（contain 完整显示，约 309x412）"),
    ("qr-xiaohongshu.jpg", 320, "小红书二维码（w-28 = 112px 展示）"),
]

print(f"{'文件':<28}{'缩放前':<20}{'缩放后':<20}{'体积变化':<22}{'长宽比':<10}")
print("=" * 104)
before_total = after_total = 0
for name, target_w, note in TARGETS:
    path = os.path.join(PUB, name)
    if not os.path.exists(path):
        print(f"  跳过（不存在）: {name}")
        continue
    size_before = os.path.getsize(path)
    with Image.open(path) as im:
        w0, h0 = im.size
        ratio0 = w0 / h0
        if w0 <= target_w:
            print(f"{name:<28}{f'{w0}x{h0}':<20}{'无需缩放':<20}{size_before/1024:>8.0f}KB → 不变")
            before_total += size_before
            after_total += size_before
            continue
        new_h = round(h0 * target_w / w0)
        im2 = im.convert("RGB") if im.mode in ("RGBA", "P", "LA") else im.copy()
        im2 = im2.resize((target_w, new_h), Image.LANCZOS)
    ratio1 = target_w / new_h
    assert abs(ratio1 - ratio0) / ratio0 < 0.005, f"{name} 长宽比变化过大，疑似裁剪！"
    im2.save(path, format="JPEG", quality=82, optimize=True, progressive=True)
    size_after = os.path.getsize(path)
    before_total += size_before
    after_total += size_after
    print(
        f"{name:<28}{f'{w0}x{h0}':<20}{f'{target_w}x{new_h}':<20}"
        f"{size_before/1024:>6.0f}KB -> {size_after/1024:>4.0f}KB".ljust(22)
        + ("比例一致 OK" if abs(ratio1 - ratio0) / ratio0 < 0.005 else "比例异常 BAD")
    )

print("=" * 104)
print(f"合计: {before_total/1024:.0f} KB → {after_total/1024:.0f} KB "
      f"（节省 {(before_total-after_total)/1024:.0f} KB，{100*(before_total-after_total)/before_total:.0f}%）")
print("\n说明：证书（cert-*）与营业执照（license-*）保持用户指定的 400px 宽不变；og.png 保持 1200x630 不变。")
