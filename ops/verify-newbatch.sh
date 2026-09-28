#!/bin/bash
B="https://www.shuducw.com"
echo "===== 1. 新增页面状态 ====="
for p in /cases /error-test /not-exist-page-xyz /privacy; do
  echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' $B$p)"
done
echo ""
echo "===== 2. /cases 案例列表内容 ====="
curl -s "$B/cases" | grep -oE '服务实录|业财税一体化|保险销售企业|高新技术企业常年' | sort | uniq -c
echo ""
echo "===== 3. 404 页与错误页 ====="
curl -s "$B/not-exist-page-xyz" | grep -oE '页面不存在|返回首页|404' | sort | uniq -c | head -5
echo ""
echo "===== 4. mini 留资接口（用无效值测，不写数据） ====="
echo "无效企业类型: $(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/consultations/mini -H 'Content-Type: application/json' -d '{"business_type":"INVALID","question":"代理记账报税","phone":"13800000000"}')"
echo "无效问题类型: $(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/consultations/mini -H 'Content-Type: application/json' -d '{"business_type":"个体户","question":"INVALID","phone":"13800000000"}')"
echo "无效电话: $(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/consultations/mini -H 'Content-Type: application/json' -d '{"business_type":"个体户","question":"代理记账报税","phone":"abc"}')"
echo "蜜罐命中(应200但不入库): $(curl -s -o /dev/null -w '%{http_code}' -X POST $B/api/consultations/mini -H 'Content-Type: application/json' -d '{"business_type":"个体户","question":"代理记账报税","phone":"13800000000","website":"spam"}')"
echo ""
echo "===== 5. 资质证照图片是否在线 ====="
for img in /license-daiji.jpg /license-yingye.jpg /logo.png /og.png /qr-wecom.png; do
  echo "$img -> $(curl -s -o /dev/null -w '%{http_code} %{size_download}B' $B$img)"
done
echo ""
echo "===== 6. 关于页证照展示 ====="
curl -s "$B/about" | grep -oE 'license-daiji|license-yingye|代理记账许可|营业执照' | sort | uniq -c
echo ""
echo "===== 7. 浮动咨询/极简弹窗 ====="
curl -s "$B/" | grep -oE '极简|免费咨询|在线咨询|立即咨询' | sort | uniq -c | head -5
echo ""
echo "===== 8. 咨询数据未增加（应仍为0或既有数） ====="
curl -s "$B/api/health" 
echo ""
