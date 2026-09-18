# Create website case article (case1 食品企业) as DRAFT via admin API
import urllib.request, urllib.error, json, os

TOKEN = os.environ.get('ADMIN_API_PASSWORD', '')
BASE = 'https://www.shuducw.com'
SLUG = 'xian-shipin-yecaishui-yitihua-anli'

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

# 1. compute sort_order
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
    '西安某涮烤食材品牌销售中心委托数度财务提供"业财税"一体化服务：财务核算、税负合规计划、融资咨询、财税合规，'
    '做到账实相符、应享尽享税收优惠政策、前瞻提示涉税风险，赢得客户高度认可。\n'
    '关键词：业财税一体化、财务核算、财税合规、食品企业财税服务、西安代理记账、西安数度财务咨询'
)

content = """# 西安食品企业"业财税"一体化服务案例

> 案例来源：西安数度财务咨询有限公司服务实录，应客户要求脱敏处理（隐去企业名称与人员信息）。

## 一、案例背景

该企业为西安一家知名涮烤食材品牌的销售中心，客户覆盖批发市场、连锁超市等渠道，经营规模较大、渠道多元。业务特点是批发与商超供货并行，涉及开票、回款、促销折让、多主体资金往来等复杂环节，对财务核算与合规管理的要求较高。

## 二、服务内容

西安数度财务咨询为该企业提供"业财税"一体化服务，涵盖四个方面：

1. **财务核算**：规范收入、成本、费用核算，核对重要财务数据，做到账实相符；
2. **税负合规计划**：结合企业经营特点，梳理可依法适用的现行税收优惠政策，做到应享尽享、不误用不套用；
3. **融资咨询支持**：协助梳理融资租赁、企业贷款等资金方案所需的财务数据与申报资料；
4. **财税合规**：定期开展涉税风险排查，前瞻性提示风险，协助企业提前规范。

## 三、服务要点

- **精准把控企业特点**：围绕批发与商超渠道并存的开票、回款、折让等场景，逐项规范账务处理与票据管理；
- **应享尽享政策红利**：根据实际经营情况，依法适用小微企业等现行税收优惠政策，确保符合条件的优惠不错过、不符合条件的不误用；
- **核对重要数据**：定期核对收入、成本、往来款项等关键财务数据，确保账面记录与业务实际一致；
- **前瞻提示风险**：对发票流、资金流、申报口径持续监控，提前提示潜在涉税风险，把问题解决在萌芽阶段。

## 四、服务成果

企业账务核算规范、申报合规，各类经营数据清晰可查，为融资安排与业务拓展提供了可靠的财务基础。服务获得客户高度认可，双方保持长期合作关系。

## 五、给同类企业的合规提示

1. 批发、商超渠道企业要特别关注**开票与回款的匹配**，避免收入确认不规范；
2. 涉及促销折让、返利的，应在合同中明确约定，并留存完整凭证；
3. 融资租赁、企业贷款等资金安排，需提前备好规范的财务报表与纳税记录；
4. 税收优惠适用务必**依法依规**：符合条件应享尽享，不符合条件不强行套用。

---

**西安数度财务咨询有限公司原创** | 本案例已脱敏；网站内容仅作财税知识科普参考，具体业务以双方签订的服务合同为准。
"""

payload = {
    'title': '西安食品企业业财税一体化服务案例：批发商超渠道财务核算与合规实践',
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
print(body[:400])
