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
  Camera,
  X,
  ClipboardCheck,
  AlertTriangle,
  QrCode,
  Download,
} from 'lucide-react';
import { ReceiptModal } from '../components/ReceiptModal';
import { WhatsAppSimulatorModal } from '../components/WhatsAppSimulatorModal';
import { formatCurrency } from '../utils/currency';
import { downloadReceiptPdf } from '../utils/pdfReceipt';
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
    language,
    currency,
    t,
    openTrackingModal,
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
  const [customerPhotoView, setCustomerPhotoView] = useState<{
    url: string;
    stepName: string;
    picName: string;
    time: string;
    notes?: string;
  } | null>(null);

  // Pickup request form state
  const [pickupAddress, setPickupAddress] = useState(currentCustomer.address);
  const [pickupNotes, setPickupNotes] = useState('');
  const [pickupSuccess, setPickupSuccess] = useState(false);

  // Orders for this customer
  const customerOrders = orders.filter((o) => o.customerId === currentCustomer.id);
  const activeOrder = customerOrders.find((o) => o.currentStatus !== 'selesai') || customerOrders[0];

  const activeBranch = branches.find((b) => b.id === currentBranchId) || branches[0];

  const workflowSteps: { id: OrderStatus; label: string; desc: string }[] = language === 'en'
    ? [
        { id: 'antrean', label: 'Queued', desc: 'Received at Counter' },
        { id: 'sortir', label: 'Sorting', desc: 'Item Counting & Defect Check' },
        { id: 'cuci', label: 'Washing', desc: 'Washer Machine Cycle' },
        { id: 'kering', label: 'Drying', desc: 'Tumble Dryer Cycle' },
        { id: 'setrika', label: 'Ironing', desc: 'Steam Press & Scent' },
        { id: 'packing', label: 'Packing', desc: 'Quality Check' },
        { id: 'siap', label: 'Ready', desc: 'Ready for Pickup / Delivery' },
      ]
    : [
        { id: 'antrean', label: 'Antrean', desc: 'Diterima Kasir' },
        { id: 'sortir', label: 'Sortir', desc: 'Hitung Pcs & Cek Noda' },
        { id: 'cuci', label: 'Cuci', desc: 'Mesin Washer Putar' },
        { id: 'kering', label: 'Kering', desc: 'Pengering Suhu Pas' },
        { id: 'setrika', label: 'Setrika', desc: 'Uap Halus & Wangi' },
        { id: 'packing', label: 'Packing', desc: 'Quality Control' },
        { id: 'siap', label: 'Siap', desc: 'Siap Diambil/Antar' },
      ];

  const getStepIndex = (status: OrderStatus) => {
    const list: OrderStatus[] = ['antrean', 'sortir', 'cuci', 'kering', 'setrika', 'packing', 'siap', 'selesai'];
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
      alert(language === 'en' ? 'Insufficient reward points to redeem this voucher.' : 'Poin Anda tidak mencukupi untuk menukar voucher ini.');
      return;
    }
    alert(language === 'en' ? `Success! Voucher '${voucherName}' has been claimed and can be used at checkout.` : `Berhasil! Kode Voucher '${voucherName}' telah diklaim dan dapat digunakan di kasir.`);
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
            <span>{t.portal.tabTrack}</span>
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
            <span>{t.portal.tabWallet}</span>
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
            <span>{t.portal.tabHistory} ({customerOrders.length})</span>
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
            <span>{t.portal.tabPickup}</span>
          </button>
        </div>

        {/* Switch demo customer */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {language === 'en' ? 'Select Member Account:' : 'Pilih Akun Member:'}
          </span>
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
                    {language === 'en' ? 'Live Realtime Tracking' : 'Live Realtime Tracking'}
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">
                    {language === 'en' ? 'Invoice No:' : 'No. Nota:'} <span className="font-mono text-emerald-300">{activeOrder.invoiceNo}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'en' ? 'Est. Ready:' : 'Est. Selesai:'} {activeOrder.estReadyDate} • {language === 'en' ? 'Fragrance:' : 'Parfum:'} {activeOrder.perfumeName}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      openTrackingModal(activeOrder.invoiceNo);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
                  >
                    <QrCode className="w-4 h-4 text-cyan-200" />
                    <span>{language === 'en' ? 'Live QR Tracking' : 'Status & QR Nota'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const branch = branches.find((b) => b.id === activeOrder.branchId) || branches[0];
                      downloadReceiptPdf(activeOrder, branch, 'a4');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black transition-all active:scale-95 shadow-sm"
                    title="Download Nota Resmi PDF (A4 Standar)"
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    id="open-receipt-btn"
                    onClick={() => {
                      setSelectedOrderReceipt(activeOrder);
                      setIsReceiptOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{language === 'en' ? 'Digital Receipt' : 'Lihat Struk'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrderWhatsApp(activeOrder);
                      setIsWhatsAppOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-glow-emerald"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{language === 'en' ? 'Simulate WA' : 'Kirim WA'}</span>
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

                    const stepTs = activeOrder.statusTimestamps?.[step.id];

                    return (
                      <div
                        key={step.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isCurrent
                            ? 'bg-emerald-500/15 border-emerald-500 shadow-md ring-2 ring-emerald-400/40 scale-[1.03] z-10'
                            : isPassed
                            ? 'bg-emerald-500/5 border-emerald-500/40 text-slate-800 dark:text-slate-200'
                            : 'bg-slate-850/60 border-slate-700/60 text-slate-600 dark:text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              isCurrent
                                ? 'bg-emerald-500 text-slate-950 font-black'
                                : isPassed
                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold'
                                : 'bg-slate-700/50 text-slate-400 dark:text-slate-400'
                            }`}>
                              0{idx + 1}
                            </span>
                            {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                            {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>}
                          </div>
                          <div className={`text-xs font-extrabold mt-2 ${
                            isCurrent
                              ? 'text-emerald-600 dark:text-emerald-300'
                              : isPassed
                              ? 'text-slate-900 dark:text-slate-100'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {step.label}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-tight">
                            {step.desc}
                          </div>
                        </div>

                        <div className="pt-2">
                          {stepTs?.photoProof && (
                            <button
                              type="button"
                              onClick={() =>
                                setCustomerPhotoView({
                                  url: stepTs.photoProof!,
                                  stepName: step.label,
                                  picName: stepTs.picName || 'Operator',
                                  time: stepTs.time,
                                  notes: stepTs.stationNotes,
                                })
                              }
                              className="w-full py-1 px-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                              title="Lihat Foto Bukti Pakaian"
                            >
                              <Camera className="w-3 h-3 text-emerald-400" />
                              <span>Foto Bukti</span>
                            </button>
                          )}

                          {stepTs?.picName && (
                            <div className="text-[8px] font-mono text-slate-500 truncate mt-1 text-center">
                              PIC: {stepTs.picName.split(' ')[0]}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Detail Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    {language === 'en' ? 'Laundry Services:' : 'Layanan Cucian:'}
                  </span>
                  <div className="font-bold text-white mt-0.5">
                    {activeOrder.items.map((i) => i.serviceName).join(', ')}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {activeOrder.weightKg > 0 ? `${activeOrder.weightKg} kg` : `${activeOrder.itemCount} ${language === 'en' ? 'items' : 'pcs'}`}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    {language === 'en' ? 'Payment Status:' : 'Status Pembayaran:'}
                  </span>
                  <div className="mt-0.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        activeOrder.paymentStatus === 'lunas'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {activeOrder.paymentStatus === 'lunas'
                        ? (language === 'en' ? '✅ Paid' : '✅ Lunas')
                        : (language === 'en' ? '⚠️ Payment Pending' : '⚠️ Belum Lunas')}
                    </span>
                  </div>
                  <div className="font-mono text-emerald-400 font-bold mt-1">
                    {formatCurrency(activeOrder.finalPrice, currency)}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    {language === 'en' ? 'Special Notes:' : 'Catatan Khusus:'}
                  </span>
                  <p className="text-slate-300 mt-0.5 text-[11px]">
                    {activeOrder.specialNotes || (language === 'en' ? 'No special instructions.' : 'Tidak ada catatan khusus.')}
                  </p>
                </div>
              </div>

              {/* Detail Isi Pakaian & Catatan Sortir Pelanggan */}
              {activeOrder.clothesDetails && activeOrder.clothesDetails.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-indigo-300 flex items-center gap-1.5">
                      <ClipboardCheck className="w-4 h-4 text-indigo-400" />
                      <span>{language === 'en' ? 'Verified Garment Breakdown:' : 'Rincian Pakaian Terdata di Outlet:'}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                      {activeOrder.totalPieces || activeOrder.clothesDetails.reduce((a, b) => a + (b.quantity || 0), 0)} Pcs / Helai
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {activeOrder.clothesDetails.filter((c) => c.quantity > 0).map((c, i) => (
                      <div key={i} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-300 font-medium truncate">• {c.name} {c.notes ? `(${c.notes})` : ''}</span>
                        <strong className="text-indigo-400 font-mono shrink-0 ml-1">{c.quantity} pcs</strong>
                      </div>
                    ))}
                  </div>

                  {activeOrder.sortingNotes && (
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>{language === 'en' ? 'Inspection Notes:' : 'Catatan Pemeriksaan Stasiun Sortir:'}</strong>{' '}
                        <span>{activeOrder.sortingNotes}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl glass-panel border border-slate-800 text-slate-400">
              {language === 'en' ? 'No active laundry orders for this account.' : 'Belum ada cucian aktif untuk akun member ini.'}
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
                  {language === 'en' ? 'Prepaid Deposit Wallet' : 'Dompet Saldo Deposit'}
                </span>
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-3xl font-black font-mono text-emerald-400">
                  {formatCurrency(currentCustomer.depositBalance, currency)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'en'
                    ? 'Use for seamless instant cashless payment without needing cash on delivery.'
                    : 'Dapat digunakan untuk bayar instan saat laundry tanpa perlu bawa uang tunai.'}
                </p>
              </div>
              <button
                onClick={() => alert(language === 'en' ? 'Deposit top-up can be done at outlet cashier or via transfer/QRIS!' : 'Top up saldo deposit dapat dilakukan di kasir outlet atau via transfer VA!')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-glow-emerald"
              >
                {language === 'en' ? '+ Top Up Wallet Deposit' : '+ Top Up Saldo Deposit'}
              </button>
            </div>

            {/* Loyalty Points Card */}
            <div className="p-6 rounded-3xl glass-panel border border-purple-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'en' ? 'Member Loyalty Points' : 'Poin Loyalitas Member'}
                </span>
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-3xl font-black font-mono text-purple-400">
                  {currentCustomer.loyaltyPoints} {language === 'en' ? 'Points' : 'Poin'}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'en'
                    ? 'Earn 1 Point per Rp 1,000 spent. Redeem for free wash vouchers and fragrance upgrades!'
                    : 'Kumpulkan 1 Poin setiap transaksi Rp 1.000. Tukarkan dengan voucher cuci gratis!'}
                </p>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {language === 'en' ? 'Membership Tier:' : 'Tingkat Keanggotaan:'}{' '}
                <strong className="text-white">Gold VIP LaundryHub</strong>
              </div>
            </div>
          </div>

          {/* Rewards Catalog */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-purple-400" />
              <span>{language === 'en' ? 'Points Reward Catalog' : 'Katalog Penukaran Poin Hadiah'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: language === 'en' ? 'Free 3kg Wash & Fold Voucher' : 'Voucher Cuci Kiloan 3kg Gratis',
                  points: 150,
                  desc: language === 'en' ? 'Valid for wash, dry & press package' : 'Berlaku untuk paket cuci setrika',
                },
                {
                  name: language === 'en' ? 'Free Snappy Red Premium Scent' : 'Gratis Parfum Snappy Red Premium',
                  points: 80,
                  desc: language === 'en' ? 'Upgrades freshness up to 14 days' : 'Upgrade wangi tahan 14 hari',
                },
                {
                  name: language === 'en' ? '50% Off Sneakers Cleaning' : 'Diskon 50% Cuci Sepatu Sneakers',
                  points: 200,
                  desc: language === 'en' ? 'Deep cleaning for all sneaker brands' : 'Deep cleaning segala merk',
                },
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
                    <span className="font-mono text-purple-400 font-bold text-xs">
                      {reward.points} {language === 'en' ? 'Pts' : 'Poin'}
                    </span>
                    <button
                      onClick={() => handleRedeemVoucher(reward.points, reward.name)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 text-purple-300 hover:text-white text-xs font-semibold transition-colors"
                    >
                      {language === 'en' ? 'Claim Voucher' : 'Tukar Voucher'}
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
                  <th className="p-3.5">{language === 'en' ? 'Date' : 'Tanggal'}</th>
                  <th className="p-3.5">{language === 'en' ? 'Service' : 'Layanan'}</th>
                  <th className="p-3.5">{language === 'en' ? 'Total Bill' : 'Total Biaya'}</th>
                  <th className="p-3.5">{language === 'en' ? 'Status' : 'Status'}</th>
                  <th className="p-3.5 text-right">{language === 'en' ? 'Digital Receipt' : 'Nota Digital'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customerOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-emerald-400">{ord.invoiceNo}</td>
                    <td className="p-3.5 text-slate-400">
                      {new Date(ord.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3.5 text-slate-200">
                      {ord.items.map((i) => i.serviceName).join(', ')}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      {formatCurrency(ord.finalPrice, currency)}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {ord.currentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => openTrackingModal(ord.invoiceNo)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-600/25 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 font-semibold text-xs transition-colors"
                      >
                        {language === 'en' ? 'Track' : 'Status'}
                      </button>
                      <button
                        onClick={() => {
                          const branch = branches.find((b) => b.id === ord.branchId) || branches[0];
                          downloadReceiptPdf(ord, branch, 'a4');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-600/25 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/40 font-semibold text-xs transition-colors inline-flex items-center gap-1"
                        title="Download Dokumen Resmi PDF Nota"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrderReceipt(ord);
                          setIsReceiptOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                      >
                        {language === 'en' ? 'Receipt' : 'Nota'}
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
                <span>
                  {language === 'en' ? 'Request Laundry Pickup & Delivery' : 'Pesan Layanan Antar-Jemput Laundry'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'en'
                  ? 'Our couriers pick up directly from your residence, hotel, villa, or Airbnb lobby.'
                  : 'Kurir kami akan datang ke alamat Anda untuk mengambil pakaian kotor.'}
              </p>
            </div>

            {/* Tourist / Hotel Friendly Notice */}
            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-2.5 text-xs text-indigo-200">
              <span className="text-base">🏨</span>
              <div>
                <strong className="block text-indigo-300">
                  {language === 'en' ? 'Visiting Tourist / Hotel Guest?' : 'Tamu Hotel, Villa & Wisatawan Mancanegara?'}
                </strong>
                <span className="text-[11px] text-slate-300">
                  {language === 'en'
                    ? 'Enter your Hotel/Villa name and Room Number in the address field. Couriers coordinate with front desk reception for pickup & return.'
                    : 'Tulis nama hotel dan nomor kamar pada kolom alamat. Kurir akan berkoordinasi langsung dengan resepsionis untuk serah-terima pakaian.'}
                </span>
              </div>
            </div>

            {pickupSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {language === 'en'
                    ? 'Pickup request submitted successfully! Our courier will contact you within 15-30 minutes.'
                    : 'Permintaan jemput berhasil dibuat! Kurir akan menghubungi Anda dalam 15-30 menit.'}
                </span>
              </div>
            )}

            <form onSubmit={handleRequestPickupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {language === 'en' ? 'Customer / Guest Name:' : 'Nama Pemesan:'}
                </label>
                <input
                  type="text"
                  disabled
                  value={currentCustomer.name}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {language === 'en' ? 'WhatsApp / Phone Number:' : 'Nomor WhatsApp:'}
                </label>
                <input
                  type="text"
                  disabled
                  value={currentCustomer.phone}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {language === 'en' ? 'Pickup Address (or Hotel Name & Room No):' : 'Alamat Penjemputan:'}
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder={language === 'en' ? 'e.g. Tentrem Hotel, Room 412, Jl. Gajah Mada / Villa Pandanaran' : 'Alamat lengkap rumah atau nama hotel'}
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  {language === 'en'
                    ? 'Special Notes for Courier (Estimated clothes qty / landmarks):'
                    : 'Catatan untuk Kurir (Perkiraan jumlah baju / patokan rumah):'}
                </label>
                <input
                  type="text"
                  placeholder={
                    language === 'en'
                      ? 'e.g. Approx 2 laundry bags, leave at hotel front desk'
                      : 'Misal: Sekitar 2 kantong kresek, pagar hitam sebelah warung'
                  }
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
                  {language === 'en' ? 'Submit Courier Pickup Request' : 'Kirim Permintaan Jemput ke Kurir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Photo Proof Lightbox Modal */}
      {customerPhotoView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden space-y-3">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">
                  Bukti Pengerjaan: {customerPhotoView.stepName}
                </h4>
              </div>
              <button
                onClick={() => setCustomerPhotoView(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black px-4 flex justify-center">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 w-full max-h-[340px]">
                <img
                  src={customerPhotoView.url}
                  alt="Bukti Pakaian Pelanggan"
                  className="w-full h-full object-contain max-h-[340px]"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent text-[10px] font-mono text-slate-200">
                  <div className="text-emerald-400 font-bold flex items-center justify-between">
                    <span>LAUNDRYHUB REALTIME ASSURANCE</span>
                    <span>✓ QC PASS</span>
                  </div>
                  <div className="text-slate-300 flex items-center justify-between mt-0.5">
                    <span>Petugas: {customerPhotoView.picName}</span>
                    <span>{customerPhotoView.time}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 pt-1 space-y-2 text-xs">
              {customerPhotoView.notes && (
                <div className="text-amber-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                  <strong>Catatan Workshop:</strong> {customerPhotoView.notes}
                </div>
              )}
              <button
                type="button"
                onClick={() => setCustomerPhotoView(null)}
                className="w-full py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
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
