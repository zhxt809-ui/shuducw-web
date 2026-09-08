#!/bin/bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
GS="https://amr.guizhou.gov.cn/zfxxgk/fdzdgknr/zcfg_5626973/fl_5626974/202401/t20240129_83645691.html"
echo "=== 公司法 第二百二十四条 (减资) ==="
curl -s --max-time 25 -A "$UA" "$GS" | sed 's/<[^>]*>//g' | tr -d ' \t\r\n' | grep -oE '第二百二十四条[^第]{0,260}' | head -2
echo "=== 公司法 第四十九条 ==="
curl -s --max-time 25 -A "$UA" "$GS" | sed 's/<[^>]*>//g' | tr -d ' \t\r\n' | grep -oE '第四十九条[^第]{0,200}' | head -2
echo "=== 公司法 第五十一条 ==="
curl -s --max-time 25 -A "$UA" "$GS" | sed 's/<[^>]*>//g' | tr -d ' \t\r\n' | grep -oE '第五十一条[^第]{0,160}' | head -2
echo "=== 公司法 第五十二条 ==="
curl -s --max-time 25 -A "$UA" "$GS" | sed 's/<[^>]*>//g' | tr -d ' \t\r\n' | grep -oE '第五十二条[^第]{0,160}' | head -2
echo "=== 公司法 第五十三条 ==="
curl -s --max-time 25 -A "$UA" "$GS" | sed 's/<[^>]*>//g' | tr -d ' \t\r\n' | grep -oE '第五十三条[^第]{0,160}' | head -2
echo "=== 360 search 劳动合同法 全文 ==="
curl -s --max-time 20 -A "$UA" "https://www.so.com/s?q=%E5%8A%B3%E5%8A%A8%E5%90%88%E5%90%8C%E6%B3%95+%E7%AC%AC%E4%BA%94%E5%8D%81%E4%B8%83%E6%9D%A1+%E5%8A%B3%E5%8A%A1%E6%B4%BE%E9%81%A3+200%E4%B8%87+%E5%85%A8%E6%96%87" \
  | grep -oE 'https?://[^" ]*\.(gov\.cn|mohrss\.gov\.cn|samr\.gov\.cn)[^" ]*' | head -10
