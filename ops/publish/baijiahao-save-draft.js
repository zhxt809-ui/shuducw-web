// Save Baijiahao draft: fill title + content, click 存草稿, verify
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

  // dismiss dialogs
  await page.evaluate(() => {
    for (let i = 0; i < 5; i++) {
      const modals = [...document.querySelectorAll('[class*="Modal"], [class*="modal"], [class*="dialog"], [role="dialog"]')];
      const m = modals.find(el => { const r = el.getBoundingClientRect(); return r.width > 200 && r.height > 100; });
      if (!m) break;
      const btn = [...m.querySelectorAll('button')].find(b => ['我知道了', '确认', '取消'].includes((b.textContent || '').trim()));
      if (btn) { btn.click(); continue; }
      break;
    }
  }).catch(() => {});
  await page.waitForTimeout(1500);

  // 1) TITLE
  const lex = page.locator('[data-lexical-editor="true"]').first();
  if (await lex.count().catch(() => 0)) {
    await lex.click({ timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(600);
    await page.keyboard.type(TITLE, { delay: 8 });
    await page.waitForTimeout(800);
  }
  const titleOk = await page.evaluate((t) => {
    const el = document.querySelector('.client_components_titleInput');
    return el ? el.textContent.includes(t.slice(0, 15)) : false;
  }, TITLE);
  console.log('[1] title filled:', titleOk);

  // 2) CONTENT
  const hasUE = await page.evaluate(() => !!(window.UE_V2 && window.UE_V2.instants && window.UE_V2.instants['ueditorInstant0']));
  if (hasUE) {
    await page.evaluate((html) => { window.UE_V2.instants['ueditorInstant0'].setContent(html); }, HTML);
    await page.waitForTimeout(2000);
  }
  const wc = await page.evaluate(() => { const t = document.body.innerText; const m = /字数 (\d+)/.exec(t); return m ? m[1] : '?'; });
  console.log('[2] content word count:', wc);

  // 3) click 存草稿
  const saveBtn = page.locator('button').filter({ hasText: /^存草稿$/ }).last();
  const sc = await saveBtn.count().catch(() => 0);
  console.log('[3] 存草稿 button count:', sc);
  if (sc) {
    await saveBtn.click({ timeout: 8000 }).catch(e => console.log('save click fail:', e.message.split('\n')[0]));
    console.log('[3] 存草稿 clicked');
  }
  await page.waitForTimeout(4000);

  // 4) verify save result (toast)
  const result = await page.evaluate(() => {
    const t = document.body.innerText;
    const toasts = [...document.querySelectorAll('[class*="toast"], [class*="Toast"], [class*="message"], [class*="Message"], [role="alert"]')].filter(el => el.offsetParent !== null).map(el => el.textContent.trim().slice(0, 60)).filter(Boolean).slice(0, 5);
    return { toasts, hasSaved: /保存成功|已保存|草稿/.test(t) };
  });
  console.log('[4] save result:', JSON.stringify(result));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-16-saved.png' });

  // 5) go to draft box to confirm
  await page.goto('https://baijiahao.baidu.com/builder/rc/manage?type=draft', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(4000);
  console.log('[5] draft page url:', page.url());
  const drafts = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('a, div, span').forEach(el => {
      const t = (el.textContent || '').trim();
      const r = el.getBoundingClientRect();
      if (t.includes('2026西安开公司') && t.length < 80 && r.width > 10) items.push({ tag: el.tagName, text: t });
    });
    return items.slice(0, 5);
  }).catch(() => []);
  console.log('[5] draft found:', JSON.stringify(drafts));

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
