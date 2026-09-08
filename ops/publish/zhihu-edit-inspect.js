// Inspect how to edit a Zhihu article: article page + creator list structure
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

  // 1) article page — look for edit affordances
  await page.goto('https://zhuanlan.zhihu.com/p/2079167530137137790', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  const art = await page.evaluate(() => {
    const body = document.body.innerText;
    const btns = [...document.querySelectorAll('button, a, [role="button"], span')].map((el, i) => ({
      i, tag: el.tagName, title: el.getAttribute('title') || '', text: (el.textContent || '').trim().slice(0, 30), cls: (el.className || '').toString().slice(0, 40)
    })).filter(x => /编辑|修改|管理|·{2}|.../.test(x.title + x.text) || /Edit|edit/.test(x.cls));
    return { btns: btns.slice(0, 15), hasEmoji: /❌|👉|⚠️|📞|📍|🌐/.test(body), bodySample: body.slice(0, 120) };
  });
  console.log('article page:', JSON.stringify(art, null, 2));

  // 2) creator list page — dump structure
  await page.goto('https://www.zhihu.com/creator/manage/creation/article', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(7000);
  const list = await page.evaluate(() => {
    const txt = document.body.innerText;
    const links = [...document.querySelectorAll('a[href]')].map(a => ({ t: (a.textContent || '').trim().slice(0, 30), href: a.getAttribute('href') })).filter(l => l.t).slice(0, 30);
    return { hasArticleTitle: txt.includes('西安开公司选个体户'), bodySample: txt.slice(0, 300), links };
  });
  console.log('creator list:', JSON.stringify(list, null, 2));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/z-edit-inspect.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
