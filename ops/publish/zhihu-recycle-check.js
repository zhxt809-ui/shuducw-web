// Inspect current article list + recycle bin (recoverable deleted articles)
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-zhihu';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1) current article list
  await page.goto('https://www.zhihu.com/creator/manage/creation/article', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  const articles = await page.evaluate(() => {
    // collect article rows: title links with p/ URLs
    const items = [];
    document.querySelectorAll('a[href*="/p/"]').forEach(a => {
      const href = a.getAttribute('href');
      const m = href.match(/\/p\/(\d+)/);
      const text = (a.textContent || '').trim().slice(0, 50);
      if (m && text && !items.some(i => i.id === m[1])) items.push({ id: m[1], text });
    });
    return items;
  }).catch(e => ({ err: e.message }));
  console.log('CURRENT ARTICLES:', JSON.stringify(articles, null, 2));

  // 2) recycle bin
  await page.goto('https://www.zhihu.com/creator/manage/creation/recycle', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(5000);
  console.log('recycle url:', page.url());
  const rec = await page.evaluate(() => {
    const txt = document.body.innerText;
    const items = [];
    document.querySelectorAll('a[href*="/p/"]').forEach(a => {
      const href = a.getAttribute('href');
      const m = href.match(/\/p\/(\d+)/);
      if (m) items.push({ id: m[1], text: (a.textContent || '').trim().slice(0, 50) });
    });
    const btns = [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(t => /恢复|删除|还原/.test(t));
    return { hasRecycleContent: /回收站|已删除/.test(txt), items, btns: btns.slice(0, 10), sample: txt.slice(0, 200).replace(/\n+/g, ' | ') };
  }).catch(e => ({ err: e.message }));
  console.log('RECYCLE BIN:', JSON.stringify(rec, null, 2));

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
