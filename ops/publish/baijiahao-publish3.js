// Final Baijiahao publish: click lexical title editor, type, set content, publish
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const fs = require('fs');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-baijiahao';
const TITLE = '2026西安开公司选哪种类型？个体户、有限公司、合伙企业对比全解析';
const HTML = fs.readFileSync('D:/md/数度网站/.tools/baijiahao-article-content.html', 'utf8');

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://baijiahao.baidu.com/builder/rc/edit?type=news', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(9000);

  // dismiss dialogs (real modals only)
  await page.evaluate(() => {
    for (let i = 0; i < 5; i++) {
      const modals = [...document.querySelectorAll('[class*="Modal"], [class*="modal"], [class*="dialog"], [role="dialog"]')];
      const m = modals.find(el => { const r = el.getBoundingClientRect(); return r.width > 200 && r.height > 100; });
      if (!m) break;
      const btn = [...m.querySelectorAll('button')].find(b => ['我知道了', '确认', '取消'].includes((b.textContent || '').trim()));
      if (btn) { btn.click(); continue; }
      const close = m.querySelector('[class*="close"], [class*="Close"]');
      if (close) { close.click(); continue; }
      break;
    }
  }).catch(() => {});
  await page.waitForTimeout(1500);

  // 1) TITLE: click the lexical editor directly
  const lex = page.locator('[data-lexical-editor="true"]').first();
  const lc = await lex.count().catch(() => 0);
  console.log('[1] lexical title editor count:', lc);
  if (lc) {
    await lex.click({ timeout: 6000 }).catch(e => console.log('lex click fail:', e.message.split('\n')[0]));
    await page.waitForTimeout(800);
    await page.keyboard.type(TITLE, { delay: 10 });
    await page.waitForTimeout(1000);
    const titleCheck = await page.evaluate((t) => {
      const el = document.querySelector('.client_components_titleInput');
      return { text: el ? el.textContent.slice(0, 70) : 'none', contains: el ? el.textContent.includes(t.slice(0, 15)) : false };
    }, TITLE);
    console.log('[1] title now:', JSON.stringify(titleCheck));
  } else {
    console.log('[1] NO lexical editor found');
  }

  // 2) CONTENT via UEditor API
  const hasUE = await page.evaluate(() => !!(window.UE_V2 && window.UE_V2.instants && window.UE_V2.instants['ueditorInstant0']));
  console.log('[2] UE ready:', hasUE);
  if (hasUE) {
    await page.evaluate((html) => { window.UE_V2.instants['ueditorInstant0'].setContent(html); }, HTML);
    await page.waitForTimeout(2000);
  }
  const wc = await page.evaluate(() => { const t = document.body.innerText; const m = /字数 (\d+)/.exec(t); return m ? m[1] : '?'; });
  console.log('[2] word count:', wc);

  // 3) uncheck 自动生成播客 (keep only original content clean)
  const cbs = await page.evaluate(() => {
    const list = [...document.querySelectorAll('.cheetah-checkbox-input')].map((c, i) => ({ i, checked: c.checked, label: ((c.closest('.cheetah-checkbox-wrapper') || {}).textContent || '').trim().slice(0, 20) }));
    // uncheck any checked ones (自动生成播客)
    list.forEach((it, idx) => {
      if (it.checked) {
        const input = document.querySelectorAll('.cheetah-checkbox-input')[idx];
        if (input && !input.disabled) input.click();
      }
    });
    return list;
  });
  console.log('[3] checkboxes after uncheck:', JSON.stringify(cbs));
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-9-ready.png' });

  // 4) publish
  await page.locator('button').filter({ hasText: /^发布$/ }).last().click({ timeout: 8000 }).catch(e => console.log('pub fail:', e.message.split('\n')[0]));
  await page.waitForTimeout(4000);
  console.log('[4] after pub url:', page.url());

  // inspect any dialog / toast that appeared
  const dlg = await page.evaluate(() => {
    const t = document.body.innerText;
    const modals = [...document.querySelectorAll('[class*="Modal"], [class*="modal"], [class*="dialog"], [role="dialog"]')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 100 && r.height > 50; });
    const modalTexts = modals.map(m => ({ cls: (m.className || '').toString().slice(0, 50), text: m.textContent.trim().slice(0, 150) }));
    return { modalTexts, hasTitleErr: /标题/.test(t.slice(0, 500)) };
  });
  console.log('[4] dialogs:', JSON.stringify(dlg, null, 2));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-10-dialog.png' });

  // click the primary confirm in any visible modal
  let confirmed = '';
  for (const ct of ['确认发布', '确定', '确认']) {
    const b = page.locator('button').filter({ hasText: ct }).last();
    const c = await b.count().catch(() => 0);
    if (c && await b.isVisible().catch(() => false)) { await b.click({ timeout: 4000 }).catch(() => {}); confirmed = ct; break; }
  }
  console.log('[5] confirmed with:', confirmed || 'none');
  await page.waitForTimeout(9000);
  console.log('[6] final url:', page.url());
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-11-final.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
