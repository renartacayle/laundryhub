const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACT_DIR = '/home/rena/.gemini/antigravity/brain/0bd9cbcf-f77c-490f-8c26-10ec2d4f9d0f';
const BASE_URL = 'http://127.0.0.1:5173';

async function main() {
  console.log('🚀 Starting Dropship Clean Slate & Partner Management Verification...');
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

    console.log('1. Setting up clean account state in localStorage...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });

    const testOwnerUid = 'OWN-REAL-DROPSHIP-01';
    const testBranchId = 'br-clean-dropship';

    await page.evaluate(({ testOwnerUid, testBranchId }) => {
      localStorage.clear();

      const realOwnerProfile = {
        ownerUid: testOwnerUid,
        name: 'Hj. Anisa Rahma',
        email: 'anisa.owner@laundryhub.id',
        businessName: 'Anisa Laundry Express',
        phone: '0812-7788-9900',
        plan: 'Scale & Branch',
        branchesCount: 1,
        tokensBalance: 2000,
        createdAt: '2026-10-12T00:00:00Z',
      };

      const realBranch = {
        id: testBranchId,
        ownerUid: testOwnerUid,
        name: 'Anisa Laundry Pusat',
        address: 'Jl. Margonda Raya No. 88, Depok',
        phone: '0812-7788-9900',
        code: 'DEP',
        isPusat: true,
        createdAt: new Date().toISOString(),
      };

      const realOwnerUser = {
        id: 'usr-anisa-owner',
        ownerUid: testOwnerUid,
        name: 'Hj. Anisa Rahma',
        role: 'owner',
        allowedRoles: ['owner', 'kasir', 'produksi', 'kurir', 'agen'],
        email: 'anisa.owner@laundryhub.id',
        phone: '0812-7788-9900',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        branchId: testBranchId,
        commissionRateKg: 0,
        commissionRateItem: 0,
        totalCommissionEarned: 0,
        pin: '8888',
        outletName: 'Anisa Laundry Pusat',
        isGmailLinked: true,
        isPersonalGoogleAccount: true,
        isDemo: false,
      };

      localStorage.setItem('lh_active_owner_uid', testOwnerUid);
      localStorage.setItem(`lh_owner_profile_${testOwnerUid}`, JSON.stringify(realOwnerProfile));
      localStorage.setItem('lh_users', JSON.stringify([realOwnerUser]));
      localStorage.setItem(`lh_users_${testOwnerUid}`, JSON.stringify([realOwnerUser]));
      localStorage.setItem('lh_user_id', realOwnerUser.id);
      localStorage.setItem('lh_role', 'owner');
      localStorage.setItem('lh_branch', testBranchId);
      localStorage.setItem('lh_branches', JSON.stringify([realBranch]));
      localStorage.setItem(`lh_branches_${testOwnerUid}`, JSON.stringify([realBranch]));
      localStorage.setItem('lh_coins', '2000');
      localStorage.setItem(`lh_coins_${testOwnerUid}`, '2000');
      localStorage.setItem('lh_demo_accounts_cleared', 'true');
      localStorage.setItem('lh_auth_mode', 'commercial');

      // Explicitly empty dropship arrays for real account
      localStorage.setItem('lh_dropship_agents', JSON.stringify([]));
      localStorage.setItem(`lh_dropship_agents_${testOwnerUid}`, JSON.stringify([]));
      localStorage.setItem('lh_dropship_orders', JSON.stringify([]));
      localStorage.setItem(`lh_dropship_orders_${testOwnerUid}`, JSON.stringify([]));
      localStorage.setItem('lh_withdrawals', JSON.stringify([]));
      localStorage.setItem(`lh_withdrawals_${testOwnerUid}`, JSON.stringify([]));
      localStorage.setItem('lh_orders', JSON.stringify([]));
      localStorage.setItem(`lh_orders_${testOwnerUid}`, JSON.stringify([]));
    }, { testOwnerUid, testBranchId });

    console.log('2. Reloading page and navigating to Owner Dashboard...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // Navigate to dropship tab
    console.log('3. Clicking tab Dropship in Owner Dashboard...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const dropshipTab = buttons.find((b) => b.textContent && b.textContent.includes('Kemitraan Dropship'));
      if (dropshipTab) dropshipTab.click();
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Verify clean slate state
    const cleanVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasEmptyStateHeading: text.includes('Belum Ada Mitra Agen Dropship Terdaftar'),
        hasEmptyWithdrawalRow: text.includes('Tidak ada antrean pengajuan pencairan komisi mitra saat ini.'),
        has0Locations: text.includes('0 Lokasi'),
        hasRegisterFirstButton: text.includes('Daftarkan Mitra Pertama'),
      };
    });

    console.log('Clean Slate Verification Results:', cleanVerification);
    if (!cleanVerification.hasEmptyStateHeading || !cleanVerification.hasEmptyWithdrawalRow || !cleanVerification.has0Locations) {
      throw new Error('Clean slate verification failed! Unexpected dropship data found.');
    }

    const cleanSlateScreenshot = path.join(ARTIFACT_DIR, '55-dropship-clean-slate.png');
    await page.screenshot({ path: cleanSlateScreenshot });
    console.log(`📸 Saved clean slate screenshot: ${cleanSlateScreenshot}`);

    // Test Adding New Partner manually
    console.log('4. Testing manual partner registration modal...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const addBtn = buttons.find((b) => b.textContent && (b.textContent.includes('Daftarkan Mitra Pertama') || b.textContent.includes('Daftarkan Mitra Baru')));
      if (addBtn) addBtn.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // Fill the registration modal inputs using native descriptor
    await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find((h) => h.textContent && h.textContent.includes('Daftarkan Mitra Agen'));
      if (!h3) throw new Error('Add Agent Modal heading not found!');
      const modal = h3.closest('.fixed');
      if (!modal) throw new Error('Add Agent Modal container not found!');
      const inputs = modal.querySelectorAll('input');
      const textareas = modal.querySelectorAll('textarea');

      const setVal = (el, val) => {
        if (!el) return;
        const proto = el instanceof HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        nativeSetter.call(el, String(val));
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };

      // 0: Nama Toko/Agen
      setVal(inputs[0], 'Drop Point Warung Mbak Dian');
      // 1: Nama Pemilik / PIC
      setVal(inputs[1], 'Dian Permatasari');
      // 2: WhatsApp / HP
      setVal(inputs[2], '0812-3344-5566');
      // 3: Persentase Komisi (%)
      setVal(inputs[3], '25');
      // Textarea: Alamat Lengkap Titik Drop Point
      setVal(textareas[0], 'Jl. Fatmawati Raya No. 42, Cilandak, Jakarta Selatan');
      // 4: Nomor Rekening
      setVal(inputs[4], '8820192831');
      // 5: Atas Nama Rekening
      setVal(inputs[5], 'Dian Permatasari');
    });
    await new Promise((r) => setTimeout(r, 600));

    // Submit registration modal
    console.log('Submitting registration form via form.requestSubmit()...');
    await page.evaluate(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find((h) => h.textContent && h.textContent.includes('Daftarkan Mitra Agen'));
      const modal = h3.closest('.fixed');
      const form = modal.querySelector('form');
      form.requestSubmit();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Verify agent card is now present
    const partnerAddedVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasDianAgent: text.includes('Drop Point Warung Mbak Dian'),
        hasPIC: text.includes('Dian Permatasari'),
        has1Location: text.includes('1 Lokasi'),
        hasDeleteButton: !!document.querySelector('button[title="Hapus Mitra Dropship"]'),
      };
    });

    console.log('Partner Added Verification:', partnerAddedVerification);
    if (!partnerAddedVerification.hasDianAgent || !partnerAddedVerification.hasDeleteButton) {
      throw new Error('Partner addition failed or delete button missing!');
    }

    const partnerAddedScreenshot = path.join(ARTIFACT_DIR, '56-dropship-partner-added.png');
    await page.screenshot({ path: partnerAddedScreenshot });
    console.log(`📸 Saved partner added screenshot: ${partnerAddedScreenshot}`);

    // Test Deleting Partner
    console.log('5. Testing Hapus Mitra Dropship button...');
    await page.evaluate(() => {
      const delBtn = document.querySelector('button[title="Hapus Mitra Dropship"]');
      if (delBtn) delBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Verify agent is deleted and empty state returns
    const partnerDeletedVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        isDianGone: !text.includes('Drop Point Warung Mbak Dian'),
        hasEmptyStateAgain: text.includes('Belum Ada Mitra Agen Dropship Terdaftar'),
        has0LocationsAgain: text.includes('0 Lokasi'),
      };
    });

    console.log('Partner Deleted Verification:', partnerDeletedVerification);
    if (!partnerDeletedVerification.isDianGone || !partnerDeletedVerification.hasEmptyStateAgain) {
      throw new Error('Partner deletion failed!');
    }

    const partnerDeletedScreenshot = path.join(ARTIFACT_DIR, '57-dropship-partner-deleted.png');
    await page.screenshot({ path: partnerDeletedScreenshot });
    console.log(`📸 Saved partner deleted screenshot: ${partnerDeletedScreenshot}`);

    // Check Dropship B2B tab
    console.log('6. Checking Tab Pasokan Dropship B2B...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const b2bTab = buttons.find((b) => b.textContent && b.textContent.includes('Pasokan Dropship B2B'));
      if (b2bTab) b2bTab.click();
    });
    await new Promise((r) => setTimeout(r, 1200));

    const b2bVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        has0ActiveShipments: text.includes('0 Resi Berjalan'),
        hasEmptyHistoryMessage: text.includes('Belum ada riwayat pesanan kargo pasokan pabrik'),
      };
    });

    console.log('B2B Dropship Verification:', b2bVerification);
    if (!b2bVerification.has0ActiveShipments || !b2bVerification.hasEmptyHistoryMessage) {
      throw new Error('B2B dropship verification failed! Unexpected supply order data found.');
    }

    const b2bScreenshot = path.join(ARTIFACT_DIR, '58-dropship-b2b-clean-slate.png');
    await page.screenshot({ path: b2bScreenshot });
    console.log(`📸 Saved B2B clean slate screenshot: ${b2bScreenshot}`);

    console.log('🎉 ALL DROPSHIP CLEAN SLATE AND MANAGEMENT VERIFICATIONS PASSED 100%!');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
