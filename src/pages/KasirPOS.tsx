import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Service,
  Customer,
  OrderItem,
  PaymentMethod,
  Order,
  Fragrance,
  OrderStatus,
  ClothesItem,
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_FRAGRANCES,
} from '../data/seedData';
import {
  ShoppingCart,
  Scale,
  Plus,
  Minus,
  Trash2,
  Printer,
  MessageSquare,
  Search,
  UserPlus,
  Sparkles,
  Zap,
  CheckCircle2,
  CreditCard,
  Wallet,
  DollarSign,
  QrCode,
  Clock,
  Layers,
  ChevronRight,
  Filter,
  Globe,
  Settings,
  ClipboardCheck,
  Camera,
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal';
import { WhatsAppSimulatorModal } from '../components/WhatsAppSimulatorModal';
import { QrisModal } from '../components/QrisModal';
import { InternationalCardModal } from '../components/InternationalCardModal';
import { OutletQrisConfigModal } from '../components/OutletQrisConfigModal';
import { ClothesDetailModal } from '../components/ClothesDetailModal';
import { formatCurrency } from '../utils/currency';
import { checkGamificationPeriod } from '../utils/gamification';
import { dbService } from '../services/api';

interface KasirPOSProps {
  currentSubTab?: string;
}

export const KasirPOS: React.FC<KasirPOSProps> = ({ currentSubTab = 'kasir-pos' }) => {
  const {
    customers,
    orders,
    currentBranchId,
    currentUser,
    branches,
    createOrder,
    updateOrderStatus,
    addCustomer,
    topupCustomerDeposit,
    tokenCoins,
    language,
    currency,
    t,
    setIsQrScannerOpen,
    digitalScaleReading,
    readDigitalScale,
    openAiScanner,
    openWhatsAppBot,
    gamificationSettings,
    triggerGamification,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<'pos' | 'orders' | 'customers'>(
    currentSubTab === 'kasir-orders'
      ? 'orders'
      : currentSubTab === 'kasir-customers'
      ? 'customers'
      : 'pos'
  );

  // Sync prop changes
  React.useEffect(() => {
    if (currentSubTab === 'kasir-orders') setActiveSubView('orders');
    else if (currentSubTab === 'kasir-customers') setActiveSubView('customers');
    else setActiveSubView('pos');
  }, [currentSubTab]);

  // Order Creation State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'kiloan' | 'satuan'>('all');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [selectedPerfumeId, setSelectedPerfumeId] = useState<string>(INITIAL_FRAGRANCES[0].id);
  const [specialNotes, setSpecialNotes] = useState('');
  const [isExpress, setIsExpress] = useState(false);
  const [pickupDeliveryType, setPickupDeliveryType] = useState<'outlet' | 'delivery'>('outlet');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [cashGiven, setCashGiven] = useState<number>(50000);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Weight Input state for Kiloan
  const [customWeight, setCustomWeight] = useState<number>(3.5);

  // Modals state
  const [activeOrderForReceipt, setActiveOrderForReceipt] = useState<Order | null>(null);
  const [activeOrderForWhatsApp, setActiveOrderForWhatsApp] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isQrisOpen, setIsQrisOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isOutletConfigOpen, setIsOutletConfigOpen] = useState(false);

  // New Customer Modal
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustDeposit, setNewCustDeposit] = useState(0);

  // Top Up Customer Deposit Modal
  const [depositModalCust, setDepositModalCust] = useState<Customer | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(100000);

  // Orders Tab Filter state
  const [orderSearchText, setOrderSearchText] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Clothes Detailing & Sortir State
  const [isClothesModalOpen, setIsClothesModalOpen] = useState<boolean>(false);
  const [cartClothesDetails, setCartClothesDetails] = useState<ClothesItem[]>([]);
  const [cartSortingNotes, setCartSortingNotes] = useState<string>('');
  const [cartTotalPieces, setCartTotalPieces] = useState<number>(0);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const activeBranch = branches.find((b) => b.id === currentBranchId) || branches[0];
  const selectedPerfume = INITIAL_FRAGRANCES.find((f) => f.id === selectedPerfumeId) || INITIAL_FRAGRANCES[0];

  // Services
  const filteredServices = INITIAL_SERVICES.filter((s) => {
    if (categoryFilter === 'all') return true;
    return s.category === categoryFilter;
  });

  // Add Kiloan Service to Cart
  const handleAddKiloan = (service: Service) => {
    const existing = cartItems.find((i) => i.serviceId === service.id);
    const weight = customWeight > 0 ? customWeight : (service.minWeight || 3);
    const price = isExpress ? Math.round(service.price * 1.5) : service.price;
    const subtotal = Math.round(weight * price);

    if (existing) {
      setCartItems((prev) =>
        prev.map((i) =>
          i.serviceId === service.id
            ? {
                ...i,
                quantity: Number((i.quantity + weight).toFixed(1)),
                subtotal: Math.round((i.quantity + weight) * price),
              }
            : i
        )
      );
    } else {
      const newItem: OrderItem = {
        id: `it-${Date.now()}`,
        serviceId: service.id,
        serviceName: `${service.name}${isExpress ? ' (EXPRESS)' : ''}`,
        category: 'kiloan',
        quantity: weight,
        unit: 'kg',
        pricePerUnit: price,
        subtotal,
      };
      setCartItems((prev) => [...prev, newItem]);
    }
  };

  // Add Satuan Service to Cart
  const handleAddSatuan = (service: Service) => {
    const existing = cartItems.find((i) => i.serviceId === service.id);
    if (existing) {
      setCartItems((prev) =>
        prev.map((i) =>
          i.serviceId === service.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: (i.quantity + 1) * i.pricePerUnit,
              }
            : i
        )
      );
    } else {
      const newItem: OrderItem = {
        id: `it-${Date.now()}`,
        serviceId: service.id,
        serviceName: service.name,
        category: 'satuan',
        quantity: 1,
        unit: service.unit,
        pricePerUnit: service.price,
        subtotal: service.price,
      };
      setCartItems((prev) => [...prev, newItem]);
    }
  };

  const updateItemQty = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.category === 'kiloan' ? Number((item.quantity + delta).toFixed(1)) : item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: Math.round(newQty * item.pricePerUnit),
            };
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Cart Totals
  const rawTotal = cartItems.reduce((acc, i) => acc + i.subtotal, 0);
  const finalPrice = Math.max(0, rawTotal - discountAmount);
  const totalWeight = cartItems
    .filter((i) => i.category === 'kiloan')
    .reduce((acc, i) => acc + i.quantity, 0);
  const totalItemsCount = cartItems.reduce((acc, i) => acc + (i.category === 'satuan' ? i.quantity : 1), 0);

  // Cash change
  const changeAmount = paymentMethod === 'tunai' ? Math.max(0, cashGiven - finalPrice) : 0;
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Checkout Handler
  const handleCheckout = () => {
    if (isSubmittingOrder) return;

    if (cartItems.length === 0) {
      alert('Keranjang masih kosong! Silakan pilih layanan terlebih dahulu.');
      return;
    }

    // Token quota check (Fee platform Rp 100 per nota)
    if (tokenCoins <= 0) {
      alert(
        'PERINGATAN KUOTA TOKEN NOTA HABIS (0 Koin):\n\nSistem membutuhkan 1 Token Koin per penerbitan nota transaksi (Fee platform Rp 100/nota).\nSilakan lakukan Top Up Token via QRIS di menu Owner untuk menerbitkan nota baru.'
      );
      return;
    }

    // Edge Case: Cash Underpayment Check
    if (paymentMethod === 'tunai' && cashGiven < finalPrice) {
      alert(
        `PERINGATAN PEMBAYARAN TUNAI:\n\nUang tunai yang diserahkan (Rp ${cashGiven.toLocaleString('id-ID')}) kurang dari total tagihan (Rp ${finalPrice.toLocaleString('id-ID')}).\n\nSilakan sesuaikan uang yang diterima atau pilih metode bayar 'Bayar Nanti (Piutang)'.`
      );
      return;
    }

    if (paymentMethod === 'deposit' && selectedCustomer.depositBalance < finalPrice) {
      alert(`Saldo deposit Kak ${selectedCustomer.name} tidak cukup (Tersisa Rp ${selectedCustomer.depositBalance.toLocaleString('id-ID')}). Harap gunakan metode lain atau top up deposit.`);
      return;
    }

    if (paymentMethod === 'qris') {
      setIsQrisOpen(true);
      return;
    }

    if (paymentMethod === 'card_international') {
      setIsCardModalOpen(true);
      return;
    }

    executeFinalizeOrder();
  };

  const executeFinalizeOrder = () => {
    if (isSubmittingOrder) return;
    setIsSubmittingOrder(true);

    try {
      const estReady = new Date();
      estReady.setHours(estReady.getHours() + (isExpress ? 4 : 48));

      const newOrder = createOrder({
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerAddress: selectedCustomer.address,
        branchId: currentBranchId,
        items: cartItems,
        weightKg: Number(totalWeight.toFixed(1)),
        itemCount: totalItemsCount,
        totalPrice: rawTotal,
        discount: discountAmount,
        finalPrice,
        paymentMethod,
        paymentStatus: paymentMethod === 'piutang' ? 'piutang' : 'lunas',
        currentStatus: 'antrean',
        pickupDeliveryType,
        perfumeId: selectedPerfume.id,
        perfumeName: selectedPerfume.name,
        specialNotes: specialNotes || undefined,
        estReadyDate: estReady.toISOString().replace('T', ' ').substring(0, 19),
        paidAmount: paymentMethod === 'tunai' ? cashGiven : finalPrice,
        changeAmount,
        isExpress,
        clothesDetails: cartClothesDetails.length > 0 ? cartClothesDetails : undefined,
        sortingNotes: cartSortingNotes.trim() || undefined,
        totalPieces: cartTotalPieces > 0 ? cartTotalPieces : undefined,
      });

      // Enqueue to offline sync layer
      dbService.enqueueOfflineAction('CREATE_ORDER', newOrder);

      // Reset Form
      setCartItems([]);
      setSpecialNotes('');
      setDiscountAmount(0);
      setCartClothesDetails([]);
      setCartSortingNotes('');
      setCartTotalPieces(0);

      // Open Receipt preview right away!
      setActiveOrderForReceipt(newOrder);
      setIsReceiptOpen(true);

      // Trigger owner-configured gamification promo reward if eligible
      if (gamificationSettings.isEnabled && gamificationSettings.triggerEvent === 'after_payment') {
        const periodStatus = checkGamificationPeriod(gamificationSettings);
        if (periodStatus.isActive) {
          setTimeout(() => {
            triggerGamification({
              orderId: newOrder.id,
              customerName: newOrder.customerName,
              finalPrice: newOrder.finalPrice,
            });
          }, 800);
        }
      }
    } finally {
      setTimeout(() => setIsSubmittingOrder(false), 800);
    }
  };

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const created = addCustomer({
      name: newCustName,
      phone: newCustPhone,
      address: newCustAddress || 'Alamat Belum Diisi',
      depositBalance: newCustDeposit,
      loyaltyPoints: 10,
      branchId: currentBranchId,
    });

    setSelectedCustomerId(created.id);
    setIsAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustDeposit(0);
  };

  // Branch orders for the orders tab
  const branchOrders = orders.filter((o) => {
    const matchSearch =
      o.invoiceNo.toLowerCase().includes(orderSearchText.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearchText.toLowerCase()) ||
      o.customerPhone.includes(orderSearchText);
    const matchStatus = orderStatusFilter === 'all' || o.currentStatus === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Kasir Sub-view switcher */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubView('pos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubView === 'pos'
                ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kasir POS (Input Order Baru)</span>
          </button>
          <button
            onClick={() => setActiveSubView('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubView === 'orders'
                ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Daftar Transaksi ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveSubView('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubView === 'customers'
                ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Pelanggan & Saldo Deposit ({customers.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsQrScannerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
            title="Scan QR Code Nota Laundry"
          >
            <Camera className="w-3.5 h-3.5 text-teal-400" />
            <span>Scan QR Nota</span>
          </button>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Kasir Bertugas: <strong className="text-white">{currentUser.name}</strong></span>
          </div>
        </div>
      </div>

      {/* VIEW 1: POS REGISTER INTERFACE */}
      {activeSubView === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7/12: Product & Weighing Catalog */}
          <div className="lg:col-span-7 space-y-5">
            {/* Customer Picker Banner */}
            <div className="p-4 rounded-2xl glass-card border border-cyan-500/30 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-[240px]">
                <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  Pilih Pelanggan / Nomor HP:
                </label>
                <div className="relative">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.phone} (Deposit: Rp {c.depositBalance.toLocaleString('id-ID')} | Poin: {c.loyaltyPoints})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={() => setIsAddCustomerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all shadow-glow-cyan"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Pelanggan Baru</span>
              </button>
            </div>

            {/* Weighing & Scale Assist for Kiloan */}
            <div className="p-4 rounded-2xl glass-card border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Timbangan Digital Laundry</h3>
                    <p className="text-[11px] text-slate-400">Atur bobot kiloan secara instan dengan preset</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCustomWeight((w) => Math.max(0.5, Number((w - 0.5).toFixed(1))))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(parseFloat(e.target.value) || 0)}
                    className="w-20 bg-slate-900 border border-cyan-500/50 rounded-lg px-2 py-1 text-center font-mono font-bold text-base text-cyan-400 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-400">kg</span>
                  <button
                    onClick={() => setCustomWeight((w) => Number((w + 0.5).toFixed(1)))}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bluetooth / USB Digital Scale Sync Bar */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <span className="font-mono text-cyan-300 font-bold block">{digitalScaleReading.connectedDevice}</span>
                    <span className="text-[10px] text-slate-400">Sinkron: {digitalScaleReading.timestamp} • Anti-Tamper: OK</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const w = readDigitalScale();
                    setCustomWeight(w);
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow-glow-cyan active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 text-slate-950 fill-current" />
                  <span>Sync Timbangan ({digitalScaleReading.weightKg} kg)</span>
                </button>
              </div>

              {/* Weight Presets & AI Scan Button */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <div className="flex gap-1.5 flex-wrap items-center">
                  <span className="text-[11px] text-slate-400">Preset:</span>
                  {[3.0, 5.0, 7.0, 10.0, 15.0].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setCustomWeight(preset)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                        customWeight === preset
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {preset}kg
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => openAiScanner()}
                  className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>AI Garment Scan</span>
                </button>
              </div>
            </div>

            {/* Category Filter Chips & Express Toggle */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-2">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-cyan-400 bg-slate-800/80 border border-slate-700/60'
                  }`}
                >
                  Semua Layanan
                </button>
                <button
                  onClick={() => setCategoryFilter('kiloan')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === 'kiloan'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white bg-slate-800/50'
                  }`}
                >
                  🧺 Cuci Kiloan
                </button>
                <button
                  onClick={() => setCategoryFilter('satuan')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === 'satuan'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'text-slate-400 hover:text-white bg-slate-800/50'
                  }`}
                >
                  ✨ Satuan & Dry Clean
                </button>
              </div>

              {/* Express Toggle */}
              <button
                onClick={() => setIsExpress(!isExpress)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isExpress
                    ? 'bg-amber-500 text-slate-950 shadow-glow-amber scale-105'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-amber-400'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Express Kilat 4 Jam (+50%)</span>
              </button>
            </div>

            {/* Service Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredServices.map((service) => {
                const isKiloan = service.category === 'kiloan';
                const calculatedPrice = isExpress && isKiloan ? Math.round(service.price * 1.5) : service.price;

                return (
                  <div
                    key={service.id}
                    className="p-3.5 rounded-2xl glass-card border border-slate-700/70 hover:border-cyan-500/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                          {service.name}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isKiloan
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {service.unit}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {service.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-black text-cyan-400">
                          Rp {calculatedPrice.toLocaleString('id-ID')}
                          <span className="text-[10px] text-slate-400 font-normal"> /{service.unit}</span>
                        </div>
                        {isKiloan && (
                          <div className="text-[10px] text-slate-500 font-mono">
                            Subtotal @{customWeight}kg: Rp {(customWeight * calculatedPrice).toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => (isKiloan ? handleAddKiloan(service) : handleAddSatuan(service))}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-glow-cyan"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isKiloan ? `+ ${customWeight}kg` : '+ Tambah'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Perfume & Notes Selector */}
            <div className="p-4 rounded-2xl glass-card border border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Pilihan Parfum Laundry (Free):</span>
                </label>
                <select
                  value={selectedPerfumeId}
                  onChange={(e) => setSelectedPerfumeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {INITIAL_FRAGRANCES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  Catatan Khusus Pelanggan:
                </label>
                <input
                  type="text"
                  placeholder="Misal: Jangan dicampur pemutih, pisahkan kemeja..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* RIGHT 5/12: Cart Drawer & Checkout Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div id="cart-checkout-section" className="p-5 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white">Keranjang Order</h3>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold">
                    {cartItems.length} Item
                  </span>
                </div>

                {/* Items in Cart */}
                <div className="py-3 space-y-2 max-h-[220px] overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      Belum ada item ditambahkan ke keranjang.
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white leading-tight">
                            {item.serviceName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.quantity} {item.unit} x Rp {item.pricePerUnit.toLocaleString('id-ID')}
                          </div>
                        </div>

                        {/* Qty Stepper */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateItemQty(item.id, item.category === 'kiloan' ? -0.5 : -1)}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold text-cyan-400 px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItemQty(item.id, item.category === 'kiloan' ? 0.5 : 1)}
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Delivery Option Selector */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>Metode Pengambilan:</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setPickupDeliveryType('outlet')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          pickupDeliveryType === 'outlet'
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Ambil di Outlet
                      </button>
                      <button
                        onClick={() => setPickupDeliveryType('delivery')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          pickupDeliveryType === 'delivery'
                            ? 'bg-purple-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        🛵 Antar ke Rumah
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clothes Detailing & Sortir Trigger Card */}
                <div className="pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsClothesModalOpen(true)}
                    className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 active:scale-98 ${
                      cartTotalPieces > 0
                        ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-900/80 border-slate-700/80 hover:border-indigo-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
                        <ClipboardCheck className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>Rincian Pakaian & Sortir:</span>
                          <span className="font-mono text-cyan-400 font-extrabold">
                            {cartTotalPieces > 0 ? `${cartTotalPieces} Pcs` : '(Opsional)'}
                          </span>
                        </div>
                        {cartTotalPieces > 0 ? (
                          <div className="text-[10px] text-slate-400 truncate">
                            {cartClothesDetails.filter((c) => c.quantity > 0).map((c) => `${c.quantity} ${c.name.split(' ')[0]}`).join(', ')}
                            {cartSortingNotes ? ` • Note: ${cartSortingNotes}` : ''}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500">
                            Klik untuk catat isi baju, celana & noda
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded-lg shrink-0 border border-indigo-500/30">
                      {cartTotalPieces > 0 ? 'Edit' : '+ Catat'}
                    </span>
                  </button>
                </div>

                {/* Calculation Breakdown */}
                <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal Tagihan:</span>
                    <span className="font-mono text-white">Rp {rawTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 items-center">
                    <span>Diskon Manual:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(parseInt(e.target.value, 10) || 0)}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-right text-xs font-mono text-rose-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-slate-700 text-white">
                    <span>Total Bersih:</span>
                    <span className="text-cyan-400 text-base font-black">
                      Rp {finalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Multi-Payment Methods */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Pilih Metode Pembayaran:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'tunai', label: language === 'id' ? 'Tunai (Cash)' : 'Cash (IDR)', icon: <DollarSign className="w-3.5 h-3.5" /> },
                      { id: 'qris', label: language === 'id' ? 'QRIS Outlet' : 'Outlet QRIS', icon: <QrCode className="w-3.5 h-3.5" /> },
                      { id: 'card_international', label: language === 'id' ? 'Kartu Luar Negeri' : 'Intl Card (Visa/MC)', icon: <Globe className="w-3.5 h-3.5" /> },
                      { id: 'transfer', label: 'Transfer Bank', icon: <CreditCard className="w-3.5 h-3.5" /> },
                      { id: 'deposit', label: 'Deposit Saldo', icon: <Wallet className="w-3.5 h-3.5" /> },
                      { id: 'piutang', label: language === 'id' ? 'Bayar Nanti' : 'Pay on Delivery', icon: <Clock className="w-3.5 h-3.5" /> },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                          paymentMethod === m.id
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-glow-cyan'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {m.icon}
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Outlet QRIS Info & Setup Banner */}
                  {paymentMethod === 'qris' && (
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-[11px] block font-semibold text-white">
                            {language === 'id' ? 'QRIS Penerimaan Warung' : 'Outlet QRIS Direct Receipt'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {language === 'id'
                              ? 'Uang cucian 100% langsung masuk rekening warung Anda'
                              : 'Laundry payments directly credited to your shop account'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsOutletConfigOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] font-bold transition-colors flex items-center gap-1 shrink-0 ml-2"
                      >
                        <Settings className="w-3 h-3" />
                        <span>{language === 'id' ? 'Atur QR' : 'Setup QR'}</span>
                      </button>
                    </div>
                  )}

                  {/* Cash input helpers if cash selected */}
                  {paymentMethod === 'tunai' && (
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Uang Diterima:</span>
                        <input
                          type="number"
                          value={cashGiven}
                          onChange={(e) => setCashGiven(parseInt(e.target.value, 10) || 0)}
                          className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right font-mono font-bold text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => setCashGiven(finalPrice)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300 font-mono"
                        >
                          Uang Pas
                        </button>
                        <button
                          onClick={() => setCashGiven(50000)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono"
                        >
                          50rb
                        </button>
                        <button
                          onClick={() => setCashGiven(100000)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono"
                        >
                          100rb
                        </button>
                      </div>
                      <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-800 text-emerald-400">
                        <span>Kembalian:</span>
                        <span className="font-mono">Rp {changeAmount.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  )}

                  {/* Customer Deposit info */}
                  {paymentMethod === 'deposit' && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                      <span>Saldo Deposit Pelanggan:</span>
                      <span className="font-bold font-mono">
                        Rp {selectedCustomer.depositBalance.toLocaleString('id-ID')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout Button */}
              <div className="pt-4">
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || isSubmittingOrder}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm tracking-wide uppercase transition-all shadow-glow-cyan disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className={`w-5 h-5 ${isSubmittingOrder ? 'animate-spin' : ''}`} />
                  <span>
                    {isSubmittingOrder
                      ? 'Memproses Transaksi...'
                      : 'Proses Bayar & Terbitkan Nota (1 Koin)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY MOBILE CART BAR (Above BottomNav) */}
      {activeSubView === 'pos' && cartItems.length > 0 && (
        <div className="fixed bottom-16 left-3 right-3 sm:hidden z-30 animate-in slide-in-from-bottom duration-300">
          <div className="p-3 rounded-2xl bg-slate-900/95 border border-cyan-500/60 shadow-2xl backdrop-blur-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">
                  {cartItems.length} Layanan Dipilih
                </div>
                <div className="text-sm font-black text-cyan-400">
                  Rp {finalPrice.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                document.getElementById('cart-checkout-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black text-xs shadow-glow-cyan active:scale-95 transition-all"
            >
              <span>Bayar</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: ORDERS MANAGEMENT TAB */}
      {activeSubView === 'orders' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="p-4 rounded-2xl glass-card border border-slate-700/80 flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari no. nota / nama pelanggan / nomor telepon..."
                value={orderSearchText}
                onChange={(e) => setOrderSearchText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {['all', 'antrean', 'cuci', 'kering', 'setrika', 'packing', 'siap', 'selesai'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                      orderStatusFilter === status
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {status === 'all' ? 'Semua' : status}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Invoice</th>
                    <th className="p-3.5">Pelanggan</th>
                    <th className="p-3.5">Item / Layanan</th>
                    <th className="p-3.5">Total Biaya</th>
                    <th className="p-3.5">Status Alur</th>
                    <th className="p-3.5">Pembayaran</th>
                    <th className="p-3.5 text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {branchOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-cyan-300">
                        {ord.invoiceNo}
                        <div className="text-[10px] text-slate-500 font-normal">{ord.createdAt}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-400">{ord.customerPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">
                          {ord.items.map((i) => i.serviceName).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {ord.weightKg > 0 ? `${ord.weightKg} kg` : `${ord.itemCount} item`} • Parfum: {ord.perfumeName}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-white">
                        Rp {ord.finalPrice.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.currentStatus === 'selesai'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : ord.currentStatus === 'siap'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : ord.currentStatus === 'cuci'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {ord.currentStatus}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ord.paymentStatus === 'lunas'
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-rose-950 text-rose-400'
                          }`}
                        >
                          {ord.paymentStatus === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => {
                            setActiveOrderForReceipt(ord);
                            setIsReceiptOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Cetak Struk"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openWhatsAppBot(ord)}
                          className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 transition-colors"
                          title="WhatsApp Auto-Pilot Bot (e-Nota, Update Status, Reminder)"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openAiScanner(ord.id)}
                          className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-400 transition-colors"
                          title="AI Garment & Stain Scanner (Inspeksi Noda & Cacat)"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CUSTOMERS & DEPOSIT WALLET TAB */}
      {activeSubView === 'customers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white">Daftar Member & Dompet Saldo</h3>
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-glow-cyan"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Daftarkan Member Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl glass-card border border-slate-700/80 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{c.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">{c.phone}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{c.address}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                    {c.loyaltyPoints} Poin
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Saldo Deposit:</span>
                    <span className="text-base font-black font-mono text-emerald-400">
                      Rp {c.depositBalance.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setDepositModalCust(c);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600/30 hover:text-emerald-300 text-slate-300 border border-slate-700 text-xs font-bold transition-all"
                  >
                    + Top Up Saldo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Tambah Pelanggan Baru */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>Daftarkan Pelanggan Baru</span>
            </h3>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Lengkap:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Budi Nugroho"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nomor Telepon / WhatsApp:
                </label>
                <input
                  type="text"
                  required
                  placeholder="0812xxxxxxxx"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Alamat Lengkap:
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Mawar No. 10, Jakarta..."
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Deposit Awal (Opsional):
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={newCustDeposit}
                  onChange={(e) => setNewCustDeposit(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors shadow-glow-cyan"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Top Up Saldo Deposit */}
      {depositModalCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Top Up Deposit: {depositModalCust.name}</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nominal Deposit (Rp):
              </label>
              <input
                type="number"
                step="50000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
              <div className="flex gap-1.5 mt-2">
                {[50000, 100000, 200000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt)}
                    className="flex-1 py-1 rounded bg-slate-800 text-[10px] text-slate-300 font-mono hover:bg-slate-700"
                  >
                    {amt / 1000}rb
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setDepositModalCust(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  topupCustomerDeposit(depositModalCust.id, depositAmount);
                  setDepositModalCust(null);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-glow-emerald"
              >
                Konfirmasi Top Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clothes Detail & Sortir Modal */}
      {isClothesModalOpen && (
        <ClothesDetailModal
          isOpen={isClothesModalOpen}
          onClose={() => setIsClothesModalOpen(false)}
          initialClothes={cartClothesDetails}
          initialNotes={cartSortingNotes}
          orderCustomerName={selectedCustomer?.name}
          orderWeightKg={Number(totalWeight.toFixed(1))}
          onSave={(clothes, notes, totalPieces) => {
            setCartClothesDetails(clothes);
            setCartSortingNotes(notes);
            setCartTotalPieces(totalPieces);
          }}
        />
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={activeOrderForReceipt}
        branch={activeBranch}
        onOpenWhatsApp={(ord) => {
          setIsReceiptOpen(false);
          setActiveOrderForWhatsApp(ord);
          setIsWhatsAppOpen(true);
        }}
      />

      {/* WhatsApp Modal */}
      <WhatsAppSimulatorModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        order={activeOrderForWhatsApp}
        branch={activeBranch}
      />

      {/* QRIS Modal */}
      <QrisModal
        isOpen={isQrisOpen}
        onClose={() => setIsQrisOpen(false)}
        amount={finalPrice}
        invoiceNo={`LH-${activeBranch.code}-NEW`}
        onPaymentSuccess={() => {
          setIsQrisOpen(false);
          executeFinalizeOrder();
        }}
        isDeveloperTopup={false}
        outletBranch={activeBranch}
      />

      {/* Outlet QRIS Configuration Modal */}
      <OutletQrisConfigModal
        isOpen={isOutletConfigOpen}
        onClose={() => setIsOutletConfigOpen(false)}
        branchName={activeBranch.name}
      />

      {/* International Card Modal */}
      <InternationalCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        amountInIdr={finalPrice}
        invoiceNo={`LH-${activeBranch.code}-INTL`}
        onPaymentSuccess={() => {
          setIsCardModalOpen(false);
          executeFinalizeOrder();
        }}
        lang={language}
      />
    </div>
  );
};
