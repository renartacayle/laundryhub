const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1440, height: 960 },
  });

  const page = await browser.newPage();

  async function loadCleanPage(role = 'owner') {
    await page.goto('http://localhost:3000/?nointro=1', { waitUntil: 'networkidle0' });
    await page.evaluate((r) => {
      localStorage.setItem('lh_intro_seen', 'true');
      localStorage.setItem('lh_demo_tutorial_seen', 'true');
      localStorage.setItem('lh_sound_enabled', 'false');
      localStorage.setItem('lh_role', r);
    }, role);
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((res) => setTimeout(res, 800));

    await page.evaluate((r) => {
      const roleMap = {
        'owner': 'Owner',
        'kasir': 'Kasir POS',
        'produksi': 'Produksi',
        'kurir': 'Kurir',
        'pelanggan': 'Pelanggan',
        'agen': 'Agen Dropship'
      };
      const label = roleMap[r];
      if (label) {
        const buttons = Array.from(document.querySelectorAll('header button, nav button, button'));
        const btn = buttons.find(b => b.textContent && b.textContent.trim().includes(label));
        if (btn) btn.click();
      }
    }, role);
    await new Promise((res) => setTimeout(res, 600));

    // Ensure rogue dialogs are dismissed
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const skip = buttons.find((b) => b.textContent && (b.textContent.includes('Lewati') || b.textContent.includes('Nanti Saja')));
      if (skip) skip.click();
    });
    await new Promise((res) => setTimeout(res, 400));
  }

  // 1. Owner P&L Financial Statement
  console.log('1. Capturing Owner P&L Financial Statement...');
  await loadCleanPage('owner');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const pnlBtn = buttons.find((b) => b.textContent && b.textContent.includes('Laba Rugi (P&L)'));
    if (pnlBtn) pnlBtn.click();
  });
  await new Promise((res) => setTimeout(res, 800));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'owner-pnl-financial-statement.png'),
    fullPage: false,
  });

  // 2. Owner Gamifikasi Promo Settings
  console.log('2. Capturing Owner Gamifikasi Promo Settings...');
  await loadCleanPage('owner');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const mktBtn = buttons.find((b) => b.textContent && b.textContent.includes('Pusat Marketing & Cuan'));
    if (mktBtn) mktBtn.click();
  });
  await new Promise((res) => setTimeout(res, 800));
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h4'));
    const gamHeading = headings.find((h) => h.textContent && h.textContent.includes('Gamifikasi Promo Pelanggan'));
    if (gamHeading) {
      gamHeading.scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  });
  await new Promise((res) => setTimeout(res, 600));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'owner-gamification-promo-settings.png'),
    fullPage: false,
  });

  // 3. Lucky Spin Wheel Modal
  console.log('3. Capturing Lucky Spin Wheel Modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const spinTestBtn = buttons.find((b) => b.textContent && b.textContent.includes('Uji Coba Lucky Spin'));
    if (spinTestBtn) spinTestBtn.click();
  });
  await new Promise((res) => setTimeout(res, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'customer-lucky-spin-wheel-modal.png'),
    fullPage: false,
  });

  // 4. Scratch Card Modal
  console.log('4. Capturing Scratch Card Modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const scratchTabBtn = buttons.find((b) => b.textContent && b.textContent.includes('Scratch Card'));
    if (scratchTabBtn) scratchTabBtn.click();
  });
  await new Promise((res) => setTimeout(res, 800));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'customer-scratch-card-modal.png'),
    fullPage: false,
  });

  // 5. Kasir POS with Digital Scale Sync
  console.log('5. Capturing Kasir POS Digital Scale Sync...');
  await loadCleanPage('kasir');
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'kasir-pos-digital-scale-sync.png'),
    fullPage: false,
  });

  // 6. AI Garment & Stain Scanner Modal
  console.log('6. Capturing AI Garment & Stain Scanner Modal...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const aiBtn = buttons.find((b) => b.textContent && b.textContent.includes('AI Garment Scan'));
    if (aiBtn) aiBtn.click();
  });
  await new Promise((res) => setTimeout(res, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'ai-garment-stain-scanner-modal.png'),
    fullPage: false,
  });

  // 7. WhatsApp Auto-Pilot Bot Modal
  console.log('7. Capturing WhatsApp Auto-Pilot Bot Modal...');
  await loadCleanPage('kasir');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const ordersBtn = buttons.find((b) => b.textContent && (b.textContent.includes('Daftar Transaksi') || b.textContent.includes('Daftar Pesanan')));
    if (ordersBtn) ordersBtn.click();
  });
  await new Promise((res) => setTimeout(res, 800));
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const waBotBtn = buttons.find((b) => b.title && b.title.includes('WhatsApp Auto-Pilot Bot'));
    if (waBotBtn) waBotBtn.click();
  });
  await new Promise((res) => setTimeout(res, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'whatsapp-autopilot-bot-modal.png'),
    fullPage: false,
  });

  // 8. Geofence GPS Radar in Staff Attendance Modal
  console.log('8. Capturing Geofence GPS Radar in Staff Attendance Modal...');
  await loadCleanPage('kasir');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const attBtn = buttons.find((b) => b.textContent && b.textContent.includes('Presensi') || (b.title && b.title.includes('Presensi')) || (b.textContent && b.textContent.includes('Absen')));
    if (attBtn) attBtn.click();
  });
  await new Promise((res) => setTimeout(res, 1000));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'geofence-gps-radar-attendance.png'),
    fullPage: false,
  });

  await browser.close();
  console.log('All verification screenshots updated successfully!');
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
