export type Role = 'owner' | 'kasir' | 'produksi' | 'kurir' | 'pelanggan' | 'agen' | 'operator';

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  code: string;
  isPusat?: boolean;
  image?: string;
}

export interface OwnerProfile {
  ownerUid: string; // Unique UID for each owner (e.g. "OWN-882194")
  email: string;
  name: string;
  phone: string;
  outletName: string;
  avatar: string;
  pin: string; // Security PIN (default "8888")
  createdAt: string;
  lastLoginAt?: string;
  recoveryOtp?: string;
  recoveryOtpExpiresAt?: string;
}

export interface User {
  id: string;
  ownerUid?: string; // UID unik owner pemilik akun/outlet ini
  name: string;
  role: Role;
  allowedRoles?: Role[]; // Specific jobs assigned to this account by owner (e.g. ['kasir', 'produksi'])
  email: string;
  phone: string;
  avatar: string;
  branchId: string;
  commissionRateKg: number; // Rp per kg (e.g. 500)
  commissionRateItem: number; // Rp per satuan (e.g. 1000)
  totalCommissionEarned: number;
  pin?: string; // Security PIN
  outletName?: string;
  isGmailLinked?: boolean;
  isDemo?: boolean;
  isPersonalGoogleAccount?: boolean;
  invitedAt?: string;
  lastLoginAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  depositBalance: number;
  loyaltyPoints: number;
  avatar?: string;
  branchId: string;
  totalOrdersCount: number;
}

export type ServiceCategory = 'kiloan' | 'satuan';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  unit: string; // 'kg' | 'pcs' | 'pasang' | 'set' | 'm2'
  minWeight?: number;
  estHours: number;
  icon: string;
  description?: string;
  isActive?: boolean;
}

export interface Fragrance {
  id: string;
  name: string;
  description: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  subtotal: number;
  notes?: string;
}

export type OrderStatus =
  | 'antrean'
  | 'sortir'
  | 'cuci'
  | 'kering'
  | 'setrika'
  | 'packing'
  | 'siap'
  | 'diantar'
  | 'selesai';

export type PaymentStatus = 'lunas' | 'belum_lunas' | 'piutang';

export type PaymentMethod = 'tunai' | 'transfer' | 'qris' | 'deposit' | 'piutang' | 'card_international';

export interface StationCommissionRates {
  sortir: number;  // Rp per kg (e.g. 150)
  cuci: number;    // Rp per kg (e.g. 300)
  kering: number;  // Rp per kg (e.g. 200)
  setrika: number; // Rp per kg (e.g. 400)
  packing: number; // Rp per kg (e.g. 200)
}

export interface StaffAttendance {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  branchId: string;
  date: string; // YYYY-MM-DD
  clockInTime: string; // HH:mm:ss
  clockOutTime?: string; // HH:mm:ss
  selfieUrl?: string; // Foto bukti selfie kehadiran
  status: 'hadir' | 'terlambat' | 'izin' | 'alpha';
  notes?: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
  gpsAccuracy?: number;
  isGpsVerified?: boolean;
}

export interface PayrollSettings {
  dailyBaseSalary: number; // e.g. Rp 60.000 / hari hadir
  absenceDeductionPerDay: number; // e.g. Rp 50.000 / hari tidak masuk (pengurangan gaji)
  lateDeductionPerIncident: number; // e.g. Rp 15.000 / insiden terlambat
}

export interface WorkerStationStat {
  station: OrderStatus;
  count: number;
  totalEarned: number;
}

export interface StaffSalarySlip {
  userId: string;
  userName: string;
  role: Role;
  avatar: string;
  period: string; // e.g. 'Oktober 2026'
  daysPresent: number;
  daysAbsent: number; // hari tidak masuk
  daysLate: number;
  baseSalaryRate: number;
  baseSalaryTotal: number;
  absenceDeductionRate: number;
  absenceDeductionsTotal: number;
  lateDeductionsTotal: number;
  stationCommissions: WorkerStationStat[];
  totalStationEarnings: number; // total gaji per stasiun per nota
  customerTipsTotal: number;
  netTakeHomePay: number; // (Base + Stations + Tips - Deductions)
}

export interface StatusTimestamp {
  time: string;
  picName?: string;
  picId?: string;
  photoProof?: string;          // Photo proof URL or data URL
  commissionEarned?: number;    // Commission credited for this station
  stationNotes?: string;        // Optional notes from worker
  claimedAt?: string;           // Timestamp when task was claimed
}

export interface StationClaim {
  station: OrderStatus;
  workerId: string;
  workerName: string;
  claimedAt: string;
}

export interface ClothesItem {
  id: string;
  name: string; // e.g. 'Kaos / Kemeja / Baju', 'Celana Panjang', 'Celana Pendek', 'Pakaian Dalam', 'Gamis / Dress', 'Jaket / Sweater', 'Handuk', 'Sprei', 'Lainnya'
  quantity: number; // e.g. 5
  notes?: string; // e.g. 'Ada noda tinta di kerah kemeja putih'
}

export interface CustomerReview {
  rating: number; // 1 - 5
  feedbackText?: string;
  tags?: string[]; // e.g. ['Wanginya Tahan Lama', 'Lipatan Presisi', 'Kilat Tepat Waktu']
  staffTipAmount?: number; // e.g. 5000
  createdAt: string;
  customerName: string;
}

export interface Order {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  branchId: string;
  items: OrderItem[];
  weightKg: number;
  itemCount: number;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  currentStatus: OrderStatus;
  pickupDeliveryType: 'outlet' | 'delivery';
  courierId?: string;
  perfumeId: string;
  perfumeName: string;
  specialNotes?: string;
  createdAt: string;
  estReadyDate: string;
  statusTimestamps: Partial<Record<OrderStatus, StatusTimestamp>>;
  currentClaim?: StationClaim;
  paidAmount: number;
  changeAmount: number;
  assignedMachineId?: string;
  isExpress?: boolean;
  // Detail sortir & isi pakaian
  clothesDetails?: ClothesItem[]; // Rincian pakaian (e.g. Baju: 5, Celana: 3, dll)
  sortingNotes?: string;          // Catatan sortir / defect pakaian (noda, robek, kancing copot, luntur)
  totalPieces?: number;           // Total jumlah helai pakaian tercatat
  // Dopamine customer review & rating
  customerReview?: CustomerReview;
  // Dropship integration
  isDropship?: boolean;
  agentId?: string;
  agentName?: string;
  agentCommission?: number;
  // AI Garment Inspection & Disclaimer
  aiInspection?: AiGarmentInspection;
  // Gamification promo applied
  appliedPromoReward?: string;
  hasClaimedGamification?: boolean;
  gamificationRewardClaimed?: string;
  gamificationClaimedAt?: string;
  // Digital scale verified
  isScaleVerified?: boolean;
}

export interface InventoryItem {
  id: string;
  branchId: string;
  name: string;
  category: 'deterjen' | 'parfum' | 'kemasan' | 'perlengkapan';
  stock: number;
  unit: string;
  minStockWarning: number;
  unitCost: number;
}

export interface MachineIoT {
  id: string;
  branchId: string;
  name: string;
  type: 'washer' | 'dryer';
  model: string;
  status: 'idle' | 'running' | 'completed' | 'maintenance';
  currentOrderId?: string;
  currentInvoiceNo?: string;
  timerSecondsLeft: number;
  totalDurationSeconds: number;
  energyKwh: number;
  startedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: Role;
  action: string;
  details: string;
  branchId: string;
}

export interface CourierTask {
  id: string;
  orderId: string;
  invoiceNo: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  type: 'pickup' | 'delivery';
  status: 'pending' | 'on_the_way' | 'completed';
  amountToCollect: number;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  isAgentDropPoint?: boolean;
  agentName?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'iot' | 'payment' | 'dropship' | 'reward' | 'attendance';
  timestamp: string;
  read: boolean;
  orderId?: string;
}

// DROPSHIP & DROP POINT PARTNER INTERFACES
export interface DropshipAgent {
  id: string;
  name: string; // e.g. "Drop Point Warung Berkah Bu Siti"
  ownerName: string;
  phone: string;
  address: string;
  branchId: string; // central workshop connection
  branchName?: string;
  commissionPercent: number; // e.g. 25%
  walletBalance: number; // e.g. Rp 520.000 komisi siap ditarik
  totalEarned: number; // e.g. Rp 4.150.000
  totalOrdersCount: number;
  totalWeightKg: number;
  status: 'active' | 'pending' | 'suspended';
  bankAccount: {
    bank: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: string;
}

export interface DropshipSupplyItem {
  id: string;
  name: string;
  category: 'deterjen' | 'parfum' | 'kemasan' | 'mesin' | 'peralatan';
  supplierName: string;
  wholesalePrice: number;
  suggestedRetailPrice: number;
  unit: string;
  minOrder: number;
  deliveryEstimate: string;
  description: string;
  imageUrl?: string;
  inStock: boolean;
  rating: number;
}

export interface DropshipSupplyOrder {
  id: string;
  orderNo: string;
  itemId: string;
  itemName: string;
  quantity: number;
  totalPrice: number;
  destinationBranchOrAgent: string;
  recipientName: string;
  recipientPhone: string;
  destinationAddress: string;
  status: 'diproses' | 'dikirim' | 'sampai';
  trackingNumber: string;
  cargoCourier: string; // e.g. JNE Trucking / SiCepat Cargo
  orderDate: string;
  estimatedArrival: string;
}

export interface WithdrawalRequest {
  id: string;
  agentId: string;
  agentName: string;
  amount: number;
  bank: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'transferred' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

// AI Garment & Stain Inspection Types
export interface AiStainDetection {
  id: string;
  label: string; // e.g. "Noda Minyak / Saus Makanan"
  severity: 'low' | 'medium' | 'high';
  confidence: number; // e.g. 0.94
  boundingBox?: { x: number; y: number; width: number; height: number };
  recommendedTreatment: string; // e.g. "Spotting Solvent Degreaser"
  defectType: 'noda' | 'robek' | 'kancing_lepas' | 'luntur' | 'jamur';
}

export interface AiGarmentInspection {
  analyzedAt: string;
  garmentType: string; // e.g. "Kemeja Putih Katun"
  fabricCareNote: string;
  stains: AiStainDetection[];
  disclaimerNote: string; // e.g. "Pakaian diterima dengan noda minyak lama dan kancing ke-2 longgar"
  photoUrl?: string;
}

// Owner Configurable Gamification Settings & Prizes
export interface GamificationPrize {
  id: string;
  label: string;
  type: 'discount_percent' | 'discount_fixed' | 'free_perfume' | 'free_service' | 'zonk';
  value: number; // e.g. 15 for 15%, 5000 for Rp 5000
  probability: number; // 0 - 100
  description: string;
  color: string;
  icon?: string;
}

export interface GamificationSettings {
  isEnabled: boolean; // Owner can toggle ON/OFF!
  gameType: 'wheel' | 'scratch' | 'both';
  triggerEvent: 'on_pickup' | 'after_payment' | 'after_review' | 'min_spend' | 'manual';
  minSpendAmount: number; // e.g. Rp 30.000
  prizes: GamificationPrize[];
  // Limit 1 Nota = 1x Spin
  oneSpinPerOrder: boolean; // limit 1 nota 1 kali spin
  // Khusus Pas Ambil Cucian
  onlyOnPickup: boolean; // promo cuma bisa customer pas ambil aja (status: siap_ambil / selesai)
  // Periode Promo Tertentu
  hasPeriodLimit: boolean; // toggle apakah promo dibatasi periode tanggal tertentu
  startDate?: string; // Format YYYY-MM-DD (e.g. '2026-10-01')
  endDate?: string; // Format YYYY-MM-DD (e.g. '2026-10-31')
}

// Digital Scale USB / Bluetooth Reading
export interface DigitalScaleReading {
  weightKg: number;
  isStable: boolean;
  connectedDevice: string;
  timestamp: string;
}
