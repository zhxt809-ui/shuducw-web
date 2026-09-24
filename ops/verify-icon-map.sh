#!/bin/bash
echo "===== 联系页 ====="
curl -s https://www.shuducw.com/contact | grep -oE 'FF2442' | head -1 && echo "→ 小红书红色图标存在 ✅" || echo "→ 缺少红色图标 ❌"
echo "卡片地图链接（应为0）: $(curl -s https://www.shuducw.com/contact | grep -c '查看百度地图')"
echo "地图区块按钮（应保留1处）: $(curl -s https://www.shuducw.com/contact | grep -c '在百度地图中查看 / 导航')"
echo "小红书号内容: $(curl -s https://www.shuducw.com/contact | grep -c '6521552259')"
echo ""
echo "===== 首页 ====="
curl -s https://www.shuducw.com/ | grep -oE 'FF2442' | head -1 && echo "→ 小红书红色图标存在 ✅" || echo "→ 缺少红色图标 ❌"
echo "旧 Instagram 圆环 path（应为0）: $(curl -s https://www.shuducw.com/ | grep -c 'C6.48 2 2 6.48')"
echo ""
echo "===== 页面状态 ====="
curl -s -o /dev/null -w "contact: %{http_code}\n" https://www.shuducw.com/contact
curl -s -o /dev/null -w "home: %{http_code}\n" https://www.shuducw.com/
