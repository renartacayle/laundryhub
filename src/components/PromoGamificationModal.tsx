import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Gift,
  Award,
  RefreshCw,
  CheckCircle2,
  Share2,
  Copy,
  Sliders,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GamificationPrize } from '../types';
import { soundEngine } from '../utils/audio';

interface PromoGamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromoGamificationModal: React.FC<PromoGamificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    gamificationSettings,
    gamificationContext,
    applyGamificationReward,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'wheel' | 'scratch'>('wheel');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<GamificationPrize | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasScratched, setHasScratched] = useState(false);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spinAngleRef = useRef<number>(0);
  const spinVelocityRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const prizes = gamificationSettings.prizes.length > 0 ? gamificationSettings.prizes : [];

  // Initialize or reset when opened
  useEffect(() => {
    if (isOpen) {
      setWonPrize(null);
      setShowCelebration(false);
      setHasScratched(false);
      setScratchPercent(0);
      setCopiedCode(false);

      if (gamificationSettings.gameType === 'scratch') {
        setActiveTab('scratch');
      } else {
        setActiveTab('wheel');
      }

      // Draw initial wheel
      setTimeout(() => {
        drawWheel(spinAngleRef.current);
      }, 50);
    }
  }, [isOpen, gamificationSettings]);

  // Redraw wheel when activeTab changes to wheel
  useEffect(() => {
    if (activeTab === 'wheel') {
      setTimeout(() => {
        drawWheel(spinAngleRef.current);
      }, 50);
    } else if (activeTab === 'scratch') {
      setTimeout(() => {
        initScratchCanvas();
      }, 50);
    }
  }, [activeTab]);

  // Draw the lucky spin wheel
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas || prizes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 16;
    const numSegments = prizes.length;
    const arc = (2 * Math.PI) / numSegments;

    ctx.clearRect(0, 0, width, height);

    // Outer glow ring
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#f59e0b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // Wheel segments
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    for (let i = 0; i < numSegments; i++) {
      const prize = prizes[i];
      const startAngle = i * arc;
      const endAngle = startAngle + arc;

      // Slice
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();

      // Border between slices
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Text and Icon
      ctx.save();
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      const label = `${prize.icon || '🎁'} ${prize.label}`;
      ctx.fillText(label, radius - 16, 4);
      ctx.restore();
    }

    ctx.restore();

    // Center hub
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Star in center
    ctx.fillStyle = '#f59e0b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', centerX, centerY);
    ctx.restore();
  };

  // Spin the wheel with natural easing & tick sounds
  const handleStartSpin = () => {
    if (isSpinning || prizes.length === 0) return;
    setIsSpinning(true);
    setWonPrize(null);
    setShowCelebration(false);

    // Pick winning prize based on probabilities
    const rand = Math.random() * 100;
    let accum = 0;
    let selectedIndex = 0;
    for (let i = 0; i < prizes.length; i++) {
      accum += prizes[i].probability;
      if (rand <= accum) {
        selectedIndex = i;
        break;
      }
    }
    const chosenPrize = prizes[selectedIndex];

    // Compute target stop angle
    const numSegments = prizes.length;
    const arc = (2 * Math.PI) / numSegments;
    // Pointer is at the top (angle = 3 * Math.PI / 2 or -Math.PI / 2)
    // To land on selectedIndex, angle offset needs to align
    const targetSliceAngle = selectedIndex * arc + arc / 2;
    const baseRotations = 6 * 2 * Math.PI; // 6 full turns
    const targetTotalAngle =
      baseRotations + (3 * Math.PI) / 2 - targetSliceAngle + (Math.random() * 0.4 - 0.2) * arc;

    let currentAngle = spinAngleRef.current % (2 * Math.PI);
    const totalDistance = targetTotalAngle - currentAngle;
    const duration = 4500; // ms
    const startTime = performance.now();
    let lastTickIndex = -1;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const newAngle = currentAngle + totalDistance * easeProgress;
      spinAngleRef.current = newAngle;

      // Play tick sound when passing slice lines
      const currentSlice = Math.floor(((newAngle % (2 * Math.PI)) / arc));
      if (currentSlice !== lastTickIndex && progress < 0.95) {
        lastTickIndex = currentSlice;
        soundEngine.playSpinClick();
      }

      drawWheel(newAngle);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWonPrize(chosenPrize);
        setShowCelebration(true);
        if (chosenPrize.type !== 'zonk') {
          soundEngine.playDopamineJackpot();
        } else {
          soundEngine.playStationDing();
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  // Scratch Card Canvas Initialization
  const initScratchCanvas = () => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pick prize for scratch card
    if (!wonPrize) {
      const rand = Math.random() * 100;
      let accum = 0;
      let picked = prizes[0];
      for (const p of prizes) {
        accum += p.probability;
        if (rand <= accum) {
          picked = p;
          break;
        }
      }
      setWonPrize(picked);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Silver metallic gradient foil
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.25, '#cbd5e1');
    grad.addColorStop(0.5, '#64748b');
    grad.addColorStop(0.75, '#e2e8f0');
    grad.addColorStop(1, '#94a3b8');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Metallic pattern & text overlay
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✨ GOSOK DI SINI DENGAN JARI / MOUSE ✨', canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Temukan Hadiah Kejutan Cuci Anda!', canvas.width / 2, canvas.height / 2 + 14);

    setScratchPercent(0);
    setHasScratched(false);
  };

  // Handle Scratch Action
  const scratch = (clientX: number, clientY: number) => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    soundEngine.playSpinClick();

    // Check scratch percentage approximately every 10 scratches
    if (Math.random() > 0.6) {
      calculateScratchPercent();
    }
  };

  const calculateScratchPercent = () => {
    const canvas = scratchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;
      let transparentCount = 0;
      const totalPixels = pixels.length / 4;

      // Sample every 16th pixel for performance
      for (let i = 3; i < pixels.length; i += 16 * 4) {
        if (pixels[i] < 128) {
          transparentCount++;
        }
      }

      const percent = Math.min(100, Math.round((transparentCount / (totalPixels / 16)) * 100));
      setScratchPercent(percent);

      if (percent >= 45 && !hasScratched) {
        setHasScratched(true);
        setShowCelebration(true);
        // Clear remaining foil
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (wonPrize && wonPrize.type !== 'zonk') {
          soundEngine.playDopamineJackpot();
        } else {
          soundEngine.playStationDing();
        }
      }
    } catch {
      // ignore
    }
  };

  const handleApplyToOrder = () => {
    if (!wonPrize || wonPrize.type === 'zonk') return;
    const orderId = gamificationContext?.orderId;
    if (orderId) {
      let discountAmount = 0;
      if (wonPrize.type === 'discount_fixed') {
        discountAmount = wonPrize.value;
      } else if (wonPrize.type === 'discount_percent' && gamificationContext?.finalPrice) {
        discountAmount = Math.round((gamificationContext.finalPrice * wonPrize.value) / 100);
      }
      applyGamificationReward(orderId, wonPrize.label, discountAmount);
      onClose();
    }
  };

  const voucherCode = `LUCKY-${wonPrize?.type.toUpperCase().substring(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopiedCode(true);
    soundEngine.playStationDing();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[95vh]">
        
        {/* Header with Dopamine Neon Glow */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-orange-600 to-pink-600 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-300/20 via-transparent to-transparent pointer-events-none" />
          <div className="flex items-center space-x-3 relative z-10">
            <div className="p-2.5 bg-black/20 rounded-2xl backdrop-blur-md border border-white/20">
              <Sparkles className="w-6 h-6 text-yellow-200 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg sm:text-xl tracking-wide text-white drop-shadow">
                  LUCKY REWARD CUAN
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-900 shadow">
                  PROMO
                </span>
              </div>
              <p className="text-xs text-amber-100">
                {gamificationContext?.customerName
                  ? `Khusus Pelanggan: ${gamificationContext.customerName}`
                  : 'Putar & Menangkan Diskon Cuci Spesial!'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Mode Tabs if configured 'both' */}
        {gamificationSettings.gameType === 'both' && (
          <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-2 px-4">
            <button
              onClick={() => setActiveTab('wheel')}
              disabled={isSpinning}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'wheel'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🎡</span>
              <span>Lucky Spin Wheel</span>
            </button>
            <button
              onClick={() => setActiveTab('scratch')}
              disabled={isSpinning}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'scratch'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🎫</span>
              <span>Scratch Card (Gosok)</span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
          
          {/* TAB 1: LUCKY SPIN WHEEL */}
          {activeTab === 'wheel' && (
            <div className="flex flex-col items-center w-full">
              {/* Wheel Container with Pointer */}
              <div className="relative my-2">
                {/* Pointer / Ticker Arrow */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                  <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-yellow-400" />
                </div>

                {/* Canvas */}
                <canvas
                  ref={canvasRef}
                  width={310}
                  height={310}
                  className="rounded-full shadow-[0_0_35px_rgba(245,158,11,0.25)] border-4 border-slate-800"
                />
              </div>

              {/* Spin Action Button */}
              <div className="w-full mt-4">
                <button
                  onClick={handleStartSpin}
                  disabled={isSpinning}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-base uppercase tracking-wider shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isSpinning
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 hover:from-amber-300 hover:to-orange-400 text-slate-950 hover:scale-[1.02] active:scale-[0.98] shadow-amber-500/25 ring-2 ring-yellow-400/50'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>{isSpinning ? 'Sedang Memutar Roda...' : 'PUTAR RODA SEKARANG (GRATIS)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCRATCH CARD */}
          {activeTab === 'scratch' && (
            <div className="flex flex-col items-center w-full">
              <div className="text-center mb-3">
                <span className="text-xs text-slate-400">
                  Gosok permukaan logam di bawah untuk melihat kupon hadiah Anda!
                </span>
                {scratchPercent > 0 && scratchPercent < 45 && (
                  <div className="mt-1 text-xs text-amber-400 font-semibold">
                    Terbuka: {scratchPercent}% (Gosok lebih dari 45% untuk klaim!)
                  </div>
                )}
              </div>

              {/* Scratch Container */}
              <div className="relative w-[320px] h-[170px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center">
                {/* Prize Content Underneath */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-0">
                  {wonPrize ? (
                    <>
                      <div className="text-3xl mb-1">{wonPrize.icon || '🎁'}</div>
                      <h4 className="text-lg font-black text-amber-300 drop-shadow">
                        {wonPrize.label}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 max-w-[240px]">
                        {wonPrize.description}
                      </p>
                      <div className="mt-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-[11px] font-mono text-yellow-300 font-bold">
                        {voucherCode}
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400 text-sm">Sedang memuat hadiah...</div>
                  )}
                </div>

                {/* Scratch Canvas Foil Overlay */}
                <canvas
                  ref={scratchCanvasRef}
                  width={320}
                  height={170}
                  className="absolute inset-0 z-10 cursor-crosshair touch-none select-none"
                  onMouseMove={(e) => {
                    if (e.buttons === 1) scratch(e.clientX, e.clientY);
                  }}
                  onMouseDown={(e) => scratch(e.clientX, e.clientY)}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    if (touch) scratch(touch.clientX, touch.clientY);
                  }}
                  onTouchStart={(e) => {
                    const touch = e.touches[0];
                    if (touch) scratch(touch.clientX, touch.clientY);
                  }}
                />
              </div>

              {/* Reset button for testing scratch */}
              <button
                onClick={initScratchCanvas}
                className="mt-3 text-xs text-slate-400 hover:text-amber-400 flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ganti Kartu Baru</span>
              </button>
            </div>
          )}

          {/* CELEBRATION & PRIZE MODAL BANNER */}
          {showCelebration && wonPrize && (
            <div className="mt-5 w-full bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-yellow-500/15 border-2 border-amber-400/40 rounded-2xl p-4 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
              <div className="text-4xl animate-bounce mb-2">
                {wonPrize.type === 'zonk' ? '😅' : '🎊'}
              </div>
              <h4 className="text-base sm:text-lg font-black text-amber-300">
                {wonPrize.type === 'zonk'
                  ? 'Tetap Semangat! Belum Beruntung'
                  : `SELAMAT! ANDA MENDAPATKAN:`}
              </h4>
              <p className="text-xl font-extrabold text-white mt-0.5">
                {wonPrize.label}
              </p>
              <p className="text-xs text-slate-300 mt-1 max-w-sm">
                {wonPrize.description}
              </p>

              {wonPrize.type !== 'zonk' && (
                <div className="w-full mt-4 flex flex-col sm:flex-row gap-2">
                  {/* Button apply to ongoing order if present */}
                  {gamificationContext?.orderId && (
                    <button
                      onClick={handleApplyToOrder}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Klaim ke Nota Ini</span>
                    </button>
                  )}

                  {/* Copy Voucher Code */}
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition flex items-center justify-center space-x-1.5"
                  >
                    {copiedCode ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Tersalin! ({voucherCode})</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Kode Voucher</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Owner Notice Badge */}
          <div className="mt-4 w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Trigger Owner:{' '}
                <strong className="text-slate-200">
                  {gamificationSettings.triggerEvent === 'after_payment'
                    ? 'Setelah Pembayaran'
                    : gamificationSettings.triggerEvent === 'min_spend'
                    ? `Min Belanja Rp ${gamificationSettings.minSpendAmount.toLocaleString('id-ID')}`
                    : 'Manual / Setelah Review'}
                </strong>
              </span>
            </div>
            <span className="text-amber-400 font-medium">
              {gamificationSettings.isEnabled ? 'Aktif' : 'Nonaktif'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>LAUNDRYHUB Dopamine Spin & Win</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
