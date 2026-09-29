#!/bin/bash
B="https://www.shuducw.com"
echo "===== 豆包① 转化触点：首页到底有没有表单/即时咨询 ====="
home=$(curl -s "$B/")
echo "  首页 <input> 数量: $(echo "$home" | grep -o '<input' | wc -l)"
echo "  首页 <form> 数量: $(echo "$home" | grep -o '<form' | wc -l)"
echo "  首页 电话输入框(placeholder含手机/电话): $(echo "$home" | grep -oE 'placeholder=\"[^\"]*(手机|电话)[^\"]*\"' | wc -l)"
echo "  首页 含'提交咨询'按钮: $(echo "$home" | grep -c '提交咨询')"
echo "  首页 含极简留资弹窗触发: $(echo "$home" | grep -cE '极简|快速咨询|30秒|一键咨询')"
echo "  首页 含悬浮咨询: $(echo "$home" | grep -cE '浮动咨询|floating|在线咨询')"
echo "  自测页 /self-check input 数: $(curl -s $B/self-check | grep -o '<input' | wc -l)"
echo "  联系页 /contact input 数: $(curl -s $B/contact | grep -o '<input' | wc -l)"
echo ""
echo "===== 豆包④ 区县页 TDK 是否独立 ====="
for d in gaoxin weiyang baqiao; do
  echo "  --- $d ---"
  curl -s "$B/services/district/$d" | grep -oE '<title>[^<]*</title>' | head -1
  curl -s "$B/services/district/$d" | grep -oE '<meta name="description" content="[^"]{0,80}' | head -1
done
echo ""
echo "===== 豆包⑤ 文章底部是否有小红书/二维码互导 ====="
for s in 2026-shuiwujicha-zhongdian xian-shipin-yecaishui-yitihua-anli; do
  echo "  --- /news/$s ---"
  echo "    小红书: $(curl -s $B/news/$s | grep -c '小红书')  微信号/二维码: $(curl -s $B/news/$s | grep -cE '二维码|微信')  关注入口: $(curl -s $B/news/$s | grep -cE '关注我们|扫码')"
done
echo ""
echo "===== 案例数量与行业分布 ====="
curl -s "$B/cases" | grep -oE '<h3[^>]*>[^<]{4,60}</h3>' | sed 's/<[^>]*>//g' | head -10
echo "  /cases 页 200: $(curl -s -o /dev/null -w '%{http_code}' $B/cases)"
