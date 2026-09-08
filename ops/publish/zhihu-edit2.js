// Edit Zhihu article: go to creator list, find 编辑 link, handle new tab, edit + publish
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const fs = require('fs');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-zhihu';
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

  // go to creator article management
  await page.goto('https://www.zhihu.com/creator/manage/creation/article', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('list url:', page.url());

  // find all 编辑 links/buttons with their row info
  const edits = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('a, button, [role="button"]').forEach((el, idx) => {
      const t = (el.textContent || '').trim();
      if (t === '编辑' || t === '修改') {
        const href = el.getAttribute('href') || '';
        items.push({ idx, tag: el.tagName, href, rowText: (el.closest('div,li,tr') || {}).innerText ? el.closest('div,li,tr').innerText.slice(0, 120) : '' });
      }
    });
    return items;
  }).catch(e => ({ err: e.message }));
  console.log('edit links:', JSON.stringify(edits, null, 2));

  let editorPage = null;
  if (edits && edits.length) {
    const target = edits.find(e => e.href && /write|edit|p\//.test(e.href)) || edits[0];
    console.log('clicking edit, href=', target.href);
    // if href exists, goto it in new page; else click and await popup
    if (target.href) {
      editorPage = await ctx.newPage();
      await editorPage.goto('https://www.zhihu.com' + (target.href.startsWith('/') ? target.href : '/' + target.href), { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(async () => {
        await editorPage.goto(target.href.startsWith('http') ? target.href : 'https://www.zhihu.com' + target.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
      });
    } else {
      const [popup] = await Promise.all([
        page.waitForEvent('popup', { timeout: 15000 }).catch(() => null),
        page.locator('a, button, [role="button"]').filter({ hasText: /^编辑$/ }).first().click({ timeout: 8000 }).catch(e => console.log('click fail', e.message.split('\n')[0]))
      ]);
      editorPage = popup;
    }
  }
  if (!editorPage) { console.log('no editor page obtained'); await ctx.close(); return; }
  await editorPage.waitForTimeout(6000);
  console.log('editor url:', editorPage.url());

  // Title
  const titleEl = editorPage.locator('textarea[placeholder*="请输入标题"]');
  const tc = await titleEl.count().catch(() => 0);
  console.log('title input count:', tc);
  if (tc) { await titleEl.click(); await titleEl.fill(TITLE); console.log('title updated'); }

  // Content: clear + paste
  const editor = editorPage.locator('.public-DraftEditor-content');
  const edc = await editor.count().catch(() => 0);
  console.log('editor count:', edc);
  if (edc) {
    await editor.click();
    await editorPage.keyboard.press('Control+a');
    await editorPage.waitForTimeout(400);
    await editorPage.keyboard.press('Delete');
    await editorPage.waitForTimeout(600);
    await editor.click();
    await editorPage.waitForTimeout(400);
    await editorPage.evaluate(({ html, text }) => {
      const ed = document.querySelector('.public-DraftEditor-content');
      const dt = new DataTransfer();
      dt.setData('text/html', html);
      dt.setData('text/plain', text);
      ed.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    }, { html: HTML, text: TEXT });
    await editorPage.waitForTimeout(3000);
    const pasted = await editorPage.evaluate(() => {
      const ed = document.querySelector('.public-DraftEditor-content');
      const t = ed ? ed.innerText : '';
      return { len: t.trim().length, tables: ed ? ed.querySelectorAll('table').length : -1, hasShudu: t.includes('数度财务'), hasPhone: /84556877|13359182829/.test(t), hasEmoji: /❌|👉|⚠️/.test(t), hasSite: t.includes('shuducw') };
    });
    console.log('content check:', JSON.stringify(pasted));
  }

  await editorPage.screenshot({ path: 'D:/md/数度网站/.tools/z-edit2-ready.png' });

  // publish
  const pubBtn = editorPage.locator('button').filter({ hasText: '发布' }).last();
  const pbc = await pubBtn.count().catch(() => 0);
  console.log('publish btn count:', pbc);
  if (pbc) { await pubBtn.click({ timeout: 8000 }).catch(e => console.log('pub click fail:', e.message.split('\n')[0])); }
  await editorPage.waitForTimeout(4000);
  for (const label of ['确定', '确认发布', '发布']) {
    const b = editorPage.locator('button').filter({ hasText: label }).last();
    const c = await b.count().catch(() => 0);
    if (c) { await b.click({ timeout: 4000 }).catch(() => {}); console.log('confirm:', label); break; }
  }
  await editorPage.waitForTimeout(6000);
  console.log('after save url:', editorPage.url());
  await editorPage.screenshot({ path: 'D:/md/数度网站/.tools/z-edit2-saved.png' });

  await editorPage.waitForTimeout(1500);
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
