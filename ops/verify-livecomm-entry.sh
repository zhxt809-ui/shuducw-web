#!/bin/bash
echo "=== 首页导航直播电商入口 ==="
curl -s https://www.shuducw.com/ | grep -oE 'href="/services/live-commerce"' | head -1
curl -s https://www.shuducw.com/ | grep -oE '直播电商个体户财税咨询' | head -1
echo "=== 服务总览页入口 ==="
curl -s https://www.shuducw.com/services | grep -oE 'live-commerce' | head -1
