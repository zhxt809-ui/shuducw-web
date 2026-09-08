#!/bin/bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
echo "=== 国务院规定全文 (2032核对 + 全部条款) ==="
curl -s --max-time 25 -A "$UA" "https://www.gov.cn/zhengce/zhengceku/202407/content_6960377.htm" \
  | sed 's/<[^>]*>//g' | tr -s ' \n' ' \n' | grep -oE '第[一二三四五六七八九十百0-9]+条[^。]*。' | head -30
echo "=== 2032 相关句子 ==="
curl -s --max-time 25 -A "$UA" "https://www.gov.cn/zhengce/zhengceku/202407/content_6960377.htm" \
  | sed 's/<[^>]*>//g' | grep -oE '[^。；]*2032[^。；]*[。；]' | head -10
echo "=== 公司法全文 (贵州市监局) 47/54/88条 ==="
curl -s --max-time 25 -A "$UA" "https://amr.guizhou.gov.cn/zfxxgk/fdzdgknr/zcfg_5626973/fl_5626974/202401/t20240129_83645691.html" \
  | sed 's/<[^>]*>//g' | tr -d ' \t\r\n' | grep -oE '第四十七条[^第]{0,180}' | head -3
echo "---54---"
curl -s --max-time 25 -A "$UA" "https://amr.guizhou.gov.cn/zfxxgk/fdzdgknr/zcfg_5626973/fl_5626974/202401/t20240129_83645691.html" \
  | sed 's/<[^>]*>//g' | tr -d ' \t\r\n' | grep -oE '第五十四条[^第]{0,180}' | head -3
echo "---88---"
curl -s --max-time 25 -A "$UA" "https://amr.guizhou.gov.cn/zfxxgk/fdzdgknr/zcfg_5626973/fl_5626974/202401/t20240129_83645691.html" \
  | sed 's/<[^>]*>//g' | tr -d ' \t\r\n' | grep -oE '第八十八条[^第]{0,180}' | head -3
