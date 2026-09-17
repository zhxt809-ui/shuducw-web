#!/bin/bash
echo "--- 联系页地图链接 ---"
curl -s https://www.shuducw.com/contact | grep -oE '查看百度地图|map\.baidu\.com/search[^"&]*' | head -4
echo "--- 联系页状态 ---"
curl -s -o /dev/null -w "contact: %{http_code}\n" https://www.shuducw.com/contact
echo "--- 百度地图链接可达性（服务器出网测试） ---"
curl -s -o /dev/null -w "baidu-map link: %{http_code}\n" -L --max-time 15 "https://map.baidu.com/search/%E8%A5%BF%E5%AE%89%E5%B8%82%E9%AB%98%E6%96%B0%E5%8C%BA%E5%94%90%E5%BB%B6%E8%B7%AF35%E5%8F%B7%E6%97%BA%E5%BA%A7%E7%8E%B0%E4%BB%A3%E5%9F%8E"
