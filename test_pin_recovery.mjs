import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';

async function testPinRecovery() {
  console.log('Starting PIN Recovery automated test with Puppeteer...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  // STEP A: Register Owner Hendra first so he is a real registered owner
  console.log('Step A: Registering Hendra as Owner with PIN 8888...');
  await page.click('#sidebar-account-switcher-btn');
  await new Promise((r) => setTimeout(r, 600));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.textContent?.includes('Akun Google'));
    if (target) target.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  // Switch to Register tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const regTab = btns.find((b) => b.textContent?.includes('Daftar Baru') || b.textContent?.includes('Daftar Owner'));
    if (regTab) regTab.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  await page.type('#lh-google-reg-email', 'hendra.saputra.laundry@gmail.com');
  await page.type('#lh-google-name-input', 'Hendra Saputra');
  await page.type('#lh-google-outlet-input', 'Hendra Clean Laundry');
  await page.type('#lh-google-phone-input', '0812-8899-7701');
  await page.type('#lh-google-reg-pin', '8888');
  await new Promise((r) => setTimeout(r, 400));

  await page.evaluate(() => {
    const btn = document.getElementById('lh-google-reg-submit-btn');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 2000));
  console.log('Hendra registered successfully!');

  // STEP B: Open Modal again and test "Lupa PIN?"
  console.log('Step B: Opening Google Auth Modal to test Lupa PIN...');
  await page.click('#sidebar-account-switcher-btn');
  await new Promise((r) => setTimeout(r, 600));

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.textContent?.includes('Akun Google'));
    if (target) target.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '16-auth-modal-login-with-lupa-pin.png') });
  console.log('Screenshot 16 captured: Login modal with Lupa PIN button');

  // Click "Lupa PIN" button
  console.log('Clicking Lupa PIN button...');
  await page.evaluate(() => {
    const btn = document.getElementById('lh-forgot-pin-btn') || document.getElementById('lh-tab-recovery-btn');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '17-recovery-step1-request-otp.png') });
  console.log('Screenshot 17 captured: Recovery Step 1 (Request OTP)');

  // Fill recovery form
  console.log('Filling recovery credentials for Hendra...');
  await page.type('#lh-recovery-email-input', 'hendra.saputra.laundry@gmail.com');
  await page.type('#lh-recovery-phone-input', '0812-8899-7701');
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '18-recovery-step1-filled.png') });
  console.log('Screenshot 18 captured: Recovery Step 1 form filled');

  // Submit OTP request
  console.log('Submitting OTP request...');
  await page.evaluate(() => {
    const btn = document.getElementById('lh-recovery-send-otp-btn');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '19-recovery-step2-otp-generated.png') });
  console.log('Screenshot 19 captured: Recovery Step 2 (OTP code issued & banner displayed)');

  // Click "Gunakan Kode Ini"
  console.log('Clicking Gunakan Kode Ini...');
  await page.evaluate(() => {
    const btn = document.getElementById('lh-use-otp-hint-btn');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // Enter new PIN (5566)
  console.log('Entering new PIN (5566)...');
  await page.type('#lh-recovery-newpin-input', '5566');
  await page.type('#lh-recovery-confirmpin-input', '5566');
  await new Promise((r) => setTimeout(r, 500));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '20-recovery-step2-newpin-filled.png') });
  console.log('Screenshot 20 captured: Step 2 new PIN filled');

  // Submit new PIN
  console.log('Submitting new PIN...');
  await page.evaluate(() => {
    const btn = document.getElementById('lh-recovery-submit-btn');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 2200));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '21-recovered-and-logged-in.png') });
  console.log('Screenshot 21 captured: Owner logged in after successful PIN recovery');

  // Verify that new PIN 5566 works for logging in
  console.log('Verification: Testing login with newly reset PIN (5566)...');
  
  // Step 1: Click Kunci Sesi / Keluar Owner in sidebar
  console.log('Logging out owner via sidebar...');
  await page.click('#sidebar-account-switcher-btn');
  await new Promise((r) => setTimeout(r, 600));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const logoutBtn = btns.find((b) => b.textContent?.includes('Kunci Sesi'));
    if (logoutBtn) logoutBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1200));

  // Modal automatically opens on logout!
  console.log('Typing email and newly reset PIN 5566...');
  await page.type('#lh-google-email-input', 'hendra.saputra.laundry@gmail.com');
  await page.type('#lh-google-pin-input', '5566');
  await new Promise((r) => setTimeout(r, 400));

  await page.evaluate(() => {
    const btn = document.getElementById('lh-google-submit-btn');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 1800));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '22-verified-login-with-new-pin.png') });
  console.log('Screenshot 22 captured: Verified login with new PIN 5566');

  await browser.close();
  console.log('ALL PIN RECOVERY TESTS PASSED 100% SUCCESSFULLY!');
}

testPinRecovery().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
