import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));

  console.log('Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
  
  console.log('Typing hello...');
  await page.type('input', 'hello');
  await page.keyboard.press('Enter');
  
  console.log('Waiting for response...');
  await new Promise(r => setTimeout(r, 5000));
  
  console.log('Done.');
  await browser.close();
})();
