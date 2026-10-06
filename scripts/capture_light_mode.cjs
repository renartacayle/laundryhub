const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';
const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Ensure Light Mode in localStorage
  await page.goto(`${BASE_URL}/?nointro=true`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('lh_theme', 'light');
    document.documentElement.classList.remove('dark');
  });

  // 1. Owner Dashboard in Light Mode
  console.log('1. Capturing Owner Dashboard Light Mode...');
  await page.evaluate(() => {
    localStorage.setItem('lh_role', 'owner');
    window.location.reload();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'owner-light-check.png'),
    fullPage: false,
  });
  console.log('Saved owner-light-check.png');

  // 2. Kasir POS in Light Mode
  console.log('2. Capturing Kasir POS Light Mode...');
  await page.evaluate(() => {
    localStorage.setItem('lh_role', 'kasir');
    window.location.reload();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'kasir-light-check.png'),
    fullPage: false,
  });
  console.log('Saved kasir-light-check.png');

  // 3. Produksi in Light Mode
  console.log('3. Capturing Produksi Light Mode...');
  await page.evaluate(() => {
    localStorage.setItem('lh_role', 'produksi');
    window.location.reload();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'produksi-light-check.png'),
    fullPage: false,
  });
  console.log('Saved produksi-light-check.png');

  // 4. Pelanggan Portal in Light Mode
  console.log('4. Capturing Pelanggan Portal Light Mode...');
  await page.evaluate(() => {
    localStorage.setItem('lh_role', 'pelanggan');
    window.location.reload();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'pelanggan-light-check.png'),
    fullPage: false,
  });
  console.log('Saved pelanggan-light-check.png');

  await browser.close();
  console.log('Done capturing all views.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
