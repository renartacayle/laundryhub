const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';
const BASE_URL = 'http://localhost:3000';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto(`${BASE_URL}/?nointro=true`, { waitUntil: 'networkidle2' });
  
  // Set role to kasir and go to kasir POS to see orders or history
  await page.evaluate(() => {
    localStorage.setItem('lh_role', 'kasir');
  });
  await page.goto(`${BASE_URL}/?nointro=true&tab=kasir`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Let's see all buttons on page
  const btnTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim());
  });
  console.log('Buttons found on Kasir:', btnTexts.filter(t => t && t.length < 30));

  // In Kasir POS, look for any order history / search
  // Or simply switch role to pelanggan:
  await page.evaluate(() => {
    localStorage.setItem('lh_role', 'pelanggan');
  });
  await page.goto(`${BASE_URL}/?nointro=true`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Clicking #open-receipt-btn...');
  await page.evaluate(() => {
    const btn = document.querySelector('#open-receipt-btn');
    if (btn) btn.click();
    else console.log('Could not find #open-receipt-btn');
  });

  await new Promise(r => setTimeout(r, 1500));
  
  const hasReceipt = await page.evaluate(() => {
    const el = document.querySelector('#printable-receipt');
    return !!el;
  });
  console.log('Is #printable-receipt in DOM:', hasReceipt);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'receipt-modal-verified.png'),
    fullPage: false,
  });
  console.log('Saved receipt-modal-verified.png');

  await browser.close();
}

main().catch(console.error);
