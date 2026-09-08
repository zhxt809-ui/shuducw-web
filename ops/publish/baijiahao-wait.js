// Open Baijiahao login window, pre-fill creds, submit to verification stage, then WAIT quietly
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const fs = require('fs');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-baijiahao';
const ACCOUNT = 'shuducw';
const PASSWORD = process.env.BAIJIAHAO_PASSWORD || '';
const LOG = 'D:/md/数度网站/.tools/bj-wait.log';

function log(m) { try { fs.appendFileSync(LOG, `[${new Date().toISOString()}] ${m}\n`); } catch {} console.log(m); }

(async () => {
  log('START');
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://baijiahao.baidu.com/builder/theme/bjh/login', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(6000);
  log('login page loaded');

  // pre-fill: switch to password tab if needed
  const unameV = await page.locator('#TANGRAM__PSP_4__userName').isVisible().catch(() => false);
  if (!unameV) {
    await page.locator('#TANGRAM__PSP_4__sms_btn_back').click({ force: true, timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2000);
  }
  const unameV2 = await page.locator('#TANGRAM__PSP_4__userName').isVisible().catch(() => false);
  if (unameV2) {
    await page.locator('#TANGRAM__PSP_4__userName').fill(ACCOUNT);
    await page.locator('#TANGRAM__PSP_4__password').fill(PASSWORD);
    const agree = page.locator('#TANGRAM__PSP_4__isAgree');
    if (await agree.count().catch(() => 0) && !(await agree.isChecked().catch(() => true))) await agree.click({ force: true }).catch(() => {});
    log('credentials prefilled, submitting');
    await page.locator('#TANGRAM__PSP_4__submit').click({ force: true, timeout: 8000 }).catch(e => log('submit fail ' + e.message.split('\n')[0]));
  } else {
    log('could not prefill — leaving window for manual login');
  }
  log('BROWSER OPEN — waiting quietly for user to finish login (captcha/code)');

  // WAIT quietly: gentle poll every 15s, no other actions
  let loggedIn = false;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(15000);
    try {
      const pages = ctx.pages();
      const states = pages.map(p => ({ u: p.url() }));
      const success = states.some(s => !s.u.includes('/login') && s.u.includes('baijiahao'));
      if (success) { log('LOGIN SUCCESS, url: ' + JSON.stringify(states)); loggedIn = true; break; }
      if (i % 4 === 3) log(`waiting... ${(i + 1) * 15}s`);
    } catch (e) { log('poll err ' + e.message); }
  }
  log(loggedIn ? 'LOGGED IN — ready to publish' : 'TIMEOUT waiting — still open');
  await ctx.close();
  log('DONE');
})().catch(e => { log('FATAL ' + e.message); process.exit(1); });
