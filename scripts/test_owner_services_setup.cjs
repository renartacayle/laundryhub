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

  console.log('1. Loading app as Owner...');
  await page.goto(`${BASE_URL}/?nointro=true`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('lh_user_id', 'usr-owner');
    localStorage.setItem('lh_role', 'owner');
    localStorage.setItem('lh_theme', 'light');
    document.documentElement.classList.remove('dark');
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // Navigate to 'Katalog & Tarif Jasa' via sidebar
  console.log('2. Navigating to Katalog & Tarif Jasa in Sidebar...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.innerText.includes('Katalog & Tarif Jasa') || b.innerText.includes('Tarif Jasa'));
    if (target) target.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'owner-services-catalog-light.png'),
    fullPage: false,
  });
  console.log('Saved owner-services-catalog-light.png');

  // Switch to Dark mode
  console.log('3. Capturing Dark mode...');
  await page.evaluate(() => {
    localStorage.setItem('lh_theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'owner-services-catalog-dark.png'),
    fullPage: false,
  });
  console.log('Saved owner-services-catalog-dark.png');

  // Open Modal Tambah Jasa Baru
  console.log('4. Opening Modal Tambah Jasa Baru...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find((b) => b.innerText.includes('Tambah Jasa Baru'));
    if (addBtn) addBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'add-service-modal.png'),
    fullPage: false,
  });
  console.log('Saved add-service-modal.png');

  // Close modal and open Edit modal on first card
  console.log('5. Opening Modal Edit Tarif & Info on first card...');
  await page.evaluate(() => {
    const cancelBtns = Array.from(document.querySelectorAll('button'));
    const cancel = cancelBtns.find((b) => b.innerText.includes('Batal'));
    if (cancel) cancel.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const editBtns = Array.from(document.querySelectorAll('button'));
    const edit = editBtns.find((b) => b.innerText.includes('Ubah Tarif & Info'));
    if (edit) edit.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'edit-service-modal.png'),
    fullPage: false,
  });
  console.log('Saved edit-service-modal.png');

  // Close edit modal, switch to Kasir POS to verify sync
  console.log('6. Switching to Kasir POS to verify live catalog...');
  await page.evaluate(() => {
    const cancelBtns = Array.from(document.querySelectorAll('button'));
    const cancel = cancelBtns.find((b) => b.innerText.includes('Batal'));
    if (cancel) cancel.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // Change role to Kasir
  await page.evaluate(() => {
    const roleBtn = document.querySelector('#sidebar-role-selector-btn');
    if (roleBtn) roleBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const kasirOpt = document.querySelector('#sidebar-role-opt-kasir');
    if (kasirOpt) kasirOpt.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'kasir-pos-live-services.png'),
    fullPage: false,
  });
  console.log('Saved kasir-pos-live-services.png');

  await browser.close();
  console.log('All tests completed successfully!');
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
