#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""图片体检：尺寸、EXIF 隐私信息、与展示尺寸的冗余比"""
import os
from PIL import Image
from PIL.ExifTags import TAGS

PUB = r"D:\md\数度网站\extracted\projects\public"

# 展示尺寸（按代码里的容器估算：桌面容器 1136px）
DISPLAY = {
    "office-1.jpg": (270, 176, "办公环境 4 列网格 h-44"),
    "office-2.jpg": (270, 176, "办公环境 4 列网格 h-44"),
    "office-3.jpg": (270, 176, "办公环境 4 列网格 h-44"),
    "honors-1.jpg": (270, 176, "办公环境 4 列网格 h-44"),
    "lecture-xaufe-2026.jpg": (550, 412, "公开活动 2 列 aspect-4/3"),
    "activity-waishi.jpg": (550, 412, "公开活动 2 列 aspect-4/3(contain)"),
    "leader-chenwenhua.jpg": (300, 380, "负责人照片"),
    "license-yingye.jpg": (140, 99, "资质证照缩略"),
    "license-daiji.jpg": (140, 99, "资质证照缩略"),
    "cert-acc-international.jpg": (180, 262, "证书缩略 max-w-180"),
    "cert-xaufe.jpg": (180, 133, "证书缩略 max-w-180"),
    "cert-waishi.jpg": (180, 126, "证书缩略 max-w-180"),
    "qr-wecom.png": (160, 160, "悬浮球企微二维码"),
    "qr-xiaohongshu.jpg": (112, 144, "小红书二维码"),
    "og.png": (1200, 630, "社交分享图（应保持1200x630）"),
    "logo.png": (200, 60, "站头 logo"),
}

rows = []
for name in sorted(os.listdir(PUB)):
    if not name.lower().endswith((".jpg", ".jpeg", ".png")):
        continue
    p = os.path.join(PUB, name)
    size_kb = os.path.getsize(p) / 1024
    with Image.open(p) as im:
        w, h = im.size
        fmt = im.format
        # EXIF
        exif_info = []
        try:
            ex = im.getexif()
            for tag_id, val in ex.items():
                tag = TAGS.get(tag_id, str(tag_id))
                if tag in ("GPSInfo", "Make", "Model", "DateTime", "DateTimeOriginal",
                           "Software", "Artist", "Copyright", "ImageDescription"):
                    exif_info.append(tag)
            gps = ex.get_ifd(0x8825)
            if gps:
                exif_info.append("GPS坐标")
        except Exception:
            pass
    disp = DISPLAY.get(name)
    if disp:
        dw, dh, where = disp
        redundant = (w * h) / float(dw * dh) if dw * dh else 0
        rows.append((name, w, h, size_kb, fmt, redundant, where, exif_info))
    else:
        rows.append((name, w, h, size_kb, fmt, None, "未在 DISPLAY 表中", exif_info))

print("=" * 118)
print(f"{'文件':<32}{'像素':<14}{'体积':>10}  {'展示尺寸':<12}{'像素冗余':>9}  {'EXIF隐私':<22}")
print("=" * 118)
for name, w, h, kb, fmt, red, where, exif in rows:
    disp = DISPLAY.get(name)
    ds = f"{disp[0]}x{disp[1]}" if disp else "-"
    rs = f"{red:.1f}x" if red else "-"
    ex = ",".join(exif) if exif else "无"
    print(f"{name:<32}{f'{w}x{h}':<14}{kb:>8.0f}KB  {ds:<12}{rs:>9}  {ex:<22}")

print("=" * 118)
total = sum(r[3] for r in rows)
print(f"合计: {total:.0f} KB")

# 超过 2 倍展示尺寸的（移动端浪费带宽，且 EXIF 可能泄露位置）
print("\n【建议压缩：像素冗余 > 2 倍】")
for name, w, h, kb, fmt, red, where, exif in rows:
    if red and red > 2:
        dw, dh, _ = DISPLAY[name]
        print(f"  {name:<32} 当前 {w}x{h} {kb:.0f}KB → 建议 {dw*2}x{dh*2} 左右（2 倍视网膜），约 {kb*0.35:.0f}KB")

print("\n【EXIF 隐私风险（建议去元数据）】")
hit = False
for name, w, h, kb, fmt, red, where, exif in rows:
    if exif:
        hit = True
        print(f"  {name:<32} 含: {','.join(exif)}")
if not hit:
    print("  无（未发现 GPS/设备信息）")
