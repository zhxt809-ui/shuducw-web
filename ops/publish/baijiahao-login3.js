// Baijiahao login: switch to password tab, fill credentials, submit
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

  // switch to 密码登录 tab
  const pwdTab = page.locator('a, span, div, li, button').filter({ hasText: /密码登录|账号密码登录/ }).first();
  const pc = await pwdTab.count().catch(() => 0);
  console.log('pwd tab candidates:', pc);
  if (pc) { await pwdTab.click({ timeout: 5000 }).catch(e => console.log('tab click fail:', e.message.split('\n')[0])); }
  await page.waitForTimeout(2500);

  // check if userName now visible
  const uname = page.locator('#TANGRAM__PSP_4__userName');
  const visible = await uname.isVisible().catch(() => false);
  console.log('userName visible after tab switch:', visible);

  if (visible) {
    await uname.click();
    await uname.fill(ACCOUNT);
    console.log('username filled');

    const pwd = page.locator('#TANGRAM__PSP_4__password');
    await pwd.click();
    await pwd.fill(PASSWORD);
    console.log('password filled');

    // agreement checkbox
    const agree = page.locator('#TANGRAM__PSP_4__isAgree');
    const checked = await agree.isChecked().catch(() => false);
    console.log('agree checked:', checked);
    if (!checked) { await agree.click({ force: true }).catch(e => console.log('agree click fail:', e.message.split('\n')[0])); }
    await page.waitForTimeout(500);

    // submit
    await page.locator('#TANGRAM__PSP_4__submit').click({ timeout: 5000 }).catch(e => console.log('submit fail:', e.message.split('\n')[0]));
    console.log('submitted');
  } else {
    // maybe already on password tab but form differs; dump visible inputs
    const vis = await page.evaluate(() => [...document.querySelectorAll('input')].filter(el => el.offsetParent !== null).map(el => ({ id: el.id, name: el.name, type: el.type })));
    console.log('visible inputs:', JSON.stringify(vis));
  }

  // watch result
  for (let i = 1; i <= 8; i++) {
    await page.waitForTimeout(3500);
    const url = page.url();
    const st = await page.evaluate(() => {
      const t = document.body.innerText;
      return {
        captcha: /验证码|滑块|拖动.*验证|安全验证/.test(t),
        captchaText: (t.match(/请.{0,20}验证码|拖动.{0,20}滑块|安全验证.{0,30}/) || [''])[0],
        sms: /短信|验证码已发送|手机号验证/.test(t),
        err: (document.querySelector('[class*="error"], .passport-error, .tip') || {}).textContent || ''
      };
    }).catch(() => ({}));
    console.log(`[t+${i * 3.5}s] url=${url} cap=${st.captcha}${st.captchaText ? '("' + st.captchaText + '")' : ''} sms=${st.sms} err="${(st.err || '').trim().slice(0, 70)}"`);
    if (!url.includes('login')) { console.log('LEFT LOGIN PAGE'); break; }
  }
  await page.screenshot({ path: 'D:/md/数度网站/.tools/b-3-result.png' });
  console.log('final url:', page.url());
  await page.waitForTimeout(1500);
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
