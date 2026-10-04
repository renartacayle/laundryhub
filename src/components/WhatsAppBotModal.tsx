import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  CheckCheck,
  Phone,
  Copy,
  ExternalLink,
  Clock,
  Sparkles,
  CheckCircle2,
  Bell,
  RefreshCw,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { soundEngine } from '../utils/audio';

interface WhatsAppBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export const WhatsAppBotModal: React.FC<WhatsAppBotModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const { branches, currentBranchId } = useApp();
  const currentBranch = branches.find((b) => b.id === (order?.branchId || currentBranchId)) || branches[0];

  const [activeTemplate, setActiveTemplate] = useState<
    'receipt' | 'station_progress' | 'ready_pickup' | 'reminder_3days'
  >('receipt');

  const [isSendingSimulated, setIsSendingSimulated] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  // Format customer phone for wa.me link (standardize Indonesian numbers: 08xx -> 628xx)
  const rawPhone = order.customerPhone || '081234567890';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.substring(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;

  const branchName = currentBranch?.name || 'LaundryHub Express';
  const outletAddress = currentBranch?.address || 'Jl. Surya Utama No. 88, Mampang';
  const trackingUrl = `${window.location.origin}?track=${order.invoiceNo}`;
  const serviceName = order.items?.map((i) => i.serviceName).join(', ') || 'Laundry Express';

  // Generate templates based on order data
  const generateMessage = (template: typeof activeTemplate): string => {
    switch (template) {
      case 'receipt':
        return `*🧾 NOTA ELEKTRONIK LAUNDRYHUB*
Halo Kak *${order.customerName}*! Terima kasih telah mempercayakan pakaian Anda di *${branchName}*.

📋 *No. Nota:* ${order.invoiceNo}
📅 *Tanggal:* ${order.createdAt}
🧺 *Layanan:* ${serviceName}
⚖️ *Jumlah:* ${order.weightKg ? `${order.weightKg} Kg` : `${order.itemCount || 1} Pcs`}
💰 *Total Biaya:* Rp ${order.finalPrice.toLocaleString('id-ID')}
💳 *Status Bayar:* ${order.paymentStatus === 'lunas' ? 'LUNAS ✅' : 'BELUM LUNAS ⏳'}
${order.appliedPromoReward ? `🎁 *Promo:* ${order.appliedPromoReward}\n` : ''}
📍 *Live Tracking Status Cucian:*
${trackingUrl}

_Pakaian Anda diproses higienis dengan standar operasional terbaik kami._`;

      case 'station_progress':
        return `*🧺 UPDATE PROGRES CUCIAN - LAUNDRYHUB*
Halo Kak *${order.customerName}*!
Pakaian Anda dengan No. Nota *${order.invoiceNo}* saat ini sedang dalam proses pengerjaan:

📍 *Stasiun:* ${order.currentStatus.toUpperCase()}
👨‍🔧 *Operator QC:* Tim Produksi ${branchName}
⏰ *Estimasi Selesai:* ${order.estReadyDate || 'Hari ini'}

Pantau live camera & status di:
${trackingUrl}`;

      case 'ready_pickup':
        return `*✨ CUCIAN SUDAH BERES & SIAP DIAMBIL!*
Halo Kak *${order.customerName}*!
Kabar gembira! Cucian Anda dengan No. Nota *${order.invoiceNo}* telah selesai dicuci, disetrika rapi, dan dikemas wangi semerbak.

🏢 *Ambil di:* ${branchName} (${outletAddress})
⏰ *Jam Buka Outlet:* 07.00 - 22.00 WIB
💵 *Sisa Pembayaran:* ${order.paymentStatus === 'lunas' ? 'LUNAS (Tinggal ambil)' : `Rp ${order.finalPrice.toLocaleString('id-ID')}`}

Tunjukkan pesan/nota ini ke kasir kami ya kak. Terima kasih! 🙏`;

      case 'reminder_3days':
        return `*⏰ PENGINGAT PENGAMBILAN CUCIAN (H+3)*
Halo Kak *${order.customerName}*, mohon maaf mengganggu waktunya sebentar.
Cucian wangi Anda dengan No. Nota *${order.invoiceNo}* sudah selesai sejak 3 hari yang lalu dan tersimpan rapi di rak kami.

Agar pakaian tetap segar dan tidak menumpuk di outlet, mohon untuk segera diambil ya kak:
📍 *Outlet:* ${branchName} (${outletAddress})

Butuh layanan antar ke rumah? Balas pesan ini untuk request Kurir Express kami! 🛵💨`;
    }
  };

  const currentMessage = generateMessage(activeTemplate);

  const handleOpenWhatsAppWeb = () => {
    soundEngine.playScanBeep();
    const encoded = encodeURIComponent(currentMessage);
    const url = `https://wa.me/${formattedPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleSimulateWebhook = () => {
    setIsSendingSimulated(true);
    setSentSuccess(false);
    soundEngine.playSpinClick();

    setTimeout(() => {
      setIsSendingSimulated(false);
      setSentSuccess(true);
      soundEngine.playStationDing();
      setTimeout(() => setSentSuccess(false), 3500);
    }, 1200);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    soundEngine.playStationDing();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[95vh]">
        
        {/* WhatsApp Business Header */}
        <div className="p-3 sm:p-4 bg-emerald-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-300 font-bold border-2 border-emerald-400">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-emerald-700 rounded-full" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  WhatsApp Auto-Pilot Engine
                </h3>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-800 text-emerald-200 font-medium">
                  Verified API
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Kirim ke: <strong>{order.customerName}</strong> ({rawPhone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-emerald-800/80 text-emerald-100 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Pills */}
        <div className="bg-slate-950 border-b border-slate-800 p-2 sm:p-3 flex overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTemplate('receipt')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTemplate === 'receipt'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>🧾</span>
            <span>e-Nota & Link Tracking</span>
          </button>
          <button
            onClick={() => setActiveTemplate('station_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTemplate === 'station_progress'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>🧺</span>
            <span>Update Progres Stasiun</span>
          </button>
          <button
            onClick={() => setActiveTemplate('ready_pickup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTemplate === 'ready_pickup'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>✨</span>
            <span>Siap Diambil</span>
          </button>
          <button
            onClick={() => setActiveTemplate('reminder_3days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              activeTemplate === 'reminder_3days'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>⏰</span>
            <span>Reminder H+3</span>
          </button>
        </div>

        {/* WhatsApp Phone Mockup Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/80 flex flex-col justify-between">
          <div className="max-w-md mx-auto w-full bg-[#0b141a] rounded-2xl p-4 border border-slate-800 shadow-inner relative overflow-hidden">
            {/* WhatsApp Wallpaper subtle pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#25d366_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Simulated Chat Bubble */}
            <div className="flex justify-start mb-2">
              <div className="max-w-[92%] bg-[#005c4b] text-slate-100 rounded-2xl rounded-tl-sm p-3.5 shadow-md relative text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {currentMessage}
                <div className="flex items-center justify-end space-x-1 mt-2 text-[10px] text-emerald-200/80">
                  <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                </div>
              </div>
            </div>

            {/* Success toast if simulated */}
            {sentSuccess && (
              <div className="mt-3 p-2 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Pesan WhatsApp Webhook terkirim ke gateway penerima!</span>
              </div>
            )}
          </div>

          {/* Quick Stats on bottom of preview */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Biaya Kirim</span>
              <span className="font-bold text-emerald-400">Rp 0 (Free Bot)</span>
            </div>
            <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Deliverability</span>
              <span className="font-bold text-cyan-400">99.8% Garansi</span>
            </div>
            <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">No. Nota</span>
              <span className="font-mono text-slate-300">{order.invoiceNo}</span>
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
          {/* Direct WhatsApp CTA Button */}
          <button
            onClick={handleOpenWhatsAppWeb}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-lg shadow-emerald-900/40 flex items-center justify-center space-x-2 active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            <span>Kirim via WhatsApp (wa.me)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Auto Cloud Webhook Send Simulation */}
          <button
            onClick={handleSimulateWebhook}
            disabled={isSendingSimulated}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold text-xs sm:text-sm rounded-xl border border-emerald-500/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isSendingSimulated ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Kirim via Bot Otomatis</span>
              </>
            )}
          </button>

          {/* Copy text button */}
          <button
            onClick={handleCopy}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition flex items-center justify-center"
            title="Salin Teks Pesan"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
