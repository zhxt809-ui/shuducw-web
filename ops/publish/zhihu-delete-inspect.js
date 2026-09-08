// Verify /edit URL binds original article + inspect delete controls for duplicate
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-zhihu';
const DUPLICATE_ID = '2079191350206010405';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1) /edit URL binding check
  await page.goto('https://zhuanlan.zhihu.com/p/2079167530137137790/edit', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(6000);
  const bind = await page.evaluate(() => {
    const ed = document.querySelector('.public-DraftEditor-content');
    const t = ed ? ed.innerText : '';
    return {
      url: location.href,
      editorLen: t.trim().length,
      hasOldIntro: t.includes('小生意试水选个体户'),
      hasNewIntro: t.includes('先说结论'),
      title: (document.querySelector('textarea[placeholder*="标题"]') || {}).value || ''
    };
  }).catch(e => ({ err: e.message }));
  console.log('[/edit binding]', JSON.stringify(bind, null, 2));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/z-edit4-bind.png' });

  // 2) creator list: locate duplicate row + its 更多 menu
  await page.goto('https://www.zhihu.com/creator/manage/creation/article', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  // find the 更多 button of the duplicate row
  const found = await page.evaluate((dupId) => {
    // find link to duplicate article
    const dupLink = [...document.querySelectorAll('a[href]')].find(a => a.getAttribute('href').includes(dupId));
    if (!dupLink) return { err: 'duplicate link not found' };
    // walk up to a row container
    let node = dupLink;
    const rows = [];
    for (let d = 0; d < 6; d++) {
      node = node.parentElement;
      if (!node) break;
      const moreBtns = [...node.querySelectorAll('button')].filter(b => (b.textContent || '').includes('更多'));
      if (moreBtns.length) {
        rows.push({ depth: d, moreBtns: moreBtns.length, moreText: moreBtns.map(b => (b.textContent || '').trim()).join(',') });
        return rows;
      }
    }
    return { err: 'no more-btn found', linksNearby: [...(dupLink.parentElement.parentElement.querySelectorAll('a'))].map(a => a.getAttribute('href')).slice(0, 8) };
  }, DUPLICATE_ID);
  console.log('[duplicate row]', JSON.stringify(found, null, 2));

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
