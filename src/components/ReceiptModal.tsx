import React, { useState } from 'react';
import { Order, Branch } from '../types';
import { Printer, MessageSquare, X, CheckCircle2, QrCode, Bluetooth, Sparkles, AlertCircle } from 'lucide-react';
import { bluetoothPrinter, buildReceiptEscPosBytes } from '../utils/escpos';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/currency';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  branch?: Branch;
  onOpenWhatsApp?: (order: Order) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  branch,
  onOpenWhatsApp,
}) => {
  const { language, currency, t } = useApp();
  if (!isOpen || !order) return null;

  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [isBluetoothPrinting, setIsBluetoothPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleBluetoothPrint = async () => {
    setIsBluetoothPrinting(true);
    setPrintStatus({ type: 'idle', message: 'Menyiapkan byte stream ESC/POS...' });

    try {
      if (!bluetoothPrinter.isConnected) {
        setPrintStatus({ type: 'idle', message: 'Mencari printer bluetooth...' });
        const conn = await bluetoothPrinter.connect();
        if (!conn.success) {
          setPrintStatus({ type: 'error', message: conn.message });
          setIsBluetoothPrinting(false);
          return;
        }
      }

      // Generate ESC/POS byte commands
      const bytes = buildReceiptEscPosBytes(order, branch, paperWidth);
      const res = await bluetoothPrinter.printBytes(bytes);

      if (res.success) {
        setPrintStatus({ type: 'success', message: 'Struk terkirim ke printer thermal bluetooth!' });
        setTimeout(() => setPrintStatus({ type: 'idle', message: '' }), 4000);
      } else {
        setPrintStatus({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setPrintStatus({ type: 'error', message: err.message || 'Gagal cetak bluetooth' });
    } finally {
      setIsBluetoothPrinting(false);
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedEstReady = new Date(order.estReadyDate).toLocaleString(language === 'en' ? 'en-US' : 'id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              {language === 'en' ? 'Thermal Receipt' : 'Struk Thermal Kasir'} ({paperWidth})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Paper width toggle */}
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-700 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2 py-0.5 rounded ${
                  paperWidth === '58mm' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                58mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2 py-0.5 rounded ${
                  paperWidth === '80mm' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                80mm
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bluetooth status feedback if any */}
        {printStatus.message && (
          <div
            className={`px-4 py-2 text-xs flex items-center gap-2 border-b ${
              printStatus.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : printStatus.type === 'error'
                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                : 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
            }`}
          >
            {printStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : printStatus.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            )}
            <span className="truncate">{printStatus.message}</span>
          </div>
        )}

        {/* Receipt Content Box (Thermal simulation) */}
        <div className="p-6 bg-slate-950/60 overflow-y-auto max-h-[65vh]">
          <div
            id="printable-receipt"
            className="w-full max-w-[340px] mx-auto bg-white text-slate-900 p-5 rounded-lg shadow-lg font-mono text-xs leading-relaxed border border-slate-200"
          >
            {/* Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400">
              <div className="font-extrabold text-base tracking-wider">LAUNDRYHUB</div>
              <div className="text-[10px] uppercase font-bold text-slate-700">
                {branch?.name || 'LaundryHub Express'}
              </div>
              <div className="text-[9px] text-slate-600 mt-0.5 leading-tight">
                {branch?.address || 'Jl. Kemang Raya No. 42B, Jakarta Selatan'}
              </div>
              <div className="text-[9px] text-slate-600">Telp/WA: {branch?.phone || '0812-8899-7701'}</div>
            </div>

            {/* Order Details */}
            <div className="py-2.5 border-b border-dashed border-slate-400 text-[10px] space-y-1">
              <div className="flex justify-between">
                <span>{language === 'en' ? 'Invoice No:' : 'No. Nota:'}</span>
                <span className="font-bold">{order.invoiceNo}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'en' ? 'Date:' : 'Tanggal:'}</span>
                <span>{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'en' ? 'Customer:' : 'Pelanggan:'}</span>
                <span className="font-bold">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'en' ? 'Phone:' : 'No. Telp:'}</span>
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'en' ? 'Fragrance:' : 'Parfum:'}</span>
                <span className="font-semibold text-purple-700">{order.perfumeName}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>{language === 'en' ? 'Est. Ready:' : 'Est. Selesai:'}</span>
                <span>{formattedEstReady}</span>
              </div>
            </div>

            {/* Items */}
            <div className="py-2.5 border-b border-dashed border-slate-400">
              <div className="font-bold text-[10px] pb-1 flex justify-between">
                <span>{language === 'en' ? 'Items & Services' : 'Item & Layanan'}</span>
                <span>Subtotal</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="text-[10px] py-1 border-b border-dotted border-slate-200 last:border-none">
                  <div className="font-semibold">{item.serviceName}</div>
                  <div className="flex justify-between text-slate-600 text-[9px]">
                    <span>
                      {item.quantity} {item.unit} x {formatCurrency(item.pricePerUnit, currency)}
                    </span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(item.subtotal, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="py-2 text-[10px] space-y-1 border-b border-dashed border-slate-400">
              <div className="flex justify-between text-slate-600">
                <span>{language === 'en' ? 'Total Weight / Items:' : 'Total Berat / Item:'}</span>
                <span>{order.weightKg > 0 ? `${order.weightKg} kg` : `${order.itemCount} ${language === 'en' ? 'items' : 'item'}`}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.totalPrice, currency)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>{language === 'en' ? 'Promo Discount:' : 'Diskon Promo:'}</span>
                  <span>- {formatCurrency(order.discount, currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                <span>{language === 'en' ? 'GRAND TOTAL:' : 'TOTAL AKHIR:'}</span>
                <span>
                  {formatCurrency(order.finalPrice, currency)}
                  {currency === 'USD' && (
                    <span className="text-[10px] text-slate-500 font-normal block text-right">
                      (~Rp {order.finalPrice.toLocaleString('id-ID')})
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>{language === 'en' ? 'Payment Method:' : 'Metode Bayar:'}</span>
                <span className="uppercase font-semibold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{language === 'en' ? 'Payment Status:' : 'Status Bayar:'}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    order.paymentStatus === 'lunas'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.paymentStatus === 'lunas'
                    ? (language === 'en' ? 'PAID IN FULL' : 'LUNAS')
                    : (language === 'en' ? 'PAYMENT PENDING' : 'BELUM LUNAS')}
                </span>
              </div>
            </div>

            {/* Special Notes */}
            {order.specialNotes && (
              <div className="py-2 border-b border-dashed border-slate-400 text-[9px] text-amber-900 bg-amber-50/70 p-1.5 rounded mt-1">
                <span className="font-bold">{language === 'en' ? 'Special Notes:' : 'Catatan Khusus:'}</span> {order.specialNotes}
              </div>
            )}

            {/* QR / Barcode Simulator */}
            <div className="pt-3 text-center">
              <div className="inline-block p-1 border border-slate-400 rounded bg-slate-50 mb-1">
                <div className="font-mono tracking-widest text-[10px] font-bold text-slate-800">
                  ||||| |||| |||||| |||| |||||
                </div>
              </div>
              <div className="text-[9px] text-slate-500">
                {language === 'en' ? 'Scan receipt for machine / online tracking' : 'Scan nota untuk tracking di mesin / website'}
              </div>
              <div className="text-[8px] text-slate-400 mt-2 leading-tight">
                {language === 'en' ? (
                  <>
                    * Claims/complaints must be reported within 24h with receipt.<br />
                    * Uncollected items &gt; 30 days are beyond our responsibility.<br />
                    * Thank you for trusting LAUNDRYHUB!
                  </>
                ) : (
                  <>
                    * Komplain wajib bawa nota maks 1x24 jam setelah ambil.<br />
                    * Pakaian tidak diambil &gt;30 hari di luar tanggung jawab kami.<br />
                    * Terima kasih atas kepercayaan Anda!
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleBluetoothPrint}
              disabled={isBluetoothPrinting}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Bluetooth className={`w-4 h-4 ${isBluetoothPrinting ? 'animate-spin' : ''}`} />
              <span>
                {isBluetoothPrinting
                  ? (language === 'en' ? 'Sending...' : 'Mengirim...')
                  : (language === 'en' ? `Print BT (${paperWidth})` : `Cetak BT (${paperWidth})`)}
              </span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>{language === 'en' ? 'Print PDF (Browser)' : 'Cetak Browser (PDF)'}</span>
            </button>
          </div>

          <button
            onClick={() => onOpenWhatsApp?.(order)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-glow-emerald"
          >
            <MessageSquare className="w-4 h-4" />
            <span>
              {language === 'en' ? 'Send Digital Receipt to Customer WhatsApp' : 'Kirim Nota Digital ke WhatsApp Pelanggan'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
