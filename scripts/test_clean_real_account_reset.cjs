const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';
const BASE_URL = 'http://127.0.0.1:5173';

async function runTest() {
  console.log('=== LAUNDRYHUB: REAL ACCOUNT ZERO DUMMY & CLEAN RESET E2E TEST ===');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    headless: 'new',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Handle dialogs automatically (confirm window.confirm)
  page.on('dialog', async (dialog) => {
    console.log(`[Browser Dialog] "${dialog.message()}" -> accepting`);
    await dialog.accept();
  });

  page.on('console', (msg) => console.log('[BROWSER CONSOLE]', msg.text()));

  // 1. Setup real account in localStorage
  await page.goto(`${BASE_URL}/?nointro=true`, { waitUntil: 'networkidle2' });

  const testOwnerUid = 'OWN-HENDRA-9988';
  const testBranchId = 'br-hendra-utama';

  await page.evaluate(({ testOwnerUid, testBranchId }) => {
    localStorage.clear();

    const realOwnerProfile = {
      ownerUid: testOwnerUid,
      name: 'Hendra Wijaya',
      email: 'hendra.owner@laundryhub.id',
      phone: '081298765432',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      pin: '7788',
      outletName: 'Laundry Berkah Hendra',
      city: 'Jakarta Selatan',
      createdAt: new Date().toISOString(),
    };

    const realBranch = {
      id: testBranchId,
      ownerUid: testOwnerUid,
      name: 'Laundry Berkah Hendra (Pusat)',
      code: 'LBH',
      city: 'Jakarta Selatan',
      address: 'Jl. Fatmawati Raya No. 45, Cilandak, Jakarta Selatan',
      phone: '081298765432',
      isPrimary: true,
      createdAt: new Date().toISOString(),
    };

    const realOwnerUser = {
      id: `usr-owner-${testOwnerUid}`,
      ownerUid: testOwnerUid,
      name: 'Hendra Wijaya',
      role: 'owner',
      allowedRoles: ['owner', 'kasir', 'produksi', 'kurir', 'agen'],
      email: 'hendra.owner@laundryhub.id',
      phone: '081298765432',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      branchId: testBranchId,
      commissionRateKg: 0,
      commissionRateItem: 0,
      totalCommissionEarned: 0,
      pin: '7788',
      outletName: 'Laundry Berkah Hendra',
      isGmailLinked: true,
      isPersonalGoogleAccount: true,
      isDemo: false,
    };

    // Store in localStorage
    localStorage.setItem('lh_active_owner_uid', testOwnerUid);
    localStorage.setItem('lh_owners_registry', JSON.stringify([realOwnerProfile]));
    localStorage.setItem(`lh_branches_${testOwnerUid}`, JSON.stringify([realBranch]));
    localStorage.setItem(`lh_users_${testOwnerUid}`, JSON.stringify([realOwnerUser]));
    localStorage.setItem(`lh_orders_${testOwnerUid}`, JSON.stringify([]));
    localStorage.setItem(`lh_customers_${testOwnerUid}`, JSON.stringify([]));
    localStorage.setItem(`lh_machines_${testOwnerUid}`, JSON.stringify([]));
    localStorage.setItem(`lh_inventory_${testOwnerUid}`, JSON.stringify([]));
    localStorage.setItem(`lh_services_${testOwnerUid}`, JSON.stringify([]));
    localStorage.setItem(`lh_notifs_${testOwnerUid}`, JSON.stringify([]));
    localStorage.setItem(`lh_coins_${testOwnerUid}`, '50');
    localStorage.setItem('lh_coins', '50');
    localStorage.setItem('lh_branch', testBranchId);
    localStorage.setItem('lh_user_id', `usr-owner-${testOwnerUid}`);

    // App state flags
    localStorage.setItem('lh_intro_seen', 'true');
    localStorage.setItem('lh_redeemed_codes', JSON.stringify(['INTRO50']));
    localStorage.setItem('lh_onboarding_completed', 'true');
    localStorage.setItem('lh_audio_enabled', 'false');
    localStorage.setItem('lh_bypass_pin_for_testing', 'true');
    localStorage.setItem('lh_role', 'owner');
    localStorage.setItem('lh_owner_pin_ok', 'true');
    localStorage.setItem('lh_demo_accounts_cleared', 'true');
    localStorage.setItem('lh_auth_mode', 'flexible');
  }, { testOwnerUid, testBranchId });

  // 2. Navigate to Owner Dashboard as real owner
  console.log('--- Step 2: Navigate to Owner Dashboard for Real Account ---');
  await page.goto(`${BASE_URL}/?nointro=true&tab=owner`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1500));

  // Dismiss any modal/dialog if open
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const skipBtn = buttons.find((b) => b.textContent?.includes('Lewati') || b.textContent?.includes('Skip'));
    if (skipBtn) skipBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));

  // 3. Audit Clean Slate (Zero Dummy Data)
  console.log('--- Step 3: Verifying Zero Dummy Data Across State & UI ---');
  const auditResult = await page.evaluate(({ testOwnerUid }) => {
    const activeUid = localStorage.getItem('lh_active_owner_uid');
    const storedOrders = JSON.parse(localStorage.getItem(`lh_orders_${testOwnerUid}`) || '[]');
    const storedMachines = JSON.parse(localStorage.getItem(`lh_machines_${testOwnerUid}`) || '[]');
    const storedInventory = JSON.parse(localStorage.getItem(`lh_inventory_${testOwnerUid}`) || '[]');
    const storedUsers = JSON.parse(localStorage.getItem(`lh_users_${testOwnerUid}`) || '[]');
    const storedCoins = Number(localStorage.getItem(`lh_coins_${testOwnerUid}`) || '0');

    // Check UI elements text
    const bodyText = document.body.innerText;
    const hasDesemberEst = bodyText.includes('Desember (Est)') && bodyText.includes('Rp 69.200.000');
    const has152Milyar = bodyText.includes('Rp 1.52 Milyar');
    const has116kKg = bodyText.includes('116.490 kg');
    const hasKemangBintaroTebet = bodyText.includes('Kemang, Bintaro Sektor 7, & Tebet');

    const allKeys = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      allKeys[k] = localStorage.getItem(k);
    }
    console.log('ALL LOCALSTORAGE KEYS:', JSON.stringify(allKeys, null, 2));

    return {
      activeUid,
      ordersCount: storedOrders.length,
      machinesCount: storedMachines.length,
      inventoryCount: storedInventory.length,
      usersCount: storedUsers.length,
      coins: storedCoins,
      hasDesemberEst,
      has152Milyar,
      has116kKg,
      hasKemangBintaroTebet,
    };
  }, { testOwnerUid });

  console.log('Initial Clean Slate Audit Result:', auditResult);

  if (auditResult.ordersCount !== 0) throw new Error(`Orders expected 0, got ${auditResult.ordersCount}`);
  if (auditResult.machinesCount !== 0) throw new Error(`Machines expected 0, got ${auditResult.machinesCount}`);
  if (auditResult.inventoryCount !== 0) throw new Error(`Inventory expected 0, got ${auditResult.inventoryCount}`);
  if (auditResult.usersCount !== 1) throw new Error(`Users expected 1 (owner only), got ${auditResult.usersCount}`);
  if (auditResult.coins !== 50) throw new Error(`Coins expected 50, got ${auditResult.coins}`);
  if (auditResult.hasDesemberEst) throw new Error('Dummy metric Desember (Est) leaked into real account!');
  if (auditResult.has152Milyar) throw new Error('Dummy metric Rp 1.52 Milyar leaked into real account!');

  // Take screenshot 39
  const sc1 = path.join(ARTIFACT_DIR, '39-clean-real-account-overview.png');
  await page.screenshot({ path: sc1, fullPage: true });
  console.log('Saved screenshot:', sc1);

  // Switch to Stats tab
  console.log('--- Step 4: Check Stats Tab (Monthly & Yearly) for Zero Dummy ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const statsBtn = btns.find((b) => b.textContent?.includes('Statistik') || b.textContent?.includes('Laporan & Statistik'));
    if (statsBtn) statsBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Toggle to yearly view in Stats
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const yearlyBtn = btns.find((b) => b.textContent?.includes('Komparasi Tahunan') || b.textContent?.includes('Yearly'));
    if (yearlyBtn) yearlyBtn.click();
  });
  await new Promise((r) => setTimeout(r, 1000));

  const statsAudit = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    return {
      hasBelumAdaTransaksi: bodyText.includes('Belum Ada Transaksi') || bodyText.includes('0% / thn'),
      has152Milyar: bodyText.includes('Rp 1.52 Milyar'),
      has116kKg: bodyText.includes('116.490 kg'),
      hasOutletName: bodyText.includes('Laundry Berkah Hendra'),
    };
  });
  console.log('Stats Tab Audit:', statsAudit);
  if (statsAudit.has152Milyar) throw new Error('Dummy 1.52 Milyar found in Yearly stats for real account!');
  if (statsAudit.has116kKg) throw new Error('Dummy 116.490 kg found in Yearly stats for real account!');

  // Take screenshot 40
  const sc2 = path.join(ARTIFACT_DIR, '40-clean-real-account-stats.png');
  await page.screenshot({ path: sc2, fullPage: true });
  console.log('Saved screenshot:', sc2);

  // Step 5: Switch back to Overview and inject a test transaction
  console.log('--- Step 5: Simulating a new order/transaction on real account ---');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const ovBtn = btns.find((b) => b.textContent?.includes('Ringkasan Eksekutif'));
    if (ovBtn) ovBtn.click();
  });
  await new Promise((r) => setTimeout(r, 800));

  await page.evaluate(({ testOwnerUid, testBranchId }) => {
    const testOrder = {
      id: 'ord-test-real-001',
      invoiceNo: 'INV/2026/001',
      branchId: testBranchId,
      customerId: 'cust-test-1',
      customerName: 'Budi Santoso',
      customerPhone: '081211112222',
      items: [{ serviceId: 'srv-1', serviceName: 'Cuci Komplit', quantity: 3, price: 10000 }],
      currentStatus: 'diproses',
      statusHistory: [{ status: 'diproses', timestamp: new Date().toISOString() }],
      totalPrice: 30000,
      discount: 0,
      finalPrice: 30000,
      paymentStatus: 'lunas',
      paymentMethod: 'qris',
      weightKg: 3.5,
      perfume: 'Lavender',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDropship: false,
      isExpress: false,
    };

    const currentOrders = JSON.parse(localStorage.getItem(`lh_orders_${testOwnerUid}`) || '[]');
    currentOrders.push(testOrder);
    localStorage.setItem(`lh_orders_${testOwnerUid}`, JSON.stringify(currentOrders));

    // Also inject a machine to test machine reset
    const testMachine = {
      id: 'm-test-1',
      name: 'Mesin Cuci Test #1',
      type: 'washer',
      branchId: testBranchId,
      status: 'idle',
      totalCycles: 5,
    };
    localStorage.setItem(`lh_machines_${testOwnerUid}`, JSON.stringify([testMachine]));
  }, { testOwnerUid, testBranchId });

  // Reload to reflect newly inserted test order
  await page.goto(`${BASE_URL}/?nointro=true&tab=owner`, { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 1200));

  const countBeforeReset = await page.evaluate(({ testOwnerUid }) => {
    const orders = JSON.parse(localStorage.getItem(`lh_orders_${testOwnerUid}`) || '[]');
    const machines = JSON.parse(localStorage.getItem(`lh_machines_${testOwnerUid}`) || '[]');
    return { orders: orders.length, machines: machines.length };
  }, { testOwnerUid });
  console.log('Data count before reset:', countBeforeReset);
  if (countBeforeReset.orders !== 1) throw new Error('Expected 1 test order before reset');

  // Step 6: Trigger Smart Reset via UI Button
  console.log('--- Step 6: Clicking Reset Data Button on Owner Dashboard ---');
  const resetBtnExists = await page.evaluate(() => {
    const btn = document.getElementById('btn-owner-reset-data');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Reset button clicked:', resetBtnExists);
  if (!resetBtnExists) throw new Error('Could not find #btn-owner-reset-data button!');

  await new Promise((r) => setTimeout(r, 1500));

  // Step 7: Verify post-reset clean slate
  console.log('--- Step 7: Verifying Post-Reset State is 100% Clean Slate ---');
  const postResetAudit = await page.evaluate(({ testOwnerUid, testBranchId }) => {
    const orders = JSON.parse(localStorage.getItem(`lh_orders_${testOwnerUid}`) || '[]');
    const machines = JSON.parse(localStorage.getItem(`lh_machines_${testOwnerUid}`) || '[]');
    const inventory = JSON.parse(localStorage.getItem(`lh_inventory_${testOwnerUid}`) || '[]');
    const users = JSON.parse(localStorage.getItem(`lh_users_${testOwnerUid}`) || '[]');
    const branches = JSON.parse(localStorage.getItem(`lh_branches_${testOwnerUid}`) || '[]');
    const coins = Number(localStorage.getItem(`lh_coins_${testOwnerUid}`) || '0');
    const activeUid = localStorage.getItem('lh_active_owner_uid');

    // Confirm no demo data was injected!
    const hasDemoOrder = orders.some((o) => o.id === 'ord-kmg-001' || o.id === 'ord-btr-001');
    const hasDemoStaff = users.some((u) => u.id === 'usr-kasir-kmg' || u.id === 'usr-prod-cuci');

    return {
      activeUid,
      ordersCount: orders.length,
      machinesCount: machines.length,
      inventoryCount: inventory.length,
      usersCount: users.length,
      branchesCount: branches.length,
      coins,
      hasDemoOrder,
      hasDemoStaff,
      ownerStillPresent: users.some((u) => u.id === `usr-owner-${testOwnerUid}`),
      branchStillPresent: branches.some((b) => b.id === testBranchId),
    };
  }, { testOwnerUid, testBranchId });

  console.log('Post-Reset Audit Result:', postResetAudit);

  if (postResetAudit.ordersCount !== 0) {
    throw new Error(`Reset failed: orders expected 0, got ${postResetAudit.ordersCount}`);
  }
  if (postResetAudit.machinesCount !== 0) {
    throw new Error(`Reset failed: machines expected 0, got ${postResetAudit.machinesCount}`);
  }
  if (postResetAudit.inventoryCount !== 0) {
    throw new Error(`Reset failed: inventory expected 0, got ${postResetAudit.inventoryCount}`);
  }
  if (postResetAudit.usersCount !== 1) {
    throw new Error(`Reset failed: users expected 1 (owner preserved), got ${postResetAudit.usersCount}`);
  }
  if (postResetAudit.branchesCount !== 1) {
    throw new Error(`Reset failed: branches expected 1 (primary branch preserved), got ${postResetAudit.branchesCount}`);
  }
  if (!postResetAudit.ownerStillPresent) {
    throw new Error('Reset failed: owner profile was accidentally deleted!');
  }
  if (!postResetAudit.branchStillPresent) {
    throw new Error('Reset failed: primary branch was accidentally deleted!');
  }
  if (postResetAudit.hasDemoOrder || postResetAudit.hasDemoStaff) {
    throw new Error('CRITICAL BUG: Demo data was injected during reset of real account!');
  }

  // Take screenshot 41
  const sc3 = path.join(ARTIFACT_DIR, '41-real-account-post-reset-clean-slate.png');
  await page.screenshot({ path: sc3, fullPage: true });
  console.log('Saved screenshot:', sc3);

  console.log('================================================================');
  console.log('ALL VERIFICATIONS PASSED 100%! ZERO DUMMY DATA & CLEAN RESET VALIDATED.');
  console.log('================================================================');

  await browser.close();
}

runTest().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
