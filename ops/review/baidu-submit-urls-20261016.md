# 百度收录提交清单（2026-10-16）

> 背景：百度 `site:www.shuducw.com` 实测仅收录 1 页（首页），且缓存标题还是旧版
> （含已删除的「老牌/内部管理审计」字样）。推送 ≠ 收录，需在百度搜索资源平台主动提交。

## 推荐路径（最省事）：提交 TXT Sitemap

百度搜索资源平台（zhanzhang.baidu.com）→ **站点信息 → sitemap 提交** → 添加：

```
https://www.shuducw.com/sitemap.txt
```

一次提交覆盖全部 63 条 URL（百度支持 TXT 格式 sitemap）。提交后百度会按调度抓取。

## 备选路径：普通收录手动提交（按梯队分批）

若平台建议按 URL 手动提交「普通收录」，按下面梯队顺序粘贴（每批 ≤ 20 条，配额以平台当日显示为准）：

### 第一梯队（最高优先：转化核心 + 旗舰案例，共 6 条）
```
https://www.shuducw.com
https://www.shuducw.com/news/xian-shipin-yecaishui-yitihua-anli
https://www.shuducw.com/news/xian-baoxian-caiwu-zixun-shuiwu-hegui-anli
https://www.shuducw.com/news/xian-gaoxin-jishu-qiye-caiwu-guwen-anli
https://www.shuducw.com/services
https://www.shuducw.com/cases
```

### 第二梯队（服务/工具/FAQ 等转化页，共 18 条）
```
https://www.shuducw.com/services/basic
https://www.shuducw.com/services/compliance
https://www.shuducw.com/services/consulting
https://www.shuducw.com/services/delivery
https://www.shuducw.com/services/live-commerce
https://www.shuducw.com/tools
https://www.shuducw.com/tools/vat
https://www.shuducw.com/tools/income-tax
https://www.shuducw.com/tools/bonus-tax
https://www.shuducw.com/tools/rmb-uppercase
https://www.shuducw.com/faq
https://www.shuducw.com/contact
https://www.shuducw.com/self-check
https://www.shuducw.com/shareholder-loans
https://www.shuducw.com/invoice-compliance
https://www.shuducw.com/social-insurance-iit
https://www.shuducw.com/high-tech-enterprise
https://www.shuducw.com/company-deregistration
```

### 第三梯队（行业/区域专项页，共 14 条）
```
https://www.shuducw.com/services/industry/tech
https://www.shuducw.com/services/industry/trade
https://www.shuducw.com/services/industry/construction
https://www.shuducw.com/services/industry/ecommerce
https://www.shuducw.com/services/industry/group
https://www.shuducw.com/services/district/gaoxin
https://www.shuducw.com/services/district/weiyang
https://www.shuducw.com/services/district/lianhu
https://www.shuducw.com/services/district/yanta
https://www.shuducw.com/services/district/changan
https://www.shuducw.com/services/district/xixian
https://www.shuducw.com/services/district/xincheng
https://www.shuducw.com/services/district/beilin
https://www.shuducw.com/services/district/baqiao
```

### 第四梯队（已发布文章 + 分类列表，共 25 条）
```
https://www.shuducw.com/news
https://www.shuducw.com/news/shilu
https://www.shuducw.com/news/cases
https://www.shuducw.com/news/tips
https://www.shuducw.com/news/policies
https://www.shuducw.com/news/shuiwuju-zhaoni-budengyu-weifa
https://www.shuducw.com/news/guojing-lvyoufei-zou-gongsi-zhang
https://www.shuducw.com/news/qian-hetong-3dian-zengzhishui-butui
https://www.shuducw.com/news/xianyang-3242-fapiao-taojiang-beicha
https://www.shuducw.com/news/xian-gongsi-biangeng-zhuxiao-bikeng
https://www.shuducw.com/news/xian-jinshui4-fengkong-zicha-2026
https://www.shuducw.com/news/zhuce-zijin-renjiao-2026
https://www.shuducw.com/news/xian-kaigongsi-leixing-duibi-2026
https://www.shuducw.com/news/2026-geshui-9000yi
https://www.shuducw.com/news/langzi-gaoxin-zige-quxiao
https://www.shuducw.com/news/2026-shuiwu-cailiang-jizhun
https://www.shuducw.com/news/sailisi-kuisun-18yi
https://www.shuducw.com/news/2026-caishui-4tiao-hongxian
https://www.shuducw.com/news/shenfenmaoyong-zhuce-gongsi-fengxian
https://www.shuducw.com/news/xian-wanglaizhang-guazhang-80wan
https://www.shuducw.com/news/2026-shuiwujicha-zhongdian
https://www.shuducw.com/news/shangshigongsi-zicha-butui
https://www.shuducw.com/news/gongsi-liangtaozhang-fengxian
https://www.shuducw.com/about
https://www.shuducw.com/privacy
```

## 提交后要做的两件事

1. **首页旧标题刷新**：站长平台 → 抓取诊断 → 提交 `https://www.shuducw.com/` 抓取，
   让百度重新抓取首页，替换掉缓存里含「老牌/内部管理审计」的旧标题（网站本身已改掉，只是缓存）。
2. **跟踪收录**：提交 3–7 天后用 `site:www.shuducw.com` 复查收录条数增长；
   站长平台的「索引量」数据比 site: 更准。

## 说明
- 全部 URL 取自线上 `/sitemap.txt`（2026-10-16 实测 200，63 条），与 sitemap.xml 一致。
- 百度普通收录有每日配额，分批提交即可；提交 ≠ 立即收录，百度按自身调度爬取。
- 不建议重复提交同一 URL（会消耗配额）。
