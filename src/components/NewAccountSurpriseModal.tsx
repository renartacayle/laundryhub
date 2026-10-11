import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Coins,
  Sparkles,
  Zap,
  CheckCircle2,
  X,
  Gift,
  Bot,
  WashingMachine,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';

export const NewAccountSurpriseModal: React.FC = () => {
  const {
    isNewAccountSurpriseOpen,
    setIsNewAccountSurpriseOpen,
    claimNewAccountSurprise,
    tokenCoins,
    currentUser,
    currentOwnerProfile,
  } = useApp();

  useEffect(() => {
    if (isNewAccountSurpriseOpen) {
      // Play celebratory chime
      try {
        soundEngine.playCashChime();
      } catch (e) {}

      // Multi-angle fireworks confetti burst
      const count = 200;
      const defaults = {
        origin: { y: 0.6 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#F59E0B', '#10B981', '#06B6D4'],
      });
      fire(0.2, {
        spread: 60,
        colors: ['#FCD34D', '#34D399', '#67E8F9'],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#F59E0B', '#EC4899', '#8B5CF6'],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isNewAccountSurpriseOpen]);

  if (!isNewAccountSurpriseOpen) return null;

  const handleClaim = () => {
    // Second grand burst
    try {
      soundEngine.playDopamineJackpot();
    } catch (e) {}

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
      zIndex: 9999,
    });

    claimNewAccountSurprise();
  };

  const ownerName = currentOwnerProfile?.name || currentUser.name || 'Owner Hebat';
  const outletName = currentOwnerProfile?.outletName || currentUser.outletName || 'Outlet Baru';

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-400/40 shadow-[0_0_60px_rgba(245,158,11,0.25)] overflow-hidden animate-in zoom-in-95 duration-300 text-white">
        {/* Glow backdrop effects */}
        <div className="absolute -top-24 -left-24 w-60 h-60 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={claimNewAccountSurprise}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors z-10"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 text-center relative z-0">
          {/* Floating Gift & Coins Badge */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/40 via-yellow-400/30 to-emerald-400/40 animate-pulse blur-md" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-xl shadow-amber-500/30 border border-yellow-300/60 transform rotate-3 hover:rotate-0 transition-transform">
              <Gift className="w-10 h-10 text-slate-950 animate-bounce" />
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 shadow-md border border-emerald-300 flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-rose-600 fill-rose-600" /> +2K
            </span>
          </div>

          {/* Header Headlines */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Surprise Welcome Gift • Owner Baru</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Selamat Datang, <span className="text-amber-400">{ownerName}</span>! 🎉
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Outlet <strong className="text-white">{outletName}</strong> berhasil terdaftar! Spesial hari ini, Anda mendapatkan kejutan modal token operasional gratis.
            </p>
          </div>

          {/* Big Token Balance Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-emerald-500/20 border border-amber-400/50 shadow-inner space-y-2">
            <span className="text-[11px] uppercase font-bold text-amber-300 tracking-wider">
              Saldo Token Siap Digunakan
            </span>
            <div className="flex items-center justify-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/30 border border-amber-400/40 text-amber-300 shadow-md">
                <Coins className="w-8 h-8 text-amber-400 fill-amber-400/20 animate-spin-slow" />
              </div>
              <div className="text-4xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight">
                +{tokenCoins > 0 ? tokenCoins.toLocaleString('id-ID') : '2.000'}
              </div>
            </div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 100% Gratis • Setara Paket Sultan Laundromat (Rp 50.000)
            </div>
          </div>

          {/* Value Proposition Points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <WashingMachine className="w-4 h-4 text-cyan-400" />
                <span>2.000x Siklus IoT</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Jalankan mesin cuci & pengering otomatis tanpa perlu beli koin di awal.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                <Bot className="w-4 h-4 text-purple-400" />
                <span>AI Garment Pro</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Akses penuh AI pemindai noda & deteksi pakaian kotor via kamera.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Kasir POS Cloud</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Cetak nota thermal Bluetooth, QRIS statis/dinamis, & struk WA bot.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              id="btn-claim-surprise-tokens"
              onClick={handleClaim}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Klaim 2.000 Token & Masuk Dashboard</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>
            <p className="text-[11px] text-slate-500 mt-2">
              Koin otomatis tersimpan di dompet digital outlet Anda. Tanpa masa kedaluwarsa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
