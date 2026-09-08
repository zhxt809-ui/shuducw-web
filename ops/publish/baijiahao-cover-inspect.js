// Inspect Baijiahao cover dialog + upload options
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-baijiahao';

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

  // find cover-related clickable elements
  const coverEls = await page.evaluate(() => {
    const els = [...document.querySelectorAll('div, button, span, a')].filter(el => {
      const t = (el.textContent || '').trim();
      const r = el.getBoundingClientRect();
      return /设置封面|选择封面|上传|从素材库/.test(t) && t.length < 20 && r.width > 10 && r.height > 10;
    }).map(el => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName, text: (el.textContent || '').trim().slice(0, 20), cls: (el.className || '').toString().slice(0, 50), top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width) };
    });
    return els.slice(0, 12);
  });
  console.log('cover elements:', JSON.stringify(coverEls, null, 2));

  // click 设置封面
  const setCover = page.locator('div, button, span, a').filter({ hasText: /^设置封面$/ }).first();
  const sc = await setCover.count().catch(() => 0);
  console.log('设置封面 count:', sc);
  if (sc) { await setCover.click({ timeout: 5000 }).catch(e => console.log('set cover click fail:', e.message.split('\n')[0])); }
  await page.waitForTimeout(2500);

  // dump the dialog
  const dlg = await page.evaluate(() => {
    const modals = [...document.querySelectorAll('[class*="Modal"], [class*="modal"], [class*="dialog"], [role="dialog"]')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 200 && r.height > 100; });
    return modals.map(m => {
      const btns = [...m.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean);
      const fileInputs = [...m.querySelectorAll('input[type="file"]')].length;
      const uploadBtns = [...m.querySelectorAll('div, button, span')].filter(el => /上传|本地上传/.test((el.textContent || '').trim()) && (el.textContent || '').trim().length < 15).map(el => (el.textContent || '').trim());
      return { cls: (m.className || '').toString().slice(0, 50), text: m.textContent.trim().slice(0, 200), btns: btns.slice(0, 8), fileInputs, uploadBtns };
    });
  });
  console.log('cover dialog:', JSON.stringify(dlg, null, 2));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-13-coverdlg.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
