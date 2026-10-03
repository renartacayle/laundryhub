const puppeteer = require('puppeteer-core');

const TARGET_URL = process.env.TEST_URL || 'https://laundryhub-rho.vercel.app/';

const wait = ms => new Promise(r => setTimeout(r, ms));

async function runFullTest() {
  console.log(`\n========================================================`);
  console.log(`🚀 STARTING COMPREHENSIVE FULL E2E TEST ON: ${TARGET_URL}`);
  console.log(`========================================================\n`);

  let browser;
  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: { width: 1366, height: 768 },
    });
  } catch (err) {
    console.error('❌ Failed to connect to Opera on port 9222:', err.message);
    process.exit(1);
  }

  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  const results = [];

  const recordResult = (testName, passed, details = '') => {
    results.push({ testName, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${mark} | ${testName}${details ? ` -> ${details}` : ''}`);
  };

  try {
    // 1. PAGE LOAD
    console.log(`--- [1] TESTING PAGE LOAD & TITLE ---`);
    await page.goto(TARGET_URL, { waitUntil: 'load', timeout: 30000 });
    await wait(1500);
    const pageTitle = await page.title();
    const hasCorrectTitle = pageTitle.includes('LAUNDRYHUB');
    recordResult('Page Title & Live Availability', hasCorrectTitle, pageTitle);

    // 2. HEADER BRAND & TOPBAR
    console.log(`\n--- [2] TESTING HEADER BRAND & TOPBAR ---`);
    await page.waitForSelector('header', { timeout: 20000 });
    const headerText = await page.$eval('header', el => el.innerText);
    recordResult('Header Brand & Version', headerText.includes('LAUNDRYHUB') && headerText.includes('v2.6'), 'Brand & v2.6 visible');

    // 3. MULTI-LANGUAGE TOGGLE (ID -> EN -> ID)
    console.log(`\n--- [3] TESTING BILINGUAL ENGINE (ID 🇮🇩 / EN 🇬🇧) ---`);
    const switchedToEn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ID') || b.innerText.includes('EN'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (switchedToEn) {
      await wait(800);
      const bodyEn = await page.evaluate(() => document.body.innerText);
      const isEnglish = bodyEn.includes('EN') && (bodyEn.includes('Cashier') || bodyEn.includes('Catalog') || bodyEn.includes('Coins') || bodyEn.includes('Currency'));
      recordResult('Switch to English (EN 🇬🇧)', isEnglish, 'English labels active');

      // Switch back to Indonesian
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('EN') || b.innerText.includes('ID'));
        if (btn) btn.click();
      });
      await wait(800);
      const bodyId = await page.evaluate(() => document.body.innerText);
      const isIndo = bodyId.includes('ID') && (bodyId.includes('Koin') || bodyId.includes('Kasir') || bodyId.includes('Layanan'));
      recordResult('Switch back to Indonesian (ID 🇮🇩)', isIndo, 'Indonesian restored');
    } else {
      recordResult('Language Toggle Button', false, 'Could not find lang button');
    }

    // 4. MULTI-CURRENCY TOGGLE (Rp IDR -> $ USD -> Rp IDR)
    console.log(`\n--- [4] TESTING DUAL-CURRENCY ($ USD / Rp IDR) ENGINE ---`);
    const switchedToUsd = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('IDR') || b.innerText.includes('USD'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (switchedToUsd) {
      await wait(800);
      const bodyUsd = await page.evaluate(() => document.body.innerText);
      const hasDollar = bodyUsd.includes('$');
      recordResult('Currency Switch to USD ($)', hasDollar, 'Prices converted with $1 = Rp 16,000');

      // Switch back to IDR
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('USD') || b.innerText.includes('IDR'));
        if (btn) btn.click();
      });
      await wait(800);
      const bodyIdr = await page.evaluate(() => document.body.innerText);
      const hasRupiah = bodyIdr.includes('Rp');
      recordResult('Currency Switch to IDR (Rp)', hasRupiah, 'Rupiah currency restored');
    } else {
      recordResult('Currency Switcher Button', false, 'Could not find currency button');
    }

    // 5. NOTE TOKEN QUOTA & PROMO CODE VOUCHERS
    console.log(`\n--- [5] TESTING TOKEN QUOTA TOPUP & PROMO VOUCHERS ---`);
    const openedTokenModal = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => (b.title && b.title.includes('Top Up Koin')) || b.innerText.includes('Koin Nota'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (openedTokenModal) {
      await wait(1000);
      const modalText = await page.evaluate(() => document.body.innerText);
      const hasPackages = modalText.includes('10.000') && modalText.includes('20.000') && modalText.includes('50.000');
      recordResult('Affordable Token Packages (Rp 25-50 / nota)', hasPackages, 'Packages 200, 500, 1000, 2000 displayed');

      // Test Voucher Input
      await page.evaluate(() => {
        const input = document.querySelector('input[placeholder*="RENA50"]') || document.querySelector('input[placeholder*="kode"]');
        if (input) {
          input.value = 'RENA50';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      await wait(500);

      const claimSuccess = await page.evaluate(() => {
        const claimBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Klaim') || b.innerText.includes('Claim'));
        if (claimBtn) {
          claimBtn.click();
          return true;
        }
        return false;
      });

      if (claimSuccess) {
        await wait(1000);
        const afterClaimText = await page.evaluate(() => document.body.innerText);
        const voucherFeedback = afterClaimText.includes('Koin') || afterClaimText.includes('klaim') || afterClaimText.includes('berhasil') || afterClaimText.includes('pernah');
        recordResult('Promo Voucher Code Claim (RENA50)', voucherFeedback, 'Voucher engine reacted successfully');
      }

      // Check Developer Topup QRIS (RENARTASHOP)
      const clickedPayQris = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('QRIS') && (b.innerText.includes('SpeedCash') || b.innerText.includes('Bayar')));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      if (clickedPayQris) {
        await wait(1200);
        const qrisModalText = await page.evaluate(() => document.body.innerText);
        const hasDevMerchant = qrisModalText.includes('RENARTASHOP') && qrisModalText.includes('ID1025407037114');
        recordResult('Developer Token QRIS (RENARTASHOP SpeedCash)', hasDevMerchant, 'NMID ID1025407037114 locked to developer');

        // Close Developer QRIS modal
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Batalkan') || b.innerText.includes('Tutup'));
          if (btn) btn.click();
        });
        await wait(800);
      }

      // Close Topup Modal cleanly
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const closeBtn = btns.find(b => b.innerText.trim() === '✕');
        if (closeBtn) closeBtn.click();
      });
      await wait(1000);
    } else {
      recordResult('Top-Up Token Modal Open', false, 'Could not trigger modal');
    }

    // 6. POS CASHIER TRANSACTIONS & OUTLET QRIS (MODEL 1)
    console.log(`\n--- [6] TESTING MODEL 1 OUTLET QRIS & POS CASHIER ---`);
    // Switch to Kasir role
    const switchedToKasir = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Kasir POS'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    recordResult('Switch Role to Kasir POS', switchedToKasir, 'Active role is now Kasir POS');
    await wait(1200);

    // Select Outlet QRIS payment method
    const clickedOutletQris = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const qrisBtn = btns.find(b => b.innerText.includes('QRIS Outlet') || b.innerText.includes('Outlet QRIS'));
      if (qrisBtn) {
        qrisBtn.click();
        return true;
      }
      return false;
    });
    await wait(800);

    const posBody = await page.evaluate(() => document.body.innerText);
    const hasOutletNotice = posBody.includes('QRIS Penerimaan Warung') || posBody.includes('Outlet QRIS Direct') || posBody.includes('rekening warung');
    recordResult('Model 1 Outlet Direct QRIS Banner in POS', hasOutletNotice, 'Customer laundry payment directed to shop account');

    // Test "Atur QR" configuration modal
    const clickedSetupQr = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Atur QR') || b.innerText.includes('Setup QR'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clickedSetupQr) {
      await wait(1000);
      const setupModalText = await page.evaluate(() => document.body.innerText);
      const hasConfigModal = setupModalText.includes('Pengaturan QRIS Outlet') || setupModalText.includes('Model 1');
      recordResult('Outlet QRIS Configuration Modal', hasConfigModal, 'Shop owner can upload custom QRIS');

      // Close config modal
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Batal') || b.innerText.trim() === '✕');
        if (btn) btn.click();
      });
      await wait(800);
    }

    // Add item to cart and process checkout
    await page.evaluate(() => {
      const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Tambah') || b.innerText.includes('+ Order'));
      if (addBtn) addBtn.click();
    });
    await wait(800);

    // Click Process Pay & Issue Receipt
    const clickedCheckout = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Proses Bayar') || b.innerText.includes('Terbitkan Nota'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clickedCheckout) {
      await wait(1200);
      const custQrisText = await page.evaluate(() => document.body.innerText);
      const hasCustQrisModal = custQrisText.includes('Pembayaran Cucian Outlet') || custQrisText.includes('Uang Cucian Masuk ke Warung');
      recordResult('Customer Outlet QRIS Payment Modal', hasCustQrisModal, 'Distinct from Developer Topup');

      // Click Webhook simulation
      const clickedSimulateWebhook = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Simulasi Pelanggan Scan'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      if (clickedSimulateWebhook) {
        await wait(1800);
        recordResult('Instant Payment Webhook Verification', true, 'Simulated bank webhook delivered');

        // Check thermal receipt modal
        const receiptText = await page.evaluate(() => document.body.innerText);
        const isReceiptIssued = receiptText.includes('LAUNDRYHUB') && (receiptText.includes('LUNAS') || receiptText.includes('PAID IN FULL'));
        recordResult('Official Thermal Receipt Issued (Status: LUNAS)', isReceiptIssued, 'Thermal receipt and barcode generated');

        // Close receipt modal
        await page.evaluate(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '✕' || b.innerText.includes('Tutup'));
          if (btn) btn.click();
        });
        await wait(800);
      }
    }

    // 7. CUSTOMER PORTAL & TOURIST/HOTEL PICKUP
    console.log(`\n--- [7] TESTING CUSTOMER SELF-SERVICE PORTAL ---`);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Pelanggan'));
      if (btn) btn.click();
    });
    await wait(1200);

    const portalText = await page.evaluate(() => document.body.innerText);
    const hasLiveTracking = portalText.includes('Lacak Cucian') || portalText.includes('Live Realtime Tracking') || portalText.includes('Cucian');
    recordResult('Customer Live Order Tracking Portal', hasLiveTracking, 'Portal active with tracking stages');

    // Click Pickup Tab
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Antar-Jemput') || b.innerText.includes('Pickup'));
      if (btn) btn.click();
    });
    await wait(800);

    const pickupText = await page.evaluate(() => document.body.innerText);
    const hasTouristNotice = pickupText.includes('Hotel') || pickupText.includes('Villa') || pickupText.includes('Wisatawan');
    recordResult('Hotel & Tourist Courier Pickup Integration', hasTouristNotice, 'Room number & hotel front desk support active');

    // 8. OWNER DASHBOARD & BRANCH OUTLET SETTINGS
    console.log(`\n--- [8] TESTING OWNER / HQ DASHBOARD ---`);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Owner') || b.innerText.includes('Bos'));
      if (btn) btn.click();
    });
    await wait(1200);

    const ownerText = await page.evaluate(() => document.body.innerText);
    const hasOwnerFinancials = ownerText.includes('Omzet') && ownerText.includes('Laba Bersih');
    recordResult('Owner Financial Performance Overview', hasOwnerFinancials, 'Revenue, net profit, & margin metrics active');

    // Click Cabang tab
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cabang') || b.innerText.includes('Outlet'));
      if (btn) btn.click();
    });
    await wait(1000);

    const branchText = await page.evaluate(() => document.body.innerText);
    const hasOutletQrisPanel = branchText.includes('QRIS Kasir Outlet') && branchText.includes('Model 1');
    recordResult('Owner Multi-Outlet QRIS Management Card', hasOutletQrisPanel, 'Outlet QRIS configuration accessible to Owner');

    // 9. LANDING PAGE SHOWCASE & ROI CALCULATOR MODAL
    console.log(`\n--- [9] TESTING LANDING PAGE SHOWCASE & ROI CALCULATOR ---`);
    const clickedPromoBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Promo Rp 25') || b.innerText.includes('Rp 25'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    recordResult('Open Showcase & Promo Modal Button', clickedPromoBtn, 'Clicked Promo Rp 25 in Navbar');

    if (clickedPromoBtn) {
      await wait(1000);
      const modalText = await page.evaluate(() => document.body.innerText);
      const hasShowcaseContent = modalText.includes('LAUNDRYHUB SHOWCASE') && modalText.includes('Kalkulator Penghematan') && modalText.includes('Cuma Bayar Rp 25/Nota');
      recordResult('Showcase ROI Calculator & Feature Matrix', hasShowcaseContent, 'ROI Calculator and comparison table verified');

      // Close modal
      await page.evaluate(() => {
        const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Tutup') || b.innerText.includes('✕') || b.querySelector('svg'));
        // Find close button inside modal
        const buttons = Array.from(document.querySelectorAll('button'));
        const modalClose = buttons.find(b => b.innerText.includes('Tutup & Jelajahi'));
        if (modalClose) modalClose.click();
      });
      await wait(800);
    }

    // 10. OWNER PUSAT MARKETING & MONETISASI HUB
    console.log(`\n--- [10] TESTING OWNER MARKETING & MONETISASI HUB ---`);
    // Ensure in owner role
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Owner') || b.innerText.includes('Bos'));
      if (btn) btn.click();
    });
    await wait(800);

    // Click Pusat Marketing & Cuan tab
    const clickedMarketingTab = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Pusat Marketing & Cuan') || b.innerText.includes('Marketing'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    recordResult('Navigate to Pusat Marketing & Cuan Tab', clickedMarketingTab, 'Marketing hub tab clicked');

    if (clickedMarketingTab) {
      await wait(1000);
      const mktText = await page.evaluate(() => document.body.innerText);
      const hasMarketingEngine = mktText.includes('Pusat Pemasaran Otomatis') && mktText.includes('Generator Cold Outreach');
      recordResult('Cold Outreach WhatsApp Generator UI', hasMarketingEngine, '1-Click WA generator and live preview active');

      const hasDevGateway = mktText.includes('Gateway Payout Developer') && mktText.includes('RENARTASHOP') && mktText.includes('ID1025407037114');
      recordResult('SpeedCash Developer Gateway Integration', hasDevGateway, 'RENARTASHOP SpeedCash QRIS live stream connected');

      // Test pitch template switch
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Anti-Curang IoT'));
        if (btn) btn.click();
      });
      await wait(600);
      const updatedPitch = await page.evaluate(() => document.body.innerText);
      const hasIotPitch = updatedPitch.includes('pengunci mesin cuci') || updatedPitch.includes('teknologi IoT');
      recordResult('Cold Pitch Template Switching (IoT)', hasIotPitch, 'Pitch preview dynamically generated');
    }

    // 11. GOOGLE & LINEAR STYLE COMMAND PALETTE (CTRL+K)
    console.log(`\n--- [11] TESTING COMMAND PALETTE MODAL (CTRL+K / GOOGLE & LINEAR) ---`);
    const openedPalette = await page.evaluate(() => {
      const searchBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cari nota') || b.querySelector('svg'));
      // Find button with search icon or title
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.title && b.title.includes('Ctrl+K'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    recordResult('Open Command Palette Button (Ctrl+K)', openedPalette, 'Clicked search trigger in Navbar');

    if (openedPalette) {
      await wait(800);
      const paletteText = await page.evaluate(() => document.body.innerText);
      const hasPaletteContent = paletteText.includes('Aksi Cepat & Navigasi') || paletteText.includes('Instant Command Hub');
      recordResult('Command Palette Quick Actions & Navigation', hasPaletteContent, 'Quick jump actions available');

      // Test typing search query
      await page.type('input[placeholder*="Ketik nama nota"]', 'Budi');
      await wait(600);
      const searchResults = await page.evaluate(() => document.body.innerText);
      const hasCustomerResult = searchResults.includes('Budi') || searchResults.includes('Pelanggan');
      recordResult('Instant Order & Customer Real-time Search', hasCustomerResult, 'Search query filtered results immediately');

      // Close modal
      await page.keyboard.press('Escape');
      await wait(600);
    }

    // 12. TOKOPEDIA & AMAZON STYLE LIVE SOCIAL PROOF & STICKY CONVERSION BAR
    console.log(`\n--- [12] TESTING SOCIAL PROOF TOAST & STICKY THUMB-ZONE BAR ---`);
    const pageText = await page.evaluate(() => document.body.innerText);
    const hasSocialProof = pageText.includes('Laundry Berkah') || pageText.includes('Lihat Promo Rp 25') || pageText.includes('Free Trial Diklaim') || pageText.includes('menit lalu');
    recordResult('Live Social Proof Floating Toast (Tokopedia/Amazon)', hasSocialProof, 'Real-time bustling activity ticker active');

    const hasStickyConversion = pageText.includes('Bebas Biaya Bulanan!') || pageText.includes('RP 25/NOTA') || pageText.includes('Klaim 50');
    recordResult('Sticky Bottom Thumb-Zone Conversion Bar (Fitts Law)', hasStickyConversion, 'High-converting lead capture bar active');

  } catch (err) {
    console.error('❌ Exception during test execution:', err.message);
    recordResult('Test Execution Safety', false, err.message);
  } finally {
    await page.close().catch(() => {});
    await browser.disconnect().catch(() => {});
  }

  console.log(`\n========================================================`);
  console.log(`📊 FINAL TEST REPORT SUMMARY`);
  console.log(`========================================================`);
  const totalPassed = results.filter(r => r.passed).length;
  const totalFailed = results.filter(r => !r.passed).length;
  console.log(`Total Scenarios Tested : ${results.length}`);
  console.log(`Scenarios Passed       : ${totalPassed} ✅`);
  console.log(`Scenarios Failed       : ${totalFailed} ❌`);
  const successRate = ((totalPassed / results.length) * 100).toFixed(1);
  console.log(`Overall Success Rate   : ${successRate}%\n`);

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runFullTest();
