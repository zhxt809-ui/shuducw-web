// Edit Zhihu article via direct edit_id URL, replace with rewritten content
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const fs = require('fs');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-zhihu';
const EDIT_URL = 'https://zhuanlan.zhihu.com/write?edit_id=2079167530137137790';
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
  await page.goto(EDIT_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  console.log('editor url:', page.url());

  // Title
  const titleEl = page.locator('textarea[placeholder*="请输入标题"]');
  await titleEl.click();
  await titleEl.fill(TITLE);
  console.log('[1] title set');

  // Content: select all + delete + paste
  const editor = page.locator('.public-DraftEditor-content');
  await editor.click();
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(500);
  await page.keyboard.press('Delete');
  await page.waitForTimeout(600);
  const cleared = await page.evaluate(() => (document.querySelector('.public-DraftEditor-content') || {}).innerText || '');
  console.log('[2] cleared len:', cleared.trim().length);

  await editor.click();
  await page.waitForTimeout(500);
  await page.evaluate(({ html, text }) => {
    const ed = document.querySelector('.public-DraftEditor-content');
    const dt = new DataTransfer();
    dt.setData('text/html', html);
    dt.setData('text/plain', text);
    ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, { html: HTML, text: TEXT });
  await page.waitForTimeout(3500);

  const check = await page.evaluate(() => {
    const ed = document.querySelector('.public-DraftEditor-content');
    const t = ed ? ed.innerText : '';
    return {
      len: t.trim().length,
      tables: ed ? ed.querySelectorAll('table').length : -1,
      hasEmoji: /❌|👉|⚠️|📞|📍|🌐/.test(t),
      hasShuduPromo: /数度财务|副会长单位|全程代办/.test(t),
      hasPhone: /84556877|13359182829/.test(t),
      hasSite: t.includes('shuducw.com'),
      hasPolicy: t.includes('政策依据'),
      hasIntro: t.includes('先说结论')
    };
  }).catch(e => ({ err: e.message }));
  console.log('[3] content check:', JSON.stringify(check, null, 2));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/z-edit3-ready.png' });

  // Publish
  const pubBtn = page.locator('button').filter({ hasText: '发布' }).last();
  const pbc = await pubBtn.count().catch(() => 0);
  console.log('[4] publish btn:', pbc);
  if (pbc) { await pubBtn.click({ timeout: 8000 }).catch(e => console.log('pub fail:', e.message.split('\n')[0])); }
  await page.waitForTimeout(4000);
  for (const label of ['确定', '确认发布', '发布']) {
    const b = page.locator('button').filter({ hasText: label }).last();
    const c = await b.count().catch(() => 0);
    if (c) { await b.click({ timeout: 4000 }).catch(() => {}); console.log('[5] confirm:', label); break; }
  }
  await page.waitForTimeout(7000);
  console.log('[6] after save url:', page.url());
  await page.screenshot({ path: 'D:/md/数度网站/.tools/z-edit3-saved.png' });

  await page.waitForTimeout(1500);
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
