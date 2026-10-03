/**
 * Internationalization (i18n) Engine for LAUNDRYHUB
 * Supports Indonesian (ID) and Global English (EN)
 */

export type Language = 'id' | 'en';

export interface Translations {
  common: {
    save: string;
    cancel: string;
    close: string;
    delete: string;
    edit: string;
    success: string;
    error: string;
    loading: string;
    copy: string;
    copied: string;
    search: string;
    searchPlaceholder: string;
    filter: string;
    back: string;
    next: string;
    all: string;
    status: string;
    action: string;
    active: string;
    inactive: string;
    verified: string;
  };
  nav: {
    subtitle: string;
    roleKasir: string;
    roleOwner: string;
    roleProduksi: string;
    roleKurir: string;
    rolePelanggan: string;
    roleAgen: string;
    coins: string;
    tokenNotice: string;
    modeDemo: string;
    modeCommercial: string;
    switchRole: string;
    language: string;
    currency: string;
  };
  pos: {
    title: string;
    catalogTitle: string;
    cartTitle: string;
    selectCustomer: string;
    searchCustomer: string;
    addNewCustomer: string;
    allCategories: string;
    kiloan: string;
    satuan: string;
    perfumeSelect: string;
    notesPlaceholder: string;
    serviceType: string;
    regularService: string;
    expressService: string;
    pickupType: string;
    selfOutlet: string;
    deliveryHome: string;
    paymentMethod: string;
    methodCash: string;
    methodTransfer: string;
    methodQris: string;
    methodDeposit: string;
    methodPayLater: string;
    methodCardIntl: string;
    cashGiven: string;
    change: string;
    totalBill: string;
    discount: string;
    grandTotal: string;
    btnCheckout: string;
    cartEmpty: string;
    cartEmptyDesc: string;
    warningZeroCoins: string;
    underpaymentWarning: string;
    depositInsufficient: string;
    orderSuccess: string;
  };
  portal: {
    title: string;
    badge: string;
    tabTrack: string;
    tabWallet: string;
    tabHistory: string;
    tabPickup: string;
    activeOrderTitle: string;
    invoiceNo: string;
    estFinish: string;
    pickupToken: string;
    trackSteps: {
      antrean: string;
      cuci: string;
      kering: string;
      setrika: string;
      packing: string;
      siap: string;
      selesai: string;
    };
    walletTitle: string;
    walletDesc: string;
    pointsTitle: string;
    requestPickupTitle: string;
    touristHeader: string;
    touristDesc: string;
    hotelRoomLabel: string;
    hotelRoomPlaceholder: string;
    specialCareLabel: string;
    submitPickupBtn: string;
  };
  tokens: {
    topupTitle: string;
    topupSubtitle: string;
    currentBalance: string;
    coinsUnit: string;
    choosePackage: string;
    perNote: string;
    popular: string;
    voucherSectionTitle: string;
    voucherPlaceholder: string;
    claimBtn: string;
    sampleCodes: string;
    ownerCreateBtn: string;
    ownerCreateTitle: string;
    codeNamePlaceholder: string;
    coinAmountPlaceholder: string;
    saveCodeBtn: string;
    payQrisBtn: string;
    payCardBtn: string;
    crossBorderNotice: string;
  };
  cardModal: {
    title: string;
    subtitle: string;
    cardNumber: string;
    cardExpiry: string;
    cardCvc: string;
    cardholderName: string;
    billingCountry: string;
    payNow: string;
    processing: string;
    securityBadge: string;
    demoNotice: string;
  };
  receipt: {
    title: string;
    invoice: string;
    date: string;
    customer: string;
    paymentStatus: string;
    paid: string;
    unpaid: string;
    paymentMethod: string;
    thermalPrint58: string;
    thermalPrint80: string;
    printBluetooth: string;
    shareWhatsApp: string;
    thankYou: string;
  };
}

export const translations: Record<Language, Translations> = {
  id: {
    common: {
      save: 'Simpan',
      cancel: 'Batal',
      close: 'Tutup',
      delete: 'Hapus',
      edit: 'Ubah',
      success: 'Berhasil',
      error: 'Terjadi Kesalahan',
      loading: 'Memuat...',
      copy: 'Salin',
      copied: 'Tersalin',
      search: 'Cari',
      searchPlaceholder: 'Ketik untuk mencari...',
      filter: 'Filter',
      back: 'Kembali',
      next: 'Lanjut',
      all: 'Semua',
      status: 'Status',
      action: 'Aksi',
      active: 'Aktif',
      inactive: 'Nonaktif',
      verified: 'Terverifikasi',
    },
    nav: {
      subtitle: 'Ekosistem Laundry Modern & Multi-Role',
      roleKasir: 'Kasir POS',
      roleOwner: 'Owner / Bos',
      roleProduksi: 'Produksi',
      roleKurir: 'Kurir Pickup',
      rolePelanggan: 'Pelanggan',
      roleAgen: 'Agen Dropship',
      coins: 'Koin Nota',
      tokenNotice: 'Saldo Token Nota',
      modeDemo: 'Mode Demo',
      modeCommercial: 'Mode Komersial',
      switchRole: 'Ganti Peran',
      language: 'Bahasa',
      currency: 'Mata Uang',
    },
    pos: {
      title: 'Point of Sale (POS)',
      catalogTitle: 'Daftar Layanan Laundry',
      cartTitle: 'Keranjang Transaksi',
      selectCustomer: 'Pilih Pelanggan',
      searchCustomer: 'Cari nama / no. HP pelanggan...',
      addNewCustomer: '+ Pelanggan Baru',
      allCategories: 'Semua Layanan',
      kiloan: 'Cuci Kiloan',
      satuan: 'Cuci Satuan & Dry Clean',
      perfumeSelect: 'Pilihan Parfum Cucian',
      notesPlaceholder: 'Catatan pakaian khusus (misal: pakaian luntur, jangan disikat kencang)...',
      serviceType: 'Kecepatan Layanan',
      regularService: 'Reguler (2-3 Hari)',
      expressService: 'Kilat Express (24 Jam)',
      pickupType: 'Tipe Penyerahan',
      selfOutlet: 'Ambil di Outlet',
      deliveryHome: 'Antar ke Alamat (Delivery)',
      paymentMethod: 'Metode Pembayaran',
      methodCash: 'Tunai (Cash)',
      methodTransfer: 'Transfer Bank',
      methodQris: 'QRIS (SpeedCash / E-Wallet)',
      methodDeposit: 'Potong Saldo Deposit',
      methodPayLater: 'Bayar Nanti (Piutang)',
      methodCardIntl: 'Kartu Debit/Kredit Luar Negeri (Visa / Mastercard)',
      cashGiven: 'Uang Diterima',
      change: 'Uang Kembalian',
      totalBill: 'Total Tagihan',
      discount: 'Diskon / Potongan',
      grandTotal: 'Total Akhir',
      btnCheckout: 'Bayar & Cetak Nota',
      cartEmpty: 'Keranjang Kosong',
      cartEmptyDesc: 'Pilih layanan kiloan atau satuan di sebelah kiri untuk memulai transaksi.',
      warningZeroCoins: 'PERINGATAN KUOTA TOKEN NOTA HABIS (0 Koin):\n\nSistem membutuhkan 1 Token Koin per transaksi nota (Rp 25 - Rp 50 / nota).\nSilakan Top Up Token via QRIS di dashboard Owner.',
      underpaymentWarning: 'Nominal tunai yang diserahkan kurang dari total tagihan!',
      depositInsufficient: 'Saldo deposit pelanggan tidak mencukupi untuk pembayaran ini!',
      orderSuccess: 'Transaksi berhasil disimpan dan nota diterbitkan!',
    },
    portal: {
      title: 'Portal Mandiri Pelanggan',
      badge: 'Lacak Cucian & Request Pickup',
      tabTrack: 'Lacak Cucian',
      tabWallet: 'Saldo & Poin',
      tabHistory: 'Riwayat Cuci',
      tabPickup: 'Minta Antar-Jemput',
      activeOrderTitle: 'Pesanan Cucian Berjalan',
      invoiceNo: 'Nomor Nota',
      estFinish: 'Estimasi Siap Ambil',
      pickupToken: 'Kode Token Pengambilan',
      trackSteps: {
        antrean: 'Diterima Kasir',
        cuci: 'Proses Cuci',
        kering: 'Proses Pengering',
        setrika: 'Setrika Uap Halus',
        packing: 'Quality Check & Packing',
        siap: 'Siap Diambil / Diantar',
        selesai: 'Selesai & Diterima',
      },
      walletTitle: 'Saldo Dompet Deposit',
      walletDesc: 'Bayar laundry praktis tanpa uang tunai',
      pointsTitle: 'Poin Loyalitas Member',
      requestPickupTitle: 'Request Penjemputan Laundry',
      touristHeader: 'Layanan Antar-Jemput Hotel & Villa',
      touristDesc: 'Kurir kami siap menjemput pakaian ke hotel, apartemen, atau villa Anda.',
      hotelRoomLabel: 'Nama Hotel / Nomor Kamar',
      hotelRoomPlaceholder: 'Contoh: Hotel Tentrem No. 412 / Villa Pandanaran',
      specialCareLabel: 'Instruksi Pakaian Khusus',
      submitPickupBtn: 'Kirim Permintaan Pickup Sekarang',
    },
    tokens: {
      topupTitle: 'Top Up Kuota Koin Token Nota',
      topupSubtitle: '1 Transaksi Nota = 1 Koin Terpotong (Mulai Rp 25 / nota)',
      currentBalance: 'Saldo Token Saat Ini',
      coinsUnit: 'Koin',
      choosePackage: 'Pilih Paket Token Hemat:',
      perNote: 'per nota',
      popular: 'Paling Laris',
      voucherSectionTitle: 'Punya Kode Voucher Token Gratis?',
      voucherPlaceholder: 'Ketik kode (misal: RENA50 / COBAGRATIS)',
      claimBtn: 'Klaim',
      sampleCodes: 'Contoh kode aktif:',
      ownerCreateBtn: '+ Buat Kode (Owner)',
      ownerCreateTitle: 'Generator Kode Baru (Khusus Owner)',
      codeNamePlaceholder: 'Nama Kode (e.g. MITRA2026)',
      coinAmountPlaceholder: 'Jumlah Koin (e.g. 50)',
      saveCodeBtn: 'Simpan & Rilis Kode Voucher Ini',
      payQrisBtn: 'Bayar via QRIS SpeedCash (Indonesia / ASEAN)',
      payCardBtn: 'Bayar via Kartu Kredit / Debit Internasional (Visa / MC)',
      crossBorderNotice: 'Mendukung QRIS Nasional & Cross-Border (Singapura NETS, Malaysia DuitNow, Thailand PromptPay).',
    },
    cardModal: {
      title: 'Pembayaran Kartu Internasional',
      subtitle: 'Mendukung Visa, Mastercard, JCB, American Express & PayPal',
      cardNumber: 'Nomor Kartu Kredit / Debit',
      cardExpiry: 'Kadaluwarsa (MM/YY)',
      cardCvc: 'Kode CVC / CVV',
      cardholderName: 'Nama Pemilik Kartu',
      billingCountry: 'Negara Asal / Billing Country',
      payNow: 'Bayar Sekarang',
      processing: 'Memverifikasi Pembayaran Kartu...',
      securityBadge: 'Terenkripsi 256-bit SSL & PCI-DSS Compliant',
      demoNotice: 'Gateway ini memproses pembayaran internasional langsung ke akun merchant Anda.',
    },
    receipt: {
      title: 'Struk Digital Resmi',
      invoice: 'No. Nota',
      date: 'Tanggal',
      customer: 'Nama Pelanggan',
      paymentStatus: 'Status Bayar',
      paid: 'LUNAS',
      unpaid: 'BELUM LUNAS',
      paymentMethod: 'Metode Bayar',
      thermalPrint58: 'Ukuran 58mm (Kecil)',
      thermalPrint80: 'Ukuran 80mm (Standar)',
      printBluetooth: 'Cetak Thermal Bluetooth',
      shareWhatsApp: 'Kirim ke WhatsApp Pelanggan',
      thankYou: 'Terima kasih telah mempercayakan pakaian Anda kepada LAUNDRYHUB!',
    },
  },

  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      delete: 'Delete',
      edit: 'Edit',
      success: 'Success',
      error: 'Error Occurred',
      loading: 'Loading...',
      copy: 'Copy',
      copied: 'Copied',
      search: 'Search',
      searchPlaceholder: 'Type to search...',
      filter: 'Filter',
      back: 'Back',
      next: 'Next',
      all: 'All',
      status: 'Status',
      action: 'Action',
      active: 'Active',
      inactive: 'Inactive',
      verified: 'Verified',
    },
    nav: {
      subtitle: 'Unified Laundry Management & Multi-Role Ecosystem',
      roleKasir: 'POS Cashier',
      roleOwner: 'Owner / HQ',
      roleProduksi: 'Laundry Plant',
      roleKurir: 'Courier Pickup',
      rolePelanggan: 'Customer Portal',
      roleAgen: 'Dropship Agent',
      coins: 'Note Coins',
      tokenNotice: 'Note Token Quota',
      modeDemo: 'Demo Mode',
      modeCommercial: 'Commercial Mode',
      switchRole: 'Switch Role',
      language: 'Language',
      currency: 'Currency',
    },
    pos: {
      title: 'Point of Sale (POS)',
      catalogTitle: 'Laundry Services Catalog',
      cartTitle: 'Order Transaction Cart',
      selectCustomer: 'Select Customer',
      searchCustomer: 'Search customer name or phone number...',
      addNewCustomer: '+ New Customer',
      allCategories: 'All Services',
      kiloan: 'Wash & Fold (Weight / Kg)',
      satuan: 'Dry Clean & Per-Piece',
      perfumeSelect: 'Fragrance Aroma',
      notesPlaceholder: 'Special garment instructions (e.g. delicate fabric, color bleeding, no high heat)...',
      serviceType: 'Service Speed',
      regularService: 'Regular (2-3 Days)',
      expressService: 'Express (24 Hours)',
      pickupType: 'Delivery Type',
      selfOutlet: 'Outlet Self-Pickup',
      deliveryHome: 'Hotel / Home Delivery',
      paymentMethod: 'Payment Method',
      methodCash: 'Cash (IDR)',
      methodTransfer: 'Bank Transfer',
      methodQris: 'QRIS (National & Cross-Border ASEAN)',
      methodDeposit: 'Deduct Deposit Balance',
      methodPayLater: 'Pay on Pickup (Receivable)',
      methodCardIntl: 'International Credit / Debit Card (Visa, Mastercard, Amex)',
      cashGiven: 'Cash Received',
      change: 'Cash Change',
      totalBill: 'Subtotal',
      discount: 'Discount',
      grandTotal: 'Grand Total',
      btnCheckout: 'Pay & Issue Receipt',
      cartEmpty: 'Cart is Empty',
      cartEmptyDesc: 'Select weight-based or dry cleaning services from the left catalog to start.',
      warningZeroCoins: 'WARNING: OUT OF NOTE TOKENS (0 Coins):\n\nThe system requires 1 Token Coin per order note issued ($0.002 - $0.003 / ticket).\nPlease Top Up Tokens via the Owner menu.',
      underpaymentWarning: 'Cash amount received is less than the total bill!',
      depositInsufficient: 'Customer deposit balance is insufficient for this payment!',
      orderSuccess: 'Order successfully saved and receipt token generated!',
    },
    portal: {
      title: 'Self-Service Customer Portal',
      badge: 'Live Order Tracker & Pickup Request',
      tabTrack: 'Track Laundry',
      tabWallet: 'Wallet & Points',
      tabHistory: 'Order History',
      tabPickup: 'Request Pickup',
      activeOrderTitle: 'Active Laundry Order',
      invoiceNo: 'Invoice Token',
      estFinish: 'Estimated Completion',
      pickupToken: 'Garment Release Token',
      trackSteps: {
        antrean: 'Received at Counter',
        cuci: 'Washing Cycle',
        kering: 'Tumble Drying',
        setrika: 'Steam Pressing & Scent',
        packing: 'QC & Eco-Packing',
        siap: 'Ready for Pickup / Delivery',
        selesai: 'Completed & Delivered',
      },
      walletTitle: 'Prepaid Wallet Balance',
      walletDesc: 'Seamless cashless payment for every wash',
      pointsTitle: 'Loyalty Reward Points',
      requestPickupTitle: 'Schedule Laundry Pickup',
      touristHeader: 'Hotel, Villa & Airbnb Pickup Service',
      touristDesc: 'Our courier will pick up directly from your hotel lobby, Airbnb, or villa reception.',
      hotelRoomLabel: 'Hotel Name / Room Number',
      hotelRoomPlaceholder: 'e.g. Tentrem Hotel Room 412 / Villa Pandanaran',
      specialCareLabel: 'Special Washing Requests',
      submitPickupBtn: 'Request Courier Pickup Now',
    },
    tokens: {
      topupTitle: 'Top Up Note Token Quota',
      topupSubtitle: '1 Order Note = 1 Coin Deducted (Starts at ~Rp 25 / $0.002 per ticket)',
      currentBalance: 'Current Token Balance',
      coinsUnit: 'Coins',
      choosePackage: 'Choose Value Package:',
      perNote: 'per note',
      popular: 'Most Popular',
      voucherSectionTitle: 'Have a Free Gift Voucher Code?',
      voucherPlaceholder: 'Enter voucher code (e.g. RENA50 / COBAGRATIS)',
      claimBtn: 'Claim',
      sampleCodes: 'Active promo codes:',
      ownerCreateBtn: '+ Create Voucher (Owner)',
      ownerCreateTitle: 'Voucher Code Generator (Owner Only)',
      codeNamePlaceholder: 'Code Name (e.g. PARTNER2026)',
      coinAmountPlaceholder: 'Tokens Amount (e.g. 100)',
      saveCodeBtn: 'Save & Release Voucher Code',
      payQrisBtn: 'Pay via Cross-Border QRIS (SpeedCash / ASEAN)',
      payCardBtn: 'Pay via International Credit Card (Visa / Mastercard)',
      crossBorderNotice: 'Supports Singapore (NETS), Malaysia (DuitNow), Thailand (PromptPay) & Global Cards.',
    },
    cardModal: {
      title: 'International Card Payment',
      subtitle: 'Accepts Visa, Mastercard, JCB, American Express & PayPal',
      cardNumber: 'Card Number',
      cardExpiry: 'Expiry Date (MM/YY)',
      cardCvc: 'CVC / CVV',
      cardholderName: 'Cardholder Name',
      billingCountry: 'Billing Country',
      payNow: 'Pay Now',
      processing: 'Processing International Card Payment...',
      securityBadge: '256-bit Bank Grade SSL & PCI-DSS Level 1 Compliant',
      demoNotice: 'Cross-border merchant settlement directly credited to your business account.',
    },
    receipt: {
      title: 'Official Digital Receipt',
      invoice: 'Invoice No.',
      date: 'Date & Time',
      customer: 'Customer Name',
      paymentStatus: 'Payment Status',
      paid: 'PAID IN FULL',
      unpaid: 'PAYMENT PENDING',
      paymentMethod: 'Payment Method',
      thermalPrint58: '58mm Width (Pocket)',
      thermalPrint80: '80mm Width (Standard)',
      printBluetooth: 'Print Thermal Bluetooth',
      shareWhatsApp: 'Send Receipt to WhatsApp',
      thankYou: 'Thank you for trusting LAUNDRYHUB with your garments!',
    },
  },
};
