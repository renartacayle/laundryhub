import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, Service, OrderItem } from '../types';
import {
  Store,
  Wallet,
  TrendingUp,
  Package,
  Plus,
  Clock,
  CheckCircle2,
  ArrowRight,
  Printer,
  MessageSquare,
  Scale,
  Sparkles,
  DollarSign,
  ArrowDownToLine,
  Truck,
  Bike,
  Building2,
  AlertCircle,
  X,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReceiptModal } from '../components/ReceiptModal';
import { WhatsAppSimulatorModal } from '../components/WhatsAppSimulatorModal';

interface AgenDropshipDashboardProps {
  currentSubTab?: string;
}

export const AgenDropshipDashboard: React.FC<AgenDropshipDashboardProps> = ({ currentSubTab = 'agen-pos' }) => {
  const {
    dropshipAgents,
    currentAgentId,
    setCurrentAgentId,
    currentAgent,
    orders,
    services,
    fragrances,
    createAgentDropshipOrder,
    requestAgentWithdrawal,
    withdrawalRequests,
    branches,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pos' | 'manifest' | 'wallet' | 'supplies'>('pos');

  // New Drop Point Order Form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [weightKg, setWeightKg] = useState<number>(4.0);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedPerfumeId, setSelectedPerfumeId] = useState<string>(fragrances[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris' | 'piutang'>('tunai');

  // Withdrawal modal
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(currentAgent.walletBalance);

  // Modals receipt & WA
  const [activeOrderForReceipt, setActiveOrderForReceipt] = useState<Order | null>(null);
  const [activeOrderForWhatsApp, setActiveOrderForWhatsApp] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0] || {
    id: 'srv-fallback',
    name: 'Cuci + Setrika',
    price: 9000,
    unit: 'kg',
    category: 'kiloan',
    estHours: 48,
    icon: 'Sparkles',
  };
  const selectedPerfume = fragrances.find((f) => f.id === selectedPerfumeId) || fragrances[0] || {
    id: 'fr-fallback',
    name: 'Standard Fresh',
    description: 'Aroma segar bersih',
  };
  const centralBranch = branches.find((b) => b.id === currentAgent.branchId) || branches[0];

  // Pricing & Commission calculations
  const retailPricePerKg = selectedService.price + 1000; // Drop Point markup
  const subtotalRetail = Math.round(weightKg * retailPricePerKg);
  const agentCommission = Math.round(subtotalRetail * (currentAgent.commissionPercent / 100));
  const centralWorkshopSettlement = subtotalRetail - agentCommission;

  // Filter orders created by this agent
  const agentOrders = orders.filter((o) => o.agentId === currentAgent.id);
  const pendingPickupOrders = agentOrders.filter((o) => o.currentStatus === 'antrean');
  const inWorkshopOrders = agentOrders.filter(
    (o) => o.currentStatus === 'cuci' || o.currentStatus === 'kering' || o.currentStatus === 'setrika' || o.currentStatus === 'packing'
  );
  const readyOrders = agentOrders.filter((o) => o.currentStatus === 'siap');
  const completedOrders = agentOrders.filter((o) => o.currentStatus === 'selesai');

  // Submit drop point order
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) {
      alert('Nama pelanggan dan nomor telepon wajib diisi!');
      return;
    }

    const cartItem: OrderItem = {
      id: `it-${Date.now()}`,
      serviceId: selectedService.id,
      serviceName: `${selectedService.name} (Drop Point)`,
      category: selectedService.category,
      quantity: weightKg,
      unit: selectedService.unit,
      pricePerUnit: retailPricePerKg,
      subtotal: subtotalRetail,
    };

    const estReady = new Date();
    estReady.setDate(estReady.getDate() + 2);

    const newOrder = createAgentDropshipOrder(
      {
        customerId: `cst-dp-${Date.now()}`,
        customerName: custName,
        customerPhone: custPhone,
        customerAddress: `Drop Point: ${currentAgent.name}`,
        branchId: currentAgent.branchId,
        items: [cartItem],
        weightKg,
        itemCount: 1,
        totalPrice: subtotalRetail,
        discount: 0,
        finalPrice: subtotalRetail,
        paymentMethod,
        paymentStatus: paymentMethod === 'piutang' ? 'piutang' : 'lunas',
        currentStatus: 'antrean',
        pickupDeliveryType: 'outlet',
        perfumeId: selectedPerfume.id,
        perfumeName: selectedPerfume.name,
        specialNotes: notes || `Pakaian diterima di ${currentAgent.name}`,
        estReadyDate: estReady.toISOString().replace('T', ' ').substring(0, 19),
        paidAmount: paymentMethod === 'piutang' ? 0 : subtotalRetail,
        changeAmount: 0,
      },
      currentAgent.id
    );

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });

    // Reset Form
    setCustName('');
    setCustPhone('');
    setNotes('');

    // Open receipt modal
    setActiveOrderForReceipt(newOrder);
    setIsReceiptOpen(true);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestAgentWithdrawal(currentAgent.id, withdrawAmount);
    alert(res.message);
    if (res.success) {
      setIsWithdrawOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Drop Point Profile & Agent Switcher */}
      <div className="p-5 rounded-3xl glass-panel border border-emerald-500/40 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-glow-emerald">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                Mitra Resmi Drop Point
              </span>
              <span className="text-xs text-slate-400">
                Pabrik Cuci: <strong className="text-white">{currentAgent.branchName || centralBranch.name}</strong>
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-0.5">{currentAgent.name}</h2>
            <p className="text-xs text-slate-400">{currentAgent.address} • PIC: {currentAgent.ownerName} ({currentAgent.phone})</p>
          </div>
        </div>

        {/* Demo Switcher for Dropship Agent */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Ganti Mitra Demo:</span>
          <select
            value={currentAgentId}
            onChange={(e) => setCurrentAgentId(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
          >
            {dropshipAgents.map((ag) => (
              <option key={ag.id} value={ag.id}>
                {ag.name} ({ag.ownerName} - {ag.commissionPercent}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards: Komisi & Performa Agen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wallet Balance Ready to Withdraw */}
        <div className="p-4 rounded-2xl glass-card border border-emerald-500/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Saldo Komisi Tersedia</span>
            <button
              onClick={() => {
                setWithdrawAmount(currentAgent.walletBalance);
                setIsWithdrawOpen(true);
              }}
              disabled={currentAgent.walletBalance <= 0}
              className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold transition-colors disabled:opacity-50"
            >
              Tarik Dana
            </button>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            Rp {currentAgent.walletBalance.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Bagi hasil aktif: <strong className="text-emerald-300">{currentAgent.commissionPercent}%</strong> dari tiap nota
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Earned Accumulated */}
        <div className="p-4 rounded-2xl glass-card border border-amber-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Keuntungan Bersih</span>
            <span className="text-amber-400 font-bold text-[10px]">Akumulasi</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            Rp {currentAgent.totalEarned.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Modal Rp 0, tanpa mesin cuci pribadi
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Weight Collected */}
        <div className="p-4 rounded-2xl glass-card border border-cyan-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Cucian Dikumpulkan</span>
            <span className="text-cyan-400 font-bold text-[10px]">{currentAgent.totalOrdersCount} Nota</span>
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">
            {currentAgent.totalWeightKg} kg
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Disetorkan ke {centralBranch.name}
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Status Workshop Central */}
        <div className="p-4 rounded-2xl glass-card border border-purple-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Status Alur Cucian Mitra</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-base font-extrabold text-white mt-1.5 flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-purple-400" />
            <span>Kurir Jemput Tiap Hari</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {pendingPickupOrders.length} antre jemput • {inWorkshopOrders.length} diproses pusat
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pos'
              ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Terima Cucian Pelanggan (POS Agen)</span>
        </button>
        <button
          onClick={() => setActiveTab('manifest')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'manifest'
              ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Manifest Serah Terima Workshop ({agentOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'wallet'
              ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Riwayat Komisi & Penarikan ({withdrawalRequests.filter((w) => w.agentId === currentAgent.id).length})</span>
        </button>
      </div>

      {/* 1. POS AGEN DROPSHIP TAB */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Input Pelanggan di Drop Point */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-3xl glass-panel border border-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Input Cucian Masuk di Warung / Drop Point</h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Komisi Anda: {currentAgent.commissionPercent}%
                </span>
              </div>

              <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
                {/* Customer Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Nama Pelanggan (Tetangga/Konsumen):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pak RT Hendro / Mbak Maya"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Nomor Telepon / WhatsApp:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0812xxxxxxxx"
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Pilih Layanan Cucian:</label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    {services
                      .filter((s) => s.isActive !== false)
                      .map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} — Rp {(srv.price + 1000).toLocaleString('id-ID')}/{srv.unit}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Weighing Stepper */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-cyan-400" />
                      <span>Berat Cucian Pelanggan (kg):</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setWeightKg((w) => Math.max(1.0, Number((w - 0.5).toFixed(1))))}
                        className="px-2 py-1 bg-slate-800 rounded text-slate-200"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="0.1"
                        value={weightKg}
                        onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
                        className="w-20 bg-slate-900 border border-cyan-500/50 rounded px-2 py-1 text-center font-mono font-bold text-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => setWeightKg((w) => Number((w + 0.5).toFixed(1)))}
                        className="px-2 py-1 bg-slate-800 rounded text-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[3.0, 5.0, 7.0, 10.0].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setWeightKg(preset)}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-mono ${
                          weightKg === preset
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {preset} kg
                      </button>
                    ))}
                  </div>
                </div>

                {/* Perfume & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Aroma Parfum:</label>
                    <select
                      value={selectedPerfumeId}
                      onChange={(e) => setSelectedPerfumeId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {fragrances.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Pembayaran di Agen:</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                    >
                      <option value="tunai">💵 Tunai (Diterima Langsung Agen)</option>
                      <option value="qris">📱 QRIS Digital</option>
                      <option value="piutang">⏳ Bayar Nanti (Saat Ambil)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Catatan Tambahan:</label>
                  <input
                    type="text"
                    placeholder="Misal: Baju seragam jangan luntur, ada 1 sprei motif bunga"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide uppercase shadow-glow-emerald transition-all"
                >
                  Terbitkan Nota Drop Point & Klaim Komisi
                </button>
              </form>
            </div>
          </div>

          {/* Kalkulator Bagi Hasil & Ringkasan Keuntungan Dropship */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl glass-panel border border-emerald-500/40 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Simulasi Bagi Hasil Transaksi Ini</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Harga Retail Pelanggan:</span>
                  <span className="font-mono text-white">
                    {weightKg} kg x Rp {retailPricePerKg.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-1 border-t border-slate-800">
                  <span>Total Tagihan Pelanggan:</span>
                  <span className="font-mono text-cyan-300">Rp {subtotalRetail.toLocaleString('id-ID')}</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5 mt-3">
                  <div className="flex justify-between text-emerald-300 font-bold text-sm">
                    <span>Keuntungan Agen ({currentAgent.commissionPercent}%):</span>
                    <span className="font-mono text-base text-emerald-400">
                      + Rp {agentCommission.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-200/80">
                    * Uang ini langsung masuk ke saldo dompet agen saat nota diterbitkan.
                  </p>
                </div>

                <div className="flex justify-between text-slate-400 text-[11px] pt-2">
                  <span>Setoran ke Workshop ({100 - currentAgent.commissionPercent}%):</span>
                  <span className="font-mono text-slate-300">
                    Rp {centralWorkshopSettlement.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Steps Info */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pelanggan titip baju di toko/warung Anda</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kurir workshop datang menjemput kantong cucian</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cucian bersih diantar kembali ke drop point Anda</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MANIFEST SERAH TERIMA & WORKSHOP TRACKING TAB */}
      {activeTab === 'manifest' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-card border border-slate-700/80 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">Manifest Kantong Cucian Drop Point</h3>
              <p className="text-xs text-slate-400">
                Pantau cucian yang sedang menunggu jemputan kurir, sedang dicuci di workshop pusat, atau siap diambil
              </p>
            </div>
            <button
              onClick={() => {
                alert(`Sinyal Penjemputan Terkirim! Kurir ${centralBranch.name} telah menerima notifikasi untuk menjemput ${pendingPickupOrders.length} kantong cucian di ${currentAgent.name}.`);
              }}
              disabled={pendingPickupOrders.length === 0}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors shadow-glow-violet disabled:opacity-40"
            >
              Request Jemput Kurir Workshop ({pendingPickupOrders.length} Kantong)
            </button>
          </div>

          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">No. Nota</th>
                  <th className="p-3.5">Pelanggan</th>
                  <th className="p-3.5">Berat</th>
                  <th className="p-3.5">Total Bayar</th>
                  <th className="p-3.5">Komisi Agen</th>
                  <th className="p-3.5">Status Alur Pusat</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {agentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-sans italic">
                      Belum ada cucian drop point tercatat.
                    </td>
                  </tr>
                ) : (
                  agentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-emerald-400">{ord.invoiceNo}</td>
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-white">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-400">{ord.customerPhone}</div>
                      </td>
                      <td className="p-3.5 text-cyan-300 font-bold">{ord.weightKg} kg</td>
                      <td className="p-3.5 text-white">Rp {ord.finalPrice.toLocaleString('id-ID')}</td>
                      <td className="p-3.5 text-emerald-400 font-bold">
                        + Rp {(ord.agentCommission || Math.round(ord.finalPrice * 0.25)).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans ${
                            ord.currentStatus === 'antrean'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : ord.currentStatus === 'siap'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : ord.currentStatus === 'selesai'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {ord.currentStatus === 'antrean' ? 'Menunggu Kurir' : ord.currentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1 font-sans">
                        <button
                          onClick={() => {
                            setActiveOrderForReceipt(ord);
                            setIsReceiptOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                          title="Nota"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setActiveOrderForWhatsApp(ord);
                            setIsWhatsAppOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400"
                          title="WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. RIWAYAT KOMISI & PENARIKAN TAB */}
      {activeTab === 'wallet' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bank Account Info Card */}
            <div className="p-5 rounded-2xl glass-panel border border-slate-700 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Rekening Pencairan Agen:
              </h4>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{currentAgent.bankAccount.bank}</div>
                  <div className="text-base font-mono font-black text-emerald-400">
                    {currentAgent.bankAccount.accountNumber}
                  </div>
                  <div className="text-xs text-slate-400">a/n {currentAgent.bankAccount.accountName}</div>
                </div>
              </div>
            </div>

            {/* Quick Withdraw Card */}
            <div className="p-5 rounded-2xl glass-panel border border-emerald-500/40 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs text-slate-400">Saldo Tersedia:</span>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  Rp {currentAgent.walletBalance.toLocaleString('id-ID')}
                </div>
              </div>
              <button
                onClick={() => {
                  setWithdrawAmount(currentAgent.walletBalance);
                  setIsWithdrawOpen(true);
                }}
                disabled={currentAgent.walletBalance <= 0}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow-emerald disabled:opacity-40"
              >
                Tarik Saldo ke Rekening Bank Sekarang
              </button>
            </div>
          </div>

          {/* Withdrawal Requests Table */}
          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-sm text-white">
              Riwayat Pengajuan Penarikan Dana
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Waktu Pengajuan</th>
                  <th className="p-3.5">Nominal</th>
                  <th className="p-3.5">Tujuan Bank</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Waktu Ditransfer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {withdrawalRequests
                  .filter((w) => w.agentId === currentAgent.id)
                  .map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/40">
                      <td className="p-3.5 text-slate-300">{w.requestedAt}</td>
                      <td className="p-3.5 font-bold text-emerald-400">
                        Rp {w.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3.5 text-slate-200">
                        {w.bank} - {w.accountNumber} ({w.accountName})
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-sans ${
                            w.status === 'transferred'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {w.status === 'transferred' ? 'Sudah Ditransfer' : 'Menunggu Transfer Owner'}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{w.processedAt || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Tarik Dana Komisi */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                <span>Tarik Komisi Agen</span>
              </h3>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Tujuan Transfer:</label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-white font-semibold">
                  {currentAgent.bankAccount.bank} — {currentAgent.bankAccount.accountNumber}
                  <div className="text-[11px] text-slate-400">a/n {currentAgent.bankAccount.accountName}</div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nominal Penarikan (Rp):</label>
                <input
                  type="number"
                  min="50000"
                  max={currentAgent.walletBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-base focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Maksimal saldo: Rp {currentAgent.walletBalance.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-glow-emerald"
                >
                  Konfirmasi Tarik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={activeOrderForReceipt}
        branch={centralBranch}
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
        branch={centralBranch}
      />
    </div>
  );
};
