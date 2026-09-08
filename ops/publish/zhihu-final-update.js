// Final fix: replace content on /edit and click 更新 button
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const fs = require('fs');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-zhihu';
const ORIGINAL_ID = '2079167530137137790';
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
  await page.goto(`https://zhuanlan.zhihu.com/p/${ORIGINAL_ID}/edit`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);

  // replace content (clear + paste)
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
  const len = await page.evaluate(() => (document.querySelector('.public-DraftEditor-content') || {}).innerText.trim().length);
  console.log('[1] content len:', len);

  // click 更新 button (exact match, avoid 发布设置)
  const updateBtn = page.locator('button').filter({ hasText: /^更新$/ }).last();
  const uc = await updateBtn.count().catch(() => 0);
  console.log('[2] 更新 button count:', uc);
  if (uc) {
    await updateBtn.click({ timeout: 8000 }).catch(e => console.log('update click fail:', e.message.split('\n')[0]));
    console.log('[3] 更新 clicked');
  } else {
    console.log('[3] 更新 button NOT found — dump buttons');
    const btns = await page.evaluate(() => [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean));
    console.log('buttons:', JSON.stringify(btns));
  }
  await page.waitForTimeout(4000);

  // handle confirm dialog if any
  for (const ct of ['确认', '确定', '确认更新']) {
    const b = page.locator('button').filter({ hasText: ct }).last();
    const c = await b.count().catch(() => 0);
    if (c && await b.isVisible().catch(() => false)) { await b.click({ timeout: 4000 }).catch(() => {}); console.log('[4] confirm:', ct); break; }
  }
  await page.waitForTimeout(6000);
  const after = await page.evaluate(() => {
    const t = document.body.innerText;
    return { url: location.href, success: /更新成功|已更新|发布成功/.test(t), hasDialog: /更新成功|发布成功|确定/.test(t.slice(0, 500)) };
  }).catch(e => ({ err: e.message }));
  console.log('[5] after update:', JSON.stringify(after));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/z-final-update.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
