// Inspect Baijiahao login panel tabs and switch to password login
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

  // dump elements with login-related text + their tags/classes/visibility
  const info = await page.evaluate(() => {
    const elText = (el) => (el.textContent || '').trim();
    const results = [];
    const all = [...document.querySelectorAll('a, div, span, li, button, input')];
    all.forEach((el, idx) => {
      const t = elText(el);
      if (/密码登录|扫码登录|账号登录|短信|验证码|登录/.test(t) && t.length < 30) {
        const r = el.getBoundingClientRect();
        results.push({ idx, tag: el.tagName, text: t, id: el.id || '', cls: (el.className || '').toString().slice(0, 50), visible: r.width > 0 && r.height > 0, top: Math.round(r.top), left: Math.round(r.left) });
      }
    });
    // dedupe by text+tag
    const seen = new Set();
    return results.filter(r => { const k = r.tag + '|' + r.text; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 30);
  }).catch(e => ({ err: e.message }));
  console.log('login panel elements:', JSON.stringify(info, null, 2));

  // try clicking "密码登录" with force (in case of overlay)
  const pwdTab = page.locator('a, div, span, li, button').filter({ hasText: /密码登录/ }).first();
  await pwdTab.click({ force: true, timeout: 5000 }).then(() => console.log('pwd tab force-clicked')).catch(e => console.log('force click fail:', e.message.split('\n')[0]));
  await page.waitForTimeout(2500);

  const unameVisible = await page.locator('#TANGRAM__PSP_4__userName').isVisible().catch(() => false);
  const pwdVisible = await page.locator('#TANGRAM__PSP_4__password').isVisible().catch(() => false);
  console.log('after tab click -> userName visible:', unameVisible, '| password visible:', pwdVisible);

  if (unameVisible) {
    await page.locator('#TANGRAM__PSP_4__userName').fill(ACCOUNT);
    await page.locator('#TANGRAM__PSP_4__password').fill(PASSWORD);
    console.log('credentials filled');
    const agree = page.locator('#TANGRAM__PSP_4__isAgree');
    if (await agree.count().catch(() => 0) && !(await agree.isChecked().catch(() => true))) {
      await agree.click({ force: true }).catch(() => {});
      console.log('agreement checked');
    }
    await page.waitForTimeout(400);
    await page.locator('#TANGRAM__PSP_4__submit').click({ force: true, timeout: 5000 }).catch(e => console.log('submit fail:', e.message.split('\n')[0]));
    console.log('submit clicked');
  } else {
    console.log('userName STILL not visible — dumping visible inputs + screenshot');
  }

  for (let i = 1; i <= 6; i++) {
    await page.waitForTimeout(3500);
    const st = await page.evaluate(() => {
      const t = document.body.innerText;
      return { url: location.href, captcha: /验证码|滑块|安全验证/.test(t), sms: /短信|验证码已发送/.test(t), err: (document.querySelector('[class*="error"], .passport-error') || {}).textContent || '' };
    }).catch(() => ({}));
    console.log(`[t+${i * 3.5}s]`, JSON.stringify(st));
    if (!st.url.includes('login')) { console.log('LEFT LOGIN'); break; }
  }
  await page.screenshot({ path: 'D:/md/数度网站/.tools/b-4-login-result.png' });
  console.log('final url:', page.url());
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
