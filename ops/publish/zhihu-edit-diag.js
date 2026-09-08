// Diagnostic: exact buttons + dialog flow on Zhihu /edit page
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

  // dump ALL buttons visible
  const btnsBefore = await page.evaluate(() => [...document.querySelectorAll('button')].map((b, i) => ({ i, t: (b.textContent || '').trim(), cls: (b.className || '').toString().slice(0, 40), dis: b.disabled })).filter(b => b.t || b.dis === true));
  console.log('ALL buttons:', JSON.stringify(btnsBefore, null, 2));

  // replace content
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
  console.log('content len after paste:', len);

  // click 发布
  await page.locator('button').filter({ hasText: '发布' }).last().click({ timeout: 8000 }).catch(e => console.log('pub fail:', e.message.split('\n')[0]));
  await page.waitForTimeout(3500);

  // dump everything after click: body text, buttons, any dialog
  const after = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')].map((b, i) => ({ i, t: (b.textContent || '').trim(), vis: b.offsetParent !== null })).filter(b => b.t);
    const text = document.body.innerText;
    const modals = [...document.querySelectorAll('[class*="Modal"], [class*="modal"], [role="dialog"]')].map(m => ({ cls: (m.className || '').toString().slice(0, 60), txt: (m.textContent || '').trim().slice(0, 200) }));
    return { url: location.href, btns: btns.slice(0, 20), modals, textSample: text.slice(0, 400) };
  }).catch(e => ({ err: e.message }));
  console.log('AFTER publish click:');
  console.log('url:', after.url);
  console.log('modals:', JSON.stringify(after.modals, null, 2));
  console.log('buttons:', JSON.stringify(after.btns, null, 2));
  console.log('text:', (after.textSample || '').replace(/\n+/g, ' | ').slice(0, 300));

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
