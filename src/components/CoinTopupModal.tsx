import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';
import { Coins, X, CheckCircle, Zap, Shield, Sparkles, QrCode } from 'lucide-react';
import { QrisModal } from './QrisModal';

interface CoinTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CoinTopupModal: React.FC<CoinTopupModalProps> = ({ isOpen, onClose }) => {
  const { tokenCoins, topupCoins } = useApp();
  const [selectedPackage, setSelectedPackage] = useState<number>(1200);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isQrisOpen, setIsQrisOpen] = useState(false);

  if (!isOpen) return null;

  const packages = [
    { coins: 500, price: 50000, label: 'Starter Hub', bonus: 'Rp 100/nota (0 Bonus)', popular: false },
    { coins: 1200, price: 100000, label: 'Bisnis Ramai', bonus: 'Rp 83/nota (+200 Bonus Koin)', popular: true },
    { coins: 3000, price: 200000, label: 'Multi-Outlet Pro', bonus: 'Rp 66/nota (+1.000 Bonus Koin)', popular: false },
    { coins: 10000, price: 500000, label: 'Sultan Laundromat', bonus: 'Rp 50/nota (+5.000 Bonus Koin)', popular: false },
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
              Saldo token digunakan secara otomatis saat kasir menerbitkan nota. Tidak ada masa kedaluwarsa koin.
            </span>
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
