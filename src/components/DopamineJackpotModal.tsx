import React, { useState, useEffect } from 'react';
import { Order, CustomerReview } from '../types';
import {
  Sparkles,
  Star,
  Crown,
  Heart,
  Award,
  Zap,
  CheckCircle2,
  X,
  Flame,
  Volume2,
  VolumeX,
  Coins,
  Send,
  Shirt,
  WashingMachine,
  ThumbsUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import { useApp } from '../context/AppContext';

interface DopamineJackpotModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onReviewSubmitted?: (review: CustomerReview) => void;
}

const DOPAMINE_TAGS = [
  { id: 'wangi', label: '🌸 Wangi Tahan 14 Hari', boost: '+100 Aura' },
  { id: 'rapi', label: '👔 Lipatan Presisi & Licin', boost: '+80 Aura' },
  { id: 'kilat', label: '⚡ Kilat & Tepat Waktu', boost: '+90 Aura' },
  { id: 'bersih', label: '💎 Bebas Noda 100%', boost: '+150 Aura' },
  { id: 'ramah', label: '😊 Staf Ramah Bintang 5', boost: '+70 Aura' },
  { id: 'packing', label: '📦 Packing Segel Rapi', boost: '+60 Aura' },
];

const SLOT_SYMBOLS = ['🧺', '🌸', '👑', '💎', '⚡', '🧼', '✨'];

export const DopamineJackpotModal: React.FC<DopamineJackpotModalProps> = ({
  isOpen,
  onClose,
  order,
  onReviewSubmitted,
}) => {
  const { addOrderReview, currentUser } = useApp();
  if (!isOpen || !order) return null;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '🌸 Wangi Tahan 14 Hari',
    '👔 Lipatan Presisi & Licin',
  ]);
  const [tipAmount, setTipAmount] = useState<number>(5000);
  const [feedbackText, setFeedbackText] = useState<string>('Pakaian wangi banget, lipatannya rapi, pengerjaan cepat!');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isJackpotTriggered, setIsJackpotTriggered] = useState<boolean>(false);
  const [reels, setReels] = useState<string[]>(['👑', '👑', '👑']);
  const [soundActive, setSoundActive] = useState<boolean>(soundEngine.getSoundEnabled());

  // Toggle sound
  const toggleSound = () => {
    const next = soundEngine.toggleSound();
    setSoundActive(next);
  };

  // Trigger grand dopamine fireworks & jackpot celebration
  const triggerSensationalCelebration = () => {
    setIsJackpotTriggered(true);
    soundEngine.playDopamineJackpot();

    // Multi-staged fireworks confetti
    const end = Date.now() + 2500;
    const colors = ['#F59E0B', '#10B981', '#06B6D4', '#EC4899', '#8B5CF6'];

    (function frame() {
      try {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });
      } catch {
        // ignore
      }

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // Initial sound on open
  useEffect(() => {
    soundEngine.playStationDing();
  }, []);

  const handleTagToggle = (tagLabel: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagLabel) ? prev.filter((t) => t !== tagLabel) : [...prev, tagLabel]
    );
    soundEngine.playSpinClick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSpinning(true);

    // Slot reel spinning ticks
    let ticks = 0;
    const spinInterval = setInterval(() => {
      ticks++;
      soundEngine.playSpinClick();
      setReels([
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      ]);

      if (ticks > 15) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        // Guarantee jackpot symbols on finish!
        setReels(rating === 5 ? ['👑', '👑', '👑'] : ['💎', '💎', '💎']);
        triggerSensationalCelebration();

        const review: CustomerReview = {
          rating,
          feedbackText,
          tags: selectedTags,
          staffTipAmount: tipAmount > 0 ? tipAmount : undefined,
          createdAt: new Date().toISOString(),
          customerName: order.customerName,
        };

        addOrderReview(order.id, review);
        onReviewSubmitted?.(review);

        setTimeout(() => {
          onClose();
        }, 2200);
      }
    }, 70);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-500/80 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.35)] overflow-hidden flex flex-col my-6 text-slate-100">
        
        {/* Top Gold Glowing Jackpot Marquee Bar */}
        <div className="relative bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-5 py-3 text-slate-950 font-black flex items-center justify-between shadow-md overflow-hidden">
          {/* Animated Sheen */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer pointer-events-none" />

          <div className="flex items-center gap-2 relative z-10">
            <span className="text-xl animate-bounce">🎰</span>
            <div>
              <div className="text-xs sm:text-sm uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                <span>DOPAMINE FEEDBACK & RATING</span>
                <span className="px-1.5 py-0.2 bg-slate-950 text-amber-400 rounded-md text-[9px] font-mono">
                  GACOR
                </span>
              </div>
              <div className="text-[10px] font-bold text-amber-950">
                Nota: {order.invoiceNo} • {order.customerName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              type="button"
              onClick={toggleSound}
              className="p-1.5 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors"
              title={soundActive ? 'Matikan Suara' : 'Nyalakan Suara'}
            >
              {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-700" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slot Machine Display Box */}
        <div className="p-4 sm:p-6 space-y-5 bg-radial from-slate-900 to-slate-950">
          
          {/* Slot Machine Reels Animation */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-amber-500/40 shadow-inner flex items-center justify-center gap-3">
            {reels.map((sym, idx) => (
              <div
                key={idx}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 ${
                  isJackpotTriggered ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)] scale-105' : 'border-amber-500/30'
                } flex items-center justify-center text-3xl sm:text-4xl shadow-md transition-all ${
                  isSpinning ? 'animate-pulse' : ''
                }`}
              >
                {sym}
              </div>
            ))}
          </div>

          {/* Sensational Jackpot Banner when triggered */}
          {isJackpotTriggered && (
            <div className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-white text-center font-black animate-bounce shadow-xl">
              <div className="text-sm sm:text-base tracking-widest uppercase">
                💥 SENSATIONAL 5-STAR MAXWIN! 💥
              </div>
              <div className="text-[11px] font-medium text-amber-100">
                Pakaian Wangi Gacor & Staf Mendapatkan Apresiasi Tertinggi!
              </div>
            </div>
          )}

          {/* Interactive Star Rating Selector */}
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-wider font-extrabold text-amber-400">
              Beri Bintang Kepuasan Cucian:
            </span>
            <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(rating)}
                    onClick={() => {
                      setRating(star);
                      soundEngine.playScanBeep();
                      if (star === 5) {
                        try {
                          confetti({ particleCount: 30, spread: 60, origin: { y: 0.5 } });
                        } catch {}
                      }
                    }}
                    className="p-1 rounded-2xl transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors drop-shadow-md ${
                        isLit
                          ? 'fill-amber-400 text-amber-400 animate-pulse'
                          : 'fill-slate-800 text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-sm font-extrabold text-white">
              {rating === 5 && '👑 SENSATIONAL MAXWIN 5-STAR! (Puas Banget!)'}
              {rating === 4 && '✨ MANTAP BERSIH & WANGI! (Bintang 4)'}
              {rating === 3 && '👍 Cukup Bagus & Rapi (Bintang 3)'}
              {rating === 2 && '⚠️ Biasa Saja (Bintang 2)'}
              {rating === 1 && '❌ Kurang Puas (Bintang 1)'}
            </div>
          </div>

          {/* Dopamine Tags (Slot Badges) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 block">
              Pilih Apa yang Paling Kamu Sukai dari Cucian Ini:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DOPAMINE_TAGS.map((t) => {
                const isSelected = selectedTags.includes(t.label);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTagToggle(t.label)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/50 scale-[1.02]'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-amber-400/20 text-amber-300">
                      {t.boost}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Testimonial Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 block">
              Pesan Ulasan untuk Tim Outlet & Staf:
            </label>
            <textarea
              rows={2}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tulis ulasan Anda di sini..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Optional Tip for Staf Borongan */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Beri Tip Sukarela untuk Staf (Opsional):</span>
              </span>
              <span className="font-mono text-white">Rp {tipAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono font-bold">
              {[0, 2000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setTipAmount(amt);
                    soundEngine.playSpinClick();
                  }}
                  className={`py-1.5 rounded-lg border text-center transition-all ${
                    tipAmount === amt
                      ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {amt === 0 ? 'Tanpa Tip' : `Rp ${amt / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Gacor Button */}
          <button
            type="button"
            disabled={isSpinning}
            onClick={handleSubmit}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-500/30 transition-all transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-5 h-5 text-slate-950 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>
              {isSpinning
                ? '🎰 MEMUTAR SLOT DOPAMINE...'
                : '🚀 KLAIM SENSATIONAL REVIEW & SIMPAN'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
