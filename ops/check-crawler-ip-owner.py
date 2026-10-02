#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""反查抓取过 sitemap 的 IP 归属，确认哪些是真字节爬虫（避免仅凭行为判断）"""
import socket
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

IPS = [
    ('110.249.202.133', 'Bytespider 抓 sitemap'),
    ('110.249.202.146', 'Bytespider 抓 sitemap'),
    ('111.225.149.156', 'Bytespider 抓 sitemap'),
    ('122.14.227.46', 'Bytespider 抓 sitemap'),
    ('122.14.226.42', 'Bytespider 抓 sitemap'),
    ('122.14.227.17', 'Bytespider 抓 license 图片'),
    ('47.128.109.62', '伪装 Bytespider 扫描器'),
    ('34.26.8.244', '伪装 Bytespider 扫描器'),
    ('35.229.101.30', '伪装 Bytespider 扫描器'),
    ('220.181.108.82', '真实 Baiduspider'),
]

print('===== 反向 DNS 解析 =====')
for ip, note in IPS:
    try:
        name = socket.gethostbyaddr(ip)[0]
    except Exception as e:
        name = f'(无 PTR 记录: {type(e).__name__})'
    print(f'  {ip:18} -> {name}   [{note}]')

print('')
print('===== 结论判据 =====')
print('  含 bytedance/bytedns/toutiao/byte 字样的 PTR 可支持"归属字节"的判断；')
print('  无 PTR 记录时只能依据"是否落在已公开的字节爬虫 IP 段"来判断，需在报告中如实标注。')
