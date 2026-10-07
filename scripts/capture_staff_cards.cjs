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

  // 1. Light Mode Staff Cards
  await page.goto(`${BASE_URL}/?nointro=true`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('lh_user_id', 'usr-owner');
    localStorage.setItem('lh_role', 'owner');
    localStorage.setItem('lh_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // Navigate to staff tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.innerText.includes('Karyawan & Komisi'));
    if (target) target.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Scroll down to cards section
  await page.evaluate(() => {
    window.scrollBy(0, 2300);
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'staff-cards-checkboxes-light.png'),
    fullPage: false,
  });
  console.log('Saved staff-cards-checkboxes-light.png');

  // 2. Dark Mode Staff Cards
  await page.evaluate(() => {
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'staff-cards-checkboxes-dark.png'),
    fullPage: false,
  });
  console.log('Saved staff-cards-checkboxes-dark.png');

  await browser.close();
}

main().catch(console.error);
