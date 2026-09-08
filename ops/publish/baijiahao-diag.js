// Diagnostic: Baijiahao editor title element, modal dialogs, iframe state
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
  await page.waitForTimeout(8000);

  // find ANY element with title placeholder
  const titleEl = await page.evaluate(() => {
    const all = [...document.querySelectorAll('input, textarea, [contenteditable="true"], div[class*="title"], div[class*="Title"]')];
    const matches = all.filter(el => {
      const ph = (el.placeholder || '');
      const text = (el.textContent || '');
      const cls = (el.className || '').toString();
      return ph.includes('标题') || (text.includes('请输入标题') && text.length < 40) || /title/i.test(cls);
    }).map(el => ({ tag: el.tagName, ph: el.placeholder || '', text: (el.textContent || '').trim().slice(0, 30), cls: (el.className || '').toString().slice(0, 60), contenteditable: el.isContentEditable, rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) }; })() }));
    return matches.slice(0, 10);
  });
  console.log('title candidates:', JSON.stringify(titleEl, null, 2));

  // visible modals/dialogs
  const modals = await page.evaluate(() => {
    const dialogs = [...document.querySelectorAll('[class*="modal"], [class*="Modal"], [class*="dialog"], [class*="Dialog"], [class*="popup"], [class*="Popup"], [role="dialog"], [class*="mask"], [class*="Mask"]')].map((el, i) => {
      const r = el.getBoundingClientRect();
      const visible = r.width > 50 && r.height > 30;
      return { i, cls: (el.className || '').toString().slice(0, 60), visible, text: visible ? (el.textContent || '').trim().slice(0, 120) : '' };
    }).filter(m => m.visible).slice(0, 10);
    return dialogs;
  });
  console.log('visible modals:', JSON.stringify(modals, null, 2));

  // all frames with real urls
  const frames = page.frames().map(f => ({ url: f.url().slice(0, 80), hasBody: null }));
  console.log('frames:', JSON.stringify(frames, null, 2));
  for (const f of page.frames()) {
    if (f.url().includes('ueditor') || f.url().startsWith('javascript')) {
      const info = await f.evaluate(() => ({ url: location.href, bodyText: (document.body ? document.body.innerText.slice(0, 80) : 'no body'), bodyCls: document.body ? (document.body.className || '').toString().slice(0, 50) : '' })).catch(e => ({ err: e.message.slice(0, 60) }));
      console.log('frame info:', JSON.stringify(info));
    }
  }

  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-5-diag.png' });
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
