// Delete OLD article (p/2079167530137137790) precisely, then verify both URLs
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-zhihu';
const OLD_ID = '2079167530137137790';
const NEW_ID = '2079237860775964832';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1) confirm current list state
  await page.goto('https://www.zhihu.com/creator/manage/creation/article', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  const before = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('a[href*="/p/"]').forEach(a => {
      const m = a.getAttribute('href').match(/\/p\/(\d+)/);
      if (m && (a.textContent || '').trim().length > 5 && !items.some(i => i.id === m[1])) items.push({ id: m[1], text: (a.textContent || '').trim().slice(0, 40) });
    });
    return items;
  });
  console.log('[1] articles before delete:', JSON.stringify(before));

  // 2) delete the OLD article (precise by ID)
  const clicked = await page.evaluate((oldId) => {
    const link = [...document.querySelectorAll('a[href]')].find(a => a.getAttribute('href') && a.getAttribute('href').includes(oldId));
    if (!link) return { ok: false, err: 'old article link not found (maybe already gone)' };
    let node = link; let moreBtn = null;
    for (let d = 0; d < 6 && !moreBtn; d++) {
      node = node.parentElement; if (!node) break;
      moreBtn = [...node.querySelectorAll('button')].find(b => (b.textContent || '').includes('更多'));
    }
    if (!moreBtn) return { ok: false, err: 'more btn not found' };
    moreBtn.click();
    return { ok: true };
  }, OLD_ID);
  console.log('[2] click 更多:', JSON.stringify(clicked));
  await page.waitForTimeout(2500);

  const del = await page.evaluate(() => {
    const items = [...document.querySelectorAll('button, div, li, span, a')].filter(el => (el.textContent || '').trim() === '删除');
    if (!items.length) return { ok: false, err: '删除 not found' };
    items[items.length - 1].click();
    return { ok: true };
  }).catch(e => ({ ok: false, err: e.message }));
  console.log('[3] click 删除:', JSON.stringify(del));
  await page.waitForTimeout(2500);

  let confirmed = false;
  for (const ct of ['确认', '确定', '确认删除', '删除']) {
    const b = page.locator('button, div[role="button"]').filter({ hasText: ct }).last();
    const c = await b.count().catch(() => 0);
    if (c && await b.isVisible().catch(() => false)) { await b.click({ timeout: 4000 }).catch(() => {}); console.log('[4] confirm:', ct); confirmed = true; break; }
  }
  if (!confirmed) console.log('[4] no confirm dialog');
  await page.waitForTimeout(3000);

  // 3) verify list state after delete
  const after = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('a[href*="/p/"]').forEach(a => {
      const m = a.getAttribute('href').match(/\/p\/(\d+)/);
      if (m && (a.textContent || '').trim().length > 5 && !items.some(i => i.id === m[1])) items.push({ id: m[1], text: (a.textContent || '').trim().slice(0, 40) });
    });
    return items;
  });
  console.log('[5] articles after delete:', JSON.stringify(after));

  // 4) verify new article live
  await page.goto(`https://zhuanlan.zhihu.com/p/${NEW_ID}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4500);
  const live = await page.evaluate(() => {
    const t = document.body.innerText;
    return { title: ((document.querySelector('h1') || {}).textContent || '').trim().slice(0, 50), hasNewIntro: t.includes('先说结论'), hasEmoji: /❌|👉|⚠️|📞/.test(t), hasPolicy: t.includes('政策依据'), hasSite: t.includes('shuducw.com') };
  }).catch(e => ({ err: e.message }));
  console.log('[6] new article live check:', JSON.stringify(live));
  await page.screenshot({ path: 'D:/md/数度网站/.tools/z-new-live.png' });

  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
