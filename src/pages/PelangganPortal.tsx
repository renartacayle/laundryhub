import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import {
  Sparkles,
  Wallet,
  Clock,
  Printer,
  MessageSquare,
  Bike,
  CheckCircle2,
  Gift,
  ArrowRight,
  ShieldCheck,
  Award,
  ChevronRight,
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal';
import { WhatsAppSimulatorModal } from '../components/WhatsAppSimulatorModal';
import confetti from 'canvas-confetti';

interface PelangganPortalProps {
  currentSubTab?: string;
}

export const PelangganPortal: React.FC<PelangganPortalProps> = ({ currentSubTab = 'cust-tracking' }) => {
  const {
    currentCustomer,
    setCurrentCustomer,
    customers,
    orders,
    branches,
    currentBranchId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tracking' | 'wallet' | 'history' | 'pickup'>(
    currentSubTab === 'cust-wallet'
      ? 'wallet'
      : currentSubTab === 'cust-history'
      ? 'history'
      : currentSubTab === 'cust-pickup-request'
      ? 'pickup'
      : 'tracking'
  );

  React.useEffect(() => {
    if (currentSubTab === 'cust-wallet') setActiveTab('wallet');
    else if (currentSubTab === 'cust-history') setActiveTab('history');
    else if (currentSubTab === 'cust-pickup-request') setActiveTab('pickup');
    else setActiveTab('tracking');
  }, [currentSubTab]);

  // Modal states
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<Order | null>(null);
  const [selectedOrderWhatsApp, setSelectedOrderWhatsApp] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Pickup request form state
  const [pickupAddress, setPickupAddress] = useState(currentCustomer.address);
  const [pickupNotes, setPickupNotes] = useState('');
  const [pickupSuccess, setPickupSuccess] = useState(false);

  // Orders for this customer
  const customerOrders = orders.filter((o) => o.customerId === currentCustomer.id);
  const activeOrder = customerOrders.find((o) => o.currentStatus !== 'selesai') || customerOrders[0];

  const activeBranch = branches.find((b) => b.id === currentBranchId) || branches[0];

  const workflowSteps: { id: OrderStatus; label: string; desc: string }[] = [
    { id: 'antrean', label: 'Antrean', desc: 'Diterima Kasir' },
    { id: 'cuci', label: 'Cuci', desc: 'Mesin Washer Putar' },
    { id: 'kering', label: 'Kering', desc: 'Pengering Suhu Pas' },
    { id: 'setrika', label: 'Setrika', desc: 'Uap Halus & Wangi' },
    { id: 'packing', label: 'Packing', desc: 'Quality Control' },
    { id: 'siap', label: 'Siap', desc: 'Siap Diambil/Antar' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    const list: OrderStatus[] = ['antrean', 'cuci', 'kering', 'setrika', 'packing', 'siap', 'selesai'];
    return list.indexOf(status);
  };

  const handleRequestPickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPickupSuccess(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      setPickupSuccess(false);
      setPickupNotes('');
    }, 4000);
  };

  const handleRedeemVoucher = (pointsCost: number, voucherName: string) => {
    if (currentCustomer.loyaltyPoints < pointsCost) {
      alert('Poin Anda tidak mencukupi untuk menukar voucher ini.');
      return;
    }
    alert(`Berhasil! Kode Voucher '${voucherName}' telah diklaim dan dapat digunakan di kasir.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Customer Portal Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tracking'
                ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Lacak Status Cucian</span>
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
            <span>Deposit & Poin Member</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Histori Transaksi ({customerOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pickup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pickup'
                ? 'bg-emerald-500 text-slate-950 shadow-glow-emerald'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Request Jemput Baru</span>
          </button>
        </div>

        {/* Switch demo customer */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Pilih Akun Member:</span>
          <select
            value={currentCustomer.id}
            onChange={(e) => {
              const c = customers.find((cust) => cust.id === e.target.value);
              if (c) {
                setCurrentCustomer(c);
                setPickupAddress(c.address);
              }
            }}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. TRACKING TAB */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {activeOrder ? (
            <div className="p-6 rounded-3xl glass-panel border border-emerald-500/30 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-2">
                <div>
                  <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Realtime Tracking
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">
                    No. Nota: <span className="font-mono text-emerald-300">{activeOrder.invoiceNo}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Est. Selesai: {activeOrder.estReadyDate} • Parfum: {activeOrder.perfumeName}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrderReceipt(activeOrder);
                      setIsReceiptOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Lihat Nota Digital</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrderWhatsApp(activeOrder);
                      setIsWhatsAppOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-glow-emerald"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Simulasi WA Notifikasi</span>
                  </button>
                </div>
              </div>

              {/* Progress Steps Timeline Bar */}
              <div className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {workflowSteps.map((step, idx) => {
                    const currentIdx = getStepIndex(activeOrder.currentStatus);
                    const isPassed = currentIdx >= idx;
                    const isCurrent = activeOrder.currentStatus === step.id;

                    return (
                      <div
                        key={step.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          isCurrent
                            ? 'bg-emerald-500/20 border-emerald-500 shadow-glow-emerald scale-105'
                            : isPassed
                            ? 'bg-slate-900 border-slate-700 text-slate-300'
                            : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            0{idx + 1}
                          </span>
                          {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <div className={`text-xs font-extrabold mt-2 ${isCurrent ? 'text-emerald-300' : 'text-white'}`}>
                          {step.label}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{step.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Detail Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Layanan Cucian:</span>
                  <div className="font-bold text-white mt-0.5">
                    {activeOrder.items.map((i) => i.serviceName).join(', ')}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {activeOrder.weightKg > 0 ? `${activeOrder.weightKg} kg` : `${activeOrder.itemCount} pcs`}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Status Pembayaran:</span>
                  <div className="mt-0.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        activeOrder.paymentStatus === 'lunas'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {activeOrder.paymentStatus === 'lunas' ? '✅ Lunas' : '⚠️ Belum Lunas'}
                    </span>
                  </div>
                  <div className="font-mono text-emerald-400 font-bold mt-1">
                    Rp {activeOrder.finalPrice.toLocaleString('id-ID')}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Catatan Khusus:</span>
                  <p className="text-slate-300 mt-0.5 text-[11px]">
                    {activeOrder.specialNotes || 'Tidak ada catatan khusus.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl glass-panel border border-slate-800 text-slate-400">
              Belum ada cucian aktif untuk akun member ini.
            </div>
          )}
        </div>
      )}

      {/* 2. WALLET & REWARDS TAB */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Deposit Card */}
            <div className="p-6 rounded-3xl glass-panel border border-emerald-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Dompet Saldo Deposit
                </span>
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-3xl font-black font-mono text-emerald-400">
                  Rp {currentCustomer.depositBalance.toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Dapat digunakan untuk bayar instan saat laundry tanpa perlu bawa uang tunai.
                </p>
              </div>
              <button
                onClick={() => alert('Top up saldo deposit dapat dilakukan di kasir outlet atau via transfer VA!')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-glow-emerald"
              >
                + Top Up Saldo Deposit
              </button>
            </div>

            {/* Loyalty Points Card */}
            <div className="p-6 rounded-3xl glass-panel border border-purple-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Poin Loyalitas Member
                </span>
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-3xl font-black font-mono text-purple-400">
                  {currentCustomer.loyaltyPoints} Poin
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Kumpulkan 1 Poin setiap transaksi Rp 1.000. Tukarkan dengan voucher cuci gratis!
                </p>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                Tingkat Keanggotaan: <strong className="text-white">Gold VIP LaundryHub</strong>
              </div>
            </div>
          </div>

          {/* Rewards Catalog */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-400" />
              <span>Katalog Penukaran Poin Hadiah</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Voucher Cuci Kiloan 3kg Gratis', points: 150, desc: 'Berlaku untuk paket cuci setrika' },
                { name: 'Gratis Parfum Snappy Red Premium', points: 80, desc: 'Upgrade wangi tahan 14 hari' },
                { name: 'Diskon 50% Cuci Sepatu Sneakers', points: 200, desc: 'Deep cleaning segala merk' },
              ].map((reward, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl glass-card border border-slate-700/80 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <span className="text-xs font-bold text-white block">{reward.name}</span>
                    <p className="text-[11px] text-slate-400 mt-1">{reward.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="font-mono text-purple-400 font-bold text-xs">{reward.points} Poin</span>
                    <button
                      onClick={() => handleRedeemVoucher(reward.points, reward.name)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold transition-colors"
                    >
                      Tukar Voucher
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Invoice</th>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Layanan</th>
                  <th className="p-3.5">Total Biaya</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Nota Digital</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customerOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-emerald-400">{ord.invoiceNo}</td>
                    <td className="p-3.5 text-slate-400">{ord.createdAt}</td>
                    <td className="p-3.5 text-slate-200">
                      {ord.items.map((i) => i.serviceName).join(', ')}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      Rp {ord.finalPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {ord.currentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrderReceipt(ord);
                          setIsReceiptOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs"
                      >
                        Buka Nota
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PICKUP REQUEST TAB */}
      {activeTab === 'pickup' && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-slate-700/80 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-400" />
                <span>Pesan Layanan Antar-Jemput Laundry</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kurir kami akan datang ke alamat Anda untuk mengambil pakaian kotor
              </p>
            </div>

            {pickupSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Permintaan jemput berhasil dibuat! Kurir akan menghubungi Anda dalam 15-30 menit.
                </span>
              </div>
            )}

            <form onSubmit={handleRequestPickupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nama Pemesan:</label>
                <input
                  type="text"
                  disabled
                  value={currentCustomer.name}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nomor WhatsApp:</label>
                <input
                  type="text"
                  disabled
                  value={currentCustomer.phone}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Alamat Penjemputan:</label>
                <textarea
                  rows={2}
                  required
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Catatan untuk Kurir (Perkiraan jumlah baju / patokan rumah):
                </label>
                <input
                  type="text"
                  placeholder="Misal: Sekitar 2 kantong kresek, pagar hitam sebelah warung"
                  value={pickupNotes}
                  onChange={(e) => setPickupNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-glow-emerald"
                >
                  Kirim Permintaan Jemput ke Kurir
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
        order={selectedOrderReceipt}
        branch={activeBranch}
      />

      {/* WhatsApp Modal */}
      <WhatsAppSimulatorModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        order={selectedOrderWhatsApp}
        branch={activeBranch}
      />
    </div>
  );
};
