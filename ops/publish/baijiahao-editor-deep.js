// Deep inspect Baijiahao editor: dialogs, title input, content iframe, cover/category
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-baijiahao';

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

  // dismiss any dialogs (确认/我知道了/×)
  for (const txt of ['我知道了', '确认', '取消', '×']) {
    const b = page.locator('button').filter({ hasText: txt }).last();
    const c = await b.count().catch(() => 0);
    if (c && await b.isVisible().catch(() => false)) { await b.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(800); }
  }
  await page.waitForTimeout(1000);

  // title input: look for placeholder containing 标题
  const titleInfo = await page.evaluate(() => {
    const els = [...document.querySelectorAll('input, textarea')].filter(el => {
      const ph = (el.placeholder || '').toLowerCase();
      const cls = (el.className || '').toString();
      return ph.includes('标题') || ph.includes('title') || /title/.test(cls.toLowerCase());
    }).map(el => ({ tag: el.tagName, type: el.type || '', ph: el.placeholder || '', cls: (el.className || '').toString().slice(0, 60), rect: (() => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) }; })() }));
    return els;
  });
  console.log('title inputs:', JSON.stringify(titleInfo, null, 2));

  // content iframe(s) + their structure
  const frameInfo = await page.evaluate(() => [...document.querySelectorAll('iframe')].map((f, i) => ({ i, id: f.id || '', name: f.name || '', cls: (f.className || '').toString().slice(0, 40), src: (f.src || '').slice(0, 60), rect: (() => { const r = f.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })() })));
  console.log('iframes:', JSON.stringify(frameInfo, null, 2));

  // check iframe contents
  for (const f of page.frames()) {
    const url = f.url();
    if (/ueditor|child_editor|news-editor/.test(url) || url.startsWith('javascript')) {
      const info = await f.evaluate(() => {
        const body = document.body;
        return { url: location.href, bodyCls: (body.className || '').toString().slice(0, 60), hasContent: body.innerText.length, tag: body.tagName };
      }).catch(e => ({ err: e.message }));
      console.log('content frame:', JSON.stringify(info));
    }
  }

  // cover + category + checkbox labels (what's required)
  const req = await page.evaluate(() => {
    const t = document.body.innerText;
    const cbs = [...document.querySelectorAll('.cheetah-checkbox-wrapper, label')].map(l => (l.textContent || '').trim().slice(0, 30)).filter(Boolean).slice(0, 10);
    return { hasCover: /封面/.test(t), hasCategory: /分类|栏目/.test(t), hasOriginal: /原创/.test(t), cbs, sample: t.slice(0, 400).replace(/\n+/g, ' | ') };
  });
  console.log('requirements:', JSON.stringify(req, null, 2));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/bj-2-deep.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
