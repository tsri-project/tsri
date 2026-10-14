const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(path.join(process.env.UI_QA_MODULES, 'playwright'));

// Isolated preview build only. No user credentials or production data are used.
const root = path.resolve('build/client');
const server = http.createServer((req, res) => {
  let file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
  const ext = path.extname(file);
  res.setHeader('Content-Type', ({ '.js':'text/javascript', '.css':'text/css', '.html':'text/html', '.png':'image/png', '.svg':'image/svg+xml' })[ext] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
});
(async () => {
  await new Promise(resolve => server.listen(4173, '127.0.0.1', resolve));
  const executablePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const browser = await chromium.launch({ headless: true, executablePath });
  const pages = ['tor','tasks','documents','legal-inventory','traceability','calendar','meetings','reviews','raid','knowledge','reports','team','settings'];
  const failures = [];
  fs.mkdirSync('ui-qa', { recursive: true });
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } });
      await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
      await context.addInitScript(() => {
        const user = { id:'00000000-0000-0000-0000-000000000001', email:'qa@example.invalid' };
        localStorage.setItem('tsri_auth_session', JSON.stringify({ session:{ user }, profile:{ id:user.id, email:user.email, full_name:'ผู้ตรวจหน้าจอตัวอย่าง' }, role:'viewer' }));
      });
      const page = await context.newPage();
      for (const route of pages) {
        try {
          await page.goto('http://127.0.0.1:4173/' + route);
          await page.locator('.page-hero h1').waitFor({ timeout: 15000 });
          const color = await page.locator('.page-hero').evaluate(el => getComputedStyle(el).backgroundColor);
          assert.equal(color, 'rgb(9, 47, 96)', route + ' hero theme');
          const overflow = await page.evaluate(() => {
            const main = document.querySelector('main');
            return main.scrollWidth > main.clientWidth + 2 || document.documentElement.scrollWidth > window.innerWidth + 2;
          });
          assert.equal(overflow, false, route + ' horizontal page overflow at ' + width);
          await page.screenshot({ path:`ui-qa/${route}-${width}.png` });
          if (route === 'tor') {
            await page.getByText('รายละเอียดอ้างอิง', { exact: true }).click();
            await page.getByText('TOR-PROJ-001-2569', { exact: true }).first().waitFor({ state:'visible' });
          }
          console.log(`PASS ${route} ${width}`);
        } catch (error) {
          failures.push(`${route} ${width}: ${error.message}`);
          await page.screenshot({ path:`ui-qa/FAIL-${route}-${width}.png` }).catch(() => {});
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  fs.writeFileSync('ui-qa/result.json', JSON.stringify({ failures }, null, 2));
  if (failures.length) throw new Error(failures.join('\n'));
})().catch(error => { console.error(error.message); server.close(); process.exitCode = 1; });
