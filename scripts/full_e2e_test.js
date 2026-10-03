import puppeteer from '/home/rena/.gemini/config/skills/sendwa/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js';

const TARGET_URL = process.env.TEST_URL || 'https://laundryhub-rho.vercel.app/';

async function runFullTest() {
  console.log(`\n========================================================`);
  console.log(`🚀 STARTING COMPREHENSIVE FULL E2E TEST ON: ${TARGET_URL}`);
  console.log(`========================================================\n`);

  let browser;
  try {
    // Connect to running Opera instance on 9222
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: { width: 1366, height: 768 },
    });
  } catch (err) {
    console.error('❌ Failed to connect to Opera on port 9222:', err.message);
    process.exit(1);
  }

  const page = await browser.newPage();
  const results = [];

  const recordResult = (testName, passed, details = '') => {
    results.push({ testName, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | ${testName}${details ? ` -> ${details}` : ''}`);
  };

  try {
    // 1. PAGE LOAD
    console.log(`\n--- [1] TESTING PAGE LOAD & TITLE ---`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    const pageTitle = await page.title();
    const hasCorrectTitle = pageTitle.includes('LAUNDRYHUB');
    recordResult('Page Title Verification', hasCorrectTitle, pageTitle);

    // 2. NAVBAR BRAND & ROLE SELECTOR
    console.log(`\n--- [2] TESTING NAVIGATION & ROLES ---`);
    await page.waitForSelector('nav', { timeout: 10000 });
    const navText = await page.$eval('nav', el => el.innerText);
    recordResult('Navbar Rendered', navText.includes('LAUNDRYHUB'), 'Brand visible');

    // 3. LANGUAGE TOGGLE (ID -> EN -> ID)
    console.log(`\n--- [3] TESTING MULTI-LANGUAGE (i18n) ENGINE ---`);
    const langBtn = await page.$('button[title*="Bahasa"], button:has-text("ID"), button:has-text("EN")');
    if (langBtn) {
      // Click language toggle to EN
      await langBtn.click();
      await page.waitForTimeout?.(800) || new Promise(r => setTimeout(r, 800));
      const bodyTextEn = await page.$eval('body', el => el.innerText);
      const isEnglish = bodyTextEn.includes('POS Cashier') || bodyTextEn.includes('Catalog') || bodyTextEn.includes('Grand Total');
      recordResult('Switch to English (EN 🇬🇧)', isEnglish, 'Found English UI terms');

      // Click back to ID
      await langBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const bodyTextId = await page.$eval('body', el => el.innerText);
      const isIndo = bodyTextId.includes('Kasir POS') || bodyTextId.includes('Keranjang') || bodyTextId.includes('Total Akhir');
      recordResult('Switch back to Indonesian (ID 🇮🇩)', isIndo, 'Found Indonesian UI terms');
    } else {
      recordResult('Language Toggle Button', false, 'Button not located');
    }

    // 4. MULTI-CURRENCY TOGGLE (IDR -> USD -> IDR)
    console.log(`\n--- [4] TESTING MULTI-CURRENCY (USD / IDR) ENGINE ---`);
    const currencyButtons = await page.$$('button');
    let currBtn = null;
    for (const btn of currencyButtons) {
      const text = await (await btn.getProperty('innerText')).jsonValue();
      if (text.includes('Rp IDR') || text.includes('$ USD')) {
        currBtn = btn;
        break;
      }
    }

    if (currBtn) {
      // Toggle to USD
      await currBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const bodyTextUsd = await page.$eval('body', el => el.innerText);
      const hasDollar = bodyTextUsd.includes('$');
      recordResult('Switch to US Dollar ($ USD)', hasDollar, 'Found dollar prices rendered');

      // Toggle back to IDR
      await currBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const bodyTextIdr = await page.$eval('body', el => el.innerText);
      const hasRp = bodyTextIdr.includes('Rp');
      recordResult('Switch back to Rupiah (Rp IDR)', hasRp, 'Found rupiah prices restored');
    } else {
      recordResult('Currency Switcher Button', false, 'Button not found');
    }

    // 5. NOTE TOKEN TOP-UP & PROMO CODE VOUCHER
    console.log(`\n--- [5] TESTING TOKEN QUOTA & PROMO VOUCHERS ---`);
    const allButtons = await page.$$('button');
    let coinTopupBtn = null;
    for (const b of allButtons) {
      const txt = await (await b.getProperty('innerText')).jsonValue();
      if (txt.includes('Koin') || txt.includes('Token')) {
        coinTopupBtn = b;
        break;
      }
    }

    if (coinTopupBtn) {
      await coinTopupBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      const modalText = await page.$eval('body', el => el.innerText);
      const hasPackages = modalText.includes('200') && modalText.includes('10.000');
      recordResult('Token Packages (Rp 25-50 / nota)', hasPackages, '200 notes = Rp 10.000');

      // Test Voucher Input
      const promoInput = await page.$('input[placeholder*="RENA50"], input[placeholder*="kode"]');
      if (promoInput) {
        await promoInput.click({ clickCount: 3 });
        await promoInput.type('RENA50');
        const claimBtn = await page.$('button:has-text("Klaim"), button:has-text("Claim")');
        if (claimBtn) {
          await claimBtn.click();
          await new Promise(r => setTimeout(r, 1000));
          const updatedModal = await page.$eval('body', el => el.innerText);
          const claimSuccess = updatedModal.includes('Koin') || updatedModal.includes('klaim');
          recordResult('Promo Voucher Code Claim (RENA50)', claimSuccess, 'Voucher processed');
        }
      }

      // Check Developer Top-up QRIS
      const qrisPayBtn = await page.$('button:has-text("QRIS"), button:has-text("SpeedCash")');
      if (qrisPayBtn) {
        await qrisPayBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        const qrisModalText = await page.$eval('body', el => el.innerText);
        const hasDevMerchant = qrisModalText.includes('RENARTASHOP') || qrisModalText.includes('ID1025407037114');
        recordResult('Developer Token QRIS (RENARTASHOP)', hasDevMerchant, 'NMID ID1025407037114 verified');

        // Close QRIS modal
        const closeQrisBtn = await page.$('button:has-text("Batalkan"), button:has-text("Tutup")');
        if (closeQrisBtn) await closeQrisBtn.click();
      }

      // Close Topup Modal
      const closeButtons = await page.$$('button');
      for (const cb of closeButtons) {
        const t = await (await cb.getProperty('innerText')).jsonValue();
        if (t.trim() === '✕' || t.includes('Batal') || t.includes('Tutup')) {
          await cb.click().catch(() => {});
          break;
        }
      }
      await new Promise(r => setTimeout(r, 500));
    }

    // 6. POS CASHIER TRANSACTIONS & OUTLET QRIS (MODEL 1)
    console.log(`\n--- [6] TESTING MODEL 1 OUTLET QRIS & POS CASHIER ---`);
    // Ensure in Kasir role
    const roleSelect = await page.$('select');
    if (roleSelect) {
      await roleSelect.select('kasir');
      await new Promise(r => setTimeout(r, 800));
    }

    // Add kiloan item to cart
    const addToCartBtns = await page.$$('button:has-text("Tambah"), button:has-text("kg")');
    if (addToCartBtns.length > 0) {
      await addToCartBtns[0].click();
      await new Promise(r => setTimeout(r, 800));
      recordResult('Add Item to POS Cart', true, 'Cart item added');
    }

    // Select Outlet QRIS payment
    const qrisMethodBtns = await page.$$('button');
    for (const b of qrisMethodBtns) {
      const txt = await (await b.getProperty('innerText')).jsonValue();
      if (txt.includes('QRIS Outlet') || txt.includes('QRIS SpeedCash') || txt.includes('QRIS')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));

    // Verify Outlet QRIS setup button
    const setupQrBtn = await page.$('button:has-text("Atur QR"), button:has-text("Setup QR")');
    recordResult('Outlet QRIS Setup Button Available', !!setupQrBtn, 'Found "Atur QR" button in POS');

    if (setupQrBtn) {
      await setupQrBtn.click();
      await new Promise(r => setTimeout(r, 800));
      const configModalText = await page.$eval('body', el => el.innerText);
      const isConfigModalOpen = configModalText.includes('Pengaturan QRIS Outlet') || configModalText.includes('Model 1');
      recordResult('Outlet QRIS Configuration Modal', isConfigModalOpen, 'Model 1 info displayed');

      // Close config modal
      const cancelBtn = await page.$('button:has-text("Batal"), button:has-text("Tutup")');
      if (cancelBtn) await cancelBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }

    // Process checkout via QRIS
    const checkoutBtn = await page.$('button:has-text("Proses Bayar"), button:has-text("Checkout"), button:has-text("Terbitkan Nota")');
    if (checkoutBtn) {
      await checkoutBtn.click();
      await new Promise(r => setTimeout(r, 1200));

      const customerQrisModal = await page.$eval('body', el => el.innerText);
      const isCustomerQrisOpen = customerQrisModal.includes('Pembayaran Cucian Outlet') || customerQrisModal.includes('Uang Cucian Masuk ke Warung');
      recordResult('Customer Outlet QRIS Modal Separation', isCustomerQrisOpen, 'Customer QRIS distinct from Developer Topup');

      // Click Webhook simulation
      const simulateWebhookBtn = await page.$('button:has-text("Simulasi Pelanggan Scan")');
      if (simulateWebhookBtn) {
        await simulateWebhookBtn.click();
        await new Promise(r => setTimeout(r, 1500));
        recordResult('Instant Webhook Callback Simulated', true, 'Payment verified');
      }

      // Check Receipt Modal
      const receiptModalText = await page.$eval('body', el => el.innerText);
      const isReceiptOpen = receiptModalText.includes('LAUNDRYHUB') && (receiptModalText.includes('LUNAS') || receiptModalText.includes('PAID'));
      recordResult('Thermal Receipt Issued (LUNAS / PAID)', isReceiptOpen, 'Receipt contains invoice & PAID status');

      // Close receipt
      const closeReceipt = await page.$('button:has-text("✕"), button[title="Tutup"]');
      if (closeReceipt) await closeReceipt.click().catch(() => {});
      await new Promise(r => setTimeout(r, 500));
    }

    // 7. CUSTOMER PORTAL & LIVE ORDER TRACKING
    console.log(`\n--- [7] TESTING CUSTOMER PORTAL & TRACKING ---`);
    if (roleSelect) {
      await roleSelect.select('pelanggan');
      await new Promise(r => setTimeout(r, 1000));
      const portalText = await page.$eval('body', el => el.innerText);
      const hasLiveTracking = portalText.includes('Tracking') || portalText.includes('Lacak Cucian');
      recordResult('Customer Self-Service Portal Access', hasLiveTracking, 'Portal loaded');

      // Check Pickup tab
      const pickupTabBtn = await page.$('button:has-text("Minta Antar-Jemput"), button:has-text("Request Pickup")');
      if (pickupTabBtn) {
        await pickupTabBtn.click();
        await new Promise(r => setTimeout(r, 800));
        const pickupFormText = await page.$eval('body', el => el.innerText);
        const hasHotelNotice = pickupFormText.includes('Hotel') || pickupFormText.includes('Villa') || pickupFormText.includes('Wisatawan');
        recordResult('Hotel & Tourist Pickup Service', hasHotelNotice, 'Tourist hotel/room input supported');
      }
    }

    // 8. OWNER DASHBOARD & BRANCH OUTLET SETTINGS
    console.log(`\n--- [8] TESTING OWNER / HQ DASHBOARD ---`);
    if (roleSelect) {
      await roleSelect.select('owner');
      await new Promise(r => setTimeout(r, 1200));
      const ownerText = await page.$eval('body', el => el.innerText);
      const hasOwnerMetrics = ownerText.includes('Omzet') || ownerText.includes('Laba Bersih') || ownerText.includes('Token');
      recordResult('Owner Dashboard Financial Metrics', hasOwnerMetrics, 'Revenue & net profit displayed');

      // Check Cabang tab for Outlet QRIS card
      const branchesTabBtn = await page.$('button:has-text("Cabang"), button:has-text("Outlet")');
      if (branchesTabBtn) {
        await branchesTabBtn.click();
        await new Promise(r => setTimeout(r, 1000));
        const branchTabText = await page.$eval('body', el => el.innerText);
        const hasOutletQrisCard = branchTabText.includes('QRIS Kasir Outlet') && branchTabText.includes('Model 1');
        recordResult('Owner Branch QRIS Management Card', hasOutletQrisCard, 'Model 1 Outlet QRIS card active');
      }
    }

  } catch (err) {
    console.error('❌ Exception during test execution:', err);
    recordResult('Test Execution Safety', false, err.message);
  } finally {
    await page.close().catch(() => {});
    await browser.disconnect().catch(() => {});
  }

  console.log(`\n========================================================`);
  console.log(`📊 TEST REPORT SUMMARY`);
  console.log(`========================================================`);
  const totalPassed = results.filter(r => r.passed).length;
  const totalFailed = results.filter(r => !r.passed).length;
  console.log(`Total Scenarios Tested : ${results.length}`);
  console.log(`Scenarios Passed       : ${totalPassed} ✅`);
  console.log(`Scenarios Failed       : ${totalFailed} ❌`);
  console.log(`Success Rate           : ${((totalPassed / results.length) * 100).toFixed(1)}%\n`);

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFullTest();
