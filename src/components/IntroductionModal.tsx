import React, { useState, useEffect } from 'react';
import {
  WashingMachine,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  Zap,
  Printer,
  Coins,
  Gift,
  QrCode,
  Users,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import confetti from 'canvas-confetti';

interface IntroductionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntroductionModal: React.FC<IntroductionModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentRole, topupCoins } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const handleFinish = (targetRole?: 'owner' | 'kasir' | 'pelanggan') => {
    localStorage.setItem('lh_intro_seen', 'true');
    // Ensure user has trial bonus if not yet redeemed
    const redeemed: string[] = JSON.parse(localStorage.getItem('lh_redeemed_codes') || '[]');
    if (!redeemed.includes('INTRO50')) {
      topupCoins(50);
      redeemed.push('INTRO50');
      localStorage.setItem('lh_redeemed_codes', JSON.stringify(redeemed));
    }

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if canvas-confetti unavailable
    }

    if (targetRole) {
      setCurrentRole(targetRole);
    }
    onClose();
  };

  const slides = [
    {
      badge: 'Selamat Datang di LAUNDRYHUB',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      title: 'Aplikasi Kasir Laundry #1 Bebas Biaya Bulanan',
      subtitle: 'Dirancang khusus untuk pengusaha laundry kiloan, satuan, self-service, dan jaringan dropship di seluruh Indonesia.',
      icon: <WashingMachine className="w-10 h-10 text-emerald-400 animate-spin-slow" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <div className="text-2xl font-black text-emerald-400">Rp 0</div>
              <div className="text-xs font-bold text-white mt-1">Tanpa Biaya Bulanan</div>
              <div className="text-[10px] text-slate-400 mt-1">Tidak perlu langganan mahal Rp 300rb/bulan</div>
            </div>
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-center">
              <div className="text-2xl font-black text-cyan-400">Rp 25</div>
              <div className="text-xs font-bold text-white mt-1">Cuma Per Nota</div>
              <div className="text-[10px] text-slate-400 mt-1">Hanya bayar saat nota transaksi dibuat</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-center">
              <div className="text-2xl font-black text-amber-400">100%</div>
              <div className="text-xs font-bold text-white mt-1">Uang Langsung Masuk</div>
              <div className="text-[10px] text-slate-400 mt-1">Ke QRIS / rekening pribadi tanpa potongan</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-white">Bonus Pengguna Baru: </span>
              <span className="text-slate-300">
                Kamu langsung mendapatkan <strong className="text-emerald-400">50 Nota Transaksi Gratis</strong> untuk mencoba semua fitur tanpa bayar sepeserpun!
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: 'Kasir Super Cepat & Hardware',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      title: 'Input Nota Cepat, Cetak Bluetooth & Nota WA',
      subtitle: 'Semua alat operasional kasir tersedia lengkap di smartphone, tablet, maupun laptop Anda.',
      icon: <Zap className="w-10 h-10 text-cyan-400" />,
      content: (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 flex-shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Printer Thermal Bluetooth</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cetak struk kasir nirkabel ke printer thermal 58mm & 80mm ESC/POS dalam 1 klik.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">QRIS Dinamis & Statis</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scan pembayaran QRIS langsung di layar atau nota. Dukungan QRIS outlet sendiri.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Nota Digital WhatsApp</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kirim nota dan link lacak status cucian otomatis langsung ke WhatsApp pelanggan.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Mode Offline & Cloud Sync</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Internet mati? Tetap bisa transaksi kasir, data otomatis sinkron saat online kembali.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: 'Ekosistem Lengkap',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      title: 'Pantau Mesin IoT, Produksi, & Jaringan Agen',
      subtitle: 'Satu aplikasi untuk seluruh tim: Owner, Kasir, Bagian Cuci, Kurir Jemput, hingga Mitra Dropship.',
      icon: <Users className="w-10 h-10 text-purple-400" />,
      content: (
        <div className="space-y-3.5">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 flex-shrink-0">
              <WashingMachine className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Integrasi Kontrol Mesin IoT (Anti-Kecurangan)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mesin cuci/dryer hanya dapat beroperasi dengan timer otomatis jika nota kasir telah dicetak. Mencegah kasir atau karyawan mencuci diam-diam tanpa izin!
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Sistem Keagenan Dropship Tanpa Modal Mesin</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Buka cabang baru bermitra dengan warung atau tetangga. Agen cukup terima titipan pakaian, komisi dan bagi hasil otomatis tercatat transparan.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      badge: 'Siap Memulai?',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      title: 'Pilih Mode Masuk Aplikasi',
      subtitle: 'Kamu bisa beralih peran kapan saja dengan 1-klik melalui tombol navigasi di bagian atas.',
      icon: <Sparkles className="w-10 h-10 text-amber-400 animate-bounce" />,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleFinish('kasir')}
              className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-left transition-all hover:scale-[1.02] active:scale-95 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                  REKOMENDASI
                </span>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-white mt-2">Masuk Sebagai Kasir (POS)</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Langsung coba input pesanan cucian kiloan/satuan, cetak struk, dan buat nota baru.
              </p>
            </button>

            <button
              onClick={() => handleFinish('owner')}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/40 hover:border-amber-400 text-left transition-all hover:scale-[1.02] active:scale-95 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
                  PEMILIK USAHA
                </span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h4 className="text-sm font-bold text-white mt-2">Masuk Dashboard Owner</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Pantau grafik omzet, rekap kas harian, manajemen karyawan, cabang, dan stok deterjen.
              </p>
            </button>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => handleFinish()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm hover:opacity-95 shadow-glow-emerald transition-all active:scale-95"
            >
              🚀 Mulai Jelajahi Aplikasi Sekarang
            </button>
          </div>
        </div>
      ),
    },
  ];

  const current = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Top Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950">
              <WashingMachine className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-white tracking-wide">
              LAUNDRYHUB <span className="text-emerald-400">INTRO</span>
            </span>
          </div>

          <button
            onClick={() => handleFinish()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
          >
            <span>Lewati</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Slide Indicator & Badge */}
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${current.badgeColor}`}>
              {current.badge}
            </span>
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentSlide ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Slide Title & Icon */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex-shrink-0">
              {current.icon}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
                {current.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {current.subtitle}
              </p>
            </div>
          </div>

          {/* Slide Dynamic Content */}
          <div className="py-2">
            {current.content}
          </div>
        </div>

        {/* Bottom Navigation Controls */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              currentSlide === 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sebelumnya</span>
          </button>

          {currentSlide < slides.length - 1 ? (
            <button
              onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all active:scale-95"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => handleFinish()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs shadow-glow-emerald transition-all active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selesai & Masuk</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
