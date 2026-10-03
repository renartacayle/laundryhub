import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QrCode, X, CheckCircle, Clock, ShieldCheck, Sparkles, Copy, Check, Radio } from 'lucide-react';
import { paymentGateway } from '../services/paymentGateway';

interface QrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  invoiceNo: string;
  onPaymentSuccess: () => void;
}

export const QrisModal: React.FC<QrisModalProps> = ({
  isOpen,
  onClose,
  amount,
  invoiceNo,
  onPaymentSuccess,
}) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAutoChecking, setIsAutoChecking] = useState(true);

  // Use official SpeedCash / RENARTASHOP QRIS payload
  const qrisPayload = paymentGateway.getRawStaticQris();

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(300);
      setIsProcessing(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleCopyPayload = () => {
    navigator.clipboard?.writeText?.(qrisPayload);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSimulateWebhookSuccess = () => {
    setIsProcessing(true);
    paymentGateway.simulateBankWebhook(invoiceNo);

    setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
      setIsProcessing(false);
      onPaymentSuccess();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-center">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-wider text-rose-500">QRIS</span>
            <span className="text-xs text-slate-400">Pembayaran Digital Realtime</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Box */}
        <div className="p-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Berlaku hingga: <strong className="font-mono text-amber-300">{formattedTime}</strong></span>
          </div>

          <div className="text-xs text-slate-400">Total Tagihan / Grand Total:</div>
          <div className="text-2xl font-black text-cyan-400 mt-0.5 tracking-tight flex items-baseline gap-2">
            <span>Rp {amount.toLocaleString('id-ID')}</span>
            <span className="text-xs font-normal text-slate-400 font-mono">
              (~${(amount / 16000).toFixed(2)} USD)
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 mb-3">{invoiceNo}</div>

          {/* QR Code Frame */}
          <div className="p-3 bg-white rounded-2xl shadow-inner border-4 border-slate-700 relative group flex flex-col items-center">
            {/* Real Merchant QR Code Image */}
            <div className="relative w-52 h-52 bg-white rounded-xl overflow-hidden flex items-center justify-center">
              <img
                src="/qris_crop.png"
                alt="QRIS RENARTASHOP"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-2 text-center">
              <div className="text-[12px] font-black text-slate-900 tracking-wider">RENARTASHOP</div>
              <div className="text-[10px] text-slate-600 font-mono">NMID: ID1025407037114</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>QRIS Nasional SpeedCash Terverifikasi (Semarang)</span>
          </div>

          {/* ASEAN Cross-Border Badges */}
          <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
              🇸🇬 NETS Singapore
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
              🇲🇾 DuitNow Malaysia
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
              🇹🇭 PromptPay Thailand
            </span>
          </div>

          {/* Webhook Radar Indicator */}
          <div className="mt-3 w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                Webhook Live Listener:
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">READY</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">
              Menunggu callback notifikasi dari BCA / Mandiri / GoPay / ShopeePay...
            </div>
          </div>

          {/* EMVCo Raw String copy */}
          <div className="mt-2 w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
            <span className="font-mono text-slate-400 truncate max-w-[220px]">
              {qrisPayload}
            </span>
            <button
              onClick={handleCopyPayload}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold flex items-center gap-1 transition-colors"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{isCopied ? 'Tersalin' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Action Button: Simulator Callback */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
          <button
            onClick={handleSimulateWebhookSuccess}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-glow-emerald disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">Memproses Webhook Bank QRIS...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simulasi Pelanggan Scan & Bayar (Kirim Webhook)</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Batalkan Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
};
