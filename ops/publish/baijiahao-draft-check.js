// Verify Baijiahao draft exists (draft box list) — read-only
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

  // try draft box URLs
  const urls = [
    'https://baijiahao.baidu.com/builder/rc/manage/draft',
    'https://baijiahao.baidu.com/builder/rc/draftlist',
    'https://baijiahao.baidu.com/builder/rc/manage?type=draft'
  ];
  for (const u of urls) {
    await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3500);
    const t = await page.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => '');
    console.log('TRY', u, '-> url:', page.url());
    console.log('  sample:', t.replace(/\n+/g, ' | ').slice(0, 180));
    if (!page.url().includes('login') && page.url().includes('baijiahao')) break;
  }

  // if on a draft page, list draft titles
  const drafts = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('a, div').forEach(el => {
      const t = (el.textContent || '').trim();
      const r = el.getBoundingClientRect();
      if (t.includes('2026西安开公司') && t.length < 80 && r.width > 10) items.push({ tag: el.tagName, text: t, cls: (el.className || '').toString().slice(0, 40) });
    });
    return items.slice(0, 6);
  }).catch(() => []);
  console.log('draft matches:', JSON.stringify(drafts, null, 2));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-15-draft.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
