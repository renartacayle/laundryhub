import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';

async function runTest() {
  console.log('Launching browser to test Branch Management (Multi-Cabang)...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Navigate to App
  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  // If AuthGateModal is open, unlock it
  const autoPinBtn = await page.$('#lh-auth-gate-auto-pin-btn');
  if (autoPinBtn) {
    console.log('Auto-unlocking role...');
    await autoPinBtn.click();
    await new Promise((r) => setTimeout(r, 1000));
  }

  // Helper to click sidebar nav
  const clickSidebarNav = async (text) => {
    await page.evaluate((navText) => {
      const btns = Array.from(document.querySelectorAll('aside button, nav button'));
      const target = btns.find((b) => b.textContent && b.textContent.includes(navText));
      if (target) target.click();
    }, text);
    await new Promise((r) => setTimeout(r, 1000));
  };

  // 2. Navigate to Multi-Cabang tab
  console.log('Navigating to Performa Multi-Cabang...');
  await clickSidebarNav('Performa Multi-Cabang');

  // Capture initial branches overview
  console.log('Capturing Screenshot 30: Initial Multi-Cabang Overview...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '30-initial-multi-cabang-overview.png') });

  // 3. Click "+ Buka / Tambah Cabang Baru" button
  console.log('Clicking "+ Buka / Tambah Cabang Baru"...');
  await page.click('#btn-owner-add-branch');
  await new Promise((r) => setTimeout(r, 800));

  console.log('Capturing Screenshot 31: Add Branch Modal Open...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '31-add-branch-modal-open.png') });

  // 4. Fill in new branch form
  console.log('Filling New Branch form...');
  await page.type('#input-branch-name', 'LaundryHub Kemang Timur', { delay: 30 });
  await page.evaluate(() => {
    const codeInput = document.getElementById('input-branch-code');
    if (codeInput) codeInput.value = '';
  });
  await page.type('#input-branch-code', 'KMT', { delay: 30 });
  await page.evaluate(() => {
    const phoneInput = document.getElementById('input-branch-phone');
    if (phoneInput) phoneInput.value = '';
  });
  await page.type('#input-branch-phone', '0812-7788-9900', { delay: 30 });
  await page.type('#input-branch-address', 'Jl. Kemang Timur Raya No. 88, Bangka, Mampang Prapatan, Jakarta Selatan', { delay: 20 });

  console.log('Capturing Screenshot 32: New Branch Form Filled...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '32-add-branch-form-filled.png') });

  // 5. Submit form
  console.log('Submitting New Branch form...');
  await page.click('#btn-save-branch-submit');
  await new Promise((r) => setTimeout(r, 1200));

  console.log('Capturing Screenshot 33: New Branch Created in Grid...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '33-new-branch-created-grid.png') });

  // 6. Test Edit Branch on the newly created branch
  console.log('Testing Edit Branch on KMT...');
  const editBtn = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.id && b.id.includes('btn-edit-branch-'));
    if (target) {
      target.click();
      return true;
    }
    return false;
  });
  await new Promise((r) => setTimeout(r, 800));

  console.log('Capturing Screenshot 34: Edit Branch Modal Open...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '34-edit-branch-modal-open.png') });

  // Close edit modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const cancelBtn = btns.find((b) => b.textContent && b.textContent.includes('Batal'));
    if (cancelBtn) cancelBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // 7. Test Branch Switcher Modal on Top Bar / Sidebar
  console.log('Opening Branch Switcher Modal from Sidebar...');
  await page.evaluate(() => {
    const outletCard = document.querySelector('aside div[title*="cabang"]');
    if (outletCard) outletCard.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  console.log('Capturing Screenshot 35: Branch Switcher Modal with newly added branch...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '35-branch-switcher-modal-with-new-branch.png') });

  // Close branch switcher modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const closeBtn = btns.find((b) => b.textContent && b.textContent.includes('Tutup'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  console.log('Branch Management automated test completed successfully!');
  await browser.close();
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
