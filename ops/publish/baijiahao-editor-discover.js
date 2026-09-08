// Discover Baijiahao article editor structure (logged in)
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

  // 1) home — confirm logged in + find 发图文 entry
  await page.goto('https://baijiahao.baidu.com/builder/rc/home', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(6000);
  console.log('home url:', page.url());
  const home = await page.evaluate(() => {
    const t = document.body.innerText;
    const links = [...document.querySelectorAll('a[href]')].map(a => ({ t: (a.textContent || '').trim().slice(0, 25), href: a.getAttribute('href') })).filter(l => l.t && /写文章|发布|图文|发|创作/.test(l.t)).slice(0, 15);
    return { sample: t.slice(0, 200).replace(/\n+/g, ' | '), writeLinks: links };
  }).catch(e => ({ err: e.message }));
  console.log('home:', JSON.stringify(home, null, 2));

  // 2) try direct editor URL
  await page.goto('https://baijiahao.baidu.com/builder/rc/edit?type=news', { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(() => {});
  await page.waitForTimeout(6000);
  console.log('editor url:', page.url());
  const ed = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input, textarea, [contenteditable="true"]')].map((el, i) => ({
      i, tag: el.tagName, type: el.type || '', ph: el.placeholder || '', editable: el.isContentEditable, cls: (el.className || '').toString().slice(0, 50)
    })).slice(0, 15);
    const btns = [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean).slice(0, 25);
    const frames = [...document.querySelectorAll('iframe')].map(f => f.src).slice(0, 5);
    return { inputs, btns, frames };
  }).catch(e => ({ err: e.message }));
  console.log('editor:', JSON.stringify(ed, null, 2));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-1-editor.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
