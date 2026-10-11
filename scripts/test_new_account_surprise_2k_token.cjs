const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';
const BASE_URL = 'http://127.0.0.1:5173';

async function runTest() {
  console.log('=== TEST: SURPRISE FREE 2K TOKEN UNTUK BUKA AKUN BARU ===');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('dialog', async (dialog) => {
    console.log(`[Browser Dialog] "${dialog.message()}" -> accepting`);
    await dialog.accept();
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('SURPRISE') || text.includes('REGISTER') || text.includes('Error')) {
      console.log('[PAGE CONSOLE]', text);
    }
  });

  // 1. Open app with clean slate demo reset
  await page.goto(`${BASE_URL}/?nointro=true`, { waitUntil: 'networkidle2' });

  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('lh_intro_seen', 'true');
    localStorage.setItem('lh_redeemed_codes', JSON.stringify(['INTRO50']));
    localStorage.setItem('lh_onboarding_completed', 'true');
    localStorage.setItem('lh_audio_enabled', 'false');
    localStorage.setItem('lh_bypass_pin_for_testing', 'true');
  });

  await page.goto(`${BASE_URL}/?nointro=true`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1000));

  // 2. Open Google Auth Modal -> Register Tab
  console.log('--- Step 2: Open Register Tab for New Owner ---');
  await page.evaluate(() => {
    const btn = document.getElementById('btn-google-auth-modal');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Switch to register tab inside modal
  const regTabClicked = await page.evaluate(() => {
    const regTab = document.getElementById('lh-tab-register-btn');
    if (regTab) {
      regTab.click();
      return true;
    }
    return false;
  });
  console.log('Daftar Owner Baru tab clicked:', regTabClicked);

  await new Promise((r) => setTimeout(r, 600));

  // 3. Fill in registration form for brand new real account
  console.log('--- Step 3: Fill in Registration Form ---');
  await page.evaluate(() => {
    function setReactInput(el, val) {
      if (!el) return;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    setReactInput(document.getElementById('lh-google-reg-email'), 'rina.fresh@laundryhub.id');
    setReactInput(document.getElementById('lh-google-name-input'), 'Ibu Rina Wijaya');
    setReactInput(document.getElementById('lh-google-outlet-input'), 'Rina Fresh Laundromat');
    setReactInput(document.getElementById('lh-google-phone-input'), '081234567890');
    setReactInput(document.getElementById('lh-google-reg-pin'), '9999');
  });

  await new Promise((r) => setTimeout(r, 500));

  // 4. Click Submit Button
  console.log('--- Step 4: Submit Registration ---');
  await page.evaluate(() => {
    const submitBtn = document.getElementById('lh-google-reg-submit-btn');
    if (submitBtn) submitBtn.click();
  });

  // Wait for registration to complete and Surprise Modal to appear
  await new Promise((r) => setTimeout(r, 2000));

  // 5. Verify Surprise Modal is Open
  console.log('--- Step 5: Verify Surprise Free 2k Token Modal ---');
  const surpriseModalData = await page.evaluate(() => {
    const claimBtn = document.getElementById('btn-claim-surprise-tokens');
    const bodyText = document.body.innerText;

    const hasWelcomeBonusText = bodyText.includes('Surprise Welcome Gift') || bodyText.includes('KEJUTAN SPESIAL OWNER BARU');
    const has2kTokensText = bodyText.includes('2.000') || bodyText.includes('+2.000');
    const hasSultanPack = bodyText.includes('Paket Sultan') || bodyText.includes('Rp 50.000');
    const activeUid = localStorage.getItem('lh_active_owner_uid');
    const coins = localStorage.getItem(`lh_coins_${activeUid}`);

    return {
      claimBtnExists: !!claimBtn,
      hasWelcomeBonusText,
      has2kTokensText,
      hasSultanPack,
      activeUid,
      coins,
    };
  });

  console.log('Surprise Modal Verification Result:', surpriseModalData);

  if (!surpriseModalData.claimBtnExists) {
    throw new Error('NewAccountSurpriseModal did not appear after new account registration!');
  }
  if (surpriseModalData.coins !== '2000') {
    throw new Error(`Expected 2000 token coins in storage, got ${surpriseModalData.coins}`);
  }

  // Capture screenshot of surprise modal
  const sc1 = path.join(ARTIFACT_DIR, '42-surprise-free-2k-tokens-modal.png');
  await page.screenshot({ path: sc1, fullPage: true });
  console.log('Saved screenshot:', sc1);

  // 6. Click Claim Button
  console.log('--- Step 6: Click Claim Button ---');
  await page.evaluate(() => {
    const claimBtn = document.getElementById('btn-claim-surprise-tokens');
    if (claimBtn) claimBtn.click();
  });

  await new Promise((r) => setTimeout(r, 1200));

  // 7. Verify Dashboard displays 2k tokens and zero dummy data
  console.log('--- Step 7: Verify Dashboard State after Claim ---');
  const dashboardState = await page.evaluate(() => {
    const claimBtn = document.getElementById('btn-claim-surprise-tokens');
    const bodyText = document.body.innerText;
    const activeUid = localStorage.getItem('lh_active_owner_uid');
    const coins = Number(localStorage.getItem(`lh_coins_${activeUid}`) || '0');
    const orders = JSON.parse(localStorage.getItem(`lh_orders_${activeUid}`) || '[]');
    const machines = JSON.parse(localStorage.getItem(`lh_machines_${activeUid}`) || '[]');

    return {
      modalClosed: !claimBtn,
      activeUid,
      coins,
      ordersCount: orders.length,
      machinesCount: machines.length,
      hasRinaFresh: bodyText.includes('Rina Fresh') || bodyText.includes('Ibu Rina'),
    };
  });

  console.log('Dashboard State:', dashboardState);

  if (!dashboardState.modalClosed) {
    throw new Error('Surprise modal did not close after clicking claim!');
  }
  if (dashboardState.coins !== 2000) {
    throw new Error(`Expected 2000 coins on dashboard, got ${dashboardState.coins}`);
  }
  if (dashboardState.ordersCount !== 0) {
    throw new Error(`Real account should have 0 dummy orders, got ${dashboardState.ordersCount}`);
  }

  // Capture screenshot of Dashboard with 2k tokens
  const sc2 = path.join(ARTIFACT_DIR, '43-new-owner-dashboard-with-2k-tokens.png');
  await page.screenshot({ path: sc2, fullPage: true });
  console.log('Saved screenshot:', sc2);

  console.log('================================================================');
  console.log('SUCCESS! SURPRISE FREE 2K TOKEN MODAL & BALANCE VERIFIED 100%!');
  console.log('================================================================');

  await browser.close();
}

runTest().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
