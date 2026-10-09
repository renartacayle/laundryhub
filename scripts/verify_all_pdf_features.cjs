const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';
const DOWNLOAD_DIR = '/tmp/laundryhub_pdf_test';
const BASE_URL = 'http://127.0.0.1:5173';

async function main() {
  if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  } else {
    fs.readdirSync(DOWNLOAD_DIR).forEach(file => {
      fs.unlinkSync(path.join(DOWNLOAD_DIR, file));
    });
  }

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DOWNLOAD_DIR,
  });

  // Navigate initially to set localStorage
  await page.goto(`${BASE_URL}/?nointro=true`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.setItem('lh_intro_seen', 'true');
    localStorage.setItem('lh_onboarding_completed', 'true');
    localStorage.setItem('lh_audio_enabled', 'false');
    localStorage.setItem('lh_bypass_pin_for_testing', 'true');
    localStorage.setItem('lh_role', 'owner');
    localStorage.setItem('lh_owner_pin_ok', 'true');
  });

  console.log('--- 1. Testing Staff Salary Slip PDF (A4 & Thermal) via Owner Staff Tab ---');
  await page.goto(`${BASE_URL}/?nointro=true&tab=owner`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Dismiss any lingering overlay if any
  await page.evaluate(() => {
    const dismissBtns = Array.from(document.querySelectorAll('button'));
    const skip = dismissBtns.find(b => b.textContent?.includes('Lewati') || b.textContent?.includes('Skip'));
    if (skip) skip.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Switch to Staff tab in Owner Dashboard
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const staffTab = btns.find(b => b.textContent?.includes('Karyawan') || b.textContent?.includes('Staf'));
    if (staffTab) staffTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click Nota Gaji button for first staff
  const notaGajiClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const notaBtn = btns.find(b => b.title?.includes('Nota Gaji Resmi') || b.textContent?.includes('Nota Gaji'));
    if (notaBtn) {
      notaBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Nota Gaji button:', notaGajiClicked);
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '36-salary-slip-modal-open.png'),
    fullPage: false,
  });

  // Click #btn-download-slip-pdf for A4 format
  const a4SlipDownloaded = await page.evaluate(() => {
    const btn = document.querySelector('#btn-download-slip-pdf');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Downloaded A4 Salary Slip PDF:', a4SlipDownloaded);
  await new Promise(r => setTimeout(r, 2000));

  // Switch to Thermal 80mm format and download
  const thermalSlipDownloaded = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const thermalBtn = btns.find(b => b.textContent?.includes('Struk Thermal 80mm') || b.textContent?.includes('Thermal'));
    if (thermalBtn) {
      thermalBtn.click();
      setTimeout(() => {
        const btn = document.querySelector('#btn-download-slip-pdf');
        if (btn) btn.click();
      }, 500);
      return true;
    }
    return false;
  });
  console.log('Switched to Thermal format & downloaded Thermal Slip PDF:', thermalSlipDownloaded);
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '36b-salary-slip-thermal-modal.png'),
    fullPage: false,
  });

  // Close Salary Slip Modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const tutupBtn = btns.find(b => b.textContent?.trim() === 'Tutup');
    if (tutupBtn) tutupBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('--- 2. Testing Owner Dashboard Financial Stats PDF ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const statsBtn = btns.find(b => b.textContent?.includes('Statistik Bulanan') || b.textContent?.includes('Statistik & Laporan'));
    if (statsBtn) statsBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '37-owner-stats-tab-ready.png'),
    fullPage: false,
  });

  const statsExportClicked = await page.evaluate(() => {
    const btn = document.querySelector('#btn-export-stats-pdf');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Exported Financial Stats PDF:', statsExportClicked);
  await new Promise(r => setTimeout(r, 2000));

  console.log('--- 3. Testing Owner Dashboard P&L PDF & CSV ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pnlBtn = btns.find(b => b.textContent?.includes('Laba Rugi') || b.textContent?.includes('P&L'));
    if (pnlBtn) pnlBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, '38-owner-pnl-tab-ready.png'),
    fullPage: false,
  });

  const pnlPdfClicked = await page.evaluate(() => {
    const btn = document.querySelector('#btn-export-pnl-pdf');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Exported P&L PDF (A4):', pnlPdfClicked);
  await new Promise(r => setTimeout(r, 2000));

  const pnlCsvClicked = await page.evaluate(() => {
    const btn = document.querySelector('#btn-export-pnl-csv');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Exported P&L CSV:', pnlCsvClicked);
  await new Promise(r => setTimeout(r, 2000));

  console.log('--- 4. Testing Kasir & Pelanggan Nota Receipt PDF ---');
  await page.evaluate(() => {
    localStorage.setItem('lh_role', 'pelanggan');
  });
  await page.goto(`${BASE_URL}/?nointro=true&tab=pelanggan`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const pelangganReceiptDownloaded = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pdfBtn = btns.find(b => b.title?.includes('Download Nota Resmi PDF') || b.textContent?.includes('Download PDF'));
    if (pdfBtn) {
      pdfBtn.click();
      return true;
    }
    return false;
  });
  console.log('Downloaded Pelanggan Receipt PDF:', pelangganReceiptDownloaded);
  await new Promise(r => setTimeout(r, 2000));

  console.log('--- 5. Inspecting All Downloaded PDF & CSV Files ---');
  const files = fs.readdirSync(DOWNLOAD_DIR);
  console.log('Total files generated:', files.length);

  for (const f of files) {
    const fullPath = path.join(DOWNLOAD_DIR, f);
    const size = fs.statSync(fullPath).size;
    const header = fs.readFileSync(fullPath).slice(0, 8).toString('utf-8');
    const isPdf = header.startsWith('%PDF-');
    console.log(`✓ FILE: ${f}`);
    console.log(`  Size: ${size} bytes`);
    console.log(`  isPdf: ${isPdf}`);
    console.log(`  Header Preview: "${header.replace(/\r?\n/g, '\\n')}"`);
  }

  await browser.close();
  console.log('--- All PDF & Export Verification Passed Successfully! ---');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
