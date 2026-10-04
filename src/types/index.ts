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

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  avatar: string;
  branchId: string;
  commissionRateKg: number; // Rp per kg (e.g. 500)
  commissionRateItem: number; // Rp per satuan (e.g. 1000)
  totalCommissionEarned: number;
  isGmailLinked?: boolean;
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
  unit: string; // 'kg' | 'pcs' | 'pasang' | 'set'
  minWeight?: number;
  estHours: number;
  icon: string;
  description?: string;
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
  // Dropship integration
  isDropship?: boolean;
  agentId?: string;
  agentName?: string;
  agentCommission?: number;
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
  type: 'order' | 'stock' | 'iot' | 'payment' | 'dropship';
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
