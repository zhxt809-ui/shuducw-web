# Create website case article (case2 保险销售企业) as DRAFT via admin API
import urllib.request, urllib.error, json, os

TOKEN = os.environ.get('ADMIN_API_PASSWORD', '')
BASE = 'https://www.shuducw.com'
SLUG = 'xian-baoxian-caiwu-zixun-shuiwu-hegui-anli'

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
    'X 集团旗下保险销售公司（全国 41 家省级分支机构）自 2012 年成立起由数度提供财税服务：'
    '早期代理记账，建立自有财务部门后升级为财务咨询、税务合规、税务代理、疑难问题解决，'
    '并持续提供内部控制优化建议，护航企业稳健运营。\n'
    '关键词：财务咨询、税务合规、税务代理、保险销售企业财税、内部控制、西安代理记账、西安数度财务咨询'
)

content = """# 保险销售企业财税服务案例：从代理记账到集团财务咨询的长期陪伴

> 案例来源：西安数度财务咨询有限公司服务实录，应客户要求脱敏处理（隐去企业名称与人员信息）。

## 一、案例背景

该企业为 X 集团旗下的一家保险销售公司，2012 年成立，全国设有 41 家省级分支机构。成立初期，企业将代理记账等基础财税事务委托给西安数度财务咨询；随着公司发展壮大，企业逐步建立起自己的财务部门，财税服务需求也从基础记账报税升级为集团层面的财务咨询与税务合规管理。

## 二、合作历程

- **初创期（2012 年起）**：提供代理记账等基础财税服务，协助企业完成早期账务规范化；
- **成长期**：企业建立自有财务部门后，数度服务转向顾问式支持，提供财务咨询、税务合规、税务代理与疑难问题解决等服务；
- **成熟期至今**：成为企业的长期财税合作伙伴，从成立至今持续护航企业稳健运营。

## 三、服务内容

1. **财务咨询**：围绕集团与各分支机构的核算口径、报表管理提供专业建议；
2. **税务合规**：梳理分支机构涉税事项与申报口径，防范跨区域税务风险；
3. **税务代理**：代办涉税事项，协助处理复杂税务业务；
4. **疑难问题解决**：针对经营中遇到的财税疑难，提供可行、合规的解决方案；
5. **内控优化建议**：敏锐洞察企业内部控制漏洞，提出建设性优化建议，协助完善管理流程。

## 四、服务成果

通过持续服务，数度协助企业：规范了分支机构财税管理、补齐内部控制短板、降低了涉税风险隐患。企业从 2012 年成立到成长壮大，数度持续提供全方位财税服务，获得客户好评，双方保持长期稳定的合作关系。

## 五、给同类企业的合规提示

1. 多分支机构企业要特别重视**跨区域税务管理**：各分支机构申报口径、税种认定应统一规范，避免各地口径不一带来的风险；
2. 保险销售行业受**行业监管**，业务合规与财税合规需协同管理，佣金、手续费等支出凭证务必完整留存；
3. 企业建立自有财务团队后，可保留**外部财税顾问**做独立视角的内控体检，弥补内部管理盲区；
4. 长期财税合作中应定期复盘服务内容，随企业发展阶段动态调整服务需求。

---

**西安数度财务咨询有限公司原创** | 本案例已脱敏；网站内容仅作财税知识科普参考，具体业务以双方签订的服务合同为准。
"""

payload = {
    'title': '保险销售企业财税服务案例：从代理记账到集团财务咨询的长期陪伴',
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
