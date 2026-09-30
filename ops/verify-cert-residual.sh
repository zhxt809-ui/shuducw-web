#!/bin/bash
B="https://www.shuducw.com"
about=$(curl -s "$B/about")
echo "== 证书旧文案实际出现 =="
echo "$about" | grep -oE '证书均为实拍|点击可查看大图 · 证书' | sort | uniq -c
echo "== 点击可查看大图 全部出现位置 =="
echo "$about" | grep -oE '.{0,25}点击可查看大图.{0,15}' | sort | uniq -c
echo "== aspect/object-center 精确计数 =="
echo "aspect-4-3: $(echo "$about" | grep -o 'aspect-\[4/3\]' | wc -l)"
echo "object-cover object-center: $(echo "$about" | grep -o 'object-cover object-center' | wc -l)"
