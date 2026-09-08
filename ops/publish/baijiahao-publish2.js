// Robust Baijiahao publish: title via click+type, content via UEditor API, publish
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

  // close only real modal dialogs (buttons inside dialog containers)
  await page.evaluate(() => {
    const tryClose = () => {
      const modals = [...document.querySelectorAll('[class*="Modal"], [class*="modal"], [class*="dialog"], [role="dialog"]')];
      for (const m of modals) {
        const r = m.getBoundingClientRect();
        if (r.width > 200 && r.height > 100) {
          const btns = [...m.querySelectorAll('button')].map(b => (b.textContent || '').trim());
          for (const txt of ['我知道了', '确认', '取消']) {
            const b = [...m.querySelectorAll('button')].find(b => (b.textContent || '').trim() === txt);
            if (b) { b.click(); return true; }
          }
          const closeBtn = m.querySelector('[class*="close"], [class*="Close"]');
          if (closeBtn) { closeBtn.click(); return true; }
        }
      }
      return false;
    };
    for (let i = 0; i < 5; i++) { if (!tryClose()) break; }
  }).catch(() => {});
  await page.waitForTimeout(1500);

  // 1) TITLE: click the titleInput div, then type
  const titleDiv = page.locator('.client_components_titleInput, div[class*="titleInput"]').first();
  const tc = await titleDiv.count().catch(() => 0);
  console.log('[1] title div count:', tc);
  if (tc) {
    await titleDiv.click({ timeout: 5000 }).catch(e => console.log('title click fail:', e.message.split('\n')[0]));
    await page.waitForTimeout(800);
    const active = await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), ce: el.isContentEditable, ph: el.placeholder || '', value: el.value || '' };
    });
    console.log('[1] active element after title click:', JSON.stringify(active));
    // type character by character (works for custom title components)
    for (const ch of TITLE) { await page.keyboard.type(ch, { delay: 5 }); }
    await page.waitForTimeout(800);
    const titleText = await page.evaluate((prefix) => {
      const t = document.body.innerText;
      const titleArea = document.querySelector('.client_components_titleInput') || document.querySelector('div[class*="titleInput"]');
      return { titleInBody: t.includes(prefix), titleAreaText: titleArea ? titleArea.textContent.slice(0, 60) : 'none' };
    }, TITLE.slice(0, 20));
    console.log('[1] after typing:', JSON.stringify(titleText));
  }

  // 2) CONTENT via UEditor API (setContent from parent page)
  const hasUE = await page.evaluate(() => !!(window.UE_V2 && window.UE_V2.instants && window.UE_V2.instants['ueditorInstant0']));
  console.log('[2] UE_V2 instance available:', hasUE);
  if (hasUE) {
    const set = await page.evaluate((html) => {
      const ed = window.UE_V2.instants['ueditorInstant0'];
      ed.setContent(html);
      return true;
    }, HTML).catch(e => ({ err: e.message }));
    console.log('[2] setContent:', JSON.stringify(set));
    await page.waitForTimeout(2500);
  } else {
    console.log('[2] UE not ready — try click 正文 area first, then re-check');
    const bodyArea = page.locator('div[class*="editor"], [class*="FeEditorApp"]').first();
    await bodyArea.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2000);
    const hasUE2 = await page.evaluate(() => !!(window.UE_V2 && window.UE_V2.instants && window.UE_V2.instants['ueditorInstant0']));
    console.log('[2] UE_V2 after click:', hasUE2);
    if (hasUE2) await page.evaluate((html) => window.UE_V2.instants['ueditorInstant0'].setContent(html), HTML);
    await page.waitForTimeout(2500);
  }

  // 3) verify state
  const check = await page.evaluate(() => {
    const t = document.body.innerText;
    const wc = /字数 (\d+)/.exec(t);
    return { wordCount: wc ? wc[1] : '?', hasIntro: t.includes('西安的创业者注册公司'), hasTitle: t.includes('2026西安开公司') };
  });
  console.log('[3] state:', JSON.stringify(check));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-6-filled.png' });

  // 4) 创作声明: ensure AI-generated NOT checked (default)
  const declare = await page.evaluate(() => {
    const cbs = [...document.querySelectorAll('.cheetah-checkbox-input')].map((c, i) => ({ i, checked: c.checked, label: (c.closest('label, .cheetah-checkbox-wrapper') || {}).textContent ? c.closest('label, .cheetah-checkbox-wrapper').textContent.trim().slice(0, 20) : '' }));
    return cbs;
  });
  console.log('[4] checkboxes:', JSON.stringify(declare));

  // 5) publish
  await page.locator('button').filter({ hasText: /^发布$/ }).last().click({ timeout: 8000 }).catch(e => console.log('pub fail:', e.message.split('\n')[0]));
  await page.waitForTimeout(4000);
  console.log('[5] after publish click url:', page.url());
  const after = await page.evaluate(() => {
    const t = document.body.innerText;
    return { warn: /请填写|必填|请选择|封面/.test(t.slice(0, 800)), sample: t.slice(0, 400).replace(/\n+/g, ' | '), btns: [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean).slice(-10) };
  });
  console.log('[5] dialog state:', JSON.stringify(after, null, 2));

  for (const ct of ['确认发布', '确认', '确定', '发布']) {
    const b = page.locator('button').filter({ hasText: ct }).last();
    const c = await b.count().catch(() => 0);
    if (c && await b.isVisible().catch(() => false)) { await b.click({ timeout: 4000 }).catch(() => {}); console.log('[6] confirm:', ct); break; }
  }
  await page.waitForTimeout(9000);
  console.log('[7] final url:', page.url());
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-7-result.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
