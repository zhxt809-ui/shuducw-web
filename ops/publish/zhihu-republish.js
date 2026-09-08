// Re-publish rewritten article content (fresh article, proven publish flow)
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const fs = require('fs');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-zhihu';
const TITLE = '西安开公司选个体户还是有限公司？2026 最新对比';
const HTML = fs.readFileSync('D:/md/数度网站/.tools/zhihu-article-content-v2.html', 'utf8');
const TEXT = HTML.replace(/<[^>]+>/g, m => m === '<hr/>' ? '\n\n---\n\n' : m === '<br/>' ? '\n' : '').replace(/&nbsp;/g, ' ');

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://zhuanlan.zhihu.com/write', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);

  // title
  const titleEl = page.locator('textarea[placeholder*="请输入标题"]');
  await titleEl.click(); await titleEl.fill(TITLE);
  console.log('[1] title set');

  // clear any draft + paste
  const editor = page.locator('.public-DraftEditor-content');
  await editor.click();
  await page.keyboard.press('Control+a'); await page.waitForTimeout(400);
  await page.keyboard.press('Delete'); await page.waitForTimeout(500);
  await editor.click(); await page.waitForTimeout(400);
  await page.evaluate(({ html, text }) => {
    const ed = document.querySelector('.public-DraftEditor-content');
    const dt = new DataTransfer(); dt.setData('text/html', html); dt.setData('text/plain', text);
    ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, { html: HTML, text: TEXT });
  await page.waitForTimeout(3000);
  const check = await page.evaluate(() => {
    const ed = document.querySelector('.public-DraftEditor-content');
    const t = ed ? ed.innerText : '';
    return { len: t.trim().length, hasNewIntro: t.includes('先说结论'), hasEmoji: /❌|👉|⚠️|📞/.test(t), tables: ed ? ed.querySelectorAll('table').length : -1 };
  });
  console.log('[2] content check:', JSON.stringify(check));

  // publish (new-article editor has 发布 button)
  await page.locator('button').filter({ hasText: /^发布$/ }).last().click({ timeout: 8000 }).catch(e => console.log('pub fail:', e.message.split('\n')[0]));
  await page.waitForTimeout(4000);
  for (const ct of ['确定', '确认发布', '发布']) {
    const b = page.locator('button').filter({ hasText: ct }).last();
    const c = await b.count().catch(() => 0);
    if (c && await b.isVisible().catch(() => false)) { await b.click({ timeout: 4000 }).catch(() => {}); console.log('[3] confirm:', ct); break; }
  }
  await page.waitForTimeout(8000);
  console.log('[4] after publish url:', page.url());
  await page.screenshot({ path: 'D:/md/数度网站/.tools/z-republish.png' });

  // record the new article id
  const m = page.url().match(/\/p\/(\d+)/);
  console.log('NEW ARTICLE ID:', m ? m[1] : 'UNKNOWN');
  fs.writeFileSync('D:/md/数度网站/.tools/last-published-id.txt', m ? m[1] : '');
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
