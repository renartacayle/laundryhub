import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Coins,
  DollarSign,
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
  TrendingUp,
  AlertTriangle,
  Calendar,
  User,
  Building2,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Clock,
  BadgeCheck,
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

const STATION_META: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  sortir:  { emoji: '🔍', label: 'Sortir',  color: 'text-indigo-300', bg: 'bg-indigo-950/60 border-indigo-500/30' },
  cuci:    { emoji: '🫧', label: 'Cuci',    color: 'text-cyan-300',   bg: 'bg-cyan-950/60 border-cyan-500/30' },
  kering:  { emoji: '🔥', label: 'Kering',  color: 'text-orange-300', bg: 'bg-orange-950/60 border-orange-500/30' },
  setrika: { emoji: '💨', label: 'Setrika', color: 'text-purple-300', bg: 'bg-purple-950/60 border-purple-500/30' },
  packing: { emoji: '📦', label: 'Packing', color: 'text-amber-300',  bg: 'bg-amber-950/60 border-amber-500/30' },
};

export const DopaminePaydayModal: React.FC<DopaminePaydayModalProps> = ({
  isOpen,
  onClose,
  staffId,
}) => {
  const { users, currentUser, calculateStaffSalarySlip, openSalarySlipModal } = useApp();

  const activeStaff = staffId ? users.find((u) => u.id === staffId) || currentUser : currentUser;
  const slip = calculateStaffSalarySlip(activeStaff.id);

  const [reels, setReels] = useState<[string, string, string]>(['💰', '💰', '💰']);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [displayAmount, setDisplayAmount] = useState<number>(0);
  const [isTransferred, setIsTransferred] = useState<boolean>(false);
  const [showSlip, setShowSlip] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsTransferred(false);
      setShowSlip(false);
      setDisplayAmount(0);
      triggerCelebration();
    }
  }, [isOpen, staffId]);

  const triggerCelebration = () => {
    setIsSpinning(true);
    soundEngine.playSpinClick();
    setDisplayAmount(0);
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
        setReels(['💰', '💰', '💰']);
        setIsSpinning(false);
        soundEngine.playDopamineJackpot();
        setTimeout(() => soundEngine.playPaydayCoinShower(), 500);
        fireConfetti();
        animateCountUp(slip.netTakeHomePay);
        setTimeout(() => setShowSlip(true), 1200);
      }
    }, 70);
  };

  const fireConfetti = () => {
    confetti({ particleCount: 80, angle: 60, spread: 65, origin: { x: 0.1, y: 0.6 }, colors: ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#fbbf24'] });
    confetti({ particleCount: 80, angle: 120, spread: 65, origin: { x: 0.9, y: 0.6 }, colors: ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#fbbf24'] });
    setTimeout(() => confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 }, colors: ['#ffd700', '#22c55e', '#a855f7'] }), 300);
  };

  const animateCountUp = (target: number) => {
    const duration = 1800;
    const startTime = performance.now();
    const frame = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayAmount(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(frame);
      else setDisplayAmount(target);
    };
    requestAnimationFrame(frame);
  };

  if (!isOpen) return null;

  const totalDeductions = slip.absenceDeductionsTotal + slip.lateDeductionsTotal;
  const totalNota = slip.stationCommissions.reduce((a, b) => a + b.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      {/* Floating emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[8%] animate-bounce text-2xl opacity-60">💸</div>
        <div className="absolute top-[25%] right-[10%] animate-pulse text-3xl opacity-70">🪙</div>
        <div className="absolute top-[65%] left-[12%] animate-bounce text-3xl opacity-60">💰</div>
        <div className="absolute top-[75%] right-[15%] animate-pulse text-2xl opacity-70">✨</div>
        <div className="absolute top-[40%] left-[4%] animate-ping text-xl opacity-40">⚡</div>
        <div className="absolute top-[50%] right-[5%] animate-ping text-xl opacity-40">💎</div>
      </div>

      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-amber-500/40 overflow-hidden flex flex-col max-h-[94vh] relative">

        {/* ── NEON HEADER ──────────────────────────────────────────── */}
        <div className="relative p-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-emerald-600 text-slate-950 overflow-hidden shadow-lg shrink-0">
          <div className="absolute inset-0 bg-yellow-300/20 animate-pulse pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-950 text-amber-400 rounded-xl shadow-inner font-black text-xs animate-bounce">🎰 SENSATIONAL</span>
              <div>
                <h3 className="font-black text-base tracking-wider uppercase leading-none">GAJI CAIRRR MAXWIN!</h3>
                <p className="text-[11px] font-bold text-slate-900/80 mt-0.5">Rekap Cuan Borongan & Kehadiran Teladan</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Slot Machine */}
          <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-2 border-amber-500/40 shadow-inner text-center relative overflow-hidden">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase tracking-widest mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              TRIPLE GOLDEN JACKPOT REELS
            </div>
            <div className="flex items-center justify-center gap-3">
              {reels.map((icon, idx) => (
                <div
                  key={idx}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 ${
                    isSpinning ? 'border-yellow-400 animate-pulse' : 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  } flex items-center justify-center text-4xl select-none`}
                >
                  <span className={isSpinning ? 'blur-sm animate-bounce' : ''}>{icon}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-left">
                <img src={activeStaff.avatar} alt={activeStaff.name} className="w-10 h-10 rounded-full border-2 border-amber-400 object-cover shadow" />
                <div>
                  <h4 className="font-extrabold text-sm text-white">{activeStaff.name}</h4>
                  <p className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">{activeStaff.role} • {slip.period}</p>
                </div>
              </div>
              <button onClick={triggerCelebration} disabled={isSpinning} className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5">
                <RotateCcw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
                Spin
              </button>
            </div>
          </div>

          {/* Big Cash Counter */}
          <div className="p-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 rounded-3xl border-2 border-emerald-500/40 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-pulse" />
              TOTAL TAKE-HOME PAY SIAP CAIR
              <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-pulse" />
            </span>
            <div className="mt-2 text-4xl md:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-yellow-200 to-teal-200 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              Rp {displayAmount.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-slate-400 mt-1">✨ Bersih setelah borongan {totalNota} nota</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Crown className="w-3 h-3 text-yellow-400" /> Raja Borongan 5 Stasiun
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> 100% Tepat Waktu
              </span>
              {slip.customerTipsTotal > 0 && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-pink-400" /> Tip Bintang 5
                </span>
              )}
            </div>
          </div>

          {/* ── SLIP GAJI RESMI ───────────────────────────────────── */}
          <div className={`transition-all duration-700 ${showSlip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Slip header — letterhead style */}
            <div className="rounded-t-2xl bg-gradient-to-r from-slate-800 to-slate-850 border border-slate-700 border-b-0 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">🧺</div>
                  <div>
                    <div className="font-black text-white text-sm leading-tight">LAUNDRYHUB</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Sistem Laundry Digital Terpercaya</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Slip Gaji Resmi</div>
                  <div className="font-mono text-xs text-amber-400 font-bold">#{slip.period.replace(' ', '-').toUpperCase()}</div>
                </div>
              </div>
            </div>

            {/* Staff identity bar */}
            <div className="border-x border-slate-700 bg-slate-900/80 px-5 py-3 flex items-center justify-between gap-4 border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <img src={activeStaff.avatar} alt={activeStaff.name} className="w-9 h-9 rounded-full border-2 border-slate-600 object-cover" />
                <div>
                  <div className="font-bold text-white text-sm">{activeStaff.name}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                    <User className="w-2.5 h-2.5" />
                    <span className="capitalize">{activeStaff.role}</span>
                    <span className="text-slate-600">•</span>
                    <Building2 className="w-2.5 h-2.5" />
                    <span>Workshop Kemang (HQ)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 justify-end">
                  <Calendar className="w-2.5 h-2.5" />
                  <span>Periode</span>
                </div>
                <div className="text-xs font-bold text-white">{slip.period}</div>
              </div>
            </div>

            {/* Slip body */}
            <div className="border border-slate-700 border-t-0 rounded-b-2xl bg-slate-950/60 overflow-hidden">

              {/* Section: Pendapatan */}
              <div className="px-5 pt-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3">
                  <ArrowUpRight className="w-3 h-3" />
                  PENDAPATAN
                </div>

                {/* Gaji pokok */}
                <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Gaji Pokok Harian</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {slip.daysPresent} hari hadir dari {slip.daysPresent + slip.daysAbsent} hari kerja
                    </div>
                  </div>
                  <div className="font-mono font-bold text-white text-sm">
                    Rp {slip.baseSalaryTotal.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Komisi borongan */}
                <div className="py-2.5 border-b border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">Komisi Borongan Stasiun</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{totalNota} nota dikerjakan di 5 stasiun</div>
                    </div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">
                      +Rp {slip.totalStationEarnings.toLocaleString('id-ID')}
                    </div>
                  </div>

                  {/* Station cards */}
                  <div className="grid grid-cols-5 gap-1.5 mt-3">
                    {slip.stationCommissions.map((st) => {
                      const meta = STATION_META[st.station] || { emoji: '⚙️', label: st.station, color: 'text-slate-300', bg: 'bg-slate-800 border-slate-700' };
                      return (
                        <div key={st.station} className={`rounded-xl border p-2 text-center ${meta.bg}`}>
                          <div className="text-base">{meta.emoji}</div>
                          <div className={`text-[9px] font-bold mt-0.5 ${meta.color}`}>{meta.label}</div>
                          <div className="text-[11px] font-black font-mono text-white mt-0.5">{st.count}x</div>
                          <div className={`text-[9px] font-mono ${st.totalEarned > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                            {st.totalEarned > 0 ? `+${Math.round(st.totalEarned / 1000)}k` : '-'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tip pelanggan */}
                {slip.customerTipsTotal > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
                    <div>
                      <div className="text-xs font-semibold text-pink-300 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-pink-400" /> Tip Pelanggan Bintang 5
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Rating langsung dari pelanggan</div>
                    </div>
                    <div className="font-mono font-bold text-pink-400 text-sm">
                      +Rp {slip.customerTipsTotal.toLocaleString('id-ID')}
                    </div>
                  </div>
                )}

                {/* Sub-total pendapatan */}
                <div className="flex items-center justify-between pt-2.5">
                  <div className="text-xs font-bold text-slate-300">Sub-total Pendapatan</div>
                  <div className="font-mono font-black text-white text-base">
                    Rp {(slip.baseSalaryTotal + slip.totalStationEarnings + slip.customerTipsTotal).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Section: Potongan */}
              <div className="px-5 pt-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">
                  <ArrowDownRight className="w-3 h-3" />
                  POTONGAN
                </div>

                {totalDeductions > 0 ? (
                  <div className="space-y-2">
                    {slip.daysAbsent > 0 && (
                      <div className="flex items-center justify-between py-1.5 text-xs">
                        <span className="flex items-center gap-1.5 text-rose-300">
                          <AlertTriangle className="w-3 h-3" />
                          Potongan Alpha ({slip.daysAbsent}x tidak hadir)
                        </span>
                        <span className="font-mono font-bold text-rose-400">-Rp {slip.absenceDeductionsTotal.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {slip.daysLate > 0 && (
                      <div className="flex items-center justify-between py-1.5 text-xs">
                        <span className="flex items-center gap-1.5 text-amber-300">
                          <Clock className="w-3 h-3" />
                          Potongan Terlambat ({slip.daysLate}x)
                        </span>
                        <span className="font-mono font-bold text-amber-400">-Rp {slip.lateDeductionsTotal.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-800">
                      <span className="text-xs font-bold text-slate-300">Sub-total Potongan</span>
                      <span className="font-mono font-black text-rose-400 text-base">-Rp {totalDeductions.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 py-2.5 px-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
                    <BadgeCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300">Disiplin Sempurna — Tanpa Potongan!</div>
                      <div className="text-[10px] text-emerald-500 mt-0.5">100% hadir tepat waktu. Bonus reputasi karyawan teladan ⭐</div>
                    </div>
                    <div className="ml-auto font-mono font-black text-emerald-400">Rp 0</div>
                  </div>
                )}
              </div>

              {/* ── TOTAL BERSIH ─────────────────────────────────── */}
              <div className="px-5 py-4 bg-gradient-to-r from-emerald-950/60 to-teal-950/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Gaji Bersih Diterima</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <Banknote className="w-3 h-3" /> Ditransfer ke rekening / e-wallet karyawan
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-yellow-300">
                      Rp {slip.netTakeHomePay.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Gaji Pokok</span>
                    <span>Borongan</span>
                    {slip.customerTipsTotal > 0 && <span>Tips</span>}
                    {totalDeductions > 0 && <span className="text-rose-500">Potongan</span>}
                  </div>
                  <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
                    {(() => {
                      const gross = slip.baseSalaryTotal + slip.totalStationEarnings + slip.customerTipsTotal;
                      const base = Math.round((slip.baseSalaryTotal / gross) * 100);
                      const station = Math.round((slip.totalStationEarnings / gross) * 100);
                      const tips = Math.round((slip.customerTipsTotal / gross) * 100);
                      return (
                        <>
                          <div className="bg-cyan-500 rounded-l-full" style={{ width: `${base}%` }} title={`Gaji Pokok ${base}%`} />
                          <div className="bg-emerald-500" style={{ width: `${station}%` }} title={`Borongan ${station}%`} />
                          {tips > 0 && <div className="bg-pink-500" style={{ width: `${tips}%` }} title={`Tips ${tips}%`} />}
                          {totalDeductions > 0 && <div className="bg-rose-700 rounded-r-full flex-1" title="Potongan" />}
                          {totalDeductions === 0 && <div className="flex-1 rounded-r-full bg-transparent" />}
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-3 text-[9px] text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />Pokok</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Borongan</span>
                    {slip.customerTipsTotal > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-pink-500 inline-block" />Tips</span>}
                    {totalDeductions > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-700 inline-block" />Potongan</span>}
                  </div>
                </div>
              </div>

              {/* Signature / stamp line */}
              <div className="px-5 py-3 bg-slate-950/40 flex items-center justify-between border-t border-slate-800">
                <div className="text-[9px] text-slate-600 font-mono">
                  Digenerate otomatis oleh sistem LAUNDRYHUB v2.6<br />
                  Dokumen ini sah tanpa tanda tangan basah
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── ACTION BUTTONS ──────────────────────────────────────── */}
          <div className="space-y-2 pb-2">
            <button
              onClick={() => {
                setIsTransferred(true);
                soundEngine.playCashChime();
                confetti({ particleCount: 60, spread: 70, origin: { y: 0.65 } });
              }}
              disabled={isTransferred}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
                isTransferred
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 active:scale-98'
              }`}
            >
              {isTransferred ? (
                <><CheckCircle2 className="w-5 h-5 text-white" /><span>BERHASIL DIKIRIM KE REKENING STAF! 🎉</span></>
              ) : (
                <><Coins className="w-5 h-5 text-slate-950" /><span>💸 CAIRKAN GAJI SEKARANG</span></>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openSalarySlipModal(activeStaff.id);
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-emerald-500/30"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lihat Nota Gaji Resmi 📄</span>
              </button>
              <button
                onClick={() => {
                  const text = `🎉 GAJI CAIR DI LAUNDRYHUB!\nKaryawan: ${activeStaff.name}\nTotal Diterima: Rp ${slip.netTakeHomePay.toLocaleString('id-ID')}\nBorongan ${totalNota} nota: +Rp ${slip.totalStationEarnings.toLocaleString('id-ID')}\nDisiplin & zero reject. Rezeki berkah! 🧺💸`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                Flexing WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
