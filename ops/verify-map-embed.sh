#!/bin/bash
echo "--- 联系页地图元素 ---"
curl -s https://www.shuducw.com/contact | grep -oE '公司位置|api\.map\.baidu\.com/api[^"&]*|在百度地图中查看' | sort | uniq -c
echo "--- 联系页状态 ---"
curl -s -o /dev/null -w "contact: %{http_code}\n" https://www.shuducw.com/contact
