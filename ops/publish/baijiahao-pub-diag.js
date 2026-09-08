// Diagnose: publish button state + toasts + cover requirement
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

  // title
  const lex = page.locator('[data-lexical-editor="true"]').first();
  await lex.click({ timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.keyboard.type(TITLE, { delay: 8 });
  await page.waitForTimeout(800);
  // content
  await page.evaluate((html) => { if (window.UE_V2 && window.UE_V2.instants && window.UE_V2.instants['ueditorInstant0']) window.UE_V2.instants['ueditorInstant0'].setContent(html); }, HTML);
  await page.waitForTimeout(1500);

  // inspect ALL 发布 buttons + enabled state
  const pubs = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].map((b, i) => {
      const t = (b.textContent || '').trim();
      const r = b.getBoundingClientRect();
      return { i, text: t.slice(0, 15), disabled: b.disabled, visible: r.width > 10 && r.height > 10, top: Math.round(r.top), w: Math.round(r.width) };
    }).filter(b => b.text === '发布' || b.text.startsWith('发布'));
    return btns;
  });
  console.log('[1] 发布 buttons:', JSON.stringify(pubs, null, 2));

  // cover section state
  const cover = await page.evaluate(() => {
    const t = document.body.innerText;
    return { hasCoverSec: t.includes('设置封面'), coverChoice: /选择封面|未设置|请选择/.test(t.slice(0, 2000)) };
  });
  console.log('[2] cover:', JSON.stringify(cover));

  // click the visible 发布 (header one at top) and capture toasts for 4s
  const pubBtn = page.locator('button').filter({ hasText: /^发布$/ }).filter({ visible: true }).last();
  console.log('[3] pub btn count:', await pubBtn.count().catch(() => 0));
  if (await pubBtn.count().catch(() => 0)) {
    await pubBtn.click({ timeout: 8000 }).catch(e => console.log('pub click fail:', e.message.split('\n')[0]));
    console.log('[3] pub clicked');
  }
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(1500);
    const state = await page.evaluate(() => {
      const t = document.body.innerText;
      const toastEls = [...document.querySelectorAll('[class*="toast"], [class*="Toast"], [class*="message"], [class*="Message"], [class*="notice"], [role="alert"]')].filter(el => el.offsetParent !== null).map(el => el.textContent.trim().slice(0, 80)).filter(Boolean).slice(0, 5);
      const modals = [...document.querySelectorAll('[class*="Modal"], [role="dialog"]')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 200 && r.height > 100; }).map(m => ({ cls: (m.className || '').toString().slice(0, 40), text: m.textContent.trim().slice(0, 120) }));
      const coverErr = /请(选择|设置|上传)封面|封面.*(必须|不能|请)/.test(t);
      return { url: location.href, toasts: toastEls, modals, coverErr };
    });
    console.log(`[t+${(i + 1) * 1.5}s]`, JSON.stringify(state));
    if (state.url.includes('manage') || !state.url.includes('/edit')) break;
  }
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-12-diagnostic.png' });
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
