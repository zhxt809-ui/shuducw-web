// Edit published Zhihu article in place with knowledge-only content v2
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const fs = require('fs');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-zhihu';
const ARTICLE_URL = 'https://zhuanlan.zhihu.com/p/2079167530137137790';
const TITLE = '西安开公司选个体户还是有限公司？2026 年最新对比';
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

  // open article
  await page.goto(ARTICLE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('article url:', page.url());

  // find 编辑 button
  const editBtn = page.locator('button, a, span').filter({ hasText: /^编辑$/ }).first();
  const ec = await editBtn.count().catch(() => 0);
  console.log('edit btn count:', ec);
  if (ec) {
    await editBtn.click({ timeout: 8000 }).catch(e => console.log('edit click fail:', e.message.split('\n')[0]));
  } else {
    console.log('no direct edit btn on page; trying creator center edit link');
    await page.goto('https://www.zhihu.com/creator/manage/creation/article', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    const row = page.locator('a, button').filter({ hasText: '编辑' }).first();
    const rc = await row.count().catch(() => 0);
    console.log('creator edit candidates:', rc);
    if (rc) { await row.click({ timeout: 8000 }).catch(e => console.log('creator edit fail:', e.message.split('\n')[0])); }
  }
  await page.waitForTimeout(5000);
  console.log('editor url:', page.url());

  // Title
  const titleEl = page.locator('textarea[placeholder*="请输入标题"]');
  const tc = await titleEl.count().catch(() => 0);
  console.log('title input count:', tc);
  if (tc) {
    await titleEl.click();
    await titleEl.fill(TITLE);
    console.log('title updated:', TITLE);
  }

  // Content: clear + paste v2
  const editor = page.locator('.public-DraftEditor-content');
  const edc = await editor.count().catch(() => 0);
  console.log('editor count:', edc);
  if (edc) {
    await editor.click();
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(400);
    await page.keyboard.press('Delete');
    await page.waitForTimeout(600);
    const cleared = await page.evaluate(() => (document.querySelector('.public-DraftEditor-content') || {}).innerText || '');
    console.log('after clear len:', cleared.trim().length);

    await editor.click();
    await page.waitForTimeout(400);
    await page.evaluate(({ html, text }) => {
      const ed = document.querySelector('.public-DraftEditor-content');
      const dt = new DataTransfer();
      dt.setData('text/html', html);
      dt.setData('text/plain', text);
      ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    }, { html: HTML, text: TEXT });
    await page.waitForTimeout(3000);
    const pasted = await page.evaluate(() => {
      const ed = document.querySelector('.public-DraftEditor-content');
      return { len: ed ? ed.innerText.trim().length : -1, tables: ed ? ed.querySelectorAll('table').length : -1 };
    });
    console.log('pasted len:', pasted.len, 'tables:', pasted.tables);
    const hasMarketing = await page.evaluate(() => {
      const t = (document.querySelector('.public-DraftEditor-content') || {}).innerText || '';
      return { hasShudu: t.includes('数度财务'), hasWebsite: t.includes('shuducw'), hasDaiban: t.includes('代办'), hasEmoji: /❌|👉|⚠️/.test(t), hasZhihu: t.includes('政策依据') };
    });
    console.log('marketing check:', JSON.stringify(hasMarketing));
  }

  await page.screenshot({ path: 'D:/md/数度网站/.tools/b-edit-ready.png' });

  // Publish / save
  const pubBtn = page.locator('button').filter({ hasText: '发布' }).last();
  const pbc = await pubBtn.count().catch(() => 0);
  console.log('publish btn count:', pbc);
  if (pbc) { await pubBtn.click({ timeout: 8000 }).catch(e => console.log('pub click fail:', e.message.split('\n')[0])); }
  await page.waitForTimeout(4000);

  // confirm dialog if any
  for (const label of ['确定', '确认发布', '发布', '保存']) {
    const b = page.locator('button').filter({ hasText: label }).last();
    const c = await b.count().catch(() => 0);
    if (c) { await b.click({ timeout: 4000 }).catch(() => {}); console.log('confirm clicked:', label); break; }
  }
  await page.waitForTimeout(6000);
  console.log('after save url:', page.url());
  await page.screenshot({ path: 'D:/md/数度网站/.tools/b-edit-saved.png' });

  await page.waitForTimeout(1000);
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
