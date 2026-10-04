const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';
const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('1. Testing URL ?nota=LH-KMG-2610-001 in Guest Mode...');
  await page.goto(`${BASE_URL}/?nota=LH-KMG-2610-001&nointro=true`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#mode-btn-guest', { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'tracking-modal-guest.png'),
    fullPage: false,
  });
  console.log('Saved tracking-modal-guest.png');

  console.log('2. Testing Worker Mode in OrderStatusModal...');
  await page.click('#mode-btn-pekerja');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'tracking-modal-pekerja.png'),
    fullPage: false,
  });
  console.log('Saved tracking-modal-pekerja.png');

  console.log('3. Testing Owner Mode in OrderStatusModal...');
  await page.click('#mode-btn-owner');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'tracking-modal-owner.png'),
    fullPage: false,
  });
  console.log('Saved tracking-modal-owner.png');

  console.log('4. Testing Receipt Modal with QR Code and Tracking buttons...');
  await page.evaluate(() => {
    localStorage.setItem('lh_role', 'pelanggan');
  });
  await page.goto(`${BASE_URL}/?nointro=true`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#open-receipt-btn', { timeout: 8000 });
  await page.evaluate(() => {
    const btn = document.querySelector('#open-receipt-btn');
    if (btn) btn.click();
  });
  await page.waitForSelector('#printable-receipt', { timeout: 8000 });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'receipt-modal-qr-tracking.png'),
    fullPage: false,
  });
  console.log('Saved receipt-modal-qr-tracking.png');

  // Also test Mobile Viewport (iPhone / Android)
  console.log('5. Testing Mobile Viewport for Guest Tracking...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto(`${BASE_URL}/?nota=LH-KMG-2610-001&nointro=true`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'tracking-modal-mobile-guest.png'),
    fullPage: false,
  });
  console.log('Saved tracking-modal-mobile-guest.png');

  await browser.close();
  console.log('Finished capturing all verification screenshots successfully!');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
