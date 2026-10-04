import React, { useState } from 'react';
import { Order, Branch } from '../types';
import { MessageSquare, Copy, ExternalLink, Check, X, Send } from 'lucide-react';

interface WhatsAppSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  branch?: Branch;
}

export const WhatsAppSimulatorModal: React.FC<WhatsAppSimulatorModalProps> = ({
  isOpen,
  onClose,
  order,
  branch,
}) => {
  const [templateType, setTemplateType] = useState<'created' | 'ready' | 'delivering'>('created');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  // Format clean phone number for wa.me
  let cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }

  const branchName = branch?.name || 'LaundryHub Kemang';
  const estReady = new Date(order.estReadyDate).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?nota=${order.invoiceNo}`
    : `https://laundryhub.app/?nota=${order.invoiceNo}`;

  const getMessageText = () => {
    if (templateType === 'created') {
      return `Halo Kak *${order.customerName}*! 👋
Terima kasih telah mempercayakan pakaian Anda di *${branchName}*.

Berikut detail nota cucian Anda:
📄 *No. Nota:* ${order.invoiceNo}
⚖️ *Total:* ${order.weightKg > 0 ? `${order.weightKg} kg` : `${order.itemCount} pcs`}
🌸 *Parfum:* ${order.perfumeName}
💰 *Total Biaya:* Rp ${order.finalPrice.toLocaleString('id-ID')} (${order.paymentStatus === 'lunas' ? '✅ LUNAS' : '⚠️ BELUM LUNAS'})
⏱️ *Est. Selesai:* ${estReady}

Lacak status progres pakaian Anda secara real-time di sini:
👉 ${trackingUrl}

Salam hangat,
*${branchName}*`;
    } else if (templateType === 'ready') {
      return `Hore! Pakaian Kak *${order.customerName}* SUDAH SELESAI & WANGI! ✨🧺

📄 *No. Nota:* ${order.invoiceNo}
🌸 *Parfum:* ${order.perfumeName}
💰 *Status Pembayaran:* ${order.paymentStatus === 'lunas' ? 'LUNAS (Tinggal Ambil)' : `Harap bayar Rp ${order.finalPrice.toLocaleString('id-ID')}`}

Pakaian sudah dipacking rapi dan siap diambil di outlet *${branchName}*. Kami tunggu kedatangannya ya Kak! 🙏

👉 Cek detail nota & riwayat: ${trackingUrl}`;
    } else {
      return `Halo Kak *${order.customerName}*! 🛵💨
Paket cucian Anda dengan *No. Nota ${order.invoiceNo}* sedang dalam perjalanan diantar oleh kurir kami ke alamat Anda.

${order.paymentStatus !== 'lunas' ? `💵 Siapkan uang pas COD: *Rp ${order.finalPrice.toLocaleString('id-ID')}*` : '✅ Pesanan sudah lunas.'}

Mohon pastikan nomor telepon aktif ya Kak. Terima kasih!`;
    }
  };

  const messageText = getMessageText();
  const encodedText = encodeURIComponent(messageText);
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWa = () => {
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-emerald-950/40">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Kirim Nota Digital WhatsApp</h3>
              <p className="text-xs text-slate-400">Penerima: {order.customerName} ({order.customerPhone})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Selector Tabs */}
        <div className="px-5 pt-3 pb-2 bg-slate-900/60 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setTemplateType('created')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              templateType === 'created'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            📋 Order Baru Dibuat
          </button>
          <button
            onClick={() => setTemplateType('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              templateType === 'ready'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            🎉 Siap Diambil
          </button>
          <button
            onClick={() => setTemplateType('delivering')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              templateType === 'delivering'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            🛵 Sedang Diantar
          </button>
        </div>

        {/* WhatsApp Preview Bubble */}
        <div className="p-5 bg-slate-950 space-y-4">
          <div className="bg-[#0b141a] p-4 rounded-xl border border-slate-800">
            <div className="text-[11px] font-semibold text-emerald-400 mb-2 flex items-center justify-between">
              <span>PREVIEW TAMPILAN WHATSAPP</span>
              <span className="text-slate-500 text-[10px]">Terkirim ke +{cleanPhone}</span>
            </div>
            {/* Chat Bubble */}
            <div className="bg-[#005c4b] text-emerald-50 p-3.5 rounded-2xl rounded-tl-sm text-xs whitespace-pre-line font-sans shadow-md border border-[#02735e]/40 leading-relaxed">
              {messageText}
              <div className="text-[9px] text-emerald-300/70 text-right mt-1 font-mono flex items-center justify-end gap-1">
                <span>Baru saja</span>
                <span>✓✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
          </button>
          <button
            onClick={handleOpenWa}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-glow-emerald"
          >
            <Send className="w-4 h-4" />
            <span>Buka WhatsApp Sekarang (wa.me)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
};
