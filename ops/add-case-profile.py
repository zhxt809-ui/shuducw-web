import json, sys

def add_profiles(path):
    profiles = {
        22: '企业类型：食品批发商超销售中心（涮烤食材品牌）｜渠道：批发市场、连锁超市｜服务内容：业财税一体化（财务核算、税负合规计划、融资咨询支持、财税合规）｜服务方式：长期合作服务',
        23: '企业类型：保险销售公司（X 集团旗下）｜企业规模：全国 41 家省级分支机构｜服务周期：2012 年成立至今持续服务｜服务阶段：代理记账 → 财务咨询 → 集团财税管理',
        24: '企业类型：高新技术企业（科技型专精特新）｜发展阶段：A 轮融资、集团化｜主体结构：西安主体 + 香港关联主体｜服务内容：常年财税顾问（资质维护、研发费用加计扣除辅导、融资财税支持、集团税务合规、跨境主体财税衔接）',
    }
    arts = json.load(open(path, encoding='utf-8'))
    changed = 0
    for a in arts:
        if a['id'] in profiles and a.get('category') == 'shilu':
            lines = a['content'].split('\n')
            for i, line in enumerate(lines):
                if line.startswith('> 案例来源') and not any('案例档案' in l for l in lines):
                    lines.insert(i + 1, '> **案例档案**：' + profiles[a['id']])
                    a['content'] = '\n'.join(lines)
                    changed += 1
                    print('id={} inserted'.format(a['id']))
                    break
    json.dump(arts, open(path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('done, changed={}'.format(changed))

if __name__ == '__main__':
    add_profiles(sys.argv[1])
