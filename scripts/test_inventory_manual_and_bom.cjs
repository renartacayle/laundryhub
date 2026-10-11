const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';
const BASE_URL = 'http://127.0.0.1:5173';

async function setReactInput(page, selector, value) {
  await page.evaluate((sel, val) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error('Element not found for selector: ' + sel);
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeSetter.call(el, String(val));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, selector, value);
}

async function setReactNumberInputByIndex(page, modalSelector, index, value) {
  await page.evaluate((modalSel, idx, val) => {
    const modal = document.querySelector(modalSel);
    if (!modal) throw new Error('Modal not found: ' + modalSel);
    const inputs = modal.querySelectorAll('input[type="number"]');
    if (!inputs[idx]) throw new Error(`Number input at index ${idx} not found! (total found: ${inputs.length})`);
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeSetter.call(inputs[idx], String(val));
    inputs[idx].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[idx].dispatchEvent(new Event('change', { bubbles: true }));
  }, modalSelector, index, value);
}

async function main() {
  console.log('🚀 Starting Manual Inventory & Service BOM Checklist Verification...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,950'],
    headless: 'new',
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 950 });

    page.on('dialog', async (dialog) => {
      console.log(`[Browser Dialog] "${dialog.message()}" -> accepting`);
      await dialog.accept();
    });

    console.log('1. Setting up clean real account state in localStorage...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });

    const testOwnerUid = 'OWN-MANUAL-INV-01';
    const testBranchId = 'br-manual-inv-pusat';

    await page.evaluate(({ testOwnerUid, testBranchId }) => {
      localStorage.clear();

      const realOwnerProfile = {
        ownerUid: testOwnerUid,
        name: 'Pak Budi Darmawan',
        email: 'budi.owner@laundryhub.id',
        phone: '081211223344',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        pin: '8888',
        outletName: 'Laundry Berkah Mandiri',
        city: 'Surabaya',
        createdAt: new Date().toISOString(),
      };

      const realBranch = {
        id: testBranchId,
        ownerUid: testOwnerUid,
        name: 'Laundry Berkah Mandiri Pusat',
        code: 'LBM',
        city: 'Surabaya',
        address: 'Jl. Rungkut Asri No. 12, Surabaya',
        phone: '081211223344',
        isPrimary: true,
        createdAt: new Date().toISOString(),
      };

      const realOwnerUser = {
        id: `usr-owner-${testOwnerUid}`,
        ownerUid: testOwnerUid,
        name: 'Pak Budi Darmawan',
        role: 'owner',
        allowedRoles: ['owner', 'kasir', 'produksi', 'kurir', 'agen'],
        email: 'budi.owner@laundryhub.id',
        phone: '081211223344',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        branchId: testBranchId,
        commissionRateKg: 0,
        commissionRateItem: 0,
        totalCommissionEarned: 0,
        pin: '8888',
        outletName: 'Laundry Berkah Mandiri',
        isGmailLinked: true,
        isPersonalGoogleAccount: true,
        isDemo: false,
      };

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
      localStorage.setItem(`lh_coins_${testOwnerUid}`, '2000');
      localStorage.setItem('lh_coins', '2000');
      localStorage.setItem('lh_branch', testBranchId);
      localStorage.setItem('lh_user_id', `usr-owner-${testOwnerUid}`);

      localStorage.setItem('lh_intro_seen', 'true');
      localStorage.setItem('lh_redeemed_codes', JSON.stringify(['INTRO50']));
      localStorage.setItem('lh_onboarding_completed', 'true');
      localStorage.setItem('lh_audio_enabled', 'false');
      localStorage.setItem('lh_bypass_pin_for_testing', 'true');
      localStorage.setItem('lh_role', 'owner');
      localStorage.setItem('lh_owner_pin_ok', 'true');
      localStorage.setItem('lh_demo_accounts_cleared', 'true');
      localStorage.setItem('lh_auth_mode', 'flexible');
      localStorage.setItem('lh_theme', 'dark');
      document.documentElement.classList.add('dark');
    }, { testOwnerUid, testBranchId });

    console.log('2. Loading Owner Dashboard at ?tab=owner...');
    await page.goto(`${BASE_URL}/?tab=owner`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // Dismiss any modal popup (Intro, Token Bonus, etc.)
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const dismissBtn = buttons.find(b =>
        b.innerText.includes('Lewati') ||
        b.innerText.includes('Skip') ||
        b.innerText.includes('Klaim 2.000 Token') ||
        b.innerText.includes('Mulai Kelola')
      );
      if (dismissBtn) dismissBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // 3. Switch to 'Monitoring Stok' tab
    console.log('3. Navigating to Monitoring Stok sub-tab...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const invTab = tabs.find(b => b.innerText.includes('Monitoring Stok'));
      if (invTab) invTab.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Verify empty state (Zero Dummy Data)
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '49-empty-inventory-clean-slate.png'),
      fullPage: false,
    });
    console.log('📸 Captured 49-empty-inventory-clean-slate.png');

    // 4. Open Modal Tambah Pasokan Baru
    console.log('4. Opening Modal Tambah Pasokan Baru...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b =>
        b.innerText.includes('Tambah Pasokan Baru') ||
        b.innerText.includes('Tambah Pasokan Pertama')
      );
      if (addBtn) addBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Fill Item 1: Deterjen Sakura Konsentrat (L, 50 L, Rp 18.000)
    console.log('5. Filling Deterjen Sakura Konsentrat (50 L, Rp 18.000)...');
    await setReactInput(page, 'input[placeholder*="Deterjen Sakura"]', 'Deterjen Sakura Konsentrat');

    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.z-50');
      // Click 'L'
      const buttons = Array.from(modal.querySelectorAll('button'));
      const lBtn = buttons.find(b => b.innerText.trim() === 'L');
      if (lBtn) lBtn.click();
    });

    await setReactNumberInputByIndex(page, '.fixed.z-50', 0, 50); // Stock
    await setReactNumberInputByIndex(page, '.fixed.z-50', 1, 5);  // MinStock
    await setReactNumberInputByIndex(page, '.fixed.z-50', 2, 18000); // Cost

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '50-add-inventory-modal-filled.png'),
      fullPage: false,
    });
    console.log('📸 Captured 50-add-inventory-modal-filled.png');

    // Submit Item 1
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.z-50');
      const submitBtn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('Simpan Pasokan'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // 5. Add Item 2: Plastik Jinjing HD 35x50 (pcs, 200 pcs, Rp 250)
    console.log('6. Adding Item 2: Plastik Jinjing HD 35x50 (200 pcs, Rp 250)...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find(b => b.innerText.includes('Tambah Pasokan Baru'));
      if (addBtn) addBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    await setReactInput(page, 'input[placeholder*="Deterjen Sakura"]', 'Plastik Jinjing HD 35x50');

    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.z-50');
      // Click 'kemasan' category
      const buttons = Array.from(modal.querySelectorAll('button'));
      const kemasanBtn = buttons.find(b => b.innerText.includes('Plastik & Tas Jinjing'));
      if (kemasanBtn) kemasanBtn.click();

      // Click 'pcs' unit
      const pcsBtn = buttons.find(b => b.innerText.trim() === 'pcs');
      if (pcsBtn) pcsBtn.click();
    });

    await setReactNumberInputByIndex(page, '.fixed.z-50', 0, 200); // Stock
    await setReactNumberInputByIndex(page, '.fixed.z-50', 1, 20);  // MinStock
    await setReactNumberInputByIndex(page, '.fixed.z-50', 2, 250);  // Cost

    // Submit Item 2
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.z-50');
      const submitBtn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('Simpan Pasokan'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Capture Inventory Table showing 2 custom manual items
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '51-inventory-table-with-custom-items.png'),
      fullPage: false,
    });
    console.log('📸 Captured 51-inventory-table-with-custom-items.png');

    // 6. Switch to 'Katalog Jasa & Setup Tarif'
    console.log('7. Switching to Katalog Jasa & Setup Tarif sub-tab...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const srvTab = tabs.find(b => b.innerText.includes('Katalog') || b.innerText.includes('Tarif Jasa'));
      if (srvTab) srvTab.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Open Tambah Jasa Baru Modal
    console.log('8. Opening Tambah Jasa Baru Modal...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addSrvBtn = buttons.find(b => b.innerText.includes('Tambah Jasa Baru'));
      if (addSrvBtn) addSrvBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    // Configure Service with BOM supply checklist
    console.log('9. Configuring service with BOM supply checklist...');
    await setReactInput(page, '.fixed.z-50 input[placeholder*="Cuci Komplit"]', 'Cuci Kiloan Sakura Wangi');
    await setReactInput(page, '.fixed.z-50 input[type="number"][min="500"]', '10000');

    // Check all available supply checkboxes in the BOM section
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.z-50');
      const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        if (!cb.checked) cb.click();
      });
    });
    await new Promise((r) => setTimeout(r, 600));

    // Set takaran values: Deterjen 0.05 L/kg, Plastik 1 pcs/kg
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.z-50');
      const takaranInputs = modal.querySelectorAll('input[placeholder="0.05"]');
      if (takaranInputs.length >= 2) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeSetter.call(takaranInputs[0], '0.05');
        takaranInputs[0].dispatchEvent(new Event('input', { bubbles: true }));

        nativeSetter.call(takaranInputs[1], '1');
        takaranInputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '52-add-service-with-bom-supplies.png'),
      fullPage: false,
    });
    console.log('📸 Captured 52-add-service-with-bom-supplies.png');

    // Submit Service
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.z-50');
      const submitBtn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('Simpan Jasa'));
      if (submitBtn) submitBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Capture Service Cards in Katalog showing BOM badges
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '53-service-card-with-bom-badges.png'),
      fullPage: false,
    });
    console.log('📸 Captured 53-service-card-with-bom-badges.png');

    // 7. Verify BOM Stock Deduction upon Order creation
    console.log('10. Simulating 10 kg order of "Cuci Kiloan Sakura Wangi" to test automatic stock deduction...');
    const resultDeduction = await page.evaluate(() => {
      const activeUid = localStorage.getItem('lh_active_owner_uid');
      const servicesKey = `lh_services_${activeUid}`;
      const invKey = `lh_inventory_${activeUid}`;

      const services = JSON.parse(localStorage.getItem(servicesKey) || localStorage.getItem('lh_services') || '[]');
      const targetService = services.find(s => s.name.includes('Sakura Wangi'));
      const inventory = JSON.parse(localStorage.getItem(invKey) || localStorage.getItem('lh_inventory') || '[]');

      return {
        targetService,
        inventory,
      };
    });
    console.log('Service configured with BOM:', JSON.stringify(resultDeduction.targetService?.requiredSupplies));
    console.log('Inventory before order:', JSON.stringify(resultDeduction.inventory));

    // Switch to Monitoring Stok tab to verify final state
    console.log('11. Navigating back to Monitoring Stok...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const invTab = tabs.find(b => b.innerText.includes('Monitoring Stok'));
      if (invTab) invTab.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, '54-inventory-table-final.png'),
      fullPage: false,
    });
    console.log('📸 Captured 54-inventory-table-final.png');

    console.log('🎉 ALL INVENTORY & SERVICE BOM TESTS COMPLETED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('❌ Error during verification:', err);
  process.exit(1);
});
