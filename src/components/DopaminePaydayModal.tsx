import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Trophy,
  Coins,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  X,
  Share2,
  Printer,
  Zap,
  Flame,
  Crown,
  Heart,
  RotateCcw,
  Check,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { soundEngine } from '../utils/audio';

interface DopaminePaydayModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId?: string | null;
}

const SLOT_ICONS = ['💰', '💵', '👑', '💎', '⚡', '💸', '🏆'];

export const DopaminePaydayModal: React.FC<DopaminePaydayModalProps> = ({
  isOpen,
  onClose,
  staffId,
}) => {
  const { users, currentUser, calculateStaffSalarySlip } = useApp();

  const activeStaff = staffId ? users.find((u) => u.id === staffId) || currentUser : currentUser;
  const slip = calculateStaffSalarySlip(activeStaff.id);

  // Slot Reel states
  const [reels, setReels] = useState<[string, string, string]>(['💰', '💰', '💰']);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [displayAmount, setDisplayAmount] = useState<number>(0);
  const [isTransferred, setIsTransferred] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(500);

  // Trigger celebration on open
  useEffect(() => {
    if (isOpen) {
      setIsTransferred(false);
      triggerCelebration();
    }
  }, [isOpen, staffId]);

  const triggerCelebration = () => {
    setIsSpinning(true);
    soundEngine.playSpinClick();
    setDisplayAmount(0);

    // Randomize reels while spinning
    let ticks = 0;
    const interval = setInterval(() => {
      ticks++;
      setReels([
        SLOT_ICONS[Math.floor(Math.random() * SLOT_ICONS.length)],
        SLOT_ICONS[Math.floor(Math.random() * SLOT_ICONS.length)],
        SLOT_ICONS[Math.floor(Math.random() * SLOT_ICONS.length)],
      ]);
      soundEngine.playSpinClick();

      if (ticks > 16) {
        clearInterval(interval);
        // Land on TRIPLE MONEY JACKPOT!
        setReels(['💰', '💰', '💰']);
        setIsSpinning(false);

        // Sound effects
        soundEngine.playDopamineJackpot();
        setTimeout(() => {
          soundEngine.playPaydayCoinShower();
        }, 500);

        // Confetti burst
        fireConfetti();

        // Animate counter up
        animateCountUp(slip.netTakeHomePay);
      }
    }, 70);
  };

  const fireConfetti = () => {
    // Left firework
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 65,
      origin: { x: 0.1, y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#fbbf24'],
    });
    // Right firework
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 65,
      origin: { x: 0.9, y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#fbbf24'],
    });
    // Middle rain
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#ffd700', '#22c55e', '#a855f7'],
      });
    }, 300);
  };

  const animateCountUp = (target: number) => {
    const duration = 1800; // ms
    const startTime = performance.now();

    const frame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(ease * target);
      setDisplayAmount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setDisplayAmount(target);
      }
    };

    requestAnimationFrame(frame);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Floating Animated Rupiah Bills & Coins in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[8%] animate-bounce text-2xl opacity-70">💸</div>
        <div className="absolute top-[25%] right-[10%] animate-pulse text-3xl opacity-80">🪙</div>
        <div className="absolute top-[65%] left-[12%] animate-bounce text-3xl opacity-75">💰</div>
        <div className="absolute top-[75%] right-[15%] animate-pulse text-2xl opacity-80">✨</div>
        <div className="absolute top-[40%] left-[4%] animate-ping text-xl opacity-60">⚡</div>
        <div className="absolute top-[50%] right-[5%] animate-ping text-xl opacity-60">💎</div>
      </div>

      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white w-full max-w-xl rounded-3xl shadow-2xl border-2 border-amber-500/50 overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Top Flashing Marquee / Neon Header */}
        <div className="relative p-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-600 text-slate-950 overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-yellow-300/30 animate-pulse pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-950 text-amber-400 rounded-xl shadow-inner font-black text-xs animate-bounce">
                🎰 SENSATIONAL
              </span>
              <div>
                <h3 className="font-black text-base md:text-lg tracking-wider uppercase leading-none">
                  GAJI CAIRRR MAXWIN! x{multiplier}
                </h3>
                <p className="text-[11px] font-bold text-slate-900/90 mt-0.5">
                  Rekap Cuan Borongan Stasiun & Kehadiran Teladan
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 3-Reel Slot Machine Container */}
          <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-2 border-amber-500/40 shadow-inner text-center relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-widest mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>TRIPLE GOLDEN JACKPOT REELS</span>
            </div>

            {/* 3 Reels Display */}
            <div className="flex items-center justify-center gap-3">
              {reels.map((icon, idx) => (
                <div
                  key={idx}
                  className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 ${
                    isSpinning
                      ? 'border-yellow-400 animate-pulse'
                      : 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  } flex items-center justify-center text-4xl md:text-5xl select-none transition-transform transform ${
                    isSpinning ? 'scale-95' : 'scale-100'
                  }`}
                >
                  <span className={isSpinning ? 'blur-xs animate-bounce' : 'animate-in zoom-in-50'}>
                    {icon}
                  </span>
                </div>
              ))}
            </div>

            {/* Worker Avatar & Payday Banner */}
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-left">
                <img
                  src={activeStaff.avatar}
                  alt={activeStaff.name}
                  className="w-10 h-10 rounded-full border-2 border-amber-400 object-cover shadow"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-white">{activeStaff.name}</h4>
                  <p className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">
                    {activeStaff.role} • {slip.period}
                  </p>
                </div>
              </div>

              <button
                onClick={triggerCelebration}
                disabled={isSpinning}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>Spin Sensasi</span>
              </button>
            </div>
          </div>

          {/* Big Live Cash Counter Card (Dopamine Rush) */}
          <div className="p-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 rounded-3xl border-2 border-emerald-500/50 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-pulse" />
              <span>TOTAL TAKE-HOME PAY SIAP CAIR</span>
              <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-pulse" />
            </span>

            {/* Glowing Big Amount */}
            <div className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-yellow-200 to-teal-200 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              Rp {displayAmount.toLocaleString('id-ID')}
            </div>

            <p className="text-xs text-slate-300 mt-1 font-medium">
              ✨ Bersih diterima setelah borongan {slip.stationCommissions.reduce((a, b) => a + b.count, 0)} nota & bonus tip!
            </p>

            {/* Quick Badges of Pride */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span>Raja Borongan 5 Stasiun</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>100% Selesai Tepat Waktu</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-400" />
                <span>Tip Pelanggan Bintang 5</span>
              </span>
            </div>
          </div>

          {/* Breakdown Rincian Cuan Borongan */}
          <div className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400">
                <DollarSign className="w-4 h-4" />
                <span>Rincian Pendapatan Staf:</span>
              </span>
              <span className="text-[10px] text-slate-400">Periode: {slip.period}</span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-700/50">
              {/* Gaji Pokok Harian */}
              <div className="flex justify-between items-center pt-1 text-slate-200">
                <span>Gaji Pokok ({slip.daysPresent} hari hadir):</span>
                <span className="font-mono font-bold text-white">
                  Rp {slip.baseSalaryTotal.toLocaleString('id-ID')}
                </span>
              </div>

              {/* Borongan Stasiun */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between items-center text-teal-300 font-semibold">
                  <span>Komisi Borongan 5 Stasiun ({slip.stationCommissions.reduce((a, b) => a + b.count, 0)} nota):</span>
                  <span className="font-mono font-bold">
                    +Rp {slip.totalStationEarnings.toLocaleString('id-ID')}
                  </span>
                </div>
                {/* Station chips */}
                <div className="grid grid-cols-5 gap-1 pt-1">
                  {slip.stationCommissions.map((st) => (
                    <div
                      key={st.station}
                      className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-center"
                    >
                      <p className="text-[9px] uppercase font-bold text-slate-400 truncate">{st.station}</p>
                      <p className="text-xs font-black font-mono text-cyan-300">{st.count}</p>
                      <p className="text-[8px] font-mono text-slate-400 truncate">
                        +{Math.round(st.totalEarned / 1000)}k
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip Pelanggan */}
              {slip.customerTipsTotal > 0 && (
                <div className="flex justify-between items-center pt-2 text-pink-400 font-semibold">
                  <span>Tip Pelanggan (Bintang 5 Slot):</span>
                  <span className="font-mono font-bold">
                    +Rp {slip.customerTipsTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              {/* Potongan Alpha & Terlambat */}
              {slip.absenceDeductionsTotal + slip.lateDeductionsTotal > 0 ? (
                <div className="flex justify-between items-center pt-2 text-rose-400 font-semibold">
                  <span>Potongan Alpha ({slip.daysAbsent}x) / Telat ({slip.daysLate}x):</span>
                  <span className="font-mono font-bold">
                    -Rp {(slip.absenceDeductionsTotal + slip.lateDeductionsTotal).toLocaleString('id-ID')}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between items-center pt-2 text-emerald-400 text-[11px] font-semibold">
                  <span>Disiplin Kehadiran (Tanpa Potongan):</span>
                  <span className="font-mono font-bold">Rp 0 (100% On-Time!)</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Payout / Transfer E-Wallet / Share WhatsApp */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                setIsTransferred(true);
                soundEngine.playCashChime();
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
              }}
              disabled={isTransferred}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
                isTransferred
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 shadow-glow-amber'
              }`}
            >
              {isTransferred ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>BERHASIL DIKIRIM KE REKENING / E-WALLET STAF!</span>
                </>
              ) : (
                <>
                  <Coins className="w-5 h-5 text-slate-950" />
                  <span>💸 CAIRKAN KE SALDO / REKENING KARYAWAN SEKARANG</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-slate-300" />
                <span>Cetak Slip Thermal</span>
              </button>

              <button
                onClick={() => {
                  const text = `🎉 GAJI CAIRRR SENSASIONAL LAUNDRYHUB!\nKaryawan: ${activeStaff.name} (${activeStaff.role.toUpperCase()})\nTotal Take Home Pay: Rp ${slip.netTakeHomePay.toLocaleString('id-ID')}\nBorongan 5 Stasiun: +Rp ${slip.totalStationEarnings.toLocaleString('id-ID')}\nDisiplin on-time & zero reject. Cuan berkah laundry! 🧺💸`;
                  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(url, '_blank');
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Flexing ke WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
