import React, { useState } from 'react';
import { Sparkles, Gift, Calculator, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface StickyConversionBarProps {
  onOpenShowcase: () => void;
}

export const StickyConversionBar: React.FC<StickyConversionBarProps> = ({ onOpenShowcase }) => {
  const { setCurrentRole, topupCoins } = useApp();
  const [isMinimized, setIsMinimized] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [isDismissed, setIsDismissed] = useState(false);
  const [claimed, setClaimed] = useState(false);

  if (isDismissed) return null;

  const handleClaimVoucher = () => {
    const redeemed: string[] = JSON.parse(localStorage.getItem('lh_redeemed_codes') || '[]');
    if (!redeemed.includes('RENA50')) {
      topupCoins(50);
      redeemed.push('RENA50');
      localStorage.setItem('lh_redeemed_codes', JSON.stringify(redeemed));
    }
    setClaimed(true);
    setCurrentRole('kasir');
    setTimeout(() => {
      onOpenShowcase();
    }, 400);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 animate-bounce">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-glow-emerald border border-white/20 transition-transform hover:scale-105"
          title="Buka Promo Rp 25/Nota"
        >
          <Gift className="w-4 h-4" />
          <span>Promo Rp 25</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-40 max-w-md w-[calc(100%-1.5rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-3.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-slate-900/95 via-emerald-950/90 to-slate-900/95 border border-emerald-500/40 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-white">
                Bebas Biaya Bulanan!
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950">
                RP 25/NOTA
              </span>
            </div>
            <p className="text-[10px] text-slate-300 hidden sm:block">
              Uang laundry 100% masuk rekening sendiri. Coba gratis 50 nota pertama.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleClaimVoucher}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-[11px] shadow-glow-emerald transition-all active:scale-95"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>{claimed ? '✓ Klaim' : 'Klaim 50'}</span>
          </button>

          <button
            onClick={onOpenShowcase}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Kalkulator ROI"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Sembunyikan"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
