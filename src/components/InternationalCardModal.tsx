import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CreditCard, X, ShieldCheck, Lock, Sparkles, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency, idrToUsd, Currency } from '../utils/currency';
import { translations, Language } from '../utils/i18n';

interface InternationalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountInIdr: number;
  invoiceNo: string;
  onPaymentSuccess: () => void;
  lang?: Language;
}

export const InternationalCardModal: React.FC<InternationalCardModalProps> = ({
  isOpen,
  onClose,
  amountInIdr,
  invoiceNo,
  onPaymentSuccess,
  lang = 'en',
}) => {
  const t = translations[lang] || translations.en;

  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('883');
  const [cardholderName, setCardholderName] = useState('John Doe');
  const [country, setCountry] = useState('US');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const amountUsd = idrToUsd(amountInIdr);

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setIsSuccess(false);
        onPaymentSuccess();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{t.cardModal.title}</h3>
              <p className="text-[11px] text-slate-400">{t.cardModal.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Summary */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Total International Charge:</div>
            <div className="text-2xl font-black text-cyan-400 tracking-tight">
              ${amountUsd.toFixed(2)} <span className="text-xs font-normal text-slate-400 font-mono">USD</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400">Equivalent IDR:</span>
            <div className="text-xs font-bold text-slate-300 font-mono">
              Rp {amountInIdr.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">{invoiceNo}</div>
          </div>
        </div>

        {/* Card Form */}
        <form onSubmit={handleCardPayment} className="p-6 space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{t.cardModal.cardNumber}</span>
              <div className="flex items-center gap-1.5 opacity-80">
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300">VISA</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300">MC</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300">AMEX</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300">PAYPAL</span>
              </div>
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4000 1234 5678 9010"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
                required
              />
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Expiry & CVC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.cardModal.cardExpiry}
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white text-center focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.cardModal.cardCvc}
              </label>
              <input
                type="password"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="CVC"
                maxLength={4}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white text-center focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          {/* Cardholder Name & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.cardModal.cardholderName}
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.cardModal.billingCountry}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="US">🇺🇸 United States</option>
                <option value="AU">🇦🇺 Australia</option>
                <option value="SG">🇸🇬 Singapore</option>
                <option value="MY">🇲🇾 Malaysia</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="JP">🇯🇵 Japan</option>
                <option value="DE">🇩🇪 Germany</option>
                <option value="ID">🇮🇩 Indonesia</option>
                <option value="GLOBAL">🌐 Other Country</option>
              </select>
            </div>
          </div>

          {/* Security badge */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{t.cardModal.securityBadge}</span>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing || isSuccess}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-glow-cyan disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2 text-white">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.cardModal.processing}
                </span>
              ) : isSuccess ? (
                <span className="flex items-center gap-1.5 text-emerald-950 font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  Payment Approved! Settling USD...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.cardModal.payNow} (${amountUsd.toFixed(2)} USD)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
