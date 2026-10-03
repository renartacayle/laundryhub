import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  WashingMachine,
  Coins,
  ShoppingCart,
  Users,
  TrendingUp,
  FileText,
  Cpu,
  Globe,
  Sparkles,
  DollarSign,
  ArrowRight,
  X,
  Store,
  Bike,
  Megaphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCoinModal: () => void;
  onOpenIotModal: () => void;
  onOpenLandingModal: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onOpenCoinModal,
  onOpenIotModal,
  onOpenLandingModal,
}) => {
  const {
    orders,
    customers,
    machines,
    setCurrentRole,
    tokenCoins,
    language,
    setLanguage,
    currency,
    setCurrency,
    topupCoins,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  // Search results
  const filteredOrders = orders
    .filter(
      (o) =>
        o.invoiceNo.toLowerCase().includes(cleanQ) ||
        o.customerName.toLowerCase().includes(cleanQ) ||
        o.items.some((i) => i.serviceName.toLowerCase().includes(cleanQ))
    )
    .slice(0, 4);

  const filteredCustomers = customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(cleanQ) ||
        c.phone.toLowerCase().includes(cleanQ)
    )
    .slice(0, 4);

  // Quick Action Items
  const quickActions = [
    {
      id: 'act-pos',
      label: 'Buka Kasir POS Baru',
      sub: 'Input cucian kiloan & satuan dengan QRIS',
      icon: <ShoppingCart className="w-4 h-4 text-cyan-400" />,
      run: () => {
        setCurrentRole('kasir');
        onClose();
      },
    },
    {
      id: 'act-showcase',
      label: 'Kalkulator Penghematan Kasir (ROI)',
      sub: 'Lihat perbandingan biaya Rp 25/nota vs Moka/Majoo',
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
      run: () => {
        onClose();
        onOpenLandingModal();
      },
    },
    {
      id: 'act-coins',
      label: 'Beli Paket Kuota Nota / Top Up Koin',
      sub: `Saldo saat ini: ${tokenCoins.toLocaleString()} koin`,
      icon: <Coins className="w-4 h-4 text-amber-400" />,
      run: () => {
        onClose();
        onOpenCoinModal();
      },
    },
    {
      id: 'act-voucher',
      label: 'Klaim Kode Voucher Gratis RENA50 (+50 Nota)',
      sub: 'Aktifkan gratis 50 nota untuk outlet baru',
      icon: <Sparkles className="w-4 h-4 text-teal-400" />,
      run: () => {
        const redeemed: string[] = JSON.parse(localStorage.getItem('lh_redeemed_codes') || '[]');
        if (!redeemed.includes('RENA50')) {
          topupCoins(50);
          redeemed.push('RENA50');
          localStorage.setItem('lh_redeemed_codes', JSON.stringify(redeemed));
          alert('Selamat! Berhasil klaim 50 Nota Gratis dengan kode RENA50');
        } else {
          alert('Kode RENA50 sudah pernah diklaim sebelumnya di perangkat ini.');
        }
        onClose();
      },
    },
    {
      id: 'act-marketing',
      label: 'Pusat Marketing & Cold Outreach WhatsApp',
      sub: 'Kirim pesan pitch ke nomor laundry sekitar dari Google Maps',
      icon: <Megaphone className="w-4 h-4 text-emerald-400" />,
      run: () => {
        setCurrentRole('owner');
        onClose();
      },
    },
    {
      id: 'act-iot',
      label: 'Panel Kontrol Mesin Cuci IoT',
      sub: `${machines.filter((m) => m.status === 'running').length} mesin sedang berputar`,
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      run: () => {
        onClose();
        onOpenIotModal();
      },
    },
    {
      id: 'act-lang',
      label: language === 'id' ? 'Switch Language to English (🇬🇧)' : 'Ganti Bahasa ke Indonesia (🇮🇩)',
      sub: 'Bilingual engine untuk wisatawan asing',
      icon: <Globe className="w-4 h-4 text-blue-400" />,
      run: () => {
        setLanguage(language === 'id' ? 'en' : 'id');
        onClose();
      },
    },
    {
      id: 'act-curr',
      label: currency === 'IDR' ? 'Ubah Mata Uang ke Dollar ($ USD)' : 'Ubah Mata Uang ke Rupiah (Rp IDR)',
      sub: 'Konversi valuta asing otomatis',
      icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
      run: () => {
        setCurrency(currency === 'IDR' ? 'USD' : 'IDR');
        onClose();
      },
    },
  ].filter(
    (a) =>
      cleanQ === '' ||
      a.label.toLowerCase().includes(cleanQ) ||
      a.sub.toLowerCase().includes(cleanQ)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Bar Input (Google / ChatGPT style) */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama nota, nomor invoice, pelanggan, atau perintah..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono">
              ESC
            </kbd>
          )}
        </div>

        {/* Scrollable Results List */}
        <div className="overflow-y-auto p-3 space-y-4 text-xs">
          {/* Section 1: Invoices / Orders */}
          {cleanQ !== '' && filteredOrders.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Transaksi / Nota Ditemukan
              </div>
              {filteredOrders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => {
                    setCurrentRole('kasir');
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{o.invoiceNo}</span>
                        <span className="text-[10px] text-slate-400 font-normal">• {o.customerName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {o.items.map((i) => `${i.serviceName} (${i.quantity} ${i.unit})`).join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-cyan-300">
                      Rp {o.totalPrice.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {o.currentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 2: Customers */}
          {cleanQ !== '' && filteredCustomers.length > 0 && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pelanggan Terdaftar
              </div>
              {filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCurrentRole('kasir');
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{c.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Total Order: {c.totalOrdersCount}x</div>
                    <span className="text-[10px] font-bold text-emerald-400">
                      Deposit: Rp {c.depositBalance.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 3: Quick Navigation Actions */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Aksi Cepat & Navigasi</span>
              <span className="text-slate-500 font-mono">1-Click Jump</span>
            </div>
            {quickActions.map((a) => (
              <button
                key={a.id}
                onClick={a.run}
                className="w-full text-left p-3 rounded-2xl bg-slate-950/40 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800/80 group-hover:scale-105 transition-transform">
                    {a.icon}
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-white transition-colors">
                      {a.label}
                    </div>
                    <div className="text-[11px] text-slate-400">{a.sub}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </button>
            ))}
          </div>

          {cleanQ !== '' &&
            filteredOrders.length === 0 &&
            filteredCustomers.length === 0 &&
            quickActions.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                Tidak ada hasil yang cocok dengan &ldquo;<span className="text-white font-semibold">{query}</span>&rdquo;.
              </div>
            )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>LAUNDRYHUB Instant Command Hub</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 font-mono text-[10px]">
            <span>↑↓ Pilih</span>
            <span>↵ Buka</span>
            <span>ESC Tutup</span>
          </div>
        </div>
      </div>
    </div>
  );
};
