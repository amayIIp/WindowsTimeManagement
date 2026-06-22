import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`CONSOLE: ${msg.type()} ${msg.text()}`));
  page.on('pageerror', err => console.log(`ERROR: ${err.message}`));

  try {
    await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle', timeout: 10000 });
    console.log('Page loaded successfully');
  } catch (err) {
    console.log(`Failed to load page: ${err.message}`);
  }

  await browser.close();
})();
