// Deep: inspect Baijiahao login iframes and fill credentials
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-baijiahao';
const ACCOUNT = 'shuducw';
const PASSWORD = process.env.BAIJIAHAO_PASSWORD || '';

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://baijiahao.baidu.com/builder/theme/bjh/login', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(6000);

  // enumerate all frames
  const frames = page.frames();
  console.log('frames count:', frames.length);
  for (const [i, f] of frames.entries()) {
    const info = await f.evaluate(() => ({ url: location.href, hasInputs: document.querySelectorAll('input').length })).catch(() => ({ url: '?', err: 'cross-origin/unreadable' }));
    console.log(`frame[${i}] url=${info.url} inputs=${info.hasInputs}`);
  }

  // Find the frame with login inputs
  let loginFrame = null;
  for (const f of frames) {
    const n = await f.locator('input[name="userName"], input[name="username"], input[autocomplete="username"], input[placeholder*="手机号"], input[placeholder*="用户名"]').count().catch(() => 0);
    if (n > 0) { loginFrame = f; console.log('LOGIN FRAME found:', f.url()); break; }
  }

  if (!loginFrame) {
    // try locating any frame with text 密码
    for (const f of frames) {
      const hasPwd = await f.locator('input[type="password"]').count().catch(() => 0);
      if (hasPwd > 0) { loginFrame = f; console.log('PWD FRAME found:', f.url()); break; }
    }
  }

  if (loginFrame) {
    // dump inputs in the login frame
    const inputs = await loginFrame.evaluate(() => [...document.querySelectorAll('input')].map(el => ({
      name: el.name || '', id: el.id || '', type: el.type || '', ph: el.placeholder || ''
    })));
    console.log('login frame inputs:', JSON.stringify(inputs));

    // fill username
    const uname = loginFrame.locator('input[name="userName"], input[name="username"], input[placeholder*="手机号"], input[placeholder*="用户名"], input[autocomplete="username"]').first();
    const uc = await uname.count().catch(() => 0);
    if (uc) { await uname.click(); await uname.fill(ACCOUNT); console.log('username filled:', ACCOUNT); }

    // fill password
    const pwd = loginFrame.locator('input[type="password"]').first();
    const pc = await pwd.count().catch(() => 0);
    if (pc) { await pwd.click(); await pwd.fill(PASSWORD); console.log('password filled'); }

    // click 登录 button inside frame
    const btn = loginFrame.locator('button, a').filter({ hasText: /登\s*录/ }).first();
    const bc = await btn.count().catch(() => 0);
    console.log('login button in frame:', bc);
    if (bc) { await btn.click({ timeout: 5000 }).catch(e => console.log('btn click fail', e.message.split('\n')[0])); console.log('login clicked'); }
  } else {
    console.log('NO login frame found — dumping all frame URLs for diagnosis');
  }

  // watch result
  for (let i = 1; i <= 6; i++) {
    await page.waitForTimeout(3500);
    const url = page.url();
    const errs = await page.evaluate(() => {
      const t = document.body.innerText;
      return {
        captcha: /验证码|滑块|拖动|安全验证/.test(t),
        sms: /短信|验证码已发送|手机号/.test(t),
        err: (document.querySelector('.passport-error, .error-tip, [class*="error"]') || {}).textContent || ''
      };
    }).catch(() => ({}));
    console.log(`[t+${i * 3.5}s] url=${url} captcha=${errs.captcha} sms=${errs.sms} err="${(errs.err || '').trim().slice(0, 60)}"`);
    if (!url.includes('login')) { console.log('LEFT LOGIN - maybe success'); break; }
  }
  await page.screenshot({ path: 'D:/md/数度网站/.tools/b-2-after-login.png' });
  console.log('final url:', page.url());
  await page.waitForTimeout(1500);
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
