const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';
const BASE_URL = 'http://localhost:3000';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Dark Mode Owner Check
  await page.goto(`${BASE_URL}/?nointro=true`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('lh_theme', 'dark');
    localStorage.setItem('lh_role', 'owner');
    document.documentElement.classList.add('dark');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'owner-dark-verify.png'),
    fullPage: false,
  });
  console.log('Saved owner-dark-verify.png');

  // 2. Light Mode Owner Verification
  await page.evaluate(() => {
    localStorage.setItem('lh_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    document.documentElement.classList.remove('dark');
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'owner-light-verified.png'),
    fullPage: false,
  });
  console.log('Saved owner-light-verified.png');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
