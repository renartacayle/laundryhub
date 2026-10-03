import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { Coins, X, CheckCircle, Zap, Shield, Sparkles, QrCode, Gift, Tag, PlusCircle, Check } from 'lucide-react';
import { QrisModal } from './QrisModal';

interface CoinTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomPromoCode {
  code: string;
  coins: number;
  label: string;
}

export const CoinTopupModal: React.FC<CoinTopupModalProps> = ({ isOpen, onClose }) => {
  const { tokenCoins, topupCoins, currentUser } = useApp();
  const [selectedPackage, setSelectedPackage] = useState<number>(500);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isQrisOpen, setIsQrisOpen] = useState(false);

  // Promo Code State
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCreateCode, setShowCreateCode] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeCoins, setNewCodeCoins] = useState(50);

  // Packages updated to Rp 25 - Rp 50 per nota
  const packages = [
    { coins: 200, price: 10000, label: 'Starter Hub', bonus: 'Rp 50 / nota', popular: false },
    { coins: 500, price: 20000, label: 'Bisnis Ramai', bonus: 'Rp 40 / nota (Hemat 20%)', popular: true },
    { coins: 1000, price: 30000, label: 'Multi-Outlet Pro', bonus: 'Rp 30 / nota (Hemat 40%)', popular: false },
    { coins: 2000, price: 50000, label: 'Sultan Laundromat', bonus: 'Hanya Rp 25 / nota!', popular: false },
  ];

  const currentPkg = packages.find((p) => p.coins === selectedPackage) || packages[1];

  const handleOpenQris = () => {
    setIsQrisOpen(true);
  };

  const handleQrisPaymentSuccess = () => {
    topupCoins(currentPkg.coins);
    setIsQrisOpen(false);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    alert(`Top-up Berhasil! Saldo bertambah ${currentPkg.coins.toLocaleString('id-ID')} koin token nota.`);
    onClose();
  };

  // Redeem Promo Code Handler
  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) return;

    // Check already redeemed codes
    const redeemed: string[] = JSON.parse(localStorage.getItem('lh_redeemed_codes') || '[]');
    if (redeemed.includes(cleanCode)) {
      setPromoFeedback({ type: 'error', text: `Kode '${cleanCode}' sudah pernah diklaim di perangkat ini!` });
      return;
    }

    // Default predefined codes
    const defaultCodes: Record<string, { coins: number; label: string }> = {
      'COBAGRATIS': { coins: 50, label: 'Bonus Uji Coba Gratis' },
      'RENA50': { coins: 50, label: 'Voucher Spesial Rena' },
      'SEMANGAT100': { coins: 100, label: 'Bonus Mitra Baru' },
      'SULTAN200': { coins: 200, label: 'Bonus Komunitas Laundry' },
      'GRATIS25': { coins: 25, label: 'Hadiah Tester 25 Nota' },
    };

    // Load custom codes created by Owner
    const customCodes: CustomPromoCode[] = JSON.parse(localStorage.getItem('lh_custom_codes') || '[]');
    const customFound = customCodes.find((c) => c.code.toUpperCase() === cleanCode);

    let rewardCoins = 0;
    let label = '';

    if (defaultCodes[cleanCode]) {
      rewardCoins = defaultCodes[cleanCode].coins;
      label = defaultCodes[cleanCode].label;
    } else if (customFound) {
      rewardCoins = customFound.coins;
      label = customFound.label;
    } else {
      setPromoFeedback({ type: 'error', text: `Kode voucher '${cleanCode}' tidak ditemukan atau salah!` });
      return;
    }

    // Success: Credit coins
    topupCoins(rewardCoins);
    redeemed.push(cleanCode);
    localStorage.setItem('lh_redeemed_codes', JSON.stringify(redeemed));

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
    });

    setPromoFeedback({
      type: 'success',
      text: `Selamat! Berhasil klaim ${label}: +${rewardCoins} Koin Token Nota Gratis ditambahkan!`,
    });
    setPromoInput('');
  };

  // Owner: Create New Custom Code
  const handleCreateCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCodeName.trim().toUpperCase();
    if (!code || newCodeCoins <= 0) return;

    const customCodes: CustomPromoCode[] = JSON.parse(localStorage.getItem('lh_custom_codes') || '[]');
    if (customCodes.some((c) => c.code === code)) {
      alert(`Kode '${code}' sudah pernah dibuat!`);
      return;
    }

    customCodes.push({
      code,
      coins: Number(newCodeCoins),
      label: `Voucher Hadiah ${newCodeCoins} Nota`,
    });
    localStorage.setItem('lh_custom_codes', JSON.stringify(customCodes));

    alert(`Kode voucher baru '${code}' (+${newCodeCoins} Koin) berhasil dibuat! Anda bisa membagikan kode ini ke warung laundry rekanan.`);
    setNewCodeName('');
    setShowCreateCode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-amber-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Top Up Saldo Koin Sistem</h3>
              <p className="text-xs text-slate-400">1 Transaksi Nota = 1 Koin Terpotong</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="px-6 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Saldo Token Saat Ini:</span>
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Coins className="w-4 h-4" />
            <span className="text-base font-black">{tokenCoins.toLocaleString('id-ID')}</span>
            <span className="text-xs text-slate-400 font-normal">Koin</span>
          </div>
        </div>

        {/* Package Options */}
        <div className="p-6 space-y-3">
          <div className="text-xs font-semibold text-slate-300 mb-1">Pilih Paket Token:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packages.map((pkg) => {
              const isSelected = selectedPackage === pkg.coins;
              return (
                <div
                  key={pkg.coins}
                  onClick={() => setSelectedPackage(pkg.coins)}
                  className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 shadow-glow-amber'
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/70'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wide">
                      Terlaris
                    </span>
                  )}
                  <div className="text-xs font-bold text-white">{pkg.label}</div>
                  <div className="text-base font-black text-amber-400 mt-0.5">
                    {pkg.coins.toLocaleString('id-ID')} Koin
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">{pkg.bonus}</div>
                  <div className="text-xs font-semibold text-slate-300 mt-2">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start gap-2.5 text-[11px] text-slate-400">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Saldo token otomatis terpotong 1 koin saat kasir membuat nota. Harga super hemat mulai <strong>Rp 25 - Rp 50 per nota</strong>.
            </span>
          </div>

          {/* Section: Klaim Kode Token Gratis */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                Punya Kode Voucher Token Gratis?
              </span>
              <button
                type="button"
                onClick={() => setShowCreateCode(!showCreateCode)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-medium flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" />
                {showCreateCode ? 'Tutup Generator' : '+ Buat Kode (Owner)'}
              </button>
            </div>

            {/* Redeem Form */}
            <form onSubmit={handleRedeemCode} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value);
                    setPromoFeedback(null);
                  }}
                  placeholder="Ketik kode (misal: RENA50 / COBAGRATIS)"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white uppercase placeholder:normal-case placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-glow-amber transition-all shrink-0"
              >
                Klaim
              </button>
            </form>

            {/* Promo Feedback */}
            {promoFeedback && (
              <div
                className={`mt-2 p-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                  promoFeedback.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {promoFeedback.type === 'success' ? (
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{promoFeedback.text}</span>
              </div>
            )}

            {/* Sample Codes Hint */}
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap">
              <span>Contoh kode aktif:</span>
              <button
                type="button"
                onClick={() => setPromoInput('RENA50')}
                className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono hover:bg-slate-700"
              >
                RENA50
              </button>
              <button
                type="button"
                onClick={() => setPromoInput('COBAGRATIS')}
                className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono hover:bg-slate-700"
              >
                COBAGRATIS
              </button>
              <button
                type="button"
                onClick={() => setPromoInput('SEMANGAT100')}
                className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono hover:bg-slate-700"
              >
                SEMANGAT100
              </button>
            </div>

            {/* Owner Custom Code Generator */}
            {showCreateCode && (
              <form onSubmit={handleCreateCustomCode} className="mt-3 p-3 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generator Kode Baru (Khusus Anda / Owner)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value)}
                    placeholder="Nama Kode (e.g. MITRA2026)"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase focus:border-cyan-400"
                    required
                  />
                  <input
                    type="number"
                    value={newCodeCoins}
                    onChange={(e) => setNewCodeCoins(Number(e.target.value))}
                    placeholder="Jumlah Koin (e.g. 50)"
                    min={5}
                    max={1000}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-cyan-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] rounded-lg transition-colors"
                >
                  Simpan & Rilis Kode Voucher Ini
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 space-y-2">
          <button
            onClick={handleOpenQris}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-all shadow-glow-amber"
          >
            <QrCode className="w-4 h-4" />
            <span>Bayar Rp {currentPkg.price.toLocaleString('id-ID')} via QRIS (Dapatkan {currentPkg.coins.toLocaleString('id-ID')} Koin)</span>
          </button>
          <p className="text-[10px] text-center text-slate-500">
            Pembayaran langsung diverifikasi realtime ke QRIS SPEEDCASH RENARTASHOP
          </p>
        </div>
      </div>

      {/* Embedded Real QRIS Modal */}
      <QrisModal
        isOpen={isQrisOpen}
        onClose={() => setIsQrisOpen(false)}
        amount={currentPkg.price}
        invoiceNo={`TOPUP-TOKEN-${Date.now().toString().slice(-6)}`}
        onPaymentSuccess={handleQrisPaymentSuccess}
      />
    </div>
  );
};
