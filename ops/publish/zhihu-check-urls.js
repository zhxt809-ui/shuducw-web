// Check both article URLs: original vs new
const { chromium } = require('D:/md/数度网站/.tools/node_modules/playwright-core');
const PROFILE = 'D:/md/数度网站/.tools/.chrome-profile-zhihu';
const URLS = [
  'https://zhuanlan.zhihu.com/p/2079167530137137790',
  'https://zhuanlan.zhihu.com/p/2079191350206010405'
];

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  for (const url of URLS) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(4500);
    const info = await page.evaluate(() => {
      const t = document.body.innerText;
      const title = (document.querySelector('h1') || {}).textContent || '';
      return {
        title: title.trim().slice(0, 60),
        hasNewIntro: t.includes('先说结论'),
        hasOldIntro: t.includes('小生意试水选个体户'),
        hasEmoji: /❌|👉|⚠️/.test(t),
        hasPolicy: t.includes('政策依据'),
        has404: /页面不存在|找不到了|出错了/.test(t.slice(0, 300)),
        excerpt: t.slice(0, 200).replace(/\n+/g, ' | ')
      };
    }).catch(e => ({ err: e.message }));
    console.log('---', url, '---');
    console.log(JSON.stringify(info, null, 2));
  }
  await ctx.close();
  console.log('DONE');
})().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
