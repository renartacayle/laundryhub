import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';

async function runTest() {
  console.log('Launching browser to test clean-slate multi-tenant registration...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 950 });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  // 1. Open Google Auth Modal
  console.log('Opening Auth Modal...');
  await page.click('#sidebar-account-switcher-btn');
  await new Promise((r) => setTimeout(r, 500));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.textContent?.includes('Masuk Akun Google') || b.textContent?.includes('Akun Google'));
    if (target) target.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 2. Click Register Tab
  console.log('Switching to Register New Owner Tab...');
  await page.click('#lh-tab-register-btn');
  await new Promise((r) => setTimeout(r, 500));

  // 3. Fill Register Form
  console.log('Filling Register New Owner form...');
  await page.type('#lh-google-reg-email', 'rina.cleanlaundry@gmail.com');
  await page.type('#lh-google-name-input', 'Rina Handayani');
  await page.type('#lh-google-outlet-input', 'Rina Clean Laundry');
  await page.type('#lh-google-phone-input', '081399887766');
  await page.type('#lh-google-reg-pin', '7788');
  await new Promise((r) => setTimeout(r, 400));

  // 4. Submit Registration
  console.log('Submitting Registration form...');
  await page.click('#lh-google-reg-submit-btn');
  await new Promise((r) => setTimeout(r, 1500));

  // 5. Screenshot Dashboard Overview Clean Slate
  console.log('Capturing Screenshot 23: Dashboard clean slate...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '23-new-owner-dashboard-clean-slate.png') });

  // Helper to click sidebar nav items by exact label
  const clickSidebarNav = async (label) => {
    await page.evaluate((targetLabel) => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find((b) => b.textContent?.includes(targetLabel));
      if (target) target.click();
    }, label);
    await new Promise((r) => setTimeout(r, 900));
  };

  // 6. Navigate to Inventory Tab
  console.log('Navigating to Monitoring Stok...');
  await clickSidebarNav('Monitoring Stok');
  console.log('Capturing Screenshot 24: Inventory empty state...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '24-new-owner-inventory-empty-state.png') });

  // 7. Navigate to Staff Tab
  console.log('Navigating to Karyawan & Komisi...');
  await clickSidebarNav('Karyawan & Komisi');
  console.log('Capturing Screenshot 25: Staff empty state & owner solo banner...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '25-new-owner-staff-empty-state.png') });

  // 8. Navigate to Services Tab
  console.log('Navigating to Katalog & Tarif Jasa...');
  await clickSidebarNav('Katalog & Tarif Jasa');
  console.log('Capturing Screenshot 26: Services & Fragrances empty state...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '26-new-owner-services-empty-state.png') });

  // 9. Navigate to Dropship Tab
  console.log('Navigating to Jaringan Kemitraan Dropship...');
  await clickSidebarNav('Jaringan Kemitraan Dropship');
  console.log('Capturing Screenshot 27: Dropship empty state...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '27-new-owner-dropship-empty-state.png') });

  // 10. Navigate to Audit Log Tab
  console.log('Navigating to Riwayat Audit Log...');
  await clickSidebarNav('Riwayat Audit Log');
  console.log('Capturing Screenshot 28: Audit Log clean slate (registration only)...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '28-new-owner-audit-clean-slate.png') });

  // 11. Switch Role to Kasir POS via Role Switcher Dropdown
  console.log('Switching Role to Kasir POS...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const roleSwitcher = btns.find((b) => b.textContent?.includes('Stasiun Kerja Aktif'));
    if (roleSwitcher) roleSwitcher.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.click('#sidebar-role-opt-kasir');
  await new Promise((r) => setTimeout(r, 1200));

  // If AuthGateModal is open, click #lh-auth-gate-auto-pin-btn
  const autoPinBtn = await page.$('#lh-auth-gate-auto-pin-btn');
  if (autoPinBtn) {
    console.log('Unlocking Kasir role via Auto PIN button...');
    await autoPinBtn.click();
    await new Promise((r) => setTimeout(r, 1200));
  }

  // 12. Check Kasir POS Empty Catalog screenshot before preset
  console.log('Capturing Screenshot 29a: Kasir POS empty catalog...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '29a-kasir-pos-empty-catalog.png') });

  // 13. Trigger 1-Click Preset in Kasir POS
  console.log('Triggering 1-Click Preset in Kasir POS...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const presetBtn = btns.find((b) => b.textContent?.includes('Muat Paket Standar Laundry'));
    if (presetBtn) presetBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  console.log('Capturing Screenshot 29: Kasir POS with preset catalog loaded...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '29-kasir-pos-preset-loaded.png') });

  console.log('All Clean-Slate tests completed successfully!');
  await browser.close();
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
