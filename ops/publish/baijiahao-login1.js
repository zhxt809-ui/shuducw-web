// Baijiahao login attempt with account shuducw / password
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

  await page.goto('https://baijiahao.baidu.com/', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await page.waitForTimeout(5000);
  console.log('1) url:', page.url());
  const body1 = await page.evaluate(() => document.body.innerText.slice(0, 300)).catch(() => '');
  console.log('1) body:', body1.replace(/\n+/g, ' | ').slice(0, 250));

  // Detect login form: try to find account/password inputs
  const loginForm = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')].map((el, i) => ({
      i, name: el.name || '', id: el.id || '', type: el.type || '', ph: el.placeholder || '', cls: (el.className || '').toString().slice(0, 50)
    }));
    const btns = [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean).slice(0, 20);
    return { inputs: inputs.slice(0, 15), btns };
  }).catch(e => ({ err: e.message }));
  console.log('2) login form:', JSON.stringify(loginForm, null, 2));

  // If there's a login button/entry, click it
  const loginLink = page.locator('a, button, span').filter({ hasText: /登\s*录|立即登录|请登录/ }).first();
  const lc = await loginLink.count().catch(() => 0);
  console.log('3) login entry count:', lc);
  if (lc) {
    await loginLink.click({ timeout: 5000 }).catch(e => console.log('login entry click fail:', e.message.split('\n')[0]));
    await page.waitForTimeout(4000);
  }
  console.log('4) url after login click:', page.url());

  // Look for account/password inputs again (may be in a popup/iframe)
  const form2 = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')].map((el, i) => ({
      i, name: el.name || '', id: el.id || '', type: el.type || '', ph: el.placeholder || ''
    }));
    const frames = [...document.querySelectorAll('iframe')].map(f => f.src).slice(0, 5);
    const btns = [...document.querySelectorAll('button')].map(b => (b.textContent || '').trim()).filter(Boolean).slice(0, 20);
    return { inputs: inputs.slice(0, 12), frames, btns };
  }).catch(e => ({ err: e.message }));
  console.log('5) after login click form:', JSON.stringify(form2, null, 2));

  await page.screenshot({ path: 'D:/md/数度网站/.tools/b-1-login.png' });
  await page.waitForTimeout(2000);
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
