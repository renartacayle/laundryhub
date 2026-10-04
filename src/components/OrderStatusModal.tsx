import React, { useState, useEffect } from 'react';
import {
  Order,
  OrderStatus,
  ClothesItem,
  StationCommissionRates,
} from '../types';
import {
  X,
  CheckCircle2,
  Clock,
  QrCode,
  Copy,
  Check,
  Share2,
  Camera,
  Upload,
  User,
  ShieldCheck,
  Crown,
  Monitor,
  UserCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  DollarSign,
  Layers,
  ArrowRight,
  Eye,
  CreditCard,
  MessageSquare,
  Phone,
  Search,
  Star,
  Flame,
  Coins,
  Award,
  Navigation,
  Bot,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';
import { QrisModal } from './QrisModal';
import { DopamineJackpotModal } from './DopamineJackpotModal';
import { GeofenceRadarMap } from './GeofenceRadarMap';
import confetti from 'canvas-confetti';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export type TrackingViewMode = 'guest' | 'pekerja' | 'owner';

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const {
    currentUser,
    currentRole,
    stationRates,
    claimStationTask,
    completeStationTask,
    branches,
    currency,
    language,
    orders,
    openTrackingModal,
    openWhatsAppBot,
    openAiScanner,
    triggerGamification,
    gamificationSettings,
  } = useApp();

  // If order was updated in context, get latest version
  const currentOrder = orders.find((o) => o.id === order?.id) || order;

  // View Mode: Guest (Customer), Pekerja (Staff Action), Owner (Audit & Commissions)
  const [viewMode, setViewMode] = useState<TrackingViewMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('nota') || params.has('invoice')) {
        return 'guest';
      }
    }
    if (currentRole === 'pelanggan') return 'guest';
    if (currentRole === 'owner') return 'owner';
    if (['kasir', 'produksi', 'operator'].includes(currentRole)) return 'pekerja';
    return 'guest';
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
  const [isJackpotModalOpen, setIsJackpotModalOpen] = useState(false);
  const [showPhoneLookup, setShowPhoneLookup] = useState(false);
  const [lookupPhone, setLookupPhone] = useState('');
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<{
    url: string;
    title: string;
    picName: string;
    time: string;
  } | null>(null);

  // Worker Action State
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [targetActionStation, setTargetActionStation] = useState<OrderStatus>('sortir');
  const [photoProof, setPhotoProof] = useState<string>('');
  const [workerNotes, setWorkerNotes] = useState<string>('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string>('');

  // Editable clothes details for Sortir station
  const [tempClothesDetails, setTempClothesDetails] = useState<ClothesItem[]>([]);
  const [tempSortingNotes, setTempSortingNotes] = useState<string>('');

  const trackingUrl = typeof window !== 'undefined' && currentOrder
    ? `${window.location.origin}/?nota=${currentOrder.invoiceNo}`
    : '';

  // Generate QR Code on mount/order change
  useEffect(() => {
    if (!currentOrder || !trackingUrl) return;

    QRCode.toDataURL(trackingUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [currentOrder?.invoiceNo, trackingUrl]);

  // Sync initial clothes details
  useEffect(() => {
    if (currentOrder) {
      setTempClothesDetails(currentOrder.clothesDetails || [
        { id: 'c-1', name: 'Baju / Kaos / Kemeja', quantity: 5 },
        { id: 'c-2', name: 'Celana Panjang / Jeans', quantity: 3 },
        { id: 'c-3', name: 'Pakaian Dalam', quantity: 4 },
      ]);
      setTempSortingNotes(currentOrder.sortingNotes || '');
    }
  }, [currentOrder?.id]);

  if (!isOpen || !currentOrder) return null;

  const branch = branches.find((b) => b.id === currentOrder.branchId) || branches[0];

  const workflowSteps: { id: OrderStatus; label: string; desc: string }[] = [
    { id: 'antrean', label: 'Antrean', desc: 'Diterima di Kasir' },
    { id: 'sortir', label: 'Sortir', desc: 'Hitung Helai & Cek Noda' },
    { id: 'cuci', label: 'Cuci', desc: 'Proses Mesin Cuci' },
    { id: 'kering', label: 'Kering', desc: 'Pengeringan Tumble Dryer' },
    { id: 'setrika', label: 'Setrika', desc: 'Setrika Uap & Pewangi' },
    { id: 'packing', label: 'Packing', desc: 'QC & Bungkus Segel' },
    { id: 'siap', label: 'Siap', desc: 'Siap Diambil / Diantar' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    const list: OrderStatus[] = ['antrean', 'sortir', 'cuci', 'kering', 'setrika', 'packing', 'siap', 'selesai'];
    return list.indexOf(status);
  };

  const currentStepIdx = getStepIndex(currentOrder.currentStatus);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleOpenWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Halo Kak ${currentOrder.customerName}! 🧺\nBerikut link live tracking status cucian Anda di ${branch.name} (No. Nota: ${currentOrder.invoiceNo}):\n\n🔗 ${trackingUrl}\n\nStatus saat ini: ${currentOrder.currentStatus.toUpperCase()}\nTerima kasih!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Sample photo proof presets for quick testing
  const samplePhotoPresets: { label: string; url: string }[] = [
    {
      label: 'Foto Sortir & Pakaian',
      url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Foto Mesin Cuci',
      url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Foto Setrika Rapi',
      url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=600&q=80',
    },
    {
      label: 'Foto Packing Segel',
      url: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // Open worker station action form
  const handleOpenWorkerAction = (station: OrderStatus) => {
    setTargetActionStation(station);
    // Pre-fill preset based on station
    if (station === 'sortir') setPhotoProof(samplePhotoPresets[0].url);
    else if (station === 'cuci' || station === 'kering') setPhotoProof(samplePhotoPresets[1].url);
    else if (station === 'setrika') setPhotoProof(samplePhotoPresets[2].url);
    else if (station === 'packing') setPhotoProof(samplePhotoPresets[3].url);
    else setPhotoProof(samplePhotoPresets[3].url);

    setIsActionModalOpen(true);
  };

  const handleClaimStation = (station: OrderStatus) => {
    claimStationTask(currentOrder.id, station, currentUser);
    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const handleExecuteWorkerCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoProof) {
      alert('Wajib menyertakan foto bukti pengerjaan stasiun!');
      return;
    }

    const res = completeStationTask(
      currentOrder.id,
      targetActionStation,
      currentUser,
      photoProof,
      workerNotes,
      targetActionStation === 'sortir' ? tempClothesDetails : undefined,
      targetActionStation === 'sortir' ? tempSortingNotes : undefined
    );

    if (res.success) {
      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      setActionSuccessMessage(res.message);
      setIsActionModalOpen(false);
      setWorkerNotes('');
      setTimeout(() => setActionSuccessMessage(''), 4000);
    } else {
      alert(res.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-4 animate-in zoom-in-95 duration-200">
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-700 bg-slate-800/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-md font-bold shrink-0">
                <QrCode className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-100">
                    Live Tracking & Status Nota
                  </h2>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    {currentOrder.invoiceNo}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>{branch.name}</span>
                  <span>•</span>
                  <span>{currentOrder.customerName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openWhatsAppBot(currentOrder)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Kirim Nota & Update Status via WhatsApp Auto-Pilot Bot"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp Bot</span>
              </button>

              <button
                type="button"
                onClick={() => openAiScanner(currentOrder.id)}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="AI Garment & Stain Scanner (Inspeksi Noda & Cacat)"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span className="hidden sm:inline">AI Scanner</span>
              </button>

              {gamificationSettings.isEnabled && (
                <button
                  type="button"
                  onClick={() =>
                    triggerGamification({
                      orderId: currentOrder.id,
                      customerName: currentOrder.customerName,
                      finalPrice: currentOrder.finalPrice,
                    })
                  }
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-sm"
                  title="Putar Roda Keberuntungan / Gosok Kartu Hadiah"
                >
                  <span>🎡</span>
                  <span className="hidden sm:inline">Lucky Spin</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 3-Role View Mode Switcher Pill */}
          <div className="px-4 sm:px-5 py-2.5 bg-slate-800/40 border-b border-slate-700/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-bold mr-1 hidden sm:inline">Lihat Sebagai:</span>
              <button
                id="mode-btn-guest"
                type="button"
                onClick={() => setViewMode('guest')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'guest'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Tampilan Pelanggan Publik / Tamu (Tanpa Login)"
              >
                <UserCircle2 className="w-3.5 h-3.5" />
                <span>Pelanggan (Publik)</span>
              </button>

              <button
                id="mode-btn-pekerja"
                type="button"
                onClick={() => setViewMode('pekerja')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'pekerja'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Tampilan Pekerja: Cek & Kerjakan Stasiun"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Pekerja (Kerjakan)</span>
              </button>

              <button
                id="mode-btn-owner"
                type="button"
                onClick={() => setViewMode('owner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'owner'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title="Tampilan Owner: Audit Siapa yang Ngerjain & Komisi"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Owner (Audit Staf)</span>
              </button>
            </div>

            {/* Quick Share, Copy & Phone Lookup Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowPhoneLookup(!showPhoneLookup)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                  showPhoneLookup
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Lupa Nomor Nota? Cek via Nomor WhatsApp"
              >
                <Phone className="w-3 h-3 text-teal-400" />
                <span>Cek via No WA</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                title="Salin Link Tracking Langsung"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                <span>{isCopied ? 'Tersalin!' : 'Salin Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenWhatsAppShare}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
                title="Bagikan ke WhatsApp"
              >
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                <span>Kirim WA</span>
              </button>
            </div>
          </div>

          {/* Collapsible Phone Lookup Panel */}
          {showPhoneLookup && (
            <div className="p-4 bg-slate-900 border-b border-teal-500/30 text-slate-200 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  Cari Semua Nota Laundry Berdasarkan Nomor WhatsApp Pelanggan:
                </span>
                <button
                  onClick={() => setShowPhoneLookup(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Tutup
                </button>
              </div>

              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ketik nomor WhatsApp pelanggan (misal: 0812 atau nama)..."
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {lookupPhone.trim().length >= 3 && (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {orders
                    .filter(
                      (o) =>
                        o.customerPhone.replace(/[^0-9]/g, '').includes(lookupPhone.replace(/[^0-9]/g, '')) ||
                        o.customerName.toLowerCase().includes(lookupPhone.toLowerCase())
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          openTrackingModal(item.invoiceNo);
                          setShowPhoneLookup(false);
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          item.invoiceNo === currentOrder.invoiceNo
                            ? 'bg-teal-950/60 border-teal-500/50'
                            : 'bg-slate-800/80 border-slate-700 hover:border-teal-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-teal-300">
                            {item.invoiceNo}
                          </span>
                          <span className="text-xs text-slate-300">({item.customerName})</span>
                          <span className="text-[11px] text-slate-400">{item.weightKg} kg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-200">
                            {item.currentStatus}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  {orders.filter(
                    (o) =>
                      o.customerPhone.replace(/[^0-9]/g, '').includes(lookupPhone.replace(/[^0-9]/g, '')) ||
                      o.customerName.toLowerCase().includes(lookupPhone.toLowerCase())
                  ).length === 0 && (
                    <p className="text-xs text-slate-400 py-1 text-center">
                      Tidak ditemukan pesanan dengan nomor telepon tersebut.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Feedback Toast if any */}
          {actionSuccessMessage && (
            <div className="p-3 bg-emerald-950/70 border-b border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
          )}

          {/* Main Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
            {/* Top Overview Card with Scannable QR Code */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                    Status Pengerjaan Saat Ini:
                  </span>
                  <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {currentOrder.currentStatus}
                  </span>
                </div>

                <div className="text-xl sm:text-2xl font-black text-slate-100">
                  {currentOrder.items[0]?.serviceName || 'Laundry Kiloan'} • {currentOrder.weightKg > 0 ? `${currentOrder.weightKg} kg` : `${currentOrder.itemCount} pcs`}
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Est. Selesai: <strong className="text-slate-200">{new Date(currentOrder.estReadyDate).toLocaleString('id-ID')}</strong></span>
                  </div>
                  <div>Parfum: <strong className="text-purple-400">{currentOrder.perfumeName}</strong></div>
                </div>

                {/* Payment Badge & QRIS CTA */}
                <div className="pt-1 flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase ${
                      currentOrder.paymentStatus === 'lunas'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {currentOrder.paymentStatus === 'lunas' ? '✓ LUNAS' : 'BELUM LUNAS'}
                  </span>
                  <span className="text-sm font-black text-slate-100">
                    Rp {currentOrder.finalPrice.toLocaleString('id-ID')}
                  </span>

                  {currentOrder.paymentStatus !== 'lunas' && (
                    <button
                      type="button"
                      onClick={() => setIsQrisModalOpen(true)}
                      className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Bayar via QRIS</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Scannable QR Code Box */}
              <div className="p-3 bg-white rounded-2xl border border-slate-700 shadow-md flex flex-col items-center shrink-0">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code Tracking ${currentOrder.invoiceNo}`}
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                    Generating QR...
                  </div>
                )}
                <div className="text-[10px] font-mono font-bold text-slate-800 mt-1">
                  Scan Live Tracking
                </div>
                <div className="text-[9px] text-slate-500">Kamera HP / QR Scanner</div>
              </div>
            </div>

            {/* 7-STAGES TIMELINE STEPPER */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Alur 7 Tahapan Pengerjaan Cucian:
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  Tahap {Math.min(currentStepIdx + 1, 7)} dari 7
                </span>
              </div>

              {/* Horizontal Stepper Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {workflowSteps.map((step, idx) => {
                  const isCompleted = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;
                  const isPending = currentStepIdx < idx;
                  const ts = currentOrder.statusTimestamps?.[step.id];

                  return (
                    <div
                      key={step.id}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/20'
                          : isCompleted
                          ? 'bg-slate-800/80 border-slate-700'
                          : 'bg-slate-900/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            0{idx + 1}
                          </span>
                          {isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-600" />
                          )}
                        </div>

                        <div className="font-extrabold text-xs text-slate-100 leading-tight">
                          {step.label}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                          {step.desc}
                        </div>
                      </div>

                      {/* Info & Photo Thumbnail if Completed */}
                      <div className="mt-2 pt-1.5 border-t border-slate-700/50 text-[9px] space-y-0.5">
                        {ts?.picName && (
                          <div className="text-slate-300 truncate">
                            👤 {ts.picName}
                          </div>
                        )}
                        {ts?.time && (
                          <div className="text-slate-400 font-mono text-[8px]">
                            {ts.time.split(' ')[1] || ts.time}
                          </div>
                        )}
                        {ts?.photoProof && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPhotoPreview({
                                url: ts.photoProof!,
                                title: `Foto Validasi ${step.label}`,
                                picName: ts.picName || 'Operator',
                                time: ts.time,
                              })
                            }
                            className="mt-1 flex items-center gap-1 text-[8px] font-bold text-cyan-400 hover:underline"
                          >
                            <Camera className="w-2.5 h-2.5" />
                            <span>Lihat Foto</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =======================================================================
                VIEW MODE 1: GUEST / CUSTOMER PUBLIC VIEW (DEFAULT)
                ======================================================================= */}
            {viewMode === 'guest' && (
              <div className="space-y-4">
                {/* AI Garment & Stain Inspection Summary */}
                {currentOrder.aiInspection && (
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        Hasil Inspeksi Kamera AI (Garment & Stain Scanner)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                        {currentOrder.aiInspection.garmentType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">
                      ⚠️ <strong>Disclaimer Resmi:</strong> {currentOrder.aiInspection.disclaimerNote}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentOrder.aiInspection.stains.map((stain) => (
                        <span
                          key={stain.id}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-indigo-500/30 text-[11px] text-slate-200"
                        >
                          🔍 {stain.label} ({Math.round(stain.confidence * 100)}% akurasi)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Visual Live Radar Map (Geofence Outlet / Courier Route) */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-cyan-400" />
                      Live Radar Geofence GPS & Tracking Kurir:
                    </span>
                    <span className="text-[11px] text-cyan-400 font-mono font-bold">
                      {currentOrder.pickupDeliveryType === 'delivery'
                        ? 'Pengantaran Kurir Express 🛵'
                        : 'Lokasi Outlet Geofence 50m 📍'}
                    </span>
                  </div>
                  <GeofenceRadarMap
                    outletName={branch.name}
                    outletLat={-6.260718}
                    outletLng={106.815610}
                    distanceMeters={12}
                    mode={currentOrder.pickupDeliveryType === 'delivery' ? 'courier' : 'geofence'}
                    courierDestinationName={currentOrder.customerAddress || 'Alamat Pelanggan'}
                    courierEtaMinutes={12}
                  />
                </div>

                {/* Rincian Pakaian Terdata */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                      Rincian Helai Pakaian Pelanggan:
                    </span>
                    <span className="text-xs font-bold text-cyan-400">
                      Total: {currentOrder.totalPieces || currentOrder.clothesDetails?.reduce((a, b) => a + (b.quantity || 0), 0) || 0} Helai
                    </span>
                  </div>

                  {currentOrder.clothesDetails && currentOrder.clothesDetails.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {currentOrder.clothesDetails.map((item) => (
                        <div key={item.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 flex justify-between items-center">
                          <span className="text-slate-300 font-medium truncate">{item.name}</span>
                          <span className="font-bold text-slate-100 bg-slate-800 px-2 py-0.5 rounded ml-2">
                            {item.quantity} pcs
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Cucian sedang dalam antrean atau belum masuk stasiun sortir untuk pencatatan helai.
                    </p>
                  )}

                  {currentOrder.sortingNotes && (
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
                      <strong>Catatan Staf Sortir:</strong> {currentOrder.sortingNotes}
                    </div>
                  )}
                </div>

                {/* Galeri Foto Bukti Cucian untuk Pelanggan */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Foto Bukti Validasi Pengerjaan:
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(currentOrder.statusTimestamps || {})
                      .filter(([_, ts]) => ts?.photoProof)
                      .map(([stationKey, ts]) => (
                        <div
                          key={stationKey}
                          onClick={() =>
                            setSelectedPhotoPreview({
                              url: ts!.photoProof!,
                              title: `Stasiun ${stationKey.toUpperCase()}`,
                              picName: ts!.picName || 'Operator',
                              time: ts!.time,
                            })
                          }
                          className="cursor-pointer group relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 aspect-video hover:border-cyan-400 transition-colors"
                        >
                          <img
                            src={ts!.photoProof}
                            alt={`Bukti ${stationKey}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                            <span className="text-[10px] font-bold uppercase">{stationKey}</span>
                            <span className="text-[8px] text-slate-300 font-mono truncate">{ts!.picName}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {Object.values(currentOrder.statusTimestamps || {}).filter((ts) => ts?.photoProof).length === 0 && (
                    <p className="text-xs text-slate-400">
                      Foto bukti pengerjaan akan otomatis muncul di sini setelah stasiun sortir atau packing selesai dikerjakan staf.
                    </p>
                  )}
                </div>

                {/* Dopamine Feedback & Rating Section */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-yellow-950/20 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-400" />
                      Ulasan & Kepuasan Pelanggan (Dopamine Rewards)
                    </span>
                    <button
                      onClick={() => setIsJackpotModalOpen(true)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{currentOrder.customerReview ? 'Edit / Putar Lagi Ulasan' : 'Beri Ulasan Bintang 5!'}</span>
                    </button>
                  </div>

                  {currentOrder.customerReview ? (
                    <div className="p-3.5 bg-slate-900/90 rounded-xl border border-amber-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= currentOrder.customerReview!.rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-amber-300 ml-1.5">
                            {currentOrder.customerReview.rating}.0 / 5.0
                          </span>
                        </div>
                        {currentOrder.customerReview.staffTipAmount && currentOrder.customerReview.staffTipAmount > 0 && (
                          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Coins className="w-3 h-3 text-emerald-400" />
                            Tip Staf: Rp {currentOrder.customerReview.staffTipAmount.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>

                      {currentOrder.customerReview.feedbackText && (
                        <p className="text-xs text-slate-200 italic">
                          "{currentOrder.customerReview.feedbackText}"
                        </p>
                      )}

                      {currentOrder.customerReview.tags && currentOrder.customerReview.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {currentOrder.customerReview.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-200 border border-amber-500/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/80 flex items-center justify-between">
                      <div className="text-xs text-slate-300">
                        <p className="font-semibold text-slate-100">Puas dengan hasil cucian Anda?</p>
                        <p className="text-[11px] text-slate-400">Putar roda jackpot dopamine & beri apresiasi tip ke staf operasional!</p>
                      </div>
                      <button
                        onClick={() => setIsJackpotModalOpen(true)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all shrink-0 ml-3"
                      >
                        Beri Nilai ⭐
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =======================================================================
                VIEW MODE 2: PEKERJA / KARYAWAN VIEW (ACTION & CLAIMS)
                ======================================================================= */}
            {viewMode === 'pekerja' && (
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-300">
                      Panel Aksi Pengerjaan Staf (Karyawan)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    Login Staf: <strong className="text-slate-200">{currentUser.name} ({currentUser.role.toUpperCase()})</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Staf di cabang ini dapat langsung mengklaim atau menyelesaikan tahapan cucian berikut untuk mendapatkan komisi borongan.
                </p>

                {/* Stasiun yang Siap Dikerjakan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(['sortir', 'cuci', 'kering', 'setrika', 'packing'] as OrderStatus[]).map((st) => {
                    const isPassed = currentStepIdx > getStepIndex(st);
                    const isCurrent = currentOrder.currentStatus === st;
                    const claim = currentOrder.currentClaim?.station === st ? currentOrder.currentClaim : null;
                    const rate = stationRates[st as keyof StationCommissionRates] || 200;
                    const estCommission = currentOrder.weightKg > 0
                      ? Math.round(currentOrder.weightKg * rate)
                      : Math.round(currentOrder.itemCount * rate * 1.5);

                    return (
                      <div
                        key={st}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/20 shadow-md'
                            : isPassed
                            ? 'bg-slate-900/60 border-slate-700 opacity-70'
                            : 'bg-slate-900/40 border-slate-800 opacity-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-extrabold uppercase text-slate-100">
                              Stasiun {st}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              +Rp {estCommission.toLocaleString('id-ID')}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 mt-1">
                            {isPassed ? (
                              <span className="text-emerald-400 font-semibold">✓ Selesai dikerjakan</span>
                            ) : isCurrent ? (
                              claim ? (
                                <span className="text-amber-400 font-semibold">
                                  Sedang dikerjakan oleh: {claim.workerName}
                                </span>
                              ) : (
                                <span className="text-cyan-400 font-semibold">
                                  ⚡ Siap dikerjakan staf!
                                </span>
                              )
                            ) : (
                              <span>Menunggu antrean stasiun sebelumnya</span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons for Current Station */}
                        {isCurrent && (
                          <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1.5">
                            {!claim && (
                              <button
                                type="button"
                                onClick={() => handleClaimStation(st)}
                                className="w-full py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                              >
                                ✋ Ambil Stasiun Ini
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenWorkerAction(st)}
                              className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:opacity-95 shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Upload Bukti & Selesaikan</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =======================================================================
                VIEW MODE 3: OWNER AUDIT & ACCOUNTABILITY MATRIX
                ======================================================================= */}
            {viewMode === 'owner' && (
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Matriks Pertanggungjawaban Staf & Laba Owner
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    Audit Eksekutif
                  </span>
                </div>

                {/* Owner Financial Margin Box for this Order */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center">
                    <div className="text-xs text-slate-400 font-bold">Total Nilai Nota</div>
                    <div className="text-lg font-black text-slate-100 mt-1">
                      Rp {currentOrder.finalPrice.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-center">
                    <div className="text-xs text-slate-400 font-bold">Total Komisi Staf Dibayar</div>
                    <div className="text-lg font-black text-cyan-400 mt-1">
                      Rp {Object.values(currentOrder.statusTimestamps || {})
                        .reduce((sum, ts) => sum + (ts?.commissionEarned || 0), 0)
                        .toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-center">
                    <div className="text-xs text-emerald-400 font-bold">Estimasi Laba Bersih Owner</div>
                    <div className="text-lg font-black text-emerald-300 mt-1">
                      Rp {(currentOrder.finalPrice - Object.values(currentOrder.statusTimestamps || {}).reduce((s, ts) => s + (ts?.commissionEarned || 0), 0)).toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Detail Siapa yang Mengerjakan Setiap Stasiun */}
                <div className="space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-200">
                    Rekam Jejak Pengerjaan Staf per Stasiun:
                  </div>

                  <div className="space-y-2">
                    {workflowSteps.map((step) => {
                      const ts = currentOrder.statusTimestamps?.[step.id];

                      return (
                        <div
                          key={step.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                              {workflowSteps.findIndex((s) => s.id === step.id) + 1}
                            </span>
                            <div>
                              <div className="font-extrabold text-slate-100 uppercase">
                                Stasiun {step.label}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {ts?.time ? ts.time : 'Belum selesai'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            {ts?.picName ? (
                              <div className="text-left sm:text-right">
                                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                                  <User className="w-3 h-3 text-cyan-400" />
                                  <span>{ts.picName}</span>
                                </div>
                                <div className="text-[10px] text-emerald-400 font-mono">
                                  Komisi: +Rp {(ts.commissionEarned || 0).toLocaleString('id-ID')}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-500 italic">Belum dikerjakan</span>
                            )}

                            {ts?.photoProof && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedPhotoPreview({
                                    url: ts.photoProof!,
                                    title: `Validasi Staf: ${step.label} (${ts.picName})`,
                                    picName: ts.picName || 'Operator',
                                    time: ts.time,
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-[10px] border border-slate-700 shrink-0"
                              >
                                Foto Bukti
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Bottom Footer */}
          <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-400 text-center sm:text-left">
              Status nota ini dapat diakses publik oleh pelanggan melalui link QR code di struk.
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Worker Station Action & Photo Proof Modal */}
      {isActionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <h3 className="font-extrabold text-sm text-slate-100 uppercase">
                  Selesaikan Stasiun {targetActionStation}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsActionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteWorkerCompletion} className="space-y-4">
              {/* Photo Proof Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">
                  Foto Bukti Pengerjaan (Wajib):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {samplePhotoPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoProof(preset.url)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 text-xs transition-colors ${
                        photoProof === preset.url
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      <span className="text-[11px] font-medium leading-tight truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>

                {photoProof && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-700 relative aspect-video max-h-36">
                    <img src={photoProof} alt="Preview Bukti" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-2 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                      Foto Terpilih ✓
                    </span>
                  </div>
                )}
              </div>

              {/* Special Editing for Sortir Station */}
              {targetActionStation === 'sortir' && (
                <div className="space-y-2 p-3 rounded-xl bg-slate-800 border border-slate-700">
                  <label className="text-xs font-bold text-slate-200">
                    Jumlah Helai Pakaian per Jenis:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {tempClothesDetails.map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-700">
                        <span className="text-slate-300 truncate text-[11px]">{item.name}</span>
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setTempClothesDetails((prev) =>
                              prev.map((c, i) => (i === idx ? { ...c, quantity: val } : c))
                            );
                          }}
                          className="w-12 bg-slate-800 text-white font-bold text-center py-0.5 rounded border border-slate-600 ml-1 text-xs"
                        />
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Catatan noda / luntur / kancing rusak..."
                    value={tempSortingNotes}
                    onChange={(e) => setTempSortingNotes(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 mt-1"
                  />
                </div>
              )}

              {/* Station Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200">
                  Catatan Tambahan Pekerja:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dicuci dengan ekstra softener, suhu 40C..."
                  value={workerNotes}
                  onChange={(e) => setWorkerNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsActionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:opacity-95 shadow-md active:scale-95"
                >
                  Simpan & Dapatkan Komisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Photo Preview Modal */}
      {selectedPhotoPreview && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-3 p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700 text-xs">
              <div>
                <h4 className="font-extrabold text-slate-100">{selectedPhotoPreview.title}</h4>
                <p className="text-[10px] text-slate-400">
                  Diunggah oleh: {selectedPhotoPreview.picName} ({selectedPhotoPreview.time})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-700 aspect-video bg-black flex items-center justify-center">
              <img
                src={selectedPhotoPreview.url}
                alt={selectedPhotoPreview.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Integrated QRIS Payment Modal for Customers */}
      {isQrisModalOpen && (
        <QrisModal
          isOpen={isQrisModalOpen}
          onClose={() => setIsQrisModalOpen(false)}
          amount={currentOrder.finalPrice}
          invoiceNo={currentOrder.invoiceNo}
          outletBranch={branches.find((b) => b.id === currentOrder.branchId)}
          onPaymentSuccess={() => {
            setIsQrisModalOpen(false);
            try {
              confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
            } catch {
              // ignore
            }
          }}
        />
      )}

      {/* Dopamine Jackpot Slot Modal */}
      {isJackpotModalOpen && (
        <DopamineJackpotModal
          isOpen={isJackpotModalOpen}
          onClose={() => setIsJackpotModalOpen(false)}
          order={currentOrder}
        />
      )}
    </>
  );
};
