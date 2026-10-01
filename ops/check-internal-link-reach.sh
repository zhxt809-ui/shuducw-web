#!/bin/bash
# 内链可达性检查：百度目前只抓首页，因此"从首页出发几次点击能到"决定它能否发现内容页
echo "===== 1. 首页直链覆盖情况（1 次点击可达）====="
SITEMAP_PATHS=$(curl -s https://www.shuducw.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' | sed 's|https://www.shuducw.com||' | sed 's|^$|/|' | sort -u)
HOME_LINKS=$(curl -s https://www.shuducw.com/ | grep -o 'href="/[^"#]*"' | sed 's/href="//;s/"$//' | sed 's/?.*//' | sort -u)

TOTAL=$(echo "$SITEMAP_PATHS" | grep -c .)
HIT=0
MISS=""
for p in $SITEMAP_PATHS; do
  if echo "$HOME_LINKS" | grep -qx "$p"; then
    HIT=$((HIT+1))
  else
    MISS="$MISS $p"
  fi
done
echo "  sitemap 页面总数: $TOTAL"
echo "  首页 1 次点击可达: $HIT"
echo "  首页不可达: $((TOTAL-HIT))"
echo "  不可达清单:"
for m in $MISS; do echo "    $m"; done

echo ""
echo "===== 2. 首页链接总数与去重 ====="
echo "  首页站内链接（去重）: $(echo "$HOME_LINKS" | grep -c .)"

echo ""
echo "===== 3. 二级页面的链接情况（2 次点击可达）====="
for p in /news /services /about /faq /cases; do
  n=$(curl -s "https://www.shuducw.com$p" | grep -o 'href="/news/[^"#]*"' | sed 's/href="//;s/"$//' | sort -u | grep -c .)
  echo "  $p 上的文章类链接数: $n"
done

echo ""
echo "===== 4. 首页是否列出了最新文章（关系到文章被发现的路径）====="
curl -s https://www.shuducw.com/ | grep -o 'href="/news/[^"#]*"' | sed 's/href="//;s/"$//' | sort -u | sed 's/^/  /'

echo ""
echo "===== 5. 已发布文章中有多少能从首页经 1-2 次点击到达 ====="
PUB=$(curl -s https://www.shuducw.com/sitemap.xml | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' | grep '/news/' | grep -vE '/news/(shilu|cases|tips|policies)$' | sed 's|https://www.shuducw.com||')
PUB_TOTAL=$(echo "$PUB" | grep -c .)
echo "  sitemap 中的文章详情页: $PUB_TOTAL"
FROM_HOME=$(curl -s https://www.shuducw.com/ | grep -o 'href="/news/[^"#]*"' | sed 's/href="//;s/"$//' | sort -u)
N1=0; N2=0; N3=0
for u in $PUB; do
  if echo "$FROM_HOME" | grep -qx "$u"; then N1=$((N1+1)); continue; fi
  found=0
  for cat in /news /news/shilu /news/cases /news/tips /news/policies; do
    if curl -s "https://www.shuducw.com$cat" | grep -q "href=\"$u\""; then found=1; break; fi
  done
  if [ $found -eq 1 ]; then N2=$((N2+1)); else N3=$((N3+1)); fi
done
echo "  1 次点击（首页直达）: $N1"
echo "  2 次点击（经资讯列表/分类页）: $N2"
echo "  3 次及以上: $N3"
