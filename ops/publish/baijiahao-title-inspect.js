// Inspect titleInput component inner structure
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

  // dump the titleInput div's outerHTML
  const html = await page.evaluate(() => {
    const el = document.querySelector('.client_components_titleInput') || document.querySelector('div[class*="titleInput"]');
    return el ? el.outerHTML.slice(0, 1200) : 'NOT FOUND';
  });
  console.log('titleInput outerHTML:', html);

  // list all contenteditable / inputs in the page with positions
  const els = await page.evaluate(() => {
    return [...document.querySelectorAll('[contenteditable="true"], input, textarea')].map((el, i) => {
      const r = el.getBoundingClientRect();
      return { i, tag: el.tagName, ce: el.isContentEditable, ph: el.placeholder || '', cls: (el.className || '').toString().slice(0, 50), top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) };
    });
  });
  console.log('editable elements:', JSON.stringify(els, null, 2));

  // try clicking the inner placeholder text
  const inner = page.locator('.client_components_titleInput').locator('text=请输入标题').first();
  console.log('inner placeholder count:', await inner.count().catch(() => 0));
  if (await inner.count().catch(() => 0)) {
    await inner.click({ timeout: 5000 }).catch(e => console.log('inner click fail:', e.message.split('\n')[0]));
    await page.waitForTimeout(1000);
    const active = await page.evaluate(() => {
      const el = document.activeElement;
      return { tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), ce: el.isContentEditable, text: (el.textContent || '').slice(0, 40) };
    });
    console.log('active after inner click:', JSON.stringify(active));
    // type
    await page.keyboard.type('测试标题123', { delay: 20 });
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => {
      const el = document.querySelector('.client_components_titleInput');
      return { text: el ? el.textContent.slice(0, 60) : 'none' };
    });
    console.log('title after typing:', JSON.stringify(after));
  }
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-8-title.png' });
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
