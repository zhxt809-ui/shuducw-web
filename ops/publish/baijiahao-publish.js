// Publish Baijiahao article: fill title, paste content into UEditor, publish
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const fs = require('fs');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-baijiahao';
const TITLE = '2026西安开公司选哪种类型？个体户、有限公司、合伙企业对比全解析';
const HTML = fs.readFileSync('D:/md/数度网站/.tools/baijiahao-article-content.html', 'utf8');
const TEXT = HTML.replace(/<[^>]+>/g, m => m === '<hr/>' ? '\n\n---\n\n' : m === '<br/>' ? '\n' : '').replace(/&nbsp;/g, ' ');

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://baijiahao.baidu.com/builder/rc/edit?type=news', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(6000);

  // dismiss dialogs
  for (const txt of ['我知道了', '确认', '取消', '×']) {
    const b = page.locator('button').filter({ hasText: txt }).last();
    const c = await b.count().catch(() => 0);
    if (c && await b.isVisible().catch(() => false)) { await b.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(600); }
  }

  // 1) title
  const titleEl = page.getByPlaceholder(/请输入标题/).first();
  const tc = await titleEl.count().catch(() => 0);
  console.log('[1] title input count:', tc);
  if (tc) { await titleEl.click(); await titleEl.fill(TITLE); console.log('[1] title filled:', TITLE.slice(0, 30) + '...'); }
  await page.waitForTimeout(800);

  // 2) content into UEditor iframe
  const frame = page.frame({ url: /javascript/ }) || page.frames().find(f => f.name() === '' && f.url().startsWith('javascript'));
  const ueFrame = page.frames().find(f => f.url().startsWith('javascript'));
  console.log('[2] ueditor frame found:', !!ueFrame);
  if (ueFrame) {
    await ueFrame.evaluate(() => {
      const body = document.body;
      body.focus();
    });
    // try paste via synthetic ClipboardEvent in frame
    const pasted = await ueFrame.evaluate(({ html, text }) => {
      const body = document.body;
      const dt = new DataTransfer();
      dt.setData('text/html', html);
      dt.setData('text/plain', text);
      const ok = body.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      return ok;
    }, { html: HTML, text: TEXT }).catch(e => ({ err: e.message }));
    console.log('[3] frame paste dispatched:', JSON.stringify(pasted));
    await page.waitForTimeout(3000);
    const bodyLen = await ueFrame.evaluate(() => document.body.innerText.length).catch(() => -1);
    console.log('[3] frame body text len:', bodyLen);
  } else {
    console.log('[3] NO ueditor frame');
  }

  // verify content in editor
  const check = await page.evaluate(() => {
    const t = document.body.innerText;
    return { wordCount: /字数 (\d+)/.exec(t) ? /字数 (\d+)/.exec(t)[1] : '?', hasIntro: t.includes('西安的创业者注册公司'), hasTitle: t.includes('2026西安开公司') };
  }).catch(e => ({ err: e.message }));
  console.log('[4] editor state:', JSON.stringify(check));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-3-filled.png' });

  // 3) publish
  const pubBtn = page.locator('button').filter({ hasText: /^发布$/ }).last();
  const pbc = await pubBtn.count().catch(() => 0);
  console.log('[5] publish btn:', pbc);
  if (pbc) { await pubBtn.click({ timeout: 8000 }).catch(e => console.log('pub fail:', e.message.split('\n')[0])); }
  await page.waitForTimeout(4000);

  // handle confirm dialog
  const after = await page.evaluate(() => {
    const t = document.body.innerText;
    const btns = [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean);
    return { btns: btns.slice(-12), hasCoverWarn: /封面|请选择封面/.test(t), hasError: /请填写|必填|错误/.test(t.slice(0, 600)), sample: t.slice(0, 300).replace(/\n+/g, ' | ') };
  }).catch(e => ({ err: e.message }));
  console.log('[6] after publish click:', JSON.stringify(after, null, 2));

  for (const ct of ['确认发布', '确认', '确定', '发布']) {
    const b = page.locator('button').filter({ hasText: ct }).last();
    const c = await b.count().catch(() => 0);
    if (c && await b.isVisible().catch(() => false)) { await b.click({ timeout: 4000 }).catch(() => {}); console.log('[7] confirm:', ct); break; }
  }
  await page.waitForTimeout(8000);
  console.log('[8] final url:', page.url());
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-4-result.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
