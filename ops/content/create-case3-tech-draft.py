# Create website case article (case3 高新技术企业常年财税顾问) as DRAFT via admin API
import urllib.request, urllib.error, json, os

TOKEN = os.environ.get('ADMIN_API_PASSWORD', '')
BASE = 'https://www.shuducw.com'
SLUG = 'xian-gaoxin-jishu-qiye-caiwu-guwen-anli'

def req(method, url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    headers = {'Content-Type': 'application/json; charset=utf-8', 'User-Agent': 'Mozilla/5.0', 'x-admin-token': TOKEN}
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        resp = urllib.request.urlopen(r, timeout=30)
        return resp.status, resp.read().decode('utf-8', 'ignore')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'ignore')
    except Exception as e:
        return -1, 'ERR:' + str(e)[:60]

st, body = req('GET', f'{BASE}/api/articles?limit=50&is_published=true')
print('list:', st)
arts = []
if st == 200:
    arts = json.loads(body).get('data', [])
max_sort = max([a.get('sort_order') or 0 for a in arts]) if arts else 0
next_sort = max_sort + 1
print(f'existing: {len(arts)} articles, max sort_order={max_sort}, new sort_order={next_sort}')
for a in arts:
    if a.get('slug') == SLUG:
        print('!! slug already exists:', a.get('id'))
        raise SystemExit

summary = (
    '西安数度财务咨询担任某科技集团（高新技术企业、科技型专精特新企业，已完成 A 轮融资，含香港关联主体）'
    '常年财税顾问：高新技术企业资质维护、研发费用加计扣除辅导、融资财税支持、集团税务合规、跨境主体财税衔接。\n'
    '关键词：常年财税顾问、高新技术企业、专精特新、研发费用加计扣除、A轮融资、集团财税合规、西安数度财务咨询'
)

content = """# 高新技术企业常年财税顾问服务案例：A轮融资与集团化发展的财税护航

> 案例来源：西安数度财务咨询有限公司服务实录，应客户要求脱敏处理（隐去企业名称与人员信息）。

## 一、案例背景

该企业为一家高新技术企业、科技型专精特新企业，已完成 A 轮融资，业务处于快速发展期。企业组建集团架构，除西安主体外还设有香港关联主体，境内外财税事务交织，对财税顾问的专业深度与实战经验要求较高。西安数度财务咨询担任该集团及其关联主体的常年财税顾问。

## 二、服务内容

1. **高新技术企业资质维护**：协助规范研发费用核算与归集，支撑高企、专精特新资质的相关要求持续达标；
2. **研发费用加计扣除辅导**：梳理研发项目立项、工时与费用凭证，协助企业依法合规享受研发费用加计扣除政策；
3. **融资财税支持**：为 A 轮融资及后续资本运作提供规范的财务数据与尽调配合；
4. **集团税务合规**：梳理集团内部业务与资金往来，防范关联业务中的涉税风险；
5. **跨境主体财税衔接**：就境内外主体的申报口径与财税合规提供顾问意见。

## 三、服务要点

- 依托多年服务科技企业的实战积累，快速理解企业业务模式与行业特点；
- 提前介入融资、资质申报等关键节点，把财税风险解决在事前；
- 提供常态化顾问支持，随时响应集团经营中的财税疑难。

## 四、服务成果

企业各项资质维护顺畅、研发费用归集规范、融资进程获得可靠财务支撑，集团境内外主体的财税合规水平稳步提升，为可持续发展目标提供了专业保障，服务获得客户好评。

## 五、给同类企业的合规提示

1. 高新技术企业要重视**资质动态维护**：研发费用占比、高新收入占比、知识产权等指标需持续达标；
2. 研发费用加计扣除要**凭证齐全、归集规范**：项目立项、工时、费用明细缺一不可；
3. 有融资计划的企业，应提前规范财务报表与历史税务记录，避免尽调阶段暴露问题；
4. 集团化、跨境经营的企业，要关注**关联业务定价与申报**，保持业务实质与商业合理性；
5. 常年财税顾问的价值在于**事前预防**：把合规动作嵌入日常经营，而非事后补救。

---

**西安数度财务咨询有限公司原创** | 本案例已脱敏；网站内容仅作财税知识科普参考，具体业务以双方签订的服务合同为准。
"""

payload = {
    'title': '高新技术企业常年财税顾问服务案例：A轮融资与集团化发展的财税护航',
    'slug': SLUG,
    'category': 'cases',
    'summary': summary,
    'content': content,
    'cover_image': None,
    'is_published': False,  # 草稿：待用户审核后由后台发布
    'sort_order': next_sort,
}

st, body = req('POST', f'{BASE}/api/articles', payload)
print('create:', st)
print(body[:300])
