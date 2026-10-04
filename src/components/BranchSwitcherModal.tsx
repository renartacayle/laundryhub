import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, CheckCircle2, MapPin, Phone, X, Store, Sparkles } from 'lucide-react';

interface BranchSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BranchSwitcherModal: React.FC<BranchSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { branches, currentBranchId, setCurrentBranchId } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Store className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">Pilih Cabang Laundry</h3>
              <p className="text-xs text-slate-400">Pindah outlet aktif operasional kasir & statistik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Branch List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {branches.map((b) => {
            const isSelected = b.id === currentBranchId;
            return (
              <div
                key={b.id}
                onClick={() => {
                  setCurrentBranchId(b.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 relative overflow-hidden active:scale-[0.98] ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500 text-white shadow-glow-cyan'
                    : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {/* Branch Photo */}
                <div className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-950 to-slate-800 border border-slate-700 flex items-center justify-center">
                  <Store className="w-6 h-6 text-cyan-400/60 absolute" />
                  <img
                    src={b.image || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=200&q=80'}
                    alt={b.name}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-cyan-500 text-slate-950 rounded-full p-0.5 shadow-md z-20">
                      <CheckCircle2 className="w-3.5 h-3.5 font-bold" />
                    </div>
                  )}
                </div>

                {/* Branch Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-white truncate">{b.name}</h4>
                    {b.isPusat && (
                      <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        PUSAT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mb-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{b.address}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-cyan-400 font-mono font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                      {b.code}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-2.5 h-2.5 text-slate-500" />
                      {b.phone}
                    </span>
                    <span className="text-emerald-400 font-medium ml-auto">Buka • 07:00 - 21:00</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Semua cabang terhubung real-time</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
