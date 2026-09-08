// Delete duplicate article + properly edit original via /edit URL
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const fs = require('fs');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-zhihu';
const ORIGINAL_ID = '2079167530137137790';
const DUPLICATE_ID = '2079191350206010405';
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

  // ===== PART 1: delete duplicate =====
  await page.goto('https://www.zhihu.com/creator/manage/creation/article', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  console.log('[1] creator list loaded');

  // find duplicate row's 更多 button via its unique link
  const clickedMore = await page.evaluate((dupId) => {
    const dupLink = [...document.querySelectorAll('a[href]')].find(a => a.getAttribute('href') && a.getAttribute('href').includes(dupId));
    if (!dupLink) return { ok: false, err: 'dup link not found' };
    let node = dupLink;
    let moreBtn = null;
    for (let d = 0; d < 6 && !moreBtn; d++) {
      node = node.parentElement;
      if (!node) break;
      moreBtn = [...node.querySelectorAll('button')].find(b => (b.textContent || '').includes('更多'));
    }
    if (!moreBtn) return { ok: false, err: 'more btn not found' };
    moreBtn.click();
    return { ok: true };
  }, DUPLICATE_ID);
  console.log('[2] click 更多:', JSON.stringify(clickedMore));
  await page.waitForTimeout(2500);

  // click 删除 in the opened menu
  const delClicked = await page.evaluate(() => {
    const menuItems = [...document.querySelectorAll('button, div, li, span, a')].filter(el => (el.textContent || '').trim() === '删除' || (el.textContent || '').trim() === '删除文章');
    if (!menuItems.length) return { ok: false, err: '删除 item not found' };
    menuItems[menuItems.length - 1].click();
    return { ok: true };
  }).catch(e => ({ ok: false, err: e.message }));
  console.log('[3] click 删除:', JSON.stringify(delClicked));
  await page.waitForTimeout(2500);

  // confirm dialog
  const confirmTexts = ['确认删除', '确定', '删除', '确认'];
  let confirmed = false;
  for (const ct of confirmTexts) {
    const b = page.locator('button, div[role="button"]').filter({ hasText: ct }).last();
    const c = await b.count().catch(() => 0);
    if (c) {
      const visible = await b.isVisible().catch(() => false);
      if (visible) { await b.click({ timeout: 4000 }).catch(() => {}); console.log('[4] confirm clicked:', ct); confirmed = true; break; }
    }
  }
  if (!confirmed) console.log('[4] no confirm dialog matched (may need manual)');
  await page.waitForTimeout(3000);

  // verify duplicate gone
  const dupStill = await page.evaluate((dupId) => {
    return !!document.querySelector(`a[href*="${dupId}"]`);
  }, DUPLICATE_ID);
  console.log('[5] duplicate still present:', dupStill);
  await page.screenshot({ path: 'D:/md/数度网站/.tools/z-del-result.png' });

  // ===== PART 2: edit original via /edit URL =====
  await page.goto(`https://zhuanlan.zhihu.com/p/${ORIGINAL_ID}/edit`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  console.log('[6] edit url:', page.url());

  const titleEl = page.locator('textarea[placeholder*="请输入标题"]');
  await titleEl.click(); await titleEl.fill(TITLE);

  const editor = page.locator('.public-DraftEditor-content');
  await editor.click();
  await page.keyboard.press('Control+a');
  await page.waitForTimeout(500);
  await page.keyboard.press('Delete');
  await page.waitForTimeout(600);
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
    return { len: t.trim().length, hasNewIntro: t.includes('先说结论'), hasOldIntro: t.includes('小生意试水选个体户'), hasEmoji: /❌|👉|⚠️/.test(t), tables: ed ? ed.querySelectorAll('table').length : -1 };
  });
  console.log('[7] editor content check:', JSON.stringify(check));

  // publish
  await page.locator('button').filter({ hasText: '发布' }).last().click({ timeout: 8000 }).catch(e => console.log('pub fail', e.message.split('\n')[0]));
  await page.waitForTimeout(4000);
  for (const ct of ['确定', '确认发布', '发布']) {
    const b = page.locator('button').filter({ hasText: ct }).last();
    const c = await b.count().catch(() => 0);
    if (c && await b.isVisible().catch(() => false)) { await b.click({ timeout: 4000 }).catch(() => {}); console.log('[8] confirm:', ct); break; }
  }
  await page.waitForTimeout(8000);
  console.log('[9] after save url:', page.url());
  await page.screenshot({ path: 'D:/md/数度网站/.tools/z-edit5-final.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
