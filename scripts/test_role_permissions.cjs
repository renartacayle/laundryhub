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
  await new Promise((r) => setTimeout(r, 1000));

  // Navigate to Karyawan Tab in Owner Dashboard
  console.log('2. Navigating to Owner Staff Management Tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.innerText.includes('Karyawan & Komisi') || b.innerText.includes('Karyawan'));
    if (target) target.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'owner-staff-checkboxes.png'),
    fullPage: false,
  });
  console.log('Saved owner-staff-checkboxes.png');

  // 3. Open Account Switcher Dropdown in Sidebar
  console.log('3. Opening Account Switcher Dropdown in Sidebar...');
  await page.click('#sidebar-account-switcher-btn');
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'sidebar-account-dropdown.png'),
    fullPage: false,
  });
  console.log('Saved sidebar-account-dropdown.png');

  // 4. Switch to Worker Siti Rahmawati (Kasir + Produksi)
  console.log('4. Switching account to Siti Rahmawati...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const sitiBtn = btns.find((b) => b.innerText.includes('Siti Rahmawati'));
    if (sitiBtn) sitiBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // 5. Open Role/Station Switcher for Siti
  console.log('5. Inspecting Siti\'s permitted stations dropdown...');
  await page.click('#sidebar-role-selector-btn');
  await new Promise((r) => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'siti-allowed-roles-dropdown.png'),
    fullPage: false,
  });
  console.log('Saved siti-allowed-roles-dropdown.png');

  // 6. Click Workshop Produksi for Siti
  console.log('6. Switching Siti to Workshop Produksi...');
  await page.click('#sidebar-role-opt-produksi');
  await new Promise((r) => setTimeout(r, 1000));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'siti-working-on-produksi.png'),
    fullPage: false,
  });
  console.log('Saved siti-working-on-produksi.png');

  // 7. Click Kasir POS for Siti
  console.log('7. Switching Siti to Kasir POS...');
  await page.click('#sidebar-role-selector-btn');
  await new Promise((r) => setTimeout(r, 500));
  await page.click('#sidebar-role-opt-kasir');
  await new Promise((r) => setTimeout(r, 1000));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'siti-working-on-kasir.png'),
    fullPage: false,
  });
  console.log('Saved siti-working-on-kasir.png');

  // 8. Switch back to Oscar (Owner) and open "+ Tambah Karyawan" Modal
  console.log('8. Switching back to Owner and opening Add Worker Modal...');
  await page.click('#sidebar-account-switcher-btn');
  await new Promise((r) => setTimeout(r, 500));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const oscarBtn = btns.find((b) => b.innerText.includes('Oscar'));
    if (oscarBtn) oscarBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Navigate to staff tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.innerText.includes('Karyawan & Komisi'));
    if (target) target.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Click "+ Tambah Karyawan" button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find((b) => b.innerText.includes('Tambah Karyawan'));
    if (addBtn) addBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'add-worker-modal-checkboxes.png'),
    fullPage: false,
  });
  console.log('Saved add-worker-modal-checkboxes.png');

  console.log('All tests completed successfully!');
  await browser.close();
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
