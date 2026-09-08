// Try direct edit URL + inspect article row for edit mechanism
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-zhihu';
const ARTICLE_ID = '2079167530137137790';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1) try direct edit URL
  await page.goto(`https://zhuanlan.zhihu.com/write?edit_id=${ARTICLE_ID}`, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(5000);
  const t1 = await page.locator('textarea[placeholder*="请输入标题"]').count().catch(() => 0);
  const e1 = await page.locator('.public-DraftEditor-content').count().catch(() => 0);
  console.log('direct edit URL -> url:', page.url(), 'titleInput:', t1, 'editor:', e1);

  // 2) inspect the creator article row
  await page.goto('https://www.zhihu.com/creator/manage/creation/article', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  const row = await page.evaluate(() => {
    // find element containing the article title
    const els = [...document.querySelectorAll('*')].filter(el => el.children.length < 5 && el.textContent && el.textContent.includes('西安开公司选个体户还是有限公司'));
    const target = els[els.length - 1];
    if (!target) return { err: 'title element not found' };
    let node = target;
    let result = null;
    for (let depth = 0; depth < 8 && !result; depth++) {
      node = node.parentElement;
      if (!node) break;
      const links = [...node.querySelectorAll('a[href]')].map(a => ({ t: (a.textContent || '').trim().slice(0, 30), href: a.getAttribute('href') }));
      const btns = [...node.querySelectorAll('button, [role="button"]')].map(b => ({ t: (b.textContent || '').trim().slice(0, 30), title: b.getAttribute('title') || '' }));
      if (links.some(l => /edit|write|修改|编辑/.test(l.t + l.href)) || btns.some(b => /编辑|修改/.test(b.t))) {
        result = { depth, links, btns, tag: node.tagName, cls: (node.className || '').toString().slice(0, 80) };
      }
    }
    return result || { err: 'no edit control found in ancestry' };
  });
  console.log('article row inspect:', JSON.stringify(row, null, 2));

  await page.screenshot({ path: 'D:/md/数度网站/.tools/z-edit-row.png' });
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
