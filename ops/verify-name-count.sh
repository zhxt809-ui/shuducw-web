#!/bin/bash
B="https://www.shuducw.com"
about=$(curl -s "$B/about")
echo "about 中 '2012 年创立西安数度财务咨询有限公司' 出现次数: $(echo "$about" | grep -o '2012 年创立西安数度财务咨询有限公司' | wc -l)"
