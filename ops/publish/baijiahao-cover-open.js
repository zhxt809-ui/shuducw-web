// Click 选择封面 tile and inspect the modal for upload option
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

  // click 选择封面 tile (scrolls into view automatically)
  const tile = page.locator('div[class*="FeEditorApp"]').filter({ hasText: /^选择封面$/ }).first();
  const tc = await tile.count().catch(() => 0);
  console.log('选择封面 tile count:', tc);
  if (tc) { await tile.click({ timeout: 6000 }).catch(e => console.log('tile click fail:', e.message.split('\n')[0])); }
  await page.waitForTimeout(3000);

  // dump modals (large ones) + file inputs + upload buttons
  const info = await page.evaluate(() => {
    const modals = [...document.querySelectorAll('[class*="Modal"], [class*="modal"], [class*="dialog"], [class*="Dialog"], [role="dialog"]')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 300 && r.height > 150; });
    const allFileInputs = [...document.querySelectorAll('input[type="file"]')].map(i => ({ accept: i.accept || '', multiple: i.multiple, cls: (i.className || '').toString().slice(0, 40) }));
    const uploadTexts = [...document.querySelectorAll('div, button, span')].filter(el => {
      const t = (el.textContent || '').trim();
      return t.length > 0 && t.length < 18 && /上传|本地|从素材|相册/.test(t) && el.offsetParent !== null;
    }).map(el => (el.textContent || '').trim()).slice(0, 10);
    return {
      modals: modals.map(m => ({ cls: (m.className || '').toString().slice(0, 50), text: m.textContent.trim().slice(0, 300), fileInputs: m.querySelectorAll('input[type="file"]').length })),
      allFileInputs,
      uploadTexts
    };
  });
  console.log('after 选择封面 click:', JSON.stringify(info, null, 2));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-14-covermodal.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
