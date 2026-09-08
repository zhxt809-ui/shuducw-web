// Baijiahao login: submit, capture popup window, dump its content, keep browser alive
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const fs = require('fs');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-baijiahao';
const ACCOUNT = 'shuducw';
const PASSWORD = process.env.BAIJIAHAO_PASSWORD || '';
const LOG = 'D:/md/数度网站/.tools/bj-login-session.log';
const CODE_FILE = 'D:/md/数度网站/.tools/bj-code.txt';

function log(m) { try { fs.appendFileSync(LOG, `[${new Date().toISOString()}] ${m}\n`); } catch {} console.log(m); }

(async () => {
  if (fs.existsSync(CODE_FILE)) fs.unlinkSync(CODE_FILE);
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

  // switch to password tab via the footer link
  const backLink = page.locator('#TANGRAM__PSP_4__sms_btn_back, a', { hasText: '用户名密码登录' }).first();
  const bc = await backLink.count().catch(() => 0);
  if (bc) { await backLink.click({ force: true, timeout: 5000 }).catch(() => {}); }
  await page.waitForTimeout(2000);
  const unameV = await page.locator('#TANGRAM__PSP_4__userName').isVisible().catch(() => false);
  const pwdV = await page.locator('#TANGRAM__PSP_4__password').isVisible().catch(() => false);
  log(`password tab: uname=${unameV} pwd=${pwdV}`);
  if (unameV) {
    await page.locator('#TANGRAM__PSP_4__userName').fill(ACCOUNT);
    await page.locator('#TANGRAM__PSP_4__password').fill(PASSWORD);
    const agree = page.locator('#TANGRAM__PSP_4__isAgree');
    if (await agree.count().catch(() => 0) && !(await agree.isChecked().catch(() => true))) await agree.click({ force: true }).catch(() => {});
    log('credentials filled, submitting...');
    // listen for popup while submitting
    const [popup] = await Promise.all([
      page.waitForEvent('popup', { timeout: 20000 }).catch(() => null),
      page.locator('#TANGRAM__PSP_4__submit').click({ force: true, timeout: 8000 }).catch(e => log('submit fail ' + e.message.split('\n')[0]))
    ]);
    log('popup detected: ' + (popup ? 'YES' : 'NO'));
    if (popup) {
      await popup.waitForLoadState('domcontentloaded', { timeout: 20000 }).catch(() => {});
      await popup.waitForTimeout(2500);
      const pi = await popup.evaluate(() => {
        const t = document.body.innerText;
        const inputs = [...document.querySelectorAll('input')].map(i => ({ id: i.id, name: i.name, type: i.type, ph: i.placeholder || '' })).slice(0, 10);
        return { url: location.href, text: t.slice(0, 400), inputs };
      }).catch(e => ({ err: e.message }));
      log('POPUP CONTENT: ' + JSON.stringify(pi));
      await popup.screenshot({ path: 'D:/md/数度网站/.tools/b-popup.png' }).catch(() => {});
    }
  } else {
    log('password tab NOT available; dumping visible inputs');
    const vis = await page.evaluate(() => [...document.querySelectorAll('input')].filter(el => el.offsetParent !== null).map(i => ({ id: i.id, type: i.type, ph: i.placeholder || '' })));
    log('visible inputs: ' + JSON.stringify(vis));
  }

  // keep waiting: poll for code file OR login success OR popup interaction by user (up to 4 min)
  log('WAITING for user action (popup slider / SMS code file / manual login)');
  let done = false;
  for (let i = 0; i < 48 && !done; i++) {
    await page.waitForTimeout(5000);
    const url = page.url();
    const allPages = ctx.pages();
    const anyLoggedIn = allPages.some(p => !p.url().includes('login') && p.url().includes('baijiahao'));
    if (!url.includes('login') && url.includes('baijiahao')) { log('MAIN PAGE LEFT LOGIN: ' + url); done = true; break; }
    if (anyLoggedIn) { log('SOME PAGE LEFT LOGIN (logged in)'); done = true; break; }
    if (fs.existsSync(CODE_FILE)) {
      const code = fs.readFileSync(CODE_FILE, 'utf8').trim();
      if (/^\d{6}$/.test(code)) {
        log('CODE RECEIVED: ' + code);
        // try to enter SMS code: switch to sms tab and fill
        const smsTab = page.locator('#TANGRAM__PSP_4__smsSwitchWrapper, .sms-login').first();
        if (await smsTab.count().catch(() => 0)) await smsTab.click({ force: true }).catch(() => {});
        await page.waitForTimeout(1500);
        const smsPhone = page.locator('#TANGRAM__PSP_4__smsPhone');
        const smsCode = page.locator('#TANGRAM__PSP_4__smsVerifyCode');
        if (await smsPhone.count().catch(() => 0)) { await smsPhone.fill(ACCOUNT); await smsCode.fill(code); log('sms code filled'); await page.locator('#TANGRAM__PSP_4__smsSubmit').click({ force: true }).catch(() => {}); done = true; break; }
        log('no sms fields visible, cannot enter code automatically');
      }
    }
    if (i % 6 === 5) log(`still waiting (${(i + 1) * 5}s)... url=${url}`);
  }
  log('final url: ' + page.url());
  log('DONE');
})().catch(e => { log('FATAL ' + e.message); process.exit(1); });
