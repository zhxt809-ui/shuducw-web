#!/bin/bash
curl -sL --max-time 20 'https://sxy.xaufe.edu.cn/info/1061/10377.htm' -A 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' -o /tmp/xaufe.html
echo "size: $(wc -c < /tmp/xaufe.html)"
echo "--- title ---"
grep -oE '<title>[^<]*</title>' /tmp/xaufe.html
echo "--- 陈文华 出现次数 ---"
grep -o '陈文华' /tmp/xaufe.html | wc -l
echo "--- 讲座相关文本 ---"
grep -oE '财税计划[^<]{0,50}' /tmp/xaufe.html | head -3
echo "--- 正文提取（去标签后含关键词的段落） ---"
python3 -c "
import re
html = open('/tmp/xaufe.html', encoding='utf-8', errors='ignore').read()
text = re.sub(r'<script[\s\S]*?</script>', '', html)
text = re.sub(r'<style[\s\S]*?</style>', '', text)
text = re.sub(r'<[^>]+>', '\n', text)
text = re.sub(r'\n+', '\n', text)
lines = [l.strip() for l in text.split('\n') if len(l.strip()) > 15]
for l in lines[:60]:
    print(l)
"
