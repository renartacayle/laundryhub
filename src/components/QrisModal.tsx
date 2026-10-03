import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QrCode, X, CheckCircle, Clock, ShieldCheck, Sparkles, Copy, Check, Radio, Settings, Store, Upload } from 'lucide-react';
import { paymentGateway, generateDynamicQrisPayload } from '../services/paymentGateway';
import { getOutletQrisConfig, OutletQrisConfig } from '../utils/outletQris';
import { OutletQrisConfigModal } from './OutletQrisConfigModal';
import { Branch } from '../types';

interface QrisModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  invoiceNo: string;
  onPaymentSuccess: () => void;
  isDeveloperTopup?: boolean;
  outletBranch?: Branch;
}

export const QrisModal: React.FC<QrisModalProps> = ({
  isOpen,
  onClose,
  amount,
  invoiceNo,
  onPaymentSuccess,
  isDeveloperTopup = false,
  outletBranch,
}) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [outletConfig, setOutletConfig] = useState<OutletQrisConfig>(getOutletQrisConfig());

  // Listen to cross-component QRIS updates
  useEffect(() => {
    const handleUpdate = () => {
      setOutletConfig(getOutletQrisConfig());
    };
    window.addEventListener('lh_outlet_qris_updated', handleUpdate);
    return () => window.removeEventListener('lh_outlet_qris_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(300);
      setIsProcessing(false);
      return;
    }

    setOutletConfig(getOutletQrisConfig());

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Determine QR details
  // 1. Developer Top-up: Always User's Real SpeedCash QRIS
  // 2. Outlet Laundry Customer: Shop's uploaded QRIS or generated QRIS
  const merchantName = isDeveloperTopup
    ? 'RENARTASHOP'
    : (outletConfig.merchantName || outletBranch?.name || 'LAUNDRYHUB EXPRESS');

  const merchantNmid = isDeveloperTopup
    ? 'ID1025407037114'
    : (outletConfig.nmid || 'ID1020023910291');

  const merchantCity = isDeveloperTopup
    ? 'SEMARANG'
    : (outletConfig.merchantCity || 'JAKARTA');

  const qrImageUrl = isDeveloperTopup
    ? '/qris_crop.png'
    : (outletConfig.imageUrl || '/qris_crop.png');

  // Payload string
  const dynamicPayload = isDeveloperTopup
    ? paymentGateway.getRawStaticQris()
    : generateDynamicQrisPayload(invoiceNo, amount, merchantName, merchantCity, merchantNmid);

  const handleCopyPayload = () => {
    navigator.clipboard?.writeText?.(dynamicPayload);
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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-center my-6">
          {/* Top Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-800/40">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wider text-rose-500">QRIS</span>
              <span className="text-xs text-slate-300 font-medium">
                {isDeveloperTopup ? 'Beli Token Developer' : 'Pembayaran Cucian Outlet'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {!isDeveloperTopup && (
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(true)}
                  title="Atur / Upload QRIS Toko Anda"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                >
                  <Settings className="w-4 h-4" />
                  <span>Ubah QR</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Model 1 Clear Money Flow Notification */}
          <div className="px-5 pt-3">
            {isDeveloperTopup ? (
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-[11px] text-purple-200 text-left">
                <strong>💎 Beli Kuota Token Software:</strong>
                <p className="text-[10px] text-slate-300 mt-0.5">
                  Uang top-up koin masuk ke rekening Developer (<strong>RENARTASHOP</strong>).
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-200 text-left flex items-start justify-between gap-2">
                <div>
                  <strong>👕 Uang Cucian Masuk ke Warung:</strong>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    100% langsung masuk ke rekening warung laundry Anda ({merchantName}).
                  </p>
                </div>
                {!isDeveloperTopup && !outletConfig.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setIsConfigOpen(true)}
                    className="shrink-0 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] transition-colors"
                  >
                    + Upload QR Toko
                  </button>
                )}
              </div>
            )}
          </div>

          {/* QR Box */}
          <div className="p-5 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 mb-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Berlaku hingga: <strong className="font-mono text-amber-300">{formattedTime}</strong></span>
            </div>

            <div className="text-xs text-slate-400">Total Tagihan:</div>
            <div className="text-2xl font-black text-cyan-400 mt-0.5 tracking-tight flex items-baseline gap-2">
              <span>Rp {amount.toLocaleString('id-ID')}</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                (~${(amount / 16000).toFixed(2)} USD)
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 mb-3">{invoiceNo}</div>

            {/* QR Code Frame */}
            <div className="p-3 bg-white rounded-2xl shadow-inner border-4 border-slate-700 relative group flex flex-col items-center">
              {/* QR Image */}
              <div className="relative w-48 h-48 bg-white rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  src={qrImageUrl}
                  alt={`QRIS ${merchantName}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="mt-2 text-center max-w-[220px]">
                <div className="text-[12px] font-black text-slate-900 tracking-wider truncate uppercase">
                  {merchantName}
                </div>
                <div className="text-[10px] text-slate-600 font-mono truncate">
                  NMID: {merchantNmid}
                </div>
                <div className="text-[9px] text-slate-500 uppercase">{merchantCity}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isDeveloperTopup
                  ? 'QRIS Resmi Developer SpeedCash (Semarang)'
                  : `QRIS Toko Resmi ${merchantName}`}
              </span>
            </div>

            {/* ASEAN Cross-Border Badges */}
            <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                🇸🇬 NETS
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                🇲🇾 DuitNow
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                🇹🇭 PromptPay
              </span>
            </div>

            {/* Webhook Radar Indicator */}
            <div className="mt-3 w-full p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-left text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  Webhook Listener:
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">READY</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Menunggu notifikasi pembayaran dari m-Banking / e-Wallet...
              </div>
            </div>

            {/* EMVCo Raw String copy */}
            <div className="mt-2 w-full flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
              <span className="font-mono text-slate-400 truncate max-w-[210px]">
                {dynamicPayload}
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
                <span className="flex items-center gap-2">Memverifikasi Webhook Pembayaran...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Simulasi Pelanggan Scan & Bayar (Kirim Webhook)</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Batalkan Pembayaran
            </button>
          </div>
        </div>
      </div>

      {/* Outlet QRIS Configuration Modal */}
      <OutletQrisConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        branchName={outletBranch?.name}
      />
    </>
  );
};

